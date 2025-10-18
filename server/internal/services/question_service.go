package services

import (
	"sobeslife-services/internal/repository"
	"sobeslife-services/internal/utils"
	"strings"

	"github.com/sirupsen/logrus"
)

type QuestionService struct {
	r *repository.Repository
}

func newQuestionService(r *repository.Repository) *QuestionService {
	return &QuestionService{r}
}

func (qs *QuestionService) GetQuestionsByFilters(filters utils.QuestionFilters) ([]utils.QuestionResponse, error) {
	result, err := qs.r.GetQuestionsByFilters(filters)
	if err != nil {
		logrus.Error("Service error: ", err)
		return nil, err
	}
	return result, nil
}

func (qs *QuestionService) CheckAnswer(question_id string, answer string) (bool, error) {
	correctAnswer, err := qs.r.Questions.GetCorrectAnswer(question_id)
	if err != nil {
		return false, err
	}

	normalizedCorrectAnswer := strings.TrimSpace(strings.ToLower(correctAnswer))
	normalizedUsersAnswer := strings.TrimSpace(strings.ToLower(answer))

	return normalizedCorrectAnswer == normalizedUsersAnswer, nil
}
