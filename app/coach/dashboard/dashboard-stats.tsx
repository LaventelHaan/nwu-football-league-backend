"use client"

import type { Player, Match, Announcement } from "@/lib/mockData"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Trophy, Megaphone, Calendar } from "lucide-react"

interface DashboardStatsProps {
  players: Player[]
  recentMatches: Match[]
  announcements: Announcement[]
  upcomingMatches: Match[]
}


export default function DashboardStats({ players, recentMatches, announcements, upcomingMatches }: DashboardStatsProps) {
  const totalPlayers = players.length
  const recentWins = recentMatches.filter((m) => m.result?.status === "won").length
  const totalAnnouncements = announcements.length
  const nextMatch = upcomingMatches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]


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
        ? new Date(nextMatch.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : "TBD",
      icon: Calendar,
      description: nextMatch ? nextMatch.opponent : "No matches scheduled",
      color: "text-purple-600",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
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