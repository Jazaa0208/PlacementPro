from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

analysis_bp = Blueprint('analysis', __name__)

@analysis_bp.route('/history', methods=['GET'])
@jwt_required()
def get_analysis_history():
    """Get user's analysis history"""
    try:
        # Sample analysis history data
        history = [
            {
                "id": 1,
                "date": "2026-03-15",
                "type": "Resume Analysis",
                "score": 85,
                "role": "Software Engineer"
            },
            {
                "id": 2,
                "date": "2026-03-14",
                "type": "Coding Assessment",
                "score": 92,
                "role": "Full Stack Developer"
            }
        ]
        return jsonify(history)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@analysis_bp.route('/trends', methods=['GET'])
@jwt_required()
def get_skill_trends():
    """Get skill trends data"""
    try:
        trends = {
            "top_skills": [
                {"name": "Python", "demand": 95},
                {"name": "React", "demand": 92},
                {"name": "JavaScript", "demand": 90},
                {"name": "Node.js", "demand": 87},
                {"name": "SQL", "demand": 85}
            ],
            "trending": [
                {"skill": "AI/ML", "growth": "+45%"},
                {"skill": "Cloud Computing", "growth": "+38%"},
                {"skill": "DevOps", "growth": "+32%"}
            ],
            "salary_trends": {
                "entry_level": "₹6-8 LPA",
                "mid_level": "₹12-18 LPA",
                "senior_level": "₹25-40 LPA"
            }
        }
        return jsonify(trends)
    except Exception as e:
        return jsonify({"error": str(e)}), 500