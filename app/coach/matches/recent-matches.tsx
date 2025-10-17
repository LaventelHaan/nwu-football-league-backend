"use client"

import type { Match } from "@/lib/mockData"
import { MatchCard } from "./match-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface RecentMatchesProps {
  matches: Match[]
}

export function RecentMatches({ matches }: RecentMatchesProps) {
  const sortedMatches = matches
    .filter((match) => match.result)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  const getTeamStats = () => {
    const wins = sortedMatches.filter((m) => m.result?.status === "won").length
    const losses = sortedMatches.filter((m) => m.result?.status === "lost").length
    const draws = sortedMatches.filter((m) => m.result?.status === "draw").length

    return { wins, losses, draws }
  }

  const { wins, losses, draws } = getTeamStats()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-secondary" />
          Recent Results
        </CardTitle>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span>{wins}W</span>
          </div>
          <div className="flex items-center gap-1 text-yellow-600">
            <Minus className="w-4 h-4" />
            <span>{draws}D</span>
          </div>
          <div className="flex items-center gap-1 text-red-600">
            <TrendingDown className="w-4 h-4" />
            <span>{losses}L</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sortedMatches.length > 0 ? (
          <div className="space-y-4">
            {sortedMatches.map((match) => (
              <MatchCard key={match.id} match={match} type="recent" />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">No recent matches</h3>
            <p className="text-sm text-muted-foreground">Match results will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}