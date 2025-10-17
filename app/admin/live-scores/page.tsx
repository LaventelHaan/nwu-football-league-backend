"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Zap, Clock, MapPin, Plus, Minus, RefreshCw, Play, Square, ArrowLeft, RotateCcw } from "lucide-react"

const mockFixtures = [
  {
    id: 1,
    homeTeam: "NWU Eagles",
    awayTeam: "UP Tuks",
    date: "2025-01-08", // Today's date
    time: "14:00", // Set to earlier time so it's likely live now
    venue: "NWU Stadium",
    status: "scheduled",
    duration: 90,
  },
  {
    id: 2,
    homeTeam: "Wits Wolves",
    awayTeam: "UCT Lions",
    date: "2025-01-08", // Today's date
    time: "16:00", // Current afternoon time
    venue: "Wits Stadium",
    status: "scheduled",
    duration: 90,
  },
  {
    id: 3,
    homeTeam: "UJ Orange",
    awayTeam: "Stellenbosch FC",
    date: "2025-01-09", // Tomorrow
    time: "14:00",
    venue: "UJ Stadium",
    status: "scheduled",
    duration: 90,
  },
]

const getAutomaticLiveMatches = (fixtures) => {
  const now = new Date()
  const currentTime = now.getTime()

  console.log("[v0] Admin: Current time:", now.toLocaleString())

  return fixtures
    .map((fixture) => {
      const fixtureDateTime = new Date(`${fixture.date}T${fixture.time}:00`)
      const fixtureEndTime = new Date(fixtureDateTime.getTime() + fixture.duration * 60 * 1000)

      const fixtureStartTime = fixtureDateTime.getTime()
      const fixtureEndTimeMs = fixtureEndTime.getTime()

      console.log(`[v0] Admin: Checking fixture ${fixture.homeTeam} vs ${fixture.awayTeam}:`)
      console.log(`[v0] Admin: - Start: ${fixtureDateTime.toLocaleString()}`)
      console.log(`[v0] Admin: - End: ${fixtureEndTime.toLocaleString()}`)
      console.log(`[v0] Admin: - Is Live: ${currentTime >= fixtureStartTime && currentTime <= fixtureEndTimeMs}`)

      if (currentTime >= fixtureStartTime && currentTime <= fixtureEndTimeMs) {
        const elapsedMinutes = Math.floor((currentTime - fixtureStartTime) / (1000 * 60))

        return {
          ...fixture,
          homeScore: 0,
          awayScore: 0,
          minute: Math.min(elapsedMinutes, fixture.duration),
          status: "live",
          isAutomatic: true,
          events: {
            corners: { home: 0, away: 0 },
            yellowCards: { home: 0, away: 0 },
            redCards: { home: 0, away: 0 },
          },
          recentEvents: [],
        }
      }

      return null
    })
    .filter(Boolean)
}

export default function AdminLiveScoresPage() {
  const [automaticMatches, setAutomaticMatches] = useState([])
  const [manualMatches, setManualMatches] = useState([])
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({
    type: "",
    team: "",
    player: "",
    minute: "",
    description: "",
  })

  useEffect(() => {
    const updateAutomaticMatches = () => {
      const currentLiveMatches = getAutomaticLiveMatches(mockFixtures)
      setAutomaticMatches(currentLiveMatches)
      console.log("[v0] Admin: Updated automatic live matches:", currentLiveMatches.length)
    }

    updateAutomaticMatches()
    const interval = setInterval(updateAutomaticMatches, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  const allMatches = [...automaticMatches, ...manualMatches]

  const startManualMatch = () => {
    const newMatch = {
      id: Date.now(),
      homeTeam: "Team A",
      awayTeam: "Team B",
      homeScore: 0,
      awayScore: 0,
      minute: 0,
      status: "live",
      venue: "Manual Stadium",
      isAutomatic: false,
      events: {
        corners: { home: 0, away: 0 },
        yellowCards: { home: 0, away: 0 },
        redCards: { home: 0, away: 0 },
      },
      recentEvents: [],
    }
    setManualMatches([...manualMatches, newMatch])
  }

  const endMatch = (matchId) => {
    if (automaticMatches.find((m) => m.id === matchId)) {
      // For automatic matches, just mark as finished - they'll be removed by the automatic system
      setAutomaticMatches(
        automaticMatches.map((match) => (match.id === matchId ? { ...match, status: "finished" } : match)),
      )
    } else {
      // For manual matches, remove them completely
      setManualMatches(manualMatches.filter((match) => match.id !== matchId))
    }
  }

  const updateScore = (matchId, team, increment) => {
    const updateMatches = (matches) =>
      matches.map((match) => {
        if (match.id === matchId) {
          const newScore = Math.max(0, match[`${team}Score`] + increment)
          return { ...match, [`${team}Score`]: newScore }
        }
        return match
      })

    setAutomaticMatches(updateMatches(automaticMatches))
    setManualMatches(updateMatches(manualMatches))
  }

  const updateMatchTime = (matchId, newMinute) => {
    const updateMatches = (matches) =>
      matches.map((match) => {
        if (match.id === matchId) {
          return { ...match, minute: Math.max(0, Math.min(120, newMinute)) }
        }
        return match
      })

    setAutomaticMatches(updateMatches(automaticMatches))
    setManualMatches(updateMatches(manualMatches))
  }

  const updateMatchStatus = (matchId, newStatus) => {
    const updateMatches = (matches) =>
      matches.map((match) => {
        if (match.id === matchId) {
          return { ...match, status: newStatus }
        }
        return match
      })

    setAutomaticMatches(updateMatches(automaticMatches))
    setManualMatches(updateMatches(manualMatches))
  }

  const updateEvent = (matchId, eventType, team, increment) => {
    const updateMatches = (matches) =>
      matches.map((match) => {
        if (match.id === matchId) {
          const currentValue = match.events[eventType][team]
          const newValue = Math.max(0, currentValue + increment)
          return {
            ...match,
            events: {
              ...match.events,
              [eventType]: {
                ...match.events[eventType],
                [team]: newValue,
              },
            },
          }
        }
        return match
      })

    setAutomaticMatches(updateMatches(automaticMatches))
    setManualMatches(updateMatches(manualMatches))
  }

  const addMatchEvent = (matchId) => {
    if (!newEvent.type || !newEvent.team || !newEvent.minute) return

    const updateMatches = (matches) =>
      matches.map((match) => {
        if (match.id === matchId) {
          const event = {
            minute: Number.parseInt(newEvent.minute),
            type: newEvent.type,
            team: newEvent.team,
            player: newEvent.player,
            description: newEvent.description,
          }
          return {
            ...match,
            recentEvents: [event, ...match.recentEvents].slice(0, 10),
          }
        }
        return match
      })

    setAutomaticMatches(updateMatches(automaticMatches))
    setManualMatches(updateMatches(manualMatches))

    setNewEvent({ type: "", team: "", player: "", minute: "", description: "" })
    setIsEventDialogOpen(false)
  }

  const resetMatch = (matchId) => {
    const updateMatches = (matches) =>
      matches.map((match) => {
        if (match.id === matchId) {
          return {
            ...match,
            homeScore: 0,
            awayScore: 0,
            events: {
              corners: { home: 0, away: 0 },
              yellowCards: { home: 0, away: 0 },
              redCards: { home: 0, away: 0 },
            },
            recentEvents: [],
            ...(match.isAutomatic ? {} : { minute: 0 }),
          }
        }
        return match
      })

    setAutomaticMatches(updateMatches(automaticMatches))
    setManualMatches(updateMatches(manualMatches))
  }

  const goBackToDashboard = () => {
    window.location.href = "/admin/dashboard"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={goBackToDashboard} className="font-semibold bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="bg-red-500/15 backdrop-blur-sm rounded-lg p-3 animate-pulse">
                <Zap className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-foreground">Live Score Management</h1>
                <p className="text-muted-foreground text-lg">
                  {allMatches.length} active match{allMatches.length !== 1 ? "es" : ""} • Auto-sync with fixture
                  schedule
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={startManualMatch} className="font-semibold">
                <Play className="w-4 h-4 mr-2" />
                Start Manual Match
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()} className="font-semibold">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="destructive" className="animate-pulse font-semibold text-lg px-4 py-2">
              ADMIN CONTROL PANEL
            </Badge>
            <Badge variant="outline" className="font-semibold px-3 py-1">
              {automaticMatches.length} Auto
            </Badge>
            <Badge variant="secondary" className="font-semibold px-3 py-1">
              {manualMatches.length} Manual
            </Badge>
          </div>
        </div>

        {allMatches.length === 0 && (
          <Card className="shadow-xl border-2 border-muted/20 bg-gradient-to-br from-background/95 via-muted/10 to-background/95 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="bg-muted/20 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Clock className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-3">No Live Matches</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                No matches are currently scheduled to be live. Matches will automatically appear here when their
                scheduled time arrives, or you can start a manual match.
              </p>
              <Button onClick={startManualMatch} size="lg" className="font-semibold">
                <Play className="w-5 h-5 mr-2" />
                Start Manual Match
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {allMatches.map((match) => (
            <Card
              key={match.id}
              className="shadow-xl border-2 border-red-500/20 bg-gradient-to-br from-background/95 via-red-50/10 to-background/95 backdrop-blur-sm relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-red-400 to-red-500 animate-pulse"></div>

              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="font-bold text-red-500">LIVE</span>
                    <Badge variant={match.isAutomatic ? "default" : "secondary"} className="text-xs">
                      {match.isAutomatic ? "AUTO" : "MANUAL"}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" onClick={() => updateMatchTime(match.id, match.minute - 1)}>
                        <Minus className="w-4 h-4" />
                      </Button>
                      <div className="flex items-center space-x-2 text-muted-foreground min-w-[80px] justify-center">
                        <Clock className="w-4 h-4" />
                        <span className="font-semibold text-lg">{match.minute}'</span>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => updateMatchTime(match.id, match.minute + 1)}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <Select value={match.status} onValueChange={(value) => updateMatchStatus(match.id, value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="live">Live</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="finished">Finished</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resetMatch(match.id)}
                      title="Reset scores and events"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => endMatch(match.id)}>
                      <Square className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Score Management */}
                <div className="bg-gradient-to-r from-muted/20 via-muted/10 to-muted/20 border border-muted/30 rounded-xl p-6 backdrop-blur-sm">
                  <div className="flex justify-between items-center">
                    <div className="text-center flex-1">
                      <div className="font-bold text-lg mb-2">{match.homeTeam}</div>
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <Button size="sm" variant="outline" onClick={() => updateScore(match.id, "home", -1)}>
                          <Minus className="w-4 h-4" />
                        </Button>
                        <div className="text-4xl font-black text-primary min-w-[60px]">{match.homeScore}</div>
                        <Button size="sm" variant="outline" onClick={() => updateScore(match.id, "home", 1)}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-muted-foreground font-bold text-2xl mx-6">-</div>
                    <div className="text-center flex-1">
                      <div className="font-bold text-lg mb-2">{match.awayTeam}</div>
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <Button size="sm" variant="outline" onClick={() => updateScore(match.id, "away", -1)}>
                          <Minus className="w-4 h-4" />
                        </Button>
                        <div className="text-4xl font-black text-primary min-w-[60px]">{match.awayScore}</div>
                        <Button size="sm" variant="outline" onClick={() => updateScore(match.id, "away", 1)}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Event Management */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Corners */}
                  <div className="bg-background/60 backdrop-blur-sm rounded-lg p-4 border border-muted/20">
                    <div className="text-sm text-muted-foreground mb-2 text-center">Corners</div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Button size="sm" variant="ghost" onClick={() => updateEvent(match.id, "corners", "home", -1)}>
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="font-bold text-lg min-w-[20px] text-center">{match.events.corners.home}</span>
                        <Button size="sm" variant="ghost" onClick={() => updateEvent(match.id, "corners", "home", 1)}>
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <span className="text-muted-foreground">-</span>
                      <div className="flex items-center space-x-1">
                        <Button size="sm" variant="ghost" onClick={() => updateEvent(match.id, "corners", "away", -1)}>
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="font-bold text-lg min-w-[20px] text-center">{match.events.corners.away}</span>
                        <Button size="sm" variant="ghost" onClick={() => updateEvent(match.id, "corners", "away", 1)}>
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Yellow Cards */}
                  <div className="bg-background/60 backdrop-blur-sm rounded-lg p-4 border border-muted/20">
                    <div className="text-sm text-muted-foreground mb-2 text-center">Yellow Cards</div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateEvent(match.id, "yellowCards", "home", -1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="font-bold text-lg text-yellow-500 min-w-[20px] text-center">
                          {match.events.yellowCards.home}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateEvent(match.id, "yellowCards", "home", 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <span className="text-muted-foreground">-</span>
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateEvent(match.id, "yellowCards", "away", -1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="font-bold text-lg text-yellow-500 min-w-[20px] text-center">
                          {match.events.yellowCards.away}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateEvent(match.id, "yellowCards", "away", 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Red Cards */}
                  <div className="bg-background/60 backdrop-blur-sm rounded-lg p-4 border border-muted/20">
                    <div className="text-sm text-muted-foreground mb-2 text-center">Red Cards</div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Button size="sm" variant="ghost" onClick={() => updateEvent(match.id, "redCards", "home", -1)}>
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="font-bold text-lg text-red-500 min-w-[20px] text-center">
                          {match.events.redCards.home}
                        </span>
                        <Button size="sm" variant="ghost" onClick={() => updateEvent(match.id, "redCards", "home", 1)}>
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <span className="text-muted-foreground">-</span>
                      <div className="flex items-center space-x-1">
                        <Button size="sm" variant="ghost" onClick={() => updateEvent(match.id, "redCards", "away", -1)}>
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="font-bold text-lg text-red-500 min-w-[20px] text-center">
                          {match.events.redCards.away}
                        </span>
                        <Button size="sm" variant="ghost" onClick={() => updateEvent(match.id, "redCards", "away", 1)}>
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add Event Button */}
                <div className="flex justify-between items-center">
                  <div className="text-center text-muted-foreground font-medium">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    {match.venue}
                  </div>
                  <Dialog open={isEventDialogOpen && selectedMatch === match.id} onOpenChange={setIsEventDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" onClick={() => setSelectedMatch(match.id)} className="font-semibold">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Event
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add Match Event</DialogTitle>
                        <DialogDescription>Add a new event to the match timeline.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="event-type" className="text-right">
                            Type
                          </Label>
                          <Select
                            value={newEvent.type}
                            onValueChange={(value) => setNewEvent({ ...newEvent, type: value })}
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select event type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="goal">Goal</SelectItem>
                              <SelectItem value="yellow">Yellow Card</SelectItem>
                              <SelectItem value="red">Red Card</SelectItem>
                              <SelectItem value="substitution">Substitution</SelectItem>
                              <SelectItem value="corner">Corner</SelectItem>
                              <SelectItem value="offside">Offside</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="team" className="text-right">
                            Team
                          </Label>
                          <Select
                            value={newEvent.team}
                            onValueChange={(value) => setNewEvent({ ...newEvent, team: value })}
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select team" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="home">Home ({match.homeTeam})</SelectItem>
                              <SelectItem value="away">Away ({match.awayTeam})</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="minute" className="text-right">
                            Minute
                          </Label>
                          <Input
                            id="minute"
                            type="number"
                            value={newEvent.minute}
                            onChange={(e) => setNewEvent({ ...newEvent, minute: e.target.value })}
                            className="col-span-3"
                            placeholder="Match minute"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="player" className="text-right">
                            Player
                          </Label>
                          <Input
                            id="player"
                            value={newEvent.player}
                            onChange={(e) => setNewEvent({ ...newEvent, player: e.target.value })}
                            className="col-span-3"
                            placeholder="Player name (optional)"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="description" className="text-right">
                            Notes
                          </Label>
                          <Textarea
                            id="description"
                            value={newEvent.description}
                            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                            className="col-span-3"
                            placeholder="Additional notes (optional)"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={() => addMatchEvent(match.id)}>Add Event</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Recent Events */}
                {match.recentEvents.length > 0 && (
                  <div className="bg-background/40 backdrop-blur-sm rounded-lg p-4 border border-muted/20">
                    <h4 className="font-semibold mb-3">Recent Events</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {match.recentEvents.slice(0, 5).map((event, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {event.minute}'
                            </Badge>
                            <span className="capitalize font-medium">{event.type}</span>
                            {event.player && <span className="text-muted-foreground">- {event.player}</span>}
                          </div>
                          <Badge variant={event.team === "home" ? "default" : "secondary"} className="text-xs">
                            {event.team === "home" ? match.homeTeam : match.awayTeam}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
