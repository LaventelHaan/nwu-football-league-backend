"use client"

import type { TeamStats } from "@/lib/mockData"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Users, Target, TrendingUp, AlertTriangle } from "lucide-react"

interface TeamStatsProps {
  stats: TeamStats
}

export function TeamStatsComponent({ stats }: TeamStatsProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Squad Size</CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPlayers}</div>
            <p className="text-xs text-muted-foreground">Active players</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Age</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageAge}</div>
            <p className="text-xs text-muted-foreground">Years old</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <Target className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGoals}</div>
            <p className="text-xs text-muted-foreground">Season total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.winRate}%</div>
            <Progress value={stats.winRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Offensive Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Goals Scored</span>
              <span className="text-2xl font-bold text-green-600">{stats.totalGoals}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Assists</span>
              <span className="text-2xl font-bold text-blue-600">{stats.totalAssists}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Goals per Game</span>
              <span className="text-lg font-semibold">{(stats.totalGoals / 16).toFixed(1)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              Disciplinary Record
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Yellow Cards</span>
              <span className="text-2xl font-bold text-yellow-600">{stats.disciplinaryRecord.yellowCards}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Red Cards</span>
              <span className="text-2xl font-bold text-red-600">{stats.disciplinaryRecord.redCards}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Cards per Game</span>
              <span className="text-lg font-semibold">
                {((stats.disciplinaryRecord.yellowCards + stats.disciplinaryRecord.redCards) / 16).toFixed(1)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
