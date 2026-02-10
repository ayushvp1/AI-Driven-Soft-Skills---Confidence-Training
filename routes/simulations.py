from flask import Blueprint, render_template, request, jsonify, current_app
from flask_login import current_user, login_required
from gd_data import GD_SCENARIOS
from ai_engine.router import ai_router
from ai_engine.audio_processor import transcribe_audio
from models.database import db, SimulationResult
from config import Config
import json

simulations_bp = Blueprint('simulations', __name__)

@simulations_bp.route('/')
@login_required
def list_simulations():
    return render_template('gd_list.html', scenarios=GD_SCENARIOS)

@simulations_bp.route('/<int:scenario_id>')
@login_required
def simulation_room(scenario_id):
    scenario = next((s for s in GD_SCENARIOS if s['id'] == scenario_id), None)
    if not scenario:
        return "Simulation not found", 404
    return render_template('gd_room.html', scenario=scenario)

@simulations_bp.route('/get_agent_response', methods=['POST'])
@login_required
def get_agent_response():
    data = request.json
    scenario_id = data.get('scenario_id')
    history = data.get('history', [])
    agent_name = data.get('agent_name')
    
    scenario = next((s for s in GD_SCENARIOS if s['id'] == scenario_id), None)
    agent = next((p for p in scenario['participants'] if p['name'] == agent_name), None)
    
    # Construct prompt for the specific agent
    history_text = "\n".join([f"{m['sender']}: {m['text']}" for m in history])
    
    prompt = (
        f"You are {agent['name']}, participating in a Group Discussion about '{scenario['topic']}'.\n"
        f"Your Persona: {agent['persona']}\n"
        f"Recent Discussion History:\n{history_text}\n\n"
        f"Provide a VERY SHORT response (1-2 sentences MAX) as {agent['name']}. "
        f"Be concise and direct. DO NOT repeat what others said. "
        f"Offer your unique perspective briefly. Stay in character."
    )
    
    model_to_use = agent.get('model', Config.FREE_MODEL_TEXT)
    
    # Select specific key if available to bypass rate limits
    agent_key = getattr(Config, f"LITEROUTER_API_KEY_{agent_name.upper()}", Config.LITEROUTER_API_KEY)
    
    print(f"DEBUG: Getting response for {agent_name} using model {model_to_use}")
    
    response_text = ai_router.get_completion(prompt, model=model_to_use, api_key=agent_key)
    print(f"DEBUG: Response for {agent_name}: {response_text[:100]}...")
    
    return jsonify({
        "sender": agent['name'],
        "text": response_text
    })

@simulations_bp.route('/get_final_report', methods=['POST'])
@login_required
def get_final_report():
    try:
        data = request.json
        scenario_id = data.get('scenario_id')
        history = data.get('history', [])
        
        if not scenario_id:
            return jsonify({"error": "Missing scenario_id"}), 400
        
        scenario = next((s for s in GD_SCENARIOS if s['id'] == scenario_id), None)
        
        if not scenario:
            return jsonify({"error": "Scenario not found"}), 404
        
        if not history or len(history) == 0:
            return jsonify({"error": "No discussion history to analyze"}), 400
        
        history_text = "\n".join([f"{m['sender']}: {m['text']}" for m in history])
        
        prompt = (
            f"You are a Soft Skills Coach. Analyze the Group Discussion on '{scenario['topic']}'.\n\n"
            f"History:\n{history_text}\n\n"
            f"Provide a JSON response with exactly two keys:\n"
            f"1. 'score': Integer (1-10) representing user's overall performance.\n"
            f"2. 'feedback': A concise report (max 200 words) evaluating Leadership, Collaboration, Clarity, with 3 tips.\n"
            f"Output ONLY pure JSON. No markdown."
        )
        
        print(f"DEBUG: Generating final report for scenario {scenario_id}")
        response_text = ai_router.get_completion(prompt)
        print(f"DEBUG: Report generated successfully ({len(response_text)} chars)")
        
        if response_text.startswith("Error"):
            return jsonify({"error": response_text}), 502
            
        # Parse JSON
        try:
            cleaned_text = response_text.replace('```json', '').replace('```', '').strip()
            data = json.loads(cleaned_text)
            score = data.get('score', 0)
            feedback = data.get('feedback', response_text)
        except Exception as e:
            print(f"WARN: Failed to parse JSON report: {e}")
            score = 0
            feedback = response_text
            
        # Save to Database
        try:
            result = SimulationResult(
                user_id=current_user.id,
                scenario_id=scenario_id,
                score=score,
                feedback=feedback
            )
            db.session.add(result)
            db.session.commit()
            print(f"DEBUG: Saved SimulationResult {result.id}")
        except Exception as db_err:
            print(f"ERROR: Failed to save to DB: {db_err}")
        
        return jsonify({
            "report": feedback
        })
        
    except Exception as e:
        print(f"ERROR: Failed to generate report: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to generate report: {str(e)}"}), 500
