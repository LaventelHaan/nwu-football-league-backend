"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Trophy, Calendar, MapPin, Award, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

// Mock detailed player data
const getPlayerById = (id: string) => {
  // src/data/players.ts
const players = {
  "1": {
    id: 1,
    name: "John Doe",
    team: "NWU Eagles",
    position: "Forward",
    age: 22,
    nationality: "South Africa",
    height: "1.85m",
    weight: "78kg",
    goals: 18,
    assists: 7,
    appearances: 17,
    yellowCards: 2,
    redCards: 0,
    avatar: "/football-player-portrait.png",
    joinDate: "2023-08-15",
    previousTeam: "Youth Academy",
    biography:
      "John is a prolific striker who joined NWU Eagles from the youth academy. Known for his clinical finishing and pace, he has quickly become a fan favorite.",
    achievements: ["Top Scorer 2024", "Player of the Month - December"],
    seasonStats: {
      matchesPlayed: 17,
      minutesPlayed: 1420,
      goalsPerGame: 1.06,
      shotsOnTarget: 34,
      passAccuracy: 78,
      dribblesCompleted: 23,
    },
    recentForm: ["Goal", "Goal", "Assist", "Goal", "Yellow Card"],
  },

  "2": {
    id: 2,
    name: "Mike Smith",
    team: "Wits Wolves",
    position: "Midfielder",
    age: 21,
    nationality: "South Africa",
    height: "1.80m",
    weight: "74kg",
    goals: 15,
    assists: 12,
    appearances: 18,
    yellowCards: 4,
    redCards: 1,
    avatar: "/football-midfielder-portrait.png",
    joinDate: "2023-07-20",
    previousTeam: "Local Club FC",
    biography:
      "Mike is a dynamic midfielder with great vision and creativity. He thrives in tight spaces and is known for his ability to unlock defenses.",
    achievements: ["Best Young Player 2023", "Team Player Award"],
    seasonStats: {
      matchesPlayed: 18,
      minutesPlayed: 1500,
      goalsPerGame: 0.83,
      shotsOnTarget: 28,
      passAccuracy: 82,
      dribblesCompleted: 35,
    },
    recentForm: ["Assist", "Goal", "Assist", "Red Card", "Goal"],
  },

  "3": {
    id: 3,
    name: "David Johnson",
    team: "UCT Lions",
    position: "Forward",
    age: 23,
    nationality: "Nigeria",
    height: "1.83m",
    weight: "79kg",
    goals: 12,
    assists: 5,
    appearances: 16,
    yellowCards: 1,
    redCards: 0,
    avatar: "/football-striker-portrait.png",
    joinDate: "2023-09-01",
    previousTeam: "Lagos United",
    biography:
      "David is a Nigerian forward known for his pace and strength. He is a constant threat behind defensive lines and delivers clinical finishes.",
    achievements: ["Top African Prospect 2023"],
    seasonStats: {
      matchesPlayed: 16,
      minutesPlayed: 1350,
      goalsPerGame: 0.75,
      shotsOnTarget: 30,
      passAccuracy: 74,
      dribblesCompleted: 28,
    },
    recentForm: ["Goal", "Goal", "Assist", "Goal", "Goal"],
  },

  "4": {
    id: 4,
    name: "Alex Wilson",
    team: "UP Tuks",
    position: "Defender",
    age: 24,
    nationality: "South Africa",
    height: "1.87m",
    weight: "82kg",
    goals: 3,
    assists: 8,
    appearances: 18,
    yellowCards: 6,
    redCards: 0,
    avatar: "/football-defender-portrait.png",
    joinDate: "2023-06-10",
    previousTeam: "Pretoria FC",
    biography:
      "Alex is a solid defender with excellent tackling and positioning. His aerial ability also makes him a danger during set pieces.",
    achievements: ["Best Defender 2023"],
    seasonStats: {
      matchesPlayed: 18,
      minutesPlayed: 1620,
      goalsPerGame: 0.16,
      shotsOnTarget: 8,
      passAccuracy: 80,
      dribblesCompleted: 12,
    },
    recentForm: ["Clean Sheet", "Assist", "Yellow Card", "Clean Sheet", "Assist"],
  },

  "5": {
    id: 5,
    name: "Peter Brown",
    team: "UJ Orange",
    position: "Goalkeeper",
    age: 25,
    nationality: "Zimbabwe",
    height: "1.90m",
    weight: "85kg",
    goals: 0,
    assists: 1,
    appearances: 18,
    yellowCards: 1,
    redCards: 0,
    cleanSheets: 8,
    saves: 67,
    avatar: "/football-goalkeeper-portrait.png",
    joinDate: "2023-08-01",
    previousTeam: "Harare City",
    biography:
      "Peter is a commanding goalkeeper from Zimbabwe. He is known for his quick reflexes, excellent shot-stopping, and leadership from the back.",
    achievements: ["Golden Glove 2024"],
    seasonStats: {
      matchesPlayed: 18,
      minutesPlayed: 1620,
      goalsPerGame: 0,
      shotsOnTarget: 0,
      passAccuracy: 70,
      dribblesCompleted: 0,
    },
    recentForm: ["Clean Sheet", "Save", "Save", "Clean Sheet", "Yellow Card"],
  },

  "6": {
    id: 6,
    name: "Kevin Davis",
    team: "Stellenbosch FC",
    position: "Midfielder",
    age: 20,
    nationality: "South Africa",
    height: "1.75m",
    weight: "70kg",
    goals: 8,
    assists: 15,
    appearances: 17,
    yellowCards: 3,
    redCards: 0,
    avatar: "/football-young-midfielder-portrait.png",
    joinDate: "2023-07-15",
    previousTeam: "Cape Town Youth",
    biography:
      "Kevin is a young and energetic midfielder with superb dribbling skills. He excels in carrying the ball forward and linking play.",
    achievements: ["Rookie of the Year 2023"],
    seasonStats: {
      matchesPlayed: 17,
      minutesPlayed: 1400,
      goalsPerGame: 0.47,
      shotsOnTarget: 18,
      passAccuracy: 84,
      dribblesCompleted: 42,
    },
    recentForm: ["Assist", "Goal", "Assist", "Assist", "Yellow Card"],
  },

  "7": {
    id: 7,
    name: "Forget Nukeri",
    team: "Stellenbosch FC",
    position: "Forward",
    age: 23,
    nationality: "South Africa",
    height: "1.82m",
    weight: "77kg",
    goals: 3,
    assists: 8,
    appearances: 18,
    yellowCards: 6,
    redCards: 0,
    avatar: "/forgetnukeriID.jpg",
    joinDate: "2023-06-10",
    previousTeam: "Pretoria FC",
    biography:
      "Forget is a versatile forward who can play across the front line. Known for his agility and pressing, he contributes both goals and assists.",
    achievements: ["Fan Favorite 2023"],
    seasonStats: {
      matchesPlayed: 18,
      minutesPlayed: 1500,
      goalsPerGame: 0.16,
      shotsOnTarget: 15,
      passAccuracy: 75,
      dribblesCompleted: 27,
    },
    recentForm: ["Assist", "Yellow Card", "Assist", "Goal", "Assist"],
  },
} as const;


  return players[id as keyof typeof players] || null
}

const getPositionColor = (position: string) => {
  switch (position.toLowerCase()) {
    case "forward":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    case "midfielder":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    case "defender":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    case "goalkeeper":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }
}

export default function PlayerProfilePage() {
  const params = useParams()
  const player = getPlayerById(params.id as string)

  if (!player) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Player Not Found</h1>
          <Button asChild>
            <Link href="/players">Back to Players</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-4">
            <Link href="/players">
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/20">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Players
              </Button>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-black">NWU</div>
              <div>
                <h1 className="text-2xl font-bold">Player Profile</h1>
                <p className="text-primary-foreground/80">{player.name}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Player Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="w-32 h-32 mx-auto mb-4">
                  <AvatarImage src={player.avatar || "/placeholder.svg"} alt={player.name} />
                  <AvatarFallback className="text-2xl font-bold">
                    {player.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl">{player.name}</CardTitle>
                <div className="flex justify-center space-x-2 mt-2">
                  <Badge className={getPositionColor(player.position)}>{player.position}</Badge>
                  <Badge variant="outline">#{player.id}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Age</div>
                    <div className="font-semibold">{player.age}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Height</div>
                    <div className="font-semibold">{player.height}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Weight</div>
                    <div className="font-semibold">{player.weight}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Nationality</div>
                    <div className="font-semibold">{player.nationality}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{player.team}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Joined {new Date(player.joinDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Previous: {player.previousTeam}</span>
                  </div>
                </div>

                {/* Biography */}
                <div>
                  <h3 className="font-semibold mb-2">Biography</h3>
                  <p className="text-sm text-muted-foreground">{player.biography}</p>
                </div>

                {/* Achievements */}
                <div>
                  <h3 className="font-semibold mb-2 flex items-center space-x-2">
                    <Award className="w-4 h-4" />
                    <span>Achievements</span>
                  </h3>
                  <div className="space-y-1">
                    {player.achievements.map((achievement, index) => (
                      <Badge key={index} variant="secondary" className="mr-1 mb-1">
                        {achievement}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats and Performance */}
          <div className="lg:col-span-2 space-y-6">
            {/* Season Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Season Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{player.goals}</div>
                    <div className="text-sm text-muted-foreground">Goals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{player.assists}</div>
                    <div className="text-sm text-muted-foreground">Assists</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{player.appearances}</div>
                    <div className="text-sm text-muted-foreground">Appearances</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{player.seasonStats.minutesPlayed}</div>
                    <div className="text-sm text-muted-foreground">Minutes</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Goals per Game</span>
                    <span>{player.seasonStats.goalsPerGame}</span>
                  </div>
                  <Progress value={player.seasonStats.goalsPerGame * 50} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Pass Accuracy</span>
                    <span>{player.seasonStats.passAccuracy}%</span>
                  </div>
                  <Progress value={player.seasonStats.passAccuracy} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Shots on Target</span>
                    <span>{player.seasonStats.shotsOnTarget}</span>
                  </div>
                  <Progress value={(player.seasonStats.shotsOnTarget / 50) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Dribbles Completed</span>
                    <span>{player.seasonStats.dribblesCompleted}</span>
                  </div>
                  <Progress value={(player.seasonStats.dribblesCompleted / 40) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Recent Form */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Form</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  {player.recentForm.map((event, index) => (
                    <Badge
                      key={index}
                      variant={
                        event === "Goal"
                          ? "default"
                          : event === "Assist"
                            ? "secondary"
                            : event === "Yellow Card"
                              ? "destructive"
                              : "outline"
                      }
                      className="text-xs"
                    >
                      {event}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">Last 5 significant events in matches</p>
              </CardContent>
            </Card>

            {/* Disciplinary Record */}
            <Card>
              <CardHeader>
                <CardTitle>Disciplinary Record</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{player.yellowCards}</div>
                    <div className="text-sm text-muted-foreground">Yellow Cards</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{player.redCards}</div>
                    <div className="text-sm text-muted-foreground">Red Cards</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
