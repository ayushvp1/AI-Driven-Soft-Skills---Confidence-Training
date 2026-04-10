from flask import Flask, render_template, request, jsonify
from flask_login import login_required, current_user
from config import Config
from ai_engine.router import ai_router
from routes.challenges import challenges_bp
from routes.simulations import simulations_bp
from routes.audio import audio_bp
from routes.exercises import exercises_bp
from models.database import db, login_manager, User, ChallengeSubmission, SimulationResult, ExerciseLog

app = Flask(__name__)
app.config.from_object(Config)

# Initialize Extensions
db.init_app(app)
login_manager.init_app(app)
login_manager.login_view = 'auth.login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Create database tables
with app.app_context():
    db.create_all()
    # Check if we need to seed
    if Challenge.query.count() == 0:
        print("Database empty, performing initial seed...")
        from challenges_data import CHALLENGES
        from exercises_data import EXERCISES
        from gd_data import GD_SCENARIOS
        from models.database import Challenge, Exercise, SimulationScenario
        
        # Seed Challenges
        for c in CHALLENGES:
            db.session.add(Challenge(**c))
        
        # Seed Exercises
        for e in EXERCISES:
            db.session.add(Exercise(**e))
            
        # Seed GD Scenarios
        for s in GD_SCENARIOS:
            db.session.add(SimulationScenario(**s))
            
        db.session.commit()
        print("Initial seeding completed!")

from routes.challenges import challenges_bp
from routes.auth import auth_bp

# Register Blueprints
app.register_blueprint(challenges_bp, url_prefix='/challenges')
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(simulations_bp, url_prefix='/simulations')
app.register_blueprint(audio_bp, url_prefix='/audio')
app.register_blueprint(exercises_bp, url_prefix='/exercises')

@app.route('/')
def index():
    """Dashboard / Home Page"""
    return render_template('index.html')

@app.route('/analytics')
@login_required
def analytics():
    """Performance Analytics Page with Calendar"""
    from datetime import datetime, timedelta
    from collections import defaultdict
    
    submissions = ChallengeSubmission.query.filter_by(user_id=current_user.id).all()
    sim_results = SimulationResult.query.filter_by(user_id=current_user.id).all()
    exercise_logs = ExerciseLog.query.filter_by(user_id=current_user.id).all()
    
    # Calculate stats
    total_completed = len(submissions) + len(sim_results) + len(exercise_logs)
    
    all_scores = [s.score for s in submissions if s.score] + [s.score for s in sim_results if s.score]
    avg_score = sum(all_scores) / len(all_scores) if all_scores else 0
    
    # Build calendar data - aggregate by date
    activity_by_date = defaultdict(lambda: {'count': 0, 'scores': []})
    
    for s in submissions:
        date_key = s.timestamp.strftime('%Y-%m-%d')
        activity_by_date[date_key]['count'] += 1
        if s.score:
            activity_by_date[date_key]['scores'].append(s.score)
    
    for s in sim_results:
        date_key = s.timestamp.strftime('%Y-%m-%d')
        activity_by_date[date_key]['count'] += 1
        if s.score:
            activity_by_date[date_key]['scores'].append(s.score)

    for s in exercise_logs:
        date_key = s.timestamp.strftime('%Y-%m-%d')
        activity_by_date[date_key]['count'] += 1
        # Exercises don't have scores, just count
    
    # Generate last 30 days for calendar view
    today = datetime.now().date()
    calendar_days = []
    for i in range(29, -1, -1):  # Last 30 days, oldest to newest
        day = today - timedelta(days=i)
        day_str = day.strftime('%Y-%m-%d')
        day_data = activity_by_date.get(day_str, {'count': 0, 'scores': []})
        avg_day_score = sum(day_data['scores']) / len(day_data['scores']) if day_data['scores'] else 0
        calendar_days.append({
            'date': day_str,
            'day': day.day,
            'weekday': day.strftime('%a'),
            'active': day_data['count'] > 0,
            'count': day_data['count'],
            'avg_score': round(avg_day_score, 1),
            'is_today': day == today
        })
    
    # Calculate streak
    streak = 0
    for i in range(len(calendar_days) - 1, -1, -1):
        if calendar_days[i]['active']:
            streak += 1
        elif calendar_days[i]['is_today']:
            continue  # Don't break streak for today if not yet active
        else:
            break
    
    # Combine History
    history = []
    for s in submissions:
        history.append({
            'type': 'Challenge',
            'id': s.challenge_id,
            'timestamp': s.timestamp,
            'score': s.score,
            'feedback': s.feedback
        })
    for s in sim_results:
        history.append({
            'type': 'GD Session',
            'id': s.scenario_id,
            'timestamp': s.timestamp,
            'score': s.score,
            'feedback': s.feedback
        })
    # Import exercises data for titles
    from exercises_data import EXERCISES
    for s in exercise_logs:
        ex_title = next((e['title'] for e in EXERCISES if e['id'] == s.exercise_id), 'Exercise')
        history.append({
            'type': 'Exercise',
            'id': s.exercise_id,
            'title': ex_title,
            'timestamp': s.timestamp,
            'score': None,
            'feedback': 'Completed'
        })
    
    # Sort by newest first
    history.sort(key=lambda x: x['timestamp'], reverse=True)
    
    return render_template('analytics.html', 
                          submissions=history, 
                          total_completed=total_completed, 
                          avg_score=round(avg_score, 1),
                          calendar_days=calendar_days,
                          streak=streak)

@app.route('/test-ai', methods=['POST'])
def test_ai():
    """Simple endpoint to test LiteRouter connection"""
    user_input = request.json.get('message', 'Hello')
    response = ai_router.get_completion(user_input)
    return jsonify({"response": response})

@app.route('/reset-progress', methods=['POST'])
@login_required
def reset_progress():
    """Reset all user progress (challenges and simulations)"""
    try:
        # Delete all challenge submissions for current user
        ChallengeSubmission.query.filter_by(user_id=current_user.id).delete()
        # Delete all simulation results for current user
        SimulationResult.query.filter_by(user_id=current_user.id).delete()
        # Delete all exercise logs for current user
        ExerciseLog.query.filter_by(user_id=current_user.id).delete()
        db.session.commit()
        return jsonify({"status": "success", "message": "All progress has been reset"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
