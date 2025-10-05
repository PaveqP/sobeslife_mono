package services

import (
	"sobeslife-services/internal/repository"
	"sobeslife-services/internal/utils"

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
		logrus.Error("Service error", err)
		return nil, err
	}
	// if len(result) == 0 {
	// 	result = []utils.QuestionResponse{}
	// }
	return result, nil
}
