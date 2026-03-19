from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin
from datetime import datetime

db = SQLAlchemy()
login_manager = LoginManager()

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    role = db.Column(db.String(20), default='user')
    
    # Relationship with submissions/logs
    submissions = db.relationship('ChallengeSubmission', backref='student', lazy='dynamic')
    simulation_results = db.relationship('SimulationResult', backref='student_sim', lazy='dynamic')
    exercise_logs = db.relationship('ExerciseLog', backref='student_log', lazy='dynamic')

    def __repr__(self):
        return f'<User {self.username}>'

class ChallengeSubmission(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    challenge_id = db.Column(db.Integer, db.ForeignKey('challenge.id'), nullable=False)
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)
    
    # AI Results
    feedback = db.Column(db.Text)
    score = db.Column(db.Integer)  # Overall soft skill score (1-10)
    audio_filename = db.Column(db.String(128))

    def __repr__(self):
        return f'<Submission {self.id} for Challenge {self.challenge_id}>'

class Challenge(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(128), nullable=False)
    category = db.Column(db.String(64))
    objective = db.Column(db.Text)
    instructions = db.Column(db.Text)
    expected_outcome = db.Column(db.Text)
    difficulty = db.Column(db.String(20))
    
    submissions = db.relationship('ChallengeSubmission', backref='challenge_ref', lazy='dynamic')

    def __repr__(self):
        return f'<Challenge {self.title}>'

class SimulationResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    scenario_id = db.Column(db.Integer, db.ForeignKey('simulation_scenario.id'), nullable=False)
    score = db.Column(db.Integer)
    feedback = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)

    def __repr__(self):
        return f'<SimulationResult {self.id} Scen-{self.scenario_id}>'

class SimulationScenario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    topic = db.Column(db.String(128), nullable=False)
    objective = db.Column(db.Text)
    participants = db.Column(db.JSON) # JSON for personas
    
    results = db.relationship('SimulationResult', backref='scenario_ref', lazy='dynamic')

    def __repr__(self):
        return f'<Scenario {self.topic}>'

class ExerciseLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    exercise_id = db.Column(db.Integer, db.ForeignKey('exercise.id'), nullable=False)
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)

    def __repr__(self):
        return f'<ExerciseLog {self.id} Ex-{self.exercise_id}>'

class Exercise(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(128), nullable=False)
    duration = db.Column(db.String(50))
    difficulty = db.Column(db.String(20))
    category = db.Column(db.String(64))
    purpose = db.Column(db.Text)
    psychological_benefit = db.Column(db.Text)
    steps = db.Column(db.JSON) # JSON array of strings
    
    logs = db.relationship('ExerciseLog', backref='exercise_ref', lazy='dynamic')

    def __repr__(self):
        return f'<Exercise {self.title}>'
