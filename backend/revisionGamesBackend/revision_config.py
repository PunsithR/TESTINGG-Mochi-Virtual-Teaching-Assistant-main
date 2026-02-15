"""
Revision Games Configuration
=============================
Database schema and Gemini AI service for the Revision Games feature.
"""

from google.genai import Client
import psycopg2
import psycopg2.extras
import google as genai
import json
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


# ──────────────────────────────────────
# GEMINI AI SERVICE
# ──────────────────────────────────────

client=Client(api_key=Config.GEMINI_API_KEY)


def get_model():
    """Get the Gemini model instance."""
    return genai.GenerativeModel("gemini-2.0-flash")


def generate_feedback(user_answer: str, correct_answer: str, target_item: str) -> dict:
    """
    Generate child-friendly feedback using Gemini.
    Falls back to basic feedback if API key is missing or call fails.
    """
    if not Config.GEMINI_API_KEY:
        is_correct = user_answer.lower() == correct_answer.lower()
        if is_correct:
            return {
                "isCorrect": True,
                "message": f"Great job! That is a {correct_answer}! 🎉",
                "encouragement": "You're doing amazing!",
            }
        return {
            "isCorrect": False,
            "message": f"Close! That is a {user_answer}. Try finding the {correct_answer}!",
            "encouragement": "You can do it! Try again!",
        }

    try:
        model = get_model()
        prompt = f"""You are Mochi, a friendly AI teaching assistant for preschoolers (ages 3-6).
A child was asked to identify "{target_item}" and they chose "{user_answer}".
The correct answer is "{correct_answer}".

Respond with JSON only:
{{
  "isCorrect": true/false,
  "message": "short child-friendly feedback (max 15 words)",
  "encouragement": "motivational phrase (max 10 words)"
}}

Be warm, encouraging, and use simple language. Use emojis."""

        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        return json.loads(text)

    except Exception as e:
        print(f"Gemini feedback error: {e}")
        is_correct = user_answer.lower() == correct_answer.lower()
        return {
            "isCorrect": is_correct,
            "message": f"{'Great job! 🎉' if is_correct else 'Try again! 💪'}",
            "encouragement": "Keep going!",
        }


def generate_questions(subject: str, description: str, num_questions: int = 5) -> list:
    """
    Generate quiz questions using Gemini AI.
    Returns list of question dicts ready to be saved.
    """
    if not Config.GEMINI_API_KEY:
        return []

    try:
        model = get_model()
        prompt = f"""Generate {num_questions} multiple-choice quiz questions for preschoolers about "{subject}".
Additional context: {description}

Each question should have 3 options with image search terms.
Return JSON array only:
[
  {{
    "target_item": "the item to identify",
    "correct_answer": "correct option label",
    "options": [
      {{"label": "Option A", "image_search_term": "search term for image"}},
      {{"label": "Option B", "image_search_term": "search term for image"}},
      {{"label": "Option C", "image_search_term": "search term for image"}}
    ]
  }}
]

Make questions simple, fun, and educational for ages 3-6."""

        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        return json.loads(text)

    except Exception as e:
        print(f"Gemini question generation error: {e}")
        return []
