CREATE TYPE expertise_level AS ENUM ('trainee', 'junior', 'middle', 'senior');

CREATE TYPE test_status AS ENUM ('assigned', 'in_progress', 'completed', 'expired', 'cancelled');

CREATE TABLE profession (
    id SERIAL PRIMARY KEY,
    name VARCHAR(300)
);

CREATE TABLE technology (
    id SERIAL PRIMARY KEY,
    name VARCHAR(300)
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nickname VARCHAR(100),
    email VARCHAR(100),
    phone_number VARCHAR(100) NOT NULL UNIQUE,
    date_of_birth DATE,
    profession_id INT REFERENCES profession (id) ON DELETE SET NULL,
    expertise_level expertise_level
);

CREATE TABLE test (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100),
    profession_id INT REFERENCES profession (id) ON DELETE CASCADE,
    technology_id INT REFERENCES technology (id) ON DELETE CASCADE,
    expertise_level expertise_level
);

CREATE TABLE question (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    correct_answer VARCHAR(400),
    profession_id INT REFERENCES profession (id) ON DELETE CASCADE NOT NULL,
    expertise_level expertise_level
);

CREATE TABLE question_technology (
    id SERIAL PRIMARY KEY,
    question_id INT REFERENCES question (id) ON DELETE CASCADE NOT NULL,
    technology_id INT REFERENCES technology (id) ON DELETE CASCADE NOT NULL
);

CREATE TABLE test_question (
    id SERIAL PRIMARY KEY,
    test_id INT REFERENCES test (id) ON DELETE CASCADE NOT NULL,
    question_id INT REFERENCES question (id) ON DELETE CASCADE NOT NULL
);

CREATE TABLE user_test (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users (id) ON DELETE CASCADE NOT NULL,
    test_id INT REFERENCES test (id) ON DELETE CASCADE NOT NULL,
    test_status test_status,
    score INT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);