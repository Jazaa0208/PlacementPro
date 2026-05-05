from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app import db


# -------------------------------------------------
# USER MODEL
# -------------------------------------------------
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    has_taken_baseline = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Profile fields
    phone = db.Column(db.String(20), nullable=True)
    location = db.Column(db.String(200), nullable=True)
    college = db.Column(db.String(200), nullable=True)
    branch = db.Column(db.String(100), nullable=True)
    year = db.Column(db.String(50), nullable=True)
    linkedin = db.Column(db.String(200), nullable=True)
    github = db.Column(db.String(200), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    avatar = db.Column(db.Text, nullable=True)

    # Relationships
    progress = db.relationship('UserProgress', backref='user', lazy=True)
    stats = db.relationship('UserStats', backref='user', lazy=True)
    baseline_scores = db.relationship('BaselineScore', backref='user', lazy=True)
    baseline_tests = db.relationship('BaselineTest', backref='user', lazy=True)
    roadmaps = db.relationship('UserRoadmap', backref='user', lazy=True)

    # Methods
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "location": self.location,
            "college": self.college,
            "branch": self.branch,
            "year": self.year,
            "linkedin": self.linkedin,
            "github": self.github,
            "avatar": self.avatar,
            "bio": self.bio,
            "has_taken_baseline": self.has_taken_baseline,
            "created_at": self.created_at.isoformat()
        }


# -------------------------------------------------
# BASELINE SCORE MODEL
# -------------------------------------------------
class BaselineScore(db.Model):
    __tablename__ = 'baseline_scores'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "score": self.score,
            "timestamp": self.timestamp.isoformat()
        }


# -------------------------------------------------
# BASELINE TEST MODEL
# -------------------------------------------------
class BaselineTest(db.Model):
    __tablename__ = 'baseline_tests'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    questions = db.Column(db.JSON, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "questions": self.questions,
            "created_at": self.created_at.isoformat()
        }


# -------------------------------------------------
# USER ROADMAP MODEL
# -------------------------------------------------
class UserRoadmap(db.Model):
    __tablename__ = 'user_roadmaps'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    roadmap = db.Column(db.JSON, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "roadmap": self.roadmap
        }


# -------------------------------------------------
# USER PROGRESS MODEL
# -------------------------------------------------
class UserProgress(db.Model):
    __tablename__ = 'user_progress'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    topic_name = db.Column(db.String(100), nullable=False)
    completed_practice = db.Column(db.Boolean, default=False)
    test_score = db.Column(db.Integer, default=0)
    completed = db.Column(db.Boolean, default=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)
    video_embed_url = db.Column(db.String(300), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "topic_name": self.topic_name,
            "completed_practice": self.completed_practice,
            "test_score": self.test_score,
            "completed": self.completed,
            "updated_at": self.updated_at.isoformat(),
            "video_embed_url": self.video_embed_url
        }


# -------------------------------------------------
# USER CODING PROGRESS MODEL
# -------------------------------------------------
class UserCodingProgress(db.Model):
    __tablename__ = 'user_coding_progress'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    topic = db.Column(db.String(100), nullable=False)
    completed_practice = db.Column(db.Boolean, default=False)
    test_score = db.Column(db.Integer, default=0)
    completed = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "topic": self.topic,
            "completed_practice": self.completed_practice,
            "test_score": self.test_score,
            "completed": self.completed
        }


# -------------------------------------------------
# TOPIC PRACTICE MODEL
# -------------------------------------------------
class TopicPractice(db.Model):
    __tablename__ = "topic_practice"

    id = db.Column(db.Integer, primary_key=True)
    topic = db.Column(db.String(100), unique=True, nullable=False, index=True)
    questions = db.Column(db.JSON, nullable=False)
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "topic": self.topic,
            "questions": self.questions
        }


# -------------------------------------------------
# TOPIC TEST MODEL
# -------------------------------------------------
class TopicTest(db.Model):
    __tablename__ = "topic_test"

    id = db.Column(db.Integer, primary_key=True)
    topic = db.Column(db.String(100), unique=True, nullable=False, index=True)
    questions = db.Column(db.JSON, nullable=False)
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "topic": self.topic,
            "questions": self.questions
        }


# -------------------------------------------------
# USER STATS MODEL
# -------------------------------------------------
class UserStats(db.Model):
    __tablename__ = 'user_stats'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    problems_solved = db.Column(db.Integer, default=0)
    current_streak = db.Column(db.Integer, default=0)
    avg_score = db.Column(db.Float, default=0)
    total_placements = db.Column(db.Integer, default=0)
    companies_applied = db.Column(db.Integer, default=0)
    avg_package = db.Column(db.Float, default=0)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "problems_solved": self.problems_solved,
            "current_streak": self.current_streak,
            "avg_score": self.avg_score,
            "total_placements": self.total_placements,
            "companies_applied": self.companies_applied,
            "avg_package": self.avg_package
        }