-- golang-migrate v4: только version (bigint PK) + dirty (bool). Лишние колонки (например name NOT NULL)
-- ломают INSERT (version, dirty) в драйвере.
ALTER TABLE IF EXISTS public.schema_migrations
	DROP COLUMN IF EXISTS name;
ALTER TABLE IF EXISTS public.schema_migrations
	ADD COLUMN IF NOT EXISTS dirty boolean NOT NULL DEFAULT false;
