package llm

import (
	"encoding/json"
	"fmt"
	"sobeslife-services/internal/utils"
	"strings"
)

const (
	interviewPlanSystemPrompt    = "You are a senior technical interviewer. Build a structured interview plan for the requested profession, level, and specialization. The plan must fit the requested duration, cover multiple relevant topics for the level, and progress from simpler questions to harder ones. Include no more than two practical coding tasks, and only when their difficulty matches the candidate level. Every main question must allow at most two follow-up questions. Return only valid JSON matching the schema. Conduct the interview strictly in Russian."
	interviewNextSystemPrompt    = "You are a senior technical interviewer conducting a timed mock interview using a predefined plan. Follow the plan strictly, stay within the planned topics and difficulty curve, and ask exactly one next technical question in Russian. If the plan is already completed or there is not enough room to start a new planned topic responsibly, return action complete_interview, set next_question to an empty string, and set plan_step_number to 0. Never ask more than one question at a time. Never exceed two follow-up questions for any main question. Never introduce more coding tasks than the plan allows."
	interviewSummarySystemPrompt = "You are a senior technical interviewer. Analyze the full mock interview transcript and the saved interview plan, then return a hiring verdict. Respond only using the provided JSON schema. The verdict must reflect whether the candidate would pass this interview for the requested level, profession, and specialization. Give an answer strictly in Russian. Keep the summary concise. Return at most 3 strengths, at most 3 weaknesses, and at most 3 recommendations."

	interviewPlanPromptIntro    = "Build an interview plan."
	interviewNextPromptIntro    = "Continue the interview by following the saved plan."
	interviewSummaryPromptIntro = "Summarize the completed interview."

	interviewPromptProfessionLabel         = "Selected profession"
	interviewPromptLevelLabel              = "Selected level"
	interviewPromptDurationLabel           = "Interview duration in minutes"
	interviewPromptSpecializationLabel     = "Candidate specialization"
	interviewPromptProfileSnapshotLabel    = "Candidate profile snapshot JSON"
	interviewPromptLevelGuidanceLabel      = "Level-specific guidance"
	interviewPromptDurationGuidanceLabel   = "Duration-specific guidance"
	interviewPromptInterviewPlanLabel      = "Interview plan JSON"
	interviewPromptTranscriptLabel         = "Transcript JSON"
	interviewPromptRequirementsHeader      = "Requirements:"
	interviewNextPromptResponseInstruction = "Return action ask_question when you should ask the next planned question or a permitted follow-up. Return action complete_interview when the plan is exhausted or it is inappropriate to continue with a new planned question. For complete_interview, return next_question as an empty string and plan_step_number as 0."

	interviewPlanRequirementCoverTopics    = "Cover different relevant topics for this profession and level."
	interviewPlanRequirementProgression    = "Questions must progress from simple to complex."
	interviewPlanRequirementCodingTasks    = "Include at most two coding tasks total."
	interviewPlanRequirementLevelFit       = "Coding tasks must match the candidate level by complexity."
	interviewPlanRequirementFollowUps      = "For each main question, allow at most two follow-up questions."
	interviewPlanRequirementSingleQuestion = "Each step must contain exactly one main question that can be asked verbatim during the interview."

	interviewUnknownSpecialization = "not provided"
)

func buildInterviewPlanSystemPrompt() string {
	return interviewPlanSystemPrompt
}

func buildInterviewNextSystemPrompt() string {
	return interviewNextSystemPrompt
}

func buildInterviewSummarySystemPrompt() string {
	return interviewSummarySystemPrompt
}

func buildInterviewPlanUserPrompt(promptContext utils.InterviewPromptContext) string {
	sections := append([]string{interviewPlanPromptIntro}, buildBaseInterviewPromptContext(promptContext)...)
	sections = append(sections, interviewPromptRequirementsHeader)
	sections = append(sections, buildNumberedPromptList(
		interviewPlanRequirementCoverTopics,
		interviewPlanRequirementProgression,
		interviewPlanRequirementCodingTasks,
		interviewPlanRequirementLevelFit,
		interviewPlanRequirementFollowUps,
		interviewPlanRequirementSingleQuestion,
	)...)

	return joinPromptSections(sections...)
}

func buildInterviewNextUserPrompt(promptContext utils.InterviewPromptContext, transcript []utils.InterviewTranscriptItem) string {
	transcriptJSON, _ := json.Marshal(transcript)

	sections := append([]string{interviewNextPromptIntro}, buildBaseInterviewPromptContext(promptContext)...)
	sections = append(sections,
		buildPromptLine(interviewPromptInterviewPlanLabel, string(promptContext.InterviewPlan)),
		buildPromptLine(interviewPromptTranscriptLabel, string(transcriptJSON)),
		interviewNextPromptResponseInstruction,
	)

	return joinPromptSections(sections...)
}

func buildInterviewSummaryUserPrompt(promptContext utils.InterviewPromptContext, transcript []utils.InterviewTranscriptItem) string {
	transcriptJSON, _ := json.Marshal(transcript)

	return joinPromptSections(
		interviewSummaryPromptIntro,
		buildPromptLine(interviewPromptProfessionLabel, promptContext.Profession),
		buildPromptLine(interviewPromptLevelLabel, string(promptContext.InterviewLevel)),
		buildPromptLine(interviewPromptDurationLabel, fmt.Sprintf("%d", promptContext.DurationMinutes)),
		buildPromptLine(interviewPromptSpecializationLabel, formatCandidateSpecialization(promptContext.CandidateSpecialization)),
		buildPromptLine(interviewPromptProfileSnapshotLabel, string(promptContext.ProfileSnapshot)),
		buildPromptLine(interviewPromptInterviewPlanLabel, string(promptContext.InterviewPlan)),
		buildPromptLine(interviewPromptTranscriptLabel, string(transcriptJSON)),
	)
}

func buildBaseInterviewPromptContext(promptContext utils.InterviewPromptContext) []string {
	return []string{
		buildPromptLine(interviewPromptProfessionLabel, promptContext.Profession),
		buildPromptLine(interviewPromptLevelLabel, string(promptContext.InterviewLevel)),
		buildPromptLine(interviewPromptDurationLabel, fmt.Sprintf("%d", promptContext.DurationMinutes)),
		buildPromptLine(interviewPromptSpecializationLabel, formatCandidateSpecialization(promptContext.CandidateSpecialization)),
		buildPromptLine(interviewPromptProfileSnapshotLabel, string(promptContext.ProfileSnapshot)),
		buildPromptLine(interviewPromptLevelGuidanceLabel, buildLevelSpecificInterviewGuidance(promptContext.InterviewLevel)),
		buildPromptLine(interviewPromptDurationGuidanceLabel, buildDurationSpecificInterviewGuidance(promptContext.DurationMinutes)),
	}
}

func joinPromptSections(sections ...string) string {
	return strings.Join(sections, "\n")
}

func buildNumberedPromptList(items ...string) []string {
	lines := make([]string, 0, len(items))
	for i, item := range items {
		lines = append(lines, fmt.Sprintf("%d. %s", i+1, item))
	}
	return lines
}

func buildPromptLine(label string, value string) string {
	return fmt.Sprintf("%s: %s", label, value)
}

func formatCandidateSpecialization(candidateSpecialization *string) string {
	if candidateSpecialization == nil || strings.TrimSpace(*candidateSpecialization) == "" {
		return interviewUnknownSpecialization
	}

	return strings.TrimSpace(*candidateSpecialization)
}

func buildLevelSpecificInterviewGuidance(level utils.ExpertiseLevel) string {
	switch level {
	case utils.ExpertiseJunior:
		return "Focus on fundamentals, common tooling, basic debugging, and small coding tasks with limited scope. Avoid system design depth expected from senior engineers."
	case utils.ExpertiseMiddle:
		return "Balance fundamentals with practical trade-offs, production experience, debugging, testing, and medium-complexity coding tasks. Expect independent reasoning, but avoid senior-only architecture depth as the baseline."
	case utils.ExpertiseSenior:
		return "Cover advanced trade-offs, architecture, leadership in technical decisions, performance, reliability, and complex coding or design tasks appropriate for senior engineers."
	default:
		return "Match the complexity of topics and coding tasks to the requested level."
	}
}

func buildDurationSpecificInterviewGuidance(duration int) string {
	switch {
	case duration <= 5:
		return "This is a very short interview. Plan only one concise topic block, avoid coding tasks, and use no more than one short follow-up if needed."
	case duration <= 10:
		return "This is a short interview. Keep the plan compact, cover only the highest-signal topics, and avoid more than one very small coding task."
	case duration <= 20:
		return "Use a compact plan with a few focused topics. Include at most one coding task unless there is a very strong reason."
	default:
		return "Distribute time across multiple topics according to the requested duration."
	}
}
