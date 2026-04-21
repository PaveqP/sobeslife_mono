package repository

import (
	"sobeslife-services/internal/utils"

	"github.com/jmoiron/sqlx"
)

type SharedRepository struct {
	db *sqlx.DB
}

func newSharedRepository(db *sqlx.DB) *SharedRepository {
	return &SharedRepository{db}
}

func (sr *SharedRepository) GetAllProfessions() ([]utils.Profession, error) {
	query := "SELECT * FROM profession"
	var professions []utils.Profession
	if err := sr.db.Select(&professions, query); err != nil {
		return []utils.Profession{}, err
	}
	return professions, nil
}

func (sr *SharedRepository) GetModulesByFilters(profession string) ([]utils.Chapter, error) {
	var query string
	var params []interface{}

	if profession != "" {
		query = `
			SELECT DISTINCT c.id, c.name FROM chapter c
			JOIN test t ON t.chapter_id = c.id
			JOIN profession p ON p.id = t.profession_id
			WHERE p.name = $1
			ORDER BY c.name ASC
		`
		params = []interface{}{profession}
	} else {
		query = `
			SELECT DISTINCT c.id, c.name FROM chapter c
			JOIN test t ON t.chapter_id = c.id
			ORDER BY c.name ASC
		`
	}

	var chapters []utils.Chapter
	if err := sr.db.Select(&chapters, query, params...); err != nil {
		return []utils.Chapter{}, err
	}

	return chapters, nil
}

func (sr *SharedRepository) GetTechnologiesByFilters(module string) ([]utils.Technology, error) {
	var query string
	var params []interface{}

	if module != "" {
		query = `
			SELECT DISTINCT te.id, te.name FROM technology te
			JOIN test t ON t.technology_id = te.id
			JOIN chapter c ON c.id = t.chapter_id
			WHERE c.name = $1
			ORDER BY te.name ASC
		`
		params = []interface{}{module}
	} else {
		query = `
			SELECT DISTINCT te.id, te.name FROM technology te
			JOIN test t ON t.technology_id = te.id
			ORDER BY te.name ASC
		`
	}

	var technologies []utils.Technology
	if err := sr.db.Select(&technologies, query, params...); err != nil {
		return []utils.Technology{}, err
	}

	return technologies, nil
}
