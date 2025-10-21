"use client"

import { useState, useEffect } from "react"
import { PlayerCard } from "@/app/coach/players/player-card"
import { PlayerEditDialog } from "@/app/coach/players/player-edit-dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Users } from "lucide-react"
import type { Player } from "@/lib/mockData"

interface PlayersListProps {
  players: Player[]
  onUpdatePlayer: (player: Player) => void
}

export function PlayersList({ players, onUpdatePlayer }: PlayersListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [positionFilter, setPositionFilter] = useState("all")
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [coachTeam, setCoachTeam] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Get coach team from localStorage (currentUser)
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      const user = JSON.parse(storedUser)
      if (user.role === "coach" && typeof user.team === "string") {
        setCoachTeam(user.team)
      }
    }
    setLoading(false)
  }, [])

  // Show loading while coachTeam is being determined
  if (loading) {
    return <div className="text-center py-12">Loading your team...</div>
  }

  // Filter players to only the coach's team
  const teamPlayers = coachTeam
    ? players.filter(player => player.team === coachTeam)
    : []

  // Apply search and position filter
  const filteredPlayers = teamPlayers.filter(player => {
    const matchesSearch =
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.position.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPosition = positionFilter === "all" || player.position === positionFilter
    return matchesSearch && matchesPosition
  })

  const handleEditPlayer = (player: Player) => {
    if (player.team !== coachTeam) return
    setSelectedPlayer(player)
    setEditDialogOpen(true)
  }

  const handleSavePlayer = (updatedPlayer: Player) => {
    if (updatedPlayer.team !== coachTeam) return
    onUpdatePlayer(updatedPlayer)
    setEditDialogOpen(false)
    setSelectedPlayer(null)
  }

  const positions = ["Goalkeeper", "Defender", "Midfielder", "Forward"]

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={positionFilter} onValueChange={setPositionFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Positions</SelectItem>
            {positions.map(position => (
              <SelectItem key={position} value={position}>{position}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Count */}
      <div className="flex items-center gap-2 text-muted-foreground">
        <Users className="w-4 h-4" />
        <span className="text-sm">
          {filteredPlayers.length} of {teamPlayers.length} players
        </span>
      </div>

      {/* Player Cards */}
      {filteredPlayers.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPlayers.map(player => (
            <PlayerCard key={player.id} player={player} onEdit={handleEditPlayer} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No players found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  )
}
