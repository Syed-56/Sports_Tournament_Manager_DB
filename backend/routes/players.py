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
    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute(
            "INSERT INTO Player (name, jersey_no, position, team_id) VALUES (%s, %s, %s, %s)",
            (data['name'], data['jersey_no'], data['position'], data['team_id'])
        )
        db.commit()
        return jsonify({'message': 'Player created', 'player_id': cursor.lastrowid}), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 400
    finally:
        cursor.close()