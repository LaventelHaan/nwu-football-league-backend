-- =====================================================================
-- NWU_Sports_League - Full MySQL 8.0 Schema with Triggers & Procedures
-- Generated: 2025-08-18 (Africa/Johannesburg, UTC+02:00)
-- =====================================================================

-- Safety: drop and recreate database (optional). Comment out DROP if not desired.
DROP DATABASE IF EXISTS nwu_sports_league2;
CREATE DATABASE IF NOT EXISTS nwu_sports_league2
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_0900_ai_ci;
USE nwu_sports_league2;

SET NAMES utf8mb4;
SET time_zone = '+02:00';

-- =====================================================================
-- 1) ENUM / LOOKUP TABLES
-- =====================================================================
CREATE TABLE IF NOT EXISTS roles (
  role_id       TINYINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  role_name     VARCHAR(64) NOT NULL,
  description VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS approval_status (
  status_key    VARCHAR(24) PRIMARY KEY,                 -- 'PENDING','APPROVED','REJECTED'
  description   VARCHAR(255) NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS invite_status (
  status_key    VARCHAR(24) PRIMARY KEY,                 -- 'SENT','ACCEPTED','DECLINED','EXPIRED','CANCELLED'
  description   VARCHAR(255) NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS match_status (
  status_key    VARCHAR(24) PRIMARY KEY,                 -- 'SCHEDULED','IN_PROGRESS','FINAL','POSTPONED','CANCELLED'
  description   VARCHAR(255) NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS booking_type (
  type_key      VARCHAR(24) PRIMARY KEY,                 -- 'TRAINING','TRYOUT','MATCH'
  description   VARCHAR(255) NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS booking_status (
  status_key    VARCHAR(24) PRIMARY KEY,                 -- 'REQUESTED','APPROVED','REJECTED','CANCELLED','COMPLETED'
  description   VARCHAR(255) NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS player_position (
  position_key  VARCHAR(16) PRIMARY KEY,                 -- 'GK','RB','CB','LB','CDM','CM','CAM','RW','LW','ST'
  position_name VARCHAR(50) NOT NULL,
  description   VARCHAR(64) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS event_type (
  event_key     VARCHAR(24) PRIMARY KEY,                 -- 'GOAL','ASSIST','YELLOW_CARD','RED_CARD','OWN_GOAL','SUB_ON','SUB_OFF','PENALTY_GOAL','PENALTY_MISS','SAVE','CLEAN_SHEET'
  description   VARCHAR(255) NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notification_type (
  type_key      VARCHAR(32) PRIMARY KEY,                 -- 'TRIAL_INVITE','MATCH_UPDATE','ANNOUNCEMENT','BOOKING_UPDATE'
  description   VARCHAR(255) NULL
) ENGINE=InnoDB;

-- =====================================================================
-- 2) SECURITY & USERS
-- =====================================================================
CREATE TABLE IF NOT EXISTS organizations (
  organization_id  BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name             VARCHAR(120) NOT NULL,
  org_type         VARCHAR(32) NOT NULL,                 -- 'CLUB','SPONSOR','SCOUTING_AGENCY','UNIVERSITY'
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
  user_id        BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  email          VARCHAR(191) NULL UNIQUE,
  phone_e164     VARCHAR(32)  NULL UNIQUE,               -- store +27... format
  login_identifier VARCHAR(191) GENERATED ALWAYS AS (COALESCE(email, phone_e164)) STORED,
  password_hash  VARCHAR(255) NOT NULL,                  -- e.g., bcrypt/argon2 hash (app enforces strength)
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  email_verified_at TIMESTAMP NULL,
  phone_verified_at TIMESTAMP NULL,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_pw_len CHECK (CHAR_LENGTH(password_hash) >= 60)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id        BIGINT UNSIGNED PRIMARY KEY,
  first_name     VARCHAR(80) NOT NULL,
  last_name      VARCHAR(80) NOT NULL,
  birth_date     DATE NULL,
  bio            TEXT NULL,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_profiles_user FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_roles (
  user_id      BIGINT UNSIGNED NOT NULL,
  role_id      TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (user_id, role_id),
  CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(role_id)
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_organizations (
  user_id          BIGINT UNSIGNED NOT NULL,
  organization_id  BIGINT UNSIGNED NOT NULL,
  org_role         VARCHAR(32) NOT NULL,                 -- 'SCOUT','SPONSOR','STAFF'
  PRIMARY KEY (user_id, organization_id),
  CONSTRAINT fk_uo_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_uo_org  FOREIGN KEY (organization_id) REFERENCES organizations(organization_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 3) CORE FOOTBALL ENTITIES
-- =====================================================================
CREATE TABLE IF NOT EXISTS venues (
  venue_id      BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name          VARCHAR(120) NOT NULL,
  address       VARCHAR(255) NULL,
  city          VARCHAR(120) NULL,
  capacity      INT UNSIGNED NULL,
  surface       VARCHAR(64) NULL,                        -- grass, artificial
  is_active     BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS venue_fields (
  field_id      BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  venue_id      BIGINT UNSIGNED NOT NULL,
  name          VARCHAR(80) NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_field_venue FOREIGN KEY (venue_id) REFERENCES venues(venue_id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS players (
  player_id     BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id       BIGINT UNSIGNED NOT NULL UNIQUE,
  dominant_foot VARCHAR(16) NULL,                         -- 'LEFT','RIGHT','BOTH'
  height_cm     SMALLINT UNSIGNED NULL,
  preferred_position VARCHAR(16) NULL,
  CONSTRAINT fk_player_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_player_pref_pos FOREIGN KEY (preferred_position) REFERENCES player_position(position_key)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS coaches (
  coach_id      BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id       BIGINT UNSIGNED NOT NULL UNIQUE,
  qualification VARCHAR(120) NULL,
  CONSTRAINT fk_coach_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS teams (
  team_id       BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name          VARCHAR(160) NOT NULL,
  short_code    VARCHAR(12)  NULL,
  gender        VARCHAR(16)  NULL,                       -- 'MEN','WOMEN','MIXED'
  age_group     VARCHAR(32)  NULL,                       -- 'SENIOR','U21', etc.
  organization_id BIGINT UNSIGNED NULL,
  created_by    BIGINT UNSIGNED NOT NULL,
  approval_status VARCHAR(24) NOT NULL DEFAULT 'PENDING',
  approved_by   BIGINT UNSIGNED NULL,
  approved_at   TIMESTAMP NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  coach_id		BIGINT UNSIGNED NULL,
  UNIQUE KEY uq_team_name (name),
  CONSTRAINT fk_team_org FOREIGN KEY (organization_id) REFERENCES organizations(organization_id) ON DELETE SET NULL,
  CONSTRAINT fk_team_coach FOREIGN KEY (coach_id) REFERENCES coaches(coach_id) ON DELETE SET NULL,
  CONSTRAINT fk_team_creator FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE RESTRICT,
  CONSTRAINT fk_team_approved_by FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL,
  CONSTRAINT fk_team_approval_status FOREIGN KEY (approval_status) REFERENCES approval_status(status_key)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS seasons (
  season_id     BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name          VARCHAR(64) NOT NULL,                    -- '2025', '2025/26'
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  UNIQUE KEY uq_season_name (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS leagues (
  league_id     BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name          VARCHAR(160) NOT NULL,
  season_id     BIGINT UNSIGNED NOT NULL,
  level         VARCHAR(64) NULL,                        -- 'Premier','Division 1'
  UNIQUE KEY uq_league_name_season (name, season_id),
  CONSTRAINT fk_league_season FOREIGN KEY (season_id) REFERENCES seasons(season_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS league_teams (
  league_id     BIGINT UNSIGNED NOT NULL,
  team_id       BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (league_id, team_id),
  CONSTRAINT fk_lt_league FOREIGN KEY (league_id) REFERENCES leagues(league_id) ON DELETE CASCADE,
  CONSTRAINT fk_lt_team   FOREIGN KEY (team_id)   REFERENCES teams(team_id)   ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 4) FIXTURES, MATCHES, LINEUPS & EVENTS
-- =====================================================================
CREATE TABLE IF NOT EXISTS fixtures (
  fixture_id    BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  league_id     BIGINT UNSIGNED NOT NULL,
  home_team_id  BIGINT UNSIGNED NOT NULL,
  away_team_id  BIGINT UNSIGNED NOT NULL,
  scheduled_at  DATETIME NOT NULL,
  venue_field_id BIGINT UNSIGNED NULL,
  booking_id    BIGINT UNSIGNED NULL,                    -- link to field booking when applicable
  created_by    BIGINT UNSIGNED NOT NULL,
  approval_status VARCHAR(24) NOT NULL DEFAULT 'PENDING',
  approved_by   BIGINT UNSIGNED NULL,
  approved_at   TIMESTAMP NULL,
  UNIQUE KEY uq_fixture_slot (league_id, scheduled_at, home_team_id, away_team_id),
  CONSTRAINT fk_fix_league FOREIGN KEY (league_id) REFERENCES leagues(league_id) ON DELETE CASCADE,
  CONSTRAINT fk_fix_home   FOREIGN KEY (home_team_id) REFERENCES teams(team_id) ON DELETE RESTRICT,
  CONSTRAINT fk_fix_away   FOREIGN KEY (away_team_id) REFERENCES teams(team_id) ON DELETE RESTRICT,
  CONSTRAINT fk_fix_field  FOREIGN KEY (venue_field_id) REFERENCES venue_fields(field_id) ON DELETE SET NULL,
  CONSTRAINT fk_fix_creator FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE RESTRICT,
  CONSTRAINT fk_fix_approved_by FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL,
  CONSTRAINT fk_fix_approval_status FOREIGN KEY (approval_status) REFERENCES approval_status(status_key)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS matches (
  match_id      BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  fixture_id    BIGINT UNSIGNED NOT NULL UNIQUE,
  status_key    VARCHAR(24) NOT NULL DEFAULT 'SCHEDULED',
  home_score    TINYINT UNSIGNED NOT NULL DEFAULT 0,
  away_score    TINYINT UNSIGNED NOT NULL DEFAULT 0,
  started_at    DATETIME NULL,
  ended_at      DATETIME NULL,
  CONSTRAINT fk_match_fixture FOREIGN KEY (fixture_id) REFERENCES fixtures(fixture_id) ON DELETE CASCADE,
  CONSTRAINT fk_match_status  FOREIGN KEY (status_key)  REFERENCES match_status(status_key)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS match_lineups (
  match_id      BIGINT UNSIGNED NOT NULL,
  team_id       BIGINT UNSIGNED NOT NULL,
  player_id     BIGINT UNSIGNED NOT NULL,
  is_starting   BOOLEAN NOT NULL DEFAULT TRUE,
  shirt_number  TINYINT UNSIGNED NULL,
  position_key  VARCHAR(16) NULL,
  minutes_played SMALLINT UNSIGNED NULL,
  PRIMARY KEY (match_id, player_id),
  CONSTRAINT fk_ml_match   FOREIGN KEY (match_id)  REFERENCES matches(match_id) ON DELETE CASCADE,
  CONSTRAINT fk_ml_team    FOREIGN KEY (team_id)   REFERENCES teams(team_id)   ON DELETE CASCADE,
  CONSTRAINT fk_ml_player  FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
  CONSTRAINT fk_ml_pos     FOREIGN KEY (position_key) REFERENCES player_position(position_key)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS match_events (
  event_id      BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  match_id      BIGINT UNSIGNED NOT NULL,
  team_id       BIGINT UNSIGNED NOT NULL,
  player_id     BIGINT UNSIGNED NULL,
  assist_player_id BIGINT UNSIGNED NULL,
  minute_mark   SMALLINT UNSIGNED NULL,
  event_key     VARCHAR(24) NOT NULL,
  notes         VARCHAR(255) NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_me_match  FOREIGN KEY (match_id)  REFERENCES matches(match_id) ON DELETE CASCADE,
  CONSTRAINT fk_me_team   FOREIGN KEY (team_id)   REFERENCES teams(team_id)   ON DELETE CASCADE,
  CONSTRAINT fk_me_player FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE SET NULL,
  CONSTRAINT fk_me_assist FOREIGN KEY (assist_player_id) REFERENCES players(player_id) ON DELETE SET NULL,
  CONSTRAINT fk_me_type   FOREIGN KEY (event_key) REFERENCES event_type(event_key)
) ENGINE=InnoDB;

-- =====================================================================
-- 5) MEMBERSHIP, APPLICATIONS, TRIALS & INVITES
-- =====================================================================
CREATE TABLE IF NOT EXISTS team_memberships (
  team_membership_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  team_id       BIGINT UNSIGNED NOT NULL,
  player_id     BIGINT UNSIGNED NOT NULL,
  squad_number  TINYINT UNSIGNED NULL,
  joined_at     DATE NOT NULL,
  left_at       DATE NULL,
  approval_status VARCHAR(24) NOT NULL DEFAULT 'PENDING',
  approved_by   BIGINT UNSIGNED NULL,
  approved_at   TIMESTAMP NULL,
  UNIQUE KEY uq_team_player_active (team_id, player_id, left_at),
  CONSTRAINT fk_tm_team FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
  CONSTRAINT fk_tm_player FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
  CONSTRAINT fk_tm_approval_status FOREIGN KEY (approval_status) REFERENCES approval_status(status_key),
  CONSTRAINT fk_tm_approved_by FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS team_applications (
  application_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  team_id       BIGINT UNSIGNED NOT NULL,
  player_id     BIGINT UNSIGNED NOT NULL,
  motivation    TEXT NULL,
  status_key    VARCHAR(24) NOT NULL DEFAULT 'PENDING',  -- approval_status
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  decided_by    BIGINT UNSIGNED NULL,
  decided_at    TIMESTAMP NULL,
  UNIQUE KEY uq_application_unique (team_id, player_id),
  CONSTRAINT fk_ta_team FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
  CONSTRAINT fk_ta_player FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
  CONSTRAINT fk_ta_status FOREIGN KEY (status_key) REFERENCES approval_status(status_key),
  CONSTRAINT fk_ta_decider FOREIGN KEY (decided_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS trial_events (
  trial_id      BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  team_id       BIGINT UNSIGNED NULL,                    -- team hosting the trial (or NULL for league-wide)
  venue_field_id BIGINT UNSIGNED NOT NULL,
  starts_at     DATETIME NOT NULL,
  ends_at       DATETIME NOT NULL,
  max_slots     INT UNSIGNED NULL,
  created_by    BIGINT UNSIGNED NOT NULL,
  approval_status VARCHAR(24) NOT NULL DEFAULT 'PENDING',
  approved_by   BIGINT UNSIGNED NULL,
  approved_at   TIMESTAMP NULL,
  CONSTRAINT fk_trial_team  FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE SET NULL,
  CONSTRAINT fk_trial_field FOREIGN KEY (venue_field_id) REFERENCES venue_fields(field_id) ON DELETE RESTRICT,
  CONSTRAINT fk_trial_creator FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE RESTRICT,
  CONSTRAINT fk_trial_approval_status FOREIGN KEY (approval_status) REFERENCES approval_status(status_key),
  CONSTRAINT fk_trial_approved_by FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS trial_invitations (
  invitation_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  trial_id      BIGINT UNSIGNED NOT NULL,
  scout_user_id BIGINT UNSIGNED NOT NULL,
  player_id     BIGINT UNSIGNED NOT NULL,
  status_key    VARCHAR(24) NOT NULL DEFAULT 'SENT',     -- invite_status
  sent_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  responded_at  TIMESTAMP NULL,
  message       VARCHAR(500) NULL,
  UNIQUE KEY uq_invite_unique (trial_id, player_id),
  CONSTRAINT fk_inv_trial FOREIGN KEY (trial_id) REFERENCES trial_events(trial_id) ON DELETE CASCADE,
  CONSTRAINT fk_inv_scout FOREIGN KEY (scout_user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
  CONSTRAINT fk_inv_player FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
  CONSTRAINT fk_inv_status FOREIGN KEY (status_key) REFERENCES invite_status(status_key)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS trial_attendance (
  trial_id      BIGINT UNSIGNED NOT NULL,
  player_id     BIGINT UNSIGNED NOT NULL,
  checked_in_at TIMESTAMP NULL,
  PRIMARY KEY (trial_id, player_id),
  CONSTRAINT fk_tatt_trial FOREIGN KEY (trial_id) REFERENCES trial_events(trial_id) ON DELETE CASCADE,
  CONSTRAINT fk_tatt_player FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 6) BOOKINGS (TRAINING / TRYOUT / FIELD MANAGEMENT)
-- =====================================================================
CREATE TABLE IF NOT EXISTS field_bookings (
  booking_id    BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  venue_field_id BIGINT UNSIGNED NOT NULL,
  type_key      VARCHAR(24) NOT NULL,                    -- booking_type
  team_id       BIGINT UNSIGNED NULL,                    -- required for TRAINING/TRYOUT
  starts_at     DATETIME NOT NULL,
  ends_at       DATETIME NOT NULL,
  requested_by  BIGINT UNSIGNED NOT NULL,
  status_key    VARCHAR(24) NOT NULL DEFAULT 'REQUESTED',
  approved_by   BIGINT UNSIGNED NULL,
  approved_at   TIMESTAMP NULL,
  notes         VARCHAR(255) NULL,
  UNIQUE KEY uq_booking_slot (venue_field_id, starts_at, ends_at),
  CONSTRAINT fk_fb_field FOREIGN KEY (venue_field_id) REFERENCES venue_fields(field_id) ON DELETE RESTRICT,
  CONSTRAINT fk_fb_type  FOREIGN KEY (type_key)   REFERENCES booking_type(type_key),
  CONSTRAINT fk_fb_team  FOREIGN KEY (team_id)    REFERENCES teams(team_id) ON DELETE SET NULL,
  CONSTRAINT fk_fb_req   FOREIGN KEY (requested_by) REFERENCES users(user_id) ON DELETE RESTRICT,
  CONSTRAINT fk_fb_status FOREIGN KEY (status_key) REFERENCES booking_status(status_key),
  CONSTRAINT fk_fb_approved_by FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Link fixtures <-> bookings when a fixture uses a booking slot
ALTER TABLE fixtures
  ADD CONSTRAINT fk_fix_booking
  FOREIGN KEY (booking_id) REFERENCES field_bookings(booking_id)
  ON DELETE SET NULL;

-- =====================================================================
-- 8) CONTENT: FAQ & ANNOUNCEMENTS
-- =====================================================================
CREATE TABLE IF NOT EXISTS faqs (
  faq_id        BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  question      VARCHAR(255) NOT NULL,
  answer_md     TEXT NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_by    BIGINT UNSIGNED NOT NULL,
  updated_by    BIGINT UNSIGNED NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  status ENUM('Draft','Published','Under Review','Archived') DEFAULT 'Draft',
  tags TEXT,
  views INT DEFAULT 0,
  helpful INT DEFAULT 0,
  notHelpful INT DEFAULT 0,
  CONSTRAINT fk_faq_creator FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE RESTRICT,
  CONSTRAINT fk_faq_updater FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS faq_tags (
  faq_id BIGINT UNSIGNED NOT NULL,
  tag VARCHAR(50) NOT NULL,
  PRIMARY KEY (faq_id, tag),
  FOREIGN KEY (faq_id) REFERENCES faqs(faq_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS watchlist (
  watchlist_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  added_by VARCHAR(100),
  added_date DATE NOT NULL,
  priority ENUM('Low','Medium','High') DEFAULT 'Medium',
  next_scouting_date DATE,
  notes TEXT,
  player_id BIGINT UNSIGNED,

  KEY idx_player_id (player_id)
);

-- =====================================================================
-- 9) NOTIFICATIONS (In-app) & EMAIL QUEUE
-- =====================================================================
CREATE TABLE IF NOT EXISTS notifications (
  notification_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id       BIGINT UNSIGNED NOT NULL,
  type_key      VARCHAR(32) NOT NULL,
  title         VARCHAR(160) NOT NULL,
  body          VARCHAR(500) NULL,
  is_read       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_notif_type FOREIGN KEY (type_key) REFERENCES notification_type(type_key)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS email_queue (
  email_id      BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  to_address    VARCHAR(191) NOT NULL,
  subject       VARCHAR(255) NOT NULL,
  body_html     MEDIUMTEXT NOT NULL,
  queued_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sent_at       TIMESTAMP NULL,
  status        VARCHAR(24) NOT NULL DEFAULT 'QUEUED',   -- 'QUEUED','SENT','FAILED'
  error_message VARCHAR(500) NULL
) ENGINE=InnoDB;

-- =====================================================================
-- 10) LOGGING / AUDIT (Minimal)
-- =====================================================================
CREATE TABLE IF NOT EXISTS activity_log (
  log_id        BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  actor_user_id BIGINT UNSIGNED NULL,
  action        VARCHAR(64) NOT NULL,                    -- 'CREATE_TEAM','APPROVE_FIXTURE','UPDATE_MATCH', etc.
  entity_type   VARCHAR(64) NOT NULL,
  entity_id     BIGINT UNSIGNED NULL,
  meta_json     JSON NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_entity (entity_type, entity_id),
  CONSTRAINT fk_log_actor FOREIGN KEY (actor_user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================================
-- 11) NEW TABLES: INJURIES & STATS
-- =====================================================================

-- Player Injuries (for scouts/sponsors visibility)
CREATE TABLE IF NOT EXISTS player_injuries (
    injury_id       BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    player_id       BIGINT UNSIGNED NOT NULL,
    reported_by     BIGINT UNSIGNED NULL, -- coach, scout, medical staff
    injury_type     VARCHAR(100) NOT NULL,
    description     TEXT NULL,
    injury_date     DATE NOT NULL,
    expected_return DATE NULL,
    severity        ENUM('Minor','Moderate','Severe','Career-Ending') NOT NULL,
    status          ENUM('Active','Recovered') NOT NULL DEFAULT 'Active',
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_injury_player FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    CONSTRAINT fk_injury_reporter FOREIGN KEY (reported_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Aggregate Player Stats per league/season
CREATE TABLE IF NOT EXISTS player_stats (
    player_id        BIGINT UNSIGNED NOT NULL,
    league_id        BIGINT UNSIGNED NOT NULL,
    matches_played   INT NOT NULL DEFAULT 0,
    goals            INT NOT NULL DEFAULT 0,
    assists          INT NOT NULL DEFAULT 0,
    yellow_cards     INT NOT NULL DEFAULT 0,
    red_cards        INT NOT NULL DEFAULT 0,
    minutes_played   INT NOT NULL DEFAULT 0,
    PRIMARY KEY (player_id, league_id),
    CONSTRAINT fk_ps_player FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    CONSTRAINT fk_ps_league FOREIGN KEY (league_id) REFERENCES leagues(league_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Aggregate Team Stats per league/season
CREATE TABLE IF NOT EXISTS team_stats (
    team_id          BIGINT UNSIGNED NOT NULL,
    league_id        BIGINT UNSIGNED NOT NULL,
    matches_played   INT NOT NULL DEFAULT 0,
    wins             INT NOT NULL DEFAULT 0,
    draws            INT NOT NULL DEFAULT 0,
    losses           INT NOT NULL DEFAULT 0,
    goals_scored     INT NOT NULL DEFAULT 0,
    goals_conceded   INT NOT NULL DEFAULT 0,
    points           INT NOT NULL DEFAULT 0,
    PRIMARY KEY (team_id, league_id),
    CONSTRAINT fk_ts_team FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
    CONSTRAINT fk_ts_league FOREIGN KEY (league_id) REFERENCES leagues(league_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Per-match Stats summary (cards & goals split home/away)
CREATE TABLE IF NOT EXISTS match_stats (
    match_id         BIGINT UNSIGNED PRIMARY KEY,
    home_goals       INT NOT NULL DEFAULT 0,
    away_goals       INT NOT NULL DEFAULT 0,
    home_yellow      INT NOT NULL DEFAULT 0,
    home_red         INT NOT NULL DEFAULT 0,
    away_yellow      INT NOT NULL DEFAULT 0,
    away_red         INT NOT NULL DEFAULT 0,
    man_ot_match	 BIGINT UNSIGNED NULL,
    constraint fk_ms_players foreign key (man_ot_match) references players(player_id) ON DELETE SET NULL,
    CONSTRAINT fk_ms_match FOREIGN KEY (match_id) REFERENCES matches(match_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 12) VIEWS FOR PUBLIC/FAN PORTAL & DASHBOARDS
-- =====================================================================
CREATE OR REPLACE VIEW v_public_fixtures AS
SELECT f.fixture_id, l.name AS league_name, s.name AS season_name,
       ht.team_id AS home_team_id, ht.name AS home_team,
       at2.team_id AS away_team_id, at2.name AS away_team,
       f.scheduled_at, v.name AS venue, vf.name AS field,
       m.status_key, m.home_score, m.away_score
FROM fixtures f
JOIN leagues l   ON l.league_id = f.league_id
JOIN seasons s   ON s.season_id = l.season_id
JOIN teams ht    ON ht.team_id = f.home_team_id
JOIN teams at2   ON at2.team_id = f.away_team_id
LEFT JOIN matches m ON m.fixture_id = f.fixture_id
LEFT JOIN venue_fields vf ON vf.field_id = f.venue_field_id
LEFT JOIN venues v ON v.venue_id = vf.venue_id
WHERE f.approval_status = 'APPROVED';

CREATE OR REPLACE VIEW v_league_standings AS
SELECT l.league_id, l.name AS league_name, s.name AS season_name, t.team_id, t.name AS team_name,
       COALESCE(SUM(
         CASE
           WHEN m.status_key = 'FINAL' AND (
             (t.team_id = f.home_team_id AND m.home_score > m.away_score) OR
             (t.team_id = f.away_team_id AND m.away_score > m.home_score)
           ) THEN 3
           WHEN m.status_key = 'FINAL' AND m.home_score = m.away_score THEN 1
           ELSE 0
         END
       ),0) AS points,
       COALESCE(SUM(CASE WHEN m.status_key = 'FINAL' AND t.team_id = f.home_team_id THEN m.home_score
                          WHEN m.status_key = 'FINAL' AND t.team_id = f.away_team_id THEN m.away_score ELSE 0 END),0) AS goals_for,
       COALESCE(SUM(CASE WHEN m.status_key = 'FINAL' AND t.team_id = f.home_team_id THEN m.away_score
                          WHEN m.status_key = 'FINAL' AND t.team_id = f.away_team_id THEN m.home_score ELSE 0 END),0) AS goals_against,
       COALESCE(SUM(CASE WHEN m.status_key = 'FINAL' AND (
             (t.team_id = f.home_team_id AND m.home_score > m.away_score) OR
             (t.team_id = f.away_team_id AND m.away_score > m.home_score)
           ) THEN 1 ELSE 0 END),0) AS wins,
       COALESCE(SUM(CASE WHEN m.status_key = 'FINAL' AND m.home_score = m.away_score THEN 1 ELSE 0 END),0) AS draws,
       COALESCE(SUM(CASE WHEN m.status_key = 'FINAL' AND (
             (t.team_id = f.home_team_id AND m.home_score < m.away_score) OR
             (t.team_id = f.away_team_id AND m.away_score < m.home_score)
           ) THEN 1 ELSE 0 END),0) AS losses,
       COALESCE(SUM(CASE WHEN m.status_key = 'FINAL' AND (
             (t.team_id = f.home_team_id AND m.away_score = 0) OR
             (t.team_id = f.away_team_id AND m.home_score = 0)
           ) THEN 1 ELSE 0 END),0) AS clean_sheets_team
FROM leagues l
JOIN seasons s      ON s.season_id = l.season_id
JOIN league_teams lt ON lt.league_id = l.league_id
JOIN teams t        ON t.team_id = lt.team_id
LEFT JOIN fixtures f ON f.league_id = l.league_id AND f.approval_status = 'APPROVED'
LEFT JOIN matches m  ON m.fixture_id = f.fixture_id
GROUP BY l.league_id, l.name, s.name, t.team_id, t.name;

CREATE OR REPLACE VIEW v_player_stats AS
SELECT p.player_id, up.first_name, up.last_name, t.team_id, t.name AS team_name,
       SUM(CASE WHEN me.event_key IN ('GOAL','PENALTY_GOAL') AND me.player_id = p.player_id THEN 1 ELSE 0 END) AS goals,
       SUM(CASE WHEN me.event_key = 'ASSIST' AND me.assist_player_id = p.player_id THEN 1 ELSE 0 END) AS assists,
       SUM(CASE WHEN me.event_key = 'YELLOW_CARD' AND me.player_id = p.player_id THEN 1 ELSE 0 END) AS yellow_cards,
       SUM(CASE WHEN me.event_key = 'RED_CARD' AND me.player_id = p.player_id THEN 1 ELSE 0 END) AS red_cards
FROM players p
JOIN user_profiles up ON up.user_id = p.user_id
LEFT JOIN match_lineups ml ON ml.player_id = p.player_id
LEFT JOIN matches m ON m.match_id = ml.match_id AND m.status_key = 'FINAL'
LEFT JOIN fixtures f ON f.fixture_id = m.fixture_id
LEFT JOIN teams t ON t.team_id = ml.team_id
LEFT JOIN match_events me ON me.match_id = m.match_id
GROUP BY p.player_id, up.first_name, up.last_name, t.team_id, t.name;

-- =====================================================================
-- 13) INDEXES
-- =====================================================================
CREATE INDEX idx_users_login ON users (login_identifier);
CREATE INDEX idx_fixtures_time ON fixtures (scheduled_at);
CREATE INDEX idx_matches_status ON matches (status_key);
CREATE INDEX idx_events_match ON match_events (match_id, event_key);
CREATE INDEX idx_lineups_match_team ON match_lineups (match_id, team_id);
CREATE INDEX idx_bookings_field_time ON field_bookings (venue_field_id, starts_at, ends_at);
CREATE INDEX idx_team_membership_active ON team_memberships (team_id, left_at, approval_status);

-- Helpful indexes for new tables
CREATE INDEX idx_me_player ON match_events (player_id);
CREATE INDEX idx_me_team ON match_events (team_id);
CREATE INDEX idx_ml_player ON match_lineups (player_id);
CREATE INDEX idx_trial_inv_player ON trial_invitations (player_id, status_key);

-- =====================================================================
-- 14) TRIGGERS (Business Rules & Automation)
-- =====================================================================

-- Guards: Prevent APPROVED without approved_by (fixtures, teams, trial_events)
DROP TRIGGER IF EXISTS trg_fixtures_approved_guard;
DELIMITER $$
CREATE TRIGGER trg_fixtures_approved_guard
BEFORE UPDATE ON fixtures FOR EACH ROW
BEGIN
  IF NEW.approval_status = 'APPROVED' AND NEW.approved_by IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Fixture cannot be APPROVED without approved_by.';
  END IF;
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS trg_teams_approved_guard;
DELIMITER $$
CREATE TRIGGER trg_teams_approved_guard
BEFORE UPDATE ON teams FOR EACH ROW
BEGIN
  IF NEW.approval_status = 'APPROVED' AND NEW.approved_by IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Team cannot be APPROVED without approved_by.';
  END IF;
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS trg_trials_approved_guard;
DELIMITER $$
CREATE TRIGGER trg_trials_approved_guard
BEFORE UPDATE ON trial_events FOR EACH ROW
BEGIN
  IF NEW.approval_status = 'APPROVED' AND NEW.approved_by IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Trial cannot be APPROVED without approved_by.';
  END IF;
END$$
DELIMITER ;

-- Automatically create a match shell once a fixture is approved
DROP TRIGGER IF EXISTS trg_fixture_create_match;
DELIMITER $$
CREATE TRIGGER trg_fixture_create_match
AFTER UPDATE ON fixtures FOR EACH ROW
BEGIN
  IF NEW.approval_status = 'APPROVED' AND OLD.approval_status <> 'APPROVED' THEN
    INSERT INTO matches (fixture_id, status_key) VALUES (NEW.fixture_id, 'SCHEDULED');
    INSERT IGNORE INTO match_stats (match_id)
      VALUES (LAST_INSERT_ID()); -- ensure a stats row exists for the new match
  END IF;
END$$
DELIMITER ;

-- Prevent unapproved team_memberships from having joined_at in the past
DROP TRIGGER IF EXISTS trg_tm_joined_guard;
DELIMITER $$
CREATE TRIGGER trg_tm_joined_guard
BEFORE INSERT ON team_memberships FOR EACH ROW
BEGIN
  IF NEW.approval_status <> 'APPROVED' AND NEW.joined_at <= CURRENT_DATE() THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Pending membership cannot start in the past. Approve first.';
  END IF;
END$$
DELIMITER ;

-- Prevent team being scheduled in two fixtures at the same time
DROP TRIGGER IF EXISTS trg_fixture_no_double_booking_ins;
DELIMITER $$
CREATE TRIGGER trg_fixture_no_double_booking_ins
BEFORE INSERT ON fixtures FOR EACH ROW
BEGIN
  IF EXISTS (
    SELECT 1 FROM fixtures f
    WHERE f.scheduled_at = NEW.scheduled_at
      AND (f.home_team_id = NEW.home_team_id OR f.away_team_id = NEW.home_team_id
        OR f.home_team_id = NEW.away_team_id OR f.away_team_id = NEW.away_team_id)
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'A team is already scheduled for another fixture at this time.';
  END IF;
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS trg_fixture_no_double_booking_upd;
DELIMITER $$
CREATE TRIGGER trg_fixture_no_double_booking_upd
BEFORE UPDATE ON fixtures FOR EACH ROW
BEGIN
  IF NEW.scheduled_at <> OLD.scheduled_at OR NEW.home_team_id <> OLD.home_team_id OR NEW.away_team_id <> OLD.away_team_id THEN
    IF EXISTS (
      SELECT 1 FROM fixtures f
      WHERE f.scheduled_at = NEW.scheduled_at
        AND f.fixture_id <> OLD.fixture_id
        AND (f.home_team_id = NEW.home_team_id OR f.away_team_id = NEW.home_team_id
          OR f.home_team_id = NEW.away_team_id OR f.away_team_id = NEW.away_team_id)
    ) THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'A team is already scheduled for another fixture at this time.';
    END IF;
  END IF;
END$$
DELIMITER ;

-- Initialize match_stats on match creation (if not created above)
DROP TRIGGER IF EXISTS trg_match_init_stats;
DELIMITER $$
CREATE TRIGGER trg_match_init_stats
AFTER INSERT ON matches FOR EACH ROW
BEGIN
  INSERT IGNORE INTO match_stats (match_id) VALUES (NEW.match_id);
END$$
DELIMITER ;

-- Update match_stats + player_stats as events are recorded
DROP TRIGGER IF EXISTS trg_match_event_accumulators;
DELIMITER $$
CREATE TRIGGER trg_match_event_accumulators
AFTER INSERT ON match_events FOR EACH ROW
BEGIN
  DECLARE lg BIGINT UNSIGNED;
  DECLARE home_id BIGINT UNSIGNED;
  DECLARE away_id BIGINT UNSIGNED;

  -- Ensure match_stats row exists
  INSERT IGNORE INTO match_stats (match_id) VALUES (NEW.match_id);

  -- Get league & home/away teams
  SELECT f.league_id, f.home_team_id, f.away_team_id
    INTO lg, home_id, away_id
  FROM matches m
  JOIN fixtures f ON f.fixture_id = m.fixture_id
  WHERE m.match_id = NEW.match_id;

  -- Player stats row
  IF NEW.player_id IS NOT NULL THEN
    INSERT IGNORE INTO player_stats (player_id, league_id) VALUES (NEW.player_id, lg);
  END IF;
  IF NEW.assist_player_id IS NOT NULL THEN
    INSERT IGNORE INTO player_stats (player_id, league_id) VALUES (NEW.assist_player_id, lg);
  END IF;

  -- Goals (including penalty goals). OWN_GOAL credited to opposing side for match_stats only.
  IF NEW.event_key IN ('GOAL','PENALTY_GOAL') THEN
    IF NEW.team_id = home_id THEN
      UPDATE match_stats SET home_goals = home_goals + 1 WHERE match_id = NEW.match_id;
    ELSEIF NEW.team_id = away_id THEN
      UPDATE match_stats SET away_goals = away_goals + 1 WHERE match_id = NEW.match_id;
    END IF;
    IF NEW.player_id IS NOT NULL THEN
      UPDATE player_stats SET goals = goals + 1 WHERE player_id = NEW.player_id AND league_id = lg;
    END IF;
  END IF;

  IF NEW.event_key = 'OWN_GOAL' THEN
    IF NEW.team_id = home_id THEN
      UPDATE match_stats SET away_goals = away_goals + 1 WHERE match_id = NEW.match_id;
    ELSEIF NEW.team_id = away_id THEN
      UPDATE match_stats SET home_goals = home_goals + 1 WHERE match_id = NEW.match_id;
    END IF;
  END IF;

  -- Assists
  IF NEW.event_key = 'ASSIST' AND NEW.assist_player_id IS NOT NULL THEN
    UPDATE player_stats SET assists = assists + 1 WHERE player_id = NEW.assist_player_id AND league_id = lg;
  END IF;

  -- Cards
  IF NEW.event_key = 'YELLOW_CARD' THEN
    IF NEW.team_id = home_id THEN
      UPDATE match_stats SET home_yellow = home_yellow + 1 WHERE match_id = NEW.match_id;
    ELSEIF NEW.team_id = away_id THEN
      UPDATE match_stats SET away_yellow = away_yellow + 1 WHERE match_id = NEW.match_id;
    END IF;
    IF NEW.player_id IS NOT NULL THEN
      UPDATE player_stats SET yellow_cards = yellow_cards + 1 WHERE player_id = NEW.player_id AND league_id = lg;
    END IF;
  END IF;

  IF NEW.event_key = 'RED_CARD' THEN
    IF NEW.team_id = home_id THEN
      UPDATE match_stats SET home_red = home_red + 1 WHERE match_id = NEW.match_id;
    ELSEIF NEW.team_id = away_id THEN
      UPDATE match_stats SET away_red = away_red + 1 WHERE match_id = NEW.match_id;
    END IF;
    IF NEW.player_id IS NOT NULL THEN
      UPDATE player_stats SET red_cards = red_cards + 1 WHERE player_id = NEW.player_id AND league_id = lg;
    END IF;
  END IF;

END$$
DELIMITER ;

-- Aggregate minutes_played into player_stats whenever lineups are inserted/updated
DROP TRIGGER IF EXISTS trg_lineup_minutes_insert;
DELIMITER $$
CREATE TRIGGER trg_lineup_minutes_insert
AFTER INSERT ON match_lineups FOR EACH ROW
BEGIN
  DECLARE lg BIGINT UNSIGNED;
  IF NEW.minutes_played IS NOT NULL AND NEW.minutes_played > 0 THEN
    SELECT f.league_id INTO lg
    FROM matches m JOIN fixtures f ON f.fixture_id = m.fixture_id
    WHERE m.match_id = NEW.match_id;
    INSERT IGNORE INTO player_stats (player_id, league_id) VALUES (NEW.player_id, lg);
    UPDATE player_stats SET minutes_played = minutes_played + NEW.minutes_played
      WHERE player_id = NEW.player_id AND league_id = lg;
  END IF;
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS trg_lineup_minutes_update;
DELIMITER $$
CREATE TRIGGER trg_lineup_minutes_update
AFTER UPDATE ON match_lineups FOR EACH ROW
BEGIN
  DECLARE lg BIGINT UNSIGNED;
  DECLARE delta INT;
  SET delta = COALESCE(NEW.minutes_played,0) - COALESCE(OLD.minutes_played,0);
  IF delta <> 0 THEN
    SELECT f.league_id INTO lg
    FROM matches m JOIN fixtures f ON f.fixture_id = m.fixture_id
    WHERE m.match_id = NEW.match_id;
    INSERT IGNORE INTO player_stats (player_id, league_id) VALUES (NEW.player_id, lg);
    UPDATE player_stats SET minutes_played = minutes_played + delta
      WHERE player_id = NEW.player_id AND league_id = lg;
  END IF;
END$$
DELIMITER ;

-- When a match is finalized, lock in scores on matches and update team_stats and matches_played for players
DROP TRIGGER IF EXISTS trg_match_finalize_stats;
DELIMITER $$
CREATE TRIGGER trg_match_finalize_stats
AFTER UPDATE ON matches FOR EACH ROW
BEGIN
  DECLARE lg BIGINT UNSIGNED;
  DECLARE home_id BIGINT UNSIGNED;
  DECLARE away_id BIGINT UNSIGNED;
  DECLARE hg INT; DECLARE ag INT;

  IF NEW.status_key = 'FINAL' AND OLD.status_key <> 'FINAL' THEN
    -- Sync matches.home_score/away_score from match_stats (in case they differ)
    SELECT ms.home_goals, ms.away_goals INTO hg, ag FROM match_stats ms WHERE ms.match_id = NEW.match_id;
    IF hg IS NOT NULL AND ag IS NOT NULL THEN
      UPDATE matches SET home_score = hg, away_score = ag WHERE match_id = NEW.match_id;
    END IF;

    -- League & teams
    SELECT f.league_id, f.home_team_id, f.away_team_id INTO lg, home_id, away_id
    FROM fixtures f WHERE f.fixture_id = NEW.fixture_id;

    -- Ensure team_stats rows exist
    INSERT IGNORE INTO team_stats (team_id, league_id) VALUES (home_id, lg);
    INSERT IGNORE INTO team_stats (team_id, league_id) VALUES (away_id, lg);

    -- Update team stats: matches, goals
    UPDATE team_stats SET matches_played = matches_played + 1,
                          goals_scored = goals_scored + COALESCE(hg,0),
                          goals_conceded = goals_conceded + COALESCE(ag,0)
    WHERE team_id = home_id AND league_id = lg;

    UPDATE team_stats SET matches_played = matches_played + 1,
                          goals_scored = goals_scored + COALESCE(ag,0),
                          goals_conceded = goals_conceded + COALESCE(hg,0)
    WHERE team_id = away_id AND league_id = lg;

    -- Results and points
    IF COALESCE(hg,0) > COALESCE(ag,0) THEN
      UPDATE team_stats SET wins = wins + 1, points = points + 3 WHERE team_id = home_id AND league_id = lg;
      UPDATE team_stats SET losses = losses + 1 WHERE team_id = away_id AND league_id = lg;
    ELSEIF COALESCE(hg,0) < COALESCE(ag,0) THEN
      UPDATE team_stats SET wins = wins + 1, points = points + 3 WHERE team_id = away_id AND league_id = lg;
      UPDATE team_stats SET losses = losses + 1 WHERE team_id = home_id AND league_id = lg;
    ELSE
      UPDATE team_stats SET draws = draws + 1, points = points + 1 WHERE team_id IN (home_id, away_id) AND league_id = lg;
    END IF;

    -- Players who appeared: increment matches_played
    UPDATE player_stats ps
    JOIN match_lineups ml ON ml.player_id = ps.player_id
    JOIN matches m ON m.match_id = ml.match_id
    JOIN fixtures f2 ON f2.fixture_id = m.fixture_id
    SET ps.matches_played = ps.matches_played + 1
    WHERE ml.match_id = NEW.match_id AND ps.league_id = f2.league_id;
  END IF;
END$$
DELIMITER ;

-- =====================================================================
-- 15) STORED PROCEDURES
-- =====================================================================

-- Approve a team
DROP PROCEDURE IF EXISTS sp_approve_team;
DELIMITER $$
CREATE PROCEDURE sp_approve_team(IN p_team_id BIGINT UNSIGNED, IN p_approver_id BIGINT UNSIGNED)
BEGIN
  UPDATE teams
  SET approval_status = 'APPROVED', approved_by = p_approver_id, approved_at = NOW()
  WHERE team_id = p_team_id;
END$$
DELIMITER ;

-- Record a match event (thin wrapper; triggers will take care of stats)
DROP PROCEDURE IF EXISTS sp_record_match_event;
DELIMITER $$
CREATE PROCEDURE sp_record_match_event(
    IN p_match_id BIGINT UNSIGNED,
    IN p_team_id BIGINT UNSIGNED,
    IN p_player_id BIGINT UNSIGNED,
    IN p_assist_player_id BIGINT UNSIGNED,
    IN p_minute SMALLINT UNSIGNED,
    IN p_event_key VARCHAR(24),
    IN p_notes VARCHAR(255)
)
BEGIN
  INSERT INTO match_events (match_id, team_id, player_id, assist_player_id, minute_mark, event_key, notes)
  VALUES (p_match_id, p_team_id, p_player_id, p_assist_player_id, p_minute, p_event_key, p_notes);
END$$
DELIMITER ;

-- Recompute team_stats from finalized matches (idempotent rebuild for a league)
DROP PROCEDURE IF EXISTS sp_recompute_team_stats;
DELIMITER $$
CREATE PROCEDURE sp_recompute_team_stats(IN p_league_id BIGINT UNSIGNED)
BEGIN
  -- Reset team_stats for this league
  DELETE ts FROM team_stats ts WHERE ts.league_id = p_league_id;

  -- Rebuild from FINAL matches
  INSERT INTO team_stats (team_id, league_id, matches_played, wins, draws, losses, goals_scored, goals_conceded, points)
  SELECT t.team_id,
         p_league_id,
         COUNT(*) AS played,
         SUM(CASE WHEN (f.home_team_id = t.team_id AND m.home_score > m.away_score) OR
                       (f.away_team_id = t.team_id AND m.away_score > m.home_score) THEN 1 ELSE 0 END) AS wins,
         SUM(CASE WHEN m.home_score = m.away_score THEN 1 ELSE 0 END) AS draws,
         SUM(CASE WHEN (f.home_team_id = t.team_id AND m.home_score < m.away_score) OR
                       (f.away_team_id = t.team_id AND m.away_score < m.home_score) THEN 1 ELSE 0 END) AS losses,
         SUM(CASE WHEN f.home_team_id = t.team_id THEN m.home_score ELSE m.away_score END) AS goals_scored,
         SUM(CASE WHEN f.home_team_id = t.team_id THEN m.away_score ELSE m.home_score END) AS goals_conceded,
         SUM(CASE
               WHEN (f.home_team_id = t.team_id AND m.home_score > m.away_score) OR
                    (f.away_team_id = t.team_id AND m.away_score > m.home_score) THEN 3
               WHEN m.home_score = m.away_score THEN 1
               ELSE 0
             END) AS points
  FROM fixtures f
  JOIN matches m ON m.fixture_id = f.fixture_id AND m.status_key = 'FINAL'
  JOIN teams t ON t.team_id IN (f.home_team_id, f.away_team_id)
  WHERE f.league_id = p_league_id
  GROUP BY t.team_id;
END$$
DELIMITER ;

-- Recompute player_stats for a league (goals/assists/cards/minutes/matches)
DROP PROCEDURE IF EXISTS sp_recompute_player_stats;
DELIMITER $$
CREATE PROCEDURE sp_recompute_player_stats(IN p_league_id BIGINT UNSIGNED)
BEGIN
  DELETE ps FROM player_stats ps WHERE ps.league_id = p_league_id;

  -- Build base rows for all players who appeared in matches in the league
  INSERT INTO player_stats (player_id, league_id)
  SELECT DISTINCT ml.player_id, p_league_id
  FROM fixtures f
  JOIN matches m ON m.fixture_id = f.fixture_id
  JOIN match_lineups ml ON ml.match_id = m.match_id
  WHERE f.league_id = p_league_id;

  -- Minutes
  UPDATE player_stats ps
  JOIN (
    SELECT ml.player_id, SUM(COALESCE(ml.minutes_played,0)) AS mins
    FROM fixtures f
    JOIN matches m ON m.fixture_id = f.fixture_id
    JOIN match_lineups ml ON ml.match_id = m.match_id
    WHERE f.league_id = p_league_id
    GROUP BY ml.player_id
  ) x ON x.player_id = ps.player_id AND ps.league_id = p_league_id
  SET ps.minutes_played = x.mins;

  -- Matches played (count any appearance)
  UPDATE player_stats ps
  JOIN (
    SELECT ml.player_id, COUNT(DISTINCT ml.match_id) AS apps
    FROM fixtures f
    JOIN matches m ON m.fixture_id = f.fixture_id AND m.status_key = 'FINAL'
    JOIN match_lineups ml ON ml.match_id = m.match_id
    WHERE f.league_id = p_league_id
    GROUP BY ml.player_id
  ) a ON a.player_id = ps.player_id AND ps.league_id = p_league_id
  SET ps.matches_played = a.apps;

  -- Goals, Assists, Cards
  UPDATE player_stats ps
  LEFT JOIN (
    SELECT me.player_id,
           SUM(me.event_key IN ('GOAL','PENALTY_GOAL')) AS g,
           SUM(me.event_key = 'YELLOW_CARD') AS yc,
           SUM(me.event_key = 'RED_CARD') AS rc
    FROM fixtures f
    JOIN matches m ON m.fixture_id = f.fixture_id
    JOIN match_events me ON me.match_id = m.match_id
    WHERE f.league_id = p_league_id
    GROUP BY me.player_id
  ) ev ON ev.player_id = ps.player_id
  LEFT JOIN (
    SELECT me.assist_player_id AS a_player_id,
           SUM(me.event_key = 'ASSIST') AS a
    FROM fixtures f
    JOIN matches m ON m.fixture_id = f.fixture_id
    JOIN match_events me ON me.match_id = m.match_id
    WHERE f.league_id = p_league_id
    GROUP BY me.assist_player_id
  ) av ON av.a_player_id = ps.player_id
  SET ps.goals = COALESCE(ev.g,0),
      ps.yellow_cards = COALESCE(ev.yc,0),
      ps.red_cards = COALESCE(ev.rc,0),
      ps.assists = COALESCE(av.a,0);
END$$
DELIMITER ;

-- Get a live league table (ranked) using team_stats if populated, else compute from matches on the fly
DROP PROCEDURE IF EXISTS sp_get_league_table;
DELIMITER $$
CREATE PROCEDURE sp_get_league_table(IN p_league_id BIGINT UNSIGNED)
BEGIN
  -- Prefer team_stats if present for this league
  IF EXISTS (SELECT 1 FROM team_stats WHERE league_id = p_league_id) THEN
    SELECT t.team_id, tm.name AS team_name, ts.matches_played, ts.wins, ts.draws, ts.losses,
           ts.goals_scored, ts.goals_conceded,
           (ts.goals_scored - ts.goals_conceded) AS goal_diff,
           ts.points
    FROM team_stats ts
    JOIN teams tm ON tm.team_id = ts.team_id
    WHERE ts.league_id = p_league_id
    ORDER BY ts.points DESC, (ts.goals_scored - ts.goals_conceded) DESC, ts.goals_scored DESC, tm.name ASC;
  ELSE
    -- Compute on the fly from finalized matches
    SELECT t.team_id, t.name AS team_name,
           COUNT(*) AS matches_played,
           SUM(CASE WHEN (f.home_team_id = t.team_id AND m.home_score > m.away_score) OR
                         (f.away_team_id = t.team_id AND m.away_score > m.home_score) THEN 1 ELSE 0 END) AS wins,
           SUM(CASE WHEN m.home_score = m.away_score THEN 1 ELSE 0 END) AS draws,
           SUM(CASE WHEN (f.home_team_id = t.team_id AND m.home_score < m.away_score) OR
                         (f.away_team_id = t.team_id AND m.away_score < m.home_score) THEN 1 ELSE 0 END) AS losses,
           SUM(CASE WHEN f.home_team_id = t.team_id THEN m.home_score ELSE m.away_score END) AS goals_scored,
           SUM(CASE WHEN f.home_team_id = t.team_id THEN m.away_score ELSE m.home_score END) AS goals_conceded,
           SUM(CASE
                 WHEN (f.home_team_id = t.team_id AND m.home_score > m.away_score) OR
                      (f.away_team_id = t.team_id AND m.away_score > m.home_score) THEN 3
                 WHEN m.home_score = m.away_score THEN 1
                 ELSE 0
               END) AS points
    FROM fixtures f
    JOIN matches m ON m.fixture_id = f.fixture_id AND m.status_key = 'FINAL'
    JOIN teams t ON t.team_id IN (f.home_team_id, f.away_team_id)
    WHERE f.league_id = p_league_id
    GROUP BY t.team_id, t.name
    ORDER BY points DESC, (goals_scored - goals_conceded) DESC, goals_scored DESC, t.name ASC;
  END IF;
END$$
DELIMITER ;

-- =====================================================================
-- 17) SAMPLE QUERY HELPERS (commented)
-- =====================================================================
-- Public fan portal: next 10 fixtures
-- SELECT * FROM v_public_fixtures WHERE scheduled_at >= NOW() ORDER BY scheduled_at LIMIT 10;

-- League standings (using view)
-- SELECT *, (goals_for - goals_against) AS goal_diff
-- FROM v_league_standings WHERE league_id = ?
-- ORDER BY points DESC, (goals_for - goals_against) DESC, goals_for DESC;

-- Player stats aggregate (table)
-- SELECT * FROM player_stats WHERE league_id=? ORDER BY goals DESC, assists DESC;

-- Get ranked league table (procedure)
-- CALL sp_get_league_table(?);

-- Recompute aggregates if needed
-- CALL sp_recompute_team_stats(?);
-- CALL sp_recompute_player_stats(?);
