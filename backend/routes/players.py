from flask import Blueprint, jsonify, request
from backend.db import get_db

players_bp = Blueprint('players', __name__)

@players_bp.route('/', methods=['GET'])
def get_players():
    """Returns players with goals/assists/matches from the view."""
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM vw_top_scorers")
    players = cursor.fetchall()
    cursor.close()
    return jsonify(players)

@players_bp.route('/<int:id>', methods=['GET'])
def get_player_by_id(id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM vw_top_scorers WHERE player_id = %s", (id,))
    player = cursor.fetchone()
    cursor.close()
    if player:
        return jsonify(player)
    return jsonify({'message': 'Player not found'}), 404


@players_bp.route('/', methods=['POST'])
def create_player():
    data = request.json
    if not data.get('name') or not data.get('jersey_no') or not data.get('position') or not data.get('team_id'):
     return jsonify({'message': 'name, jersey_no, position, and team_id are required.'}), 400

    # Extract caller identity (frontend must send this)
    caller_role    = data.get('caller_role', '')
    caller_team_id = data.get('caller_team_id')
    target_team_id = data.get('team_id')

    # Captains can only add players to their own team
    if caller_role == 'captain':
        if not caller_team_id or int(caller_team_id) != int(target_team_id):
            return jsonify({'message': 'Captains can only add players to their own team.'}), 403

    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute(
            "INSERT INTO Player (name, jersey_no, position, team_id) VALUES (%s, %s, %s, %s)",
            (data['name'], data['jersey_no'], data['position'], target_team_id)
        )
        db.commit()
        return jsonify({'message': 'Player created', 'player_id': cursor.lastrowid}), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 400
    finally:
        cursor.close()