"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Search, Trophy, Target, Calendar, MapPin } from "lucide-react"
import Link from "next/link"

// Import centralized mock data
import { mockPlayers } from "@/lib/mockData"  // <- path to your centralized mock data file



const getPositionColor = (position: string) => {
  switch (position.toLowerCase()) {
    case "forward":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    case "midfielder":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    case "defender":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    case "goalkeeper":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }
}

export default function PlayersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTeam, setSelectedTeam] = useState("all")
  const [selectedPosition, setSelectedPosition] = useState("all")
  const [isClient, setIsClient] = useState(false)

  const filteredPlayers = mockPlayers.filter((player) => {
    const matchesSearch =
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.team.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTeam = selectedTeam === "all" || player.team === selectedTeam
    const matchesPosition =
      selectedPosition === "all" || player.position.toLowerCase() === selectedPosition.toLowerCase()

    return matchesSearch && matchesTeam && matchesPosition
  })

  const teams = [...new Set(mockPlayers.map((player) => player.team))]
  const positions = [...new Set(mockPlayers.map((player) => player.position))]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/home">
                <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/20">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-black">NWU</div>
                <div>
                  <h1 className="text-2xl font-bold">Player Profiles</h1>
                  <p className="text-primary-foreground/80">2024 University Sports League</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="w-6 h-6" />
              <span className="font-semibold">{mockPlayers.length} Players</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search players or teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Teams" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team} value={team}>
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedPosition} onValueChange={setSelectedPosition}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Positions" />
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
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlayers.map((player) => (
            <Card key={player.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={player.avatar || "/placeholder.svg"} alt={player.name} />
                    <AvatarFallback className="text-lg font-bold">
                      {player.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{player.name}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getPositionColor(player.position)}>{player.position}</Badge>
                      <span className="text-sm text-muted-foreground">Age {player.age}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Team Info */}
                <div className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{player.team}</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{player.goals}</div>
                    <div className="text-xs text-muted-foreground">Goals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{player.assists}</div>
                    <div className="text-xs text-muted-foreground">Assists</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{player.appearances}</div>
                    <div className="text-xs text-muted-foreground">Apps</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {player.position === "Goalkeeper" ? player.cleanSheets : player.yellowCards}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {player.position === "Goalkeeper" ? "Clean Sheets" : "Yellow Cards"}
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">{player.nationality}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Joined {player.joinDate}

                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href={`/players/${player.id}`}>View Full Profile</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredPlayers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">No players found matching your criteria</div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setSelectedTeam("all")
                setSelectedPosition("all")
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Top Performers */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Top Scorer</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={mockPlayers[0].avatar || "/placeholder.svg"} />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{mockPlayers[0].name}</div>
                  <div className="text-sm text-muted-foreground">{mockPlayers[0].team}</div>
                  <div className="text-lg font-bold text-primary">{mockPlayers[0].goals} goals</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="w-5 h-5" />
                <span>Most Assists</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={mockPlayers[5].avatar || "/placeholder.svg"} />
                  <AvatarFallback>KD</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{mockPlayers[5].name}</div>
                  <div className="text-sm text-muted-foreground">{mockPlayers[5].team}</div>
                  <div className="text-lg font-bold text-primary">{mockPlayers[5].assists} assists</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Most Appearances</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={mockPlayers[1].avatar || "/placeholder.svg"} />
                  <AvatarFallback>MS</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{mockPlayers[1].name}</div>
                  <div className="text-sm text-muted-foreground">{mockPlayers[1].team}</div>
                  <div className="text-lg font-bold text-primary">{mockPlayers[1].appearances} apps</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
