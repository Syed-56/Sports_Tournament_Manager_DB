# 🏆 Sports Tournament Manager

A web-based database system for managing the complete lifecycle of a sports tournament — from team registration and fixture scheduling to result recording and standings calculation.

> **Course:** CS 2005 — Database Systems | FAST-NUCES | Spring 2026  

---

## 👥 Team

| Role | Name | Roll No |
|------|------|---------|
| Group Lead | Syed Sultan Ahmed | 24K-0585 |
| Member | Rayyan Ahmer | 24K-0690 |
| Member | Muhammad Hamza Farhan | 24K-0576 |

---

## 📌 Overview

Managing a multi-team tournament manually is error-prone — tracking dozens of matches, updating standings, calculating goal differences, and handling player rosters simultaneously is a coordination nightmare. This system solves that by providing a **centralized, role-controlled platform** accessible through any web browser, with strict data integrity enforced through relational database design, transactions, and stored procedures.

---

## ✨ Features

- **Tournament Management** — Create and configure tournaments with group stages and knockout rounds
- **Team & Player Registration** — Register teams into groups and manage full player rosters (jersey numbers, positions)
- **Fixture Scheduling** — Assign match fixtures to venues with date and time information
- **Result Recording** — Submit match scores with transaction handling for data integrity
- **Automatic Standings** — Recalculate W/D/L/GD/Pts automatically after every result
- **Knockout Bracket Generation** — Auto-populate semi-finals and finals from group stage rankings
- **Statistics & Reports** — Track top scorers, assists, goals per match, and team performance metrics
- **Role-Based Access Control** — Restrict functionality based on user role (Admin, Team Captain, Referee)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, JavaScript |
| Backend | Python (Flask) |
| Database | MySQL |
| DB Connector | PyMySQL |

---

## 👤 User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full access — manages tournaments, teams, venues, fixtures, results, and standings |
| **Team Captain** | Registers team, manages roster, views own fixtures and standings |
| **Referee** | Records match scores/events, submits results, views assigned fixtures |

---

## 🗄️ Database Design

### Core Entities

| Entity | Key Attributes |
|--------|---------------|
| `Team` | team_id, name, group, color, captain_id |
| `Player` | player_id, name, jersey_no, position, team_id |
| `Tournament` | tournament_id, name, season, start_date, end_date |
| `Match` | match_id, tournament_id, home_team, away_team, venue_id, date, status |
| `Result` | result_id, match_id, home_goals, away_goals, referee_id |
| `Venue` | venue_id, name, city, capacity, surface |

6 core entities → 8–9 tables after normalization to BCNF (includes junction tables, a Standings table, and a Goals log).

### Views

| View | Description |
|------|-------------|
| `vw_group_standings` | Pre-computed standings joining Teams and Results |
| `vw_top_scorers` | Aggregated player goal stats across all matches |
| `vw_fixture_schedule` | Denormalized fixtures with team names and venue info |

### Stored Procedures

| Procedure | Description |
|-----------|-------------|
| `sp_record_result(match_id, home_goals, away_goals)` | Validates and inserts result; updates standings atomically |
| `sp_generate_bracket()` | Reads group standings and populates knockout fixtures |
| `sp_register_team(tournament_id, team_id)` | Validates capacity and inserts team enrollment |

### Triggers

| Trigger | Description |
|---------|-------------|
| `trg_after_result_insert` | Recalculates W/D/L/GD/Pts for both teams after a result is inserted |

### Transactions

All result submissions are wrapped in `BEGIN ... COMMIT / ROLLBACK` to ensure the match result, both teams' standings updates, and the match status change are **atomic** — preventing partial updates on failure.

---

## 📐 Scope

### In Scope
- Tournament creation and management
- Team registration and player roster management
- Fixture scheduling and venue assignment
- Match result recording and validation
- Automatic standings calculation (W/D/L/GD/Pts)
- Knockout bracket generation from group standings
- Top scorer and statistics tracking
- Role-based access (Admin, Captain, Referee)
- Full CRUD on all entities
- Transaction-safe result submission

### Out of Scope
- Live match streaming or video integration
- Online payment or registration fees
- Mobile application (web only)
- Real-time push notifications
- Automated fixture scheduling algorithm
- Historical seasons archive beyond current tournament
- Third-party API integration
- Social media sharing

---

## 📋 Assumptions

- A single active tournament is managed at a time
- All matches are single-leg (no home-and-away)
- Draw results are valid (1 point each)
- Extra time / penalty results are recorded as final scores with no special distinction
- Users are pre-registered by Admin — no self-signup flow
- System runs on a local server for demonstration

---

---

## 📁 Project Structure

```
sports-tournament-manager/
├── app.py                  # Flask entry point
├── schema.sql              # Database schema (DDL)
├── procedures.sql          # Stored procedures and triggers
├── templates/              # HTML templates
│   ├── admin/
│   ├── captain/
│   └── referee/
├── static/                 # CSS and JS
└── README.md
```
