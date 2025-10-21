"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle } from "lucide-react"

type Match = {
  id: number
  scheduled_at: string
  league_id: number
  created_by: number
  approval_status: string
  approved_by_name: string
  approved_at: string
  home_team_id: number
  home_team: string
  away_team_id: number
  away_team: string
  field_id: number
  field_name: string
  venue_id: number
  venue_name: string
  city: string
  address: string
  capacity: number
  surface: string
}

export default function MatchPage() {
  const searchParams = useSearchParams()
  const matchId = searchParams.get("id")
  const [match, setMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!matchId) return setLoading(false)

    const fetchMatch = async () => {
      try {
        console.log("Match id:", matchId)
        const res = await fetch(`http://localhost:3001/api/player/matches/${matchId}`)
        if (!res.ok) throw new Error("Failed to fetch match details")
        const data = await res.json()
        setMatch(data)
        console.log("Match data:", data)
      } catch (err) {
        console.error("Match fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchMatch()
  }, [matchId])

	return (
	  <div className="max-w-3xl mx-auto px-4 py-8">
		<Card>
		  <CardHeader>
			<CardTitle>Match Details</CardTitle>
		  </CardHeader>
		  <CardContent>
			{loading ? (
			  <p className="text-muted-foreground">Loading...</p>
			) : match ? (
			  <div className="space-y-4">
				<div className="flex justify-between items-center">
				  <h3 className="font-semibold text-lg">
					{match.home_team} vs {match.away_team}
				  </h3>
				  <Badge variant="outline">{match.approval_status}</Badge>
				</div>
				<p className="text-sm text-muted-foreground">
				  Date: {new Date(match.scheduled_at).toLocaleDateString()}
				</p>
				<p className="text-sm text-muted-foreground">
				  Venue: {match.venue_name}, {match.city}
				</p>
				<p className="text-sm text-muted-foreground">
				  Field: {match.field_name}
				</p>
				<p className="text-sm text-muted-foreground">
				  Address: {match.address}
				</p>
				<p className="text-sm text-muted-foreground">
				  Surface: {match.surface}
				</p>
				<p className="text-sm text-muted-foreground">
				  Capacity: {match.capacity}
				</p>
				<p className="text-sm text-muted-foreground">
				  Approved by user: {match.approved_by_name}
				</p>
				<p className="text-sm text-muted-foreground">
				  Approved at: {new Date(match.approved_at).toLocaleString()}
				</p>
			  </div>
			) : (
			  <div className="text-center py-8 text-muted-foreground">
				<AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
				<p>Match not found</p>
			  </div>
			)}
		  </CardContent>
		</Card>
	  </div>
	)
}