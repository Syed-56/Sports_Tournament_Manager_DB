from flask import Blueprint, jsonify, request
from backend.db import get_db

venues_bp = Blueprint('venues', __name__)

@venues_bp.route('/', methods=['GET'])
def get_venues():
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM Venue")
    venues = cursor.fetchall()
    cursor.close()
    return jsonify(venues)

@venues_bp.route('/<int:id>', methods=['GET'])
def get_venues_by_id(id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM Venue WHERE venue_id = %s", (id,))
    venue = cursor.fetchone()
    cursor.close()
    if venue:
        return jsonify(venue)
    return jsonify({'message': 'Venue not found'}), 404

@venues_bp.route('/', methods=['POST'])
def create_venues():
    data = request.json
    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute(
            "INSERT INTO Venue (name, city, capacity, surface) VALUES (%s, %s, %s, %s)",
            (data['name'], data['city'], data['capacity'], data['surface'])
        )
        db.commit()
        return jsonify({'message': 'Venue created', 'venue_id': cursor.lastrowid}), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 400
    finally:
        cursor.close()


