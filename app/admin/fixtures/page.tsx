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
} from "lucide-react"
import Link from "next/link"

// Mock fixture data with enhanced match results and statistics

const statusOptions = ["ALL", "PENDING", "APPROVED", "REJECTED", "COMPLETED"]
const leagueOptions = ["ALL", "Premier League", "Championship Division", "Women's Premier League"]
const venueOptions = ["Main Stadium", "Sports Complex A", "Sports Complex B", "University Stadium"]
const teamOptions = [
  "NWU Eagles",
  "Wits Wolves",
  "UCT Lions",
  "UP Tuks",
  "UJ Orange",
  "Stellenbosch FC",
  "Rhodes United",
  "UKZN Sharks",
]

export default function FixtureManagement() {
  const [fixtures, setFixtures] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [leagueFilter, setLeagueFilter] = useState("ALL")
  const [selectedFixture, setSelectedFixture] = useState<any>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false)
  const [isResultsDialogOpen, setIsResultsDialogOpen] = useState(false)
  const [editingResults, setEditingResults] = useState<any>(null)
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject">("approve")
  const [approvalNotes, setApprovalNotes] = useState("")
  const [newFixture, setNewFixture] = useState({
    homeTeam: "",
    awayTeam: "",
    league: "",
    date: "",
    time: "",
    venue: "",
    referee: "",
    notes: "",
  })

  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        console.log('🔄 Fetching fixtures from API...');
        const response = await fetch('http://localhost:3002/api/fixtures');
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Fixtures fetched successfully:', data.length, 'fixtures');
          console.log('📋 First fixture:', data[0]);
          setFixtures(data);
        } else {
          console.error('❌ Failed to fetch fixtures:', response.status);
        }
      } catch (error) {
        console.error('❌ Error fetching fixtures:', error);
      }
    };

    fetchFixtures();
  }, []);

  const filteredFixtures = fixtures.filter((fixture) => {
    const matchesSearch =
      (fixture.home_team?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (fixture.away_team?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (fixture.venue?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "ALL" || fixture.status === statusFilter
    const matchesLeague = leagueFilter === "ALL" || fixture.league === leagueFilter

    return matchesSearch && matchesStatus && matchesLeague
  })

  const handleViewDetails = (fixture: any) => {
    setSelectedFixture(fixture)
    setIsDetailDialogOpen(true)
  }

  const handleEditResults = (fixture: any) => {
    setEditingResults({
      ...fixture,
      homeScore: fixture.home_score || 0,
      awayScore: fixture.away_score || 0,
      matchStats: fixture.matchStats || {
        attendance: 0,
        duration: "90",
        weather: "",
        homeStats: { possession: 50, shots: 0, shotsOnTarget: 0, corners: 0, fouls: 0, yellowCards: 0, redCards: 0 },
        awayStats: { possession: 50, shots: 0, shotsOnTarget: 0, corners: 0, fouls: 0, yellowCards: 0, redCards: 0 },
      },
    })
    setIsResultsDialogOpen(true)
  }

  const handleSaveResults = () => {
    if (editingResults) {
      setFixtures(fixtures.map((f) => (f.id === editingResults.id ? { ...editingResults, status: "COMPLETED" } : f)))
      setIsResultsDialogOpen(false)
      setEditingResults(null)
    }
  }

  const handleApprovalAction = (fixture: any, action: "approve" | "reject") => {
    setSelectedFixture(fixture)
    setApprovalAction(action)
    setApprovalNotes("")
    setIsApprovalDialogOpen(true)
  }

  const handleSubmitApproval = () => {
    if (selectedFixture) {
      const updatedStatus = approvalAction === "approve" ? "APPROVED" : "REJECTED"
      setFixtures(
        fixtures.map((fixture) =>
          fixture.id === selectedFixture.id
            ? {
                ...fixture,
                status: updatedStatus,
                approvalDate: new Date().toISOString().split("T")[0],
                approvalNotes: approvalNotes,
                ...(approvalAction === "reject" && { rejectionReason: approvalNotes }),
              }
            : fixture,
        ),
      )
    }
    setIsApprovalDialogOpen(false)
    setSelectedFixture(null)
    setApprovalNotes("")
  }
const handleAddFixture = async () => {
  try {
    const response = await fetch('http://localhost:3002/api/fixtures', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        homeTeam: newFixture.homeTeam,
        awayTeam: newFixture.awayTeam,
        league: newFixture.league,
        date: newFixture.date,
        time: newFixture.time,
        venue: newFixture.venue,
        referee: newFixture.referee,
        notes: newFixture.notes,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create fixture');
    }

    const result = await response.json();

    // Add the new fixture to the local state for immediate UI update
    setFixtures([...fixtures, {
      id: result.fixtureId,
      home_team: newFixture.homeTeam,
      away_team: newFixture.awayTeam,
      league: newFixture.league,
      date: newFixture.date,
      time: newFixture.time,
      venue: newFixture.venue,
      referee: newFixture.referee,
      notes: newFixture.notes,
      status: 'PENDING',
      round: 'TBD',
      created_by: 'Admin',
      submitted_date: new Date().toISOString().split('T')[0],
    }]);

    // Close dialog and reset form
    setIsCreateDialogOpen(false);
    setNewFixture({
      homeTeam: '',
      awayTeam: '',
      league: '',
      date: '',
      time: '',
      venue: '',
      referee: '',
      notes: '',
    });
  } catch (error) {
    console.error('❌ Error creating fixture:', error);
    // You might want to show an error message to the user here
  }
};

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200"
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Check className="w-4 h-4" />
      case "REJECTED":
        return <X className="w-4 h-4" />
      case "PENDING":
        return <Clock className="w-4 h-4" />
      case "COMPLETED":
        return <Trophy className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const pendingCount = fixtures.filter((fixture) => fixture.status === "PENDING").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Fixture Management</h1>
              <p className="text-muted-foreground mt-1">Create and manage match fixtures, results, and statistics</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                {pendingCount} Pending
              </Badge>
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
                    {leagueOptions.map((league) => (
                      <SelectItem key={league} value={league}>
                        {league === "ALL" ? "All Leagues" : league}
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Fixtures</TabsTrigger>
            <TabsTrigger value="pending">Pending Approval</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
  {filteredFixtures.map((fixture) => (
    <Card
      key={fixture.id}
      className="bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300"
    >
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-3">
              <div className="text-lg font-semibold text-center min-w-[120px]">{fixture.home_team}</div>
              <div className="text-2xl font-bold text-muted-foreground">VS</div>
              <div className="text-lg font-semibold text-center min-w-[120px]">{fixture.away_team}</div>
              {fixture.status === "final" && (
                <div className="text-xl font-bold text-primary">
                  {fixture.home_score} - {fixture.away_score}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(fixture.date).toLocaleDateString()} at {fixture.time}
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                {fixture.venue}
              </div>
              {fixture.round && (
                <div className="flex items-center">
                  <Trophy className="w-4 h-4 mr-2" />
                  {fixture.round}
                </div>
              )}
            </div>

            {fixture.status === "final" && (
              <div className="mt-2 text-sm text-muted-foreground">
                {fixture.attendance && <span>Attendance: {fixture.attendance}</span>}
                {fixture.highlights && fixture.highlights.length > 0 && (
                  <ul className="list-disc list-inside mt-1">
                    {fixture.highlights.map((highlight, index) => (
                      <li key={index}>{highlight}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <Badge variant="outline" className={getStatusColor(fixture.status)}>
              {getStatusIcon(fixture.status)}
              <span className="ml-1">{fixture.status}</span>
            </Badge>

            <Button variant="outline" size="sm" onClick={() => handleViewDetails(fixture)}>
              <Eye className="w-4 h-4 mr-2" />
              Details
            </Button>

            {fixture.status === "APPROVED" && (
              <Button variant="outline" size="sm" onClick={() => handleEditResults(fixture)}>
                <Target className="w-4 h-4 mr-2" />
                Results
              </Button>
            )}

            {fixture.status === "final" && (
              <Button variant="outline" size="sm" onClick={() => handleEditResults(fixture)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Results
              </Button>
            )}

            {fixture.status === "PENDING" && (
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
  ))}
</TabsContent>


          <TabsContent value="pending">
            {filteredFixtures
              .filter((f) => f.status === "PENDING")
              .map((fixture) => (
                <Card key={fixture.id} className="bg-card/50 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="text-lg font-semibold">{fixture.home_team}</div>
                          <div className="text-xl font-bold text-muted-foreground">VS</div>
                          <div className="text-lg font-semibold">{fixture.away_team}</div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Submitted by {fixture.created_by} on {fixture.submitted_date}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApprovalAction(fixture, "reject")}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                        <Button size="sm" onClick={() => handleApprovalAction(fixture, "approve")}>
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="upcoming">
            {filteredFixtures
              .filter((f) => f.status === "APPROVED")
              .map((fixture) => (
                <Card key={fixture.id} className="bg-card/50 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="text-lg font-semibold">{fixture.home_team}</div>
                          <div className="text-xl font-bold text-muted-foreground">VS</div>
                          <div className="text-lg font-semibold">{fixture.away_team}</div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(fixture.date).toLocaleDateString()} at {fixture.time}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            {fixture.venue}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditResults(fixture)}>
                          <Target className="w-4 h-4 mr-2" />
                          Add Results
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="completed">
  {filteredFixtures
    .filter((f) => f.status === "final") // match the interface status
    .map((fixture) => (
      <Card key={fixture.id} className="bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-3">
                <div className="text-lg font-semibold">{fixture.home_team}</div>
                <div className="text-2xl font-bold text-primary">
                  {fixture.home_score} - {fixture.away_score}
                </div>
                <div className="text-lg font-semibold">{fixture.away_team}</div>
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(fixture.date).toLocaleDateString()} at {fixture.venue}
                {fixture.attendance && (
                  <span className="ml-4">• Attendance: {fixture.attendance}</span>
                )}
              </div>
              {fixture.highlights && fixture.highlights.length > 0 && (
                <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside">
                  {fixture.highlights.map((highlight, index) => (
                    <li key={index}>{highlight}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => handleViewDetails(fixture)}>
                <Eye className="w-4 h-4 mr-2" />
                View Report
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleEditResults(fixture)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Results
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
</TabsContent>

        </Tabs>

        {filteredFixtures.length === 0 && (
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No fixtures found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Enhanced Detail Dialog with match statistics */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedFixture?.status === "COMPLETED" ? "Match Report" : "Fixture Details"}</DialogTitle>
          </DialogHeader>
          {selectedFixture && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <div className="text-xl font-bold">{selectedFixture.home_team}</div>
                  {selectedFixture.status === "COMPLETED" ? (
                    <div className="text-3xl font-bold text-primary">
                      {selectedFixture.home_score} - {selectedFixture.away_score}
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-muted-foreground">VS</div>
                  )}
                  <div className="text-xl font-bold">{selectedFixture.away_team}</div>
                </div>
                <Badge variant="outline" className={getStatusColor(selectedFixture.status)}>
                  {selectedFixture.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Date & Time</Label>
                  <p className="text-sm">
                    {new Date(selectedFixture.date).toLocaleDateString()} at {selectedFixture.time}
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
                  <Label className="text-sm font-medium">Referee</Label>
                  <p className="text-sm">{selectedFixture.referee}</p>
                </div>
              </div>

              {selectedFixture.status === "COMPLETED" && selectedFixture.matchStats && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Match Statistics</h3>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <Label className="text-sm font-medium">Attendance</Label>
                      <p className="text-lg font-bold">{selectedFixture.matchStats.attendance}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Duration</Label>
                      <p className="text-lg font-bold">{selectedFixture.matchStats.duration} min</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Weather</Label>
                      <p className="text-sm">{selectedFixture.matchStats.weather}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <h4 className="font-medium">{selectedFixture.home_team}</h4>
                    </div>
                    <div className="text-center">
                      <h4 className="font-medium">Statistics</h4>
                    </div>
                    <div className="text-center">
                      <h4 className="font-medium">{selectedFixture.away_team}</h4>
                    </div>
                  </div>

                  {Object.keys(selectedFixture.matchStats.homeStats).map((stat) => (
                    <div key={stat} className="grid grid-cols-3 gap-4 text-center py-2 border-b">
                      <div className="font-medium">
                        {selectedFixture.matchStats.homeStats[stat]}
                        {stat === "possession" && "%"}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {stat.replace(/([A-Z])/g, " $1").trim()}
                      </div>
                      <div className="font-medium">
                        {selectedFixture.matchStats.awayStats[stat]}
                        {stat === "possession" && "%"}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedFixture.status === "COMPLETED" && selectedFixture.matchEvents && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Match Events</h3>
                  <div className="space-y-2">
                    {selectedFixture.matchEvents.map((event: any, index: number) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-muted/20 rounded-lg">
                        <div className="font-bold text-primary min-w-[40px]">{event.minute}'</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant="outline"
                              className={
                                event.type === "goal"
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : event.type === "yellow"
                                    ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                    : event.type === "red"
                                      ? "bg-red-100 text-red-800 border-red-200"
                                      : "bg-blue-100 text-blue-800 border-blue-200"
                              }
                            >
                              {event.type.toUpperCase()}
                            </Badge>
                            <span className="font-medium">{event.player}</span>
                            <span className="text-sm text-muted-foreground">
                              ({event.team === "home" ? selectedFixture.home_team : selectedFixture.away_team})
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedFixture.notes && (
                <div>
                  <Label className="text-sm font-medium">Notes</Label>
                  <p className="text-sm text-muted-foreground">{selectedFixture.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Created By</Label>
                  <p className="text-sm">{selectedFixture.created_by}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Submitted Date</Label>
                  <p className="text-sm">{selectedFixture.submitted_date}</p>
                </div>
              </div>

              {selectedFixture.status === "REJECTED" && selectedFixture.rejectionReason && (
                <div>
                  <Label className="text-sm font-medium text-red-600">Rejection Reason</Label>
                  <p className="text-sm text-red-600">{selectedFixture.rejectionReason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isResultsDialogOpen} onOpenChange={setIsResultsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingResults?.status === "COMPLETED" ? "Edit Match Results" : "Add Match Results"}
            </DialogTitle>
          </DialogHeader>
          {editingResults && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <div className="text-lg font-bold">{editingResults.home_team}</div>
                  <div className="text-xl font-bold text-muted-foreground">VS</div>
                  <div className="text-lg font-bold">{editingResults.away_team}</div>
                </div>
              </div>

              {/* Score Input */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="homeScore">{editingResults.home_team} Score</Label>
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
                  <Label htmlFor="awayScore">{editingResults.away_team} Score</Label>
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

              {/* Match Details */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="attendance">Attendance</Label>
                  <Input
                    id="attendance"
                    type="number"
                    min="0"
                    value={editingResults.matchStats?.attendance || 0}
                    onChange={(e) =>
                      setEditingResults({
                        ...editingResults,
                        matchStats: {
                          ...editingResults.matchStats,
                          attendance: Number.parseInt(e.target.value) || 0,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    placeholder="90+3"
                    value={editingResults.matchStats?.duration || "90"}
                    onChange={(e) =>
                      setEditingResults({
                        ...editingResults,
                        matchStats: {
                          ...editingResults.matchStats,
                          duration: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="weather">Weather</Label>
                  <Input
                    id="weather"
                    placeholder="Clear, 22°C"
                    value={editingResults.matchStats?.weather || ""}
                    onChange={(e) =>
                      setEditingResults({
                        ...editingResults,
                        matchStats: {
                          ...editingResults.matchStats,
                          weather: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>

              {/* Team Statistics */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Team Statistics</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">{editingResults.home_team}</h4>
                    <div className="space-y-2">
                      {Object.keys(editingResults.matchStats?.homeStats || {}).map((stat) => (
                        <div key={stat}>
                          <Label className="text-sm capitalize">{stat.replace(/([A-Z])/g, " $1").trim()}</Label>
                          <Input
                            type="number"
                            min="0"
                            max={stat === "possession" ? 100 : undefined}
                            value={editingResults.matchStats?.homeStats[stat] || 0}
                            onChange={(e) =>
                              setEditingResults({
                                ...editingResults,
                                matchStats: {
                                  ...editingResults.matchStats,
                                  homeStats: {
                                    ...editingResults.matchStats.homeStats,
                                    [stat]: Number.parseInt(e.target.value) || 0,
                                  },
                                },
                              })
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">{editingResults.away_team}</h4>
                    <div className="space-y-2">
                      {Object.keys(editingResults.matchStats?.awayStats || {}).map((stat) => (
                        <div key={stat}>
                          <Label className="text-sm capitalize">{stat.replace(/([A-Z])/g, " $1").trim()}</Label>
                          <Input
                            type="number"
                            min="0"
                            max={stat === "possession" ? 100 : undefined}
                            value={editingResults.matchStats?.awayStats[stat] || 0}
                            onChange={(e) =>
                              setEditingResults({
                                ...editingResults,
                                matchStats: {
                                  ...editingResults.matchStats,
                                  awayStats: {
                                    ...editingResults.matchStats.awayStats,
                                    [stat]: Number.parseInt(e.target.value) || 0,
                                  },
                                },
                              })
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsResultsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveResults}>Save Results</Button>
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
                <Label htmlFor="homeTeam">Home Team</Label>
                <Select
                  value={newFixture.homeTeam}
                  onValueChange={(value) => setNewFixture({ ...newFixture, homeTeam: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select home team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamOptions.map((team) => (
                      <SelectItem key={team} value={team}>
                        {team}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="awayTeam">Away Team</Label>
                <Select
                  value={newFixture.awayTeam}
                  onValueChange={(value) => setNewFixture({ ...newFixture, awayTeam: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select away team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamOptions.map((team) => (
                      <SelectItem key={team} value={team}>
                        {team}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="league">League</Label>
              <Select
                value={newFixture.league}
                onValueChange={(value) => setNewFixture({ ...newFixture, league: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select league" />
                </SelectTrigger>
                <SelectContent>
                  {leagueOptions.slice(1).map((league) => (
                    <SelectItem key={league} value={league}>
                      {league}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newFixture.date}
                  onChange={(e) => setNewFixture({ ...newFixture, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={newFixture.time}
                  onChange={(e) => setNewFixture({ ...newFixture, time: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="venue">Venue</Label>
                <Select
                  value={newFixture.venue}
                  onValueChange={(value) => setNewFixture({ ...newFixture, venue: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {venueOptions.map((venue) => (
                      <SelectItem key={venue} value={venue}>
                        {venue}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="referee">Referee</Label>
                <Input
                  id="referee"
                  placeholder="Enter referee name"
                  value={newFixture.referee}
                  onChange={(e) => setNewFixture({ ...newFixture, referee: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes..."
                value={newFixture.notes}
                onChange={(e) => setNewFixture({ ...newFixture, notes: e.target.value })}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddFixture}
                disabled={!newFixture.homeTeam || !newFixture.awayTeam || !newFixture.date || !newFixture.time}
              >
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
                {selectedFixture?.home_team} vs {selectedFixture?.away_team}
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
                disabled={approvalAction === "reject" && !approvalNotes.trim()}
                className={approvalAction === "reject" ? "bg-red-600 hover:bg-red-700" : ""}
              >
                {approvalAction === "approve" ? "Approve" : "Reject"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
