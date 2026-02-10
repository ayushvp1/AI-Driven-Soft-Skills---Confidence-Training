import requests
import json
from config import Config

class AIRouter:
    def __init__(self, api_key=None, base_url=None):
        self.api_key = api_key or Config.LITEROUTER_API_KEY
        self.base_url = base_url or Config.LITEROUTER_BASE_URL
        
        if not self.api_key:
            print("Warning: LITEROUTER_API_KEY not set!")

    def get_completion(self, prompt, model=Config.FREE_MODEL_TEXT, system_msg=None, api_key=None):
        """
        Generic completion using LiteRouter via direct requests to avoid SDK issues.
        """
        target_key = api_key or self.api_key
        url = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {target_key}",
            "Content-Type": "application/json",
            "X-Title": "AI Soft Skills App",
            "HTTP-Referer": "https://localhost:5000"
        }
        
        messages = []
        if system_msg:
            messages.append({"role": "system", "content": system_msg})
        messages.append({"role": "user", "content": prompt})
        
        payload = {
            "model": model,
            "messages": messages
        }
        
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=120)
            if response.status_code == 200:
                data = response.json()
                return data['choices'][0]['message']['content']
            else:
                print(f"DEBUG: AI API Error ({response.status_code})")
                print(f"DEBUG: Response Body: {response.text}")
                return f"Error connecting to AI: Status {response.status_code}"
        except Exception as e:
            print(f"DEBUG: AI Connection Error: {str(e)}")
            return f"Error connecting to AI: {str(e)}"

    def analyze_soft_skills(self, content, skill_type="communication"):
        """
        Specialized analysis for soft skills.
        """
        system_prompt = (
            "You are an expert Soft Skills and Confidence Coach. "
            "Analyze the following user input and provide constructive, "
            "motivating feedback. Focus on clarity, tone, and confidence."
        )
        
        user_prompt = (
            f"Skill: {skill_type}\n"
            f"Content: {content}\n\n"
            "Please provide a response in the following format:\n"
            "Score: X/10\n"
            "Feedback: [Your detailed analysis here]\n"
            "Tips: [Three specific tips]"
        )
        
        return self.get_completion(user_prompt, system_msg=system_prompt)

# Singleton instance
ai_router = AIRouter()
