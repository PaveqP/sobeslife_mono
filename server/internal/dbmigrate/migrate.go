package dbmigrate

import (
	"database/sql"
	"errors"
	"fmt"
	"net/url"
	"os"
	"path/filepath"
	"strings"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/lib/pq"
	"github.com/sirupsen/logrus"

	"sobeslife-services/internal/repository"
	"sobeslife-services/internal/utils"
)

// Run применяет только те миграции, которые ещё не отмечены в БД — по смыслу как `manage.py migrate` в Django.
// Состояние хранится в таблице schema_migrations (создаётся автоматически); повторные запуски безопасны.
// Файлы: migrationsDir/*.up.sql с префиксом версии (например 000001_name.up.sql).
func Run(cfg repository.Config, migrationsDir string) error {
	password := utils.GetEnv("DB_PASSWORD")
	dsn := postgresDSN(cfg, password)

	if err := ensureGolangMigrateSchemaMigrationsTable(dsn); err != nil {
		return err
	}

	abs, err := filepath.Abs(migrationsDir)
	if err != nil {
		return fmt.Errorf("migrations path: %w", err)
	}
	sourceURL := "file://" + filepath.ToSlash(abs)

	m, err := migrate.New(sourceURL, dsn)
	if err != nil {
		return fmt.Errorf("migrate init: %w", err)
	}
	defer func() {
		sErr, dbErr := m.Close()
		if sErr != nil {
			logrus.Warnf("migrate source close: %v", sErr)
		}
		if dbErr != nil {
			logrus.Warnf("migrate database close: %v", dbErr)
		}
	}()

	ver, dirty, err := m.Version()
	if err != nil {
		if !errors.Is(err, migrate.ErrNilVersion) {
			return fmt.Errorf("read migration version: %w", err)
		}
		ver = 0
	}
	if dirty {
		if clear := os.Getenv("MIGRATE_CLEAR_DIRTY"); clear == "1" || strings.EqualFold(clear, "true") {
			logrus.Warnf("MIGRATE_CLEAR_DIRTY: снимаю dirty для версии %d (эквивалент migrate force %d; только dev, схема должна соответствовать этой версии)", ver, ver)
			if err := m.Force(int(ver)); err != nil {
				return fmt.Errorf("migrate Force(%d): %w", ver, err)
			}
			dirty = false
		} else {
			return fmt.Errorf(
				"migration state is dirty at version %d: в корне репозитория в .env добавьте MIGRATE_CLEAR_DIRTY=true, выполните docker compose up --force-recreate app, дождитесь успешного старта, удалите строку из .env и снова up; либо docker compose down -v (очистит Postgres)",
				ver,
			)
		}
	}
	if ver > 0 {
		logrus.Infof("DB migrations: текущая версия схемы %d, ищем неприменённые миграции…", ver)
	} else {
		logrus.Info("DB migrations: версия не зафиксирована (пустая БД), применяем миграции с начала")
	}

	applied := 0
	for {
		err := m.Steps(1)
		// golang-migrate: при limit=1 и уже на последней версии readUp отдаёт os.ErrNotExist, а не ErrNoChange.
		if errors.Is(err, migrate.ErrNoChange) || errors.Is(err, os.ErrNotExist) {
			if applied == 0 {
				logrus.Info("DB migrations: неприменённых миграций нет, схема актуальна")
			} else {
				logrus.Infof("DB migrations: готово, применено новых миграций: %d", applied)
			}
			return nil
		}
		if err != nil {
			if strings.Contains(err.Error(), "Dirty database version") {
				return fmt.Errorf("migrate: %w (состояние dirty: см. комментарий к postgres-init в docker-compose)", err)
			}
			return fmt.Errorf("migrate: %w", err)
		}
		applied++
		newVer, _, vErr := m.Version()
		if vErr != nil {
			logrus.Warnf("DB migrations: шаг %d выполнен, не удалось прочитать версию: %v", applied, vErr)
			continue
		}
		logrus.Infof("DB migrations: применена миграция с версией %d", newVer)
	}
}

func postgresDSN(cfg repository.Config, password string) string {
	u := url.URL{
		Scheme: "postgres",
		Host:   fmt.Sprintf("%s:%s", cfg.Host, cfg.Port),
		Path:   "/" + cfg.DBName,
	}
	if password != "" {
		u.User = url.UserPassword(cfg.Username, password)
	} else {
		u.User = url.User(cfg.Username)
	}
	q := url.Values{}
	q.Set("sslmode", cfg.SSLMode)
	u.RawQuery = q.Encode()
	return u.String()
}

// ResolveDir возвращает каталог миграций: MIGRATIONS_PATH или migrations относительно cwd.
func ResolveDir() string {
	if p := os.Getenv("MIGRATIONS_PATH"); p != "" {
		return p
	}
	return "migrations"
}

// ensureGolangMigrateSchemaMigrationsTable приводит legacy-таблицу schema_migrations к формату golang-migrate v4
// (нужны колонки version + dirty). Иначе m.Version() падает с «column dirty does not exist», app не стартует → 502.
func ensureGolangMigrateSchemaMigrationsTable(dsn string) error {
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return fmt.Errorf("compat schema_migrations: open db: %w", err)
	}
	defer db.Close()

	const q = `
ALTER TABLE IF EXISTS public.schema_migrations
	ADD COLUMN IF NOT EXISTS dirty boolean NOT NULL DEFAULT false`
	if _, err := db.Exec(q); err != nil {
		return fmt.Errorf("compat schema_migrations: %w", err)
	}
	return nil
}
