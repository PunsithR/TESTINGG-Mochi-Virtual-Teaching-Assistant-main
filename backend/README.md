# Mochi Backend (Flask + psycopg2)

## Quick Start

```bash
cd backend

# 1. Create virtual environment
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# >>> Edit .env — add your GEMINI_API_KEY and DB credentials <<<

# 4. Create PostgreSQL database
createdb mochi_db   # or use pgAdmin / psql

# 5. Seed initial data (also creates tables)
python seed.py

# 6. Run the server
python app.py
# Server runs at http://localhost:5000
```

## Tech Stack

- **Flask** — lightweight web framework
- **psycopg2** — PostgreSQL adapter (direct SQL, no ORM)
- **PostgreSQL** — relational database
- **Google Gemini** — AI feedback & question generation

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/categories` | List all categories |
| POST | `/api/categories` | Create a category |
| GET | `/api/categories/:id/questions` | Get questions for a category |
| POST | `/api/categories/:id/questions` | Add a question to a category |
| POST | `/api/feedback` | Get AI feedback on an answer |
| POST | `/api/generate-questions` | AI-generate questions |
| POST | `/api/activities` | Save a full activity (category + questions) |
| GET | `/api/activities/recent` | Get recently created activities |
| POST | `/api/progress` | Save game progress |
| GET | `/api/progress/:sessionId` | Get progress by session |
| GET | `/api/progress/recent` | Get recently played games |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_HOST` | No | PostgreSQL host (default: localhost) |
| `DB_PORT` | No | PostgreSQL port (default: 5432) |
| `DB_NAME` | No | Database name (default: mochi_db) |
| `DB_USER` | No | Database user (default: postgres) |
| `DB_PASSWORD` | No | Database password (default: postgres) |
| `DATABASE_URL` | No | Full DSN (overrides individual params) |
| `GEMINI_API_KEY` | Yes | Google Gemini API key ([get one here](https://aistudio.google.com/app/apikey)) |
| `FRONTEND_URL` | No | CORS origin (default: `http://localhost:5173`) |
| `SECRET_KEY` | No | Flask secret key |
