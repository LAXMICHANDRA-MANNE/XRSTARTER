from flask import Blueprint, request, jsonify
import json
import urllib.request
from config import Config

ai_bp = Blueprint('ai_service', __name__)

@ai_bp.route("/api/analyze", methods=["POST", "OPTIONS"])
def api_analyze():
    data = request.json
    base64_img = data.get('image', '').split(',')[-1]
    object_name = data.get('object', 'Unknown 3D Model')
    
    prompt = f"Act as Irma, a professional AI learning assistant inside an XR simulator. You are looking at a screenshot of the user's XR simulation monitor natively rendering a 3D model called \"{object_name}\". Completely ignore the background GUI elements and focus exclusively on the 3D model in the center. Analyze this 3D model structurally and provide an insightful 2-sentence educational diagnostic of its components or nature based precisely on what you see in the provided image."
    
    if not Config.GEMINI_API_KEY:
        return jsonify({"analysis": f"[MOCK IRMA]: This appears to be a high-fidelity model of {object_name}. Its structural integrity suggests a complex internal architecture typical of advanced spatial assets."})

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={Config.GEMINI_API_KEY}"
    
    payload = {
        "contents": [{
            "parts": [
                {"text": prompt},
                {"inlineData": { "mimeType": "image/jpeg", "data": base64_img }}
            ]
        }],
        "generationConfig": { "maxOutputTokens": 200 }
    }
    
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='POST')
    
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode())
            text = res_data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', 'No response')
            return jsonify({"analysis": text})
    except Exception as e:
        print("Gemini API Error:", e)
        return jsonify({"error": str(e)}), 500
