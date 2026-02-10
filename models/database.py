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
    
    # Relationship with submissions
    submissions = db.relationship('ChallengeSubmission', backref='student', lazy='dynamic')
    simulation_results = db.relationship('SimulationResult', backref='student_sim', lazy='dynamic')
    exercise_logs = db.relationship('ExerciseLog', backref='student_log', lazy='dynamic')

    def __repr__(self):
        return f'<User {self.username}>'

class ChallengeSubmission(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    challenge_id = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)
    
    # AI Results
    feedback = db.Column(db.Text)
    score = db.Column(db.Integer)  # Overall soft skill score (1-10)
    audio_filename = db.Column(db.String(128))

    def __repr__(self):
        return f'<Submission {self.id} for Challenge {self.challenge_id}>'

class SimulationResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    scenario_id = db.Column(db.Integer, nullable=False)
    score = db.Column(db.Integer)
    feedback = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)

    def __repr__(self):
        return f'<SimulationResult {self.id} Scen-{self.scenario_id}>'

class ExerciseLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    exercise_id = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)

    def __repr__(self):
        return f'<ExerciseLog {self.id} Ex-{self.exercise_id}>'
