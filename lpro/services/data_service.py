from flask import Blueprint, jsonify
import json
import database

data_bp = Blueprint('data_service', __name__)

@data_bp.route("/api/user", methods=["GET", "OPTIONS"])
def get_api_user():
    conn = database.get_db()
    user = conn.execute("SELECT * FROM users WHERE id='1'").fetchone()
    conn.close()
    if user:
        return jsonify(dict(user))
    return jsonify({"error": "User not found"}), 404

@data_bp.route("/api/research", methods=["GET", "OPTIONS"])
def get_api_research():
    conn = database.get_db()
    papers = conn.execute("SELECT * FROM research_papers").fetchall()
    conn.close()
    result = []
    for p in papers:
        d = dict(p)
        d['tags'] = json.loads(d['tags'])
        result.append(d)
    return jsonify(result)
