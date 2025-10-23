"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { mockPlayers, mockScoutingReports, addPlayerInvite, mockTeams, type ScoutingReport } from "@/lib/mockData"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LayoutDashboard,
  Users,
  Eye,
  FileText,
  LogOut,
  Settings,
  Bell,
  Plus,
  Star,
  TrendingUp,
  Target,
  Send,
  Download,
  Search,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ScoutDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [reportOpen, setReportOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const [reportForm, setReportForm] = useState({
    pace: 5,
    strength: 5,
    stamina: 5,
    agility: 5,
    passing: 5,
    shooting: 5,
    dribbling: 5,
    crossing: 5,
    finishing: 5,
    firstTouch: 5,
    vision: 5,
    decisionMaking: 5,
    workRate: 5,
    leadership: 5,
    composure: 5,
    teamwork: 5,
    potential: "Medium",
    status: "Under Review",
    recommendedAction: "",
    estimatedValue: "",
    strengths: "",
    weaknesses: "",
    notes: "",
  })

  const [inviteMessage, setInviteMessage] = useState("")

  const filteredPlayers = mockPlayers.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.position.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handleSubmitReport = () => {
    if (!user || !selectedPlayer || !reportForm.strengths || !reportForm.weaknesses || !reportForm.notes) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const player = mockPlayers.find((p) => p.id === selectedPlayer)
    if (!player) return

    const newReport: ScoutingReport = {
      id: `scout-${Date.now()}`,
      playerId: player.id,
      playerName: player.name,
      age: player.age,
      position: player.position,
      teamId: mockTeams.find((t) => t.name === player.team)?.id || 1,
      currentTeam: player.team,
      league: "Premier League",
      scoutedBy: user.name,
      scoutDate: new Date().toISOString().split("T")[0],
      matchVenue: "N/A",
      physicalAttributes: {
        pace: reportForm.pace,
        strength: reportForm.strength,
        stamina: reportForm.stamina,
        agility: reportForm.agility,
        height: `${player.height}cm`,
        weight: `${player.weight}kg`,
      },
      technicalSkills: {
        passing: reportForm.passing,
        shooting: reportForm.shooting,
        dribbling: reportForm.dribbling,
        crossing: reportForm.crossing,
        finishing: reportForm.finishing,
        firstTouch: reportForm.firstTouch,
      },
      mentalAttributes: {
        vision: reportForm.vision,
        decisionMaking: reportForm.decisionMaking,
        workRate: reportForm.workRate,
        leadership: reportForm.leadership,
        composure: reportForm.composure,
        teamwork: reportForm.teamwork,
      },
      potential: reportForm.potential,
      status: reportForm.status,
      recommendedAction: reportForm.recommendedAction,
      estimatedValue: reportForm.estimatedValue,
      contractStatus: "Under contract until 2025",
      videos: [],
      strengths: reportForm.strengths.split(",").map((s) => s.trim()),
      weaknesses: reportForm.weaknesses.split(",").map((w) => w.trim()),
      notes: reportForm.notes,
      overallRating:
        (reportForm.pace +
          reportForm.strength +
          reportForm.stamina +
          reportForm.agility +
          reportForm.passing +
          reportForm.shooting +
          reportForm.dribbling +
          reportForm.crossing +
          reportForm.finishing +
          reportForm.firstTouch +
          reportForm.vision +
          reportForm.decisionMaking +
          reportForm.workRate +
          reportForm.leadership +
          reportForm.composure +
          reportForm.teamwork) /
        16,
      invited: false,
    }

    mockScoutingReports.push(newReport)

    toast({
      title: "Success",
      description: "Scout report submitted successfully",
    })

    setSelectedPlayer(null)
    setReportForm({
      pace: 5,
      strength: 5,
      stamina: 5,
      agility: 5,
      passing: 5,
      shooting: 5,
      dribbling: 5,
      crossing: 5,
      finishing: 5,
      firstTouch: 5,
      vision: 5,
      decisionMaking: 5,
      workRate: 5,
      leadership: 5,
      composure: 5,
      teamwork: 5,
      potential: "Medium",
      status: "Under Review",
      recommendedAction: "",
      estimatedValue: "",
      strengths: "",
      weaknesses: "",
      notes: "",
    })
    setReportOpen(false)
  }

  const handleSendInvite = () => {
    if (!user || !selectedPlayer || !inviteMessage) {
      toast({
        title: "Error",
        description: "Please select a player and write a message",
        variant: "destructive",
      })
      return
    }

    const player = mockPlayers.find((p) => p.id === selectedPlayer)
    if (!player) return

    addPlayerInvite({
      playerId: player.id.toString(),
      playerName: player.name,
      scouterId: user.id,
      scouterName: user.name,
      teamId: mockTeams.find((t) => t.name === player.team)?.id.toString() || "1",
      message: inviteMessage,
      status: "pending",
    })

    toast({
      title: "Success",
      description: `Trial invitation sent to ${player.name}`,
    })

    setSelectedPlayer(null)
    setInviteMessage("")
    setInviteOpen(false)
  }

  const handleDownloadPDF = (report: ScoutingReport) => {
    const pdfContent = `
SCOUTING REPORT
================

Player Information:
- Name: ${report.playerName}
- Age: ${report.age}
- Position: ${report.position}
- Current Team: ${report.currentTeam}
- League: ${report.league}

Scout Information:
- Scouted By: ${report.scoutedBy}
- Date: ${report.scoutDate}
- Overall Rating: ${report.overallRating?.toFixed(1)}/10

Physical Attributes:
- Pace: ${report.physicalAttributes.pace}/10
- Strength: ${report.physicalAttributes.strength}/10
- Stamina: ${report.physicalAttributes.stamina}/10
- Agility: ${report.physicalAttributes.agility}/10
- Height: ${report.physicalAttributes.height}
- Weight: ${report.physicalAttributes.weight}

Technical Skills:
- Passing: ${report.technicalSkills.passing}/10
- Shooting: ${report.technicalSkills.shooting}/10
- Dribbling: ${report.technicalSkills.dribbling}/10
- Crossing: ${report.technicalSkills.crossing}/10
- Finishing: ${report.technicalSkills.finishing}/10
- First Touch: ${report.technicalSkills.firstTouch}/10

Mental Attributes:
- Vision: ${report.mentalAttributes.vision}/10
- Decision Making: ${report.mentalAttributes.decisionMaking}/10
- Work Rate: ${report.mentalAttributes.workRate}/10
- Leadership: ${report.mentalAttributes.leadership}/10
- Composure: ${report.mentalAttributes.composure}/10
- Teamwork: ${report.mentalAttributes.teamwork}/10

Assessment:
- Potential: ${report.potential}
- Status: ${report.status}
- Recommended Action: ${report.recommendedAction}
- Estimated Value: ${report.estimatedValue}

Strengths:
${report.strengths.map((s) => `- ${s}`).join("\n")}

Weaknesses:
${report.weaknesses.map((w) => `- ${w}`).join("\n")}

Notes:
${report.notes}
    `

    const blob = new Blob([pdfContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `scout-report-${report.playerName.replace(/\s+/g, "-")}-${report.scoutDate}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Success",
      description: "Report downloaded successfully",
    })
  }

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "players", label: "All Players", icon: Users },
    { id: "reports", label: "Scout Reports", icon: FileText },
    { id: "analysis", label: "Analysis", icon: TrendingUp },
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Eye className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">NWU Sports</h1>
              <p className="text-xs text-muted-foreground">Scout Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeTab === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <Avatar>
              <AvatarImage src={user?.avatar || "/placeholder.svg"} />
              <AvatarFallback>
  {user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : ""}
</AvatarFallback>


            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground">Scout</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 bg-transparent">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="border-b bg-card sticky top-0 z-10">
          <div className="flex items-center justify-between p-6">
            <div>
              <h2 className="text-2xl font-bold">Welcome, {`${user?.firstName || ""} ${user?.lastName || ""}`.split(" ")[0]}
</h2>
              <p className="text-sm text-muted-foreground">Scout players and submit comprehensive reports</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="relative bg-transparent">
                <Bell className="h-4 w-4" />
              </Button>
              <Avatar>
                <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                <AvatarFallback>
  {user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : ""}
</AvatarFallback>

              </Avatar>
            </div>
          </div>
        </header>

        <div className="p-6">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Players</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mockPlayers.length}</div>
                    <p className="text-xs text-muted-foreground">Available to scout</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Reports Submitted</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mockScoutingReports.length}</div>
                    <p className="text-xs text-muted-foreground">Total reports</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {mockScoutingReports.length > 0
                        ? (
                            mockScoutingReports.reduce((acc, r) => acc + (r.overallRating || 0), 0) /
                            mockScoutingReports.length
                          ).toFixed(1)
                        : "0.0"}
                    </div>
                    <p className="text-xs text-muted-foreground">Out of 10</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Priority Targets</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {mockScoutingReports.filter((r) => r.status === "Priority Target").length}
                    </div>
                    <p className="text-xs text-muted-foreground">High potential</p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="h-auto flex-col py-6 bg-transparent">
                          <Plus className="h-8 w-8 mb-2" />
                          <span className="font-semibold">New Scout Report</span>
                          <span className="text-xs text-muted-foreground">Submit player analysis</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Create Comprehensive Scout Report</DialogTitle>
                          <DialogDescription>Submit a detailed analysis of a player's performance</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6">
                          <div>
                            <Label htmlFor="player">Select Player</Label>
                            <Select
                              value={selectedPlayer?.toString()}
                              onValueChange={(v) => setSelectedPlayer(Number(v))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Choose a player" />
                              </SelectTrigger>
                              <SelectContent>
                                {mockPlayers.map((player) => (
                                  <SelectItem key={player.id} value={player.id.toString()}>
                                    {player.name} - {player.position} ({player.team})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Physical Attributes</h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Pace: {reportForm.pace}/10</Label>
                                <Input
                                  type="range"
                                  min="1"
                                  max="10"
                                  value={reportForm.pace}
                                  onChange={(e) => setReportForm({ ...reportForm, pace: Number(e.target.value) })}
                                />
                              </div>
                              <div>
                                <Label>Strength: {reportForm.strength}/10</Label>
                                <Input
                                  type="range"
                                  min="1"
                                  max="10"
                                  value={reportForm.strength}
                                  onChange={(e) => setReportForm({ ...reportForm, strength: Number(e.target.value) })}
                                />
                              </div>
                              <div>
                                <Label>Stamina: {reportForm.stamina}/10</Label>
                                <Input
                                  type="range"
                                  min="1"
                                  max="10"
                                  value={reportForm.stamina}
                                  onChange={(e) => setReportForm({ ...reportForm, stamina: Number(e.target.value) })}
                                />
                              </div>
                              <div>
                                <Label>Agility: {reportForm.agility}/10</Label>
                                <Input
                                  type="range"
                                  min="1"
                                  max="10"
                                  value={reportForm.agility}
                                  onChange={(e) => setReportForm({ ...reportForm, agility: Number(e.target.value) })}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Technical Skills</h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Passing: {reportForm.passing}/10</Label>
                                <Input
                                  type="range"
                                  min="1"
                                  max="10"
                                  value={reportForm.passing}
                                  onChange={(e) => setReportForm({ ...reportForm, passing: Number(e.target.value) })}
                                />
                              </div>
                              <div>
                                <Label>Shooting: {reportForm.shooting}/10</Label>
                                <Input
                                  type="range"
                                  min="1"
                                  max="10"
                                  value={reportForm.shooting}
                                  onChange={(e) => setReportForm({ ...reportForm, shooting: Number(e.target.value) })}
                                />
                              </div>
                              <div>
                                <Label>Dribbling: {reportForm.dribbling}/10</Label>
                                <Input
                                  type="range"
                                  min="1"
                                  max="10"
                                  value={reportForm.dribbling}
                                  onChange={(e) => setReportForm({ ...reportForm, dribbling: Number(e.target.value) })}
                                />
                              </div>
                              <div>
                                <Label>Crossing: {reportForm.crossing}/10</Label>
                                <Input
                                  type="range"
                                  min="1"
                                  max="10"
                                  value={reportForm.crossing}
                                  onChange={(e) => setReportForm({ ...reportForm, crossing: Number(e.target.value) })}
                                />
                              </div>
                              <div>
                                <Label>Finishing: {reportForm.finishing}/10</Label>
                                <Input
                                  type="range"
                                  min="1"
                                  max="10"
                                  value={reportForm.finishing}
                                  onChange={(e) => setReportForm({ ...reportForm, finishing: Number(e.target.value) })}
                                />
                              </div>
                              <div>
                                <Label>First Touch: {reportForm.firstTouch}/10</Label>
                                <Input
                                  type="range"
                                  min="1"
                                  max="10"
                                  value={reportForm.firstTouch}
                                  onChange={(e) => setReportForm({ ...reportForm, firstTouch: Number(e.target.value) })}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Mental Attributes</h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Vision: {reportForm.vision}/10</Label>
                                <Input
                                  type="range"
                                  min="1"
                                  max="10"
                                  value={reportForm.vision}
                                  onChange={(e) => setReportForm({ ...reportForm, vision: Number(e.target.value) })}
                                />
                              </div>
                              <div>
                                <Label>Decision Making: {reportForm.decisionMaking}/10</Label>
                                <Input
                                  type="range"
                                  min="1"
                                  max="10"
                                  value={reportForm.decisionMaking}
                                  onChange={(e) =>
                                    setReportForm({ ...reportForm, decisionMaking: Number(e.target.value) })
                                  }
                                />
                              </div>
                              <div>
                                <Label>Work Rate: {reportForm.workRate}/10</Label>
                                <Input
                                  type="range"
                                  min="1"
                                  max="10"
                                  value={reportForm.workRate}
                                  onChange={(e) => setReportForm({ ...reportForm, workRate: Number(e.target.value) })}
                                />
                              </div>
                              <div>
                                <Label>Leadership: {reportForm.leadership}/10</Label>
                                <Input
                                  type="range"
                                  min="1"
                                  max="10"
                                  value={reportForm.leadership}
                                  onChange={(e) => setReportForm({ ...reportForm, leadership: Number(e.target.value) })}
                                />
                              </div>
                              <div>
                                <Label>Composure: {reportForm.composure}/10</Label>
                                <Input
                                  type="range"
                                  min="1"
                                  max="10"
                                  value={reportForm.composure}
                                  onChange={(e) => setReportForm({ ...reportForm, composure: Number(e.target.value) })}
                                />
                              </div>
                              <div>
                                <Label>Teamwork: {reportForm.teamwork}/10</Label>
                                <Input
                                  type="range"
                                  min="1"
                                  max="10"
                                  value={reportForm.teamwork}
                                  onChange={(e) => setReportForm({ ...reportForm, teamwork: Number(e.target.value) })}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Potential</Label>
                              <Select
                                value={reportForm.potential}
                                onValueChange={(v) => setReportForm({ ...reportForm, potential: v })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Low">Low</SelectItem>
                                  <SelectItem value="Medium">Medium</SelectItem>
                                  <SelectItem value="High">High</SelectItem>
                                  <SelectItem value="Very High">Very High</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Status</Label>
                              <Select
                                value={reportForm.status}
                                onValueChange={(v) => setReportForm({ ...reportForm, status: v })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Under Review">Under Review</SelectItem>
                                  <SelectItem value="Recommended">Recommended</SelectItem>
                                  <SelectItem value="Priority Target">Priority Target</SelectItem>
                                  <SelectItem value="Not Recommended">Not Recommended</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Recommended Action</Label>
                              <Input
                                placeholder="e.g., Invite for trial"
                                value={reportForm.recommendedAction}
                                onChange={(e) => setReportForm({ ...reportForm, recommendedAction: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label>Estimated Value</Label>
                              <Input
                                placeholder="e.g., R250,000"
                                value={reportForm.estimatedValue}
                                onChange={(e) => setReportForm({ ...reportForm, estimatedValue: e.target.value })}
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="strengths">Strengths (comma-separated)</Label>
                            <Input
                              id="strengths"
                              placeholder="e.g., Speed, Accuracy, Teamwork"
                              value={reportForm.strengths}
                              onChange={(e) => setReportForm({ ...reportForm, strengths: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="weaknesses">Weaknesses (comma-separated)</Label>
                            <Input
                              id="weaknesses"
                              placeholder="e.g., Stamina, Positioning"
                              value={reportForm.weaknesses}
                              onChange={(e) => setReportForm({ ...reportForm, weaknesses: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="notes">Additional Notes</Label>
                            <Textarea
                              id="notes"
                              placeholder="Detailed observations..."
                              rows={4}
                              value={reportForm.notes}
                              onChange={(e) => setReportForm({ ...reportForm, notes: e.target.value })}
                            />
                          </div>
                          <Button onClick={handleSubmitReport} className="w-full">
                            Submit Report
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="h-auto flex-col py-6 bg-transparent">
                          <Send className="h-8 w-8 mb-2" />
                          <span className="font-semibold">Invite Player</span>
                          <span className="text-xs text-muted-foreground">Send trial invitation</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Invite Player for Trial</DialogTitle>
                          <DialogDescription>Send a trial invitation to a player</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="invite-player">Select Player</Label>
                            <Select
                              value={selectedPlayer?.toString()}
                              onValueChange={(v) => setSelectedPlayer(Number(v))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Choose a player" />
                              </SelectTrigger>
                              <SelectContent>
                                {mockPlayers.map((player) => (
                                  <SelectItem key={player.id} value={player.id.toString()}>
                                    {player.name} - {player.position} ({player.team})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="invite-message">Message</Label>
                            <Textarea
                              id="invite-message"
                              placeholder="Write your invitation message..."
                              rows={4}
                              value={inviteMessage}
                              onChange={(e) => setInviteMessage(e.target.value)}
                            />
                          </div>
                          <Button onClick={handleSendInvite} className="w-full">
                            <Send className="h-4 w-4 mr-2" />
                            Send Invitation
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      className="h-auto flex-col py-6 bg-transparent"
                      onClick={() => setActiveTab("players")}
                    >
                      <Users className="h-8 w-8 mb-2" />
                      <span className="font-semibold">View All Players</span>
                      <span className="text-xs text-muted-foreground">Browse all players</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Reports */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Scout Reports</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("reports")}>
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockScoutingReports.slice(0, 3).map((report) => (
                      <div key={report.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{report.playerName}</h4>
                            <p className="text-sm text-muted-foreground">By {report.scoutedBy}</p>
                          </div>
                          <Badge variant="default">
                            <Star className="h-3 w-3 mr-1" />
                            {report.overallRating?.toFixed(1)}/10
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{report.notes}</p>
                        <div className="flex gap-2 text-xs">
                          <Badge variant="secondary">{report.strengths.length} strengths</Badge>
                          <Badge variant="secondary">{report.weaknesses.length} areas to improve</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-auto"
                            onClick={() => handleDownloadPDF(report)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "players" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">All Players</h3>
                  <p className="text-sm text-muted-foreground">Scout and analyze player performance</p>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search players..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Send className="h-4 w-4 mr-2" />
                        Invite Player
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Invite Player for Trial</DialogTitle>
                        <DialogDescription>Send a trial invitation to a player</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="invite-player">Select Player</Label>
                          <Select
                            value={selectedPlayer?.toString()}
                            onValueChange={(v) => setSelectedPlayer(Number(v))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a player" />
                            </SelectTrigger>
                            <SelectContent>
                              {mockPlayers.map((player) => (
                                <SelectItem key={player.id} value={player.id.toString()}>
                                  {player.name} - {player.position} ({player.team})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="invite-message">Message</Label>
                          <Textarea
                            id="invite-message"
                            placeholder="Write your invitation message..."
                            rows={4}
                            value={inviteMessage}
                            onChange={(e) => setInviteMessage(e.target.value)}
                          />
                        </div>
                        <Button onClick={handleSendInvite} className="w-full">
                          <Send className="h-4 w-4 mr-2" />
                          Send Invitation
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Report
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Create Comprehensive Scout Report</DialogTitle>
                        <DialogDescription>Submit a detailed analysis of a player's performance</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div>
                          <Label htmlFor="player">Select Player</Label>
                          <Select
                            value={selectedPlayer?.toString()}
                            onValueChange={(v) => setSelectedPlayer(Number(v))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a player" />
                            </SelectTrigger>
                            <SelectContent>
                              {mockPlayers.map((player) => (
                                <SelectItem key={player.id} value={player.id.toString()}>
                                  {player.name} - {player.position} ({player.team})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {/* Physical, Technical, Mental attributes sections same as above */}
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg">Physical Attributes</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Pace: {reportForm.pace}/10</Label>
                              <Input
                                type="range"
                                min="1"
                                max="10"
                                value={reportForm.pace}
                                onChange={(e) => setReportForm({ ...reportForm, pace: Number(e.target.value) })}
                              />
                            </div>
                            <div>
                              <Label>Strength: {reportForm.strength}/10</Label>
                              <Input
                                type="range"
                                min="1"
                                max="10"
                                value={reportForm.strength}
                                onChange={(e) => setReportForm({ ...reportForm, strength: Number(e.target.value) })}
                              />
                            </div>
                            <div>
                              <Label>Stamina: {reportForm.stamina}/10</Label>
                              <Input
                                type="range"
                                min="1"
                                max="10"
                                value={reportForm.stamina}
                                onChange={(e) => setReportForm({ ...reportForm, stamina: Number(e.target.value) })}
                              />
                            </div>
                            <div>
                              <Label>Agility: {reportForm.agility}/10</Label>
                              <Input
                                type="range"
                                min="1"
                                max="10"
                                value={reportForm.agility}
                                onChange={(e) => setReportForm({ ...reportForm, agility: Number(e.target.value) })}
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="strengths">Strengths (comma-separated)</Label>
                          <Input
                            id="strengths"
                            placeholder="e.g., Speed, Accuracy, Teamwork"
                            value={reportForm.strengths}
                            onChange={(e) => setReportForm({ ...reportForm, strengths: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="weaknesses">Weaknesses (comma-separated)</Label>
                          <Input
                            id="weaknesses"
                            placeholder="e.g., Stamina, Positioning"
                            value={reportForm.weaknesses}
                            onChange={(e) => setReportForm({ ...reportForm, weaknesses: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="notes">Additional Notes</Label>
                          <Textarea
                            id="notes"
                            placeholder="Detailed observations..."
                            rows={4}
                            value={reportForm.notes}
                            onChange={(e) => setReportForm({ ...reportForm, notes: e.target.value })}
                          />
                        </div>
                        <Button onClick={handleSubmitReport} className="w-full">
                          Submit Report
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredPlayers.map((player) => {
                  const playerReports = mockScoutingReports.filter((r) => r.playerId === player.id)
                  const avgRating =
                    playerReports.length > 0
                      ? (
                          playerReports.reduce((acc, r) => acc + (r.overallRating || 0), 0) / playerReports.length
                        ).toFixed(1)
                      : "N/A"

                  return (
                    <Card key={player.id}>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={player.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {player.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-base">{player.name}</CardTitle>
                            <CardDescription>
                              {player.position} • {player.team}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Scout Rating</span>
                            <Badge variant="default">
                              <Star className="h-3 w-3 mr-1" />
                              {avgRating}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Reports</span>
                            <span className="text-sm font-semibold">{playerReports.length}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Goals</span>
                            <span className="text-sm font-semibold">{player.goals}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Assists</span>
                            <span className="text-sm font-semibold">{player.assists}</span>
                          </div>
                          <Button
                            variant="outline"
                            className="w-full bg-transparent"
                            size="sm"
                            onClick={() => {
                              setSelectedPlayer(player.id)
                              setInviteOpen(true)
                            }}
                          >
                            <Send className="h-3 w-3 mr-2" />
                            Send Invitation
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold">Scout Reports</h3>
                <p className="text-sm text-muted-foreground">All submitted player analyses</p>
              </div>

              <div className="space-y-4">
                {mockScoutingReports.map((report) => (
                  <Card key={report.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-lg">{report.playerName}</CardTitle>
                            <Badge variant="default">
                              <Star className="h-3 w-3 mr-1" />
                              {report.overallRating?.toFixed(1)}/10
                            </Badge>
                            <Badge
                              variant={
                                report.status === "Priority Target"
                                  ? "destructive"
                                  : report.status === "Recommended"
                                    ? "default"
                                    : "secondary"
                              }
                            >
                              {report.status}
                            </Badge>
                          </div>
                          <CardDescription>
                            {report.position} • {report.currentTeam} • Scouted by {report.scoutedBy} on{" "}
                            {report.scoutDate}
                          </CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(report)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Physical</h4>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span>Pace:</span>
                              <span className="font-semibold">{report.physicalAttributes.pace}/10</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Strength:</span>
                              <span className="font-semibold">{report.physicalAttributes.strength}/10</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Stamina:</span>
                              <span className="font-semibold">{report.physicalAttributes.stamina}/10</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Technical</h4>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span>Passing:</span>
                              <span className="font-semibold">{report.technicalSkills.passing}/10</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Shooting:</span>
                              <span className="font-semibold">{report.technicalSkills.shooting}/10</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Dribbling:</span>
                              <span className="font-semibold">{report.technicalSkills.dribbling}/10</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Mental</h4>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span>Vision:</span>
                              <span className="font-semibold">{report.mentalAttributes.vision}/10</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Work Rate:</span>
                              <span className="font-semibold">{report.mentalAttributes.workRate}/10</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Leadership:</span>
                              <span className="font-semibold">{report.mentalAttributes.leadership}/10</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold mb-1">Strengths</h4>
                        <div className="flex flex-wrap gap-2">
                          {report.strengths.map((strength, idx) => (
                            <Badge key={idx} variant="secondary" className="bg-green-100 text-green-800">
                              <Target className="h-3 w-3 mr-1" />
                              {strength}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold mb-1">Areas to Improve</h4>
                        <div className="flex flex-wrap gap-2">
                          {report.weaknesses.map((weakness, idx) => (
                            <Badge key={idx} variant="secondary" className="bg-orange-100 text-orange-800">
                              {weakness}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold mb-1">Assessment</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Potential:</span>{" "}
                            <span className="font-semibold">{report.potential}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Estimated Value:</span>{" "}
                            <span className="font-semibold">{report.estimatedValue}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Recommended Action:</span>{" "}
                            <span className="font-semibold">{report.recommendedAction}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold mb-1">Notes</h4>
                        <p className="text-sm text-muted-foreground">{report.notes}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "analysis" && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Analysis</CardTitle>
                <CardDescription>Advanced analytics and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This section will include advanced analytics, comparison tools, and performance trends.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
