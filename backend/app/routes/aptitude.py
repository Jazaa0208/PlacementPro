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
CORS(aptitude_bp, origins=["http://localhost:3000"], supports_credentials=True)

# === CONSTANTS MATCHING FRONTEND ===
EXPECTED_PRACTICE_QUESTION_COUNT = 15
EXPECTED_TEST_QUESTION_COUNT = 10
PASSING_SCORE = 8
GEMINI_MODEL = "gemini-2.0-flash"  # Using more stable model
USE_REST_API = True  # Set to True to use REST API (more reliable)

# Force IPv4 for all socket connections
def force_ipv4():
    """Force socket to use IPv4 only"""
    def allowed_gateways_family():
        return socket.AF_INET
    
    # Monkey patch to prefer IPv4
    socket.create_connection = create_connection
    if hasattr(socket.create_connection, 'allowed_gateways_family'):
        socket.create_connection.allowed_gateways_family = allowed_gateways_family

# Apply IPv4 forcing
force_ipv4()

# -------------------- JSON CLEANING FUNCTION --------------------
def clean_json_string(text):
    """Clean JSON string by removing invalid control characters"""
    if not text:
        return text
    
    # Remove any control characters except \n, \r, \t
    # This regex keeps only printable characters and common escapes
    cleaned = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', '', text)
    
    # Fix common JSON issues
    cleaned = re.sub(r',\s*}', '}', cleaned)  # Remove trailing commas
    cleaned = re.sub(r',\s*\]', ']', cleaned)  # Remove trailing commas in arrays
    
    return cleaned

def extract_json_from_text(text):
    """Extract JSON object from text that might contain markdown or extra content"""
    if not text:
        return None
    
    # Try to find JSON between ```json and ``` markers
    json_pattern = r'```(?:json)?\s*([\s\S]*?)\s*```'
    matches = re.findall(json_pattern, text)
    
    if matches:
        # Use the first JSON block found
        return matches[0].strip()
    
    # If no markdown blocks, try to find anything that looks like a JSON object
    # Find the first { and last }
    start = text.find('{')
    end = text.rfind('}')
    
    if start != -1 and end != -1 and end > start:
        return text[start:end+1].strip()
    
    return text.strip()

# -------------------- GEMINI CALL (REST API VERSION) --------------------
def call_gemini_rest(prompt):
    """REST API-based Gemini call (more reliable with network issues)"""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.error("Missing GEMINI_API_KEY environment variable")
        return None, "Missing API key"
    
    # Using gemini-pro for REST API
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={api_key}"    
    # Format prompt for REST API
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
        
        # Use requests with timeout and IPv4 preference
        session = requests.Session()
        
        response = session.post(
            url,
            json=payload,
            timeout=45,  # Increased timeout
            headers={"Content-Type": "application/json"}
        )
        
        logger.info(f"Gemini API response status: {response.status_code}")
        
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
        
        # Extract text from response
        if 'candidates' in data and len(data['candidates']) > 0:
            candidate = data['candidates'][0]
            if 'content' in candidate and 'parts' in candidate['content']:
                text = candidate['content']['parts'][0]['text']
                
                # Log raw response for debugging
                logger.debug(f"Raw Gemini response: {text[:500]}...")
                
                # Extract JSON from the response
                json_text = extract_json_from_text(text)
                
                # Clean the JSON string
                json_text = clean_json_string(json_text)
                
                try:
                    result = json.loads(json_text)
                    logger.info("Successfully parsed JSON response")
                    return result, None
                except json.JSONDecodeError as e:
                    logger.error(f"JSON parse error: {e}")
                    logger.error(f"Problematic JSON text: {json_text[:500]}")
                    
                    # Try one more time with aggressive cleaning
                    # Remove everything except what looks like JSON structure
                    json_text = re.sub(r'[^\x20-\x7e]', '', json_text)  # Keep only printable ASCII
                    json_text = re.sub(r',(\s*[}\]])', r'\1', json_text)  # Remove trailing commas
                    
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
    """Original SDK-based Gemini call with better error handling"""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None, "Missing API key"

    try:
        # Configure with timeout and IPv4 preference
        genai.configure(api_key=api_key)
        
        model = genai.GenerativeModel(GEMINI_MODEL)
        config = genai.types.GenerationConfig(
            response_mime_type="application/json",
            temperature=0.7,
            max_output_tokens=4096
        )

        # Add timeout to the request
        r = model.generate_content(
            prompt, 
            generation_config=config,
            request_options={"timeout": 45}
        )
        
        if not r or not r.text:
            return None, "Empty response from Gemini"
            
        txt = r.text.strip()

        logger.debug(f"Raw Gemini SDK output: {txt[:500]}...")

        # Extract and clean JSON
        json_text = extract_json_from_text(txt)
        json_text = clean_json_string(json_text)

        return json.loads(json_text), None

    except Exception as e:
        logger.error(f"GEMINI SDK ERROR: {type(e).__name__}: {str(e)}", exc_info=True)
        return None, f"Gemini SDK failed: {str(e)}"


# -------------------- MAIN GEMINI CALL (with fallback) --------------------
def call_gemini(prompt):
    """Main Gemini call function with multiple fallback options"""
    
    # Try REST API first if enabled
    if USE_REST_API:
        logger.info("Using REST API for Gemini...")
        result, error = call_gemini_rest(prompt)
        if result:
            return result, None
        logger.warning(f"REST API failed: {error}, trying SDK...")
    
    # Fall back to SDK
    logger.info("Using SDK for Gemini...")
    return call_gemini_sdk(prompt)


# -------------------- DIAGNOSTIC ENDPOINT --------------------
@aptitude_bp.route("/diagnose-gemini", methods=["GET"])
@jwt_required()
def diagnose_gemini():
    """Test connectivity to Gemini API"""
    results = {
        "timestamp": time.time(),
        "tests": {}
    }
    
    api_key = os.getenv("GEMINI_API_KEY")
    results["api_key"] = "Present" if api_key else "MISSING"
    if api_key:
        results["api_key_length"] = len(api_key)
        results["api_key_preview"] = api_key[:5] + "..." + api_key[-5:] if len(api_key) > 10 else "too_short"
    
    # Test 1: DNS resolution
    try:
        ip = socket.gethostbyname('generativelanguage.googleapis.com')
        results['tests']['dns_resolution'] = {
            "status": "success",
            "ip": ip,
            "ip_version": "IPv4"
        }
    except Exception as e:
        results['tests']['dns_resolution'] = {
            "status": "failed",
            "error": str(e)
        }
    
    # Test 2: Basic connectivity
    try:
        r = requests.get(
            'https://generativelanguage.googleapis.com',
            timeout=5,
            allow_redirects=False
        )
        results['tests']['connectivity'] = {
            "status": "success",
            "status_code": r.status_code
        }
    except Exception as e:
        results['tests']['connectivity'] = {
            "status": "failed",
            "error": str(e)
        }
    
    # Test 3: API key validation
    if api_key:
        try:
            test_url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
            r = requests.get(test_url, timeout=5)
            if r.status_code == 200:
                results['tests']['api_key_validation'] = {
                    "status": "success",
                    "message": "API key is valid"
                }
            else:
                results['tests']['api_key_validation'] = {
                    "status": "failed",
                    "code": r.status_code,
                    "message": r.text[:200]
                }
        except Exception as e:
            results['tests']['api_key_validation'] = {
                "status": "failed",
                "error": str(e)
            }
    
    # Test 4: Try a simple generation
    try:
        test_prompt = """Generate a simple JSON with one key "test" set to "success". Return ONLY the JSON object, no other text."""
        result, error = call_gemini_rest(test_prompt)
        if result and result.get('test') == 'success':
            results['tests']['generation_test'] = {
                "status": "success",
                "message": "Successfully generated content"
            }
        else:
            results['tests']['generation_test'] = {
                "status": "failed",
                "error": error or "Invalid response"
            }
    except Exception as e:
        results['tests']['generation_test'] = {
            "status": "failed",
            "error": str(e)
        }
    
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

    # Improved prompt for better JSON formatting
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
        return jsonify({"error": f"AI failed to generate practice questions: {err}"}), 500
    
    if not data:
        logger.error("No data returned from Gemini")
        return jsonify({"error": "AI returned no data"}), 500
    
    if "questions" not in data:
        logger.error(f"Invalid response format - missing 'questions' key: {data}")
        return jsonify({"error": "AI returned invalid format - missing questions array"}), 500

    questions = data["questions"]
    if not isinstance(questions, list):
        logger.error(f"Questions is not a list: {type(questions)}")
        return jsonify({"error": "AI returned invalid format - questions not an array"}), 500

    if len(questions) != EXPECTED_PRACTICE_QUESTION_COUNT:
        logger.error(f"Wrong question count: got {len(questions)}, expected {EXPECTED_PRACTICE_QUESTION_COUNT}")
        # Don't fail, just log and continue with what we have
        logger.warning(f"Continuing with {len(questions)} questions")

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

    # Improved test prompt
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
        return jsonify({"error": f"AI failed to generate test: {err}"}), 500
    
    if not data:
        logger.error("No data returned from Gemini")
        return jsonify({"error": "AI returned no data"}), 500
    
    if "questions" not in data:
        logger.error(f"Invalid response format - missing 'questions' key: {data}")
        return jsonify({"error": "AI returned invalid format - missing questions array"}), 500

    questions = data["questions"]
    if not isinstance(questions, list):
        logger.error(f"Questions is not a list: {type(questions)}")
        return jsonify({"error": "AI returned invalid format - questions not an array"}), 500

    if len(questions) != EXPECTED_TEST_QUESTION_COUNT:
        logger.error(f"Wrong question count: got {len(questions)}, expected {EXPECTED_TEST_QUESTION_COUNT}")
        # Don't fail, just log and continue with what we have
        logger.warning(f"Continuing with {len(questions)} test questions")

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
