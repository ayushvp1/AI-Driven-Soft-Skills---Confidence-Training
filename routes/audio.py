from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from ai_engine.audio_processor import transcribe_audio
import os
from werkzeug.utils import secure_filename

audio_bp = Blueprint('audio', __name__)

@audio_bp.route('/transcribe', methods=['POST'])
@login_required
def fast_transcribe():
    # Validation
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
    
    audio_file = request.files['audio']
    
    # Validate file has content
    if audio_file.filename == '':
        return jsonify({"error": "Empty filename"}), 400
    
    # Validate file extension
    allowed_extensions = ('.wav', '.mp3', '.ogg')
    if not audio_file.filename.lower().endswith(allowed_extensions):
        return jsonify({"error": "Supported formats: WAV, MP3, OGG"}), 400
    
    # Read file to validate size
    audio_file.seek(0, 2)  # Seek to end
    file_size = audio_file.tell()
    audio_file.seek(0)  # Reset to beginning
    
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    if file_size > MAX_FILE_SIZE:
        return jsonify({"error": "File too large (max 10MB)"}), 413
    
    if file_size < 100:  # Minimum reasonable WAV file size
        return jsonify({"error": "File too small to be valid audio"}), 400
    
    # Create temp directory
    import uuid
    os.makedirs(os.path.join(current_app.config['UPLOAD_FOLDER'], 'temp'), exist_ok=True)
    
    # Use UUID for security
    unique_id = uuid.uuid4().hex
    original_ext = os.path.splitext(audio_file.filename)[1].lower() or '.wav'
    filename = f"audio_{current_user.id}_{unique_id}{original_ext}"
    path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'temp', filename)
    
    try:
        audio_file.save(path)
        
        print(f"DEBUG: Transcription started for {filename} ({file_size} bytes)")
        transcript = transcribe_audio(path)
        print(f"DEBUG: Transcription result: {transcript}")
        
        return jsonify({"transcript": transcript})
        
    except Exception as e:
        print(f"ERROR: Transcription failed: {str(e)}")
        return jsonify({"error": f"Transcription failed: {str(e)}"}), 500
        
    finally:
        # Cleanup temp file
        try:
            if os.path.exists(path):
                os.remove(path)
        except Exception as e:
            print(f"WARNING: Failed to cleanup temp file: {str(e)}")
