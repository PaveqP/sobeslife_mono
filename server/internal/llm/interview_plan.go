package llm

import (
	"fmt"
	"sobeslife-services/internal/utils"
	"strings"
)

const (
	interviewPlanStepTypeTheory          = "theory"
	interviewPlanStepTypePracticalCoding = "practical_coding"
)

func validateInterviewPlan(plan *utils.InterviewPlan, requestedDuration int) error {
	if plan == nil {
		return fmt.Errorf("structured output does not contain interview plan")
	}
	if strings.TrimSpace(plan.Overview) == "" {
		return fmt.Errorf("structured output does not contain plan overview")
	}
	if len(plan.Steps) == 0 {
		return fmt.Errorf("structured output does not contain plan steps")
	}

	codingTasks := 0
	totalMinutes := 0

	for i, step := range plan.Steps {
		if strings.TrimSpace(step.MainQuestion) == "" {
			return fmt.Errorf("structured output contains empty main question for step %d", i+1)
		}

		step = normalizeInterviewPlanStep(step, i+1)
		if step.Type == interviewPlanStepTypePracticalCoding {
			codingTasks++
		}

		totalMinutes += step.EstimatedMinutes
		plan.Steps[i] = step
	}

	if codingTasks > 2 {
		return fmt.Errorf("structured output contains too many coding tasks")
	}

	plan.PlannedCodingTasks = codingTasks
	if plan.EstimatedTotalMinutes <= 0 || plan.EstimatedTotalMinutes < totalMinutes {
		plan.EstimatedTotalMinutes = totalMinutes
	}
	if requestedDuration > 0 {
		normalizeInterviewPlanToDuration(plan, requestedDuration)
	}

	return nil
}

func normalizeInterviewPlanStep(step utils.InterviewPlanStep, fallbackStepNumber int) utils.InterviewPlanStep {
	if step.MaxFollowUpQuestions < 0 {
		step.MaxFollowUpQuestions = 0
	}
	if step.MaxFollowUpQuestions > 2 {
		step.MaxFollowUpQuestions = 2
	}
	if len(step.FollowUpTopics) > 2 {
		step.FollowUpTopics = step.FollowUpTopics[:2]
	}
	if step.EstimatedMinutes <= 0 {
		step.EstimatedMinutes = 1
	}
	if step.StepNumber <= 0 {
		step.StepNumber = fallbackStepNumber
	}

	return step
}

func normalizeInterviewPlanToDuration(plan *utils.InterviewPlan, requestedDuration int) {
	if plan == nil || requestedDuration <= 0 || len(plan.Steps) == 0 {
		return
	}

	remainingMinutes := requestedDuration
	maxCodingTasks := allowedCodingTasksForDuration(requestedDuration)
	normalizedSteps := make([]utils.InterviewPlanStep, 0, len(plan.Steps))
	codingTasks := 0

	for _, step := range plan.Steps {
		if remainingMinutes <= 0 {
			break
		}
		if step.Type == interviewPlanStepTypePracticalCoding && codingTasks >= maxCodingTasks {
			continue
		}
		if len(normalizedSteps) > 0 && remainingMinutes < 2 {
			break
		}

		step.EstimatedMinutes = minPositive(step.EstimatedMinutes, remainingMinutes)
		normalizedSteps = append(normalizedSteps, step)
		remainingMinutes -= step.EstimatedMinutes
		if step.Type == interviewPlanStepTypePracticalCoding {
			codingTasks++
		}
	}

	if len(normalizedSteps) == 0 {
		fallback := plan.Steps[0]
		fallback.EstimatedMinutes = minPositive(fallback.EstimatedMinutes, requestedDuration)
		normalizedSteps = append(normalizedSteps, fallback)
		if fallback.Type == interviewPlanStepTypePracticalCoding {
			codingTasks = 1
		}
	}

	totalMinutes := 0
	for i := range normalizedSteps {
		normalizedSteps[i].StepNumber = i + 1
		totalMinutes += normalizedSteps[i].EstimatedMinutes
	}

	plan.Steps = normalizedSteps
	plan.PlannedCodingTasks = codingTasks
	plan.EstimatedTotalMinutes = totalMinutes
}

func allowedCodingTasksForDuration(duration int) int {
	switch {
	case duration <= 5:
		return 0
	case duration <= 20:
		return 1
	default:
		return 2
	}
}

func minPositive(value int, limit int) int {
	if value <= 0 {
		value = 1
	}
	if limit > 0 && value > limit {
		return limit
	}
	return value
}
