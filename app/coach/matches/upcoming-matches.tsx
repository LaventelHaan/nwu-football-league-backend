"use client"

import { useEffect, useState, useMemo } from "react"
import { MatchCard } from "./match-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock } from "lucide-react"
import type { Match } from "@/lib/mockData"
import { mockFixtures } from "@/lib/mockData"

interface UpcomingMatchesProps {
  matches?: Match[]
}

export function UpcomingMatches({ matches = mockFixtures }: UpcomingMatchesProps) {
  const [currentTeam, setCurrentTeam] = useState<string | null>(null)
  const [now, setNow] = useState(new Date()) // for live updates

  // Get logged-in coach info from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      const user = JSON.parse(storedUser)
      if (user.role === "coach") {
        setCurrentTeam(user.team)
      }
    }
  }, [])

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  // Filter matches for the logged-in coach
  const filteredMatches = useMemo(() => {
    if (!currentTeam) return []

    return matches
      .filter((match) => {
        const matchDateTime = new Date(`${match.date}T${match.time}`)
        return (
          (match.homeTeam === currentTeam || match.awayTeam === currentTeam) &&
          matchDateTime >= now
        )
      })
      .map((match) => ({
        ...match,
        isHome: match.homeTeam === currentTeam,
        status: match.status || "upcoming",
      }))
  }, [matches, currentTeam, now])

  // Sort matches by date and time
  const sortedMatches = useMemo(() => {
    return filteredMatches.sort((a, b) => {
      const aDateTime = new Date(`${a.date}T${a.time}`).getTime()
      const bDateTime = new Date(`${b.date}T${b.time}`).getTime()
      return aDateTime - bDateTime
    })
  }, [filteredMatches])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Upcoming Matches
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedMatches.length > 0 ? (
          <div className="space-y-4">
            {sortedMatches.map((match) => (
              <MatchCard key={match.id} match={match} type="upcoming" />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">
              No upcoming matches
            </h3>
            <p className="text-sm text-muted-foreground">
              Check back later for scheduled games
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
