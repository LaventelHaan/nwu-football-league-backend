// JavaScript version of mock data for backend use
const mockFixtures = [
  { id: 1, homeTeam: "NWU Eagles", awayTeam: "Wits Wolves", league: "Premier League", date: "2024-01-15", time: "15:00", venue: "NWU Stadium", status: "PENDING", round: "Round 19", createdBy: "Admin", submittedDate: "2025-09-18" },
  { id: 2, homeTeam: "UCT Lions", awayTeam: "UP Tuks", league: "Premier League", date: "2024-01-15", time: "17:30", venue: "UCT Grounds", status: "upcoming", round: "Round 19", createdBy: "John", submittedDate: "2025-09-18" },
  { id: 3, homeTeam: "UJ Orange", awayTeam: "Stellenbosch FC", league: "Premier League", date: "2024-01-16", time: "14:00", venue: "UJ Stadium", status: "PENDING", round: "Round 19", createdBy: "Mary", submittedDate: "2025-09-17" },
  { id: 4, homeTeam: "Rhodes United", awayTeam: "UKZN Sharks", league: "Premier League", date: "2024-01-16", time: "16:30", venue: "Rhodes Park", status: "upcoming", round: "Round 19", createdBy: "Alex", submittedDate: "2025-09-16" },
];

const mockResults = [
  { id: 5, homeTeam: "NWU Eagles", awayTeam: "UCT Lions", league: "Premier League", date: "2024-01-12", time: "14:30", venue: "UCT Grounds", status: "final", homeScore: 5, awayScore: 2, round: "Round 18", attendance: 2500, highlights: ["Goal by J. Doe (15')", "Goal by M. Smith (30')"] },
  { id: 6, homeTeam: "Wits Wolves", awayTeam: "UP Tuks", league: "Premier League", date: "2024-01-12", time: "17:00", venue: "Wits Stadium", status: "final", homeScore: 3, awayScore: 3, round: "Round 18", attendance: 2200 },
];

const mockPlayers = [
  { id: 1, name: "John Doe", team: "NWU Eagles", position: "Forward", age: 22, nationality: "South Africa", goals: 18, assists: 7, appearances: 17, gamesPlayed: 17, yellowCards: 2, redCards: 0, joinDate: "2023-08-15", previousTeam: "Youth Academy", jerseyNumber: 9, height: 180, weight: 75, performance: 88, medicalNotes: "Minor ankle sprain, recovering well.", email: "john.doe@nwu.edu", phone: "+27 82 123 4567", emergencyContact: { name: "Jane Doe", phone: "+27 82 765 4321" }, status: "Active", rating: 88, matchesPlayed: 17, medicalStatus: "Fit", preferredFoot: "Right", league: "Varsity League", contractExpiry: "2026-06-30", previousClubs: ["Youth Academy", "NWU Juniors"], achievements: ["Top Scorer 2024", "Player of the Month"] },
  { id: 2, name: "Mike Smith", team: "Wits Wolves", position: "Midfielder", age: 21, nationality: "South Africa", goals: 15, assists: 12, appearances: 18, gamesPlayed: 18, yellowCards: 4, redCards: 1, joinDate: "2023-07-20", previousTeam: "Local Club FC", jerseyNumber: 8, height: 175, weight: 70, performance: 85, medicalNotes: "No current injuries.", email: "mike.smith@wits.ac.za", phone: "+27 83 234 5678", emergencyContact: { name: "Sarah Smith", phone: "+27 83 876 5432" }, status: "Injured", rating: 85, matchesPlayed: 18, medicalStatus: "Injured", preferredFoot: "Left", league: "Varsity League", contractExpiry: "2025-12-31", previousClubs: ["Local Club FC", "Wits Youth"], achievements: ["Best Midfielder 2024"] },
  // ...add more players as needed
];

const mockTeams = [
  { position: 1, id: 1, name: "NWU Eagles", played: 18, wins: 14, draws: 3, losses: 1, goalsFor: 42, goalsAgainst: 12, goalDifference: 30, points: 45, form: ["W","W","W","D","W"], trend: "up" },
  { position: 2, id: 2, name: "Wits Wolves", played: 18, wins: 13, draws: 3, losses: 2, goalsFor: 38, goalsAgainst: 15, goalDifference: 23, points: 42, form: ["W","L","W","W","D"], trend: "same" },
  { position: 3, id: 3, name: "UCT Lions", played: 18, wins: 12, draws: 2, losses: 4, goalsFor: 35, goalsAgainst: 20, goalDifference: 15, points: 38, form: ["W","W","L","W","W"], trend: "up" },
  { position: 4, id: 4, name: "UP Tuks", played: 18, wins: 10, draws: 4, losses: 4, goalsFor: 32, goalsAgainst: 22, goalDifference: 10, points: 34, form: ["D","W","L","D","W"], trend: "down" },
];

module.exports = {
  mockFixtures,
  mockResults,
  mockPlayers,
  mockTeams
};
