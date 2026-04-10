import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess'
    database_url = os.environ.get('DATABASE_URL')
    if database_url and database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    
    SQLALCHEMY_DATABASE_URI = database_url or 'sqlite:///app.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # LiteRouter Configuration
    LITEROUTER_API_KEY = os.environ.get('LITEROUTER_API_KEY')
    LITEROUTER_API_KEY_SARAH = os.environ.get('LITEROUTER_API_KEY_SARAH') or LITEROUTER_API_KEY
    LITEROUTER_API_KEY_DAVID = os.environ.get('LITEROUTER_API_KEY_DAVID') or LITEROUTER_API_KEY
    LITEROUTER_API_KEY_PRIYA = os.environ.get('LITEROUTER_API_KEY_PRIYA') or LITEROUTER_API_KEY
    LITEROUTER_BASE_URL = "https://api.literouter.com/v1"
    
    # Default Free Models
    FREE_MODEL_TEXT = "gpt-oss-20b-free"
    FREE_MODEL_SPEED = "mistralai/mistral-7b-instruct:free"
    
    # Uploads
    if os.environ.get('VERCEL'):
        UPLOAD_FOLDER = '/tmp/uploads'
    else:
        UPLOAD_FOLDER = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB file limit
