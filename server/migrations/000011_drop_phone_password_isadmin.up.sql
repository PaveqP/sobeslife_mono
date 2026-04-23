ALTER TABLE users DROP COLUMN IF EXISTS phone_number;
ALTER TABLE users DROP COLUMN IF EXISTS password_hash;
ALTER TABLE users DROP COLUMN IF EXISTS is_admin;

-- Nickname must be unique (NULL values are allowed and excluded from uniqueness check)
CREATE UNIQUE INDEX IF NOT EXISTS users_nickname_unique ON users (nickname) WHERE nickname IS NOT NULL;
