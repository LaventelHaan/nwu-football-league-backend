"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, TrendingUp, TrendingDown, Minus, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

// Types based on your existing API response
interface TeamStanding {
  team_id: number
  team_name: string
  position: number
  points: number
  wins: number
  draws: number
  losses: number
  goals_scored: number
  goals_conceded: number
  goal_difference: number
  matches_played: number
  form: string[]
  trend: "up" | "down" | "same"
}

interface Season {
  season_id: number
  name: string
  start_date: string
  end_date: string
}

interface League {
  league_id: number
  name: string
  season_id: number
}

const getFormBadgeVariant = (result: string) => {
  switch (result) {
    case "W":
      return "default"
    case "D":
      return "secondary"
    case "L":
      return "destructive"
    default:
      return "outline"
  }
}

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case "up":
      return <TrendingUp className="w-4 h-4 text-green-500" />
    case "down":
      return <TrendingDown className="w-4 h-4 text-red-500" />
    default:
      return <Minus className="w-4 h-4 text-muted-foreground" />
  }
}

export default function StandingsPage() {
  const [standings, setStandings] = useState<TeamStanding[]>([])
  const [seasons, setSeasons] = useState<Season[]>([])
  const [leagues, setLeagues] = useState<League[]>([])
  const [selectedSeason, setSelectedSeason] = useState<string>("")
  const [selectedLeague, setSelectedLeague] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [loadingStandings, setLoadingStandings] = useState(false)
  const [totalMatches, setTotalMatches] = useState(0)

  // Fetch seasons and initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true)
        
        // Fetch all seasons
        const seasonsResponse = await fetch('/api/standings/seasons')
        const seasonsData = await seasonsResponse.json()
        
        if (seasonsData.success) {
          setSeasons(seasonsData.seasons)
          
          // Select the most recent season by default
          if (seasonsData.seasons.length > 0) {
            const mostRecentSeason = seasonsData.seasons[0] // Assuming sorted by most recent
            setSelectedSeason(mostRecentSeason.season_id.toString())
          }
        }

      } catch (error) {
        console.error('Error fetching initial data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [])

  // Fetch leagues when season changes
  useEffect(() => {
    const fetchLeagues = async () => {
      if (!selectedSeason) return

      try {
        const leaguesResponse = await fetch(`/api/standings/leagues?season_id=${selectedSeason}`)
        const leaguesData = await leaguesResponse.json()
        
        if (leaguesData.success) {
          setLeagues(leaguesData.leagues)
          
          // Select the first league by default, or clear selection if no leagues
          if (leaguesData.leagues.length > 0) {
            setSelectedLeague(leaguesData.leagues[0].league_id.toString())
          } else {
            setSelectedLeague("")
            setStandings([])
          }
        }
      } catch (error) {
        console.error('Error fetching leagues:', error)
        setLeagues([])
        setSelectedLeague("")
      }
    }

    fetchLeagues()
  }, [selectedSeason])

  // Fetch standings when league changes
  useEffect(() => {
    const fetchStandings = async () => {
      if (!selectedLeague) {
        setStandings([])
        return
      }

      try {
        setLoadingStandings(true)
        
        const standingsResponse = await fetch(`/api/standings?league_id=${selectedLeague}`)
        const standingsData = await standingsResponse.json()
        
        if (standingsData.success) {
          setStandings(standingsData.standings)
          
          // Calculate total matches from standings
          const totalMatchesPlayed = standingsData.standings.reduce((total: number, team: TeamStanding) => {
            return total + team.matches_played
          }, 0)
          
          setTotalMatches(Math.floor(totalMatchesPlayed / 2))
        } else {
          setStandings([])
          setTotalMatches(0)
        }

      } catch (error) {
        console.error('Error fetching standings data:', error)
        setStandings([])
        setTotalMatches(0)
      } finally {
        setLoadingStandings(false)
      }
    }

    fetchStandings()
  }, [selectedLeague])

  const getSelectedSeasonName = () => {
    return seasons.find(s => s.season_id.toString() === selectedSeason)?.name || "Selected Season"
  }

  const getSelectedLeagueName = () => {
    return leagues.find(l => l.league_id.toString() === selectedLeague)?.name || "Selected League"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading standings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/home">
                <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/20">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-black">NWU</div>
                <div>
                  <h1 className="text-2xl font-bold">League Standings</h1>
                  <p className="text-primary-foreground/80">University Sports League</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="w-6 h-6" />
              <span className="font-semibold">{getSelectedSeasonName()}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Season</label>
                <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                  <SelectContent>
                    {seasons.map((season) => (
                      <SelectItem key={season.season_id} value={season.season_id.toString()}>
                        {season.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">League</label>
                <Select 
                  value={selectedLeague} 
                  onValueChange={setSelectedLeague}
                  disabled={!selectedSeason || leagues.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={leagues.length === 0 ? "No leagues available" : "Select league"} />
                  </SelectTrigger>
                  <SelectContent>
                    {leagues.map((league) => (
                      <SelectItem key={league.league_id} value={league.league_id.toString()}>
                        {league.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* League Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5" />
                <span>{getSelectedLeagueName()} - Standings</span>
              </div>
              {totalMatches > 0 && (
                <Badge variant="outline">{totalMatches} Total Matches</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStandings ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading standings...</p>
              </div>
            ) : standings.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {selectedLeague ? "No Standings Data" : "Select a League"}
                </h3>
                <p className="text-muted-foreground">
                  {selectedLeague 
                    ? "Standings will appear once matches are played in this league." 
                    : "Please select a league to view standings."
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-semibold">#</th>
                      <th className="text-left py-3 px-2 font-semibold">Team</th>
                      <th className="text-center py-3 px-2 font-semibold">P</th>
                      <th className="text-center py-3 px-2 font-semibold">W</th>
                      <th className="text-center py-3 px-2 font-semibold">D</th>
                      <th className="text-center py-3 px-2 font-semibold">L</th>
                      <th className="text-center py-3 px-2 font-semibold">GF</th>
                      <th className="text-center py-3 px-2 font-semibold">GA</th>
                      <th className="text-center py-3 px-2 font-semibold">GD</th>
                      <th className="text-center py-3 px-2 font-semibold">Pts</th>
                      <th className="text-center py-3 px-2 font-semibold">Form</th>
                      <th className="text-center py-3 px-2 font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((team) => (
                      <tr key={team.team_id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-4 px-2">
                          <div className="flex items-center space-x-2">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                team.position === 1
                                  ? "bg-yellow-500 text-white"
                                  : team.position <= 3
                                    ? "bg-primary text-primary-foreground"
                                    : team.position <= 6
                                      ? "bg-secondary text-secondary-foreground"
                                      : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {team.position}
                            </div>
                            {getTrendIcon(team.trend)}
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <div className="font-semibold text-foreground">{team.team_name}</div>
                        </td>
                        <td className="text-center py-4 px-2 text-muted-foreground">
                          {team.matches_played}
                        </td>
                        <td className="text-center py-4 px-2 text-green-600 font-medium">{team.wins}</td>
                        <td className="text-center py-4 px-2 text-yellow-600 font-medium">{team.draws}</td>
                        <td className="text-center py-4 px-2 text-red-600 font-medium">{team.losses}</td>
                        <td className="text-center py-4 px-2 text-muted-foreground">{team.goals_scored}</td>
                        <td className="text-center py-4 px-2 text-muted-foreground">{team.goals_conceded}</td>
                        <td
                          className={`text-center py-4 px-2 font-medium ${
                            team.goal_difference > 0
                              ? "text-green-600"
                              : team.goal_difference < 0
                                ? "text-red-600"
                                : "text-muted-foreground"
                          }`}
                        >
                          {team.goal_difference > 0 ? "+" : ""}
                          {team.goal_difference}
                        </td>
                        <td className="text-center py-4 px-2">
                          <div className="font-bold text-lg text-primary">{team.points}</div>
                        </td>
                        <td className="text-center py-4 px-2">
                          <div className="flex justify-center space-x-1">
                            {team.form.map((result, index) => (
                              <Badge
                                key={index}
                                variant={getFormBadgeVariant(result)}
                                className="w-6 h-6 p-0 text-xs flex items-center justify-center"
                              >
                                {result}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="text-center py-4 px-2">
                          {team.position === 1 && <Trophy className="w-4 h-4 text-yellow-500 mx-auto" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legend */}
        {standings.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Table Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Trophy className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm">Champion</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full"></div>
                  <span className="text-sm">Championship Playoffs (2nd-3rd)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-secondary rounded-full"></div>
                  <span className="text-sm">Mid-table (4th-6th)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-muted rounded-full"></div>
                  <span className="text-sm">Lower Table (7th+)</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Abbreviations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">P:</span>
                  <span>Matches Played</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">W:</span>
                  <span>Won</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">D:</span>
                  <span>Drawn</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">L:</span>
                  <span>Lost</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">GF:</span>
                  <span>Goals For</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">GA:</span>
                  <span>Goals Against</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">GD:</span>
                  <span>Goal Difference</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Pts:</span>
                  <span>Points</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
