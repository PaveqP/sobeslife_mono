package services

import (
	"math"
	"math/rand"
	"sobeslife-services/internal/repository"
	"sobeslife-services/internal/utils"
	"time"

	"github.com/sirupsen/logrus"
)

const StandardSQLTimeFormat string = "2006-01-02 15:04:05"

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

func (ts *TestsService) List(user_id string, filters utils.TestListFilters) ([]utils.TestListItem, error) {
	return ts.r.Tests.List(user_id, filters)
}

func (ts *TestsService) GetByID(user_id string, test_id string) (*utils.TestDetailsResponse, error) {
	return ts.r.Tests.GetByID(user_id, test_id)
}

func (ts *TestsService) GetStatistics(user_id string) (*utils.UserTestsStatisticsResponse, error) {
	return ts.r.Tests.GetStatistics(user_id)
}

func (ts *TestsService) GetRandomQuestions(questions []utils.QuestionResponse) ([]string, []utils.QuestionResponse) {
	if len(questions) == 0 {
		return []string{}, []utils.QuestionResponse{}
	}

	countQuestions := int(math.Ceil(float64(len(questions)) * 0.2))
	if countQuestions < 1 {
		countQuestions = 1
	}
	if countQuestions > len(questions) {
		countQuestions = len(questions)
	}

	rng := rand.New(rand.NewSource(time.Now().UnixNano()))

	shuffled := make([]utils.QuestionResponse, len(questions))
	copy(shuffled, questions)

	rng.Shuffle(len(shuffled), func(i, j int) {
		shuffled[i], shuffled[j] = shuffled[j], shuffled[i]
	})

	result := make([]string, 0, countQuestions)
	returningQuestions := make([]utils.QuestionResponse, 0, countQuestions)

	for i := 0; i < countQuestions; i++ {
		result = append(result, shuffled[i].ID)
		returningQuestions = append(returningQuestions, shuffled[i])
	}

	return result, returningQuestions
}

func (ts *TestsService) SetUsersAnswer(test_id string, question_id string, answer string, isCorrect bool) error {
	err := ts.r.Tests.SetUsersAnswer(test_id, question_id, answer, isCorrect)
	if err != nil {
		return err
	}
	return nil
}

func (ts *TestsService) Start(user_id string, test_id string) error {
	currentTime := time.Now().Format(StandardSQLTimeFormat)
	var testStatus utils.TestStatus = "in_progress"
	err := ts.r.Tests.Start(user_id, test_id, currentTime, testStatus)
	if err != nil {
		return err
	}

	return nil
}

func (ts *TestsService) Complete(user_id string, test_id string) (*utils.TestStatsResponse, error) {
	currentTime := time.Now().Format(StandardSQLTimeFormat)
	var testStatus utils.TestStatus = "completed"
	stats, err := ts.r.Tests.Complete(user_id, test_id, currentTime, testStatus)
	if err != nil {
		return nil, err
	}

	return stats, nil
}
