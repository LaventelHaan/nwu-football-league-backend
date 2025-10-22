"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  Search,
  Plus,
  Edit,
  Check,
  X,
  Clock,
  MapPin,
  Users,
  Trophy,
  AlertCircle,
  Eye,
  Target,
  Loader2,
  Database,
  RefreshCw,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"

interface Fixture {
  id: number
  homeTeam: string
  awayTeam: string
  league: string
  date: string
  time: string
  venue: string
  status: string
  homeScore?: number
  awayScore?: number
  matchStatus?: string
  createdBy: string
  submittedDate: string
  homeTeamId: number
  awayTeamId: number
  leagueId: number
  scheduledAt: string
}

interface DropdownData {
  teams: Array<{ id: number; name: string; shortCode?: string }>
  leagues: Array<{ id: number; name: string; season: string }>
  venues: Array<{ id: number; name: string; venueName: string; fieldName: string }>
}

const statusOptions = ["ALL", "PENDING", "APPROVED", "REJECTED", "FINAL"]

export default function FixtureManagement() {
  const [fixtures, setFixtures] = useState<Fixture[]>([])
  const [dropdownData, setDropdownData] = useState<DropdownData>({ teams: [], leagues: [], venues: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [leagueFilter, setLeagueFilter] = useState("ALL")
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false)
  const [isResultsDialogOpen, setIsResultsDialogOpen] = useState(false)
  const [editingResults, setEditingResults] = useState<any>(null)
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject">("approve")
  const [approvalNotes, setApprovalNotes] = useState("")
  const [newFixture, setNewFixture] = useState({
    homeTeamId: "",
    awayTeamId: "",
    leagueId: "",
    date: "",
    time: "",
    venueFieldId: "",
  })
  const [submitting, setSubmitting] = useState(false)

  // Categorize fixtures
  const categorizeFixtures = (fixtures: Fixture[]) => {
    const now = new Date()
    
    return {
      // Fixtures that are pending approval
      pending: fixtures.filter(f => f.status === 'pending'),
      
      // Approved fixtures that are in the future
      upcoming: fixtures.filter(f => 
        f.status === 'approved' && 
        new Date(f.scheduledAt) > now
      ),
      
      // Approved fixtures that are in the past but not completed
      needsResults: fixtures.filter(f => 
        f.status === 'approved' && 
        new Date(f.scheduledAt) <= now && 
        f.matchStatus !== 'FINAL'
      ),
      
      // Fixtures with completed results
      completed: fixtures.filter(f => f.status === 'final' || f.matchStatus === 'FINAL'),
      
      // Rejected fixtures
      rejected: fixtures.filter(f => f.status === 'rejected')
    }
  }

  const categorizedFixtures = categorizeFixtures(fixtures)

  // Fetch fixtures and dropdown data
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [fixturesRes, dataRes] = await Promise.all([
        fetch('/api/admin/fixtures'),
        fetch('/api/admin/fixtures/data')
      ])

      const fixturesData = await fixturesRes.json()
      const dropdownData = await dataRes.json()

      console.log('API Responses:', { fixturesData, dropdownData })

      if (fixturesData.success) {
        setFixtures(fixturesData.fixtures || [])
      } else {
        setError(fixturesData.error || 'Failed to load fixtures')
      }

      if (dropdownData.success) {
        setDropdownData(dropdownData.data || { teams: [], leagues: [], venues: [] })
      } else {
        setError(dropdownData.error || 'Failed to load dropdown data')
      }
    } catch (error: any) {
      console.error('Error fetching data:', error)
      setError('Network error: Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    fetchData()
  }

  const filteredFixtures = fixtures.filter((fixture) => {
    const matchesSearch =
      fixture.homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fixture.awayTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fixture.venue.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "ALL" || 
      fixture.status.toUpperCase() === statusFilter
    const matchesLeague = leagueFilter === "ALL" || 
      fixture.league === leagueFilter

    return matchesSearch && matchesStatus && matchesLeague
  })

  const handleViewDetails = (fixture: Fixture) => {
    setSelectedFixture(fixture)
    setIsDetailDialogOpen(true)
  }

  const handleEditResults = (fixture: Fixture) => {
    setEditingResults({
      ...fixture,
      homeScore: fixture.homeScore || 0,
      awayScore: fixture.awayScore || 0,
      matchStatus: fixture.matchStatus || 'SCHEDULED'
    })
    setIsResultsDialogOpen(true)
  }

  const handleSaveResults = async () => {
  if (!editingResults) return

  try {
    setSubmitting(true)
    
    // Use current time in a format that MySQL accepts
    const now = new Date()
    const mysqlDateTime = now.toISOString().slice(0, 19).replace('T', ' ')
    
    const response = await fetch(`/api/admin/fixtures/${editingResults.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        homeScore: editingResults.homeScore,
        awayScore: editingResults.awayScore,
        matchStatus: 'FINAL',
        startedAt: mysqlDateTime, // Use formatted datetime
        endedAt: mysqlDateTime    // Use formatted datetime
      })
    })

    const data = await response.json()

    if (data.success) {
      // Refresh the data to get updated fixtures
      await fetchData()
      setIsResultsDialogOpen(false)
      setEditingResults(null)
    } else {
      alert(data.error || 'Failed to save results')
    }
  } catch (error) {
    console.error('Error saving results:', error)
    alert('Failed to save results')
  } finally {
    setSubmitting(false)
  }
}

  const handleApprovalAction = (fixture: Fixture, action: "approve" | "reject") => {
    setSelectedFixture(fixture)
    setApprovalAction(action)
    setApprovalNotes("")
    setIsApprovalDialogOpen(true)
  }

  const handleSubmitApproval = async () => {
    if (!selectedFixture) return

    try {
      setSubmitting(true)
      const response = await fetch(`/api/admin/fixtures/${selectedFixture.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: approvalAction,
          notes: approvalNotes
        })
      })

      const data = await response.json()

      if (data.success) {
        // Refresh the data to get updated fixtures
        await fetchData()
        setIsApprovalDialogOpen(false)
        setSelectedFixture(null)
        setApprovalNotes("")
      } else {
        alert(data.error || 'Failed to update fixture')
      }
    } catch (error) {
      console.error('Error updating fixture:', error)
      alert('Failed to update fixture')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddFixture = async () => {
    const scheduledAt = `${newFixture.date}T${newFixture.time}:00`
    
    try {
      setSubmitting(true)
      const response = await fetch('/api/admin/fixtures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          homeTeamId: parseInt(newFixture.homeTeamId),
          awayTeamId: parseInt(newFixture.awayTeamId),
          leagueId: parseInt(newFixture.leagueId),
          scheduledAt: scheduledAt,
          venueFieldId: newFixture.venueFieldId ? parseInt(newFixture.venueFieldId) : null
        })
      })

      const data = await response.json()

      if (data.success) {
        await fetchData() // Refresh fixtures
        setIsCreateDialogOpen(false)
        setNewFixture({
          homeTeamId: "",
          awayTeamId: "",
          leagueId: "",
          date: "",
          time: "",
          venueFieldId: "",
        })
      } else {
        alert(data.error || 'Failed to create fixture')
      }
    } catch (error) {
      console.error('Error creating fixture:', error)
      alert('Failed to create fixture')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200"
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "FINAL":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "APPROVED":
        return <Check className="w-4 h-4" />
      case "REJECTED":
        return <X className="w-4 h-4" />
      case "PENDING":
        return <Clock className="w-4 h-4" />
      case "FINAL":
        return <Trophy className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const isFixturePastDue = (fixture: Fixture) => {
    return new Date(fixture.scheduledAt) <= new Date() && fixture.status === 'approved' && fixture.matchStatus !== 'FINAL'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading fixtures...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Error Loading Data</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="space-x-2">
            <Button onClick={handleRetry}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
            <Link href="/admin/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Fixture card component for reusability
  const FixtureCard = ({ fixture, showNeedsResultsBadge = false }: { fixture: Fixture, showNeedsResultsBadge?: boolean }) => (
    <Card key={fixture.id} className="bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-3">
              <div className="text-lg font-semibold text-center min-w-[120px]">{fixture.homeTeam}</div>
              {(fixture.status === "final" || fixture.matchStatus === "FINAL") ? (
                <div className="text-2xl font-bold text-primary">
                  {fixture.homeScore} - {fixture.awayScore}
                </div>
              ) : (
                <div className="text-2xl font-bold text-muted-foreground">VS</div>
              )}
              <div className="text-lg font-semibold text-center min-w-[120px]">{fixture.awayTeam}</div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {fixture.date} at {fixture.time}
                {isFixturePastDue(fixture) && (
                  <AlertTriangle className="w-4 h-4 ml-2 text-yellow-500" />
                )}
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                {fixture.venue}
              </div>
              <div className="flex items-center">
                <Trophy className="w-4 h-4 mr-2" />
                {fixture.league}
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                {fixture.createdBy}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {showNeedsResultsBadge && isFixturePastDue(fixture) && (
              <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Needs Results
              </Badge>
            )}
            
            <Badge variant="outline" className={getStatusColor(fixture.status)}>
              {getStatusIcon(fixture.status)}
              <span className="ml-1">{fixture.status.toUpperCase()}</span>
            </Badge>

            <Button variant="outline" size="sm" onClick={() => handleViewDetails(fixture)}>
              <Eye className="w-4 h-4 mr-2" />
              Details
            </Button>

            {(fixture.status === "approved" || isFixturePastDue(fixture)) && (
              <Button variant="outline" size="sm" onClick={() => handleEditResults(fixture)}>
                <Target className="w-4 h-4 mr-2" />
                {fixture.matchStatus === 'FINAL' ? 'Edit Results' : 'Add Results'}
              </Button>
            )}

            {fixture.status === "pending" && (
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleApprovalAction(fixture, "reject")}
                  className="text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button size="sm" onClick={() => handleApprovalAction(fixture, "approve")}>
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Fixture Management</h1>
              <p className="text-muted-foreground mt-1">
                {fixtures.length > 0 
                  ? `Managing ${fixtures.length} fixtures` 
                  : 'No fixtures found - create your first fixture!'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={handleRetry} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Fixture
              </Button>
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
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search fixtures by teams or venue..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Select value={leagueFilter} onValueChange={setLeagueFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by league" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Leagues</SelectItem>
                    {dropdownData.leagues.map((league) => (
                      <SelectItem key={league.id} value={league.name}>
                        {league.name}
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

        {/* Fixtures Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({fixtures.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({categorizedFixtures.pending.length})</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming ({categorizedFixtures.upcoming.length})</TabsTrigger>
            <TabsTrigger value="needs-results">
              Needs Results ({categorizedFixtures.needsResults.length})
              {categorizedFixtures.needsResults.length > 0 && (
                <span className="ml-1 relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">Completed ({categorizedFixtures.completed.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredFixtures.map((fixture) => (
              <FixtureCard 
                key={fixture.id} 
                fixture={fixture} 
                showNeedsResultsBadge={true}
              />
            ))}
            {filteredFixtures.length === 0 && (
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="text-center py-12">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No fixtures found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {categorizedFixtures.pending.map((fixture) => (
              <FixtureCard key={fixture.id} fixture={fixture} />
            ))}
            {categorizedFixtures.pending.length === 0 && (
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="text-center py-12">
                  <Check className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No pending fixtures</h3>
                  <p className="text-muted-foreground">All fixtures have been processed.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            {categorizedFixtures.upcoming.map((fixture) => (
              <FixtureCard key={fixture.id} fixture={fixture} />
            ))}
            {categorizedFixtures.upcoming.length === 0 && (
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="text-center py-12">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No upcoming fixtures</h3>
                  <p className="text-muted-foreground">All approved fixtures are either completed or need results.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="needs-results" className="space-y-4">
            {categorizedFixtures.needsResults.map((fixture) => (
              <FixtureCard key={fixture.id} fixture={fixture} showNeedsResultsBadge={true} />
            ))}
            {categorizedFixtures.needsResults.length === 0 && (
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="text-center py-12">
                  <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">All caught up!</h3>
                  <p className="text-muted-foreground">No fixtures need results added.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {categorizedFixtures.completed.map((fixture) => (
              <FixtureCard key={fixture.id} fixture={fixture} />
            ))}
            {categorizedFixtures.completed.length === 0 && (
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="text-center py-12">
                  <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No completed fixtures</h3>
                  <p className="text-muted-foreground">Completed fixtures will appear here once results are added.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedFixture?.status === "final" ? "Match Report" : "Fixture Details"}</DialogTitle>
          </DialogHeader>
          {selectedFixture && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <div className="text-xl font-bold">{selectedFixture.homeTeam}</div>
                  {selectedFixture.status === "final" ? (
                    <div className="text-3xl font-bold text-primary">
                      {selectedFixture.homeScore} - {selectedFixture.awayScore}
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-muted-foreground">VS</div>
                  )}
                  <div className="text-xl font-bold">{selectedFixture.awayTeam}</div>
                </div>
                <Badge variant="outline" className={getStatusColor(selectedFixture.status)}>
                  {selectedFixture.status.toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Date & Time</Label>
                  <p className="text-sm">
                    {selectedFixture.date} at {selectedFixture.time}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Venue</Label>
                  <p className="text-sm">{selectedFixture.venue}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">League</Label>
                  <p className="text-sm">{selectedFixture.league}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created By</Label>
                  <p className="text-sm">{selectedFixture.createdBy}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Submitted Date</Label>
                  <p className="text-sm">{selectedFixture.submittedDate}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <p className="text-sm">{selectedFixture.status.toUpperCase()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Results Dialog */}
      <Dialog open={isResultsDialogOpen} onOpenChange={setIsResultsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingResults?.status === "final" ? "Edit Match Results" : "Add Match Results"}
            </DialogTitle>
          </DialogHeader>
          {editingResults && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <div className="text-lg font-bold">{editingResults.homeTeam}</div>
                  <div className="text-xl font-bold text-muted-foreground">VS</div>
                  <div className="text-lg font-bold">{editingResults.awayTeam}</div>
                </div>
              </div>

              {/* Score Input */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="homeScore">{editingResults.homeTeam} Score</Label>
                  <Input
                    id="homeScore"
                    type="number"
                    min="0"
                    value={editingResults.homeScore}
                    onChange={(e) =>
                      setEditingResults({
                        ...editingResults,
                        homeScore: Number.parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="awayScore">{editingResults.awayTeam} Score</Label>
                  <Input
                    id="awayScore"
                    type="number"
                    min="0"
                    value={editingResults.awayScore}
                    onChange={(e) =>
                      setEditingResults({
                        ...editingResults,
                        awayScore: Number.parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsResultsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveResults} disabled={submitting}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Results
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Fixture Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Fixture</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="homeTeam">Home Team *</Label>
                <Select
                  value={newFixture.homeTeamId}
                  onValueChange={(value) => setNewFixture({ ...newFixture, homeTeamId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select home team" />
                  </SelectTrigger>
                  <SelectContent>
                    {dropdownData.teams.map((team) => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="awayTeam">Away Team *</Label>
                <Select
                  value={newFixture.awayTeamId}
                  onValueChange={(value) => setNewFixture({ ...newFixture, awayTeamId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select away team" />
                  </SelectTrigger>
                  <SelectContent>
                    {dropdownData.teams.map((team) => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="league">League *</Label>
              <Select
                value={newFixture.leagueId}
                onValueChange={(value) => setNewFixture({ ...newFixture, leagueId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select league" />
                </SelectTrigger>
                <SelectContent>
                  {dropdownData.leagues.map((league) => (
                    <SelectItem key={league.id} value={league.id.toString()}>
                      {league.name} ({league.season})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={newFixture.date}
                  onChange={(e) => setNewFixture({ ...newFixture, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={newFixture.time}
                  onChange={(e) => setNewFixture({ ...newFixture, time: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="venue">Venue</Label>
              <Select
                value={newFixture.venueFieldId}
                onValueChange={(value) => setNewFixture({ ...newFixture, venueFieldId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select venue" />
                </SelectTrigger>
                <SelectContent>
                  {dropdownData.venues.map((venue) => (
                    <SelectItem key={venue.id} value={venue.id.toString()}>
                      {venue.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddFixture}
                disabled={!newFixture.homeTeamId || !newFixture.awayTeamId || !newFixture.leagueId || !newFixture.date || !newFixture.time || submitting}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create Fixture
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{approvalAction === "approve" ? "Approve" : "Reject"} Fixture</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to {approvalAction} the fixture between{" "}
              <strong>
                {selectedFixture?.homeTeam} vs {selectedFixture?.awayTeam}
              </strong>
              ?
            </p>
            <div>
              <Label htmlFor="approvalNotes">
                {approvalAction === "approve" ? "Approval Notes (Optional)" : "Rejection Reason (Required)"}
              </Label>
              <Textarea
                id="approvalNotes"
                placeholder={
                  approvalAction === "approve"
                    ? "Add any notes about the approval..."
                    : "Please provide a reason for rejection..."
                }
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsApprovalDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitApproval}
                disabled={(approvalAction === "reject" && !approvalNotes.trim()) || submitting}
                className={approvalAction === "reject" ? "bg-red-600 hover:bg-red-700" : ""}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {approvalAction === "approve" ? "Approve" : "Reject"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}