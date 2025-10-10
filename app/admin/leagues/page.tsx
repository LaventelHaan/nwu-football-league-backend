"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Trophy,
  Calendar,
  Users,
  TrendingUp,
  Eye,
  Plus,
} from "lucide-react"
import Link from "next/link"

// League data - can be made dynamic later
const leagues = [
  {
    id: 1,
    name: "Premier League",
    description: "Top tier professional football league",
    status: "active",
    totalTeams: 16,
    totalMatches: 240,
    currentSeason: "2024-2025",
    champion: "NWU Eagles",
    founded: "2018",
  },
  {
    id: 2,
    name: "Championship Division",
    description: "Second tier competitive league",
    status: "active",
    totalTeams: 12,
    totalMatches: 132,
    currentSeason: "2024-2025",
    champion: "UP Tuks",
    founded: "2019",
  },
  {
    id: 3,
    name: "Women's Premier League",
    description: "Elite women's football competition",
    status: "active",
    totalTeams: 8,
    totalMatches: 56,
    currentSeason: "2024-2025",
    champion: "UJ Orange",
    founded: "2020",
  },
]

export default function LeaguesManagement() {
  const [selectedLeague, setSelectedLeague] = useState<any>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">League Management</h1>
              <p className="text-muted-foreground mt-1">Manage and oversee all sports leagues</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {leagues.length} Active Leagues
              </Badge>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create League
              </Button>
              <Link href="/admin/dashboard">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Leagues Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {leagues.map((league) => (
            <Card key={league.id} className="bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/15 backdrop-blur-sm rounded-lg p-2">
                      <Trophy className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{league.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{league.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={getStatusColor(league.status)}>
                    {league.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>{league.totalTeams} Teams</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>{league.totalMatches} Matches</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-muted/30">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Current Season:</span>
                    <span className="font-medium">{league.currentSeason}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-1">
                    <span className="text-muted-foreground">Champion:</span>
                    <span className="font-medium">{league.champion}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-1">
                    <span className="text-muted-foreground">Founded:</span>
                    <span className="font-medium">{league.founded}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Statistics
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {leagues.length === 0 && (
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No leagues found</h3>
              <p className="text-muted-foreground">Create your first league to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
