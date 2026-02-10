# AI-Driven Soft Skills & Confidence Training

## Overview
This is an AI-powered web application designed to help users improve their soft skills, public speaking, and confidence. It features:
-   **Mirror Talk**: A camera-based practice tool with auto-saving progress.
-   **AI Challenges**: Speech tasks with dynamic, AI-generated instructions and instant feedback.
-   **Group Discussion Simulators**: Interactive chat rooms with AI agents.
-   **Analytics**: A dashboard to track your growth and daily streaks.

## Setup Instructions

### 1. Install Dependencies
Ensure you have Python installed. Then run:
```bash
pip install -r requirements.txt
```

### 2. Configure API Keys
**Important**: You must create a `.env` file in this directory to use the AI features.
Create a file named `.env` and add your keys:

```ini
# Core Configuration
SECRET_KEY=your-secret-key-here

# AI Configuration (Google Gemini / LiteRouter)
LITEROUTER_API_KEY=your-api-key-here

# Optional: Specific Agent Keys (if using different models)
# LITEROUTER_API_KEY_SARAH=...
```

### 3. Run the Application
Start the Flask server:
```bash
python app.py
```
Open your browser and navigate to: `http://127.0.0.1:5000`

## Features Guide
*   **Challenges**: Go to `/challenges` to practice specific skills. Click "✨ New Prompt" to get a fresh topic.
*   **GD Room**: Go to `/simulations` to enter a group discussion.
*   **Exercises**: Go to `/exercises` for daily habits. Mirror Talk progress is saved automatically after 5 minutes.
