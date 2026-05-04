import os
import json
import google.generativeai as genai

from datetime import datetime
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, BaselineScore, User, BaselineTest
from google.api_core.exceptions import GoogleAPIError as APIError


baseline_bp = Blueprint("baseline", __name__)

# Constants
GEMINI_MODEL = 'gemini-2.5-flash'  # Supported model for structured JSON output
EXPECTED_QUESTION_COUNT = 10

# ------------------------------------------------------------------
# Gemini API Integration
# ------------------------------------------------------------------

def call_gemini_api(prompt, json_mode=True):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None, "GEMINI_API_KEY is not set in environment."


    try:
        
        genai.configure(api_key=api_key)
        
        
        config = genai.types.GenerationConfig(
            response_mime_type="application/json" if json_mode else "text/plain"
        )
        model = genai.GenerativeModel(GEMINI_MODEL)
        response = model.generate_content(prompt, generation_config=config)
        
        if json_mode:
            json_string = response.text.strip()
            parsed_json = json.loads(json_string)
            return parsed_json, None
        else:
            return response.text.strip(), None
        
    except APIError as e:
        if "Unauthorized" in str(e):
            return None, "Authentication failed: Check your GEMINI_API_KEY."
        elif "RESOURCE_EXHAUSTED" in str(e) or "429" in str(e):
            return None, "Rate limit exceeded. Please try again in a few seconds."
        return None, f"Gemini API request failed: {e}"
    except json.JSONDecodeError as e:
        return None, "Invalid JSON structure from AI"
    except Exception as e:
        return None, f"An unexpected error occurred: {e}"

# --- Fetch Baseline Questions ---
@baseline_bp.route("/questions", methods=["GET"])
@jwt_required()
def get_baseline_questions():
    """
    Fetch 10 aptitude questions dynamically from Gemini if not already generated for the user.
    Returns JSON array of questions without correct answers.
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Check if already completed
    if BaselineScore.query.filter_by(user_id=user_id).first():
        return jsonify({"error": "You have already completed the baseline test"}), 403

    # Check for pending test
    pending = BaselineTest.query.filter_by(user_id=user_id).first()
    if pending:
        questions = pending.questions
    else:
        prompt = f"""
        Generate exactly {EXPECTED_QUESTION_COUNT} multiple-choice aptitude questions in JSON format.
        The JSON MUST be a dictionary with one key: "questions", which is a list of {EXPECTED_QUESTION_COUNT} question objects.
        Each question object MUST have:
        - question_text: string
        - options: object with keys A, B, C, D and string values
        - correct_answer: string ("A", "B", "C", or "D")
        Topics: Quantitative, Logical, and Verbal reasoning.
        Ensure all string values are properly escaped and the JSON is valid.
        """

        parsed, error = call_gemini_api(prompt)
        if error:
            print(f"[ERROR] Failed to generate questions: {error}")
            status_code = 500
            if "Authentication failed" in error:
                status_code = 401
            return jsonify({"error": error}), status_code

        questions = parsed.get("questions", [])
        if len(questions) != EXPECTED_QUESTION_COUNT:
            print(f"[ERROR] Invalid number of questions generated. Got {len(questions)}, expected {EXPECTED_QUESTION_COUNT}.")
            return jsonify({"error": f"Failed to generate the correct number of questions. Got {len(questions)}, expected {EXPECTED_QUESTION_COUNT}."}), 500

        # Save pending test
        pending = BaselineTest(user_id=user_id, questions=questions)
        db.session.add(pending)
        db.session.commit()

    # Prepare client-facing questions (without correct_answer)
    client_questions = [
        {"question_text": q["question_text"], "options": q["options"]}
        for q in questions
    ]

    return jsonify({"questions": client_questions})

# --- Submit Baseline Answers ---
@baseline_bp.route("/submit", methods=["POST"])
@jwt_required()
def submit_baseline():
    """
    Accepts answers, calculates score using stored correct answers, and saves to DB.
    Requires JWT token.
    """
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({"error": "Invalid or missing JWT token"}), 401

        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": f"User ID {user_id} not found"}), 404

        existing_score = BaselineScore.query.filter_by(user_id=user_id).first()
        if existing_score:
            return jsonify({"error": "You have already submitted the baseline test"}), 403

        pending = BaselineTest.query.filter_by(user_id=user_id).first()
        if not pending:
            return jsonify({"error": "No pending baseline test found. Please fetch questions first."}), 404

        data = request.get_json()
        answers = data.get("answers")
        if not answers or not isinstance(answers, list):
            return jsonify({"error": "No answers or invalid format"}), 400

        if len(answers) != len(pending.questions):
            return jsonify({"error": "Number of answers does not match number of questions"}), 400

        score = 0
        for i, ans in enumerate(answers):
            if ans.get("selected") == pending.questions[i]["correct_answer"]:
                score += 1

        baseline_score = BaselineScore(
            user_id=user.id,
            score=score,
            timestamp=datetime.utcnow()
        )
        db.session.add(baseline_score)
        db.session.delete(pending)  # Clean up pending test
        db.session.commit()

        print(f"[INFO] Baseline score saved for user_id={user.id}: {score}/{len(pending.questions)} correct.")

        return jsonify({
            "message": "Baseline score saved successfully",
            "score": score,
            "total_questions": len(pending.questions)
        })

    except Exception as e:
        db.session.rollback()
        print(f"[ERROR] Error submitting baseline: {type(e).__name__}: {str(e)}")
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500