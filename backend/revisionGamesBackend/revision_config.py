"""
Revision Games Configuration
=============================
Database schema for the Revision Games feature.
"""

import psycopg2
import psycopg2.extras
from config import Config

# ──────────────────────────────────────
# DATABASE CONNECTION
# ──────────────────────────────────────

def get_connection():
    """Return a new psycopg2 connection using config values."""
    return psycopg2.connect(Config.DATABASE_URL)

# ──────────────────────────────────────
# SCHEMA
# ──────────────────────────────────────

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255) DEFAULT '',
    icon_url VARCHAR(500) DEFAULT '',
    color VARCHAR(50) DEFAULT 'bg-gray-100',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    target_item VARCHAR(100) NOT NULL,
    correct_answer VARCHAR(100) NOT NULL,
    audio_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS question_options (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    label VARCHAR(100) NOT NULL,
    image_url VARCHAR(500) DEFAULT ''
);

CREATE TABLE IF NOT EXISTS game_progress (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    student_session VARCHAR(100) NOT NULL,
    score INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    completed_at TIMESTAMP DEFAULT NOW()
);
"""

def init_db():
    """Create all tables if they don't exist."""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(SCHEMA_SQL)
        conn.commit()
        print("✅ Revision Games tables ready.")
    finally:
        conn.close()