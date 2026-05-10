from flask import Flask, send_from_directory
from backend.db import close_db
import os
from backend.routes.auth     import auth_bp
from backend.routes.fixtures import fixtures_bp
from backend.routes.players  import players_bp
from backend.routes.standings import standings_bp
from backend.routes.teams    import teams_bp
from backend.routes.venues   import venues_bp

app = Flask(__name__, static_folder='frontend', static_url_path='/frontend')
app.secret_key = 'tournapro-dev-secret'   # change for production

# ── Register blueprints ──
app.register_blueprint(auth_bp,      url_prefix='/api/auth')
app.register_blueprint(fixtures_bp,  url_prefix='/api/fixtures')
app.register_blueprint(players_bp,   url_prefix='/api/players')
app.register_blueprint(standings_bp, url_prefix='/api/standings')
app.register_blueprint(teams_bp,     url_prefix='/api/teams')
app.register_blueprint(venues_bp,    url_prefix='/api/venues')

# ── Serve HTML pages ──
@app.route('/')
@app.route('/index.html')
def login_page():
    return send_from_directory('.', 'index.html')

@app.route('/mainPage.html')
def main_page():
    return send_from_directory('.', 'mainPage.html')

# ── DB teardown ──
app.teardown_appcontext(close_db)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)