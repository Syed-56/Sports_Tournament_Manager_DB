from flask import Blueprint, jsonify, request, session
from backend.db import get_db
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint('auth', __name__)

# ─────────────────────────────────────────────────────────────
#  LOGIN
# ─────────────────────────────────────────────────────────────
@auth_bp.route('/login', methods=['POST'])
def login():
    data     = request.json
    name     = data.get('name', '').strip()
    password = data.get('password', '')
    role     = data.get('role', '')

    if not name or not password or not role:
        return jsonify({'message': 'Name, password and role are required.'}), 400

    if role not in ('admin', 'referee', 'captain'):
        return jsonify({'message': 'Invalid role.'}), 400

    db     = get_db()
    cursor = db.cursor()
    cursor.execute(
        "SELECT * FROM User WHERE name = %s AND role = %s",
        (name, role)
    )
    user = cursor.fetchone()
    cursor.close()

    if user and check_password_hash(user['password_hash'], password):
        user.pop('password_hash', None)
        return jsonify({'message': 'Login successful', 'user': user}), 200

    return jsonify({'message': 'Invalid name, password or role.'}), 401


# ─────────────────────────────────────────────────────────────
#  REGISTER
#  Rules:
#    • Anyone can call this endpoint to register as 'captain'
#      (optionally linked to a team via team_id).
#    • Creating a 'referee' requires the request to include
#      admin credentials (admin_name + admin_password).
#    • Creating an 'admin' is not allowed via this endpoint.
# ─────────────────────────────────────────────────────────────
@auth_bp.route('/register', methods=['POST'])
def register():
    data    = request.json
    name    = data.get('name', '').strip()
    pwd     = data.get('password', '')
    role    = data.get('role', 'captain')
    team_id = data.get('team_id')          # required for captains

    if not name or not pwd:
        return jsonify({'message': 'Name and password are required.'}), 400

    if role not in ('referee', 'captain'):
        return jsonify({'message': 'Role must be referee or captain. Admins cannot be registered via this endpoint.'}), 403

    # Only admin can register a referee
    if role == 'referee':
        admin_name = data.get('admin_name', '').strip()
        admin_pwd  = data.get('admin_password', '')
        if not admin_name or not admin_pwd:
            return jsonify({'message': 'Admin credentials (admin_name, admin_password) are required to register a referee.'}), 403

        db     = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT * FROM User WHERE name = %s AND role = 'admin'", (admin_name,))
        admin = cursor.fetchone()
        cursor.close()

        if not admin or not check_password_hash(admin['password_hash'], admin_pwd):
            return jsonify({'message': 'Invalid admin credentials.'}), 403

    # Captain must be linked to a team
    if role == 'captain':
        if not team_id:
            return jsonify({'message': 'team_id is required for captain registration.'}), 400
        # Validate team exists
        db     = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT team_id FROM Team WHERE team_id = %s", (team_id,))
        team = cursor.fetchone()
        cursor.close()
        if not team:
            return jsonify({'message': f'Team with id {team_id} not found.'}), 404
        # Only one captain per team
        db     = get_db()
        cursor = db.cursor()
        cursor.execute(
            "SELECT user_id FROM User WHERE role = 'captain' AND team_id = %s",
            (team_id,)
        )
        existing_cap = cursor.fetchone()
        cursor.close()
        if existing_cap:
            return jsonify({'message': 'This team already has a captain.'}), 409

    hashed = generate_password_hash(pwd)
    db     = get_db()
    cursor = db.cursor()
    try:
        cursor.execute(
            "INSERT INTO User (name, password_hash, role, team_id) VALUES (%s, %s, %s, %s)",
            (name, hashed, role, team_id if role == 'captain' else None)
        )
        db.commit()
        return jsonify({'message': f'{role.capitalize()} registered successfully', 'user_id': cursor.lastrowid}), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 400
    finally:
        cursor.close()


# ─────────────────────────────────────────────────────────────
#  GET ALL USERS  (admin only — pass ?role= to filter)
# ─────────────────────────────────────────────────────────────
@auth_bp.route('/users', methods=['GET'])
def get_users():
    role_filter = request.args.get('role')   # ?role=referee or ?role=captain
    db     = get_db()
    cursor = db.cursor()
    if role_filter and role_filter in ('admin', 'referee', 'captain'):
        cursor.execute(
            "SELECT user_id, name, role, team_id FROM User WHERE role = %s",
            (role_filter,)
        )
    else:
        cursor.execute("SELECT user_id, name, role, team_id FROM User")
    users = cursor.fetchall()
    cursor.close()
    return jsonify(users), 200


# ─────────────────────────────────────────────────────────────
#  DELETE USER  (admin action)
# ─────────────────────────────────────────────────────────────
@auth_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    db     = get_db()
    cursor = db.cursor()
    try:
        cursor.execute("DELETE FROM User WHERE user_id = %s AND role != 'admin'", (user_id,))
        db.commit()
        if cursor.rowcount == 0:
            return jsonify({'message': 'User not found or cannot delete admin.'}), 404
        return jsonify({'message': 'User deleted.'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 400
    finally:
        cursor.close()
