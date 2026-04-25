USE tournapro;

--vw_group_standings
-- Shows full standings per group with all stats
CREATE OR REPLACE VIEW vw_group_standings AS
SELECT
    t.team_id,
    t.name          AS team_name,
    t.color,
    t.group_name,
    s.played,
    s.won,
    s.drawn,
    s.lost,
    s.goals_for,
    s.goals_against,
    s.goal_diff,
    s.points
FROM Standings s
JOIN Team t ON s.team_id = t.team_id
ORDER BY t.group_name, s.points DESC, s.goal_diff DESC;

--vw_top_scorers 
-- Aggregated goals and assists per player across all matches
CREATE OR REPLACE VIEW vw_top_scorers AS
SELECT
    p.player_id,
    p.name          AS player_name,
    p.jersey_no,
    p.position,
    t.name          AS team_name,
    t.color,
    COUNT(CASE WHEN g.is_own_goal = FALSE AND g.is_assist = FALSE THEN 1 END) AS goals,
    COUNT(CASE WHEN g.is_assist = TRUE THEN 1 END)                            AS assists,
    COUNT(DISTINCT m.match_id)                                                AS matches_played
FROM Player p
JOIN Team t         ON p.team_id   = t.team_id
LEFT JOIN Goal g    ON p.player_id = g.player_id
LEFT JOIN T_Match m   ON g.match_id  = m.match_id AND m.status = 'played'
GROUP BY p.player_id, p.name, p.jersey_no, p.position, t.name, t.color
ORDER BY goals DESC, assists DESC;

--vw_fixture_schedule 
-- Denormalized fixture list with team names and venue info
CREATE OR REPLACE VIEW vw_fixture_schedule AS
SELECT
    m.match_id,
    m.match_date,
    m.match_time,
    m.status,
    ht.name         AS home_team,
    ht.color        AS home_color,
    at.name         AS away_team,
    at.color        AS away_color,
    v.name          AS venue_name,
    v.city          AS venue_city,
    r.home_goals,
    r.away_goals,
    tr.name         AS tournament_name
FROM T_Match m
JOIN Team ht            ON m.home_team_id    = ht.team_id
JOIN Team at            ON m.away_team_id    = at.team_id
JOIN Venue v            ON m.venue_id        = v.venue_id
JOIN Tournament tr      ON m.tournament_id   = tr.tournament_id
LEFT JOIN Result r      ON m.match_id        = r.match_id
ORDER BY m.match_date, m.match_time;

SHOW FULL TABLES WHERE Table_type = 'VIEW';
