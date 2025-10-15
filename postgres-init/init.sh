#!/bin/bash
set -e

echo "Starting PostgreSQL..."

docker-entrypoint.sh postgres &

sleep 5

echo "Waiting for PostgreSQL to start..."
for i in {1..30}; do
    if pg_isready -U postgres &>/dev/null; then
        echo "PostgreSQL is ready!"
        
        echo "Restoring backup from /docker-entrypoint-initdb.d/backup.sql"
        
        psql -U postgres -d postgres -f /docker-entrypoint-initdb.d/db_dump.sql
        
        echo "Backup restored successfully!"
        
        wait
        exit 0
    fi
    echo "Attempt $i/30: PostgreSQL is not ready yet..."
    sleep 2
done

echo "PostgreSQL failed to start within 60 seconds"
exit 1