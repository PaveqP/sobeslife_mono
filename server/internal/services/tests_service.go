package services

import (
	"math"
	"math/rand"
	"sobeslife-services/internal/repository"
	"sobeslife-services/internal/utils"
	"time"

	"github.com/sirupsen/logrus"
)

type TestsService struct {
	r *repository.Repository
}

func newTestsService(r *repository.Repository) *TestsService {
	return &TestsService{r}
}

func (ts *TestsService) Generate(testParameters utils.CreateTestRequest) (utils.TestResponse, error) {
	findQuestions, err := ts.r.Questions.GetQuestionsByFilters(utils.QuestionFilters{
		Profession: testParameters.Profession,
		Module:     testParameters.Chapter,
		Technology: testParameters.Technology,
	})
	if err != nil {
		logrus.Errorf("Fetch questions by test params failed: %s", err)
		return utils.TestResponse{}, err
	}
	if len(findQuestions) == 0 {
		logrus.Errorf("No questions fot test with your params: %s", err)
		return utils.TestResponse{}, err
	}

	questionsIds, questionsInTests := ts.GetRandomQuestions(findQuestions)

	result, err := ts.r.Tests.Generate(testParameters, questionsIds)
	if err != nil {
		logrus.Errorf("Generate test failed: %s", err)
		return utils.TestResponse{}, err
	}

	return utils.TestResponse{
		ID:             result.ID,
		Title:          result.Title,
		Profession:     testParameters.Profession,
		Chapter:        testParameters.Chapter,
		Technology:     testParameters.Technology,
		ExpertiseLevel: result.ExpertiseLevel,
		Questions:      questionsInTests,
	}, err
}

func (ts *TestsService) GetRandomQuestions(questions []utils.QuestionResponse) ([]string, []utils.QuestionResponse) {
	if len(questions) == 0 {
		return []string{}, []utils.QuestionResponse{}
	}

	countQuestions := math.Ceil(float64(len(questions)) * 0.2)
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))

	shuffled := make([]utils.QuestionResponse, len(questions))
	copy(shuffled, questions)

	rng.Shuffle(len(shuffled), func(i, j int) {
		shuffled[i], shuffled[j] = shuffled[j], shuffled[i]
	})

	result := make([]string, 0, int(countQuestions))
	returningQuestions := make([]utils.QuestionResponse, 0, int(countQuestions))

	for i := 0; i <= int(countQuestions); i++ {
		result = append(result, shuffled[i].ID)
		returningQuestions = append(returningQuestions, shuffled[i])
	}

	return result, returningQuestions
}
