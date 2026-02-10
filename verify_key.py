import requests
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.environ.get("LITEROUTER_API_KEY")
BASE_URL = "https://api.literouter.com/v1/chat/completions"

def verify():
    print(f"Testing API Key: {API_KEY[:5]}...{API_KEY[-5:]} against OpenRouter")
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "X-Title": "Key Verification",
    }
    
    payload = {
        "model": "gpt-oss-20b-free", 
        "messages": [{"role": "user", "content": "Say hello!"}]
    }
    
    try:
        response = requests.post(BASE_URL, headers=headers, json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("Success! Key is valid.")
            print("Response:", response.json()['choices'][0]['message']['content'])
        else:
            print("Failed:", response.text)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    verify()
