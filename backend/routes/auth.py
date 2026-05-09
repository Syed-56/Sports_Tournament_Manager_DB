from flask import Blueprint, jsonify, request
from backend.db import get_db
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data     = request.json
    name     = data.get('name', '').strip()
    password = data.get('password', '')
    role     = data.get('role', '')

    print(f"DEBUG - name: '{name}', password: '{password}', role: '{role}'")  # ADD HERE

    if not name or not password or not role:
        return jsonify({'message': 'Name, password and role are required.'}), 400

    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "SELECT * FROM User WHERE name = %s AND role = %s",
        (name, role)
    )
    user = cursor.fetchone()
    print(f"DEBUG - user found: {user}")  # ADD HERE
    cursor.close()

    if user and check_password_hash(user['password_hash'], password):
        user.pop('password_hash', None)
        return jsonify({'message': 'Login successful', 'user': user}), 200

    return jsonify({'message': 'Invalid name, password or role.'}), 401

@auth_bp.route('/register', methods=['POST'])
def register():
    data    = request.json
    name    = data.get('name', '').strip()
    pwd     = data.get('password', '')
    role    = data.get('role', 'captain')
    team_id = data.get('team_id')

    if not name or not pwd:
        return jsonify({'message': 'Name and password are required.'}), 400

    hashed = generate_password_hash(pwd)
    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute(
            "INSERT INTO User (name, password_hash, role, team_id) VALUES (%s, %s, %s, %s)",
            (name, hashed, role, team_id)
        )
        db.commit()
        return jsonify({'message': 'User created successfully', 'user_id': cursor.lastrowid}), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 400
    finally:
        cursor.close()