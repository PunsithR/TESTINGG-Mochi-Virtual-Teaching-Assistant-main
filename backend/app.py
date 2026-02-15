"""
Mochi Flask Backend
====================
Run:  python app.py
Seed: python seed.py
"""

from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from revisionGamesBackend import revision_config
from revisionGamesBackend.routes import revision_games_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app, origins=[Config.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000", "http://localhost:8080"])

    # Initialise Revision Games tables
    #revision_config.init_db()

    # Register Revision Games blueprint
    app.register_blueprint(revision_games_bp)

    # ──────────────────────────────────────
    # HEALTH CHECK
    # ──────────────────────────────────────

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok", "service": "mochi-backend"})

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
