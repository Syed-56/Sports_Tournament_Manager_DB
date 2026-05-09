    USE tournapro;

    DELIMITER $$

    -- ─────────────────────────────────────────────────────────────────────────────
    -- sp_record_result(match_id, home_goals, away_goals, referee_user_id)
    -- Validates and inserts a result atomically; standings updated by trigger.
    -- ─────────────────────────────────────────────────────────────────────────────
    CREATE PROCEDURE sp_record_result(
        IN p_match_id   INT,
        IN p_home_goals INT,
        IN p_away_goals INT,
        IN p_referee_id INT
    )
    BEGIN
        DECLARE v_status VARCHAR(10);
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            ROLLBACK;
            RESIGNAL;
        END;

        -- Validate match exists and is not already played
        SELECT status INTO v_status FROM T_Match WHERE match_id = p_match_id;
        IF v_status IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Match not found.';
        END IF;
        IF v_status = 'played' THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Result already recorded for this match.';
        END IF;
        IF p_home_goals < 0 OR p_away_goals < 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Goals cannot be negative.';
        END IF;

        START TRANSACTION;
            INSERT INTO Result (match_id, home_goals, away_goals, recorded_by)
            VALUES (p_match_id, p_home_goals, p_away_goals, p_referee_id);
            -- standings update handled by trg_after_result_insert
        COMMIT;
    END$$


    -- ─────────────────────────────────────────────────────────────────────────────
    -- sp_register_team(tournament_id, team_id)
    -- Validates enrollment capacity then registers team in tournament.
    -- ─────────────────────────────────────────────────────────────────────────────
    CREATE PROCEDURE sp_register_team(
        IN p_tournament_id INT,
        IN p_team_id       INT
    )
    BEGIN
        DECLARE v_count     INT;
        DECLARE v_t_status  VARCHAR(20);
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            ROLLBACK;
            RESIGNAL;
        END;

        SELECT status INTO v_t_status FROM Tournament WHERE tournament_id = p_tournament_id;
        IF v_t_status IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tournament not found.';
        END IF;
        IF v_t_status = 'completed' THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot register: tournament is completed.';
        END IF;

        -- Max 2 groups × 4 teams = 8 teams (adjust limit as needed)
        SELECT COUNT(*) INTO v_count FROM Tournament_Team WHERE tournament_id = p_tournament_id;
        IF v_count >= 8 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tournament is full (max 8 teams).';
        END IF;

        START TRANSACTION;
            INSERT IGNORE INTO Tournament_Team (tournament_id, team_id) VALUES (p_tournament_id, p_team_id);

            -- Initialise standings row for the team
            INSERT IGNORE INTO Standings (tournament_id, team_id) VALUES (p_tournament_id, p_team_id);
        COMMIT;
    END$$


    -- ─────────────────────────────────────────────────────────────────────────────
    -- sp_generate_bracket(tournament_id)
    -- Reads group standings and creates semi-final fixtures (1A vs 2B, 1B vs 2A).
    -- Admin must supply a venue_id and match scheduling details afterwards.
    -- ─────────────────────────────────────────────────────────────────────────────
    CREATE PROCEDURE sp_generate_bracket(
        IN p_tournament_id INT,
        IN p_venue_id      INT,
        IN p_sf1_date      DATE,
        IN p_sf2_date      DATE
    )
    BEGIN
        DECLARE v_winner_a  INT;
        DECLARE v_runner_a  INT;
        DECLARE v_winner_b  INT;
        DECLARE v_runner_b  INT;
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            ROLLBACK;
            RESIGNAL;
        END;

        -- Group A: top two by points then goal_diff
        SELECT s.team_id INTO v_winner_a
        FROM Standings s JOIN Team t ON s.team_id = t.team_id
        WHERE s.tournament_id = p_tournament_id AND t.group_name = 'A'
        ORDER BY s.points DESC, s.goal_diff DESC LIMIT 1;

        SELECT s.team_id INTO v_runner_a
        FROM Standings s JOIN Team t ON s.team_id = t.team_id
        WHERE s.tournament_id = p_tournament_id AND t.group_name = 'A'
        AND s.team_id <> v_winner_a
        ORDER BY s.points DESC, s.goal_diff DESC LIMIT 1;

        -- Group B: top two
        SELECT s.team_id INTO v_winner_b
        FROM Standings s JOIN Team t ON s.team_id = t.team_id
        WHERE s.tournament_id = p_tournament_id AND t.group_name = 'B'
        ORDER BY s.points DESC, s.goal_diff DESC LIMIT 1;

        SELECT s.team_id INTO v_runner_b
        FROM Standings s JOIN Team t ON s.team_id = t.team_id
        WHERE s.tournament_id = p_tournament_id AND t.group_name = 'B'
        AND s.team_id <> v_winner_b
        ORDER BY s.points DESC, s.goal_diff DESC LIMIT 1;

        START TRANSACTION;
            -- SF1: 1A vs 2B
            INSERT INTO T_Match (tournament_id, home_team_id, away_team_id, venue_id, match_date, status)
            VALUES (p_tournament_id, v_winner_a, v_runner_b, p_venue_id, p_sf1_date, 'upcoming');

            -- SF2: 1B vs 2A
            INSERT INTO T_Match (tournament_id, home_team_id, away_team_id, venue_id, match_date, status)
            VALUES (p_tournament_id, v_winner_b, v_runner_a, p_venue_id, p_sf2_date, 'upcoming');
        COMMIT;
    END$$

    DELIMITER ;
