DROP INDEX IF EXISTS admin_users_login_unique;
ALTER TABLE admin_users DROP COLUMN IF EXISTS login;
