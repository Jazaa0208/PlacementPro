# app/routes/home.py
from flask import Blueprint, jsonify

# Define the blueprint for the home routes
home_bp = Blueprint("home", __name__)

@home_bp.route("/", methods=["GET"])
def home():
    """
    Provides a simple health check response for the root URL.
    """
    return jsonify({"status": "Success", "message": "NewPlacementPro API is running."})