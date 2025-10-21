"use client"

import { useEffect, useState, useMemo } from "react"
import { MatchCard } from "./match-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy } from "lucide-react"
import type { Fixture } from "@/lib/mockData"
import { mockResults } from "@/lib/mockData"

export function RecentMatches() {
  const [currentTeam, setCurrentTeam] = useState<string | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      const user = JSON.parse(storedUser)
      if (user.role === "coach" && typeof user.team === "string") {
        setCurrentTeam(user.team)
      }
    }
  }, [])

  // Filter results for the logged-in coach's team
  const recentMatches = useMemo(() => {
    if (!currentTeam) return []
    return mockResults
      .filter(match => match.status === "final" &&
        (match.homeTeam === currentTeam || match.awayTeam === currentTeam))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  }, [currentTeam])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-secondary" />
          Recent Results
        </CardTitle>
        <div className="text-sm text-muted-foreground mt-1">
          {recentMatches.length} recent matches
        </div>
      </CardHeader>
      <CardContent>
        {recentMatches.length > 0 ? (
          <div className="space-y-4">
            {recentMatches.map(match => (
              <div
                key={`recent-${match.id}`}
                className="p-4 border rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{match.homeTeam} {match.homeScore} – {match.awayScore} {match.awayTeam}</p>
                  <p className="text-sm text-muted-foreground">{match.league} | {match.round} | {match.date}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">No recent matches</h3>
            <p className="text-sm text-muted-foreground">
              Match results for your team will appear here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
