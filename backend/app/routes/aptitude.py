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

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

aptitude_bp = Blueprint("aptitude", __name__)

CORS(aptitude_bp, origins=[
    "http://localhost:3000",
    "https://placement-pro-ashen.vercel.app"
], supports_credentials=True)

# === CONSTANTS MATCHING FRONTEND ===
EXPECTED_PRACTICE_QUESTION_COUNT = 15
EXPECTED_TEST_QUESTION_COUNT = 10
PASSING_SCORE = 8

# ✅ REST API only - no SDK
GEMINI_MODEL = "gemini-2.0-flash-lite"

# -------------------- JSON CLEANING --------------------
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

# -------------------- GEMINI CALL (REST ONLY) --------------------
def call_gemini(prompt):
    """REST API only - no SDK fallback"""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.error("GEMINI_API_KEY is missing!")
        return None, "Missing API key"

    logger.info(f"Model: {GEMINI_MODEL}, Key length: {len(api_key)}, Key prefix: {api_key[:8]}...")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={api_key}"

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 4096,
            "topP": 0.95,
            "topK": 40
        }
    }

    try:
        logger.info("Sending request to Gemini REST API...")
        response = requests.post(url, json=payload, timeout=60,
                                 headers={"Content-Type": "application/json"})

        logger.info(f"Gemini response status: {response.status_code}")

        if response.status_code != 200:
            logger.error(f"Gemini error body: {response.text[:1000]}")

        if response.status_code == 429:
            return None, "Quota exceeded. Please try again later."
        if response.status_code == 404:
            return None, f"Model '{GEMINI_MODEL}' not found."
        if response.status_code == 403:
            return None, "API key invalid or no permission."
        if response.status_code != 200:
            return None, f"API returned {response.status_code}: {response.text[:300]}"

        data = response.json()

        if 'candidates' not in data or len(data['candidates']) == 0:
            logger.error(f"No candidates: {data}")
            return None, "No candidates in response"

        candidate = data['candidates'][0]
        if 'content' not in candidate or 'parts' not in candidate['content']:
            logger.error(f"Bad candidate structure: {candidate}")
            return None, "Unexpected response structure"

        text = candidate['content']['parts'][0]['text']
        logger.debug(f"Raw response: {text[:500]}")

        json_text = extract_json_from_text(text)
        json_text = clean_json_string(json_text)

        try:
            result = json.loads(json_text)
            logger.info("Successfully parsed JSON")
            return result, None
        except json.JSONDecodeError as e:
            json_text = re.sub(r'[^\x20-\x7e]', '', json_text)
            json_text = re.sub(r',(\s*[}\]])', r'\1', json_text)
            try:
                return json.loads(json_text), None
            except json.JSONDecodeError as e2:
                logger.error(f"JSON parse failed: {e2}")
                return None, f"Invalid JSON: {str(e)}"

    except requests.exceptions.Timeout:
        return None, "Request timeout (60s)"
    except requests.exceptions.ConnectionError as e:
        return None, f"Connection error: {str(e)}"
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        return None, f"Unexpected error: {str(e)}"


# -------------------- DIAGNOSTIC --------------------
@aptitude_bp.route("/diagnose-gemini", methods=["GET"])
@jwt_required()
def diagnose_gemini():
    results = {"timestamp": time.time(), "model": GEMINI_MODEL, "tests": {}}

    api_key = os.getenv("GEMINI_API_KEY")
    results["api_key"] = "Present" if api_key else "MISSING"
    if api_key:
        results["api_key_length"] = len(api_key)
        results["api_key_preview"] = api_key[:8] + "..." + api_key[-4:]

    # DNS test
    try:
        ip = socket.gethostbyname('generativelanguage.googleapis.com')
        results['tests']['dns'] = {"status": "success", "ip": ip}
    except Exception as e:
        results['tests']['dns'] = {"status": "failed", "error": str(e)}

    # List available models
    if api_key:
        try:
            r = requests.get(
                f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}",
                timeout=10
            )
            if r.status_code == 200:
                models = r.json().get('models', [])
                model_names = [m['name'] for m in models
                               if 'generateContent' in m.get('supportedGenerationMethods', [])]
                results['tests']['available_models'] = {"status": "success", "models": model_names}
            else:
                results['tests']['available_models'] = {
                    "status": "failed", "code": r.status_code, "body": r.text[:300]
                }
        except Exception as e:
            results['tests']['available_models'] = {"status": "failed", "error": str(e)}

    # Generation test
    try:
        result, error = call_gemini('Return this exact JSON: {"test": "success"}')
        if result and result.get('test') == 'success':
            results['tests']['generation'] = {"status": "success"}
        else:
            results['tests']['generation'] = {"status": "failed", "error": error}
    except Exception as e:
        results['tests']['generation'] = {"status": "failed", "error": str(e)}

    return jsonify(results)


# -------------------- ROADMAP --------------------
@aptitude_bp.route("/roadmap", methods=["GET"])
@jwt_required()
def roadmap():
    user_id = int(get_jwt_identity())
    entry = UserRoadmap.query.filter_by(user_id=user_id).first()
    topics = entry.roadmap if entry else [
        "Time and Work", "Averages", "Ratio and Proportion",
        "Profit and Loss", "Data Interpretation"
    ]
    rows = UserProgress.query.filter_by(user_id=user_id).all()
    progress = {
        r.topic_name: {
            "completed_practice": r.completed_practice,
            "test_score": r.test_score,
            "completed": r.completed
        } for r in rows
    }
    default = {"completed_practice": False, "test_score": None, "completed": False}
    return jsonify({"topics": topics, "progress": {t: progress.get(t, default) for t in topics}})


# -------------------- VIDEO --------------------
@aptitude_bp.route("/topic/<topic>/video", methods=["GET"])
@jwt_required()
def get_video(topic):
    query = (topic + " aptitude tutorial").replace(" ", "+")
    return jsonify({"video_url": f"https://www.youtube.com/results?search_query={query}"})


# -------------------- PRACTICE --------------------
@aptitude_bp.route("/topic/<topic>/practice", methods=["GET"])
@jwt_required()
def practice(topic):
    saved = TopicPractice.query.filter_by(topic=topic).first()
    if saved:
        logger.info(f"Returning cached practice for: {topic}")
        return jsonify({"questions": saved.questions})

    logger.info(f"Generating practice questions for: {topic}")
    prompt = f"""Generate EXACTLY {EXPECTED_PRACTICE_QUESTION_COUNT} aptitude practice questions for the topic "{topic}".

Return a JSON object with a "questions" array containing {EXPECTED_PRACTICE_QUESTION_COUNT} objects.
Each object must have:
{{
  "question_text": "question here",
  "options": ["A. option1", "B. option2", "C. option3", "D. option4"],
  "correct_answer": "A",
  "solution": "detailed explanation"
}}

Rules: options start with A. B. C. D. | correct_answer is single letter | Return ONLY valid JSON"""

    data, err = call_gemini(prompt)
    if err:
        logger.error(f"Practice generation failed [{topic}]: {err}")
        return jsonify({"error": "Practice questions temporarily unavailable. Please try again in a moment."}), 503

    if not data or "questions" not in data:
        return jsonify({"error": "AI returned invalid format"}), 500

    questions = data["questions"]
    if not isinstance(questions, list) or len(questions) == 0:
        return jsonify({"error": "AI returned empty questions"}), 500

    logger.info(f"Got {len(questions)} practice questions for: {topic}")

    try:
        db.session.add(TopicPractice(topic=topic, questions=questions))
        db.session.commit()
    except Exception as e:
        logger.error(f"DB error: {e}")
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
        return jsonify({"error": "Complete practice first"}), 403

    saved = TopicTest.query.filter_by(topic=topic).first()
    if saved:
        logger.info(f"Returning cached test for: {topic}")
        return jsonify({"questions": saved.questions})

    logger.info(f"Generating test questions for: {topic}")
    prompt = f"""Generate EXACTLY {EXPECTED_TEST_QUESTION_COUNT} aptitude test questions for the topic "{topic}".

Return a JSON object with a "questions" array containing {EXPECTED_TEST_QUESTION_COUNT} objects.
Each object must have:
{{
  "question_text": "question here",
  "options": ["A. option1", "B. option2", "C. option3", "D. option4"],
  "correct_answer": "A"
}}

Rules: options start with A. B. C. D. | correct_answer is single letter | NO solutions | Return ONLY valid JSON"""

    data, err = call_gemini(prompt)
    if err:
        logger.error(f"Test generation failed [{topic}]: {err}")
        return jsonify({"error": "Test questions temporarily unavailable. Please try again in a moment."}), 503

    if not data or "questions" not in data:
        return jsonify({"error": "AI returned invalid format"}), 500

    questions = data["questions"]
    if not isinstance(questions, list) or len(questions) == 0:
        return jsonify({"error": "AI returned empty questions"}), 500

    logger.info(f"Got {len(questions)} test questions for: {topic}")

    try:
        db.session.add(TopicTest(topic=topic, questions=questions))
        db.session.commit()
    except Exception as e:
        logger.error(f"DB error: {e}")
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

    score = sum(
        1 for ans in answers
        if ans["question_index"] < len(questions)
        and ans["selected"] == questions[ans["question_index"]]["correct_answer"]
    )

    prog.test_score = score
    prog.completed = score >= PASSING_SCORE
    db.session.commit()

    return jsonify({"score": score, "passed": prog.completed, "required": PASSING_SCORE})
