"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

interface League {
  id: number
  name: string
  description: string | null
  status: "active" | "inactive" | "completed"
  total_teams: number
  total_matches: number
  current_season: string
  champion: string | null
  founded_year: string | null
}

export default function LeaguesManagement() {
  const [leagues, setLeagues] = useState<League[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active" as League["status"],
    totalTeams: "",
    totalMatches: "",
    currentSeason: "2024-2025",
    champion: "",
    foundedYear: "",
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchLeagues()
  }, [])

  const fetchLeagues = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:3002/api/leagues')
      if (!response.ok) {
        throw new Error('Failed to fetch leagues')
      }
      const data = await response.json()
      setLeagues(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateLeague = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    try {
      setSubmitting(true)
      const leagueData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        status: formData.status,
        totalTeams: parseInt(formData.totalTeams) || 0,
        totalMatches: parseInt(formData.totalMatches) || 0,
        currentSeason: formData.currentSeason,
        champion: formData.champion.trim() || null,
        foundedYear: formData.foundedYear.trim() || null,
      }

      const response = await fetch('http://localhost:3002/api/leagues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leagueData),
      })

      if (!response.ok) {
        throw new Error('Failed to create league')
      }

      const newLeague = await response.json()
      setLeagues([...leagues, newLeague.league])
      
      // Reset form and close dialog
      setFormData({
        name: "",
        description: "",
        status: "active",
        totalTeams: "",
        totalMatches: "",
        currentSeason: "2024-2025",
        champion: "",
        foundedYear: "",
      })
      setIsCreateDialogOpen(false)
    } catch (err) {
      console.error('Error creating league:', err)
      setError(err instanceof Error ? err.message : 'Failed to create league')
    } finally {
      setSubmitting(false)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading leagues...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <Button onClick={fetchLeagues}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
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
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New League</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateLeague} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">League Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter league name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value: League["status"]) => setFormData({ ...formData, status: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter league description"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="totalTeams">Total Teams</Label>
                        <Input
                          id="totalTeams"
                          type="number"
                          value={formData.totalTeams}
                          onChange={(e) => setFormData({ ...formData, totalTeams: e.target.value })}
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="totalMatches">Total Matches</Label>
                        <Input
                          id="totalMatches"
                          type="number"
                          value={formData.totalMatches}
                          onChange={(e) => setFormData({ ...formData, totalMatches: e.target.value })}
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="currentSeason">Current Season</Label>
                        <Input
                          id="currentSeason"
                          value={formData.currentSeason}
                          onChange={(e) => setFormData({ ...formData, currentSeason: e.target.value })}
                          placeholder="2024-2025"
                        />
                      </div>
                      <div>
                        <Label htmlFor="foundedYear">Founded Year</Label>
                        <Input
                          id="foundedYear"
                          value={formData.foundedYear}
                          onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })}
                          placeholder="2020"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="champion">Current Champion</Label>
                      <Input
                        id="champion"
                        value={formData.champion}
                        onChange={(e) => setFormData({ ...formData, champion: e.target.value })}
                        placeholder="Enter champion team name"
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button type="submit" disabled={submitting} className="flex-1">
                        {submitting ? "Creating..." : "Create League"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsCreateDialogOpen(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <Link href="/admin/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
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
                      <p className="text-sm text-muted-foreground">{league.description || 'No description available'}</p>
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
                    <span className="font-medium">{league.champion || 'TBD'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-1">
                    <span className="text-muted-foreground">Founded:</span>
                    <span className="font-medium">{league.founded_year || 'N/A'}</span>
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
