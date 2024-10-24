import os
import time
from collections import defaultdict
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_wtf.csrf import CSRFProtect, generate_csrf
from flask_cors import CORS  # Import CORS
from dotenv import load_dotenv

# Charger les variables d'environnement depuis le fichier .env
load_dotenv()

app = Flask(__name__)

# Enable CORS
CORS(app, supports_credentials=True)  # Allow credentials and configure CORS

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default_secret_key')
app.config['WTF_CSRF_SECRET_KEY'] = os.getenv('WTF_CSRF_SECRET_KEY', 'default_wtf_secret_key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI', 'sqlite:///users.db')
db = SQLAlchemy(app)
csrf = CSRFProtect(app)

# Dictionnaire pour suivre les tentatives de connexion
login_attempts = defaultdict(lambda: {'attempts': 0, 'first_attempt': None})

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)

@app.route('/api/get_csrf_token', methods=['GET'])
def get_csrf_token():
    csrf_token = generate_csrf()  # Générer le token CSRF directement
    return jsonify({'csrf_token': csrf_token})  # Renvoyer le token CSRF en JSON

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    # Vérification des tentatives
    attempts_info = login_attempts[username]
    current_time = time.time()

    if attempts_info['attempts'] >= 5:
        if current_time - attempts_info['first_attempt'] < 900:  # 15 minutes
            return jsonify({'msg': 'Trop de tentatives, veuillez réessayer plus tard.'}), 429

    user = User.query.filter_by(username=username).first()
    
    # Authentification
    if user and check_password_hash(user.password, password):
        login_attempts[username] = {'attempts': 0, 'first_attempt': None}
        return jsonify({'msg': 'Connexion réussie!'}), 200

    # Incrémente le compteur de tentatives
    if attempts_info['first_attempt'] is None:
        attempts_info['first_attempt'] = current_time
    attempts_info['attempts'] += 1

    return jsonify({'msg': 'Nom d’utilisateur ou mot de passe incorrect'}), 401

def create_db_and_user():
    with app.app_context():  # Création d'un contexte d'application
        db.create_all()  # Crée la base de données

        # Créez un utilisateur par défaut si la base de données est vide
        if User.query.count() == 0:
            hashed_password = generate_password_hash('test')  # Pas de méthode spécifiée
            user = User(username='test', password=hashed_password)
            db.session.add(user)
            db.session.commit()
            print("Utilisateur de test créé avec succès.")

if __name__ == '__main__':
    create_db_and_user()  # Crée la base de données et l'utilisateur par défaut si nécessaire
    app.run(debug=True)
