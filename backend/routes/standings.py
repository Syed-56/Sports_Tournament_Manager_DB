from flask import Blueprint, jsonify
from backend.db import get_db

standings_bp = Blueprint('standings', __name__)

@standings_bp.route('/', methods=['GET'])
def get_standings():
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM vw_group_standings")
    standings = cursor.fetchall()
    cursor.close()
    return jsonify(standings)

@standings_bp.route('/group/<group>', methods=['GET'])
def get_standings_by_group(group):
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "SELECT * FROM vw_group_standings WHERE group_name = %s",
        (group.upper(),)
    )
    standings = cursor.fetchall()
    cursor.close()
    return jsonify(standings)