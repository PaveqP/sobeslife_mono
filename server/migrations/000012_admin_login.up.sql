-- Add login column for admin authentication (replaces email-based login)
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS login VARCHAR(100);

-- Populate login from email local part for existing rows
UPDATE admin_users SET login = split_part(email, '@', 1) WHERE login IS NULL;

-- Make login required and unique
ALTER TABLE admin_users ALTER COLUMN login SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS admin_users_login_unique ON admin_users (lower(login));
