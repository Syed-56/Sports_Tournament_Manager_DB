from flask import Blueprint, jsonify, request
from db import get_db

fixtures_bp = Blueprint('fixtures', __name__)

@fixtures_bp.route('/', methods=['GET'])
def get_fixtures():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM T_Match")
    matches = cursor.fetchall()
    cursor.close()
    return jsonify(matches)

@fixtures_bp.route('/<int:id>', methods=['GET'])
def get_fixtures_by_id(id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM T_Match WHERE match_id = %s", (id,))
    match = cursor.fetchone()
    cursor.close()
    if match:
        return jsonify(match)
    return jsonify({'message': 'Match not found'}), 404

@fixtures_bp.route('/', methods=['POST'])
def create_fixtures():
    data = request.json
    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute(
            "INSERT INTO T_Match (tournament_id, home_team_id, away_team_id, venue_id, match_date, match_time, status) VALUES (%s, %s, %s, %s, %s, %s, %s)",
            (data['tournament_id'], data['home_team_id'], data['away_team_id'], data['venue_id'], data['match_date'], data.get('match_time'), data.get('status', 'upcoming'))
        )
        db.commit()
        return jsonify({'message': 'Match created', 'match_id': cursor.lastrowid}), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 400
    finally:
        cursor.close()


