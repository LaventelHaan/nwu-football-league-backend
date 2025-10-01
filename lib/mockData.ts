// Centralized mock data for the NWU Sports League Manager
// This ensures consistency across all components and prevents data duplication

export interface MockCoachData {
  players: any[]
  matches: any[]
  announcements: any[]
  coaches: any[]
  leagueStandings: any[]
  fieldBookings: any[]
  playerRequests: any[]
  medicalRecords: any[]
  teamStats: any[]
}

export interface Team {
  id: number
  name: string
  played: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  form: string[]
  trend: "up" | "down" | "same"
  position: number
}


export interface BasePlayer {
  id: number
  name: string
  team: string
  position: "Forward" | "Midfielder" | "Defender" | "Goalkeeper"
  age: number
  nationality: string
  goals: number
  assists: number
  appearances: number
  gamesPlayed: number
  yellowCards: number
  redCards: number
  avatar?: string
  joinDate: string
  previousTeam: string
  cleanSheets?: number   // Only for goalkeepers
  saves?: number         // Only for goalkeepers
  jerseyNumber: number
  height: number         // in cm
  weight: number         // in kg
  performance: number    // performance rating (0-100)
  medicalNotes?: string
  email: string
  phone: string
  emergencyContact: {
    name: string
    phone: string
  }
}




export interface OutfieldPlayer extends BasePlayer {
  position: "Forward" | "Midfielder" | "Defender"
}

export interface Goalkeeper extends BasePlayer {
  position: "Goalkeeper"
  cleanSheets: number
  saves: number
}

// Union type for all players
export type Player = OutfieldPlayer | Goalkeeper

export interface Fixture {
  id: number;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  league: string;
  venue: string;

  // Status can now include PENDING for approval workflows
  status: "upcoming" | "live" | "final" | "PENDING"| "COMPLETED"|"APPROVED"| "REJECTED";

  round: string;
  homeScore?: number;
  awayScore?: number;
  attendance?: number;
  highlights?: string[];

  // New properties for approval tracking
  createdBy?: string;       // Who submitted the fixture
  submittedDate?: string;   // When it was submitted
}

// src/types.ts



export interface TeamRegistration {
  id: number
  name: string
  type: "team" | "league"
  league?: string
  coach?: string
  organizer?: string
  email: string
  phone: string
  players?: number
  maxPlayers?: number
  teams?: number
  maxTeams?: number
  foundedYear?: number
  homeVenue?: string
  season?: string
  startDate?: string
  endDate?: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  submittedDate: string
  description: string
  documents: string[]
  playerList?: Array<{ name: string; position: string; age: number }>
  coachCertification?: string
  applicationFee?: string
  paymentStatus?: string
  registrationFee?: string
  prizePool?: string
  rejectionReason?: string
}

// League Standings Data
export const mockStandings: Team[] = [
  { position: 1, id: 1, name: "NWU Eagles", played: 18, wins: 14, draws: 3, losses: 1, goalsFor: 42, goalsAgainst: 12, goalDifference: 30, points: 45, form: ["W", "W", "W", "D", "W"], trend: "up" },
  { position: 2, id: 2, name: "Wits Wolves", played: 18, wins: 13, draws: 3, losses: 2, goalsFor: 38, goalsAgainst: 15, goalDifference: 23, points: 42, form: ["W", "L", "W", "W", "D"], trend: "same" },
  { position: 3, id: 3, name: "UCT Lions", played: 18, wins: 12, draws: 2, losses: 4, goalsFor: 35, goalsAgainst: 20, goalDifference: 15, points: 38, form: ["W", "W", "L", "W", "W"], trend: "up" },
  { position: 4, id: 4, name: "UP Tuks", played: 18, wins: 10, draws: 4, losses: 4, goalsFor: 32, goalsAgainst: 22, goalDifference: 10, points: 34, form: ["D", "W", "L", "D", "W"], trend: "down" },
  { position: 5, id: 5, name: "UJ Orange", played: 18, wins: 9, draws: 5, losses: 4, goalsFor: 28, goalsAgainst: 25, goalDifference: 3, points: 32, form: ["L", "D", "W", "D", "L"], trend: "down" },
  { position: 6, id: 6, name: "Stellenbosch FC", played: 18, wins: 8, draws: 3, losses: 7, goalsFor: 26, goalsAgainst: 28, goalDifference: -2, points: 27, form: ["L", "W", "L", "W", "L"], trend: "same" },
  { position: 7, id: 7, name: "Rhodes United", played: 18, wins: 6, draws: 6, losses: 6, goalsFor: 24, goalsAgainst: 26, goalDifference: -2, points: 24, form: ["D", "L", "D", "W", "D"], trend: "up" },
  { position: 8, id: 8, name: "UKZN Sharks", played: 18, wins: 4, draws: 4, losses: 10, goalsFor: 18, goalsAgainst: 35, goalDifference: -17, points: 16, form: ["L", "L", "D", "L", "W"], trend: "down" },
]

/// Centralized mock data for the NWU Sports League Manager

export const mockPlayers: Player[] = [
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
    gamesPlayed: 17,
    yellowCards: 2,
    redCards: 0,
    avatar: "/football-player-portrait.png",
    joinDate: "2023-08-15",
    previousTeam: "Youth Academy",
    jerseyNumber: 9,
    height: 180,
    weight: 75,
    performance: 88,
    medicalNotes: "Minor ankle sprain, recovering well.",
    email: "john.doe@nwu.edu",
    phone: "+27 82 123 4567",
    emergencyContact: { name: "Jane Doe", phone: "+27 82 765 4321" }
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
    gamesPlayed: 18,
    yellowCards: 4,
    redCards: 1,
    avatar: "/football-midfielder-portrait.png",
    joinDate: "2023-07-20",
    previousTeam: "Local Club FC",
    jerseyNumber: 8,
    height: 175,
    weight: 70,
    performance: 85,
    medicalNotes: "No current injuries.",
    email: "mike.smith@wits.ac.za",
    phone: "+27 83 234 5678",
    emergencyContact: { name: "Sarah Smith", phone: "+27 83 876 5432" }
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
    gamesPlayed: 16,
    yellowCards: 1,
    redCards: 0,
    avatar: "/football-striker-portrait.png",
    joinDate: "2023-09-01",
    previousTeam: "Lagos United",
    jerseyNumber: 11,
    height: 182,
    weight: 78,
    performance: 82,
    medicalNotes: "Recovered from knee surgery last season.",
    email: "david.johnson@uct.ac.za",
    phone: "+27 84 345 6789",
    emergencyContact: { name: "Mary Johnson", phone: "+27 84 987 6543" }
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
    gamesPlayed: 18,
    yellowCards: 6,
    redCards: 0,
    avatar: "/football-defender-portrait.png",
    joinDate: "2023-06-10",
    previousTeam: "Pretoria FC",
    jerseyNumber: 5,
    height: 185,
    weight: 80,
    performance: 80,
    medicalNotes: "Mild back pain, under physiotherapy.",
    email: "alex.wilson@up.ac.za",
    phone: "+27 85 456 7890",
    emergencyContact: { name: "Laura Wilson", phone: "+27 85 098 7654" }
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
    gamesPlayed: 18,
    yellowCards: 1,
    redCards: 0,
    cleanSheets: 8,
    saves: 67,
    avatar: "/football-goalkeeper-portrait.png",
    joinDate: "2023-08-01",
    previousTeam: "Harare City",
    jerseyNumber: 1,
    height: 190,
    weight: 82,
    performance: 90,
    medicalNotes: "No injuries reported.",
    email: "peter.brown@uj.ac.za",
    phone: "+27 86 567 8901",
    emergencyContact: { name: "Paul Brown", phone: "+27 86 109 8765" }
  },
  {
    id: 6,
    name: "Kevin Davis",
    team: "Stellenbosch FC",
    position: "Midfielder",
    age: 20,
    nationality: "South Africa",
    goals: 8,
    assists: 15,
    appearances: 17,
    gamesPlayed: 17,
    yellowCards: 3,
    redCards: 0,
    avatar: "/football-young-midfielder-portrait.png",
    joinDate: "2023-07-15",
    previousTeam: "Cape Town Youth",
    jerseyNumber: 6,
    height: 178,
    weight: 72,
    performance: 84,
    medicalNotes: "Recovering from minor hamstring strain.",
    email: "kevin.davis@stellenbosch.ac.za",
    phone: "+27 87 678 9012",
    emergencyContact: { name: "Kim Davis", phone: "+27 87 210 9876" }
  },
  {
    id: 7,
    name: "Samuel Green",
    team: "NWU Eagles",
    position: "Defender",
    age: 22,
    nationality: "South Africa",
    goals: 2,
    assists: 3,
    appearances: 16,
    gamesPlayed: 16,
    yellowCards: 3,
    redCards: 0,
    avatar: "/football-defender-portrait2.png",
    joinDate: "2023-08-20",
    previousTeam: "Youth Academy",
    jerseyNumber: 4,
    height: 183,
    weight: 77,
    performance: 81,
    medicalNotes: "No current injuries.",
    email: "samuel.green@nwu.edu",
    phone: "+27 82 234 5678",
    emergencyContact: { name: "Lisa Green", phone: "+27 82 876 5432" }
  },
  {
    id: 8,
    name: "Nathan White",
    team: "Wits Wolves",
    position: "Forward",
    age: 23,
    nationality: "South Africa",
    goals: 14,
    assists: 9,
    appearances: 17,
    gamesPlayed: 17,
    yellowCards: 2,
    redCards: 0,
    avatar: "/football-striker-portrait2.png",
    joinDate: "2023-07-25",
    previousTeam: "Local Club FC",
    jerseyNumber: 10,
    height: 179,
    weight: 74,
    performance: 86,
    medicalNotes: "Recovering from ankle strain.",
    email: "nathan.white@wits.ac.za",
    phone: "+27 83 345 6789",
    emergencyContact: { name: "Clara White", phone: "+27 83 987 6543" }
  },
  {
    id: 9,
    name: "Ryan King",
    team: "UCT Lions",
    position: "Midfielder",
    age: 21,
    nationality: "South Africa",
    goals: 9,
    assists: 11,
    appearances: 18,
    gamesPlayed: 18,
    yellowCards: 2,
    redCards: 0,
    avatar: "/football-midfielder-portrait2.png",
    joinDate: "2023-09-05",
    previousTeam: "Lagos United",
    jerseyNumber: 7,
    height: 176,
    weight: 71,
    performance: 83,
    medicalNotes: "No injuries.",
    email: "ryan.king@uct.ac.za",
    phone: "+27 84 456 7890",
    emergencyContact: { name: "Fiona King", phone: "+27 84 098 7654" }
  },
  {
    id: 10,
    name: "Liam Scott",
    team: "UP Tuks",
    position: "Defender",
    age: 24,
    nationality: "South Africa",
    goals: 1,
    assists: 6,
    appearances: 18,
    gamesPlayed: 18,
    yellowCards: 5,
    redCards: 0,
    avatar: "/football-defender-portrait3.png",
    joinDate: "2023-06-15",
    previousTeam: "Pretoria FC",
    jerseyNumber: 3,
    height: 184,
    weight: 79,
    performance: 80,
    medicalNotes: "Recovering from minor knee surgery.",
    email: "liam.scott@up.ac.za",
    phone: "+27 85 567 8901",
    emergencyContact: { name: "Ella Scott", phone: "+27 85 109 8765" }
  },
  {
    id: 11,
    name: "Oliver Brown",
    team: "UJ Orange",
    position: "Goalkeeper",
    age: 26,
    nationality: "Zimbabwe",
    goals: 0,
    assists: 1,
    appearances: 18,
    gamesPlayed: 18,
    yellowCards: 1,
    redCards: 0,
    cleanSheets: 10,
    saves: 70,
    avatar: "/football-goalkeeper-portrait2.png",
    joinDate: "2023-08-05",
    previousTeam: "Harare City",
    jerseyNumber: 1,
    height: 191,
    weight: 83,
    performance: 91,
    medicalNotes: "No injuries.",
    email: "oliver.brown@uj.ac.za",
    phone: "+27 86 678 9012",
    emergencyContact: { name: "Paul Brown", phone: "+27 86 210 9876" }
  },
  {
    id: 12,
    name: "Ethan Lewis",
    team: "Stellenbosch FC",
    position: "Midfielder",
    age: 22,
    nationality: "South Africa",
    goals: 7,
    assists: 13,
    appearances: 17,
    gamesPlayed: 17,
    yellowCards: 2,
    redCards: 0,
    avatar: "/football-midfielder-portrait3.png",
    joinDate: "2023-07-18",
    previousTeam: "Cape Town Youth",
    jerseyNumber: 12,
    height: 177,
    weight: 73,
    performance: 85,
    medicalNotes: "Minor groin strain, recovering.",
    email: "ethan.lewis@stellenbosch.ac.za",
    phone: "+27 87 789 0123",
    emergencyContact: { name: "Emma Lewis", phone: "+27 87 321 0987" }
  },
  {
    id: 13,
    name: "Aiden Clark",
    team: "NWU Eagles",
    position: "Forward",
    age: 23,
    nationality: "South Africa",
    goals: 16,
    assists: 6,
    appearances: 17,
    gamesPlayed: 17,
    yellowCards: 1,
    redCards: 0,
    avatar: "/football-player-portrait2.png",
    joinDate: "2023-08-22",
    previousTeam: "Youth Academy",
    jerseyNumber: 14,
    height: 181,
    weight: 76,
    performance: 87,
    medicalNotes: "No injuries.",
    email: "aiden.clark@nwu.edu",
    phone: "+27 82 345 6789",
    emergencyContact: { name: "Mia Clark", phone: "+27 82 987 6543" }
  },
  {
    id: 14,
    name: "Noah Adams",
    team: "Wits Wolves",
    position: "Midfielder",
    age: 21,
    nationality: "South Africa",
    goals: 13,
    assists: 10,
    appearances: 18,
    gamesPlayed: 18,
    yellowCards: 2,
    redCards: 0,
    avatar: "/football-midfielder-portrait4.png",
    joinDate: "2023-07-28",
    previousTeam: "Local Club FC",
    jerseyNumber: 15,
    height: 175,
    weight: 70,
    performance: 84,
    medicalNotes: "No injuries.",
    email: "noah.adams@wits.ac.za",
    phone: "+27 83 456 7890",
    emergencyContact: { name: "Lily Adams", phone: "+27 83 098 7654" }
  },
  {
    id: 15,
    name: "Lucas Taylor",
    team: "UCT Lions",
    position: "Forward",
    age: 22,
    nationality: "Nigeria",
    goals: 14,
    assists: 7,
    appearances: 16,
    gamesPlayed: 16,
    yellowCards: 1,
    redCards: 0,
    avatar: "/football-striker-portrait3.png",
    joinDate: "2023-09-08",
    previousTeam: "Lagos United",
    jerseyNumber: 13,
    height: 183,
    weight: 77,
    performance: 86,
    medicalNotes: "No injuries.",
    email: "lucas.taylor@uct.ac.za",
    phone: "+27 84 567 8901",
    emergencyContact: { name: "Sophia Taylor", phone: "+27 84 109 8765" }
  },
  {
    id: 16,
    name: "Mason Hall",
    team: "UP Tuks",
    position: "Defender",
    age: 24,
    nationality: "South Africa",
    goals: 2,
    assists: 5,
    appearances: 18,
    gamesPlayed: 18,
    yellowCards: 4,
    redCards: 0,
    avatar: "/football-defender-portrait4.png",
    joinDate: "2023-06-20",
    previousTeam: "Pretoria FC",
    jerseyNumber: 2,
    height: 186,
    weight: 81,
    performance: 82,
    medicalNotes: "Recovering from minor knee strain.",
    email: "mason.hall@up.ac.za",
    phone: "+27 85 678 9012",
    emergencyContact: { name: "Olivia Hall", phone: "+27 85 210 9876" }
  }
]





// Teams
export const mockTeams: Team[] = [
  { position: 1, id: 1, name: "NWU Eagles", played: 18, wins: 14, draws: 3, losses: 1, goalsFor: 42, goalsAgainst: 12, goalDifference: 30, points: 45, form: ["W","W","W","D","W"], trend: "up" },
  { position: 2, id: 2, name: "Wits Wolves", played: 18, wins: 13, draws: 3, losses: 2, goalsFor: 38, goalsAgainst: 15, goalDifference: 23, points: 42, form: ["W","L","W","W","D"], trend: "same" },
  { position: 3, id: 3, name: "UCT Lions", played: 18, wins: 12, draws: 2, losses: 4, goalsFor: 35, goalsAgainst: 20, goalDifference: 15, points: 38, form: ["W","W","L","W","W"], trend: "up" },
  { position: 4, id: 4, name: "UP Tuks", played: 18, wins: 10, draws: 4, losses: 4, goalsFor: 32, goalsAgainst: 22, goalDifference: 10, points: 34, form: ["D","W","L","D","W"], trend: "down" },
  { position: 5, id: 5, name: "UJ Orange", played: 18, wins: 9, draws: 5, losses: 4, goalsFor: 28, goalsAgainst: 25, goalDifference: 3, points: 32, form: ["L","D","W","D","L"], trend: "down" },
  { position: 6, id: 6, name: "Stellenbosch FC", played: 18, wins: 8, draws: 3, losses: 7, goalsFor: 26, goalsAgainst: 28, goalDifference: -2, points: 27, form: ["L","W","L","W","L"], trend: "same" },
  { position: 7, id: 7, name: "Rhodes United", played: 18, wins: 6, draws: 6, losses: 6, goalsFor: 24, goalsAgainst: 26, goalDifference: -2, points: 24, form: ["D","L","D","W","D"], trend: "up" },
  { position: 8, id: 8, name: "UKZN Sharks", played: 18, wins: 4, draws: 4, losses: 10, goalsFor: 18, goalsAgainst: 35, goalDifference: -17, points: 16, form: ["L","L","D","L","W"], trend: "down" },
];

// Fixtures
export const mockFixtures: Fixture[] = [
  { id: 1, homeTeam: "NWU Eagles", awayTeam: "Wits Wolves", league: "Premier League", date: "2024-01-15", time: "15:00", venue: "NWU Stadium", status: "PENDING", round: "Round 19", createdBy: "Admin", submittedDate: "2025-09-18" },
  { id: 2, homeTeam: "UCT Lions", awayTeam: "UP Tuks", league: "Premier League", date: "2024-01-15", time: "17:30", venue: "UCT Grounds", status: "upcoming", round: "Round 19", createdBy: "John", submittedDate: "2025-09-18" },
  { id: 3, homeTeam: "UJ Orange", awayTeam: "Stellenbosch FC", league: "Premier League", date: "2024-01-16", time: "14:00", venue: "UJ Stadium", status: "PENDING", round: "Round 19", createdBy: "Mary", submittedDate: "2025-09-17" },
  { id: 4, homeTeam: "Rhodes United", awayTeam: "UKZN Sharks", league: "Premier League", date: "2024-01-16", time: "16:30", venue: "Rhodes Park", status: "upcoming", round: "Round 19", createdBy: "Alex", submittedDate: "2025-09-16" },
];



// Match Results Data
export const mockResults: Fixture[] = [
  {
    id: 5,
    homeTeam: "NWU Eagles",
    awayTeam: "UCT Lions",
    league: "Premier League",
    date: "2024-01-12",
    time: "14:30",
    venue: "UCT Grounds",
    status: "final",
    homeScore: 5,
    awayScore: 2,
    round: "Round 18",
    attendance: 2500,
    highlights: ["Goal by J. Doe (15')", "Goal by M. Smith (30')"],
  },
  {
    id: 6,
    homeTeam: "Wits Wolves",
    awayTeam: "UP Tuks",
    league: "Premier League",
    date: "2024-01-12",
    time: "17:00",
    venue: "Wits Stadium",
    status: "final",
    homeScore: 3,
    awayScore: 3,
    round: "Round 18",
    attendance: 2200,
  },
];


// Team Registrations
export const mockTeamRegistrations: TeamRegistration[] = [
  {
    id: 1,
    name: "NWU Eagles",
    type: "team",
    league: "Premier League",
    coach: "John Smith",
    email: "coach@nwu.ac.za",
    phone: "+27 82 123 4567",
    players: 22,
    foundedYear: 2020,
    homeVenue: "NWU Stadium",
    status: "APPROVED",
    submittedDate: "2024-03-10",
    description: "Strong university team competing at the top level.",
    documents: ["Registration Form", "Player List", "Insurance Certificate"]
  },
  {
    id: 2,
    name: "Wits Wolves",
    type: "team",
    league: "Premier League",
    coach: "Michael Green",
    email: "coach@witswolves.com",
    phone: "+27 83 123 4567",
    players: 21,
    foundedYear: 2019,
    homeVenue: "Wits Stadium",
    status: "APPROVED",
    submittedDate: "2024-03-11",
    description: "Known for their quick attacking style.",
    documents: ["Registration Form", "Player List", "Medical Certificates"]
  }
]

export const mockTopScorers = mockPlayers
  .sort((a, b) => b.goals - a.goals) // sort descending by goals
  .slice(0, 5); // top 5 scorers


// Home Page Data
export const mockHomeData = {
  allFixtures: [...mockFixtures, ...mockResults],
  highlights: [
    {
      id: 1,
      title: "NWU Eagles Maintain Perfect Home Record",
      description: "The Eagles secured a thrilling 3-2 victory against UCT Lions in front of 2,500 fans.",
      image: "/football-match-celebration.png",
      date: "2024-01-12",
      category: "Match Report",
    },
    {
      id: 2,
      title: "John Doe Reaches 18 Goals This Season",
      description: "The NWU Eagles striker continues his impressive goal-scoring form.",
      image: "/football-goal-celebration.png",
      date: "2024-01-12",
      category: "Player News",
    },
  ],
  news: [
    {
      id: 1,
      title: "League Championship Race Heats Up",
      excerpt: "With only 5 matches remaining, the top 3 teams are separated by just 7 points.",
      date: "2024-01-13",
      author: "Sports Desk",
    },
    {
      id: 2,
      title: "New Player Safety Protocols Introduced",
      excerpt: "Enhanced medical support and concussion protocols now in effect across all matches.",
      date: "2024-01-10",
      author: "League Officials",
    },
  ],
}
export const mockNews = mockHomeData.news;
// Team of the Week Data
// Team of the Week Data
export const mockTeamOfTheWeek = {
  week: "Week 18",
  formation: "4-3-3",
  players: [
    { id: 1, name: "John Smith", position: "GK", team: "NWU Eagles" },
    { id: 2, name: "Mike Johnson", position: "LB", team: "Wits Wolves" },
    { id: 3, name: "David Brown", position: "LCB", team: "UCT Lions" },
    { id: 4, name: "Chris Wilson", position: "RCB", team: "NWU Eagles" },
    { id: 5, name: "Alex Davis", position: "RB", team: "UJ Orange" },
    { id: 6, name: "Tom Miller", position: "LCM", team: "Stellenbosch FC" },
    { id: 7, name: "James Garcia", position: "CM", team: "NWU Eagles" },
    { id: 8, name: "Robert Martinez", position: "RCM", team: "Wits Wolves" },
    { id: 9, name: "Kevin Anderson", position: "LW", team: "UCT Lions" },
    { id: 10, name: "Mark Taylor", position: "ST", team: "NWU Eagles" },
    { id: 11, name: "Paul Thomas", position: "RW", team: "UJ Orange" },
  ],
coach: { 
    name: "Sarah Mitchell",
    team: "NWU Eagles", 
    reason: "Led team to crucial 3-2 victory with tactical masterclass", },
}
// Mock scouting data aligned with existing players and teams
export const mockScoutingReports = [
  {
    id: 1,
    playerName: "John Doe",
    age: 22,
    position: "Forward",
    currentTeam: "NWU Eagles",
    league: "Premier League",
    scoutedBy: "John Smith",
    scoutDate: "2024-03-15",
    matchVenue: "NWU Stadium",
    overallRating: 9.0,
    potential: "Very High",
    status: "Priority Target",
    physicalAttributes: {
      pace: 9,
      strength: 7,
      stamina: 8,
      agility: 9,
      height: "1.80m",
      weight: "75kg",
    },
    technicalSkills: {
      passing: 8,
      shooting: 9,
      dribbling: 9,
      crossing: 7,
      finishing: 9,
      firstTouch: 8,
    },
    mentalAttributes: {
      vision: 8,
      decisionMaking: 9,
      workRate: 9,
      leadership: 7,
      composure: 8,
      teamwork: 9,
    },
    strengths: ["Clinical finisher", "Great pace", "Excellent dribbling", "Strong in attack"],
    weaknesses: ["Occasionally loses focus", "Can be selfish with the ball"],
    notes: "Top striker for NWU Eagles, consistent goal scorer, high potential for professional leagues.",
    recommendedAction: "Invite for trial",
    estimatedValue: "R250,000",
    contractStatus: "Available",
    videos: ["Match highlights vs UCT Lions", "Skills compilation"],
  },
  {
    id: 2,
    playerName: "Mike Smith",
    age: 21,
    position: "Midfielder",
    currentTeam: "Wits Wolves",
    league: "Premier League",
    scoutedBy: "Emma Davis",
    scoutDate: "2024-03-12",
    matchVenue: "Wits Stadium",
    overallRating: 8.7,
    potential: "High",
    status: "Recommended",
    physicalAttributes: {
      pace: 8,
      strength: 7,
      stamina: 9,
      agility: 8,
      height: "1.75m",
      weight: "70kg",
    },
    technicalSkills: {
      passing: 9,
      shooting: 7,
      dribbling: 8,
      crossing: 7,
      finishing: 7,
      firstTouch: 8,
    },
    mentalAttributes: {
      vision: 9,
      decisionMaking: 8,
      workRate: 9,
      leadership: 6,
      composure: 8,
      teamwork: 9,
    },
    strengths: ["Excellent passing range", "High work rate", "Strong vision", "Creative playmaker"],
    weaknesses: ["Needs to improve finishing", "Occasional defensive lapses"],
    notes: "Central midfielder with excellent creativity and passing. Can control the tempo of the game.",
    recommendedAction: "Make offer",
    estimatedValue: "R220,000",
    contractStatus: "Under contract until 2025",
    videos: ["Match footage vs UP Tuks", "Passing highlights"],
  },
  {
    id: 3,
    playerName: "David Johnson",
    age: 23,
    position: "Forward",
    currentTeam: "UCT Lions",
    league: "Premier League",
    scoutedBy: "Mike Wilson",
    scoutDate: "2024-03-10",
    matchVenue: "UCT Grounds",
    overallRating: 8.2,
    potential: "High",
    status: "Under Review",
    physicalAttributes: {
      pace: 8,
      strength: 6,
      stamina: 8,
      agility: 8,
      height: "1.78m",
      weight: "72kg",
    },
    technicalSkills: {
      passing: 7,
      shooting: 8,
      dribbling: 8,
      crossing: 6,
      finishing: 8,
      firstTouch: 8,
    },
    mentalAttributes: {
      vision: 8,
      decisionMaking: 8,
      workRate: 8,
      leadership: 7,
      composure: 8,
      teamwork: 8,
    },
    strengths: ["Good finisher", "Agile forward", "Works hard off the ball", "Smart positioning"],
    weaknesses: ["Needs more consistency", "Can be isolated in matches"],
    notes: "Promising forward who can adapt to multiple attacking roles. Shows solid scoring ability.",
    recommendedAction: "Continue monitoring",
    estimatedValue: "R180,000",
    contractStatus: "Under contract until 2025",
    videos: ["Goals vs UP Tuks", "Dribbling skills highlights"],
  },
  {
    id: 4,
    playerName: "Alex Wilson",
    age: 24,
    position: "Defender",
    currentTeam: "UP Tuks",
    league: "Premier League",
    scoutedBy: "Sarah Brown",
    scoutDate: "2024-03-11",
    matchVenue: "Tuks Stadium",
    overallRating: 8.0,
    potential: "Medium",
    status: "Recommended",
    physicalAttributes: {
      pace: 6,
      strength: 9,
      stamina: 8,
      agility: 7,
      height: "1.85m",
      weight: "80kg",
    },
    technicalSkills: {
      passing: 7,
      shooting: 5,
      dribbling: 6,
      crossing: 6,
      finishing: 4,
      firstTouch: 7,
    },
    mentalAttributes: {
      vision: 7,
      decisionMaking: 8,
      workRate: 8,
      leadership: 8,
      composure: 8,
      teamwork: 9,
    },
    strengths: ["Strong tackling", "Good leadership", "Reliable defender", "Good aerial ability"],
    weaknesses: ["Limited pace", "Can be beaten by fast attackers"],
    notes: "Solid center-back, dependable in defense and good at organizing the backline.",
    recommendedAction: "Invite for trial",
    estimatedValue: "R150,000",
    contractStatus: "Under contract until 2025",
    videos: ["Defensive highlights vs NWU Eagles"],
  },
  {
    id: 5,
    playerName: "Peter Brown",
    age: 25,
    position: "Goalkeeper",
    currentTeam: "UJ Orange",
    league: "Premier League",
    scoutedBy: "Emma Davis",
    scoutDate: "2024-03-13",
    matchVenue: "UJ Stadium",
    overallRating: 8.5,
    potential: "Medium",
    status: "Recommended",
    physicalAttributes: {
      pace: 5,
      strength: 8,
      stamina: 7,
      agility: 8,
      height: "1.90m",
      weight: "82kg",
    },
    technicalSkills: {
      passing: 6,
      shooting: 3,
      dribbling: 5,
      crossing: 4,
      finishing: 2,
      firstTouch: 6,
    },
    mentalAttributes: {
      vision: 7,
      decisionMaking: 9,
      workRate: 8,
      leadership: 9,
      composure: 9,
      teamwork: 8,
    },
    strengths: ["Shot stopping", "Leadership", "Aerial ability", "Calm under pressure"],
    weaknesses: ["Distribution can improve", "Limited pace off the line"],
    notes: "Reliable goalkeeper with strong leadership skills. Key asset for UJ Orange.",
    recommendedAction: "Make offer",
    estimatedValue: "R200,000",
    contractStatus: "Under contract until 2025",
    videos: ["Clean sheets highlights", "Key saves compilation"],
  },
  {
    id: 6,
    playerName: "Kevin Davis",
    age: 20,
    position: "Midfielder",
    currentTeam: "Stellenbosch FC",
    league: "Premier League",
    scoutedBy: "Mike Wilson",
    scoutDate: "2024-03-14",
    matchVenue: "Stellenbosch Stadium",
    overallRating: 8.3,
    potential: "High",
    status: "Recommended",
    physicalAttributes: {
      pace: 8,
      strength: 7,
      stamina: 9,
      agility: 8,
      height: "1.77m",
      weight: "73kg",
    },
    technicalSkills: {
      passing: 9,
      shooting: 7,
      dribbling: 8,
      crossing: 7,
      finishing: 7,
      firstTouch: 8,
    },
    mentalAttributes: {
      vision: 9,
      decisionMaking: 8,
      workRate: 9,
      leadership: 6,
      composure: 8,
      teamwork: 9,
    },
    strengths: ["Excellent passing", "High work rate", "Vision and creativity", "Agile midfielder"],
    weaknesses: ["Needs to improve shooting consistency"],
    notes: "Creative midfielder, strong in attack and build-up play. High potential for development.",
    recommendedAction: "Invite for trial",
    estimatedValue: "R180,000",
    contractStatus: "Available",
    videos: ["Match highlights vs Rhodes United", "Passing and assists compilation"],
  },
]

export const mockWatchlist = [
{
id: 1,
playerName: "Alex Rodriguez",
age: 20,
position: "Goalkeeper",
currentTeam: "Coastal FC",
league: "Third Division",
addedBy: "Scout Team",
addedDate: "2024-03-01",
priority: "High",
nextScoutingDate: "2024-03-25",
notes: "Promising young keeper with good reflexes",
},
{
id: 2,
playerName: "Lisa Chen",
age: 18,
position: "Midfielder",
currentTeam: "University Women",
league: "University League",
addedBy: "Emma Davis",
addedDate: "2024-02-28",
priority: "Medium",
nextScoutingDate: "2024-03-30",
notes: "Technical midfielder with good passing range",
},
]

// mockData.ts
export interface FAQ {
  id: number
  question: string
  answer?: string
  category?: string
  tags?: string[]
  status: "Draft" | "Under Review" | "Published" | "pending" | "answered"
  createdBy?: string
  createdDate: string
  lastUpdated?: string
  views?: number
  helpful?: number
  notHelpful?: number
}

// Existing admin FAQs
export const mockFAQs: FAQ[] = [
  {
    id: 1,
    question: "How do I reset my password?",
    answer: "You can reset your password from the profile settings page.",
    status: "Published",
    category: "Account",
    tags: ["account", "password"],
    createdBy: "Admin User",
    createdDate: "2025-09-01",
    lastUpdated: "2025-09-01",
    views: 25,
    helpful: 10,
    notHelpful: 2,
  },
  // ... other existing FAQs
]

// Array for user-submitted questions (optional, or push to mockFAQs directly)
export const userSubmittedFAQs: FAQ[] = []

export const mockCategories = [
  { name: "Team Registration", count: 8, color: "bg-blue-100 text-blue-800 border-blue-200" },
  { name: "League Rules", count: 12, color: "bg-green-100 text-green-800 border-green-200" },
  { name: "Fixtures", count: 6, color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { name: "Player Safety", count: 4, color: "bg-red-100 text-red-800 border-red-200" },
  { name: "Appeals", count: 3, color: "bg-purple-100 text-purple-800 border-purple-200" },
  { name: "Payments", count: 5, color: "bg-orange-100 text-orange-800 border-orange-200" },
]

export const mockTeamStats: TeamStats = {
  totalPlayers: mockPlayers.length,
  averageAge: Math.round(mockPlayers.reduce((sum, p) => sum + p.age, 0) / mockPlayers.length),
  totalGoals: mockPlayers.reduce((sum, p) => sum + p.goals, 0),
  totalAssists: mockPlayers.reduce((sum, p) => sum + p.assists, 0),
  winRate: 65, // percentage
  disciplinaryRecord: {
    yellowCards: mockPlayers.reduce((sum, p) => sum + p.yellowCards, 0),
    redCards: mockPlayers.reduce((sum, p) => sum + p.redCards, 0),
  },
}

export const mockAnnouncements: Announcement[] = [
  {
    id: "1",
    title: "Training Schedule Update",
    message: "Training has been moved to 6:00 AM tomorrow due to field maintenance.",
    date: "2025-01-20",
    priority: "high",
    recipients: ["all"],
  },
  {
    id: "2",
    title: "Team Meeting",
    message: "Mandatory team meeting this Friday at 4:00 PM in the conference room.",
    date: "2025-01-19",
    priority: "medium",
    recipients: ["all"],
  },
  {
    id: "3",
    title: "Medical Check-ups",
    message: "Annual medical check-ups scheduled for next week. Please see the schedule posted on the board.",
    date: "2025-01-18",
    priority: "low",
    recipients: ["all"],
  },
]

export const mockLeagueStandings: LeagueStanding[] = [
  {
    position: 1,
    team: "University of Cape Town",
    played: 16,
    won: 12,
    drawn: 3,
    lost: 1,
    goalsFor: 35,
    goalsAgainst: 12,
    goalDifference: 23,
    points: 39,
  },
  {
    position: 2,
    team: "NWU Eagles",
    played: 16,
    won: 11,
    drawn: 2,
    lost: 3,
    goalsFor: 32,
    goalsAgainst: 18,
    goalDifference: 14,
    points: 35,
  },
  {
    position: 3,
    team: "Wits University",
    played: 16,
    won: 9,
    drawn: 4,
    lost: 3,
    goalsFor: 28,
    goalsAgainst: 20,
    goalDifference: 8,
    points: 31,
  },
  {
    position: 4,
    team: "Stellenbosch University",
    played: 16,
    won: 8,
    drawn: 3,
    lost: 5,
    goalsFor: 25,
    goalsAgainst: 22,
    goalDifference: 3,
    points: 27,
  },
  {
    position: 5,
    team: "University of Pretoria",
    played: 16,
    won: 6,
    drawn: 5,
    lost: 5,
    goalsFor: 22,
    goalsAgainst: 25,
    goalDifference: -3,
    points: 23,
  },
]

export const mockFieldBookings: FieldBooking[] = [
  {
    id: "1",
    date: "2025-01-22",
    time: "06:00",
    duration: 2,
    field: "Main Field",
    purpose: "Morning Training",
    status: "confirmed",
    notes: "Focus on set pieces",
  },
  {
    id: "2",
    date: "2025-01-24",
    time: "16:00",
    duration: 1.5,
    field: "Training Ground A",
    purpose: "Tactical Session",
    status: "pending",
  },
  {
    id: "3",
    date: "2025-01-26",
    time: "08:00",
    duration: 2,
    field: "Main Field",
    purpose: "Match Preparation",
    status: "confirmed",
  },
]

export const mockPlayerRequests: PlayerRequest[] = [
  {
    id: "1",
    playerName: "Mandla Sibeko",
    position: "Midfielder",
    age: 20,
    email: "mandla.sibeko@student.nwu.ac.za",
    phone: "+27 82 555 1234",
    trialDate: "2025-01-18",
    status: "pending",
    skillLevel: "intermediate",
    notes: "Showed good ball control during trials",
  },
  {
    id: "2",
    playerName: "Kobus Steyn",
    position: "Forward",
    age: 19,
    email: "kobus.steyn@student.nwu.ac.za",
    phone: "+27 83 666 5678",
    trialDate: "2025-01-17",
    status: "pending",
    skillLevel: "advanced",
    notes: "Excellent finishing ability",
  },
  {
    id: "3",
    playerName: "Tebogo Molefe",
    position: "Defender",
    age: 21,
    email: "tebogo.molefe@student.nwu.ac.za",
    phone: "+27 84 777 9012",
    trialDate: "2025-01-16",
    status: "approved",
    skillLevel: "intermediate",
  },
]

export const mockMedicalRecords: MedicalRecord[] = [
  {
    id: 1,
    playerId: "1",
    playerName: mockPlayers.find(p => p.id === 1)?.name || "Unknown", // Added name
    date: "2025-01-15",
    type: "injury",
    description: "Minor ankle sprain during training",
    doctor: "Dr. Sarah Williams",
    status: "ongoing",
    followUpDate: "2025-01-25",
    restrictions: ["No running for 1 week", "Light training only"],
  },
  {
    id: 2,
    playerId: "2",
    playerName: mockPlayers.find(p => p.id === 2)?.name || "Unknown", // Added name
    date: "2025-01-10",
    type: "checkup",
    description: "Annual fitness assessment",
    doctor: "Dr. Michael Brown",
    status: "resolved",
  },
  {
    id: 3,
    playerId: "3",
    playerName: mockPlayers.find(p => p.id === 3)?.name || "Unknown", // Added name
    date: "2025-01-12",
    type: "treatment",
    description: "Physiotherapy for knee rehabilitation",
    doctor: "Dr. Lisa Johnson",
    status: "ongoing",
    followUpDate: "2025-01-22",
    medications: ["Anti-inflammatory gel"],
  },
]


export interface PlayerRequest {
  id: string
  playerName: string
  position: string
  age: number
  email: string
  phone: string
  trialDate: string
  status: "pending" | "approved" | "rejected"
  notes?: string
  skillLevel: "beginner" | "intermediate" | "advanced"
}
export interface MedicalRecord {
  id: number
  playerId: string
  playerName?: string   // ✅ Added
  date: string
  type: "checkup" | "injury" | "treatment" | "clearance"
  description: string
  doctor: string
  status: "active" | "resolved" | "ongoing"
  followUpDate?: string
  restrictions?: string[]
  medications?: string[]
}


export interface Match {
  id: string
  opponent: string
  date: string
  time: string
  venue: string
  isHome: boolean
  result?: {
    homeScore: number
    awayScore: number
    status: "won" | "lost" | "draw"
  }
}

export interface Announcement {
  id: string
  title: string
  message: string
  date: string
  priority: "low" | "medium" | "high"
  recipients: string[]
}

export interface Coach {
  id: number
  name: string
  email: string
  team: string
  phone: string
}

export interface TeamStats {
  totalPlayers: number
  averageAge: number
  totalGoals: number
  totalAssists: number
  winRate: number
  disciplinaryRecord: {
    yellowCards: number
    redCards: number
  }
}

export interface LeagueStanding {
  position: number
  team: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
}

export interface FieldBooking {
  id: string
  date: string
  time: string
  duration: number // in hours
  field: string
  purpose: string
  status: "pending" | "confirmed" | "cancelled"
  notes?: string
}
// mockData.ts

export const mockRecentMatches = [
  {
    id: "4",
    opponent: "University of Cape Town",
    date: "2025-01-15",
    time: "15:00",
    venue: "UCT Stadium",
    isHome: false,
    result: {
      homeScore: 1,
      awayScore: 2,
      status: "won",
    },
  },
  {
    id: "5",
    opponent: "Rhodes University",
    date: "2025-01-08",
    time: "14:30",
    venue: "NWU Sports Complex",
    isHome: true,
    result: {
      homeScore: 3,
      awayScore: 1,
      status: "won",
    },
  },
  {
    id: "6",
    opponent: "University of Johannesburg",
    date: "2025-01-01",
    time: "16:00",
    venue: "UJ Stadium",
    isHome: false,
    result: {
      homeScore: 2,
      awayScore: 2,
      status: "draw",
    },
  },
  {
    id: "7",
    opponent: "Free State University",
    date: "2024-12-18",
    time: "15:30",
    venue: "NWU Sports Complex",
    isHome: true,
    result: {
      homeScore: 1,
      awayScore: 3,
      status: "lost",
    },
  },
  {
    id: "8",
    opponent: "Nelson Mandela University",
    date: "2024-12-11",
    time: "14:00",
    venue: "NMU Stadium",
    isHome: false,
    result: {
      homeScore: 0,
      awayScore: 1,
      status: "won",
    },
  },
]

export const mockUpcomingMatches: Match[] = [
  {
    id: "1",
    opponent: "University of Pretoria",
    date: "2025-01-25",
    time: "15:00",
    venue: "NWU Sports Complex",
    isHome: true,
  },
  {
    id: "2",
    opponent: "Wits University",
    date: "2025-02-01",
    time: "14:00",
    venue: "Wits Stadium",
    isHome: false,
  },
  {
    id: "3",
    opponent: "Stellenbosch University",
    date: "2025-02-08",
    time: "16:00",
    venue: "NWU Sports Complex",
    isHome: true,
  },
]
export const mockCoach: Coach = {
  id: 1,
  name: "Coach Mike Johnson",
  email: "mike.johnson@nwu.ac.za",
  team: "NWU Eagles",
  phone: "+27 18 299 1234",
}


