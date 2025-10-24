-- =====================================================================
-- NWU Sports League - Complete Seed Data
-- =====================================================================

USE NWU_Sports_League;

-- Clear existing data (optional - be careful in production)
SET FOREIGN_KEY_CHECKS = 0;

-- Truncate tables in correct order to maintain foreign key constraints
TRUNCATE TABLE match_events;
TRUNCATE TABLE match_lineups;
TRUNCATE TABLE match_stats;
TRUNCATE TABLE matches;
TRUNCATE TABLE fixtures;
TRUNCATE TABLE trial_attendance;
TRUNCATE TABLE trial_invitations;
TRUNCATE TABLE trial_events;
TRUNCATE TABLE team_applications;
TRUNCATE TABLE team_memberships;
TRUNCATE TABLE league_teams;
TRUNCATE TABLE leagues;
TRUNCATE TABLE seasons;
TRUNCATE TABLE player_stats;
TRUNCATE TABLE team_stats;
TRUNCATE TABLE player_injuries;
TRUNCATE TABLE players;
TRUNCATE TABLE coaches;
TRUNCATE TABLE teams;
TRUNCATE TABLE field_bookings;
TRUNCATE TABLE venue_fields;
TRUNCATE TABLE venues;
TRUNCATE TABLE user_organizations;
TRUNCATE TABLE user_roles;
TRUNCATE TABLE user_profiles;
TRUNCATE TABLE users;
TRUNCATE TABLE organizations;
TRUNCATE TABLE notifications;
TRUNCATE TABLE email_queue;
TRUNCATE TABLE activity_log;
TRUNCATE TABLE faqs;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- 1. INSERT LOOKUP DATA
-- =====================================================================

-- Roles
INSERT IGNORE INTO roles (role_id, role_name, description) VALUES
(1, 'admin', 'System administrator with full access'),
(2, 'coach', 'Sports team coach'),
(3, 'player', 'Athlete player'),
(4, 'scouter', 'Talent scout');

-- Approval Status
INSERT IGNORE INTO approval_status (status_key, description) VALUES
('PENDING', 'Awaiting review'),
('APPROVED', 'Approved by admin'),
('REJECTED', 'Rejected by admin');

-- Invite Status
INSERT IGNORE INTO invite_status (status_key, description) VALUES
('SENT', 'Invitation sent'),
('ACCEPTED', 'Accepted'),
('DECLINED', 'Declined'),
('EXPIRED', 'Expired'),
('CANCELLED', 'Cancelled');

-- Match Status
INSERT IGNORE INTO match_status (status_key, description) VALUES
('SCHEDULED', 'Not started'),
('IN_PROGRESS', 'Live'),
('FINAL', 'Completed'),
('POSTPONED', 'Postponed'),
('CANCELLED', 'Cancelled');

-- Booking Type
INSERT IGNORE INTO booking_type (type_key, description) VALUES
('TRAINING', 'Team training'),
('TRYOUT', 'Player tryout'),
('MATCH', 'Fixture/match');

-- Booking Status
INSERT IGNORE INTO booking_status (status_key, description) VALUES
('REQUESTED', 'Awaiting approval'),
('APPROVED', 'Approved'),
('REJECTED', 'Rejected'),
('CANCELLED', 'Cancelled'),
('COMPLETED', 'Completed');

-- Player Positions
INSERT IGNORE INTO player_position (position_key, position_name, description) VALUES
('GK', 'Goalkeeper', 'Responsible for preventing the opposing team from scoring by guarding the goal'),
('RB', 'Right Back', 'Defender playing on the right side of the field'),
('CB', 'Centre Back', 'Central defender focused on stopping opposing attacks'),
('LB', 'Left Back', 'Defender playing on the left side of the field'),
('CDM', 'Defensive Midfielder', 'Midfielder focused on defensive duties'),
('CM', 'Central Midfielder', 'Versatile midfielder playing in central areas'),
('CAM', 'Attacking Midfielder', 'Advanced midfielder focused on creating scoring opportunities'),
('RW', 'Right Winger', 'Attacker playing on the right wing'),
('LW', 'Left Winger', 'Attacker playing on the left wing'),
('ST', 'Striker', 'Forward primarily responsible for scoring goals');

-- Event Types
INSERT IGNORE INTO event_type (event_key, description) VALUES
('GOAL', 'Goal'),
('ASSIST', 'Assist'),
('YELLOW_CARD', 'Yellow card'),
('RED_CARD', 'Red card'),
('OWN_GOAL', 'Own goal'),
('SUB_ON', 'Substitution on'),
('SUB_OFF', 'Substitution off'),
('PENALTY_GOAL', 'Penalty scored'),
('PENALTY_MISS', 'Penalty missed'),
('SAVE', 'Goalkeeper save'),
('CLEAN_SHEET', 'Clean sheet');

-- Notification Types
INSERT IGNORE INTO notification_type (type_key, description) VALUES
('TRIAL_INVITE', 'Trial invitation'),
('MATCH_UPDATE', 'Fixture/match update'),
('ANNOUNCEMENT', 'Announcement'),
('BOOKING_UPDATE', 'Field booking update');

-- =====================================================================
-- 2. ORGANIZATIONS
-- =====================================================================

INSERT INTO organizations (organization_id, name, org_type, created_at) VALUES
(1, 'North-West University', 'UNIVERSITY', NOW()),
(2, 'Nike South Africa', 'SPONSOR', NOW()),
(3, 'Talent Scout Africa', 'SCOUTING_AGENCY', NOW()),
(4, 'Potchefstroom Football Club', 'CLUB', NOW());

-- =====================================================================
-- 3. USERS & PROFILES
-- =====================================================================

-- Password for all users: "Password123!" (bcrypt hash)
INSERT INTO users (user_id, email, phone_e164, password_hash, is_active, email_verified_at, created_at) VALUES
-- Admin users
(1, 'admin@nwu.ac.za', '+27181234567', '$2a$12$8SgDdW.5rVc7m8UJfKq3UeT9Y2vB1nC3xZ6lP8qR0wM4hN7jV2aBc', 1, NOW(), NOW()),
(2, 'sports.admin@nwu.ac.za', '+27181234568', '$2a$12$8SgDdW.5rVc7m8UJfKq3UeT9Y2vB1nC3xZ6lP8qR0wM4hN7jV2aBc', 1, NOW(), NOW()),

-- Coaches
(3, 'coach.john@nwu.ac.za', '+27181234569', '$2a$12$8SgDdW.5rVc7m8UJfKq3UeT9Y2vB1nC3xZ6lP8qR0wM4hN7jV2aBc', 1, NOW(), NOW()),
(4, 'coach.sarah@nwu.ac.za', '+27181234570', '$2a$12$8SgDdW.5rVc7m8UJfKq3UeT9Y2vB1nC3xZ6lP8qR0wM4hN7jV2aBc', 1, NOW(), NOW()),
(5, 'coach.mike@nwu.ac.za', '+27181234571', '$2a$12$8SgDdW.5rVc7m8UJfKq3UeT9Y2vB1nC3xZ6lP8qR0wM4hN7jV2aBc', 1, NOW(), NOW()),

-- Scouts
(6, 'scout.david@talentscout.com', '+27181234572', '$2a$12$8SgDdW.5rVc7m8UJfKq3UeT9Y2vB1nC3xZ6lP8qR0wM4hN7jV2aBc', 1, NOW(), NOW()),
(7, 'scout.lisa@talentscout.com', '+27181234573', '$2a$12$8SgDdW.5rVc7m8UJfKq3UeT9Y2vB1nC3xZ6lP8qR0wM4hN7jV2aBc', 1, NOW(), NOW()),

-- Players (20 players)
(8, 'player.thabo@student.nwu.ac.za', '+27181234574', '$2a$12$8SgDdW.5rVc7m8UJfKq3UeT9Y2vB1nC3xZ6lP8qR0wM4hN7jV2aBc', 1, NOW(), NOW()),
(9, 'player.sipho@student.nwu.ac.za', '+27181234575', '$2a$12$8SgDdW.5rVc7m8UJfKq3UeT9Y2vB1nC3xZ6lP8qR0wM4hN7jV2aBc', 1, NOW(), NOW()),
(10, 'player.lerato@student.nwu.ac.za', '+27181234576', '$2a$12$8SgDdW.5rVc7m8UJfKq3UeT9Y2vB1nC3xZ6lP8qR0wM4hN7jV2aBc', 1, NOW(), NOW()),
(11, 'player.tumi@student.nwu.ac.za', '+27181234577', '$2a$12$8SgDdW.5rVc7m8UJfKq3UeT9Y2vB1nC3xZ6lP8qR0wM4hN7jV2aBc', 1, NOW(), NOW()),
(12, 'player.zanele@student.nwu.ac.za', '+27181234578', '$2a$12$8SgDdW.5rVc7m8UJfKq3UeT9Y2vB1nC3xZ6lP8qR0wM4hN7jV2aBc', 1, NOW(), NOW()),
(13, 'player.kagiso@student.nwu.ac.za', '+27181234579', '$2a$12$8SgDdW.5rVc7m8UJfKq3UeT9Y2vB1nC3xZ6lP8qR0wM4hN7jV2aBc', 1, NOW(), NOW()),
(14, 'player.nomsa@student.nwu.ac.za', '+27181234580', '$2a$12$8SgDdW.5rVc7m8UJfKq3UeT9Y2vB1nC3xZ6lP8qR0wM4hN7jV2aBc', 1, NOW(), NOW()),
(15, 'player.bongani@student.nwu.ac.za', '+27181234581', '$2a$12$8SgDdW.5rVc7m8UJfKq3UeT9Y2vB1nC3xZ6lP8qR0wM4hN7jV2aBc', 1, NOW(), NOW()),
(16, 'player.ayanda@student.nwu.ac.za', '+27181234582', '$2a$12$8SgDdW.5rVc7m8UJfKq3UeT9Y2vB1nC3xZ6lP8qR0wM4hN7jV2aBc', 1, NOW(), NOW()),
(17, 'player.mpho@student.nwu.ac.za', '+27181234583', '$2a$12$8SgDdW.5rVc7m8UJfKq3UeT9Y2vB1nC3xZ6lP8qR0wM4hN7jV2aBc', 1, NOW(), NOW()),
(18, 'player.nathan@student.nwu.ac.za', '+27181234584', '$2a$12$8SgDdW.5rVc7m8UJfKq3UeT9Y2vB1nC3xZ6lP8qR0wM4hN7jV2aBc', 1, NOW(), NOW()),
(19, 'player.chloe@student.nwu.ac.za', '+27181234585', '$2a$12$8SgDdW.5rVc7m8UJfKq3UeT9Y2vB1nC3xZ6lP8qR0wM4hN7jV2aBc', 1, NOW(), NOW()),
(20, 'player.ethan@student.nwu.ac.za', '+27181234586', '$2a$12$8SgDdW.5rVc7m8UJfKq3UeT9Y2vB1nC3xZ6lP8qR0wM4hN7jV2aBc', 1, NOW(), NOW()),
(21, 'player.zoe@student.nwu.ac.za', '+27181234587', '$2a$12$8SgDdW.5rVc7m8UJfKq3UeT9Y2vB1nC3xZ6lP8qR0wM4hN7jV2aBc', 1, NOW(), NOW()),
(22, 'player.liam@student.nwu.ac.za', '+27181234588', '$2a$12$8SgDdW.5rVc7m8UJfKq3UeT9Y2vB1nC3xZ6lP8qR0wM4hN7jV2aBc', 1, NOW(), NOW()),
(23, 'player.olivia@student.nwu.ac.za', '+27181234589', '$2a$12$8SgDdW.5rVc7m8UJfKq3UeT9Y2vB1nC3xZ6lP8qR0wM4hN7jV2aBc', 1, NOW(), NOW()),
(24, 'player.noah@student.nwu.ac.za', '+27181234590', '$2a$12$8SgDdW.5rVc7m8UJfKq3UeT9Y2vB1nC3xZ6lP8qR0wM4hN7jV2aBc', 1, NOW(), NOW()),
(25, 'player.emma@student.nwu.ac.za', '+27181234591', '$2a$12$8SgDdW.5rVc7m8UJfKq3UeT9Y2vB1nC3xZ6lP8qR0wM4hN7jV2aBc', 1, NOW(), NOW()),
(26, 'player.mason@student.nwu.ac.za', '+27181234592', '$2a$12$8SgDdW.5rVc7m8UJfKq3UeT9Y2vB1nC3xZ6lP8qR0wM4hN7jV2aBc', 1, NOW(), NOW()),
(27, 'player.ava@student.nwu.ac.za', '+27181234593', '$2a$12$8SgDdW.5rVc7m8UJfKq3UeT9Y2vB1nC3xZ6lP8qR0wM4hN7jV2aBc', 1, NOW(), NOW());

-- User Profiles
INSERT INTO user_profiles (user_id, first_name, last_name, birth_date, bio, created_at) VALUES
-- Admins
(1, 'Admin', 'User', '1980-01-01', 'System Administrator for NWU Sports League', NOW()),
(2, 'Sports', 'Manager', '1985-03-15', 'Sports Department Manager', NOW()),

-- Coaches
(3, 'John', 'Smith', '1975-06-20', 'Head Coach with 15 years experience', NOW()),
(4, 'Sarah', 'Johnson', '1980-09-12', 'Former professional player turned coach', NOW()),
(5, 'Mike', 'Brown', '1978-11-05', 'Specialized in youth development', NOW()),

-- Scouts
(6, 'David', 'Wilson', '1982-04-18', 'Professional talent scout', NOW()),
(7, 'Lisa', 'Davis', '1985-07-22', 'Scout focusing on emerging talents', NOW()),

-- Players
(8, 'Thabo', 'Molefe', '2000-03-15', 'Skilled midfielder with great vision', NOW()),
(9, 'Sipho', 'Ndlovu', '2001-05-20', 'Fast winger with excellent dribbling', NOW()),
(10, 'Lerato', 'Botha', '2000-08-12', 'Creative attacking midfielder', NOW()),
(11, 'Tumi', 'Van der Merwe', '2001-11-30', 'Strong central defender', NOW()),
(12, 'Zanele', 'Khumalo', '2000-02-14', 'Clinical striker with great finishing', NOW()),
(13, 'Kagiso', 'Peters', '2001-07-08', 'Reliable goalkeeper', NOW()),
(14, 'Nomsa', 'Williams', '2000-12-25', 'Versatile defender', NOW()),
(15, 'Bongani', 'Taylor', '2001-04-03', 'Box-to-box midfielder', NOW()),
(16, 'Ayanda', 'Jones', '2000-09-17', 'Technical playmaker', NOW()),
(17, 'Mpho', 'Clark', '2001-01-11', 'Pacey full-back', NOW()),
(18, 'Nathan', 'Mitchell', '2000-06-22', 'Target man striker', NOW()),
(19, 'Chloe', 'Anderson', '2001-03-08', 'Creative number 10', NOW()),
(20, 'Ethan', 'Roberts', '2000-10-19', 'Defensive midfielder', NOW()),
(21, 'Zoe', 'Thomas', '2001-12-05', 'Winger with great crossing', NOW()),
(22, 'Liam', 'Davis', '2000-04-28', 'Central defender', NOW()),
(23, 'Olivia', 'Wilson', '2001-08-14', 'Attacking midfielder', NOW()),
(24, 'Noah', 'Martin', '2000-11-07', 'Goalkeeper with great reflexes', NOW()),
(25, 'Emma', 'Thompson', '2001-02-23', 'Versatile midfielder', NOW()),
(26, 'Mason', 'Garcia', '2000-07-31', 'Clinical finisher', NOW()),
(27, 'Ava', 'Martinez', '2001-05-16', 'Defensive organizer', NOW());

-- User Roles
INSERT INTO user_roles (user_id, role_id) VALUES
-- Admins
(1, 1), (2, 1),
-- Coaches
(3, 2), (4, 2), (5, 2),
-- Scouts
(6, 4), (7, 4),
-- Players
(8, 3), (9, 3), (10, 3), (11, 3), (12, 3), (13, 3), (14, 3), (15, 3), (16, 3), (17, 3),
(18, 3), (19, 3), (20, 3), (21, 3), (22, 3), (23, 3), (24, 3), (25, 3), (26, 3), (27, 3);

-- User Organizations
INSERT INTO user_organizations (user_id, organization_id, org_role) VALUES
(1, 1, 'ADMIN'),
(2, 1, 'STAFF'),
(3, 1, 'COACH'),
(4, 1, 'COACH'),
(5, 1, 'COACH'),
(6, 3, 'SCOUT'),
(7, 3, 'SCOUT');

-- =====================================================================
-- 4. VENUES & FIELDS
-- =====================================================================

INSERT INTO venues (venue_id, name, address, city, capacity, surface, is_active) VALUES
(1, 'NWU Sports Complex', '11 Hoffman Street', 'Potchefstroom', 5000, 'grass', 1),
(2, 'Fanie du Toit Sports Grounds', '1 University Drive', 'Potchefstroom', 3000, 'grass', 1),
(3, 'Potchefstroom Stadium', '25 Kock Street', 'Potchefstroom', 8000, 'artificial', 1);

INSERT INTO venue_fields (field_id, venue_id, name, is_active) VALUES
(1, 1, 'Main Field', 1),
(2, 1, 'Training Field A', 1),
(3, 1, 'Training Field B', 1),
(4, 2, 'North Field', 1),
(5, 2, 'South Field', 1),
(6, 3, 'Stadium Main', 1);

-- =====================================================================
-- 5. PLAYERS & COACHES
-- =====================================================================

-- Coaches
INSERT INTO coaches (coach_id, user_id, qualification) VALUES
(1, 3, 'UEFA A License'),
(2, 4, 'SAFA Level 3'),
(3, 5, 'UEFA B License');

-- Players
INSERT INTO players (player_id, user_id, dominant_foot, height_cm, preferred_position) VALUES
(1, 8, 'RIGHT', 178, 'CM'),
(2, 9, 'LEFT', 172, 'LW'),
(3, 10, 'RIGHT', 175, 'CAM'),
(4, 11, 'RIGHT', 185, 'CB'),
(5, 12, 'RIGHT', 180, 'ST'),
(6, 13, 'RIGHT', 188, 'GK'),
(7, 14, 'RIGHT', 170, 'RB'),
(8, 15, 'RIGHT', 177, 'CDM'),
(9, 16, 'LEFT', 174, 'CM'),
(10, 17, 'RIGHT', 176, 'LB'),
(11, 18, 'RIGHT', 182, 'ST'),
(12, 19, 'RIGHT', 168, 'CAM'),
(13, 20, 'RIGHT', 179, 'CDM'),
(14, 21, 'LEFT', 171, 'RW'),
(15, 22, 'RIGHT', 184, 'CB'),
(16, 23, 'RIGHT', 173, 'CM'),
(17, 24, 'RIGHT', 190, 'GK'),
(18, 25, 'RIGHT', 178, 'CM'),
(19, 26, 'RIGHT', 181, 'ST'),
(20, 27, 'RIGHT', 183, 'CB');

-- =====================================================================
-- 6. TEAMS
-- =====================================================================

INSERT INTO teams (team_id, name, short_code, gender, age_group, organization_id, created_by, approval_status, approved_by, approved_at, coach_id) VALUES
(1, 'NWU Eagles', 'EAGLES', 'MEN', 'SENIOR', 1, 1, 'APPROVED', 1, NOW(), 1),
(2, 'NWU Falcons', 'FALCONS', 'MEN', 'SENIOR', 1, 1, 'APPROVED', 1, NOW(), 2),
(3, 'NWU Hawks', 'HAWKS', 'MEN', 'SENIOR', 1, 1, 'APPROVED', 1, NOW(), 3),
(4, 'PFC United', 'PFC', 'MEN', 'SENIOR', 4, 1, 'APPROVED', 1, NOW(), NULL);

-- =====================================================================
-- 7. SEASONS & LEAGUES
-- =====================================================================

INSERT INTO seasons (season_id, name, start_date, end_date) VALUES
(1, '2024 Season', '2024-01-15', '2024-11-30'),
(2, '2025 Season', '2025-01-20', '2025-12-15');

INSERT INTO leagues (league_id, name, season_id, level) VALUES
(1, 'NWU Premier League', 1, 'Premier'),
(2, 'NWU Championship', 1, 'Division 1'),
(3, 'NWU Premier League 2025', 2, 'Premier');

INSERT INTO league_teams (league_id, team_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4);

-- =====================================================================
-- 8. TEAM MEMBERSHIPS
-- =====================================================================

-- NWU Eagles (Team 1)
INSERT INTO team_memberships (team_membership_id, team_id, player_id, squad_number, joined_at, approval_status, approved_by, approved_at) VALUES
(1, 1, 1, 8, '2024-01-15', 'APPROVED', 1, NOW()),
(2, 1, 2, 11, '2024-01-15', 'APPROVED', 1, NOW()),
(3, 1, 3, 10, '2024-01-15', 'APPROVED', 1, NOW()),
(4, 1, 4, 5, '2024-01-15', 'APPROVED', 1, NOW()),
(5, 1, 5, 9, '2024-01-15', 'APPROVED', 1, NOW());

-- NWU Falcons (Team 2)
INSERT INTO team_memberships (team_membership_id, team_id, player_id, squad_number, joined_at, approval_status, approved_by, approved_at) VALUES
(6, 2, 6, 1, '2024-01-15', 'APPROVED', 1, NOW()),
(7, 2, 7, 2, '2024-01-15', 'APPROVED', 1, NOW()),
(8, 2, 8, 6, '2024-01-15', 'APPROVED', 1, NOW()),
(9, 2, 9, 7, '2024-01-15', 'APPROVED', 1, NOW()),
(10, 2, 10, 3, '2024-01-15', 'APPROVED', 1, NOW());

-- NWU Hawks (Team 3)
INSERT INTO team_memberships (team_membership_id, team_id, player_id, squad_number, joined_at, approval_status, approved_by, approved_at) VALUES
(11, 3, 11, 9, '2024-01-15', 'APPROVED', 1, NOW()),
(12, 3, 12, 10, '2024-01-15', 'APPROVED', 1, NOW()),
(13, 3, 13, 6, '2024-01-15', 'APPROVED', 1, NOW()),
(14, 3, 14, 7, '2024-01-15', 'APPROVED', 1, NOW()),
(15, 3, 15, 4, '2024-01-15', 'APPROVED', 1, NOW());

-- PFC United (Team 4)
INSERT INTO team_memberships (team_membership_id, team_id, player_id, squad_number, joined_at, approval_status, approved_by, approved_at) VALUES
(16, 4, 16, 8, '2024-01-15', 'APPROVED', 1, NOW()),
(17, 4, 17, 1, '2024-01-15', 'APPROVED', 1, NOW()),
(18, 4, 18, 11, '2024-01-15', 'APPROVED', 1, NOW()),
(19, 4, 19, 10, '2024-01-15', 'APPROVED', 1, NOW()),
(20, 4, 20, 5, '2024-01-15', 'APPROVED', 1, NOW());

-- =====================================================================
-- 9. FIXTURES & MATCHES
-- =====================================================================

-- Create fixtures for the next 2 weeks
INSERT INTO fixtures (fixture_id, league_id, home_team_id, away_team_id, scheduled_at, venue_field_id, created_by, approval_status, approved_by, approved_at) VALUES
-- Past matches (FINAL)
(1, 1, 1, 2, DATE_SUB(NOW(), INTERVAL 7 DAY), 1, 1, 'APPROVED', 1, NOW()),
(2, 1, 3, 4, DATE_SUB(NOW(), INTERVAL 5 DAY), 4, 1, 'APPROVED', 1, NOW()),

-- Today's matches (some might be LIVE)
(3, 1, 2, 3, NOW(), 1, 1, 'APPROVED', 1, NOW()),
(4, 1, 4, 1, DATE_ADD(NOW(), INTERVAL 2 HOUR), 6, 1, 'APPROVED', 1, NOW()),

-- Upcoming matches
(5, 1, 1, 3, DATE_ADD(NOW(), INTERVAL 2 DAY), 1, 1, 'APPROVED', 1, NOW()),
(6, 1, 2, 4, DATE_ADD(NOW(), INTERVAL 4 DAY), 4, 1, 'APPROVED', 1, NOW()),
(7, 1, 3, 1, DATE_ADD(NOW(), INTERVAL 7 DAY), 6, 1, 'APPROVED', 1, NOW()),
(8, 1, 4, 2, DATE_ADD(NOW(), INTERVAL 9 DAY), 1, 1, 'APPROVED', 1, NOW());

-- Create matches for approved fixtures
INSERT INTO matches (match_id, fixture_id, status_key, home_score, away_score, started_at, ended_at) VALUES
-- Past matches
(1, 1, 'FINAL', 2, 1, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY) + INTERVAL 105 MINUTE),
(2, 2, 'FINAL', 1, 1, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 105 MINUTE),

-- Today's matches - one might be IN_PROGRESS
(3, 3, 'IN_PROGRESS', 1, 0, NOW(), NULL),
(4, 4, 'SCHEDULED', 0, 0, NULL, NULL),

-- Upcoming matches
(5, 5, 'SCHEDULED', 0, 0, NULL, NULL),
(6, 6, 'SCHEDULED', 0, 0, NULL, NULL),
(7, 7, 'SCHEDULED', 0, 0, NULL, NULL),
(8, 8, 'SCHEDULED', 0, 0, NULL, NULL);

-- Match Stats
INSERT INTO match_stats (match_id, home_goals, away_goals, home_yellow, home_red, away_yellow, away_red, man_ot_match) VALUES
(1, 2, 1, 2, 0, 1, 0, 1),
(2, 1, 1, 1, 0, 2, 0, 12),
(3, 1, 0, 1, 0, 0, 0, 2);

-- =====================================================================
-- 10. MATCH LINEUPS
-- =====================================================================

-- Match 1 Lineups (NWU Eagles vs NWU Falcons)
INSERT INTO match_lineups (match_id, team_id, player_id, is_starting, shirt_number, position_key, minutes_played) VALUES
-- Eagles starting lineup
(1, 1, 1, 1, 8, 'CM', 90),
(1, 1, 2, 1, 11, 'LW', 85),
(1, 1, 3, 1, 10, 'CAM', 90),
(1, 1, 4, 1, 5, 'CB', 90),
(1, 1, 5, 1, 9, 'ST', 90),

-- Falcons starting lineup
(1, 2, 6, 1, 1, 'GK', 90),
(1, 2, 7, 1, 2, 'RB', 90),
(1, 2, 8, 1, 6, 'CDM', 90),
(1, 2, 9, 1, 7, 'CM', 90),
(1, 2, 10, 1, 3, 'LB', 90);

-- Match 2 Lineups (NWU Hawks vs PFC United)
INSERT INTO match_lineups (match_id, team_id, player_id, is_starting, shirt_number, position_key, minutes_played) VALUES
-- Hawks starting lineup
(2, 3, 11, 1, 9, 'ST', 90),
(2, 3, 12, 1, 10, 'CAM', 90),
(2, 3, 13, 1, 6, 'CDM', 90),
(2, 3, 14, 1, 7, 'RW', 90),
(2, 3, 15, 1, 4, 'CB', 90),

-- PFC United starting lineup
(2, 4, 16, 1, 8, 'CM', 90),
(2, 4, 17, 1, 1, 'GK', 90),
(2, 4, 18, 1, 11, 'LW', 90),
(2, 4, 19, 1, 10, 'CAM', 90),
(2, 4, 20, 1, 5, 'CB', 90);

-- =====================================================================
-- 11. MATCH EVENTS
-- =====================================================================

-- Match 1 Events (Eagles 2-1 Falcons)
INSERT INTO match_events (match_id, team_id, player_id, assist_player_id, minute_mark, event_key, notes) VALUES
(1, 1, 5, 3, 23, 'GOAL', 'Great finish from inside the box'),
(1, 2, 9, NULL, 45, 'GOAL', 'Long range shot'),
(1, 1, 2, 1, 67, 'GOAL', 'Header from cross'),
(1, 1, 4, NULL, 34, 'YELLOW_CARD', 'Professional foul'),
(1, 2, 8, NULL, 78, 'YELLOW_CARD', 'Late tackle');

-- Match 2 Events (Hawks 1-1 PFC United)
INSERT INTO match_events (match_id, team_id, player_id, assist_player_id, minute_mark, event_key, notes) VALUES
(2, 3, 11, 12, 15, 'GOAL', 'Clinical finish'),
(2, 4, 18, 16, 72, 'GOAL', 'Equalizer in second half'),
(2, 3, 15, NULL, 65, 'YELLOW_CARD', 'Dangerous play'),
(2, 4, 20, NULL, 88, 'YELLOW_CARD', 'Time wasting');

-- =====================================================================
-- 12. PLAYER & TEAM STATS
-- =====================================================================

-- Player Stats
INSERT INTO player_stats (player_id, league_id, matches_played, goals, assists, yellow_cards, red_cards, minutes_played) VALUES
-- Eagles players
(1, 1, 1, 0, 1, 0, 0, 90),
(2, 1, 1, 1, 0, 0, 0, 85),
(3, 1, 1, 0, 1, 0, 0, 90),
(4, 1, 1, 0, 0, 1, 0, 90),
(5, 1, 1, 1, 0, 0, 0, 90),

-- Falcons players
(6, 1, 1, 0, 0, 0, 0, 90),
(7, 1, 1, 0, 0, 0, 0, 90),
(8, 1, 1, 0, 0, 1, 0, 90),
(9, 1, 1, 1, 0, 0, 0, 90),
(10, 1, 1, 0, 0, 0, 0, 90),

-- Hawks players
(11, 1, 1, 1, 0, 0, 0, 90),
(12, 1, 1, 0, 1, 0, 0, 90),
(13, 1, 1, 0, 0, 0, 0, 90),
(14, 1, 1, 0, 0, 0, 0, 90),
(15, 1, 1, 0, 0, 1, 0, 90),

-- PFC United players
(16, 1, 1, 0, 1, 0, 0, 90),
(17, 1, 1, 0, 0, 0, 0, 90),
(18, 1, 1, 1, 0, 0, 0, 90),
(19, 1, 1, 0, 0, 0, 0, 90),
(20, 1, 1, 0, 0, 1, 0, 90);

-- Team Stats
INSERT INTO team_stats (team_id, league_id, matches_played, wins, draws, losses, goals_scored, goals_conceded, points) VALUES
(1, 1, 1, 1, 0, 0, 2, 1, 3),
(2, 1, 1, 0, 0, 1, 1, 2, 0),
(3, 1, 1, 0, 1, 0, 1, 1, 1),
(4, 1, 1, 0, 1, 0, 1, 1, 1);

-- =====================================================================
-- 13. FIELD BOOKINGS
-- =====================================================================

INSERT INTO field_bookings (booking_id, venue_field_id, type_key, team_id, starts_at, ends_at, requested_by, status_key, approved_by, approved_at, notes) VALUES
(1, 2, 'TRAINING', 1, DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 3 HOUR), 3, 'APPROVED', 1, NOW(), 'Team training session'),
(2, 3, 'TRAINING', 2, DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 3 HOUR), 4, 'APPROVED', 1, NOW(), 'Technical training'),
(3, 1, 'MATCH', NULL, DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 5 HOUR), 1, 'APPROVED', 1, NOW(), 'League match');

-- =====================================================================
-- 14. TRIAL EVENTS & INVITATIONS
-- =====================================================================

INSERT INTO trial_events (trial_id, team_id, venue_field_id, starts_at, ends_at, max_slots, created_by, approval_status, approved_by, approved_at) VALUES
(1, 1, 2, DATE_ADD(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 9 HOUR), 30, 3, 'APPROVED', 1, NOW()),
(2, NULL, 4, DATE_ADD(NOW(), INTERVAL 14 DAY), DATE_ADD(NOW(), INTERVAL 16 HOUR), 50, 6, 'APPROVED', 1, NOW());

INSERT INTO trial_invitations (invitation_id, trial_id, scout_user_id, player_id, status_key, sent_at, message) VALUES
(1, 1, 6, 1, 'SENT', NOW(), 'We were impressed with your recent performances'),
(2, 1, 6, 2, 'SENT', NOW(), 'Your skills match what we are looking for'),
(3, 2, 7, 3, 'SENT', NOW(), 'Open trial for talented players');

-- =====================================================================
-- 15. PLAYER INJURIES
-- =====================================================================

INSERT INTO player_injuries (injury_id, player_id, reported_by, injury_type, description, injury_date, expected_return, severity, status) VALUES
(1, 2, 3, 'Hamstring Strain', 'Grade 1 hamstring strain during training', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 14 DAY), 'Minor', 'Active'),
(2, 15, 4, 'Ankle Sprain', 'Lateral ankle sprain during match', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_ADD(NOW(), INTERVAL 21 DAY), 'Moderate', 'Active');

-- =====================================================================
-- 16. FAQ & NOTIFICATIONS
-- =====================================================================

INSERT INTO faqs (faq_id, question, answer_md, is_active, created_by, updated_by) VALUES
(1, 'How do I register for the league?', 'You can register through our online portal by creating an account and selecting your role (player, coach, or scout).', 1, 1, NULL),
(2, 'What are the league fees?', 'The league fees vary depending on the team and division. Please contact the sports department for specific pricing.', 1, 1, NULL),
(3, 'How are matches scheduled?', 'Matches are scheduled by the league administrators and are typically played on weekends. The full fixture list is published at the start of each season.', 1, 1, NULL);

INSERT INTO notifications (notification_id, user_id, type_key, title, body, is_read, created_at) VALUES
(1, 8, 'TRIAL_INVITE', 'Trial Invitation', 'You have been invited to attend a team trial with NWU Eagles', 0, NOW()),
(2, 3, 'MATCH_UPDATE', 'Match Scheduled', 'Your next match against NWU Falcons has been confirmed', 0, NOW()),
(3, 1, 'ANNOUNCEMENT', 'League Update', 'New league rules have been published for the 2024 season', 0, NOW());

-- =====================================================================
-- 17. ACTIVITY LOG (CORRECTED)
-- =====================================================================


-- Insert corrected activity log entries
INSERT INTO activity_log (log_id, actor_user_id, action, entity_type, entity_id, meta_json, created_at) VALUES
(1, 1, 'CREATE_TEAM', 'teams', 1, '{"team_name": "NWU Eagles"}', NOW()),
(2, 1, 'APPROVE_FIXTURE', 'fixtures', 1, '{"home_team": "NWU Eagles", "away_team": "NWU Falcons"}', NOW()),
(3, 3, 'UPDATE_MATCH', 'matches', 1, '{"home_score": 2, "away_score": 1}', NOW());

-- =====================================================================
-- 18. TEAM APPLICATIONS
-- =====================================================================

INSERT INTO team_applications (application_id, team_id, player_id, motivation, status_key, created_at) VALUES
(1, 1, 16, 'I would like to join NWU Eagles to develop my skills and contribute to the team success.', 'PENDING', NOW()),
(2, 2, 17, 'As an experienced player, I believe I can add value to NWU Falcons.', 'PENDING', NOW());

-- =====================================================================
-- VERIFICATION QUERIES
-- =====================================================================

-- Verify data was inserted correctly
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL SELECT 'Players', COUNT(*) FROM players
UNION ALL SELECT 'Coaches', COUNT(*) FROM coaches
UNION ALL SELECT 'Teams', COUNT(*) FROM teams
UNION ALL SELECT 'Fixtures', COUNT(*) FROM fixtures
UNION ALL SELECT 'Matches', COUNT(*) FROM matches
UNION ALL SELECT 'Team Memberships', COUNT(*) FROM team_memberships
UNION ALL SELECT 'Player Stats', COUNT(*) FROM player_stats
UNION ALL SELECT 'Team Stats', COUNT(*) FROM team_stats;

-- Show current standings
SELECT 
    t.name AS team_name,
    ts.points,
    ts.matches_played,
    ts.wins,
    ts.draws,
    ts.losses,
    ts.goals_scored,
    ts.goals_conceded,
    (ts.goals_scored - ts.goals_conceded) AS goal_difference
FROM team_stats ts
JOIN teams t ON t.team_id = ts.team_id
WHERE ts.league_id = 1
ORDER BY ts.points DESC, goal_difference DESC;

-- Show top scorers
SELECT 
    CONCAT(up.first_name, ' ', up.last_name) AS player_name,
    t.name AS team_name,
    ps.goals
FROM player_stats ps
JOIN players p ON p.player_id = ps.player_id
JOIN user_profiles up ON up.user_id = p.user_id
JOIN team_memberships tm ON tm.player_id = p.player_id AND tm.left_at IS NULL
JOIN teams t ON t.team_id = tm.team_id
WHERE ps.league_id = 1 AND ps.goals > 0
ORDER BY ps.goals DESC;

-- Show upcoming fixtures
SELECT 
    f.fixture_id,
    ht.name AS home_team,
    at.name AS away_team,
    f.scheduled_at,
    v.name AS venue,
    m.status_key
FROM fixtures f
JOIN teams ht ON ht.team_id = f.home_team_id
JOIN teams at ON at.team_id = f.away_team_id
LEFT JOIN venue_fields vf ON vf.field_id = f.venue_field_id
LEFT JOIN venues v ON v.venue_id = vf.venue_id
LEFT JOIN matches m ON m.fixture_id = f.fixture_id
WHERE f.scheduled_at >= NOW()
ORDER BY f.scheduled_at ASC
LIMIT 5;