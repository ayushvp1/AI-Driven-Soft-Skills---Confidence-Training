import speech_recognition as sr
import os

def convert_to_wav(source_path):
    """
    Converts audio files (MP3, OGG, etc.) to WAV format for transcription.
    Returns path to the converted WAV file, or original path if already WAV.
    """
    ext = os.path.splitext(source_path)[1].lower()
    
    if ext == '.wav':
        return source_path, False  # No conversion needed
    
    wav_path = source_path.rsplit('.', 1)[0] + '_converted.wav'
    
    # Try pydub first (works for all formats if ffmpeg is installed)
    try:
        from pydub import AudioSegment
        audio = AudioSegment.from_file(source_path)
        audio = audio.set_frame_rate(16000).set_channels(1)
        audio.export(wav_path, format="wav")
        return wav_path, True
    except Exception as e:
        print(f"DEBUG: Pydub conversion failed: {e}")
    
    # Soundfile fallback - only works for OGG, FLAC (NOT MP3)
    if ext in ['.ogg', '.flac', '.oga']:
        try:
            import soundfile as sf
            data, samplerate = sf.read(source_path)
            sf.write(wav_path, data, samplerate, subtype='PCM_16')
            return wav_path, True
        except Exception as e2:
            print(f"DEBUG: Soundfile conversion failed: {e2}")
            raise Exception(f"Could not convert {ext} file. Please try a WAV file instead.")
    
    # MP3 requires ffmpeg which isn't installed
    if ext == '.mp3':
        raise Exception("MP3 files require ffmpeg to be installed. Please upload a WAV file instead, or install ffmpeg on your system.")
    
    raise Exception(f"Unsupported audio format: {ext}. Please upload a WAV file.")

def transcribe_audio(file_path, max_retries=3):
    """
    Transcribes an audio file to text with retry logic.
    Supports WAV, MP3, OGG formats (conversion happens automatically).
    
    Args:
        file_path: Path to the audio file
        max_retries: Maximum number of retry attempts (default: 3)
    
    Returns:
        Transcribed text or error message in brackets
    """
    import time
    import gc
    recognizer = sr.Recognizer()
    
    # Validate file exists and has content
    if not os.path.exists(file_path):
        return "[Audio file not found]"
    
    file_size = os.path.getsize(file_path)
    if file_size < 100:
        return "[Audio file is too small or empty]"
    
    # Convert to WAV if needed
    converted_path = file_path
    needs_cleanup = False
    try:
        converted_path, needs_cleanup = convert_to_wav(file_path)
    except Exception as e:
        return f"[{str(e)}]"
    
    result = None
    
    # Try transcription with retries
    for attempt in range(max_retries):
        try:
            with sr.AudioFile(converted_path) as source:
                # Adjust for ambient noise
                recognizer.adjust_for_ambient_noise(source, duration=0.5)
                
                # Record audio
                audio_data = recognizer.record(source)
            
            # Recognition happens OUTSIDE the with block so file is released
            text = recognizer.recognize_google(audio_data)
            result = text
            break  # Success!
                
        except sr.UnknownValueError:
            if attempt < max_retries - 1:
                print(f"DEBUG: Attempt {attempt + 1} failed (unclear audio), retrying...")
                time.sleep(0.5 * (attempt + 1))
                continue
            result = "[Could not understand the audio. Please speak clearly and try again]"
            
        except sr.RequestError as e:
            if attempt < max_retries - 1:
                print(f"DEBUG: Attempt {attempt + 1} failed (API error), retrying...")
                time.sleep(1 * (attempt + 1))
                continue
            result = f"[Speech recognition service unavailable. Please try again later]"
            
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"DEBUG: Attempt {attempt + 1} failed (unexpected error: {str(e)}), retrying...")
                time.sleep(0.5 * (attempt + 1))
                continue
            result = f"[Transcription error: {str(e)}]"
    
    if result is None:
        result = "[Transcription failed after multiple attempts]"
    
    # Cleanup converted file - do this AFTER all file operations are done
    if needs_cleanup and os.path.exists(converted_path):
        try:
            gc.collect()  # Force garbage collection to release file handles
            time.sleep(0.1)  # Small delay for Windows to release file
            os.remove(converted_path)
        except Exception as cleanup_error:
            print(f"DEBUG: Cleanup warning (non-fatal): {cleanup_error}")
            # Non-fatal - file will be cleaned up later
    
    return result
