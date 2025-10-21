"use client"

import { useEffect, useState, useMemo } from "react"
import type { Player, Match, Announcement, Fixture } from "@/lib/mockData"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Trophy, Megaphone, Calendar } from "lucide-react"

interface DashboardStatsProps {
  players?: Player[]
  recentMatches?: Match[]
  announcements?: Announcement[]
  upcomingMatches?: Fixture[]
}

export default function DashboardStats({
  players = [],
  recentMatches = [],
  announcements = [],
  upcomingMatches = [],
}: DashboardStatsProps) {
  const [currentTeam, setCurrentTeam] = useState<string | null>(null)

  // Get logged-in coach info
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      const user = JSON.parse(storedUser)
      if (user.role === "coach" && typeof user.team === "string") {
        setCurrentTeam(user.team)
      }
    }
  }, [])

  // Players for current team
  const teamPlayers = useMemo(() => {
    return currentTeam ? players.filter(p => p.team === currentTeam) : []
  }, [players, currentTeam])

  // Recent matches for current team (latest 5)
  const teamRecentMatches = useMemo(() => {
    if (!currentTeam) return []
    return (recentMatches || [])
      .filter(m => m.homeTeam === currentTeam || m.awayTeam === currentTeam)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  }, [recentMatches, currentTeam])


const teamUpcomingMatches = useMemo(() => {
  if (!currentTeam) return []

  const now = new Date()

  return (upcomingMatches || [])
    .filter(f =>
      (f.homeTeam === currentTeam || f.awayTeam === currentTeam) &&
      new Date(`${f.date}T${f.time}`) >= now // only future matches
    )
    .sort((a, b) => {
      const aTime = new Date(`${a.date}T${a.time}`).getTime()
      const bTime = new Date(`${b.date}T${b.time}`).getTime()
      return aTime - bTime
    })
}, [upcomingMatches, currentTeam])


  const totalPlayers = teamPlayers.length
  const recentWins = teamRecentMatches.filter(m => m.result?.status === "won").length
  const totalAnnouncements = announcements.length
const nextMatch = teamUpcomingMatches[0] ?? null


  const stats = [
    {
      title: "Total Players",
      value: totalPlayers,
      icon: Users,
      description: "Active team members",
      color: "text-blue-600",
    },
    {
      title: "Recent Wins",
      value: recentWins,
      icon: Trophy,
      description: "Last 5 matches",
      color: "text-green-600",
    },
    {
      title: "Announcements",
      value: totalAnnouncements,
      icon: Megaphone,
      description: "Active messages",
      color: "text-orange-600",
    },
    {
  title: "Next Match",
  value: nextMatch
    ? new Date(`${nextMatch.date}T${nextMatch.time}`).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "TBD",
  icon: Calendar,
  description: nextMatch
    ? `${nextMatch.homeTeam} vs ${nextMatch.awayTeam} ${
        nextMatch.homeTeam === currentTeam ? "(Home)" : "(Away)"
      }`
    : "No matches scheduled",
  color: "text-purple-600",
},

  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map(stat => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <Icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
