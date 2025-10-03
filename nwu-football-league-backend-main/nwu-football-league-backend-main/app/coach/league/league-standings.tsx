"use client"

import type { LeagueStanding } from "@/types/coach"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, TrendingUp, TrendingDown } from "lucide-react"

interface LeagueStandingsProps {
  standings: LeagueStanding[]
}

export function LeagueStandings({ standings }: LeagueStandingsProps) {
  const nwuPosition = standings.find((team) => team.team === "NWU Eagles")?.position || 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          University League Standings
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={nwuPosition <= 3 ? "default" : "secondary"}>NWU Eagles - Position {nwuPosition}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Pos</th>
                <th className="text-left p-2">Team</th>
                <th className="text-center p-2">P</th>
                <th className="text-center p-2">W</th>
                <th className="text-center p-2">D</th>
                <th className="text-center p-2">L</th>
                <th className="text-center p-2">GF</th>
                <th className="text-center p-2">GA</th>
                <th className="text-center p-2">GD</th>
                <th className="text-center p-2">Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((team) => (
                <tr
                  key={team.team}
                  className={`border-b hover:bg-muted/50 ${
                    team.team === "NWU Eagles" ? "bg-primary/10 font-medium" : ""
                  }`}
                >
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      {team.position}
                      {team.position <= 3 && <Trophy className="w-3 h-3 text-yellow-600" />}
                    </div>
                  </td>
                  <td className="p-2 font-medium">{team.team}</td>
                  <td className="text-center p-2">{team.played}</td>
                  <td className="text-center p-2">{team.won}</td>
                  <td className="text-center p-2">{team.drawn}</td>
                  <td className="text-center p-2">{team.lost}</td>
                  <td className="text-center p-2">{team.goalsFor}</td>
                  <td className="text-center p-2">{team.goalsAgainst}</td>
                  <td className="text-center p-2">
                    <div className="flex items-center justify-center gap-1">
                      {team.goalDifference > 0 && <TrendingUp className="w-3 h-3 text-green-600" />}
                      {team.goalDifference < 0 && <TrendingDown className="w-3 h-3 text-red-600" />}
                      {team.goalDifference}
                    </div>
                  </td>
                  <td className="text-center p-2 font-bold">{team.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
