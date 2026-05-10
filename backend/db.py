import pymysql
import pymysql.cursors
from flask import g

def get_db():
    if 'db' not in g:
        g.db = pymysql.connect(
            host        = '127.0.0.1',
            user        = 'root',
            password    = 'sultan10',
            database    = 'tournapro',
            charset     = 'utf8mb4',
            cursorclass = pymysql.cursors.DictCursor,
            autocommit  = False,
            ssl_disabled= True
        )
    return g.db

def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()