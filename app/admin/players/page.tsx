"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Users, Search, Eye, Edit, Calendar, MapPin, Mail, Phone, Trophy, Activity, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

// Types
interface Player {
  id: number
  name: string
  email: string
  team: string
  position: string
  status: string
  medicalStatus: string
  age: number
  jerseyNumber: number
  height: string
  preferredFoot: string
  weight: string
  phone: string
  emergencyContact: string
  nationality: string
  league: string
  joinDate: string
  contractExpiry: string
  matchesPlayed: number
  goals: number
  assists: number
  yellowCards: number
  redCards: number
  rating: number
  previousClubs: string[]
  achievements: string[]
  injuries?: any[]
  bio?: string
  minutesPlayed?: number
}

const statusOptions = ["ALL", "Active", "Injured", "Suspended", "Transferred"]

export default function PlayerManagement() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [positionFilter, setPositionFilter] = useState("ALL")
  const [teamFilter, setTeamFilter] = useState("ALL")
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [teams, setTeams] = useState<string[]>([])
  const [positions, setPositions] = useState<string[]>([])

  // Fetch players from API
  const fetchPlayers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (teamFilter !== 'ALL') params.append('team', teamFilter)
      if (positionFilter !== 'ALL') params.append('position', positionFilter)
      if (statusFilter !== 'ALL') params.append('status', statusFilter)

      const response = await fetch(`/api/admin/players?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPlayers(data.players)
        setTeams(data.filters.teams)
        setPositions(data.filters.positions)
      } else {
        console.error('Failed to fetch players')
        toast.error('Failed to load players')
      }
    } catch (error) {
      console.error('Error fetching players:', error)
      toast.error('Failed to load players')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlayers()
  }, [teamFilter, positionFilter, statusFilter])

  const filteredPlayers = players.filter((player) => {
    const matchesSearch =
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.team.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const handleViewDetails = async (player: Player) => {
    try {
      const response = await fetch(`/api/admin/players/${player.id}`)
      if (response.ok) {
        const playerDetails = await response.json()
        setSelectedPlayer(playerDetails)
        setIsDetailDialogOpen(true)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to load player details')
      }
    } catch (error) {
      console.error('Error fetching player details:', error)
      toast.error('Failed to load player details')
    }
  }

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer({ ...player })
    setIsEditDialogOpen(true)
  }

  const handleSavePlayer = async () => {
    if (!editingPlayer) return

    try {
      const response = await fetch(`/api/admin/players/${editingPlayer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jerseyNumber: editingPlayer.jerseyNumber,
          position: editingPlayer.position,
          medicalStatus: editingPlayer.medicalStatus,
        }),
      })

      if (response.ok) {
        await fetchPlayers() // Refresh the list
        setIsEditDialogOpen(false)
        setEditingPlayer(null)
        toast.success('Player updated successfully')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update player')
      }
    } catch (error) {
      console.error('Error updating player:', error)
      toast.error('Failed to update player')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200"
      case "Injured":
        return "bg-red-100 text-red-800 border-red-200"
      case "Suspended":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Transferred":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPositionIcon = (position: string) => {
    switch (position) {
      case "Goalkeeper":
        return "🥅"
      case "Defender":
        return "🛡️"
      case "Midfielder":
        return "⚽"
      case "Forward":
        return "🎯"
      default:
        return "👤"
    }
  }

  const activePlayersCount = players.filter((p) => p.status === "Active").length
  const injuredPlayersCount = players.filter((p) => p.status === "Injured").length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading players...</span>
        </div>
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
              <h1 className="text-3xl font-bold text-foreground">Player Management</h1>
              <p className="text-muted-foreground mt-1">Manage player profiles, statistics, and team assignments</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                {activePlayersCount} Active
              </Badge>
              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                {injuredPlayersCount} Injured
              </Badge>
              <Link href="/admin/dashboard">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters and Search */}
        <Card className="mb-6 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search players by name, email, or team..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Select value={teamFilter} onValueChange={setTeamFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team} value={team}>
                        {team === "ALL" ? "All Teams" : team}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={positionFilter} onValueChange={setPositionFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by position" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((position) => (
                      <SelectItem key={position} value={position}>
                        {position === "ALL" ? "All Positions" : position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status === "ALL" ? "All Statuses" : status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Players Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPlayers.map((player) => (
            <Card key={player.id} className="bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getPositionIcon(player.position)}</div>
                    <div>
                      <CardTitle className="text-lg">{player.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        #{player.jerseyNumber} • {player.position} • Age {player.age}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={getStatusColor(player.status)}>
                    {player.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Trophy className="w-4 h-4 mr-2" />
                      {player.team}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Activity className="w-4 h-4 mr-2" />
                      Rating: {player.rating}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      {player.matchesPlayed} matches
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      {player.goals}G / {player.assists}A
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground mb-2">Medical Status:</p>
                    <Badge
                      variant="outline"
                      className={
                        player.medicalStatus === "Fit"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-red-100 text-red-800 border-red-200"
                      }
                    >
                      {player.medicalStatus}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(player)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>

                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditPlayer(player)}>
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPlayers.length === 0 && !loading && (
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No players found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Player Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <span className="text-2xl">{selectedPlayer && getPositionIcon(selectedPlayer.position)}</span>
              <span>{selectedPlayer?.name} - Player Profile</span>
            </DialogTitle>
          </DialogHeader>
          {selectedPlayer && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant="outline" className={getStatusColor(selectedPlayer.status)}>
                    {selectedPlayer.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Jersey Number</Label>
                  <p className="text-sm">#{selectedPlayer.jerseyNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Age</Label>
                  <p className="text-sm">{selectedPlayer.age} years</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Team</Label>
                  <p className="text-sm">{selectedPlayer.team}</p>
                </div>
              </div>

              {/* Bio */}
              {selectedPlayer.bio && (
                <div>
                  <Label className="text-sm font-medium">Bio</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedPlayer.bio}</p>
                </div>
              )}

              {/* Contact & Physical Info */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Contact Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                      {selectedPlayer.email}
                    </div>
                    {selectedPlayer.phone && (
                      <div className="flex items-center text-sm">
                        <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                        {selectedPlayer.phone}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">Physical Attributes</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Height</Label>
                      <p className="text-sm">{selectedPlayer.height}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Preferred Foot</Label>
                      <p className="text-sm">{selectedPlayer.preferredFoot}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Medical Status</Label>
                      <Badge
                        variant="outline"
                        className={
                          selectedPlayer.medicalStatus === "Fit"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-red-100 text-red-800 border-red-200"
                        }
                      >
                        {selectedPlayer.medicalStatus}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Injuries */}
              {selectedPlayer.injuries && selectedPlayer.injuries.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-medium">Current Injuries</h3>
                  <div className="space-y-2">
                    {selectedPlayer.injuries.map((injury, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div>
                          <div className="font-medium text-sm text-red-800">{injury.injury_type}</div>
                          <div className="text-xs text-red-600">
                            Since: {new Date(injury.injury_date).toLocaleDateString()} • 
                            Severity: {injury.severity}
                            {injury.expected_return && (
                              <> • Expected return: {new Date(injury.expected_return).toLocaleDateString()}</>
                            )}
                          </div>
                        </div>
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Team & Career Info */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Team Information</h3>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-sm font-medium">Current Team</Label>
                      <p className="text-sm">{selectedPlayer.team}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">League</Label>
                      <p className="text-sm">{selectedPlayer.league}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Join Date</Label>
                      <p className="text-sm">{selectedPlayer.joinDate}</p>
                    </div>
                    {selectedPlayer.contractExpiry && selectedPlayer.contractExpiry !== 'Not specified' && (
                      <div>
                        <Label className="text-sm font-medium">Contract Expiry</Label>
                        <p className="text-sm">{selectedPlayer.contractExpiry}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">Performance Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Matches Played</Label>
                      <p className="text-sm font-bold text-blue-600">{selectedPlayer.matchesPlayed}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Goals</Label>
                      <p className="text-sm font-bold text-green-600">{selectedPlayer.goals}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Assists</Label>
                      <p className="text-sm font-bold text-orange-600">{selectedPlayer.assists}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Rating</Label>
                      <p className="text-sm font-bold text-purple-600">{selectedPlayer.rating}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Yellow Cards</Label>
                      <p className="text-sm font-bold text-yellow-600">{selectedPlayer.yellowCards}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Red Cards</Label>
                      <p className="text-sm font-bold text-red-600">{selectedPlayer.redCards}</p>
                    </div>
                    {selectedPlayer.minutesPlayed && (
                      <div className="col-span-2">
                        <Label className="text-sm font-medium">Minutes Played</Label>
                        <p className="text-sm font-bold text-blue-600">{selectedPlayer.minutesPlayed} mins</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Career History */}
              {(selectedPlayer.previousClubs.length > 0 || selectedPlayer.achievements.length > 0) && (
                <div className="space-y-4">
                  <h3 className="font-medium">Career History</h3>
                  {selectedPlayer.previousClubs.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Previous Clubs</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedPlayer.previousClubs.map((club: string, index: number) => (
                          <Badge key={index} variant="outline" className="bg-muted/50">
                            {club}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedPlayer.achievements.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Recent Achievements</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedPlayer.achievements.map((achievement: string, index: number) => (
                          <Badge key={index} variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            {achievement}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Player Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Player: {editingPlayer?.name}</DialogTitle>
          </DialogHeader>
          {editingPlayer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="jerseyNumber">Jersey Number</Label>
                  <Input
                    id="jerseyNumber"
                    type="number"
                    value={editingPlayer.jerseyNumber}
                    onChange={(e) =>
                      setEditingPlayer({ ...editingPlayer, jerseyNumber: Number.parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Select
                    value={editingPlayer.position}
                    onValueChange={(value) => setEditingPlayer({ ...editingPlayer, position: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.filter(p => p !== 'ALL').map((position) => (
                        <SelectItem key={position} value={position}>
                          {position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={editingPlayer.status}
                    onValueChange={(value) => setEditingPlayer({ ...editingPlayer, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Injured">Injured</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                      <SelectItem value="Transferred">Transferred</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="medicalStatus">Medical Status</Label>
                  <Select
                    value={editingPlayer.medicalStatus}
                    onValueChange={(value) => setEditingPlayer({ ...editingPlayer, medicalStatus: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fit">Fit</SelectItem>
                      <SelectItem value="Injured">Injured</SelectItem>
                      <SelectItem value="Recovering">Recovering</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSavePlayer}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
