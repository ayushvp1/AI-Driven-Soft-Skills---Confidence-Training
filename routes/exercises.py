from flask import Blueprint, render_template, request, jsonify
from flask_login import login_required, current_user
from exercises_data import EXERCISES
from models.database import db, ExerciseLog

exercises_bp = Blueprint('exercises', __name__)

@exercises_bp.route('/')
@login_required
def list_exercises():
    """List all confidence-building exercises."""
    # Annotate exercises with completion status (simple check if any log exists)
    for ex in EXERCISES:
        ex['completed'] = ExerciseLog.query.filter_by(
            user_id=current_user.id, 
            exercise_id=ex['id']
        ).first() is not None
        
    return render_template('exercises_list.html', exercises=EXERCISES)

@exercises_bp.route('/complete', methods=['POST'])
@login_required
def complete_exercise():
    data = request.json
    exercise_id = data.get('exercise_id')
    
    if not exercise_id:
        return jsonify({"error": "Missing exercise_id"}), 400
        
    # Check if exercise exists
    if not any(e['id'] == int(exercise_id) for e in EXERCISES):
        return jsonify({"error": "Invalid exercise ID"}), 404
        
    # Save log
    log = ExerciseLog(user_id=current_user.id, exercise_id=int(exercise_id))
    db.session.add(log)
    db.session.commit()
    
    return jsonify({"status": "success", "message": "Exercise marked as complete"})

@exercises_bp.route('/<int:exercise_id>')
@login_required
def exercise_detail(exercise_id):
    """Show details for a specific exercise."""
    # Redirect Mirror Talk to special interactive page
    if exercise_id == 1:
        return render_template('mirror_talk.html')
    
    exercise = next((e for e in EXERCISES if e['id'] == exercise_id), None)
    if not exercise:
        return "Exercise not found", 404
    return render_template('exercise_detail.html', exercise=exercise)

@exercises_bp.route('/mirror-talk')
@login_required
def mirror_talk():
    """Interactive Mirror Talk exercise with webcam."""
    return render_template('mirror_talk.html')

