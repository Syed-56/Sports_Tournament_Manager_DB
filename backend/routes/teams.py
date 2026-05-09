from flask import Blueprint, jsonify, request
from db import get_db

teams_bp = Blueprint('teams', __name__)

@teams_bp.route('/', methods=['GET'])
def get_teams():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM Team")
    teams = cursor.fetchall()
    cursor.close()
    return jsonify(teams)

@teams_bp.route('/<int:id>', methods=['GET'])
def get_teams_by_id(id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM Team WHERE team_id = %s", (id,))
    team = cursor.fetchone()
    cursor.close()
    if team:
        return jsonify(team)
    return jsonify({'message': 'Team not found'}), 404

@teams_bp.route('/', methods=['POST'])
def create_teams():
    data = request.json
    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute(
            "INSERT INTO Team (name, color, group_name) VALUES (%s, %s, %s)",
            (data['name'], data['color'], data['group_name'])
        )
        db.commit()
        return jsonify({'message': 'Team created', 'team_id': cursor.lastrowid}), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 400
    finally:
        cursor.close()


