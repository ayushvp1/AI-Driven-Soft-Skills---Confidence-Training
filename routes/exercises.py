from flask import Blueprint, render_template, request, jsonify
from flask_login import login_required, current_user
from models.database import db, ExerciseLog, Exercise

exercises_bp = Blueprint('exercises', __name__)

@exercises_bp.route('/')
@login_required
def list_exercises():
    """List all confidence-building exercises."""
    exercises = Exercise.query.order_by(Exercise.id.asc()).all()
    
    # Annotate exercises with completion status (simple check if any log exists)
    for ex in exercises:
        ex.completed = ExerciseLog.query.filter_by(
            user_id=current_user.id, 
            exercise_id=ex.id
        ).first() is not None
        
    return render_template('exercises_list.html', exercises=exercises)

@exercises_bp.route('/complete', methods=['POST'])
@login_required
def complete_exercise():
    data = request.json
    exercise_id = data.get('exercise_id')
    
    exercise = Exercise.query.get(exercise_id)
    if not exercise:
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
    
    exercise = Exercise.query.get_or_404(exercise_id)
    return render_template('exercise_detail.html', exercise=exercise)

@exercises_bp.route('/mirror-talk')
@login_required
def mirror_talk():
    """Interactive Mirror Talk exercise with webcam."""
    return render_template('mirror_talk.html')

