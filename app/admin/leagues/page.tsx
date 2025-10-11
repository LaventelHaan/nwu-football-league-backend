"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  const [leagues, setLeagues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newLeague, setNewLeague] = useState({
    name: "",
    description: "",
    status: "active",
    total_teams: 0,
    total_matches: 0,
    current_season: "",
    champion: "",
    founded: "",
  })

  useEffect(() => {
    fetchLeagues()
  }, [])

  const fetchLeagues = async () => {
    try {
      const response = await fetch('/api/leagues')
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched leagues:', data)
        setLeagues(data)
      } else {
        console.error('Failed to fetch leagues:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching leagues:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateLeague = async () => {
    if (!newLeague.name.trim()) {
      alert('League name is required')
      return
    }

    console.log('Creating league with data:', newLeague)

    try {
      const response = await fetch('/api/leagues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLeague),
      })

      console.log('API response status:', response.status)

      if (response.ok) {
        const result = await response.json()
        console.log('League created successfully:', result)
        setIsCreateDialogOpen(false)
        setNewLeague({
          name: "",
          description: "",
          status: "active",
          total_teams: 0,
          total_matches: 0,
          current_season: "",
          champion: "",
          founded: "",
        })
        fetchLeagues() // Refresh the list
      } else {
        const error = await response.json()
        console.error('Error response:', error)
        alert(error.error || 'Error creating league')
      }
    } catch (error) {
      console.error('Error creating league:', error)
      alert('Error creating league')
    }
  }

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
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create League
              </Button>

              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New League</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="leagueName">League Name</Label>
                      <Input
                        id="leagueName"
                        placeholder="Enter league name"
                        value={newLeague.name}
                        onChange={(e) => setNewLeague({ ...newLeague, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="leagueDescription">Description</Label>
                      <Textarea
                        id="leagueDescription"
                        placeholder="Enter league description"
                        value={newLeague.description}
                        onChange={(e) => setNewLeague({ ...newLeague, description: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="currentSeason">Current Season</Label>
                      <Input
                        id="currentSeason"
                        placeholder="e.g., 2024-2025"
                        value={newLeague.current_season}
                        onChange={(e) => setNewLeague({ ...newLeague, current_season: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="champion">Champion</Label>
                      <Input
                        id="champion"
                        placeholder="Enter champion name"
                        value={newLeague.champion}
                        onChange={(e) => setNewLeague({ ...newLeague, champion: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="founded">Founded Year</Label>
                      <Input
                        id="founded"
                        placeholder="e.g., 2018"
                        value={newLeague.founded}
                        onChange={(e) => setNewLeague({ ...newLeague, founded: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={newLeague.status} onValueChange={(value) => setNewLeague({ ...newLeague, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateLeague}>
                        Create League
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
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
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary/15 backdrop-blur-sm rounded-lg p-2">
                        <Trophy className="w-6 h-6 text-primary animate-pulse" />
                      </div>
                      <div>
                        <div className="h-5 bg-muted rounded w-32 animate-pulse"></div>
                        <div className="h-4 bg-muted rounded w-48 mt-1 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="h-6 bg-muted rounded w-16 animate-pulse"></div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : leagues.length === 0 ? (
            <div className="col-span-full">
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="text-center py-12">
                  <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No leagues found</h3>
                  <p className="text-muted-foreground">Create your first league to get started.</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            leagues.map((league) => (
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
                      <span>{league.total_teams} Teams</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>{league.total_matches} Matches</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-muted/30">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Current Season:</span>
                      <span className="font-medium">{league.current_season}</span>
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
            ))
          )}
        </div>
      </div>
    </div>
  )
}
