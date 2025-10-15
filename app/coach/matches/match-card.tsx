"use client"

import { useEffect, useState } from "react"
import type { Fixture } from "@/lib/mockData"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Clock, Trophy, Target } from "lucide-react"
import { format } from "date-fns"

interface MatchCardProps {
  match: Fixture
  type: "upcoming" | "recent"
}

export function MatchCard({ match, type }: MatchCardProps) {
  const [currentTeam, setCurrentTeam] = useState<string | null>(null)

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

  const getStatusBadge = () => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      upcoming: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    }

    return <Badge className={colors[match.status]}>{match.status.toUpperCase()}</Badge>
  }

  const highlightTeam = (team: string) => {
    if (team === currentTeam) return "font-bold text-primary"
    return ""
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className={highlightTeam(match.homeTeam)}>{match.homeTeam}</span>
              <span className="text-muted-foreground">vs</span>
              <span className={highlightTeam(match.awayTeam)}>{match.awayTeam}</span>
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="default">{match.league}</Badge>
              {type === "recent" && getStatusBadge()}
            </div>
          </div>
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

        {type === "recent" && match.status === "completed" && (
          <div className="pt-3 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="w-4 h-4 text-secondary" />
              <span className="font-medium text-secondary">Match Completed</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
