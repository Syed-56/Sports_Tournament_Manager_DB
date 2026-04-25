-- Tournament
USE tournapro;
CREATE TABLE Tournament (
    tournament_id   INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,
    season          VARCHAR(20)     NOT NULL,
    start_date      DATE            NOT NULL,
    end_date        DATE            NOT NULL,
    status          ENUM('upcoming','active','completed') DEFAULT 'upcoming'
);

--Venue
CREATE TABLE Venue (
    venue_id        INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,
    city            VARCHAR(50)     NOT NULL,
    capacity        INT             NOT NULL,
    surface         ENUM('Natural','Hybrid','Artificial') NOT NULL
);

--Team
CREATE TABLE Team (
    team_id         INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL UNIQUE,
    color           VARCHAR(10)     NOT NULL,
    group_name      CHAR(1)         NOT NULL   -- 'A' or 'B'
);

--TOURNAMENT_TEAM (junction, Team enrolled in Tournament)
CREATE TABLE Tournament_Team (
    tournament_id   INT NOT NULL,
    team_id         INT NOT NULL,
    PRIMARY KEY (tournament_id, team_id),
    FOREIGN KEY (tournament_id) REFERENCES Tournament(tournament_id),
    FOREIGN KEY (team_id)       REFERENCES Team(team_id)
);

--PLAYER
CREATE TABLE Player (
    player_id       INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,
    jersey_no       INT             NOT NULL,
    position        ENUM('FW','MF','DF','GK') NOT NULL,
    team_id         INT             NOT NULL,
    FOREIGN KEY (team_id) REFERENCES Team(team_id),
    UNIQUE (team_id, jersey_no)     -- no duplicate jersey in same team
);

--USER 
CREATE TABLE User (
    user_id         INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,
    role            ENUM('admin','referee','captain') NOT NULL,
    team_id         INT DEFAULT NULL,  -- only for captains
    FOREIGN KEY (team_id) REFERENCES Team(team_id)
);


--MATCH 
CREATE TABLE T_Match (
    match_id        INT AUTO_INCREMENT PRIMARY KEY,
    tournament_id   INT             NOT NULL,
    home_team_id    INT             NOT NULL,
    away_team_id    INT             NOT NULL,
    venue_id        INT             NOT NULL,
    match_date      DATE            NOT NULL,
    match_time      TIME            DEFAULT NULL,
    status          ENUM('upcoming','live','played') DEFAULT 'upcoming',
    FOREIGN KEY (tournament_id) REFERENCES Tournament(tournament_id),
    FOREIGN KEY (home_team_id)  REFERENCES Team(team_id),
    FOREIGN KEY (away_team_id)  REFERENCES Team(team_id),
    FOREIGN KEY (venue_id)      REFERENCES Venue(venue_id),
    CHECK (home_team_id <> away_team_id)
);

--RESULT 
CREATE TABLE Result (
    result_id       INT AUTO_INCREMENT PRIMARY KEY,
    match_id        INT             NOT NULL UNIQUE,  -- one result per match
    home_goals      INT             NOT NULL DEFAULT 0,
    away_goals      INT             NOT NULL DEFAULT 0,
    recorded_by     INT             NOT NULL,         -- user_id of referee/admin
    recorded_at     TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id)      REFERENCES T_Match(match_id),
    FOREIGN KEY (recorded_by)   REFERENCES User(user_id)
);

--STANDINGS 
CREATE TABLE Standings (
    standing_id     INT AUTO_INCREMENT PRIMARY KEY,
    tournament_id   INT             NOT NULL,
    team_id         INT             NOT NULL,
    played          INT             DEFAULT 0,
    won             INT             DEFAULT 0,
    drawn           INT             DEFAULT 0,
    lost            INT             DEFAULT 0,
    goals_for       INT             DEFAULT 0,
    goals_against   INT             DEFAULT 0,
    goal_diff       INT             GENERATED ALWAYS AS (goals_for - goals_against) STORED,
    points          INT             GENERATED ALWAYS AS (won * 3 + drawn) STORED,
    UNIQUE (tournament_id, team_id),
    FOREIGN KEY (tournament_id) REFERENCES Tournament(tournament_id),
    FOREIGN KEY (team_id)       REFERENCES Team(team_id)
);

--GOAL 
CREATE TABLE Goal (
    goal_id         INT AUTO_INCREMENT PRIMARY KEY,
    match_id        INT             NOT NULL,
    player_id       INT             NOT NULL,
    minute          INT             DEFAULT NULL,
    is_own_goal     BOOLEAN         DEFAULT FALSE,
    is_assist       BOOLEAN         DEFAULT FALSE,
    FOREIGN KEY (match_id)  REFERENCES T_Match(match_id),
    FOREIGN KEY (player_id) REFERENCES Player(player_id)
);