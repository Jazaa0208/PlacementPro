# app/routes/auth.py
from flask import Blueprint, request, jsonify
from app.models import db, User, BaselineScore
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    logger.debug(f"Register attempt: name={name}, email={email}")

    if not name or not email or not password:
        logger.error("Missing required fields")
        return jsonify({'error': 'All fields are required!'}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        logger.error(f"Email already registered: {email}")
        return jsonify({'error': 'Email already registered!'}), 400

    user = User(name=name, email=email)
    user.set_password(password)
    logger.debug(f"Password hash set for {email}: {user.password_hash}")
    db.session.add(user)
    db.session.commit()

    logger.info(f"User registered: {email}")
    return jsonify({'message': 'User registered successfully!'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    logger.debug(f"Login attempt: email={email}")

    user = User.query.filter_by(email=email).first()
    if user:
        logger.debug(f"User found: {email}, checking password")
        if user.check_password(password):
            # Convert user.id to string for JWT sub claim
            access_token = create_access_token(identity=str(user.id))
            logger.debug(f"Generated token for user {user.id}: {access_token}")
            has_taken_baseline = BaselineScore.query.filter_by(user_id=user.id).first() is not None
            logger.info(f"Login successful: {email}, has_taken_baseline={has_taken_baseline}")
            return jsonify({
                'message': 'Login successful!',
                'user': {'id': user.id, 'name': user.name, 'email': user.email, 'has_taken_baseline': has_taken_baseline},
                'access_token': access_token
            }), 200
        else:
            logger.error(f"Password check failed for {email}")
            return jsonify({'error': 'Invalid email or password!'}), 401
    else:
        logger.error(f"No user found for email: {email}")
        return jsonify({'error': 'Invalid email or password!'}), 401

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    try:
        current_user_id = get_jwt_identity()
        logger.debug(f"JWT Identity: {current_user_id}")
        # Convert JWT identity (string) back to int for database query
        user = User.query.get(int(current_user_id))
        if not user:
            logger.error(f"User ID {current_user_id} not found")
            return jsonify({'error': 'User not found'}), 404
        has_taken_baseline = BaselineScore.query.filter_by(user_id=user.id).first() is not None
        return jsonify({
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'has_taken_baseline': has_taken_baseline
        }), 200
    except Exception as e:
        logger.error(f"Error in /me endpoint: {str(e)}")
        return jsonify({'error': f'JWT validation failed: {str(e)}'}), 422