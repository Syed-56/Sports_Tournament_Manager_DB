from flask import Blueprint, jsonify, request
from db import get_db

standings_bp = Blueprint('standings', __name__)

@standings_bp.route('/', methods=['GET'])
def get_standings():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT s.*, t.name as team_name 
        FROM Standings s
        JOIN Team t ON s.team_id = t.team_id
        ORDER BY s.won DESC, s.goal_diff DESC
    """)
    standings = cursor.fetchall()
    cursor.close()
    return jsonify(standings)

@standings_bp.route('/<int:id>', methods=['GET'])
def get_standings_by_id(id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT s.*, t.name as team_name 
        FROM Standings s
        JOIN Team t ON s.team_id = t.team_id
        WHERE s.standing_id = %s
    """, (id,))
    standing = cursor.fetchone()
    cursor.close()
    if standing:
        return jsonify(standing)
    return jsonify({'message': 'Standing not found'}), 404


