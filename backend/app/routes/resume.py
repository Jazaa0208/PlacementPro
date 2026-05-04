from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User, db
import json
import requests
import os
from datetime import datetime
from config import Config

resume_bp = Blueprint('resume', __name__)

RESUME_TEMPLATES = [
    {
        "id": "modern",
        "name": "Modern Pro",
        "desc": "Clean two-column layout, ideal for tech roles",
        "accent": "#6366f1",
        "preview": "bg-gradient-to-br from-indigo-500 to-purple-600",
        "tag": "Most Popular",
        "tagColor": "from-yellow-400 to-orange-500"
    },
    {
        "id": "minimal",
        "name": "Minimal Elite",
        "desc": "Single-column, crisp and ATS-friendly",
        "accent": "#10b981",
        "preview": "bg-gradient-to-br from-emerald-500 to-teal-600",
        "tag": "ATS Optimized",
        "tagColor": "from-green-400 to-emerald-500"
    },
    {
        "id": "bold",
        "name": "Bold Impact",
        "desc": "Dark header, strong presence for leadership roles",
        "accent": "#f59e0b",
        "preview": "bg-gradient-to-br from-amber-500 to-orange-600",
        "tag": "Leadership",
        "tagColor": "from-orange-400 to-red-500"
    },
    {
        "id": "creative",
        "name": "Creative Edge",
        "desc": "Sidebar accent, perfect for design & product roles",
        "accent": "#ec4899",
        "preview": "bg-gradient-to-br from-pink-500 to-rose-600",
        "tag": "Creative",
        "tagColor": "from-pink-400 to-purple-500"
    }
]


@resume_bp.route('/templates', methods=['GET'])
def get_templates():
    return jsonify(RESUME_TEMPLATES)


@resume_bp.route('/save', methods=['POST'])
@jwt_required()
def save_resume():
    try:
        user_id = get_jwt_identity()
        data = request.json
        return jsonify({"message": "Resume saved successfully", "data": data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@resume_bp.route('/analyze', methods=['POST'])
@jwt_required()
def analyze_resume():
    """Analyze resume for ATS score using Gemini API"""
    try:
        data = request.json
        resume_data = data.get('resumeData', {})
        job_role = data.get('jobRole', '')
        job_desc = data.get('jobDesc', '')

        gemini_api_key = Config.GEMINI_API_KEY

        if not gemini_api_key:
            return jsonify(get_mock_ats_score(job_role)), 200

        resume_text = json.dumps(resume_data, indent=2)

        prompt = f"""You are an expert ATS (Applicant Tracking System) evaluator and career coach.
Evaluate the following resume {f'for the role: "{job_role}"' if job_role else 'for a general technical role'} {f'with this job description:\n{job_desc}' if job_desc else ''}.

Resume data:
{resume_text}

Return ONLY a JSON object with this exact structure:
{{
  "score": <integer 0-100>,
  "breakdown": {{
    "keywords_match": <integer 0-100>,
    "format_quality": <integer 0-100>,
    "experience_relevance": <integer 0-100>,
    "skills_alignment": <integer 0-100>,
    "completeness": <integer 0-100>,
    "achievements_impact": <integer 0-100>
  }},
  "suggestions": [
    "<actionable suggestion 1>",
    "<actionable suggestion 2>",
    "<actionable suggestion 3>",
    "<actionable suggestion 4>",
    "<actionable suggestion 5>"
  ]
}}
Return ONLY valid JSON. No extra text, no markdown formatting, no code blocks."""

        # ── FIX: use gemini-2.5-flash (same model as aptitude.py) ──
        response = requests.post(
            f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={gemini_api_key}',
            json={
                "contents": [{"parts": [{"text": prompt}]}]
            },
            headers={'Content-Type': 'application/json'},
            timeout=30
        )

        if response.status_code != 200:
            print(f"Gemini API error: {response.status_code} - {response.text}")
            return jsonify(get_mock_ats_score(job_role)), 200

        result = response.json()

        candidates = result.get('candidates', [])
        if not candidates:
            return jsonify(get_mock_ats_score(job_role)), 200

        text = candidates[0].get('content', {}).get('parts', [{}])[0].get('text', '')
        text = text.replace('```json', '').replace('```', '').strip()

        try:
            ats_result = json.loads(text)
            return jsonify(ats_result), 200
        except json.JSONDecodeError as e:
            print(f"JSON parse error: {e} | Raw text: {text}")
            return jsonify(get_mock_ats_score(job_role)), 200

    except requests.exceptions.RequestException as e:
        print(f"Request error: {str(e)}")
        return jsonify(get_mock_ats_score(job_role)), 200
    except Exception as e:
        print(f"Error in analyze_resume: {str(e)}")
        return jsonify(get_mock_ats_score(job_role)), 200


def get_mock_ats_score(job_role=""):
    """Return mock ATS score as fallback"""
    score = {
        "score": 75,
        "breakdown": {
            "keywords_match": 70,
            "format_quality": 85,
            "experience_relevance": 72,
            "skills_alignment": 68,
            "completeness": 80,
            "achievements_impact": 75
        },
        "suggestions": [
            "Add more quantifiable achievements with numbers and percentages",
            "Include relevant keywords from the job description",
            "Strengthen your summary section with years of experience",
            "Add more technical skills relevant to the role",
            "Consider adding links to your portfolio or GitHub projects"
        ]
    }
    role = job_role.lower()
    if "software" in role or "developer" in role:
        score["suggestions"] = [
            "Add more technical projects with specific technologies used",
            "Include specific programming languages and frameworks",
            "Quantify your impact (e.g. 'Improved performance by 40%')",
            "Add links to GitHub repositories or live demos",
            "Highlight relevant coding competitions and hackathons"
        ]
    elif "data" in role:
        score["suggestions"] = [
            "Highlight specific data analysis tools (Python, R, SQL)",
            "Include specific ML/AI projects with results",
            "Add statistical analysis experience with real examples",
            "Mention data visualization skills (Tableau, Power BI)",
            "Include SQL proficiency with complex query examples"
        ]
    elif "frontend" in role or "ui" in role:
        score["suggestions"] = [
            "Include specific frontend frameworks (React, Vue, Angular)",
            "Add links to deployed applications or portfolios",
            "Highlight responsive design and accessibility experience",
            "Mention CSS frameworks and preprocessors",
            "Include UI/UX design tool knowledge (Figma, Adobe XD)"
        ]
    return score


@resume_bp.route('/history', methods=['GET'])
@jwt_required()
def get_resume_history():
    try:
        user_id = get_jwt_identity()
        return jsonify([])
    except Exception as e:
        return jsonify({"error": str(e)}), 500