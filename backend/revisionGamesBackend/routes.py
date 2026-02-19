"""
Revision Games Routes
======================
All API endpoints for the Revision Games feature.
Updated to integrate Gemini 2.0 Flash and Gemini 3 Pro Image Preview.
"""

from flask import Blueprint, request, jsonify
import psycopg2.extras
import json
from .revision_config import get_connection

# 1. Import the service functions from your renamed file
from .gemini_services import generate_questions, generate_feedback

revision_games_bp = Blueprint("revision_games", __name__, url_prefix="/api")

# ──────────────────────────────────────
# CATEGORIES (DB Operations)
# ──────────────────────────────────────

@revision_games_bp.route("/categories", methods=["GET"])
def get_categories():
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT id, name, description, icon_url, color FROM categories ORDER BY id")
            rows = cur.fetchall()
        return jsonify([dict(r) for r in rows])
    finally:
        conn.close()

@revision_games_bp.route("/categories", methods=["POST"])
def create_category():
    data = request.json
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                """INSERT INTO categories (name, description, icon_url, color)
                   VALUES (%s, %s, %s, %s)
                   RETURNING id, name, description, icon_url, color""",
                (data["name"], data.get("description", ""), data.get("icon_url", ""), data.get("color", "bg-gray-100")),
            )
            cat = dict(cur.fetchone())
        conn.commit()
        return jsonify(cat), 201
    finally:
        conn.close()

# ──────────────────────────────────────
# QUESTIONS (DB Operations)
# ──────────────────────────────────────

@revision_games_bp.route("/categories/<int:category_id>/questions", methods=["GET"])
def get_questions(category_id):
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                "SELECT id, category_id, target_item, correct_answer, audio_url FROM questions WHERE category_id = %s",
                (category_id,),
            )
            questions = [dict(q) for q in cur.fetchall()]

            for q in questions:
                cur.execute(
                    "SELECT id, label, image_url FROM question_options WHERE question_id = %s",
                    (q["id"],),
                )
                q["options"] = [dict(o) for o in cur.fetchall()]

        return jsonify(questions)
    finally:
        conn.close()

@revision_games_bp.route("/categories/<int:category_id>/questions", methods=["POST"])
def create_question(category_id):
    data = request.json
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                """INSERT INTO questions (category_id, target_item, correct_answer, audio_url)
                   VALUES (%s, %s, %s, %s) RETURNING id""",
                (category_id, data["target_item"], data["correct_answer"], data.get("audio_url")),
            )
            q_id = cur.fetchone()["id"]

            options = []
            for opt in data.get("options", []):
                cur.execute(
                    """INSERT INTO question_options (question_id, label, image_url)
                       VALUES (%s, %s, %s) RETURNING id, label, image_url""",
                    (q_id, opt["label"], opt.get("image_url", "")),
                )
                options.append(dict(cur.fetchone()))

        conn.commit()
        return jsonify({"id": q_id, "options": options}), 201
    finally:
        conn.close()

# ──────────────────────────────────────
# AI GENERATION (Gemini + Unsplash)
# ──────────────────────────────────────

@revision_games_bp.route("/generate", methods=["POST"])
def ai_generate_questions():
    """
    Triggers the Gemini text generation and Unsplash image search.
    """
    data = request.json
    game_topic = data.get("gameTopic", "General Knowledge")
    subject = data.get("subject", "General")
    description = data.get("description", "")
    
    print(f"🚀 Mochi AI Request: {game_topic} | {subject}")

    try:
        # Calls the function in gemini_unsplash.py
        generated_data = generate_questions(
            game_topic=game_topic,
            subject=subject,
            description=description
        )
        
        if not generated_data:
            return jsonify({"error": "Mochi couldn't find any images or questions right now."}), 500

        return jsonify(generated_data)

    except Exception as e:
        print(f"❌ Route Error: {e}")
        return jsonify({"error": str(e)}), 500

# ──────────────────────────────────────
# AI FEEDBACK
# ──────────────────────────────────────

@revision_games_bp.route("/feedback", methods=["POST"])
def get_feedback():
    data = request.json
    result = generate_feedback(
        user_answer=data["user_answer"],
        correct_answer=data["correct_answer"],
        target_item=data["target_item"],
    )
    return jsonify(result)

# ──────────────────────────────────────
# SAVE GENERATED GAME
# ──────────────────────────────────────

@revision_games_bp.route("/activities", methods=["POST"])
def save_activity():
    data = request.json
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                """INSERT INTO categories (name, description, icon_url, color)
                   VALUES (%s, %s, %s, %s) RETURNING id""",
                (data["category_name"], data.get("description", ""), "Sparkles", "bg-cyan-100"),
            )
            cat_id = cur.fetchone()["id"]

            for qd in data.get("questions", []):
                cur.execute(
                    """INSERT INTO questions (category_id, target_item, correct_answer)
                       VALUES (%s, %s, %s) RETURNING id""",
                    (cat_id, qd.get("questionText", "Look!"), qd.get("correct_answer", "Option 1")),
                )
                q_id = cur.fetchone()["id"]

                for opt in qd.get("options", []):
                    cur.execute(
                        """INSERT INTO question_options (question_id, label, image_url)
                           VALUES (%s, %s, %s)""",
                        (q_id, opt["label"], opt.get("image_url", "")),
                    )

        conn.commit()
        return jsonify({"message": "Saved!", "id": cat_id}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# ──────────────────────────────────────
# PROGRESS LOGS
# ──────────────────────────────────────

@revision_games_bp.route("/progress", methods=["POST"])
def save_progress():
    data = request.json
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                """INSERT INTO game_progress (category_id, student_session, score, total_questions)
                   VALUES (%s, %s, %s, %s)
                   RETURNING id, completed_at""",
                (data["category_id"], data["student_session"], data["score"], data["total_questions"]),
            )
            res = dict(cur.fetchone())
            if res["completed_at"]:
                res["completed_at"] = res["completed_at"].isoformat()
        conn.commit()
        return jsonify(res), 201
    finally:
        conn.close()

@revision_games_bp.route("/activities/recent", methods=["GET"])
def get_recent_activities():
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                "SELECT id, name, description, icon_url, color FROM categories ORDER BY created_at DESC LIMIT 5"
            )
            rows = [dict(r) for r in cur.fetchall()]
        return jsonify(rows)
    finally:
        conn.close()