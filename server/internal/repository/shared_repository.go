package repository

import (
	"fmt"
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
	query := fmt.Sprintf(`SELECT DISTINCT c.* FROM %s c 
	LEFT JOIN profession_chapter pc ON pc.chapter_id = c.id
	LEFT JOIN profession p ON p.id = pc.profession_id
	`, "chapter")

	params := []interface{}{}

	if profession != "" {
		query += "WHERE p.name = $1"
		params = append(params, profession)
	}

	query += " ORDER BY c.id ASC"

	var chapters []utils.Chapter
	if err := sr.db.Select(&chapters, query, params...); err != nil {
		return []utils.Chapter{}, err
	}

	return chapters, nil
}

func (sr *SharedRepository) GetTechnologiesByFilters(module string) ([]utils.Technology, error) {
	query := fmt.Sprintf(`SELECT DISTINCT t.* FROM %s t
	LEFT JOIN chapter_technology ct ON ct.technology_id = t.id
	LEFT JOIN chapter c ON c.id = ct.chapter_id
	`, "technology")

	params := []interface{}{}

	if module != "" {
		query += "WHERE c.name = $1"
		params = append(params, module)
	}

	query += " ORDER BY t.id ASC"

	var technologies []utils.Technology
	if err := sr.db.Select(&technologies, query, params...); err != nil {
		return []utils.Technology{}, err
	}

	return technologies, nil
}
