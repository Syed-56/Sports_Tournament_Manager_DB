from flask import Flask
from db import close_db

# Import blueprints
from routes.auth import auth_bp
from routes.fixtures import fixtures_bp
from routes.players import players_bp
from routes.standings import standings_bp
from routes.teams import teams_bp
from routes.venues import venues_bp

app = Flask(__name__)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(fixtures_bp, url_prefix='/api/fixtures')
app.register_blueprint(players_bp, url_prefix='/api/players')
app.register_blueprint(standings_bp, url_prefix='/api/standings')
app.register_blueprint(teams_bp, url_prefix='/api/teams')
app.register_blueprint(venues_bp, url_prefix='/api/venues')

# Teardown context to close DB connections automatically after each request
app.teardown_appcontext(close_db)

if __name__ == '__main__':
    app.run(debug=True)
