ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;
ALTER TABLE users
    DROP COLUMN IF EXISTS first_name,
    DROP COLUMN IF EXISTS last_name,
    DROP COLUMN IF EXISTS years_experience,
    DROP COLUMN IF EXISTS github_url,
    DROP COLUMN IF EXISTS linkedin_url,
    DROP COLUMN IF EXISTS about,
    DROP COLUMN IF EXISTS profile_completed;
