import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key")

    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:root%40123@localhost:5432/placementpro_db"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", SECRET_KEY)

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=6)

    # Debug prints (optional)
    print("Configuration Loaded Successfully")
    print("Database URI:", SQLALCHEMY_DATABASE_URI)