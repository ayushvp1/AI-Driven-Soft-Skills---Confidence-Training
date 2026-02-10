import os
import sys
# Add current directory to path so we can import our modules
sys.path.append(os.getcwd())

from ai_engine.router import ai_router
from gd_data import GD_SCENARIOS

def test_models():
    print("--- AI Model Connectivity Test ---")
    
    from config import Config
    
    # Updated test cases to use gemini-free with specific keys from Config
    test_cases = [
        {"name": "Sarah", "model": "gemini-free", "key": Config.LITEROUTER_API_KEY_SARAH},
        {"name": "David", "model": "gemini-free", "key": Config.LITEROUTER_API_KEY_DAVID},
        {"name": "Priya", "model": "gemini-free", "key": Config.LITEROUTER_API_KEY_PRIYA}
    ]
    
    for case in test_cases:
        print(f"\n--- Testing {case['name']} (Model: {case['model']}) ---")
        try:
            prompt = f"Short greeting as {case['name']}."
            # Force the use of the specific key
            response = ai_router.get_completion(prompt, model=case['model'], api_key=case['key'])
            print(f"Result: {response}")
            if "Error" in response:
                print(f"STATUS: FAILED")
            else:
                print(f"STATUS: SUCCESS")
        except Exception as e:
            print(f"EXCEPTION: {str(e)}")

if __name__ == "__main__":
    test_models()
