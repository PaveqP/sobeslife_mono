#!/bin/sh

set -eu

COMPOSE_FILE="${1:-docker-compose.deploy.yml}"
ENV_FILE="${2:-.env}"
MIGRATIONS_DIR="${3:-server/migrations}"

compose() {
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" "$@"
}

if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "Migrations directory not found: $MIGRATIONS_DIR" >&2
  exit 1
fi

compose exec -T db psql -U postgres -d postgres -v ON_ERROR_STOP=1 -c \
  "CREATE TABLE IF NOT EXISTS schema_migrations (
    version BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );"

find "$MIGRATIONS_DIR" -maxdepth 1 -type f -name '*.up.sql' | sort | while IFS= read -r file; do
  base_name="$(basename "$file")"
  version="$(printf '%s' "$base_name" | sed -n 's/^\([0-9][0-9]*\)_.*/\1/p')"

  if [ -z "$version" ]; then
    echo "Could not parse migration version from $base_name" >&2
    exit 1
  fi

  already_applied="$(compose exec -T db psql -U postgres -d postgres -tA -v ON_ERROR_STOP=1 -c "SELECT 1 FROM schema_migrations WHERE version = $version LIMIT 1;")"
  if [ "$already_applied" = "1" ]; then
    echo "Skipping already applied migration: $base_name"
    continue
  fi

  echo "Applying migration: $base_name"
  compose exec -T db psql -U postgres -d postgres -v ON_ERROR_STOP=1 < "$file"

  escaped_name="$(printf '%s' "$base_name" | sed "s/'/''/g")"
  compose exec -T db psql -U postgres -d postgres -v ON_ERROR_STOP=1 -c \
    "INSERT INTO schema_migrations (version, name) VALUES ($version, '$escaped_name');"
done
