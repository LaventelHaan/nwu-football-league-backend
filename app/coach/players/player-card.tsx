"use client"

import type { Player } from "@/lib/mockData"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Phone, Mail, AlertTriangle } from "lucide-react"

interface PlayerCardProps {
  player: Player
  onEdit: (player: Player) => void
}

export function PlayerCard({ player, onEdit }: PlayerCardProps) {
  const getPositionColor = (position: string) => {
    switch (position.toLowerCase()) {
      case "goalkeeper":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "defender":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "midfielder":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "forward":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg">
              {player.jerseyNumber}
            </div>
            <div>
              <CardTitle className="text-lg">{player.name}</CardTitle>
              <Badge className={getPositionColor(player.position)}>{player.position}</Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(player)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Age:</span>
            <span className="ml-2 font-medium">{player.age}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Height:</span>
            <span className="ml-2 font-medium">{player.height}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Weight:</span>
            <span className="ml-2 font-medium">{player.weight}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Games:</span>
            <span className="ml-2 font-medium">{player.gamesPlayed}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Goals:</span>
            <span className="font-medium text-green-600">{player.goals}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Assists:</span>
            <span className="font-medium text-blue-600">{player.assists}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Cards:</span>
            <span className="font-medium text-yellow-600">{player.yellowCards}</span>
            <span className="font-medium text-red-600">/{player.redCards}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t">
          <Button variant="ghost" size="sm" className="flex-1">
            <Phone className="w-4 h-4 mr-2" />
            Call
          </Button>
          <Button variant="ghost" size="sm" className="flex-1">
            <Mail className="w-4 h-4 mr-2" />
            Email
          </Button>
          {player.medicalNotes && (
            <Button variant="ghost" size="sm">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
