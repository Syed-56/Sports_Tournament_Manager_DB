from flask import Blueprint, jsonify, request
from backend.db import get_db

fixtures_bp = Blueprint('fixtures', __name__)

@fixtures_bp.route('/', methods=['GET'])
def get_fixtures():
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM vw_fixture_schedule")
    matches = cursor.fetchall()
    cursor.close()
    # convert date/time objects to strings for JSON
    for m in matches:
        if m.get('match_date'):
            m['match_date'] = str(m['match_date'])
        if m.get('match_time'):
            m['match_time'] = str(m['match_time'])
    return jsonify(matches)

@fixtures_bp.route('/<int:id>', methods=['GET'])
def get_fixture_by_id(id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM vw_fixture_schedule WHERE match_id = %s", (id,))
    match = cursor.fetchone()
    cursor.close()
    if match:
        if match.get('match_date'): match['match_date'] = str(match['match_date'])
        if match.get('match_time'): match['match_time'] = str(match['match_time'])
        return jsonify(match)
    return jsonify({'message': 'Match not found'}), 404

@fixtures_bp.route('/', methods=['POST'])
def create_fixture():
    data = request.json
    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute(
            "INSERT INTO T_Match (tournament_id, home_team_id, away_team_id, venue_id, match_date, match_time, status) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s)",
            (data['tournament_id'], data['home_team_id'], data['away_team_id'],
             data['venue_id'], data['match_date'], data.get('match_time'), data.get('status', 'upcoming'))
        )
        db.commit()
        return jsonify({'message': 'Match created', 'match_id': cursor.lastrowid}), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 400
    finally:
        cursor.close()

@fixtures_bp.route('/<int:id>/result', methods=['POST'])
def record_result(id):
    """Calls sp_record_result; trigger handles standings update automatically."""
    data        = request.json
    home_goals  = data.get('home_goals', 0)
    away_goals  = data.get('away_goals', 0)
    referee_id  = data.get('referee_id', 1)

    db = get_db()
    cursor = db.cursor()
    try:
        cursor.callproc('sp_record_result', [id, home_goals, away_goals, referee_id])
        db.commit()
        return jsonify({'message': 'Result recorded successfully'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 400
    finally:
        cursor.close()