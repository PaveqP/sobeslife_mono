package utils

import (
	"reflect"
	"testing"
)

func TestAdminQuestionFiltersHasTechnologyField(t *testing.T) {
	typ := reflect.TypeOf(AdminQuestionFilters{})
	field, ok := typ.FieldByName("Technology")
	if !ok {
		t.Fatal("AdminQuestionFilters should have a Technology field")
	}
	if field.Type.Kind() != reflect.String {
		t.Errorf("expected Technology to be string, got %s", field.Type.Kind())
	}
}

func TestAdminQuestionFiltersHasProfessionField(t *testing.T) {
	typ := reflect.TypeOf(AdminQuestionFilters{})
	_, ok := typ.FieldByName("Profession")
	if !ok {
		t.Fatal("AdminQuestionFilters should have a Profession field")
	}
}

func TestAdminQuestionFiltersHasChapterField(t *testing.T) {
	typ := reflect.TypeOf(AdminQuestionFilters{})
	_, ok := typ.FieldByName("Chapter")
	if !ok {
		t.Fatal("AdminQuestionFilters should have a Chapter field")
	}
}

func TestAdminQuestionFiltersHasExpertiseLevelField(t *testing.T) {
	typ := reflect.TypeOf(AdminQuestionFilters{})
	_, ok := typ.FieldByName("ExpertiseLevel")
	if !ok {
		t.Fatal("AdminQuestionFilters should have an ExpertiseLevel field")
	}
}

func TestAdminQuestionFiltersZeroValue(t *testing.T) {
	filters := AdminQuestionFilters{}
	if filters.Technology != "" {
		t.Errorf("expected zero Technology to be empty string, got %q", filters.Technology)
	}
	if filters.Profession != "" {
		t.Errorf("expected zero Profession to be empty string, got %q", filters.Profession)
	}
}

func TestAdminQuestionFiltersAssignment(t *testing.T) {
	filters := AdminQuestionFilters{
		Profession:     "Frontend",
		Chapter:        "Basics",
		Technology:     "React",
		ExpertiseLevel: "junior",
	}
	if filters.Profession != "Frontend" {
		t.Errorf("expected Profession=Frontend, got %q", filters.Profession)
	}
	if filters.Chapter != "Basics" {
		t.Errorf("expected Chapter=Basics, got %q", filters.Chapter)
	}
	if filters.Technology != "React" {
		t.Errorf("expected Technology=React, got %q", filters.Technology)
	}
	if filters.ExpertiseLevel != "junior" {
		t.Errorf("expected ExpertiseLevel=junior, got %q", filters.ExpertiseLevel)
	}
}

func TestAdminCreateQuestionRequestHasRequiredFields(t *testing.T) {
	typ := reflect.TypeOf(AdminCreateQuestionRequest{})
	requiredFields := []string{"Text", "CorrectAnswer", "Profession", "Chapter", "ExpertiseLevel"}
	for _, name := range requiredFields {
		if _, ok := typ.FieldByName(name); !ok {
			t.Errorf("AdminCreateQuestionRequest should have field %s", name)
		}
	}
}

func TestAdminUpdateQuestionRequestAllFieldsArePointers(t *testing.T) {
	typ := reflect.TypeOf(AdminUpdateQuestionRequest{})
	for i := range typ.NumField() {
		field := typ.Field(i)
		if field.Type.Kind() != reflect.Ptr {
			t.Errorf("field %s should be a pointer type (for partial updates), got %s", field.Name, field.Type.Kind())
		}
	}
}
