
import sys
import os

sys.path.append(os.getcwd())

from app import app, db
from models.database import User
from werkzeug.security import check_password_hash

def inspect_users():
    with app.app_context():
        users = User.query.all()
        print(f"Found {len(users)} users.")
        for u in users:
            print(f"ID: {u.id}, Username: {u.username}, Email: {u.email}")
            print(f"Password Hash: {u.password_hash}")
            # Try to verify 'password123' just in case
            is_default = check_password_hash(u.password_hash, 'password123')
            print(f"Is password 'password123'? {is_default}")
            print("-" * 20)

if __name__ == "__main__":
    inspect_users()
