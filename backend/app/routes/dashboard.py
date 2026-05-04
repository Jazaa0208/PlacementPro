from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, User, UserProgress, UserStats
from datetime import datetime

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/api/dashboard/data', methods=['GET'])
@jwt_required()
def get_dashboard_data():
    try:
        user_id = get_jwt_identity()
        
        # User basic info
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Progress stats
        progress_records = UserProgress.query.filter_by(user_id=user_id).all()
        completed_topics = [p for p in progress_records if p.completed]
        
        # User stats
        stats = UserStats.query.filter_by(user_id=user_id).first()
        if not stats:
            # Create default stats if not exists
            stats = UserStats(user_id=user_id)
            db.session.add(stats)
            db.session.commit()
        
        return jsonify({
            'user': {
                'name': user.name,
                'email': user.email,
                'has_taken_baseline': user.has_taken_baseline
            },
            'progress': {
                'completed_topics': len(completed_topics),
                'total_topics': len(progress_records),
                'completion_percentage': round((len(completed_topics)/len(progress_records))*100) if progress_records else 0
            },
            'stats': {
                'problems_solved': stats.problems_solved,
                'current_streak': stats.current_streak,
                'avg_score': float(stats.avg_score),
                'placements': stats.total_placements,
                'companies': stats.companies_applied,
                'avg_package': float(stats.avg_package)
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/api/progress/update', methods=['POST'])
@jwt_required()
def update_progress():
    try:
        user_id = get_jwt_identity()
        data = request.json
        
        progress = UserProgress.query.filter_by(
            user_id=user_id, 
            topic_name=data['topic_name']
        ).first()
        
        if progress:
            progress.completed_practice = data.get('completed_practice', progress.completed_practice)
            progress.test_score = data.get('test_score', progress.test_score)
            progress.completed = data.get('completed', progress.completed)
            progress.updated_at = datetime.utcnow()
        else:
            progress = UserProgress(
                user_id=user_id,
                topic_name=data['topic_name'],
                completed_practice=data.get('completed_practice', False),
                test_score=data.get('test_score'),
                completed=data.get('completed', False)
            )
            db.session.add(progress)
        
        db.session.commit()
        return jsonify({'message': 'Progress updated successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/api/stats/update', methods=['POST'])
@jwt_required()
def update_stats():
    try:
        user_id = get_jwt_identity()
        data = request.json
        
        stats = UserStats.query.filter_by(user_id=user_id).first()
        if not stats:
            stats = UserStats(user_id=user_id)
            db.session.add(stats)
        
        # Update stats fields
        if 'problems_solved' in data:
            stats.problems_solved = data['problems_solved']
        if 'current_streak' in data:
            stats.current_streak = data['current_streak']
        if 'avg_score' in data:
            stats.avg_score = data['avg_score']
        if 'total_placements' in data:
            stats.total_placements = data['total_placements']
        if 'companies_applied' in data:
            stats.companies_applied = data['companies_applied']
        if 'avg_package' in data:
            stats.avg_package = data['avg_package']
        
        db.session.commit()
        return jsonify({'message': 'Stats updated successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/api/init-db', methods=['GET'])
def init_db():
    try:
        # Create sample user if not exists
        user = User.query.filter_by(email='demo@example.com').first()
        if not user:
            user = User(
                name='Demo User',
                email='demo@example.com',
                password_hash='hashed_password_demo',
                has_taken_baseline=True
            )
            db.session.add(user)
            db.session.commit()
        
        # Create stats for user
        stats = UserStats.query.filter_by(user_id=user.id).first()
        if not stats:
            stats = UserStats(
                user_id=user.id,
                problems_solved=53,
                current_streak=12,
                avg_score=87.5,
                total_placements=250,
                companies_applied=85,
                avg_package=12.5
            )
            db.session.add(stats)
            db.session.commit()
        
        return jsonify({'message': 'Database initialized with sample data'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500