import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    # PostgreSQL connection parameters
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "5432")
    DB_NAME = os.getenv("DB_NAME", "mochi_db")
    DB_USER = os.getenv("DB_USER", "postgres")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")

    # Full DATABASE_URL takes priority if provided
    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        f"host={DB_HOST} port={DB_PORT} dbname={DB_NAME} user={DB_USER} password={DB_PASSWORD}",
    )

    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")

    # >>> ADD YOUR GEMINI API KEY in .env file <<<
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
