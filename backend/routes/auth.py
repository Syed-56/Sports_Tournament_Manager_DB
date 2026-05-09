from flask import Blueprint, jsonify, request
from db import get_db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM User WHERE name = %s AND password_hash = %s", (data.get('name'), data.get('password')))
    user = cursor.fetchone()
    cursor.close()
    
    if user:
        return jsonify({'message': 'Login successful', 'user': user}), 200
    return jsonify({'message': 'Invalid credentials'}), 401

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute(
            "INSERT INTO User (name, password_hash, role, team_id) VALUES (%s, %s, %s, %s)",
            (data.get('name'), data.get('password'), data.get('role', 'captain'), data.get('team_id'))
        )
        db.commit()
        return jsonify({'message': 'User created successfully'}), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 400
    finally:
        cursor.close()


