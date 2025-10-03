"use client"

import type { Match } from "@/lib/mockData"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Clock, Trophy, Target } from "lucide-react"
import { format } from "date-fns"

interface MatchCardProps {
  match: Match
  type: "upcoming" | "recent"
}

export function MatchCard({ match, type }: MatchCardProps) {
  const getResultBadge = () => {
    if (!match.result) return null

    const { status } = match.result
    const colors = {
      won: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      lost: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      draw: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    }

    return <Badge className={colors[status]}>{status.toUpperCase()}</Badge>
  }

  const getScoreDisplay = () => {
    if (!match.result) return null

    const { homeScore, awayScore } = match.result
    const nwuScore = match.isHome ? homeScore : awayScore
    const opponentScore = match.isHome ? awayScore : homeScore

    return (
      <div className="text-2xl font-bold text-center">
        <span
          className={
            nwuScore > opponentScore ? "text-green-600" : nwuScore < opponentScore ? "text-red-600" : "text-yellow-600"
          }
        >
          {nwuScore}
        </span>
        <span className="text-muted-foreground mx-2">-</span>
        <span
          className={
            opponentScore > nwuScore ? "text-green-600" : opponentScore < nwuScore ? "text-red-600" : "text-yellow-600"
          }
        >
          {opponentScore}
        </span>
      </div>
    )
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <span>NWU Eagles</span>
              <span className="text-muted-foreground">vs</span>
              <span>{match.opponent}</span>
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={match.isHome ? "default" : "secondary"}>{match.isHome ? "HOME" : "AWAY"}</Badge>
              {type === "recent" && getResultBadge()}
            </div>
          </div>
          {type === "recent" && match.result && <div className="text-right">{getScoreDisplay()}</div>}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(match.date), "EEEE, MMMM dd, yyyy")}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{match.time}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{match.venue}</span>
          </div>
        </div>

        {type === "upcoming" && (
          <div className="pt-3 border-t">
            <div className="flex items-center gap-2 text-sm text-primary">
              <Target className="w-4 h-4" />
              <span className="font-medium">Prepare for match</span>
            </div>
          </div>
        )}

        {type === "recent" && match.result && (
          <div className="pt-3 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="w-4 h-4 text-secondary" />
              <span className="font-medium text-secondary">
                {match.result.status === "won" ? "Victory!" : match.result.status === "lost" ? "Defeat" : "Draw"}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
