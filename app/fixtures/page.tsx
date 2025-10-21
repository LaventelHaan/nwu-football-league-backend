"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, ArrowLeft, Filter, Loader2 } from "lucide-react"
import Link from "next/link"

// Types based on your database schema
interface Fixture {
  fixture_id: number
  league_id: number
  home_team_id: number
  away_team_id: number
  scheduled_at: string
  venue_field_id?: number
  booking_id?: number
  created_by: number
  approval_status: string
  approved_by?: number
  approved_at?: string
  home_team_name: string
  away_team_name: string
  venue_name?: string
  field_name?: string
  home_score?: number
  away_score?: number
  status_key: string
  league_name: string
}

interface MatchResult extends Fixture {
  match_id: number
  started_at?: string
  ended_at?: string
  highlights?: string[]
  attendance?: number
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "SCHEDULED":
      return <Badge variant="default">Upcoming</Badge>
    case "IN_PROGRESS":
      return (
        <Badge variant="destructive" className="animate-pulse">
          Live
        </Badge>
      )
    case "FINAL":
      return <Badge variant="secondary">Final</Badge>
    case "POSTPONED":
      return <Badge variant="outline">Postponed</Badge>
    case "CANCELLED":
      return <Badge variant="outline">Cancelled</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

// Helper function to generate match highlights from events
const generateHighlights = (fixture: Fixture): string[] => {
  const highlights: string[] = []
  
  if (fixture.home_score !== undefined && fixture.away_score !== undefined) {
    if (fixture.home_score > fixture.away_score) {
      highlights.push(`${fixture.home_team_name} victory`)
    } else if (fixture.away_score > fixture.home_score) {
      highlights.push(`${fixture.away_team_name} victory`)
    } else {
      highlights.push("Draw")
    }
    
    if (fixture.home_score === 0 || fixture.away_score === 0) {
      highlights.push("Clean sheet")
    }
    
    if (fixture.home_score + fixture.away_score >= 5) {
      highlights.push("High scoring")
    }
  }
  
  return highlights
}

export default function FixturesPage() {
  const [selectedTab, setSelectedTab] = useState("upcoming")
  const [upcomingFixtures, setUpcomingFixtures] = useState<Fixture[]>([])
  const [recentResults, setRecentResults] = useState<MatchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    thisWeek: 0,
    lastWeek: 0,
    avgGoals: 0
  })

  // Fetch fixtures and results from database
  useEffect(() => {
    const fetchFixturesData = async () => {
      try {
        setLoading(true)
        
        // Fetch upcoming fixtures
        const fixturesResponse = await fetch('/api/fixtures/upcoming')
        const fixturesData = await fixturesResponse.json()
        if (fixturesData.success) {
          setUpcomingFixtures(fixturesData.fixtures)
        }

        // Fetch recent results (finalized matches)
        const resultsResponse = await fetch('/api/fixtures/results')
        const resultsData = await resultsResponse.json()
        if (resultsData.success) {
          setRecentResults(resultsData.results)
        }

        // Fetch stats
        const statsResponse = await fetch('/api/fixtures/stats')
        const statsData = await statsResponse.json()
        if (statsData.success) {
          setStats(statsData.stats)
        }

      } catch (error) {
        console.error('Error fetching fixtures data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFixturesData()
  }, [])

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  // Get round information (you might want to create a rounds/weeks table)
  const getRound = (fixtureId: number, scheduledAt: string) => {
    const date = new Date(scheduledAt)
    const seasonStart = new Date('2024-01-01') // Adjust based on your season
    const diffTime = Math.abs(date.getTime() - seasonStart.getTime())
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7))
    return `Week ${diffWeeks}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading fixtures...</p>
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
                  <h1 className="text-2xl font-bold">Fixtures & Results</h1>
                  <p className="text-primary-foreground/80">2024 University Sports League</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-6 h-6" />
              <span className="font-semibold">Season 2024</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="upcoming">Upcoming Fixtures</TabsTrigger>
              <TabsTrigger value="results">Recent Results</TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Upcoming Fixtures */}
          <TabsContent value="upcoming" className="space-y-6">
            {upcomingFixtures.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Upcoming Fixtures</h3>
                  <p className="text-muted-foreground">Check back later for scheduled matches.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {upcomingFixtures.map((fixture) => (
                  <Card key={fixture.fixture_id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <Badge variant="outline">{getRound(fixture.fixture_id, fixture.scheduled_at)}</Badge>
                        {getStatusBadge(fixture.status_key)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        {/* Teams */}
                        <div className="flex items-center justify-between md:justify-start space-x-4">
                          <div className="text-center">
                            <div className="font-bold text-lg">{fixture.home_team_name}</div>
                            <div className="text-sm text-muted-foreground">Home</div>
                          </div>
                          <div className="text-2xl font-bold text-muted-foreground">vs</div>
                          <div className="text-center">
                            <div className="font-bold text-lg">{fixture.away_team_name}</div>
                            <div className="text-sm text-muted-foreground">Away</div>
                          </div>
                        </div>

                        {/* Match Details */}
                        <div className="space-y-2 text-center md:text-left">
                          <div className="flex items-center justify-center md:justify-start space-x-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{formatDate(fixture.scheduled_at)}</span>
                          </div>
                          <div className="flex items-center justify-center md:justify-start space-x-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{formatTime(fixture.scheduled_at)}</span>
                          </div>
                          <div className="flex items-center justify-center md:justify-start space-x-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{fixture.venue_name || 'TBD'}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-center md:justify-end">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Recent Results */}
          <TabsContent value="results" className="space-y-6">
            {recentResults.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Recent Results</h3>
                  <p className="text-muted-foreground">Match results will appear here once matches are completed.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {recentResults.map((result) => (
                  <Card key={result.fixture_id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <Badge variant="outline">{getRound(result.fixture_id, result.scheduled_at)}</Badge>
                        {getStatusBadge(result.status_key)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        {/* Teams and Score */}
                        <div className="flex items-center justify-between md:justify-start space-x-4">
                          <div className="text-center">
                            <div className="font-bold text-lg">{result.home_team_name}</div>
                            <div className="text-3xl font-black text-primary">
                              {result.home_score ?? 0}
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-muted-foreground">-</div>
                          <div className="text-center">
                            <div className="font-bold text-lg">{result.away_team_name}</div>
                            <div className="text-3xl font-black text-primary">
                              {result.away_score ?? 0}
                            </div>
                          </div>
                        </div>

                        {/* Match Details */}
                        <div className="space-y-2 text-center md:text-left">
                          <div className="flex items-center justify-center md:justify-start space-x-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{formatDate(result.scheduled_at)}</span>
                          </div>
                          <div className="flex items-center justify-center md:justify-start space-x-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{result.venue_name || 'TBD'}</span>
                          </div>
                          {result.ended_at && (
                            <div className="text-sm text-muted-foreground">
                              Final
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-center md:justify-end">
                          <Button variant="outline" size="sm">
                            Match Report
                          </Button>
                        </div>
                      </div>

                      {/* Match Highlights */}
                      {result.home_score !== undefined && result.away_score !== undefined && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="font-semibold text-sm mb-2">Match Summary:</h4>
                          <div className="flex flex-wrap gap-2">
                            {generateHighlights(result).map((highlight, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {highlight}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-2">{stats.thisWeek}</div>
              <div className="text-sm text-muted-foreground">Matches Scheduled</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Last Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-2">{stats.lastWeek}</div>
              <div className="text-sm text-muted-foreground">Matches Completed</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Average Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-2">{stats.avgGoals.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Per Match</div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
