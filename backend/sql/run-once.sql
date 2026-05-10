
--  run-once.sql  –  TournaPro seed data
--  Run this ONCE after schema.sql has been executed.

--  1. TOURNAMENT
INSERT IGNORE INTO Tournament (tournament_id, name, season, start_date, end_date, status)
VALUES (1, 'Spring Cup 2026', '2026', '2026-03-01', '2026-05-31', 'active');


--  2. VENUES
INSERT IGNORE INTO Venue (venue_id, name, city, capacity, surface) VALUES
(1, 'National Stadium',    'Karachi',   55000, 'Natural'),
(2, 'City Sports Complex', 'Lahore',    30000, 'Artificial'),
(3, 'Green Arena',         'Islamabad', 20000, 'Hybrid');

--  3. TEAMS
INSERT IGNORE INTO Team (team_id, name, color, group_name) VALUES
(1, 'Karachi Kings',     '#1A73E8', 'A'),
(2, 'Lahore Lions',      '#E53935', 'A'),
(3, 'Quetta Gladiators', '#43A047', 'A'),
(4, 'Peshawar Zalmi',    '#FB8C00', 'A'),
(5, 'Islamabad United',  '#8E24AA', 'B'),
(6, 'Multan Sultans',    '#00ACC1', 'B'),
(7, 'Faisalabad Wolves', '#F4511E', 'B'),
(8, 'Sialkot Eagles',    '#6D4C41', 'B');


--  4. ENROLL TEAMS IN TOURNAMENT + INIT STANDINGS
INSERT IGNORE INTO Tournament_Team (tournament_id, team_id) VALUES
(1,1),(1,2),(1,3),(1,4),(1,5),(1,6),(1,7),(1,8);

INSERT IGNORE INTO Standings (tournament_id, team_id) VALUES
(1,1),(1,2),(1,3),(1,4),(1,5),(1,6),(1,7),(1,8);


--  5. PLAYERS  (5 per team)
INSERT IGNORE INTO Player (player_id, name, jersey_no, position, team_id) VALUES
(1,  'Ali Raza',         10, 'FW', 1),
(2,  'Usman Tariq',       7, 'MF', 1),
(3,  'Bilal Ahmed',       5, 'DF', 1),
(4,  'Hamza Sheikh',      1, 'GK', 1),
(5,  'Saad Malik',        9, 'FW', 1),
(6,  'Faisal Khan',      11, 'FW', 2),
(7,  'Tariq Mehmood',     8, 'MF', 2),
(8,  'Zubair Hussain',    4, 'DF', 2),
(9,  'Imran Butt',        1, 'GK', 2),
(10, 'Naveed Akhtar',     9, 'FW', 2),
(11, 'Rashid Shah',      10, 'FW', 3),
(12, 'Khalid Noor',       6, 'MF', 3),
(13, 'Danish Baloch',     3, 'DF', 3),
(14, 'Arif Zaman',        1, 'GK', 3),
(15, 'Yasir Qureshi',     9, 'MF', 3),
(16, 'Shahzad Afridi',   10, 'FW', 4),
(17, 'Junaid Khan',       7, 'MF', 4),
(18, 'Adeel Baig',        5, 'DF', 4),
(19, 'Waqar Yousuf',      1, 'GK', 4),
(20, 'Asim Nawaz',        9, 'FW', 4),
(21, 'Sohail Rana',      10, 'FW', 5),
(22, 'Mohsin Ali',        8, 'MF', 5),
(23, 'Farhan Iqbal',      4, 'DF', 5),
(24, 'Kamran Akmal',      1, 'GK', 5),
(25, 'Omer Saeed',        9, 'FW', 5),
(26, 'Rizwan Shah',      11, 'FW', 6),
(27, 'Amir Cheema',       7, 'MF', 6),
(28, 'Basit Ali',         3, 'DF', 6),
(29, 'Sarfraz Ahmed',     1, 'GK', 6),
(30, 'Haris Sohail',      9, 'FW', 6),
(31, 'Umar Gul',         10, 'FW', 7),
(32, 'Shoaib Malik',      8, 'MF', 7),
(33, 'Wahab Riaz',        5, 'DF', 7),
(34, 'Zulfiqar Babar',    1, 'GK', 7),
(35, 'Asad Shafiq',       9, 'FW', 7),
(36, 'Ahsan Ali',        10, 'FW', 8),
(37, 'Babar Azam',        7, 'MF', 8),
(38, 'Shadab Khan',       4, 'DF', 8),
(39, 'Mohammad Rizwan',   1, 'GK', 8),
(40, 'Iftikhar Ahmed',    9, 'FW', 8);


--  6. USERS
--  Passwords are re-hashed at runtime via generate_hashes.py.
--  To create users with REAL hashes, run:
--      python generate_hashes.py
--  then execute the output SQL, OR use POST /api/auth/register
--  as admin.
--
--  The admin hash below is the original from the project.
--  Referees & captains use a placeholder — replace before prod.

-- Admin (password: sultan-rayyan-hamza)
INSERT IGNORE INTO User (user_id, name, password_hash, role, team_id) VALUES
(1, 'Admin',
 'scrypt:32768:8:1$gnxP2v8KgfthO84L$38e72b22e0b41c24628245d81c5c963a7d64e07296d3f078674c38cbde6aea64ae5850a20d1d3795ec4013e65cc2dca804986202dc7d10910896df73696d992a',
 'admin', NULL);

-- Referees  (PLACEHOLDER hashes – regenerate with generate_hashes.py)
INSERT IGNORE INTO User (user_id, name, password_hash, role, team_id) VALUES
(3, 'Referee Bilal',  'scrypt:32768:8:1$0naY8vL2X450PE8B$587bc05938de0fbd8e428b149ec7f2bec4a2d83f6135c329bf23e3906a457fbf5ed789047736e8156e6d50388d1846fdaf0cf73333fdb02013b2fb7d735a77ad', 'referee', NULL);

-- Captains  (PLACEHOLDER hashes – regenerate with generate_hashes.py)
INSERT IGNORE INTO User (user_id, name, password_hash, role, team_id) VALUES
(4,  'Captain KK', 'scrypt:32768:8:1$pj3nOTFw56roIEWC$bd5d1bf4806da2c8695e8216930b358921227559a3b87e6797293da7316c1566f6843ebd09375bc24ad4658fde3a0a4f827a22ef531df8642b7fd3d21e18df79', 'captain', 1),
(5,  'Captain LL', 'scrypt:32768:8:1$sNtppagHoF5c4Un2$add893ccdca584f563f31cd1a5bed4f08c1f6c005e836439f1e64c07826b71d23c73045c9eb606718295c3b33a059271c1278df342b122c0071765583ce0364a', 'captain', 2),
(6,  'Captain QG', 'scrypt:32768:8:1$s27Xs2kwJRVcASl3$c80635340375308237365b4f1309c23361412a07d22be96d78885d0f1da8b7c3eddd9fa1febd8dd23cae4a95840afd209941d4c59e728e97b68adad46d12e077', 'captain', 3),
(7,  'Captain PZ', 'scrypt:32768:8:1$eH94J5K56i62mWUX$cfa60470a1355c9adc6e57e8f39fb0f2a1f03a791258292ecb4835f8626cdc946a7bfb78432f811dc7a7721fbba94ac74e92ab56f22993d05f139a2b94b3a302', 'captain', 4),
(8,  'Captain IU', 'scrypt:32768:8:1$hUBwBj8nDIUSr5AY$2667166ae82ac9b30353b63b91a9e3e1833161298705990754532ff20e5f6269d3df9fd96bd692513a735c0d2c32707bc5bc7f7d9dd88dc8513d0d7857e945ab', 'captain', 5),
(9,  'Captain MS', 'scrypt:32768:8:1$O8hn9pqy2jeZAFmS$d0da6e1f3d8117941e2f343cf6d3d4c1eb2901f24aefaca0ff0d80db31c192dc7251059e0ae28ad7a7f10e06f4ac1044400e8319423acae2304b80f732e9d459', 'captain', 6),
(10, 'Captain FW', 'scrypt:32768:8:1$8Se1Wg3E7TxDVTML$7cea793d517978e76048713e22bc00fb7489371bffdf0bcf85d577bcdf91b2d0d3db17dd19c61ef5e927ab8cd01de722e0f0d093e69cb12fd5caeb324b7c95ef', 'captain', 7),
(11, 'Captain SE', 'scrypt:32768:8:1$NWbKMWaIRoI1i4DI$e6596cb14e5868bc07eefab0c580458b0d8079ecad81cca8289e76e51119e0a15cbf777908ccd66c63a9bd15c5b1ffad5dc45658c6ecd729693c66d4fe4939fa', 'captain', 8);
SELECT user_id, name, role, team_id FROM User;


--  7. MATCHES  (12 group-stage played + 2 upcoming semi-finals)
INSERT IGNORE INTO T_Match
  (match_id, tournament_id, home_team_id, away_team_id, venue_id, match_date, match_time, status)
VALUES
-- Group A
(1,  1, 1, 2, 1, '2026-03-05', '15:00:00', 'played'),
(2,  1, 3, 4, 2, '2026-03-06', '15:00:00', 'played'),
(3,  1, 1, 3, 1, '2026-03-12', '15:00:00', 'played'),
(4,  1, 2, 4, 2, '2026-03-13', '15:00:00', 'played'),
(5,  1, 1, 4, 3, '2026-03-19', '15:00:00', 'played'),
(6,  1, 2, 3, 1, '2026-03-20', '15:00:00', 'played'),
-- Group B
(7,  1, 5, 6, 2, '2026-03-05', '18:00:00', 'played'),
(8,  1, 7, 8, 3, '2026-03-06', '18:00:00', 'played'),
(9,  1, 5, 7, 2, '2026-03-12', '18:00:00', 'played'),
(10, 1, 6, 8, 1, '2026-03-13', '18:00:00', 'played'),
(11, 1, 5, 8, 3, '2026-03-19', '18:00:00', 'played'),
(12, 1, 6, 7, 2, '2026-03-20', '18:00:00', 'played'),
-- Semi-Finals (upcoming)
(13, 1, 1, 5, 1, '2026-04-10', '15:00:00', 'upcoming'),
(14, 1, 2, 6, 1, '2026-04-10', '18:00:00', 'upcoming');


--  8. RESULTS  (trigger updates Standings automatically)
--     recorded_by = 2 (Referee Ahmed)  or  3 (Referee Bilal)
INSERT IGNORE INTO Result (match_id, home_goals, away_goals, recorded_by) VALUES
-- Group A results
(1,  3, 1, 2),   -- KK 3-1 LL
(2,  1, 1, 2),   -- QG 1-1 PZ
(3,  2, 0, 2),   -- KK 2-0 QG
(4,  2, 3, 2),   -- LL 2-3 PZ
(5,  1, 2, 2),   -- KK 1-2 PZ
(6,  0, 1, 2),   -- LL 0-1 QG
-- Group B results
(7,  2, 1, 3),   -- IU 2-1 MS
(8,  3, 3, 3),   -- FW 3-3 SE
(9,  1, 0, 3),   -- IU 1-0 FW
(10, 2, 2, 3),   -- MS 2-2 SE
(11, 4, 1, 3),   -- IU 4-1 SE
(12, 1, 2, 3);   -- MS 1-2 FW

--  9. GOALS  (powers vw_top_scorers)
INSERT IGNORE INTO Goal (match_id, player_id, minute, is_own_goal, is_assist) VALUES
-- Match 1 KK 3-1 LL
(1,  1,  12, FALSE, FALSE),
(1,  5,  34, FALSE, FALSE),
(1,  2,  67, FALSE, TRUE),
(1,  1,  80, FALSE, FALSE),
(1,  6,  88, FALSE, FALSE),
-- Match 2 QG 1-1 PZ
(2,  11, 22, FALSE, FALSE),
(2,  16, 55, FALSE, FALSE),
-- Match 3 KK 2-0 QG
(3,  5,  15, FALSE, FALSE),
(3,  1,  72, FALSE, FALSE),
-- Match 4 LL 2-3 PZ
(4,  6,  10, FALSE, FALSE),
(4,  10, 40, FALSE, FALSE),
(4,  16, 25, FALSE, FALSE),
(4,  20, 60, FALSE, FALSE),
(4,  16, 85, FALSE, FALSE),
-- Match 5 KK 1-2 PZ
(5,  5,  30, FALSE, FALSE),
(5,  20, 50, FALSE, FALSE),
(5,  16, 77, FALSE, FALSE),
-- Match 6 LL 0-1 QG
(6,  11, 65, FALSE, FALSE),
-- Match 7 IU 2-1 MS
(7,  21, 20, FALSE, FALSE),
(7,  25, 55, FALSE, FALSE),
(7,  26, 44, FALSE, FALSE),
-- Match 8 FW 3-3 SE
(8,  31, 11, FALSE, FALSE),
(8,  35, 33, FALSE, FALSE),
(8,  31, 70, FALSE, FALSE),
(8,  36, 22, FALSE, FALSE),
(8,  40, 55, FALSE, FALSE),
(8,  37, 88, FALSE, TRUE),
-- Match 9 IU 1-0 FW
(9,  21, 45, FALSE, FALSE),
-- Match 10 MS 2-2 SE
(10, 30, 15, FALSE, FALSE),
(10, 26, 60, FALSE, FALSE),
(10, 36, 35, FALSE, FALSE),
(10, 40, 80, FALSE, FALSE),
-- Match 11 IU 4-1 SE
(11, 21, 10, FALSE, FALSE),
(11, 25, 28, FALSE, FALSE),
(11, 21, 50, FALSE, FALSE),
(11, 25, 75, FALSE, FALSE),
(11, 40, 65, FALSE, FALSE),
-- Match 12 MS 1-2 FW
(12, 30, 20, FALSE, FALSE),
(12, 31, 38, FALSE, FALSE),
(12, 35, 82, FALSE, FALSE);


--  VERIFY
SELECT 'Users'      AS entity, COUNT(*) AS total FROM User
UNION ALL SELECT 'Teams',     COUNT(*) FROM Team
UNION ALL SELECT 'Players',   COUNT(*) FROM Player
UNION ALL SELECT 'Venues',    COUNT(*) FROM Venue
UNION ALL SELECT 'Matches',   COUNT(*) FROM T_Match
UNION ALL SELECT 'Results',   COUNT(*) FROM Result
UNION ALL SELECT 'Goals',     COUNT(*) FROM Goal
UNION ALL SELECT 'Standings', COUNT(*) FROM Standings;

