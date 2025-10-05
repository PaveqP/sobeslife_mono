package services

import (
	"sobeslife-services/internal/repository"
	"sobeslife-services/internal/utils"
)

type SharedService struct {
	r *repository.Repository
}

func newSharedService(r *repository.Repository) *SharedService {
	return &SharedService{r}
}

func (ps *SharedService) GetAllProfessions() ([]utils.Profession, error) {
	result, err := ps.r.Shared.GetAllProfessions()
	if err != nil {
		return []utils.Profession{}, err
	}
	return result, nil
}

func (ps *SharedService) GetModulesByFilters(profession string) ([]utils.Chapter, error) {
	result, err := ps.r.Shared.GetModulesByFilters(profession)
	if err != nil {
		return []utils.Chapter{}, err
	}
	return result, nil
}

func (ps *SharedService) GetTechnologiesByFilters(module string) ([]utils.Technology, error) {
	result, err := ps.r.Shared.GetTechnologiesByFilters(module)
	if err != nil {
		return []utils.Technology{}, err
	}
	return result, nil
}
