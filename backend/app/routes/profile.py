from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User
from app import db

profile_bp = Blueprint("profile", __name__)


@profile_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()

    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify(user.to_dict()), 200


@profile_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()

    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()

    # Basic profile info
    user.name = data.get("name", user.name)
    user.phone = data.get("phone", user.phone)
    user.location = data.get("location", user.location)
    user.college = data.get("college", user.college)
    user.branch = data.get("branch", user.branch)
    user.year = data.get("year", user.year)

    # Social links
    user.linkedin = data.get("linkedin", user.linkedin)
    user.github = data.get("github", user.github)

    # Bio
    user.bio = data.get("bio", user.bio)

    # Profile photo (Base64 image from frontend)
    user.avatar = data.get("avatar", user.avatar)

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Profile updated successfully",
        "user": user.to_dict()
    }), 200