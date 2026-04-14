package llm

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"sobeslife-services/internal/utils"
	"strings"
	"time"
)

const (
	polzaProviderName   = "polza.ai"
	interviewPromptName = "interview_plan_v2"
)

var ErrStructuredOutputTruncated = errors.New("structured output was truncated")

type InterviewClient interface {
	GeneratePlan(ctx context.Context, promptContext utils.InterviewPromptContext) (*utils.InterviewPlan, error)
	GenerateNextQuestion(ctx context.Context, promptContext utils.InterviewPromptContext, transcript []utils.InterviewTranscriptItem) (*utils.InterviewNextQuestionLLMOutput, error)
	SummarizeInterview(ctx context.Context, promptContext utils.InterviewPromptContext, transcript []utils.InterviewTranscriptItem) (*utils.InterviewSummaryPayload, error)
	ModelName() string
	ProviderName() string
	PromptVersion() string
}

type PolzaInterviewClient struct {
	httpClient *http.Client
	baseURL    string
	apiKey     string
	model      string
}

func NewPolzaInterviewClient(cfg utils.LLMConfig) *PolzaInterviewClient {
	timeout := time.Duration(cfg.TimeoutSeconds) * time.Second
	if timeout <= 0 {
		timeout = 30 * time.Second
	}

	return &PolzaInterviewClient{
		httpClient: &http.Client{Timeout: timeout},
		baseURL:    strings.TrimRight(cfg.BaseURL, "/"),
		apiKey:     utils.GetEnv("POLZA_AI_API_KEY"),
		model:      cfg.Model,
	}
}

func (c *PolzaInterviewClient) ProviderName() string {
	return polzaProviderName
}

func (c *PolzaInterviewClient) ModelName() string {
	return c.model
}

func (c *PolzaInterviewClient) PromptVersion() string {
	return interviewPromptName
}

func (c *PolzaInterviewClient) GeneratePlan(ctx context.Context, promptContext utils.InterviewPromptContext) (*utils.InterviewPlan, error) {
	content, _, err := c.createStructuredChatCompletion(ctx, []map[string]string{
		{
			"role":    "system",
			"content": buildInterviewPlanSystemPrompt(),
		},
		{
			"role":    "user",
			"content": buildInterviewPlanUserPrompt(promptContext),
		},
	}, interviewPlanSchemaName, buildInterviewPlanSchema(), promptContext.UserID, interviewPlanMaxCompletionTokens)
	if err != nil {
		return nil, err
	}

	var output utils.InterviewPlan
	if err := json.Unmarshal([]byte(content), &output); err != nil {
		return nil, fmt.Errorf("failed to decode structured output: %w", err)
	}
	if err := validateInterviewPlan(&output, promptContext.DurationMinutes); err != nil {
		return nil, err
	}

	return &output, nil
}

func (c *PolzaInterviewClient) GenerateNextQuestion(ctx context.Context, promptContext utils.InterviewPromptContext, transcript []utils.InterviewTranscriptItem) (*utils.InterviewNextQuestionLLMOutput, error) {
	content, _, err := c.createStructuredChatCompletion(ctx, []map[string]string{
		{
			"role":    "system",
			"content": buildInterviewNextSystemPrompt(),
		},
		{
			"role":    "user",
			"content": buildInterviewNextUserPrompt(promptContext, transcript),
		},
	}, interviewNextSchemaName, buildInterviewNextQuestionSchema(), promptContext.UserID, interviewNextMaxCompletionTokens)
	if err != nil {
		return nil, err
	}

	var output utils.InterviewNextQuestionLLMOutput
	if err := json.Unmarshal([]byte(content), &output); err != nil {
		return nil, fmt.Errorf("failed to decode structured output: %w", err)
	}
	switch output.Action {
	case utils.InterviewNextActionAskQuestion:
		if strings.TrimSpace(output.NextQuestion) == "" {
			return nil, fmt.Errorf("structured output does not contain next question")
		}
	case utils.InterviewNextActionCompleteInterview:
		output.NextQuestion = ""
	default:
		return nil, fmt.Errorf("structured output contains unsupported action: %s", output.Action)
	}

	return &output, nil
}

func (c *PolzaInterviewClient) SummarizeInterview(ctx context.Context, promptContext utils.InterviewPromptContext, transcript []utils.InterviewTranscriptItem) (*utils.InterviewSummaryPayload, error) {
	var lastErr error

	for _, maxTokens := range interviewSummaryMaxCompletionTokens {
		content, finishReason, err := c.createStructuredChatCompletion(ctx, []map[string]string{
			{
				"role":    "system",
				"content": buildInterviewSummarySystemPrompt(),
			},
			{
				"role":    "user",
				"content": buildInterviewSummaryUserPrompt(promptContext, transcript),
			},
		}, interviewSummarySchemaName, buildInterviewSummarySchema(), promptContext.UserID, maxTokens)
		if err != nil {
			lastErr = err
			if errors.Is(err, ErrStructuredOutputTruncated) {
				continue
			}
			return nil, err
		}

		var output utils.InterviewSummaryPayload
		if err := json.Unmarshal([]byte(content), &output); err != nil {
			lastErr = fmt.Errorf("failed to decode structured output: %w", err)
			if finishReason == "length" || errors.Is(err, io.ErrUnexpectedEOF) || strings.Contains(err.Error(), "unexpected end of JSON input") {
				continue
			}
			return nil, lastErr
		}
		if strings.TrimSpace(output.Summary) == "" {
			lastErr = fmt.Errorf("structured output does not contain summary")
			continue
		}

		return &output, nil
	}

	if lastErr != nil {
		return nil, lastErr
	}

	return nil, fmt.Errorf("failed to generate interview summary")
}

func (c *PolzaInterviewClient) createStructuredChatCompletion(ctx context.Context, messages []map[string]string, schemaName string, schema map[string]interface{}, userID int, maxCompletionTokens int) (string, string, error) {
	if c.apiKey == "" {
		return "", "", fmt.Errorf("POLZA_AI_API_KEY is not set")
	}
	if c.baseURL == "" {
		return "", "", fmt.Errorf("LLM base URL is not configured")
	}
	if c.model == "" {
		return "", "", fmt.Errorf("LLM model is not configured")
	}

	requestPayload := map[string]interface{}{
		"model":    c.model,
		"messages": messages,
		"response_format": map[string]interface{}{
			"type": "json_schema",
			"json_schema": map[string]interface{}{
				"name":   schemaName,
				"strict": true,
				"schema": schema,
			},
		},
		"temperature":           0.2,
		"max_completion_tokens": maxCompletionTokens,
		"user":                  fmt.Sprintf("user-%d", userID),
	}

	body, err := json.Marshal(requestPayload)
	if err != nil {
		return "", "", err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+"/chat/completions", bytes.NewReader(body))
	if err != nil {
		return "", "", err
	}

	req.Header.Set("Authorization", "Bearer "+c.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return "", "", err
	}
	defer resp.Body.Close()

	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", "", err
	}

	if resp.StatusCode >= http.StatusBadRequest {
		return "", "", fmt.Errorf("polza api request failed: status=%d body=%s", resp.StatusCode, string(responseBody))
	}

	var completion polzaChatCompletionResponse
	if err := json.Unmarshal(responseBody, &completion); err != nil {
		return "", "", err
	}

	if len(completion.Choices) == 0 {
		return "", "", fmt.Errorf("polza api returned no choices")
	}

	content := normalizeStructuredContent(completion.Choices[0].Message.Content)
	if content == "" {
		return "", "", fmt.Errorf("polza api returned empty structured output")
	}

	if completion.Choices[0].FinishReason == "length" {
		return content, completion.Choices[0].FinishReason, ErrStructuredOutputTruncated
	}

	return content, completion.Choices[0].FinishReason, nil
}

type polzaChatCompletionResponse struct {
	Choices []polzaChatCompletionChoice `json:"choices"`
}

type polzaChatCompletionChoice struct {
	Message      polzaChatCompletionMessage `json:"message"`
	FinishReason string                     `json:"finish_reason"`
}

type polzaChatCompletionMessage struct {
	Content string `json:"content"`
}

func normalizeStructuredContent(content string) string {
	trimmed := strings.TrimSpace(content)
	trimmed = strings.TrimPrefix(trimmed, "```json")
	trimmed = strings.TrimPrefix(trimmed, "```")
	trimmed = strings.TrimSuffix(trimmed, "```")
	return strings.TrimSpace(trimmed)
}
