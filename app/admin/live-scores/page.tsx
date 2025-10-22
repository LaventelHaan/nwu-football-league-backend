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

interface LiveMatch {
  id: number
  fixtureId?: number
  matchId?: number
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  minute: number
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'FINAL' | 'POSTPONED' | 'CANCELLED'
  venue: string
  duration: number
  isAutomatic: boolean
  events: {
    corners: { home: number; away: number }
    yellowCards: { home: number; away: number }
    redCards: { home: number; away: number }
  }
  recentEvents: any[]
  homeTeamId?: number
  awayTeamId?: number
  scheduledAt: string
  canStart: boolean
  isLive: boolean
}

interface Player {
  id: number
  name: string
  jerseyNumber?: number
  position?: string
}

interface EventType {
  event_key: string
  description: string
}

export default function AdminLiveScoresPage() {
  const [matches, setMatches] = useState<LiveMatch[]>([])
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null)
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [isManualMatchDialogOpen, setIsManualMatchDialogOpen] = useState(false)
  const [players, setPlayers] = useState<{home: Player[], away: Player[]}>({home: [], away: []})
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [newEvent, setNewEvent] = useState({
    type: "",
    team: "",
    playerId: "",
    playerName: "",
    minute: "",
    description: "",
  })
  const [newManualMatch, setNewManualMatch] = useState({
    homeTeam: "",
    awayTeam: "",
    venue: "",
  })
  const [loading, setLoading] = useState(true)

  // API functions
  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/live-matches')
      if (!response.ok) throw new Error('Failed to fetch matches')
      const data = await response.json()
      setMatches(data)
    } catch (error) {
      console.error('Error fetching matches:', error)
      alert('Failed to load matches')
    } finally {
      setLoading(false)
    }
  }

  const fetchEventTypes = async () => {
    try {
      const response = await fetch('/api/live-matches/event-types')
      if (!response.ok) throw new Error('Failed to fetch event types')
      const data = await response.json()
      setEventTypes(data)
    } catch (error) {
      console.error('Error fetching event types:', error)
    }
  }

  const fetchPlayers = async (teamId: number) => {
    try {
      const response = await fetch(`/api/live-matches/players?teamId=${teamId}`)
      if (!response.ok) throw new Error('Failed to fetch players')
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching players:', error)
      return []
    }
  }

  const updateMatchData = async (action: string, matchId: number, data?: any, fixtureId?: number) => {
    try {
      const response = await fetch('/api/live-matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, matchId, fixtureId, data })
      })
      
      if (!response.ok) throw new Error('Operation failed')
      await fetchMatches() // Refresh data
    } catch (error) {
      console.error('Error updating match:', error)
      alert('Operation failed')
    }
  }

  const startMatch = async (fixtureId: number) => {
    try {
      await updateMatchData('startMatch', 0, undefined, fixtureId)
    } catch (error) {
      console.error('Error starting match:', error)
      alert('Failed to start match')
    }
  }

  const startManualMatch = async () => {
    if (!newManualMatch.homeTeam || !newManualMatch.awayTeam || !newManualMatch.venue) {
      alert("Please fill in all fields")
      return
    }

    try {
      const response = await fetch('/api/live-matches/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newManualMatch)
      })
      
      if (!response.ok) throw new Error('Failed to start match')
      
      setNewManualMatch({ homeTeam: "", awayTeam: "", venue: "" })
      setIsManualMatchDialogOpen(false)
      await fetchMatches() // Refresh data
    } catch (error) {
      console.error('Error starting manual match:', error)
      alert('Failed to start match')
    }
  }

  // Match operations
  const endMatch = async (matchId: number) => {
    await updateMatchData('endMatch', matchId)
  }

  const updateScore = async (matchId: number, team: 'home' | 'away', increment: number) => {
    const match = matches.find(m => m.matchId === matchId)
    if (!match) return

    const newHomeScore = team === 'home' 
      ? Math.max(0, match.homeScore + increment)
      : match.homeScore
        
    const newAwayScore = team === 'away' 
      ? Math.max(0, match.awayScore + increment)
      : match.awayScore

    await updateMatchData('updateScore', matchId, { homeScore: newHomeScore, awayScore: newAwayScore })
  }

  const updateMatchTime = async (matchId: number, newMinute: number) => {
    // Time tracking not implemented in current schema
    console.log('Update match time:', matchId, newMinute)
  }

  const updateMatchStatus = async (matchId: number, newStatus: string) => {
    await updateMatchData('updateStatus', matchId, { status: newStatus })
  }

  const updateEvent = async (matchId: number, eventType: 'corners' | 'yellowCards' | 'redCards', team: 'home' | 'away', increment: number) => {
    const match = matches.find(m => m.matchId === matchId)
    if (!match) return

    const currentHomeValue = match.events[eventType].home
    const currentAwayValue = match.events[eventType].away

    const newHomeValue = team === 'home' 
      ? Math.max(0, currentHomeValue + increment)
      : currentHomeValue
      
    const newAwayValue = team === 'away' 
      ? Math.max(0, currentAwayValue + increment)
      : currentAwayValue

    const dbEventType = eventType === 'yellowCards' ? 'yellow_cards' : 
                       eventType === 'redCards' ? 'red_cards' : 'corners'

    await updateMatchData('updateEvents', matchId, { 
      eventType: dbEventType, 
      homeCount: newHomeValue, 
      awayCount: newAwayValue 
    })
  }

  const openEventDialog = async (matchId: number) => {
    setSelectedMatch(matchId)
    const match = matches.find(m => m.matchId === matchId)
    if (match && match.homeTeamId && match.awayTeamId) {
      try {
        const [homePlayers, awayPlayers] = await Promise.all([
          fetchPlayers(match.homeTeamId!),
          fetchPlayers(match.awayTeamId!)
        ])
        setPlayers({ home: homePlayers, away: awayPlayers })
      } catch (error) {
        console.error('Error loading players:', error)
      }
    }
    setIsEventDialogOpen(true)
  }

  const addMatchEvent = async (matchId: number) => {
    if (!newEvent.type || !newEvent.team || !newEvent.minute) {
      alert("Please fill in required fields: Type, Team, and Minute")
      return
    }

    try {
      await updateMatchData('addEvent', matchId, {
        event: {
          matchId,
          minute: parseInt(newEvent.minute),
          type: newEvent.type,
          team: newEvent.team as 'home' | 'away',
          playerId: newEvent.playerId ? parseInt(newEvent.playerId) : undefined,
          playerName: newEvent.playerName,
          description: newEvent.description || undefined
        }
      })

      setNewEvent({ 
        type: "", 
        team: "", 
        playerId: "", 
        playerName: "", 
        minute: "", 
        description: "" 
      })
      setIsEventDialogOpen(false)
    } catch (error) {
      console.error('Error adding match event:', error)
      alert('Error adding match event')
    }
  }

  const resetMatch = async (matchId: number) => {
    await updateMatchData('resetMatch', matchId)
  }

  const goBackToDashboard = () => {
    window.location.href = "/admin/dashboard"
  }

  useEffect(() => {
    fetchMatches()
    fetchEventTypes()
    const interval = setInterval(fetchMatches, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading matches...</p>
        </div>
      </div>
    )
  }

  const liveMatches = matches.filter(m => m.isLive)
  const readyMatches = matches.filter(m => m.canStart && !m.isLive)
  const scheduledMatches = matches.filter(m => !m.canStart && !m.isLive)

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
                  {liveMatches.length} live • {readyMatches.length} ready • {scheduledMatches.length} scheduled
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Dialog open={isManualMatchDialogOpen} onOpenChange={setIsManualMatchDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="font-semibold">
                    <Play className="w-4 h-4 mr-2" />
                    Start Manual Match
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Start Manual Match</DialogTitle>
                    <DialogDescription>Create a new manual match not tied to a fixture.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="home-team" className="text-right">
                        Home Team
                      </Label>
                      <Input
                        id="home-team"
                        value={newManualMatch.homeTeam}
                        onChange={(e) => setNewManualMatch({...newManualMatch, homeTeam: e.target.value})}
                        className="col-span-3"
                        placeholder="Home team name"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="away-team" className="text-right">
                        Away Team
                      </Label>
                      <Input
                        id="away-team"
                        value={newManualMatch.awayTeam}
                        onChange={(e) => setNewManualMatch({...newManualMatch, awayTeam: e.target.value})}
                        className="col-span-3"
                        placeholder="Away team name"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="venue" className="text-right">
                        Venue
                      </Label>
                      <Input
                        id="venue"
                        value={newManualMatch.venue}
                        onChange={(e) => setNewManualMatch({...newManualMatch, venue: e.target.value})}
                        className="col-span-3"
                        placeholder="Match venue"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={startManualMatch}>Start Match</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button variant="outline" onClick={fetchMatches} className="font-semibold">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="destructive" className="animate-pulse font-semibold text-lg px-4 py-2">
              ADMIN CONTROL PANEL
            </Badge>
            <Badge variant="destructive" className="font-semibold px-3 py-1">
              {liveMatches.length} Live
            </Badge>
            <Badge variant="secondary" className="font-semibold px-3 py-1 bg-yellow-500 text-yellow-950">
              {readyMatches.length} Ready
            </Badge>
            <Badge variant="outline" className="font-semibold px-3 py-1">
              {scheduledMatches.length} Scheduled
            </Badge>
          </div>
        </div>

        {matches.length === 0 && (
          <Card className="shadow-xl border-2 border-muted/20 bg-gradient-to-br from-background/95 via-muted/10 to-background/95 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="bg-muted/20 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Clock className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-3">No Matches Available</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                No matches are currently scheduled to be live or ready to start. Matches will automatically appear here when their
                scheduled time approaches, or you can start a manual match.
              </p>
              <Button onClick={() => setIsManualMatchDialogOpen(true)} size="lg" className="font-semibold">
                <Play className="w-5 h-5 mr-2" />
                Start Manual Match
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Ready to Start Matches */}
        {readyMatches.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-yellow-600">Ready to Start</h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {readyMatches.map((match) => (
                <Card key={match.id} className="shadow-xl border-2 border-yellow-500/20 bg-gradient-to-br from-background/95 via-yellow-50/10 to-background/95 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold">{match.homeTeam} vs {match.awayTeam}</h3>
                        <p className="text-muted-foreground text-sm">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          {match.venue}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {new Date(match.scheduledAt).toLocaleString()}
                        </p>
                      </div>
                      <Button 
                        onClick={() => startMatch(match.fixtureId!)}
                        className="bg-yellow-500 hover:bg-yellow-600"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Match
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs bg-yellow-500 text-yellow-950">
                        READY TO START
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        AUTO
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Live Matches */}
        {liveMatches.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-red-600">Live Matches</h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {liveMatches.map((match) => (
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
                        <Badge variant="default" className="text-xs">
                          AUTO
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" onClick={() => updateMatchTime(match.matchId!, match.minute - 1)}>
                            <Minus className="w-4 h-4" />
                          </Button>
                          <div className="flex items-center space-x-2 text-muted-foreground min-w-[80px] justify-center">
                            <Clock className="w-4 h-4" />
                            <span className="font-semibold text-lg">{match.minute}'</span>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => updateMatchTime(match.matchId!, match.minute + 1)}>
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <Select value={match.status} onValueChange={(value) => updateMatchStatus(match.matchId!, value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="IN_PROGRESS">Live</SelectItem>
                            <SelectItem value="FINAL">Finished</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resetMatch(match.matchId!)}
                          title="Reset scores and events"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => endMatch(match.matchId!)}>
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
                            <Button size="sm" variant="outline" onClick={() => updateScore(match.matchId!, "home", -1)}>
                              <Minus className="w-4 h-4" />
                            </Button>
                            <div className="text-4xl font-black text-primary min-w-[60px]">{match.homeScore}</div>
                            <Button size="sm" variant="outline" onClick={() => updateScore(match.matchId!, "home", 1)}>
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-muted-foreground font-bold text-2xl mx-6">-</div>
                        <div className="text-center flex-1">
                          <div className="font-bold text-lg mb-2">{match.awayTeam}</div>
                          <div className="flex items-center justify-center space-x-2 mb-2">
                            <Button size="sm" variant="outline" onClick={() => updateScore(match.matchId!, "away", -1)}>
                              <Minus className="w-4 h-4" />
                            </Button>
                            <div className="text-4xl font-black text-primary min-w-[60px]">{match.awayScore}</div>
                            <Button size="sm" variant="outline" onClick={() => updateScore(match.matchId!, "away", 1)}>
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
                            <Button size="sm" variant="ghost" onClick={() => updateEvent(match.matchId!, "corners", "home", -1)}>
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="font-bold text-lg min-w-[20px] text-center">{match.events.corners.home}</span>
                            <Button size="sm" variant="ghost" onClick={() => updateEvent(match.matchId!, "corners", "home", 1)}>
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <span className="text-muted-foreground">-</span>
                          <div className="flex items-center space-x-1">
                            <Button size="sm" variant="ghost" onClick={() => updateEvent(match.matchId!, "corners", "away", -1)}>
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="font-bold text-lg min-w-[20px] text-center">{match.events.corners.away}</span>
                            <Button size="sm" variant="ghost" onClick={() => updateEvent(match.matchId!, "corners", "away", 1)}>
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
                              onClick={() => updateEvent(match.matchId!, "yellowCards", "home", -1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="font-bold text-lg text-yellow-500 min-w-[20px] text-center">
                              {match.events.yellowCards.home}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateEvent(match.matchId!, "yellowCards", "home", 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <span className="text-muted-foreground">-</span>
                          <div className="flex items-center space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateEvent(match.matchId!, "yellowCards", "away", -1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="font-bold text-lg text-yellow-500 min-w-[20px] text-center">
                              {match.events.yellowCards.away}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateEvent(match.matchId!, "yellowCards", "away", 1)}
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
                            <Button size="sm" variant="ghost" onClick={() => updateEvent(match.matchId!, "redCards", "home", -1)}>
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="font-bold text-lg text-red-500 min-w-[20px] text-center">
                              {match.events.redCards.home}
                            </span>
                            <Button size="sm" variant="ghost" onClick={() => updateEvent(match.matchId!, "redCards", "home", 1)}>
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <span className="text-muted-foreground">-</span>
                          <div className="flex items-center space-x-1">
                            <Button size="sm" variant="ghost" onClick={() => updateEvent(match.matchId!, "redCards", "away", -1)}>
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="font-bold text-lg text-red-500 min-w-[20px] text-center">
                              {match.events.redCards.away}
                            </span>
                            <Button size="sm" variant="ghost" onClick={() => updateEvent(match.matchId!, "redCards", "away", 1)}>
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
                      <Dialog open={isEventDialogOpen && selectedMatch === match.matchId} onOpenChange={setIsEventDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" onClick={() => openEventDialog(match.matchId!)} className="font-semibold">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Event
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>Add Match Event</DialogTitle>
                            <DialogDescription>Add a new event to the match timeline with player information.</DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="event-type" className="text-right">
                                Type *
                              </Label>
                              <Select
                                value={newEvent.type}
                                onValueChange={(value) => setNewEvent({ ...newEvent, type: value })}
                              >
                                <SelectTrigger className="col-span-3">
                                  <SelectValue placeholder="Select event type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {eventTypes.map((eventType) => (
                                    <SelectItem key={eventType.event_key} value={eventType.event_key}>
                                      {eventType.event_key.replace('_', ' ')}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="team" className="text-right">
                                Team *
                              </Label>
                              <Select
                                value={newEvent.team}
                                onValueChange={(value) => {
                                  setNewEvent({ 
                                    ...newEvent, 
                                    team: value,
                                    playerId: "",
                                    playerName: ""
                                  })
                                }}
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
                              <Label htmlFor="player" className="text-right">
                                Player
                              </Label>
                              <Select
                                value={newEvent.playerId}
                                onValueChange={(value) => {
                                  const selectedPlayer = (newEvent.team === 'home' ? players.home : players.away)
                                    .find(p => p.id.toString() === value)
                                  setNewEvent({ 
                                    ...newEvent, 
                                    playerId: value,
                                    playerName: selectedPlayer?.name || ''
                                  })
                                }}
                              >
                                <SelectTrigger className="col-span-3">
                                  <SelectValue placeholder="Select player (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                  {(newEvent.team === 'home' ? players.home : players.away).map((player) => (
                                    <SelectItem key={player.id} value={player.id.toString()}>
                                      {player.jerseyNumber ? `#${player.jerseyNumber} - ` : ''}{player.name}
                                      {player.position ? ` (${player.position})` : ''}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="minute" className="text-right">
                                Minute *
                              </Label>
                              <Input
                                id="minute"
                                type="number"
                                value={newEvent.minute}
                                onChange={(e) => setNewEvent({ ...newEvent, minute: e.target.value })}
                                className="col-span-3"
                                placeholder="Match minute"
                                min="0"
                                max="120"
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
                            <Button onClick={() => addMatchEvent(match.matchId!)}>Add Event</Button>
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
                            <div key={event.id || index} className="flex justify-between items-center text-sm">
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">
                                  {event.minute}'
                                </Badge>
                                <span className="capitalize font-medium">{event.type?.replace('_', ' ')}</span>
                                {event.playerName && <span className="text-muted-foreground">- {event.playerName}</span>}
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
        )}

        {/* Scheduled Matches */}
        {scheduledMatches.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-600">Scheduled Matches</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scheduledMatches.map((match) => (
                <Card key={match.id} className="shadow-xl border-2 border-muted/20">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <h3 className="font-semibold text-sm mb-2">{match.homeTeam} vs {match.awayTeam}</h3>
                      <p className="text-muted-foreground text-xs mb-2">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {match.venue}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {new Date(match.scheduledAt).toLocaleString()}
                      </p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        SCHEDULED
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}