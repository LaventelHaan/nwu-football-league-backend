"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Trophy, Calendar, MapPin, Award, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

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
  const params = useParams();
  const player_id = params?.id as string;
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  
  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const response = await fetch(`http://localhost:3002/api/players/${player_id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch player');
        }
        const data = await response.json();
        setPlayer(data);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching player:', err);
      } finally {
        setLoading(false);
      }
    };

    if (player_id) {
      fetchPlayer();
    }
  }, [player_id]);
  
  if (loading) 
	  return <p>Loading...</p>;
  if (error) 
	  return <p>Error: {error}</p>;

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
                  <Badge variant="outline">#{player.player_id}</Badge>
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