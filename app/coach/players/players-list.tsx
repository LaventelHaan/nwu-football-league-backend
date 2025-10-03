"use client"

import { useState } from "react"
import type { Player } from "@/lib/mockData"
import { PlayerCard } from "./player-card"
import { PlayerEditDialog } from "./player-edit-dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Users } from "lucide-react"

interface PlayersListProps {
  players: Player[]
  onUpdatePlayer: (player: Player) => void
}

export function PlayersList({ players, onUpdatePlayer }: PlayersListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [positionFilter, setPositionFilter] = useState("all")
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const filteredPlayers = players.filter((player) => {
    const matchesSearch =
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.position.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPosition = positionFilter === "all" || player.position === positionFilter
    return matchesSearch && matchesPosition
  })

  const handleEditPlayer = (player: Player) => {
    setSelectedPlayer(player)
    setEditDialogOpen(true)
  }

  const handleSavePlayer = (updatedPlayer: Player) => {
    onUpdatePlayer(updatedPlayer)
  }

  const positions = ["Goalkeeper", "Defender", "Midfielder", "Forward"]

  return (
    <div className="space-y-6">
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
            {positions.map((position) => (
              <SelectItem key={position} value={position}>
                {position}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 text-muted-foreground">
        <Users className="w-4 h-4" />
        <span className="text-sm">
          {filteredPlayers.length} of {players.length} players
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPlayers.map((player) => (
          <PlayerCard key={player.id} player={player} onEdit={handleEditPlayer} />
        ))}
      </div>

      {filteredPlayers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No players found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      )}

      <PlayerEditDialog
        player={selectedPlayer}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleSavePlayer}
      />
    </div>
  )
}
