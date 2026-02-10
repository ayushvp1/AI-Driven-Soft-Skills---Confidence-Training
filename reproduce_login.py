
import sys
import os

# Add project root to path
sys.path.append(os.getcwd())

from app import app, db
from models.database import User
from werkzeug.security import generate_password_hash

def test_login_flow():
    # Use in-memory SQLite for testing to avoid messing with real DB
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['WTF_CSRF_ENABLED'] = False  # Disable CSRF for testing this
    app.config['TESTING'] = True

    with app.app_context():
        db.create_all()
        
        # 1. Register a user manually
        print("Creating test user...")
        user = User(username='testuser', email='test@example.com', password_hash=generate_password_hash('password123'))
        db.session.add(user)
        db.session.commit()
        print("Test user created.")

        # 2. Test Login with Test Client
        client = app.test_client()
        
        print("Attempting login...")
        response = client.post('/auth/login', data={
            'email': 'test@example.com',
            'password': 'password123'
        }, follow_redirects=True)
        
        print(f"Login Response Status: {response.status_code}")
        
        # Check if we are redirected to index (or see 'Dashboard' or similar)
        # Note: 'index' route renders 'index.html'. Let's check for some content from index.html (verified earlier it exists)
        # index.html content isn't fully known but usually has specific text. 
        # But we can check `request.path` if we could, but response.data is what we have.
        # Let's check if we are authenticated. 
        # The 'base.html' has: {% if current_user.is_authenticated %} ... Hi, {{ current_user.username }}
        
        if b'Hi, testuser' in response.data:
            print("SUCCESS: Login successful, found 'Hi, testuser' in response.")
        else:
            print("FAILURE: Login failed.")

        # 3. Test Failed Login
        print("Attempting failed login...")
        response_fail = client.post('/auth/login', data={
            'email': 'test@example.com',
            'password': 'wrongpassword'
        }, follow_redirects=True)
        
        if b'Invalid email or password' in response_fail.data:
            print("SUCCESS: Flashed message 'Invalid email or password' FOUND in response.")
        else:
            print("BUG CONFIRMED: Flashed message 'Invalid email or password' NOT FOUND in response.")
            # print("Response Snippet:", response_fail.data[:500])

if __name__ == "__main__":
    test_login_flow()
