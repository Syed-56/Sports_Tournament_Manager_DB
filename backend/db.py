import pymysql
import pymysql.cursors
from flask import g

def get_db():
    if 'db' not in g:
        g.db = pymysql.connect(
            host        = 'localhost',
            user        = 'root',
            password    = 'sultan-rayyan-hamza',
            database    = 'tournapro',
            charset     = 'utf8mb4',
            cursorclass = pymysql.cursors.DictCursor,
            autocommit  = False
        )
    return g.db

def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()