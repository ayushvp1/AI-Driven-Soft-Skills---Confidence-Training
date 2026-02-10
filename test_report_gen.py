import requests
import json
import time

BASE_URL = "http://localhost:5000"

# Mock data simulating a conversation
mock_history = [
    {"sender": "You", "text": "I think AI will definitely change the job market, but it will create new opportunities."},
    {"sender": "Sarah", "text": "I agree! Think about prompt engineering and AI ethics roles."},
    {"sender": "You", "text": "Exactly, verification and oversight will be key human tasks."},
    {"sender": "David", "text": "But what about the displacement of low-skilled workers? We need to address that."},
    {"sender": "You", "text": "Reskilling programs will be essential to help those workers transition."}
]

def login_and_get_cookie():
    # You might need to adjust this depending on how your auth works.
    # Assuming standard Flask-Login with a test user or just hitting endpoints if auth is disabled for testing?
    # Actually, the endpoints are @login_required.
    # I'll try to use the session cookie from the browser if possible, or register a test user.
    # Let's try to register a new user for this test.
    
    session = requests.Session()
    
    # Register/Login
    username = f"test_user_{int(time.time())}"
    email = f"{username}@test.com"
    password = "password123"
    
    # Register
    reg_url = f"{BASE_URL}/auth/register"
    try:
        r = session.post(reg_url, data={"username": username, "email": email, "password": password, "confirm_password": password})
        if r.status_code == 200:
            print("[+] Registered new test user")
        else:
            # Maybe user exists, try login
            pass
    except Exception as e:
        print(f"[-] Registration failed: {e}")

    # Login
    login_url = f"{BASE_URL}/auth/login"
    r = session.post(login_url, data={"email": email, "password": password})
    if r.status_code == 200 and "dashboard" in r.text.lower():
         print("[+] Login successful")
         return session
    else:
         print(f"[-] Login failed: {r.status_code}")
         return None

def test_final_report(session):
    print("\n[+] Testing Report Generation (Timeout=120s)...")
    url = f"{BASE_URL}/simulations/get_final_report"
    
    payload = {
        "scenario_id": 1,
        "history": mock_history
    }
    
    start_time = time.time()
    try:
        response = session.post(url, json=payload)
        duration = time.time() - start_time
        
        if response.status_code == 200:
            print(f"[SUCCESS] Report generated in {duration:.2f} seconds!")
            data = response.json()
            report_preview = data.get('report', '')[:200]
            print("--- Report Preview ---")
            print(report_preview + "...")
            print("----------------------")
        else:
            print(f"[FAILURE] Status Code: {response.status_code}")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"[ERROR] Request failed: {e}")

def test_agent_response(session):
    print("\n[+] Testing Agent Response (Sarah)...")
    url = f"{BASE_URL}/simulations/get_agent_response"
    
    payload = {
        "scenario_id": 1,
        "history": mock_history,
        "agent_name": "Sarah"
    }
    
    try:
        response = session.post(url, json=payload)
        
        if response.status_code == 200:
            print(f"[SUCCESS] Agent responded!")
            data = response.json()
            print(f"Sarah: {data.get('text')}")
        else:
            print(f"[FAILURE] Agent Status Code: {response.status_code}")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"[ERROR] Agent request failed: {e}")

if __name__ == "__main__":
    print("Starting Automated Backend Test...")
    session = login_and_get_cookie()
    if session:
        test_agent_response(session)
        test_final_report(session)
    else:
        print("Cannot proceed without login.")
