import os
from app import app, db
from sqlalchemy import text

# USER: Paste your connection string here if you don't want to set env var
# connection_string = "postgresql://..." 

def init_db():
    print("Initializing Cloud Database...")
    
    # Check if DATABASE_URL is set in environment, otherwise ask user
    if not os.environ.get('DATABASE_URL'):
        print("DATABASE_URL not found in environment.")
        db_url = input("Please paste your Neon/Postgres Connection String: ").strip()
        # Remove psql prefix and quotes if present
        if db_url.startswith("psql "):
            db_url = db_url[5:]
        db_url = db_url.strip("'\"")
        
        # Fix protocol for SQLAlchemy
        if db_url.startswith("postgres://"):
            db_url = db_url.replace("postgres://", "postgresql://", 1)
            
        os.environ['DATABASE_URL'] = db_url
        
    print(f"Connecting to: {os.environ['DATABASE_URL'].split('@')[-1]}...") # Hide password
    
    with app.app_context():
        try:
            # Try a simple query to verify connection
            db.session.execute(text('SELECT 1'))
            print("Connection successful!")
            
            # Create tables
            print("Creating tables...")
            db.create_all()
            print("Tables created successfully!")
            print("You can now deploy to Vercel!")
            
        except Exception as e:
            print(f"\nError initializing database: {e}")
            print("\nPlease check your connection string and try again.")

if __name__ == "__main__":
    init_db()
