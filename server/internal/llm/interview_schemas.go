package llm

import "sobeslife-services/internal/utils"

const (
	interviewPlanSchemaName    = "interview_plan_payload"
	interviewNextSchemaName    = "interview_next_payload"
	interviewSummarySchemaName = "interview_summary_payload"

	interviewPlanMaxCompletionTokens = 1400
	interviewNextMaxCompletionTokens = 300
)

var interviewSummaryMaxCompletionTokens = []int{1200, 2200}

func buildInterviewPlanSchema() map[string]interface{} {
	return map[string]interface{}{
		"type": "object",
		"properties": map[string]interface{}{
			"overview":                map[string]interface{}{"type": "string"},
			"estimated_total_minutes": map[string]interface{}{"type": "integer", "minimum": 1},
			"planned_coding_tasks":    map[string]interface{}{"type": "integer", "minimum": 0, "maximum": 2},
			"steps": map[string]interface{}{
				"type":     "array",
				"minItems": 1,
				"items":    buildInterviewPlanStepSchema(),
			},
		},
		"required":             []string{"overview", "estimated_total_minutes", "planned_coding_tasks", "steps"},
		"additionalProperties": false,
	}
}

func buildInterviewPlanStepSchema() map[string]interface{} {
	return map[string]interface{}{
		"type": "object",
		"properties": map[string]interface{}{
			"step_number":             map[string]interface{}{"type": "integer", "minimum": 1},
			"type":                    map[string]interface{}{"type": "string", "enum": []string{interviewPlanStepTypeTheory, interviewPlanStepTypePracticalCoding}},
			"title":                   map[string]interface{}{"type": "string"},
			"topic":                   map[string]interface{}{"type": "string"},
			"goal":                    map[string]interface{}{"type": "string"},
			"difficulty":              map[string]interface{}{"type": "string", "enum": []string{"easy", "medium", "hard"}},
			"estimated_minutes":       map[string]interface{}{"type": "integer", "minimum": 1},
			"main_question":           map[string]interface{}{"type": "string"},
			"follow_up_topics":        map[string]interface{}{"type": "array", "maxItems": 2, "items": map[string]interface{}{"type": "string"}},
			"max_follow_up_questions": map[string]interface{}{"type": "integer", "minimum": 0, "maximum": 2},
		},
		"required": []string{
			"step_number",
			"type",
			"title",
			"topic",
			"goal",
			"difficulty",
			"estimated_minutes",
			"main_question",
			"follow_up_topics",
			"max_follow_up_questions",
		},
		"additionalProperties": false,
	}
}

func buildInterviewNextQuestionSchema() map[string]interface{} {
	return map[string]interface{}{
		"type": "object",
		"properties": map[string]interface{}{
			"action": map[string]interface{}{
				"type": "string",
				"enum": []string{utils.InterviewNextActionAskQuestion, utils.InterviewNextActionCompleteInterview},
			},
			"next_question":    map[string]interface{}{"type": "string"},
			"plan_step_number": map[string]interface{}{"type": "integer", "minimum": 0},
		},
		"required":             []string{"action", "next_question", "plan_step_number"},
		"additionalProperties": false,
	}
}

func buildInterviewSummarySchema() map[string]interface{} {
	return map[string]interface{}{
		"type": "object",
		"properties": map[string]interface{}{
			"verdict_passed":  map[string]interface{}{"type": "boolean"},
			"summary":         map[string]interface{}{"type": "string"},
			"strengths":       map[string]interface{}{"type": "array", "items": map[string]interface{}{"type": "string"}},
			"weaknesses":      map[string]interface{}{"type": "array", "items": map[string]interface{}{"type": "string"}},
			"recommendations": map[string]interface{}{"type": "array", "items": map[string]interface{}{"type": "string"}},
		},
		"required": []string{
			"verdict_passed",
			"summary",
			"strengths",
			"weaknesses",
			"recommendations",
		},
		"additionalProperties": false,
	}
}
