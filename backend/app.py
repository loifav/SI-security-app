import os
import time
from collections import defaultdict
from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_wtf.csrf import CSRFProtect, generate_csrf
from flask_cors import CORS
from dotenv import load_dotenv
import logging

load_dotenv()

app = Flask(__name__)

CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default_secret_key')
app.config['WTF_CSRF_SECRET_KEY'] = os.getenv('WTF_CSRF_SECRET_KEY', 'default_wtf_secret_key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI', 'sqlite:///users.db')
app.config['SESSION_COOKIE_HTTPONLY'] = True 
app.config['SESSION_COOKIE_SECURE'] = False 
app.config['SESSION_PERMANENT'] = False 
app.config['PERMANENT_SESSION_LIFETIME'] = 5 
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

db = SQLAlchemy(app)
csrf = CSRFProtect(app)

logging.basicConfig(level=logging.DEBUG)

login_attempts = defaultdict(lambda: {'attempts': 0, 'first_attempt': None})

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)

@app.route('/api/get_csrf_token', methods=['GET'])
def get_csrf_token():
    csrf_token = generate_csrf() 
    logging.debug(f"CSRF Token generated: {csrf_token}") 
    return jsonify({'csrf_token': csrf_token}) 

@app.route('/api/login', methods=['POST'])
def login():
    logging.debug(f"Received headers: {request.headers}") 
    csrf_token = request.headers.get('X-CSRF-Token') 
    logging.debug(f"CSRF Token from header: {csrf_token}")

    if not csrf_token:
        logging.warning("CSRF token is missing.")
        return jsonify({'msg': 'The CSRF session token is missing.'}), 400

    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    logging.debug(f"Received credentials: Username: {username}, Password: {'*' * len(password)}")

    attempts_info = login_attempts[username]
    current_time = time.time()

    if attempts_info['attempts'] >= 5:
        if current_time - attempts_info['first_attempt'] < 900: 
            logging.warning(f"User {username} has exceeded login attempts.")
            return jsonify({'msg': 'Too many attempts, please try again later.'}), 429

    user = User.query.filter_by(username=username).first()

    if user and check_password_hash(user.password, password):
        login_attempts[username] = {'attempts': 0, 'first_attempt': None}
        logging.info(f"User {username} logged in successfully.")
        
        session['user_id'] = user.id
        session.permanent = False
        return jsonify({'msg': 'Login successful!'}), 200

    if attempts_info['first_attempt'] is None:
        attempts_info['first_attempt'] = current_time
    attempts_info['attempts'] += 1
    logging.warning(f"Login attempt failed for {username}. Attempts: {attempts_info['attempts']}")

    return jsonify({'msg': 'Invalid username or password.'}), 401

@app.route('/api/get_user', methods=['GET'])
def get_user():
    if 'user_id' in session:
        user = session.get(User, session['user_id'])
        if user:
            return jsonify({'username': user.username}), 200
    return jsonify({'msg': 'User not found.'}), 404

@app.route('/api/logout', methods=['POST'])
def logout():
    csrf_token = request.headers.get('X-CSRF-Token')
    
    if not csrf_token:
        app.logger.error("CSRF token is missing.")
        return jsonify({'msg': 'CSRF token is missing.'}), 400
    
    session.clear()
    app.logger.info("User logged out successfully.")
    return jsonify({'msg': 'Logged out successfully!'}), 200

@app.route('/api/check_logged_in', methods=['GET'])
def check_logged_in():
    app.logger.debug(f"Session data: {session}")
    if 'user_id' in session:
        return jsonify({'logged_in': True}), 200
    return jsonify({'logged_in': False}), 200

@app.route('/protected')
def protected():
    if 'user_id' in session:
        return jsonify({'msg': 'Welcome to the protected page!'}), 200
    else:
        return jsonify({'msg': 'You need to log in to access this page.'}), 401 

def create_db_and_user():
    with app.app_context():
        db.create_all()

        if User.query.count() == 0:
            hashed_password = generate_password_hash('test')
            user = User(username='test', password=hashed_password)
            db.session.add(user)
            db.session.commit()
            logging.info("Default user created successfully.")

if __name__ == '__main__':
    create_db_and_user()
    app.run(debug=True)
