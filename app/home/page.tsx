"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import {
  Trophy,
  Calendar,
  Users,
  Play,
  ImageIcon,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Star,
  Award,
  Target,
  Clock,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import TeamOfTheWeek from "@/components/ui/TeamOfTheWeek"

// Types based on your database schema
interface Fixture {
  fixture_id: number
  home_team_id: number
  away_team_id: number
  scheduled_at: string
  venue_field_id?: number
  home_team_name: string
  away_team_name: string
  venue_name?: string
  field_name?: string
  home_score?: number
  away_score?: number
  status_key: string
}

interface LiveMatch extends Fixture {
  homeScore: number
  awayScore: number
  minute: number
  status: string
  events: {
    corners: { home: number; away: number }
    yellowCards: { home: number; away: number }
    redCards: { home: number; away: number }
  }
}

interface Standing {
  team_id: number
  team_name: string
  position: number
  points: number
  wins: number
  draws: number
  losses: number
  goals_scored: number
  goals_conceded: number
}

interface TopScorer {
  player_id: number
  first_name: string
  last_name: string
  team_name: string
  goals: number
}

interface NewsArticle {
  id: number
  title: string
  excerpt: string
  date: string
}

interface TeamOfTheWeekPlayer {
  player_id: number
  first_name: string
  last_name: string
  team_name: string
  position_key: string
  rating: number
}

interface TeamOfTheWeekData {
  week: number
  team?: {
    team_id: number
    team_name: string
    total_goals: number
    matches_played: number
  }
  players: TeamOfTheWeekPlayer[]
  coach?: {
    name: string
    team: string
    reason: string
  }
}

interface League {
  league_id: number
  name: string
  season_id: number
}

// Live matches functions
const getLiveMatches = async (): Promise<LiveMatch[]> => {
  try {
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    const sixtyMinutesFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    const response = await fetch(`/api/fixtures/live?start=${tenMinutesAgo.toISOString()}&end=${sixtyMinutesFromNow.toISOString()}`);
    const data = await response.json();
    
    if (data.success) {
      return data.matches.map((match: any) => ({
        ...match,
        homeScore: match.home_score || 0,
        awayScore: match.away_score || 0,
        minute: calculateCurrentMinute(match.scheduled_at),
        status: "live",
        events: {
          corners: {
            home: Math.floor(Math.random() * 8),
            away: Math.floor(Math.random() * 8),
          },
          yellowCards: {
            home: Math.floor(Math.random() * 4),
            away: Math.floor(Math.random() * 4),
          },
          redCards: {
            home: Math.floor(Math.random() * 2),
            away: Math.floor(Math.random() * 2),
          },
        },
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching live matches:', error);
    return [];
  }
};

const calculateCurrentMinute = (scheduledAt: string): number => {
  const now = new Date();
  const matchTime = new Date(scheduledAt);
  const elapsedMinutes = Math.floor((now.getTime() - matchTime.getTime()) / (1000 * 60));
  return Math.min(Math.max(elapsedMinutes, 0), 105); // Cap at 105 minutes (90 + 15 extra time)
};

const getNextUpcomingMatch = async (): Promise<Fixture | null> => {
  try {
    const response = await fetch('/api/fixtures/upcoming?limit=1');
    const data = await response.json();
    
    if (data.success && data.fixtures.length > 0) {
      return data.fixtures[0];
    }
    return null;
  } catch (error) {
    console.error('Error fetching next match:', error);
    return null;
  }
};

export default function HomePage() {
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([])
  const [fixtures, setFixtures] = useState<Fixture[]>([])
  const [standings, setStandings] = useState<Standing[]>([])
  const [topScorers, setTopScorers] = useState<TopScorer[]>([])
  const [news, setNews] = useState<NewsArticle[]>([])
  const [teamOfTheWeek, setTeamOfTheWeek] = useState<TeamOfTheWeekData | null>(null)
  const [leagues, setLeagues] = useState<League[]>([])
  const [selectedLeague, setSelectedLeague] = useState<string>("")
  const [nextMatch, setNextMatch] = useState<Fixture | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch leagues first
  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const leaguesResponse = await fetch('/api/standings/leagues?season_id=1') // Default to season 1
        const leaguesData = await leaguesResponse.json()
        
        if (leaguesData.success && leaguesData.leagues.length > 0) {
          setLeagues(leaguesData.leagues)
          setSelectedLeague(leaguesData.leagues[0].league_id.toString())
        }
      } catch (error) {
        console.error('Error fetching leagues:', error)
      }
    }

    fetchLeagues()
  }, [])

  // Fetch all data from database when league is selected
useEffect(() => {
  const fetchHomeData = async () => {
    if (!selectedLeague) return

    try {
      setLoading(true)
      
      // Fetch fixtures for selected league
      const fixturesResponse = await fetch(`/api/fixtures/upcoming?league_id=${selectedLeague}&limit=10`)
      const fixturesData = await fixturesResponse.json()
      if (fixturesData.success) {
        setFixtures(fixturesData.fixtures)
      }

      // Fetch standings for selected league
      const standingsResponse = await fetch(`/api/standings?league_id=${selectedLeague}`)
      const standingsData = await standingsResponse.json()
      if (standingsData.success) {
        setStandings(standingsData.standings)
      }

      // Fetch top scorers for selected league
      const scorersResponse = await fetch(`/api/players/top-scorers?league_id=${selectedLeague}&limit=6`)
      const scorersData = await scorersResponse.json()
      if (scorersData.success) {
        setTopScorers(scorersData.topScorers)
      }

      // Fetch news
      const newsResponse = await fetch('/api/news')
      const newsData = await newsResponse.json()
      if (newsData.success) {
        setNews(newsData.news)
      }

      // Fetch team of the week
      const teamWeekResponse = await fetch('/api/team-of-the-week')
      const teamWeekData = await teamWeekResponse.json()
      if (teamWeekData.success) {
        setTeamOfTheWeek(teamWeekData.teamOfTheWeek)
      }

    } catch (error) {
      console.error('Error fetching home data:', error)
    } finally {
      setLoading(false)
    }
  }

  fetchHomeData()
}, [selectedLeague])

  // Update live matches
  useEffect(() => {
    const updateLiveMatches = async () => {
      const currentLiveMatches = await getLiveMatches();
      setLiveMatches(currentLiveMatches);
      console.log("[Live Matches] Updated:", currentLiveMatches.length, "matches currently live");
    };

    // Initial update
    updateLiveMatches();

    // Update every minute for live matches
    const interval = setInterval(updateLiveMatches, 60000);

    return () => clearInterval(interval);
  }, []);

  // Fetch next match on component load
  useEffect(() => {
    const fetchNextMatch = async () => {
      const match = await getNextUpcomingMatch();
      setNextMatch(match);
    };

    fetchNextMatch();
  }, []);

  const getCurrentLeagueName = () => {
    return leagues.find(l => l.league_id.toString() === selectedLeague)?.name || "Current League"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">Loading NWU Sports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-background">
      {/* Background pattern overlay */}
      <div className="fixed inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none"></div>

      <header className="relative bg-gradient-to-r from-primary via-primary/95 to-primary/90 text-primary-foreground shadow-lg">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-6">
              <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-3">
                <div className="text-3xl font-black text-primary-foreground">NWU</div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-balance">Sports League Manager</h1>
                <p className="text-primary-foreground/90 text-lg font-medium">
                  Your Gateway to University Sports Excellence
                </p>
              </div>
            </div>
            <nav className="flex items-center space-x-3">
              <Button variant="secondary" size="default" className="font-semibold shadow-sm" asChild>
                <Link href="/standings">Standings</Link>
              </Button>
              <Button variant="secondary" size="default" className="font-semibold shadow-sm" asChild>
                <Link href="/fixtures">Fixtures</Link>
              </Button>
              <Button variant="secondary" size="default" className="font-semibold shadow-sm" asChild>
                <Link href="/players">Players</Link>
              </Button>
              <Button
                variant="outline"
                size="default"
                className="font-semibold bg-primary-foreground/10 border-primary-foreground/20 hover:bg-primary-foreground/20"
                asChild
              >
                <Link href="/login">Login</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="relative container mx-auto px-6 py-12 space-y-16">
        {/* Hero Section */}
        <section>
          <div className="relative overflow-hidden bg-gradient-to-br from-primary/8 via-accent/5 to-primary/12 rounded-3xl p-12 text-center shadow-xl border border-primary/10 backdrop-blur-sm">
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <div className="bg-primary/15 backdrop-blur-sm rounded-full p-6 shadow-lg">
                  <Trophy className="w-16 h-16 text-primary" />
                </div>
              </div>
              <h2 className="text-5xl font-bold text-foreground mb-6 text-balance">Welcome to NWU Sports</h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty leading-relaxed">
                Experience the thrill of university sports with comprehensive league management, real-time statistics,
                and exclusive content from South Africa's premier athletic competition.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button
                  size="lg"
                  className="font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90"
                  asChild
                >
                  <Link href="/standings">
                    <Trophy className="w-5 h-5 mr-2" />
                    View League Standings
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="font-semibold bg-background/80 backdrop-blur-sm hover:bg-background shadow-lg hover:shadow-xl transition-all duration-300 border-primary/20"
                  asChild
                >
                  <Link href="/fixtures">
                    <Calendar className="w-5 h-5 mr-2" />
                    Upcoming Matches
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* League Selection Dropdown */}
        {leagues.length > 0 && (
          <section className="flex justify-center">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-background/95 via-muted/8 to-background/95 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center space-x-4">
                  <Trophy className="w-5 h-5 text-primary" />
                  <label htmlFor="league-select" className="text-sm font-medium text-muted-foreground">
                    Select League:
                  </label>
                  <select
                    id="league-select"
                    value={selectedLeague}
                    onChange={(e) => setSelectedLeague(e.target.value)}
                    className="bg-background border border-muted-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-w-[200px]"
                  >
                    {leagues.map((league) => (
                      <option key={league.league_id} value={league.league_id.toString()}>
                        {league.name}
                      </option>
                    ))}
                  </select>
                  <Badge variant="secondary" className="font-semibold">
                    {getCurrentLeagueName()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Live Matches Section */}
        <section>
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <div className="bg-red-500/15 backdrop-blur-sm rounded-lg p-2 animate-pulse">
                <Zap className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-3xl font-bold text-foreground">
                {liveMatches.length > 0 ? 'Live Scores' : 'Upcoming Matches'}
              </h2>
              {liveMatches.length > 0 && (
                <Badge variant="destructive" className="animate-pulse font-semibold">
                  LIVE
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-lg">
              {liveMatches.length > 0 
                ? `${liveMatches.length} match${liveMatches.length !== 1 ? "es" : ""} currently in progress`
                : nextMatch 
                  ? `Next match: ${nextMatch.home_team_name} vs ${nextMatch.away_team_name}`
                  : 'No upcoming matches scheduled'
              }
            </p>
          </div>

          {liveMatches.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {liveMatches.map((match) => (
                <Card
                  key={match.fixture_id}
                  className="shadow-xl border-2 border-red-500/20 bg-gradient-to-br from-background/95 via-red-50/10 to-background/95 backdrop-blur-sm relative overflow-hidden"
                >
                  {/* Live indicator animation */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-red-400 to-red-500 animate-pulse"></div>

                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="font-bold text-red-500">LIVE</span>
                      </div>
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span className="font-semibold">
                          {match.minute >= 105 ? `105' FT` : `${match.minute}'`}
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Score Display */}
                    <div className="bg-gradient-to-r from-muted/20 via-muted/10 to-muted/20 border border-muted/30 rounded-xl p-6 backdrop-blur-sm">
                      <div className="flex justify-between items-center">
                        <div className="text-center flex-1">
                          <div className="font-bold text-lg mb-2">{match.home_team_name}</div>
                          <div className="text-4xl font-black text-primary">{match.homeScore}</div>
                        </div>
                        <div className="text-muted-foreground font-bold text-2xl mx-6">-</div>
                        <div className="text-center flex-1">
                          <div className="font-bold text-lg mb-2">{match.away_team_name}</div>
                          <div className="text-4xl font-black text-primary">{match.awayScore}</div>
                        </div>
                      </div>
                    </div>

                    {/* Match Stats */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-muted/20">
                        <div className="text-sm text-muted-foreground mb-1">Corners</div>
                        <div className="font-bold text-lg">
                          {match.events.corners.home} - {match.events.corners.away}
                        </div>
                      </div>
                      <div className="bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-muted/20">
                        <div className="text-sm text-muted-foreground mb-1">Yellow Cards</div>
                        <div className="font-bold text-lg text-yellow-500">
                          {match.events.yellowCards.home} - {match.events.yellowCards.away}
                        </div>
                      </div>
                      <div className="bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-muted/20">
                        <div className="text-sm text-muted-foreground mb-1">Red Cards</div>
                        <div className="font-bold text-lg text-red-500">
                          {match.events.redCards.home} - {match.events.redCards.away}
                        </div>
                      </div>
                    </div>

                    {/* Venue */}
                    <div className="text-center text-muted-foreground font-medium">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      {match.venue_name || 'TBD'}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : nextMatch ? (
            <Card className="shadow-xl border-0 bg-gradient-to-br from-background/95 via-muted/8 to-background/95 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-bold mb-2">Next Match Coming Up</h3>
                  <div className="flex justify-center items-center space-x-8 mb-4">
                    <div className="text-center">
                      <div className="font-bold text-lg">{nextMatch.home_team_name}</div>
                      <div className="text-2xl font-black text-primary">VS</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg">{nextMatch.away_team_name}</div>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    {new Date(nextMatch.scheduled_at).toLocaleDateString()} • {new Date(nextMatch.scheduled_at).toLocaleTimeString()}
                  </p>
                  {nextMatch.venue_name && (
                    <p className="text-muted-foreground mt-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      {nextMatch.venue_name}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-xl border-0 bg-gradient-to-br from-background/95 via-muted/8 to-background/95 backdrop-blur-sm">
              <CardContent className="pt-6 text-center">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold mb-2">No Matches Scheduled</h3>
                <p className="text-muted-foreground">Check back later for upcoming fixtures.</p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Team of the Week Section */}
        {teamOfTheWeek && teamOfTheWeek.team ? (
          <TeamOfTheWeek team={teamOfTheWeek} />
        ) : (
          <Card className="shadow-xl border-0 bg-gradient-to-br from-background/95 via-muted/8 to-background/95 backdrop-blur-sm">
            <CardContent className="pt-12 pb-12 text-center">
              <Trophy className="w-20 h-20 text-muted-foreground mx-auto mb-6 opacity-50" />
              <h3 className="text-2xl font-bold mb-4">No Team of the Week</h3>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                Team of the Week will be announced after matches are played. Check back next week!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Featured Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Featured Matches */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-gradient-to-br from-background/95 via-muted/8 to-background/95 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <div className="bg-primary/15 backdrop-blur-sm rounded-lg p-2">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <span>Featured Matches</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {fixtures.slice(0, 5).map((fixture) => (
                  <div
                    key={fixture.fixture_id}
                    className="bg-gradient-to-r from-muted/20 via-muted/10 to-muted/20 border border-muted/30 rounded-xl p-6 hover:shadow-lg hover:bg-gradient-to-r hover:from-muted/30 hover:via-muted/15 hover:to-muted/30 transition-all duration-300 backdrop-blur-sm"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center space-x-8">
                        <div className="text-center">
                          <div className="font-bold text-lg mb-1">{fixture.home_team_name}</div>
                          {fixture.home_score !== undefined && (
                            <div className="text-3xl font-black text-primary">{fixture.home_score}</div>
                          )}
                        </div>
                        <div className="text-muted-foreground font-semibold text-lg">VS</div>
                        <div className="text-center">
                          <div className="font-bold text-lg mb-1">{fixture.away_team_name}</div>
                          {fixture.away_score !== undefined && (
                            <div className="text-3xl font-black text-primary">{fixture.away_score}</div>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant={fixture.status_key === 'FINAL' ? "secondary" : "default"}
                        className="font-semibold px-4 py-2"
                      >
                        {fixture.status_key === 'FINAL' ? "Final" : "Upcoming"}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground font-medium">
                      {new Date(fixture.scheduled_at).toLocaleDateString()} • {new Date(fixture.scheduled_at).toLocaleTimeString()} • {fixture.venue_name || 'TBD'}
                    </div>
                  </div>
                ))}
                {fixtures.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No upcoming matches scheduled</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* League Standings */}
          <div>
            <Card className="shadow-xl border-0 bg-gradient-to-br from-background/95 via-muted/8 to-background/95 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <div className="bg-primary/15 backdrop-blur-sm rounded-lg p-2">
                    <Trophy className="w-5 h-5 text-primary" />
                  </div>
                  <span>{getCurrentLeagueName()} Standings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {standings.slice(0, 8).map((team, index) => (
                    <div
                      key={team.team_id}
                      className="flex justify-between items-center p-3 rounded-lg hover:bg-muted/20 transition-colors duration-300 backdrop-blur-sm"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
                          index === 0 
                            ? "bg-yellow-500 text-white" 
                            : index < 3 
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-bold text-base">{team.team_name}</div>
                          <div className="text-sm text-muted-foreground font-medium">
                            {team.wins}W • {team.draws}D • {team.losses}L
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-xl text-primary">{team.points}</div>
                        <div className="text-xs text-muted-foreground font-medium">points</div>
                      </div>
                    </div>
                  ))}
                </div>
                {standings.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No standings data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Scorers */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-background/95 via-muted/8 to-background/95 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <div className="bg-primary/15 backdrop-blur-sm rounded-lg p-2">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <span>Top Scorers</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topScorers.slice(0, 6).map((player, index) => (
                  <div
                    key={player.player_id}
                    className="flex justify-between items-center p-3 rounded-lg hover:bg-muted/20 transition-colors duration-300 backdrop-blur-sm"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
                        index === 0 
                          ? "bg-yellow-500 text-white" 
                          : index < 3 
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-bold text-base">{player.first_name} {player.last_name}</div>
                        <div className="text-sm text-muted-foreground font-medium">{player.team_name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-xl text-primary">{player.goals}</div>
                      <div className="text-xs text-muted-foreground font-medium">goals</div>
                    </div>
                  </div>
                ))}
                {topScorers.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No scorer data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Latest News */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-background/95 via-muted/8 to-background/95 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <div className="bg-primary/15 backdrop-blur-sm rounded-lg p-2">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <span>Latest News</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {news.slice(0, 4).map((article) => (
                  <div key={article.id} className="border-b border-muted/30 pb-6 last:border-b-0 last:pb-0">
                    <h3 className="font-bold text-lg mb-3 text-balance hover:text-primary transition-colors duration-300 cursor-pointer">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground mb-3 text-pretty leading-relaxed">{article.excerpt}</p>
                    <div className="text-sm text-muted-foreground font-medium">{article.date}</div>
                  </div>
                ))}
                {news.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No news available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative bg-gradient-to-br from-muted/90 via-muted/80 to-muted/90 mt-20 border-t border-muted/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* League Information */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-primary rounded-xl p-3 shadow-lg">
                  <div className="text-2xl font-black text-primary-foreground">NWU</div>
                </div>
                <div className="text-xl font-bold">Sports League</div>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed text-pretty">
                The premier university sports league featuring the best teams and players from across South Africa's
                leading institutions, promoting excellence in athletic competition.
              </p>
              <div className="flex space-x-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="p-3 bg-background/50 hover:bg-primary hover:text-primary-foreground transition-all duration-300 backdrop-blur-sm"
                >
                  <Facebook className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="p-3 bg-background/50 hover:bg-primary hover:text-primary-foreground transition-all duration-300 backdrop-blur-sm"
                >
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="p-3 bg-background/50 hover:bg-primary hover:text-primary-foreground transition-all duration-300 backdrop-blur-sm"
                >
                  <Instagram className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="p-3 bg-background/50 hover:bg-primary hover:text-primary-foreground transition-all duration-300 backdrop-blur-sm"
                >
                  <Youtube className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-lg mb-6 flex items-center space-x-2">
                <Star className="w-5 h-5 text-primary" />
                <span>Quick Links</span>
              </h3>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <Link href="/standings" className="hover:text-primary transition-colors duration-300 font-medium">
                    League Standings
                  </Link>
                </li>
                <li>
                  <Link href="/fixtures" className="hover:text-primary transition-colors duration-300 font-medium">
                    Fixtures & Results
                  </Link>
                </li>
                <li>
                  <Link href="/players" className="hover:text-primary transition-colors duration-300 font-medium">
                    Player Profiles
                  </Link>
                </li>
                <li>
                  <Link href="/teams" className="hover:text-primary transition-colors duration-300 font-medium">
                    Teams
                  </Link>
                </li>
                <li>
                  <Link href="/statistics" className="hover:text-primary transition-colors duration-300 font-medium">
                    Statistics
                  </Link>
                </li>
                <li>
                  <Link href="/news" className="hover:text-primary transition-colors duration-300 font-medium">
                    Latest News
                  </Link>
                </li>
              </ul>
            </div>

            {/* League Info */}
            <div>
              <h3 className="font-bold text-lg mb-6 flex items-center space-x-2">
                <Award className="w-5 h-5 text-primary" />
                <span>League Information</span>
              </h3>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-primary transition-colors duration-300 font-medium">
                    About the League
                  </Link>
                </li>
                <li>
                  <Link href="/rules" className="hover:text-primary transition-colors duration-300 font-medium">
                    Rules & Regulations
                  </Link>
                </li>
                <li>
                  <Link href="/schedule" className="hover:text-primary transition-colors duration-300 font-medium">
                    Season Schedule
                  </Link>
                </li>
                <li>
                  <Link href="/venues" className="hover:text-primary transition-colors duration-300 font-medium">
                    Venues
                  </Link>
                </li>
                <li>
                  <Link href="/officials" className="hover:text-primary transition-colors duration-300 font-medium">
                    Officials
                  </Link>
                </li>
                <li>
                  <Link href="/history" className="hover:text-primary transition-colors duration-300 font-medium">
                    League History
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="font-bold text-lg mb-6">Contact Us</h3>
              <div className="space-y-4 text-muted-foreground">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div className="text-sm leading-relaxed">
                    <div className="font-semibold text-foreground">NWU Sports Complex</div>
                    <div>Potchefstroom Campus</div>
                    <div>South Africa</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">+27 18 299 1111</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">sports@nwu.ac.za</span>
                </div>
              </div>
              <div className="mt-6 p-4 bg-background/60 backdrop-blur-sm rounded-xl border border-muted/30">
                <h4 className="font-bold mb-3 text-foreground">League Statistics</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-center">
                    <div className="font-black text-2xl text-primary">12</div>
                    <div className="text-muted-foreground">Teams</div>
                  </div>
                  <div className="text-center">
                    <div className="font-black text-2xl text-primary">240+</div>
                    <div className="text-muted-foreground">Players</div>
                  </div>
                  <div className="text-center">
                    <div className="font-black text-2xl text-primary">132</div>
                    <div className="text-muted-foreground">Matches</div>
                  </div>
                  <div className="text-center">
                    <div className="font-black text-2xl text-primary">2024</div>
                    <div className="text-muted-foreground">Season</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-muted/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground font-medium">© 2024 NWU Sports League Manager. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300 font-medium"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300 font-medium"
              >
                Terms of Service
              </Link>
              <Link
                href="/support"
                className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300 font-medium"
              >
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
