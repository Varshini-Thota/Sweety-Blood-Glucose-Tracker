
-- Sweety Blood Glucose Tracker Database Schema

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS readings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,
    reading_date DATE NOT NULL,
    slot VARCHAR(30) NOT NULL
        CHECK (
            slot IN (
                'Morning fasting',
                'After breakfast',
                'After lunch',
                'After dinner'
            )
        ),
    value_mg_dl INTEGER NOT NULL
        CHECK (value_mg_dl BETWEEN 40 AND 600),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, reading_date, slot)
);
