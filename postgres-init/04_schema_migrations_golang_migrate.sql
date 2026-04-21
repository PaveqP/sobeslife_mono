-- golang-migrate v4 ожидает public.schema_migrations (version bigint, dirty boolean).
-- Если таблица осталась от старого инструмента только с version, app падает при старте.
-- Дублирует логику ensureGolangMigrateSchemaMigrationsTable в server/internal/dbmigrate.
ALTER TABLE IF EXISTS public.schema_migrations
	ADD COLUMN IF NOT EXISTS dirty boolean NOT NULL DEFAULT false;
