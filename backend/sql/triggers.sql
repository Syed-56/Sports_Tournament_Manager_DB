USE tournapro;

DELIMITER $$

-- trg_after_result_insert
-- Recalculates W/D/L/GF/GA for both teams after a result is inserted
CREATE TRIGGER trg_after_result_insert
AFTER INSERT ON Result
FOR EACH ROW
BEGIN
    DECLARE v_home_team_id  INT;
    DECLARE v_away_team_id  INT;
    DECLARE v_tournament_id INT;

    SELECT home_team_id, away_team_id, tournament_id
    INTO   v_home_team_id, v_away_team_id, v_tournament_id
    FROM   T_Match
    WHERE  match_id = NEW.match_id;

    -- Mark match as played
    UPDATE T_Match SET status = 'played' WHERE match_id = NEW.match_id;

    -- ── HOME TEAM ──────────────────────────────────────────────────────────
    INSERT INTO Standings (tournament_id, team_id, played, won, drawn, lost, goals_for, goals_against)
    VALUES (v_tournament_id, v_home_team_id, 1,
            IF(NEW.home_goals > NEW.away_goals, 1, 0),
            IF(NEW.home_goals = NEW.away_goals, 1, 0),
            IF(NEW.home_goals < NEW.away_goals, 1, 0),
            NEW.home_goals, NEW.away_goals)
    ON DUPLICATE KEY UPDATE
        played        = played + 1,
        won           = won   + IF(NEW.home_goals > NEW.away_goals, 1, 0),
        drawn         = drawn + IF(NEW.home_goals = NEW.away_goals, 1, 0),
        lost          = lost  + IF(NEW.home_goals < NEW.away_goals, 1, 0),
        goals_for     = goals_for     + NEW.home_goals,
        goals_against = goals_against + NEW.away_goals;

    -- ── AWAY TEAM ──────────────────────────────────────────────────────────
    INSERT INTO Standings (tournament_id, team_id, played, won, drawn, lost, goals_for, goals_against)
    VALUES (v_tournament_id, v_away_team_id, 1,
            IF(NEW.away_goals > NEW.home_goals, 1, 0),
            IF(NEW.away_goals = NEW.home_goals, 1, 0),
            IF(NEW.away_goals < NEW.home_goals, 1, 0),
            NEW.away_goals, NEW.home_goals)
    ON DUPLICATE KEY UPDATE
        played        = played + 1,
        won           = won   + IF(NEW.away_goals > NEW.home_goals, 1, 0),
        drawn         = drawn + IF(NEW.away_goals = NEW.home_goals, 1, 0),
        lost          = lost  + IF(NEW.away_goals < NEW.home_goals, 1, 0),
        goals_for     = goals_for     + NEW.away_goals,
        goals_against = goals_against + NEW.home_goals;
END$$

DELIMITER ;
