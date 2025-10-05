package services

import (
	"sobeslife-services/internal/repository"
	"sobeslife-services/internal/utils"
)

type QuestionService struct {
	r *repository.Repository
}

func newQuestionService(r *repository.Repository) *QuestionService {
	return &QuestionService{r}
}

func (qs *QuestionService) GetAllQuestions() ([]utils.Question, error) {
	result, err := qs.r.GetAllQuestions()
	if err != nil {
		return nil, err
	}
	return result, nil
}

func (qs *QuestionService) GetQuestionsByProfession(professionId string) ([]utils.Question, error) {
	result, err := qs.r.GetQuestionsByProfession(professionId)
	if err != nil {
		return nil, err
	}
	return result, nil
}
func (qs *QuestionService) GetQuestionsByModule(moduleId string) ([]utils.Question, error) {
	result, err := qs.r.GetQuestionsByModule(moduleId)
	if err != nil {
		return nil, err
	}
	return result, nil
}
func (qs *QuestionService) GetQuestionsByTechnology(technologyId string) ([]utils.Question, error) {
	result, err := qs.r.GetQuestionsByTechnology(technologyId)
	if err != nil {
		return nil, err
	}
	return result, nil
}
func (qs *QuestionService) GetQuestionsForTest(professionId string, moduleId string, technologyId string) ([]utils.Question, error) {
	result, err := qs.r.GetQuestionsForTest(professionId, moduleId, technologyId)
	if err != nil {
		return nil, err
	}
	return result, nil
}
