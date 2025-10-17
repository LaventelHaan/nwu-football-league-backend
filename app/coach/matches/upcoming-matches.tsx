"use client"

import type { Match } from "@/lib/mockData"
import { MatchCard } from "./match-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock } from "lucide-react"

interface UpcomingMatchesProps {
  matches: Match[]
}

export function UpcomingMatches({ matches }: UpcomingMatchesProps) {
  const sortedMatches = matches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

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
            <h3 className="text-lg font-medium text-muted-foreground">No upcoming matches</h3>
            <p className="text-sm text-muted-foreground">Check back later for scheduled games</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}