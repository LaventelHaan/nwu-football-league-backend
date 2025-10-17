"use client"

import type { Match } from "@/lib/mockData"
import { UpcomingMatches } from "./upcoming-matches"
import { RecentMatches } from "./recent-matches"

interface MatchesOverviewProps {
  upcomingMatches: Match[]
  recentMatches: Match[]
}

export default function MatchesOverview({ upcomingMatches, recentMatches }: MatchesOverviewProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <UpcomingMatches matches={upcomingMatches} />
      <RecentMatches matches={recentMatches} />
    </div>
  )
}