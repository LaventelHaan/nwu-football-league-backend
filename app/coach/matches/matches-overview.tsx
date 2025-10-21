"use client"

import { useEffect, useState, useMemo } from "react"
import { UpcomingMatches } from "./upcoming-matches"
import { RecentMatches } from "./recent-matches"
import type { Fixture } from "@/lib/mockData"
import { mockFixtures } from "@/lib/mockData"

export default function MatchesOverview() {
  const [currentTeam, setCurrentTeam] = useState<string | null>(null)
  const [now, setNow] = useState(new Date())

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

  // Filter upcoming matches
  const upcomingMatches = useMemo(() => {
    if (!currentTeam) return []

    return mockFixtures
      .filter((match) => 
        (match.homeTeam === currentTeam || match.awayTeam === currentTeam) &&
        new Date(`${match.date}T${match.time}`) >= now
      )
      .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
  }, [currentTeam, now])

  // Filter recent matches
  const recentMatches = useMemo(() => {
    if (!currentTeam) return []

    return mockFixtures
      .filter((match) =>
        (match.homeTeam === currentTeam || match.awayTeam === currentTeam) &&
        new Date(`${match.date}T${match.time}`) < now
      )
      .sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime())
      .slice(0, 5) // show last 5 results
  }, [currentTeam, now])

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <UpcomingMatches matches={upcomingMatches} />
      <RecentMatches matches={recentMatches} />
    </div>
  )
}
