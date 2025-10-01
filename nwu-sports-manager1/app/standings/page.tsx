"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, TrendingUp, TrendingDown, Minus, ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react";
import Link from "next/link"
import { getTrendIcon, getFormBadgeVariant } from "@/lib/utils"

const getFormBadgeVariant = (result: string) => {
  switch (result) {
    case "W":
      return "default"
    case "D":
      return "secondary"
    case "L":
      return "destructive"
    default:
      return "secondary"
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
	const [standings, setStandings] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	
	useEffect(() => {
  // Start fetching data when the component mounts
  fetch("http://localhost:4000/api/standings/table")
    .then((res) => res.json())
    .then(({ data }) => {
      setStandings(
        data.map((team) => ({
          ...team,

          // Parse "form"
          form: (() => {
            try {
              return typeof team.form === "string"
                ? JSON.parse(team.form)
                : Array.isArray(team.form)
                ? team.form
                : [];
            } catch {
              return [];
            }
          })(),
        }))
      );
    })
    .catch((err) => {
      console.error("Failed to fetch standings:", err);
    });
	}, []);
	
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
                  <p className="text-primary-foreground/80">2024 University Sports League</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="w-6 h-6" />
              <span className="font-semibold">Season 2024</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* League Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5" />
                <span>University Sports League Table</span>
              </div>
              <Badge variant="outline">18 Matches Played</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                    <tr key={team.position} className="border-b hover:bg-muted/50 transition-colors">
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
                        <div className="font-semibold text-foreground">{team.team}</div>
                      </td>
                      <td className="text-center py-4 px-2 text-muted-foreground">{team.played}</td>
                      <td className="text-center py-4 px-2 text-green-600 font-medium">{team.wins}</td>
                      <td className="text-center py-4 px-2 text-yellow-600 font-medium">{team.draws}</td>
                      <td className="text-center py-4 px-2 text-red-600 font-medium">{team.losses}</td>
                      <td className="text-center py-4 px-2 text-muted-foreground">{team.goalsFor}</td>
                      <td className="text-center py-4 px-2 text-muted-foreground">{team.goalsAgainst}</td>
                      <td
                        className={`text-center py-4 px-2 font-medium ${
                          team.goalDifference > 0
                            ? "text-green-600"
                            : team.goalDifference < 0
                              ? "text-red-600"
                              : "text-muted-foreground"
                        }`}
                      >
                        {team.goalDifference > 0 ? "+" : ""}
                        {team.goalDifference}
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
          </CardContent>
        </Card>

        {/* Legend */}
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
                <span className="text-sm">Relegation Zone (7th-8th)</span>
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
                <span>Played</span>
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
      </main>
    </div>
  )
}
