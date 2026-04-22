import os
from flask import Flask, render_template, request, jsonify, send_file
import database

# Services Framework
from services.vision_service import vision_bp
from services.ai_service import ai_bp
from services.data_service import data_bp

app = Flask(__name__)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Data Boot
database.init_db()

# Pipeline Blueprints
app.register_blueprint(vision_bp)
app.register_blueprint(ai_bp)
app.register_blueprint(data_bp)

# Static Asset Routers
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/upload", methods=["POST"])
def upload():
    f = request.files.get("objfile")
    if not f: return jsonify({"error": "no file"}), 400
    safe = os.path.basename(f.filename)
    save_path = os.path.join(UPLOAD_DIR, safe)
    f.save(save_path)
    return jsonify({"path": safe})

@app.route("/uploads/<path:name>")
def serve_upload(name):
    full = os.path.join(UPLOAD_DIR, name)
    if not os.path.isfile(full): return "Not Found", 404
    return send_file(full)

if __name__ == "__main__":
    app.run(debug=False, use_reloader=False)