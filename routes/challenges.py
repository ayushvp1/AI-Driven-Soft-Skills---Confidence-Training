import os
from flask import Blueprint, render_template, request, jsonify, current_app
from flask_login import current_user, login_required
from challenges_data import CHALLENGES
from ai_engine.router import ai_router
from ai_engine.audio_processor import transcribe_audio
from models.database import db, ChallengeSubmission
from werkzeug.utils import secure_filename
import re

challenges_bp = Blueprint('challenges', __name__)

@challenges_bp.route('/')
@login_required
def list_challenges():
    completed_ids = [s.challenge_id for s in ChallengeSubmission.query.filter_by(user_id=current_user.id).all()]
    
    return render_template('challenges_list.html', 
                          challenges=CHALLENGES, 
                          completed_ids=completed_ids)

@challenges_bp.route('/<int:challenge_id>')
@login_required
def challenge_detail(challenge_id):
    challenge = next((c for c in CHALLENGES if c['id'] == challenge_id), None)
    if not challenge:
        return "Challenge not found", 404
    return render_template('challenge_detail.html', challenge=challenge)

@challenges_bp.route('/submit/<int:challenge_id>', methods=['POST'])
@login_required
def submit_challenge(challenge_id):
    challenge = next((c for c in CHALLENGES if c['id'] == challenge_id), None)
    if not challenge:
        return jsonify({"error": "Challenge not found"}), 404

    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
    
    audio_file = request.files['audio']
    if audio_file.filename == '':
        return jsonify({"error": "Empty filename"}), 400

    # Save file
    os.makedirs(os.path.join(current_app.config['UPLOAD_FOLDER'], 'audio'), exist_ok=True)
    filename = secure_filename(f"user_{current_user.id}_challenge_{challenge_id}_{audio_file.filename}")
    upload_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'audio', filename)
    audio_file.save(upload_path)

    # Transcribe the audio
    transcript = transcribe_audio(upload_path)
    print(f"Transcript: {transcript}")

    if transcript.startswith("["):
        # Extract the actual error message from brackets
        error_msg = transcript.strip("[]")
        return jsonify({
            "status": "error",
            "error": error_msg
        }), 400

    # Get AI Feedback
    user_context = request.form.get('context', '')
    feedback = ai_router.analyze_soft_skills(
        content=f"User completed challenge: {challenge['title']}.\n"
                f"Objective: {challenge['objective']}.\n"
                f"ACTUAL TRANSCRIPT OF USER SPEECH: '{transcript}'\n"
                f"Please analyze the transcript for clarity and flow.",
        skill_type="communication"
    )

    # Extract score from AI feedback (assuming AI follows prompt and gives a score X/10)
    # Extract score from AI feedback
    # Try multiple patterns to handle bolding, casing, and variations
    score = 0
    patterns = [
        r'score:?\s*(\d+)\s*/\s*10',           # Standard: Score: 5/10
        r'score\s*\**:\**\s*(\d+)\s*/\s*10',   # Markdown: Score**: 5/10
        r'rating:?\s*(\d+)\s*/\s*10',          # Variation: Rating: 5/10
        r'(\d+)\s*/\s*10'                      # Fallback: just look for X/10
    ]
    
    for pattern in patterns:
        match = re.search(pattern, feedback.lower())
        if match:
            score = int(match.group(1))
            break

    # Save to Database
    submission = ChallengeSubmission(
        user_id=current_user.id,
        challenge_id=challenge_id,
        feedback=feedback,
        score=score,
        audio_filename=filename
    )
    db.session.add(submission)
    db.session.commit()

    return jsonify({
        "status": "success",
        "feedback": feedback,
        "transcript": transcript,
        "score": score,
        "filename": filename
    })

@challenges_bp.route('/generate_instruction', methods=['POST'])
@login_required
def generate_instruction():
    data = request.json
    challenge_id = data.get('challenge_id')
    
    challenge = next((c for c in CHALLENGES if c['id'] == challenge_id), None)
    if not challenge:
        return jsonify({"error": "Challenge not found"}), 404
        
    # Generate new instruction using AI
    prompt = (
        f"Generate a unique, creative, and specific instruction for a soft skills training challenge.\n"
        f"Context: {challenge['title']}\n"
        f"Objective: {challenge['objective']}\n"
        f"Difficulty: {challenge['difficulty']}\n"
        f"Current Instruction (for reference): {challenge['instructions']}\n\n"
        f"Task: Create a NEW, different scenario or topic for the user to speak about that fulfills the same objective. "
        f"Keep it concise (1-2 sentences). Do not repeat the old instruction."
    )
    
    try:
        new_instruction = ai_router.get_completion(prompt)
        return jsonify({"instruction": new_instruction})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
