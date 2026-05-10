"""
generate_hashes.py
──────────────────
Run this script ONCE to generate real scrypt password hashes
for referee and captain seed accounts, then paste the output
SQL into your MySQL client (or pipe it directly).

Usage:
    python generate_hashes.py

Passwords used:
    Referees  →  ref123
    Captains  →  cap123
"""

from werkzeug.security import generate_password_hash

REF_PASSWORD = "ref123"
CAP_PASSWORD = "cap123"

referees = [
    (3, 'Referee Bilal',  REF_PASSWORD),
]

captains = [
    (4,  'Captain KK', CAP_PASSWORD, 1),
    (5,  'Captain LQ', CAP_PASSWORD, 2),
    (6,  'Captain QG', CAP_PASSWORD, 3),
    (7,  'Captain PZ', CAP_PASSWORD, 4),
    (8,  'Captain IU', CAP_PASSWORD, 5),
    (9,  'Captain MS', CAP_PASSWORD, 6),
    (10, 'Captain FW', CAP_PASSWORD, 7),
    (11, 'Captain SE', CAP_PASSWORD, 8),
]

print("USE tournapro;")
print()

for uid, name, pwd in referees:
    h = generate_password_hash(pwd)
    print(f"UPDATE User SET password_hash='{h}' WHERE user_id={uid};  -- {name} / {pwd}")

print()

for uid, name, pwd, tid in captains:
    h = generate_password_hash(pwd)
    print(f"UPDATE User SET password_hash='{h}' WHERE user_id={uid};  -- {name} / {pwd}")

print()
print("-- Done. Verify with:")
print("SELECT user_id, name, role, team_id FROM User;")
