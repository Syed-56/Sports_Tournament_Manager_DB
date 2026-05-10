import pymysql
import pymysql.cursors
from flask import g
import os

def get_db():
    g.db = pymysql.connect(
        host     = os.environ.get('DB_HOST', '127.0.0.1'),
        user     = os.environ.get('DB_USER', 'root'),
        password = os.environ.get('DB_PASSWORD', 'sultan10'),
        database = os.environ.get('DB_NAME', 'tournapro'),
        port = int(os.environ.get('DB_PORT', 3306)),
        charset     = 'utf8mb4',
        cursorclass = pymysql.cursors.DictCursor,
        autocommit  = False,
    )
    return g.db

def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()