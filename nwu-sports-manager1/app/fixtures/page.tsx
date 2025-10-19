"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, ArrowLeft, Filter } from "lucide-react"
import Link from "next/link"

// Mock data for fixtures and results
const mockFixtures = [
  {
    id: 1,
    homeTeam: "NWU Eagles",
    awayTeam: "Wits Wolves",
    date: "2024-01-15",
    time: "15:00",
    venue: "NWU Stadium",
    status: "upcoming",
    round: "Round 19",
  },
  {
    id: 2,
    homeTeam: "UCT Lions",
    awayTeam: "UP Tuks",
    date: "2024-01-15",
    time: "17:30",
    venue: "UCT Grounds",
    status: "upcoming",
    round: "Round 19",
  },
  {
    id: 3,
    homeTeam: "UJ Orange",
    awayTeam: "Stellenbosch FC",
    date: "2024-01-16",
    time: "14:00",
    venue: "UJ Stadium",
    status: "upcoming",
    round: "Round 19",
  },
  {
    id: 4,
    homeTeam: "Rhodes United",
    awayTeam: "UKZN Sharks",
    date: "2024-01-16",
    time: "16:30",
    venue: "Rhodes Park",
    status: "upcoming",
    round: "Round 19",
  },
]

const mockResults = [
  {
    id: 5,
    homeTeam: "NWU Eagles",
    awayTeam: "UCT Lions",
    date: "2024-01-12",
    time: "14:30",
    venue: "UCT Grounds",
    status: "final",
    homeScore: 3,
    awayScore: 2,
    round: "Round 18",
    attendance: 2500,
    highlights: ["Goal by J. Doe (15')", "Goal by M. Smith (32')", "Goal by D. Johnson (67')"],
  },
  {
    id: 6,
    homeTeam: "Wits Wolves",
    awayTeam: "UP Tuks",
    date: "2024-01-12",
    time: "16:00",
    venue: "Wits Stadium",
    status: "final",
    homeScore: 1,
    awayScore: 1,
    round: "Round 18",
    attendance: 1800,
    highlights: ["Goal by A. Wilson (23')", "Goal by P. Brown (78')"],
  },
  {
    id: 7,
    homeTeam: "UJ Orange",
    awayTeam: "Rhodes United",
    date: "2024-01-11",
    time: "15:30",
    venue: "UJ Stadium",
    status: "final",
    homeScore: 2,
    awayScore: 0,
    round: "Round 18",
    attendance: 1200,
    highlights: ["Goal by K. Davis (41')", "Goal by L. Taylor (89')"],
  },
  {
    id: 8,
    homeTeam: "Stellenbosch FC",
    awayTeam: "UKZN Sharks",
    date: "2024-01-11",
    time: "17:00",
    venue: "Stellenbosch Stadium",
    status: "final",
    homeScore: 4,
    awayScore: 1,
    round: "Round 18",
    attendance: 900,
    highlights: [
      "Goal by R. Miller (12')",
      "Goal by S. Clark (34')",
      "Goal by T. White (56')",
      "Goal by J. Green (72')",
    ],
  },
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case "upcoming":
      return <Badge variant="default">Upcoming</Badge>
    case "live":
      return (
        <Badge variant="destructive" className="animate-pulse">
          Live
        </Badge>
      )
    case "final":
      return <Badge variant="secondary">Final</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function FixturesPage() {
  const [selectedTab, setSelectedTab] = useState("upcoming")

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
            <div className="grid gap-4">
              {mockFixtures.map((fixture) => (
                <Card key={fixture.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <Badge variant="outline">{fixture.round}</Badge>
                      {getStatusBadge(fixture.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      {/* Teams */}
                      <div className="flex items-center justify-between md:justify-start space-x-4">
                        <div className="text-center">
                          <div className="font-bold text-lg">{fixture.homeTeam}</div>
                          <div className="text-sm text-muted-foreground">Home</div>
                        </div>
                        <div className="text-2xl font-bold text-muted-foreground">vs</div>
                        <div className="text-center">
                          <div className="font-bold text-lg">{fixture.awayTeam}</div>
                          <div className="text-sm text-muted-foreground">Away</div>
                        </div>
                      </div>

                      {/* Match Details */}
                      <div className="space-y-2 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{fixture.date}</span>
                        </div>
                        <div className="flex items-center justify-center md:justify-start space-x-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{fixture.time}</span>
                        </div>
                        <div className="flex items-center justify-center md:justify-start space-x-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{fixture.venue}</span>
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
          </TabsContent>

          {/* Recent Results */}
          <TabsContent value="results" className="space-y-6">
            <div className="grid gap-4">
              {mockResults.map((result) => (
                <Card key={result.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <Badge variant="outline">{result.round}</Badge>
                      {getStatusBadge(result.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      {/* Teams and Score */}
                      <div className="flex items-center justify-between md:justify-start space-x-4">
                        <div className="text-center">
                          <div className="font-bold text-lg">{result.homeTeam}</div>
                          <div className="text-3xl font-black text-primary">{result.homeScore}</div>
                        </div>
                        <div className="text-2xl font-bold text-muted-foreground">-</div>
                        <div className="text-center">
                          <div className="font-bold text-lg">{result.awayTeam}</div>
                          <div className="text-3xl font-black text-primary">{result.awayScore}</div>
                        </div>
                      </div>

                      {/* Match Details */}
                      <div className="space-y-2 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{result.date}</span>
                        </div>
                        <div className="flex items-center justify-center md:justify-start space-x-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{result.venue}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Attendance: {result.attendance?.toLocaleString()}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-center md:justify-end">
                        <Button variant="outline" size="sm">
                          Match Report
                        </Button>
                      </div>
                    </div>

                    {/* Match Highlights */}
                    {result.highlights && result.highlights.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-semibold text-sm mb-2">Key Events:</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.highlights.map((highlight, index) => (
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
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-2">4</div>
              <div className="text-sm text-muted-foreground">Matches Scheduled</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Last Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-2">4</div>
              <div className="text-sm text-muted-foreground">Matches Completed</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Average Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-2">2.8</div>
              <div className="text-sm text-muted-foreground">Per Match</div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
