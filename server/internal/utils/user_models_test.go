package utils

import (
	"reflect"
	"testing"
)

func TestUserStructHasFields(t *testing.T) {
	u := User{}
	typ := reflect.TypeOf(u)
	if typ.NumField() == 0 {
		t.Error("User struct should have fields")
	}
}

func TestAdminUserStructHasFields(t *testing.T) {
	a := AdminUser{}
	typ := reflect.TypeOf(a)
	if typ.NumField() == 0 {
		t.Error("AdminUser struct should have fields")
	}
}

func TestAdminStatsResponseFields(t *testing.T) {
	s := AdminStatsResponse{
		TotalUsers:      10,
		TotalTests:      5,
		TotalInterviews: 3,
	}
	if s.TotalUsers != 10 {
		t.Errorf("expected TotalUsers=10, got %d", s.TotalUsers)
	}
}
