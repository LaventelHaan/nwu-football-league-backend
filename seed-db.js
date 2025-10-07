const mysql = require('mysql2');

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'debruyne17',
  database: 'nwusoccer'
});

// Mock data (simplified version for seeding)
const mockPlayers = [
  {
    id: 1,
    name: "John Doe",
    team: "NWU Eagles",
    position: "Forward",
    age: 22,
    nationality: "South Africa",
    goals: 18,
    assists: 7,
    appearances: 17,
    games_played: 17,
    yellow_cards: 2,
    red_cards: 0,
    avatar: "/football-player-portrait.png",
    join_date: "2023-08-15",
    previous_team: "Youth Academy",
    jersey_number: 9,
    height: 180,
    weight: 75,
    performance: 88,
    medical_notes: "Minor ankle sprain, recovering well.",
    email: "john.doe@nwu.edu",
    phone: "+27 82 123 4567",
    emergency_contact_name: "Jane Doe",
    emergency_contact_phone: "+27 82 765 4321",
    status: "Active",
    rating: 88,
    matches_played: 17,
    medical_status: "Fit"
  },
  {
    id: 2,
    name: "Mike Smith",
    team: "Wits Wolves",
    position: "Midfielder",
    age: 21,
    nationality: "South Africa",
    goals: 15,
    assists: 12,
    appearances: 18,
    games_played: 18,
    yellow_cards: 4,
    red_cards: 1,
    avatar: "/football-midfielder-portrait.png",
    join_date: "2023-07-20",
    previous_team: "Local Club FC",
    jersey_number: 8,
    height: 175,
    weight: 70,
    performance: 85,
    medical_notes: "No current injuries.",
    email: "mike.smith@wits.ac.za",
    phone: "+27 83 234 5678",
    emergency_contact_name: "Sarah Smith",
    emergency_contact_phone: "+27 83 876 5432",
    status: "Active",
    rating: 85,
    matches_played: 18,
    medical_status: "Fit"
  },
  {
    id: 3,
    name: "David Johnson",
    team: "UCT Lions",
    position: "Forward",
    age: 23,
    nationality: "Nigeria",
    goals: 12,
    assists: 5,
    appearances: 16,
    games_played: 16,
    yellow_cards: 1,
    red_cards: 0,
    avatar: "/football-striker-portrait.png",
    join_date: "2023-09-01",
    previous_team: "Lagos United",
    jersey_number: 11,
    height: 182,
    weight: 78,
    performance: 82,
    medical_notes: "Recovered from knee surgery last season.",
    email: "david.johnson@uct.ac.za",
    phone: "+27 84 345 6789",
    emergency_contact_name: "Mary Johnson",
    emergency_contact_phone: "+27 84 987 6543",
    status: "Active",
    rating: 82,
    matches_played: 16,
    medical_status: "Fit"
  },
  {
    id: 4,
    name: "Alex Wilson",
    team: "UP Tuks",
    position: "Defender",
    age: 24,
    nationality: "South Africa",
    goals: 3,
    assists: 8,
    appearances: 18,
    games_played: 18,
    yellow_cards: 6,
    red_cards: 0,
    avatar: "/football-defender-portrait.png",
    join_date: "2023-06-10",
    previous_team: "Pretoria FC",
    jersey_number: 5,
    height: 185,
    weight: 80,
    performance: 80,
    medical_notes: "Mild back pain, under physiotherapy.",
    email: "alex.wilson@up.ac.za",
    phone: "+27 85 456 7890",
    emergency_contact_name: "Laura Wilson",
    emergency_contact_phone: "+27 85 098 7654",
    status: "Active",
    rating: 80,
    matches_played: 18,
    medical_status: "Fit"
  },
  {
    id: 5,
    name: "Peter Brown",
    team: "UJ Orange",
    position: "Goalkeeper",
    age: 25,
    nationality: "Zimbabwe",
    goals: 0,
    assists: 1,
    appearances: 18,
    games_played: 18,
    yellow_cards: 1,
    red_cards: 0,
    avatar: "/football-goalkeeper-portrait.png",
    join_date: "2023-08-01",
    previous_team: "Harare City",
    jersey_number: 1,
    height: 190,
    weight: 82,
    performance: 90,
    medical_notes: "No injuries reported.",
    email: "peter.brown@uj.ac.za",
    phone: "+27 86 567 8901",
    emergency_contact_name: "Paul Brown",
    emergency_contact_phone: "+27 86 109 8765",
    status: "Active",
    rating: 90,
    matches_played: 18,
    medical_status: "Fit",
    clean_sheets: 8,
    saves: 67
  }
];

const mockStandings = [
  { position: 1, id: 1, name: "NWU Eagles", played: 18, wins: 14, draws: 3, losses: 1, goals_for: 42, goals_against: 12, goal_difference: 30, points: 45, form: "W,W,W,D,W", trend: "up" },
  { position: 2, id: 2, name: "Wits Wolves", played: 18, wins: 13, draws: 3, losses: 2, goals_for: 38, goals_against: 15, goal_difference: 23, points: 42, form: "W,L,W,W,D", trend: "same" },
  { position: 3, id: 3, name: "UCT Lions", played: 18, wins: 12, draws: 2, losses: 4, goals_for: 35, goals_against: 20, goal_difference: 15, points: 38, form: "W,W,L,W,W", trend: "up" },
  { position: 4, id: 4, name: "UP Tuks", played: 18, wins: 10, draws: 4, losses: 4, goals_for: 32, goals_against: 22, goal_difference: 10, points: 34, form: "D,W,L,D,W", trend: "down" },
  { position: 5, id: 5, name: "UJ Orange", played: 18, wins: 9, draws: 5, losses: 4, goals_for: 28, goals_against: 25, goal_difference: 3, points: 32, form: "L,D,W,D,L", trend: "down" }
];

const mockFixtures = [
  { id: 1, home_team: "NWU Eagles", away_team: "Wits Wolves", league: "Premier League", date: "2024-01-15", time: "15:00", venue: "NWU Stadium", status: "PENDING", round: "Round 19", created_by: "Admin", submitted_date: "2025-09-18" },
  { id: 2, home_team: "UCT Lions", away_team: "UP Tuks", league: "Premier League", date: "2024-01-15", time: "17:30", venue: "UCT Grounds", status: "upcoming", round: "Round 19", created_by: "John", submitted_date: "2025-09-18" },
  { id: 3, home_team: "UJ Orange", away_team: "Stellenbosch FC", league: "Premier League", date: "2024-01-16", time: "14:00", venue: "UJ Stadium", status: "PENDING", round: "Round 19", created_by: "Mary", submitted_date: "2025-09-17" }
];

console.log('Seeding database with mock data...');

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
  console.log('Connected to database');

  // Clear existing data
  const clearQueries = [
    'DELETE FROM players',
    'DELETE FROM teams',
    'DELETE FROM fixtures'
  ];

  let completed = 0;
  clearQueries.forEach(query => {
    db.query(query, (err) => {
      if (err) {
        console.error('Error clearing table:', err);
      }
      completed++;
      if (completed === clearQueries.length) {
        insertData();
      }
    });
  });

  function insertData() {
    console.log('Inserting mock data...');

    // Insert players
    const playerQuery = `
      INSERT INTO players (
        id, name, team, position, age, nationality, goals, assists, appearances,
        games_played, yellow_cards, red_cards, avatar, join_date, previous_team,
        jersey_number, height, weight, performance, medical_notes, email, phone,
        emergency_contact_name, emergency_contact_phone, status, rating,
        matches_played, medical_status, clean_sheets, saves
      ) VALUES ?
    `;

    const playerValues = mockPlayers.map(player => [
      player.id, player.name, player.team, player.position, player.age, player.nationality,
      player.goals, player.assists, player.appearances, player.games_played,
      player.yellow_cards, player.red_cards, player.avatar, player.join_date,
      player.previous_team, player.jersey_number, player.height, player.weight,
      player.performance, player.medical_notes, player.email, player.phone,
      player.emergency_contact_name, player.emergency_contact_phone, player.status,
      player.rating, player.matches_played, player.medical_status,
      player.clean_sheets || 0, player.saves || 0
    ]);

    db.query(playerQuery, [playerValues], (err) => {
      if (err) {
        console.error('Error inserting players:', err);
      } else {
        console.log('✅ Players inserted successfully');
      }
      checkCompletion();
    });

    // Insert teams
    const teamQuery = `
      INSERT INTO teams (
        id, name, played, wins, draws, losses, goals_for, goals_against,
        goal_difference, points, form, trend, position
      ) VALUES ?
    `;

    const teamValues = mockStandings.map(team => [
      team.id, team.name, team.played, team.wins, team.draws, team.losses,
      team.goals_for, team.goals_against, team.goal_difference, team.points,
      team.form, team.trend, team.position
    ]);

    db.query(teamQuery, [teamValues], (err) => {
      if (err) {
        console.error('Error inserting teams:', err);
      } else {
        console.log('✅ Teams inserted successfully');
      }
      checkCompletion();
    });

    // Insert fixtures
    const fixtureQuery = `
      INSERT INTO fixtures (
        id, home_team, away_team, league, date, time, venue, status, round,
        created_by, submitted_date
      ) VALUES ?
    `;

    const fixtureValues = mockFixtures.map(fixture => [
      fixture.id, fixture.home_team, fixture.away_team, fixture.league,
      fixture.date, fixture.time, fixture.venue, fixture.status, fixture.round,
      fixture.created_by, fixture.submitted_date
    ]);

    db.query(fixtureQuery, [fixtureValues], (err) => {
      if (err) {
        console.error('Error inserting fixtures:', err);
      } else {
        console.log('✅ Fixtures inserted successfully');
      }
      checkCompletion();
    });
  }

  let insertionsCompleted = 0;
  function checkCompletion() {
    insertionsCompleted++;
    if (insertionsCompleted === 3) {
      console.log('🎉 Database seeding completed!');
      db.end();
      process.exit(0);
    }
  }
});
