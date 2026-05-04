# run.py
from app import create_app, db  # ✅ Import db directly from app (not app.models)

app = create_app()


def initialize_database():
    """Initializes the database tables within the application context."""
    with app.app_context():
        print("🔍 Checking database connection and models...")

        # Create tables based on imported models (safe to run multiple times)
        db.create_all()

        # Insert demo/sample data
        create_sample_data()

        print("✅ Database initialization complete. Tables created/verified.")


def create_sample_data():
    """Create sample data for testing dashboard."""
    try:
        from app.models import User, UserStats, UserProgress

        # Check if demo user exists
        demo_user = User.query.filter_by(email='demo@example.com').first()

        if not demo_user:
            demo_user = User(
                name='Demo User',
                email='demo@example.com',
                password_hash='hashed_password_demo',
                has_taken_baseline=True
            )
            db.session.add(demo_user)
            db.session.commit()
            print("👤 Demo user created.")

        # Check if stats exist for demo user
        stats = UserStats.query.filter_by(user_id=demo_user.id).first()
        if not stats:
            stats = UserStats(
                user_id=demo_user.id,
                problems_solved=53,
                current_streak=12,
                avg_score=87.5,
                total_placements=250,
                companies_applied=85,
                avg_package=12.5
            )
            db.session.add(stats)
            print("📊 Demo stats created.")

        # Add sample progress records
        progress_topics = [
            'Quantitative Aptitude',
            'Logical Reasoning',
            'Verbal Ability',
            'Programming Basics'
        ]
        for topic in progress_topics:
            progress = UserProgress.query.filter_by(
                user_id=demo_user.id, topic_name=topic
            ).first()
            if not progress:
                progress = UserProgress(
                    user_id=demo_user.id,
                    topic_name=topic,
                    completed_practice=True,
                    test_score=9,
                    completed=True
                )
                db.session.add(progress)

        db.session.commit()
        print("✅ Sample data created successfully.")

    except Exception as e:
        print(f"❌ Error creating sample data: {e}")
        db.session.rollback()


if __name__ == '__main__':
    # Initialize DB (safe even if tables exist)
    initialize_database()

    # Start the Flask development server
    app.run(debug=True)
