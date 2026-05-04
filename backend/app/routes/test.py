# app/routes/test.py
from flask import Blueprint, jsonify

test_bp = Blueprint('test', __name__)

@test_bp.route('/', methods=['GET'])
def test_route():
    return jsonify({'message': 'Backend is running successfully! 🚀'})