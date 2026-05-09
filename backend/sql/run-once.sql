USE tournapro;
INSERT INTO User (name, password_hash, role, team_id)
VALUES ('Admin', 'scrypt:32768:8:1$gnxP2v8KgfthO84L$38e72b22e0b41c24628245d81c5c963a7d64e07296d3f078674c38cbde6aea64ae5850a20d1d3795ec4013e65cc2dca804986202dc7d10910896df73696d992a', 'admin', NULL);
INSERT INTO Tournament (name, season, start_date, end_date, status)
VALUES ('Spring Cup 2026', '2026', '2026-03-01', '2026-05-19', 'active');
ALTER USER 'root'@'localhost' IDENTIFIED WITH caching_sha2_password BY 'sultan-rayyan-hamza';
FLUSH PRIVILEGES;
USE tournapro;
SELECT user_id, name, role, LENGTH(password_hash) FROM User;

USE tournapro;
DELETE FROM User WHERE name = 'Admin';