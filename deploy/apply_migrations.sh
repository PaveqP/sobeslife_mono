#!/bin/sh

set -eu

COMPOSE_FILE="${1:-docker-compose.deploy.yml}"
ENV_FILE="${2:-.env}"
MIGRATIONS_DIR="${3:-server/migrations}"

compose() {
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" "$@"
}

db_query() {
  compose exec -T db psql -U postgres -d postgres -tA -v ON_ERROR_STOP=1 -c "$1"
}

mark_migration_as_applied() {
  version="$1"
  name="$2"
  escaped_name="$(printf '%s' "$name" | sed "s/'/''/g")"

  db_query "INSERT INTO schema_migrations (version, name) VALUES ($version, '$escaped_name') ON CONFLICT (version) DO NOTHING;" >/dev/null
  echo "Baselined existing migration: $name"
}

if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "Migrations directory not found: $MIGRATIONS_DIR" >&2
  exit 1
fi

db_query \
  "CREATE TABLE IF NOT EXISTS schema_migrations (
    version BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );" >/dev/null

migration_count="$(db_query "SELECT COUNT(*) FROM schema_migrations;")"
if [ "$migration_count" = "0" ]; then
  if [ "$(db_query "SELECT to_regclass('public.users') IS NOT NULL;")" = "t" ] &&
     [ "$(db_query "SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'expertise_level');")" = "t" ] &&
     [ "$(db_query "SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'test_status');")" = "t" ]; then
    mark_migration_as_applied 1 "000001_init.up.sql"
  fi

  if [ "$(db_query "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'test_question' AND column_name = 'is_correct');")" = "t" ] &&
     [ "$(db_query "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'test_question' AND column_name = 'answer');")" = "t" ] &&
     [ "$(db_query "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'test_question' AND column_name = 'points');")" = "t" ]; then
    mark_migration_as_applied 2 "000002_init.up.sql"
  fi

  if [ "$(db_query "SELECT to_regclass('public.interview_session') IS NOT NULL;")" = "t" ] &&
     [ "$(db_query "SELECT to_regclass('public.interview_message') IS NOT NULL;")" = "t" ] &&
     [ "$(db_query "SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'interview_status');")" = "t" ] &&
     [ "$(db_query "SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'interview_message_role');")" = "t" ]; then
    mark_migration_as_applied 3 "000003_interviews.up.sql"
  fi

  if [ "$(db_query "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'interview_session' AND column_name = 'candidate_specialization');")" = "t" ] &&
     [ "$(db_query "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'interview_session' AND column_name = 'interview_plan');")" = "t" ]; then
    mark_migration_as_applied 4 "000004_interview_plan.up.sql"
  fi

  if [ "$(db_query "SELECT is_nullable = 'NO' FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'email';")" = "t" ] &&
     [ "$(db_query "SELECT is_nullable = 'YES' FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'phone_number';")" = "t" ]; then
    mark_migration_as_applied 5 "000005_users_email_required_phone_optional.up.sql"
  fi

  if [ "$(db_query "SELECT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_schema = 'public' AND table_name = 'users' AND constraint_name = 'users_email_key' AND constraint_type = 'UNIQUE');")" = "t" ]; then
    mark_migration_as_applied 6 "000006_users_email_unique.up.sql"
  fi
fi

find "$MIGRATIONS_DIR" -maxdepth 1 -type f -name '*.up.sql' | sort | while IFS= read -r file; do
  base_name="$(basename "$file")"
  version="$(printf '%s' "$base_name" | sed -n 's/^\([0-9][0-9]*\)_.*/\1/p')"

  if [ -z "$version" ]; then
    echo "Could not parse migration version from $base_name" >&2
    exit 1
  fi

  already_applied="$(db_query "SELECT 1 FROM schema_migrations WHERE version = $version LIMIT 1;")"
  if [ "$already_applied" = "1" ]; then
    echo "Skipping already applied migration: $base_name"
    continue
  fi

  echo "Applying migration: $base_name"
  compose exec -T db psql -U postgres -d postgres -v ON_ERROR_STOP=1 < "$file"

  mark_migration_as_applied "$version" "$base_name"
done
