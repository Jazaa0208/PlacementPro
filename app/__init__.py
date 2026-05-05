from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from dotenv import load_dotenv
from config import Config
import os

# Initialize extensions
db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()


def create_app(config_class=Config):
    """Factory function to create and configure the Flask app"""

    load_dotenv()

    app = Flask(__name__)

    # Load config
    app.config.from_object(config_class)

    # Database config
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:shree11@localhost/placementpro_db"
    )

    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Secret keys
    app.config['SECRET_KEY'] = os.getenv("SECRET_KEY", "default_secret_key")
    app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY", "default_jwt_secret")

    # CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    # Import models
    from app import models

    # Import routes INSIDE create_app
    from app.routes.auth import auth_bp
    from app.routes.test import test_bp
    from app.routes.baseline import baseline_bp
    from app.routes.home import home_bp
    from app.routes.aptitude import aptitude_bp
    from app.routes.coding import coding_bp
    from app.routes.dashboard import dashboard_bp
    from app.routes.resume import resume_bp
    from app.routes.analysis import analysis_bp
    from app.routes.profile import profile_bp

    # Register blueprints
    app.register_blueprint(home_bp)
    app.register_blueprint(profile_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(test_bp, url_prefix='/api/test')
    app.register_blueprint(baseline_bp, url_prefix='/api/baseline')
    app.register_blueprint(coding_bp, url_prefix='/api/coding')
    app.register_blueprint(aptitude_bp, url_prefix='/api/aptitude')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(resume_bp, url_prefix='/api/resume')
    app.register_blueprint(analysis_bp, url_prefix='/api/analysis')

    @app.after_request
    def add_security_headers(response):
        """
        Fixes Content Security Policy (CSP) errors:
        - img-src: Allows Base64 profile photos (data:)
        - font-src: Allows Google Fonts and font data strings
        - style-src: Allows Google Fonts and inline React styles
        """
        # Ensure these lines are indented with 8 spaces total 
        # (4 for the function block, 4 for the content)
        csp_policy = (
            "default-src 'self'; "
            "img-src 'self' data:; "
            "font-src 'self' data: https://fonts.gstatic.com; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "connect-src 'self' http://localhost:5000 http://127.0.0.1:5000;"
        )
        response.headers['Content-Security-Policy'] = csp_policy
        return response

    @app.route('/')
    def home():
        return {
            "message": "NewPlacementPro API is running.",
            "status": "Success"
        }

    return app