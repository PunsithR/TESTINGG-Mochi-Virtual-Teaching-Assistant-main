"""
Revision Games Routes
======================
All API endpoints for the Revision Games feature.
Registered as a Flask Blueprint.
"""

from flask import Blueprint, request, jsonify
import psycopg2.extras
import json
from .revision_config import (
    get_connection,
    generate_feedback,
    # generate_questions, # We are replacing this logic directly in the route for custom control
    client # Ensure client is imported from revision_config
)

revision_games_bp = Blueprint("revision_games", __name__, url_prefix="/api")


# ──────────────────────────────────────
# CATEGORIES
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
# QUESTIONS
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
                   VALUES (%s, %s, %s, %s) RETURNING id, category_id, target_item, correct_answer, audio_url""",
                (category_id, data["target_item"], data["correct_answer"], data.get("audio_url")),
            )
            q = dict(cur.fetchone())

            q["options"] = []
            for opt in data.get("options", []):
                cur.execute(
                    """INSERT INTO question_options (question_id, label, image_url)
                       VALUES (%s, %s, %s) RETURNING id, label, image_url""",
                    (q["id"], opt["label"], opt.get("image_url", "")),
                )
                q["options"].append(dict(cur.fetchone()))

        conn.commit()
        return jsonify(q), 201
    finally:
        conn.close()


# ──────────────────────────────────────
# AI FEEDBACK (Gemini)
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
# AI QUESTION GENERATION (Gemini) - UPDATED
# ──────────────────────────────────────

@revision_games_bp.route("/generate", methods=["POST"]) # Changed to /generate to match frontend
def ai_generate_questions():
    data = request.json
    
    # 1. Capture the new fields from your frontend
    game_topic = data.get("gameTopic", "General Knowledge")
    subject = data.get("subject", "General")
    description = data.get("description", "")
    
    print(f"Generating for Topic: {game_topic}, Subject: {subject}")

    # 2. Updated Prompt to return the EXACT JSON structure your React app needs
    prompt = f"""
    Create 3 preschool revision questions about "{game_topic}" specifically focusing on "{subject}".
    Context: {description}

    You must respond with a strict JSON array. Each object in the array must follow this structure:
    {{
        "gameTitle": "{game_topic}", 
        "questionText": "A simple question for a 4-year-old",
        "options": [
            {{ "label": "Option 1", "image": null }},
            {{ "label": "Option 2", "image": null }},
            {{ "label": "Option 3", "image": null }}
        ]
    }}
    
    Make the questions fun and educational. 
    Do not include markdown formatting (like ```json). Just the raw JSON.
    """

    try:
        # 3. Call the Gemini Client
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        
        # 4. Clean and Parse JSON
        clean_text = response.text.strip()
        if clean_text.startswith("```"):
            clean_text = clean_text.split("\n", 1)[1].rsplit("```", 1)[0]
            
        generated_data = json.loads(clean_text)
        
        # Return the array directly (frontend expects an array, not {questions: [...]})
        return jsonify(generated_data)

    except Exception as e:
        print(f"Gemini Error: {e}")
        return jsonify({"error": str(e)}), 500


# ──────────────────────────────────────
# SAVE AI-GENERATED QUESTIONS TO DB
# ──────────────────────────────────────

@revision_games_bp.route("/activities", methods=["POST"])
def save_activity():
    data = request.json
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                """INSERT INTO categories (name, description, icon_url, color)
                   VALUES (%s, %s, %s, %s) RETURNING id, name, description, icon_url, color""",
                (data["category_name"], data.get("description", ""), data.get("icon_url", ""), data.get("color", "bg-gray-100")),
            )
            cat = dict(cur.fetchone())

            for qd in data.get("questions", []):
                cur.execute(
                    """INSERT INTO questions (category_id, target_item, correct_answer)
                       VALUES (%s, %s, %s) RETURNING id""",
                    (cat["id"], qd["target_item"], qd["correct_answer"]),
                )
                q_id = cur.fetchone()["id"]

                for opt in qd.get("options", []):
                    cur.execute(
                        """INSERT INTO question_options (question_id, label, image_url)
                           VALUES (%s, %s, %s)""",
                        (q_id, opt["label"], opt.get("image_url", "")),
                    )

        conn.commit()
        return jsonify(cat), 201
    finally:
        conn.close()


# ──────────────────────────────────────
# GAME PROGRESS
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
                   RETURNING id, category_id, student_session, score, total_questions, completed_at""",
                (data["category_id"], data["student_session"], data["score"], data["total_questions"]),
            )
            progress = dict(cur.fetchone())
            progress["completed_at"] = progress["completed_at"].isoformat() if progress["completed_at"] else None
        conn.commit()
        return jsonify(progress), 201
    finally:
        conn.close()


@revision_games_bp.route("/progress/<string:session_id>", methods=["GET"])
def get_progress(session_id):
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                """SELECT id, category_id, student_session, score, total_questions, completed_at
                   FROM game_progress WHERE student_session = %s""",
                (session_id,),
            )
            rows = cur.fetchall()
            results = []
            for r in rows:
                d = dict(r)
                d["completed_at"] = d["completed_at"].isoformat() if d["completed_at"] else None
                results.append(d)
        return jsonify(results)
    finally:
        conn.close()


# ──────────────────────────────────────
# RECENT ACTIVITIES & PLAYS
# ──────────────────────────────────────

@revision_games_bp.route("/activities/recent", methods=["GET"])
def get_recent_activities():
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                """SELECT id, name, description, icon_url, color
                   FROM categories ORDER BY created_at DESC LIMIT 5"""
            )
            rows = [dict(r) for r in cur.fetchall()]
        return jsonify(rows)
    finally:
        conn.close()


@revision_games_bp.route("/progress/recent", methods=["GET"])
def get_recent_plays():
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                """SELECT gp.id, gp.category_id, gp.student_session, gp.score,
                          gp.total_questions, gp.completed_at, c.name AS category_name
                   FROM game_progress gp
                   JOIN categories c ON c.id = gp.category_id
                   ORDER BY gp.completed_at DESC LIMIT 5"""
            )
            rows = []
            for r in cur.fetchall():
                d = dict(r)
                d["completed_at"] = d["completed_at"].isoformat() if d["completed_at"] else None
                rows.append(d)
        return jsonify(rows)
    finally:
        conn.close()