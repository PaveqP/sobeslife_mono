-- Allow OAuth/OTP users to register without a password
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Extended profile fields
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS years_experience INT,
    ADD COLUMN IF NOT EXISTS github_url VARCHAR(300),
    ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(300),
    ADD COLUMN IF NOT EXISTS about TEXT,
    ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN NOT NULL DEFAULT FALSE;
