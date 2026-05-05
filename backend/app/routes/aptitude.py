import os
import json
import time
import logging
import re
import socket
import requests
from flask import Blueprint, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, UserProgress, UserRoadmap, TopicPractice, TopicTest
import google.generativeai as genai
from urllib3.util.connection import create_connection

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

aptitude_bp = Blueprint("aptitude", __name__)

# ✅ FIX 1: Added Vercel production URL to CORS origins
CORS(aptitude_bp, origins=[
    "http://localhost:3000",
    "https://placement-pro-ashen.vercel.app"
], supports_credentials=True)

# === CONSTANTS MATCHING FRONTEND ===
EXPECTED_PRACTICE_QUESTION_COUNT = 15
EXPECTED_TEST_QUESTION_COUNT = 10
PASSING_SCORE = 8

# ✅ FIX 2: Switched to gemini-1.5-flash (more generous free quota)
GEMINI_MODEL = "gemini-1.5-flash"
USE_REST_API = True

# Force IPv4 for all socket connections
def force_ipv4():
    """Force socket to use IPv4 only"""
    def allowed_gateways_family():
        return socket.AF_INET

    socket.create_connection = create_connection
    if hasattr(socket.create_connection, 'allowed_gateways_family'):
        socket.create_connection.allowed_gateways_family = allowed_gateways_family

force_ipv4()

# -------------------- JSON CLEANING FUNCTION --------------------
def clean_json_string(text):
    if not text:
        return text
    cleaned = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', '', text)
    cleaned = re.sub(r',\s*}', '}', cleaned)
    cleaned = re.sub(r',\s*\]', ']', cleaned)
    return cleaned

def extract_json_from_text(text):
    if not text:
        return None
    json_pattern = r'```(?:json)?\s*([\s\S]*?)\s*```'
    matches = re.findall(json_pattern, text)
    if matches:
        return matches[0].strip()
    start = text.find('{')
    end = text.rfind('}')
    if start != -1 and end != -1 and end > start:
        return text[start:end+1].strip()
    return text.strip()

# -------------------- GEMINI CALL (REST API VERSION) --------------------
def call_gemini_rest(prompt):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.error("Missing GEMINI_API_KEY environment variable")
        return None, "Missing API key"

    # ✅ FIX 3: URL now uses GEMINI_MODEL constant (was hardcoded to gemini-pro before)
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={api_key}"

    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 4096,
            "topP": 0.95,
            "topK": 40
        }
    }

    try:
        logger.info("Sending request to Gemini REST API...")
        session = requests.Session()
        response = session.post(
            url,
            json=payload,
            timeout=45,
            headers={"Content-Type": "application/json"}
        )

        logger.info(f"Gemini API response status: {response.status_code}")

        if response.status_code == 429:
            # ✅ FIX 4: Explicit handling for quota exceeded
            logger.error("Gemini quota exceeded (429)")
            return None, "Quota exceeded. Please try again later."

        if response.status_code != 200:
            error_msg = f"API returned {response.status_code}"
            try:
                error_detail = response.json()
                error_msg += f": {error_detail}"
            except:
                error_msg += f": {response.text[:200]}"
            logger.error(error_msg)
            return None, error_msg

        data = response.json()

        if 'candidates' in data and len(data['candidates']) > 0:
            candidate = data['candidates'][0]
            if 'content' in candidate and 'parts' in candidate['content']:
                text = candidate['content']['parts'][0]['text']
                logger.debug(f"Raw Gemini response: {text[:500]}...")

                json_text = extract_json_from_text(text)
                json_text = clean_json_string(json_text)

                try:
                    result = json.loads(json_text)
                    logger.info("Successfully parsed JSON response")
                    return result, None
                except json.JSONDecodeError as e:
                    logger.error(f"JSON parse error: {e}")
                    logger.error(f"Problematic JSON text: {json_text[:500]}")

                    json_text = re.sub(r'[^\x20-\x7e]', '', json_text)
                    json_text = re.sub(r',(\s*[}\]])', r'\1', json_text)

                    try:
                        result = json.loads(json_text)
                        return result, None
                    except json.JSONDecodeError as e2:
                        logger.error(f"Second JSON parse attempt failed: {e2}")
                        return None, f"Invalid JSON response: {str(e)}"

        return None, "No valid candidates in response"

    except requests.exceptions.Timeout:
        logger.error("Request timeout after 45 seconds")
        return None, "Request timeout"
    except requests.exceptions.ConnectionError as e:
        logger.error(f"Connection error: {e}")
        return None, f"Connection error: {str(e)}"
    except Exception as e:
        logger.error(f"REST API failed: {e}", exc_info=True)
        return None, f"REST API failed: {str(e)}"


# -------------------- GEMINI CALL (SDK VERSION) --------------------
def call_gemini_sdk(prompt):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None, "Missing API key"

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(GEMINI_MODEL)
        config = genai.types.GenerationConfig(
            response_mime_type="application/json",
            temperature=0.7,
            max_output_tokens=4096
        )

        r = model.generate_content(
            prompt,
            generation_config=config,
            request_options={"timeout": 45}
        )

        if not r or not r.text:
            return None, "Empty response from Gemini"

        txt = r.text.strip()
        logger.debug(f"Raw Gemini SDK output: {txt[:500]}...")

        json_text = extract_json_from_text(txt)
        json_text = clean_json_string(json_text)

        return json.loads(json_text), None

    except Exception as e:
        logger.error(f"GEMINI SDK ERROR: {type(e).__name__}: {str(e)}", exc_info=True)
        return None, f"Gemini SDK failed: {str(e)}"


# -------------------- MAIN GEMINI CALL (with fallback) --------------------
def call_gemini(prompt):
    if USE_REST_API:
        logger.info("Using REST API for Gemini...")
        result, error = call_gemini_rest(prompt)
        if result:
            return result, None
        logger.warning(f"REST API failed: {error}, trying SDK...")

    logger.info("Using SDK for Gemini...")
    return call_gemini_sdk(prompt)


# -------------------- DIAGNOSTIC ENDPOINT --------------------
@aptitude_bp.route("/diagnose-gemini", methods=["GET"])
@jwt_required()
def diagnose_gemini():
    results = {
        "timestamp": time.time(),
        "tests": {}
    }

    api_key = os.getenv("GEMINI_API_KEY")
    results["api_key"] = "Present" if api_key else "MISSING"
    if api_key:
        results["api_key_length"] = len(api_key)
        results["api_key_preview"] = api_key[:5] + "..." + api_key[-5:] if len(api_key) > 10 else "too_short"

    try:
        ip = socket.gethostbyname('generativelanguage.googleapis.com')
        results['tests']['dns_resolution'] = {"status": "success", "ip": ip}
    except Exception as e:
        results['tests']['dns_resolution'] = {"status": "failed", "error": str(e)}

    try:
        r = requests.get('https://generativelanguage.googleapis.com', timeout=5, allow_redirects=False)
        results['tests']['connectivity'] = {"status": "success", "status_code": r.status_code}
    except Exception as e:
        results['tests']['connectivity'] = {"status": "failed", "error": str(e)}

    if api_key:
        try:
            test_url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
            r = requests.get(test_url, timeout=5)
            if r.status_code == 200:
                results['tests']['api_key_validation'] = {"status": "success", "message": "API key is valid"}
            else:
                results['tests']['api_key_validation'] = {"status": "failed", "code": r.status_code, "message": r.text[:200]}
        except Exception as e:
            results['tests']['api_key_validation'] = {"status": "failed", "error": str(e)}

    try:
        test_prompt = """Generate a simple JSON with one key "test" set to "success". Return ONLY the JSON object, no other text."""
        result, error = call_gemini_rest(test_prompt)
        if result and result.get('test') == 'success':
            results['tests']['generation_test'] = {"status": "success", "message": "Successfully generated content"}
        else:
            results['tests']['generation_test'] = {"status": "failed", "error": error or "Invalid response"}
    except Exception as e:
        results['tests']['generation_test'] = {"status": "failed", "error": str(e)}

    return jsonify(results)


# -------------------- ROADMAP --------------------
@aptitude_bp.route("/roadmap", methods=["GET"])
@jwt_required()
def roadmap():
    user_id = int(get_jwt_identity())

    entry = UserRoadmap.query.filter_by(user_id=user_id).first()
    topics = entry.roadmap if entry else [
        "Time and Work",
        "Averages",
        "Ratio and Proportion",
        "Profit and Loss",
        "Data Interpretation"
    ]

    rows = UserProgress.query.filter_by(user_id=user_id).all()
    progress = {
        r.topic_name: {
            "completed_practice": r.completed_practice,
            "test_score": r.test_score,
            "completed": r.completed
        }
        for r in rows
    }

    default = {"completed_practice": False, "test_score": None, "completed": False}
    full = {t: progress.get(t, default) for t in topics}

    return jsonify({"topics": topics, "progress": full})


# -------------------- VIDEO --------------------
@aptitude_bp.route("/topic/<topic>/video", methods=["GET"])
@jwt_required()
def get_video(topic):
    query = (topic + " aptitude tutorial").replace(" ", "+")
    youtube_search_url = f"https://www.youtube.com/results?search_query={query}"
    return jsonify({"video_url": youtube_search_url})


# -------------------- PRACTICE --------------------
@aptitude_bp.route("/topic/<topic>/practice", methods=["GET"])
@jwt_required()
def practice(topic):
    saved = TopicPractice.query.filter_by(topic=topic).first()
    if saved:
        return jsonify({"questions": saved.questions})

    prompt = f"""Generate EXACTLY {EXPECTED_PRACTICE_QUESTION_COUNT} aptitude practice questions for the topic "{topic}".

Return a JSON object with a "questions" array containing {EXPECTED_PRACTICE_QUESTION_COUNT} objects.
Each question object must have this exact format:
{{
  "question_text": "the question text here",
  "options": [
    "A. first option",
    "B. second option",
    "C. third option",
    "D. fourth option"
  ],
  "correct_answer": "A",
  "solution": "detailed explanation of the solution"
}}

Important rules:
- Options MUST start with "A.", "B.", "C.", "D." (with the dot)
- correct_answer MUST be a single letter: "A", "B", "C", or "D"
- solution should be detailed and educational
- All questions must be unique and relevant to {topic}
- DO NOT include any text before or after the JSON
- The response must be valid JSON only

Return ONLY the JSON object, no other text or markdown formatting."""

    data, err = call_gemini(prompt)
    if err:
        logger.error(f"Gemini error: {err}")
        # ✅ FIX 5: User-friendly error message instead of raw Gemini error
        return jsonify({"error": "Practice questions temporarily unavailable. Please try again in a moment."}), 503

    if not data:
        return jsonify({"error": "AI returned no data"}), 500

    if "questions" not in data:
        logger.error(f"Invalid response format: {data}")
        return jsonify({"error": "AI returned invalid format - missing questions array"}), 500

    questions = data["questions"]
    if not isinstance(questions, list):
        return jsonify({"error": "AI returned invalid format - questions not an array"}), 500

    if len(questions) != EXPECTED_PRACTICE_QUESTION_COUNT:
        logger.warning(f"Got {len(questions)} questions, expected {EXPECTED_PRACTICE_QUESTION_COUNT}. Continuing anyway.")

    try:
        rec = TopicPractice(topic=topic, questions=questions)
        db.session.add(rec)
        db.session.commit()
    except Exception as e:
        logger.error(f"Database error: {e}")
        return jsonify({"error": "Failed to save questions"}), 500

    return jsonify({"questions": questions})


# -------------------- COMPLETE PRACTICE --------------------
@aptitude_bp.route("/topic/<topic>/complete-practice", methods=["POST"])
@jwt_required()
def complete_practice(topic):
    user_id = int(get_jwt_identity())
    prog = UserProgress.query.filter_by(user_id=user_id, topic_name=topic).first()

    if not prog:
        prog = UserProgress(user_id=user_id, topic_name=topic)

    prog.completed_practice = True
    db.session.add(prog)
    db.session.commit()

    return jsonify({"message": "Practice completed"})


# -------------------- TEST --------------------
@aptitude_bp.route("/topic/<topic>/test", methods=["GET"])
@jwt_required()
def test(topic):
    user_id = int(get_jwt_identity())
    prog = UserProgress.query.filter_by(user_id=user_id, topic_name=topic).first()

    if not prog or not prog.completed_practice:
        return jsonify({"error": "Practice first"}), 403

    saved = TopicTest.query.filter_by(topic=topic).first()
    if saved:
        return jsonify({"questions": saved.questions})

    prompt = f"""Generate EXACTLY {EXPECTED_TEST_QUESTION_COUNT} aptitude TEST questions for the topic "{topic}".

Return a JSON object with a "questions" array containing {EXPECTED_TEST_QUESTION_COUNT} objects.
Each question object must have this exact format:
{{
  "question_text": "the question text here",
  "options": [
    "A. first option",
    "B. second option",
    "C. third option",
    "D. fourth option"
  ],
  "correct_answer": "A"
}}

Important rules:
- Options MUST start with "A.", "B.", "C.", "D." (with the dot)
- correct_answer MUST be a single letter: "A", "B", "C", or "D"
- DO NOT include solutions in test questions
- All questions must be unique and relevant to {topic}
- DO NOT include any text before or after the JSON
- The response must be valid JSON only

Return ONLY the JSON object, no other text or markdown formatting."""

    data, err = call_gemini(prompt)
    if err:
        logger.error(f"Gemini error: {err}")
        return jsonify({"error": "Test questions temporarily unavailable. Please try again in a moment."}), 503

    if not data:
        return jsonify({"error": "AI returned no data"}), 500

    if "questions" not in data:
        logger.error(f"Invalid response format: {data}")
        return jsonify({"error": "AI returned invalid format - missing questions array"}), 500

    questions = data["questions"]
    if not isinstance(questions, list):
        return jsonify({"error": "AI returned invalid format - questions not an array"}), 500

    if len(questions) != EXPECTED_TEST_QUESTION_COUNT:
        logger.warning(f"Got {len(questions)} test questions, expected {EXPECTED_TEST_QUESTION_COUNT}. Continuing anyway.")

    try:
        rec = TopicTest(topic=topic, questions=questions)
        db.session.add(rec)
        db.session.commit()
    except Exception as e:
        logger.error(f"Database error: {e}")
        return jsonify({"error": "Failed to save test questions"}), 500

    return jsonify({"questions": questions})


# -------------------- SUBMIT TEST --------------------
@aptitude_bp.route("/topic/<topic>/submit-test", methods=["POST"])
@jwt_required()
def submit_test(topic):
    body = request.get_json()
    answers = body.get("answers", [])
    questions = body.get("questions", [])

    if not questions:
        return jsonify({"error": "No questions provided"}), 400

    user_id = int(get_jwt_identity())
    prog = UserProgress.query.filter_by(user_id=user_id, topic_name=topic).first()

    if not prog:
        return jsonify({"error": "Topic not found"}), 404

    score = 0
    for ans in answers:
        idx = ans["question_index"]
        sel = ans["selected"]
        if idx < len(questions) and sel == questions[idx]["correct_answer"]:
            score += 1

    prog.test_score = score
    prog.completed = score >= PASSING_SCORE
    db.session.commit()

    return jsonify({
        "score": score,
        "passed": prog.completed,
        "required": PASSING_SCORE
    })
