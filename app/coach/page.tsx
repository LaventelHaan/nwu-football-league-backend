"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sidebar } from "@/app/coach/layout/layout"
import DashboardStats from "@/app/coach/dashboard/dashboard-stats"
import QuickActions from "@/app/coach/dashboard/quick-actions"
import RecentActivity from "@/app/coach/dashboard/recent-activity"
import { RecentMatches } from "@/app/coach/matches/recent-matches"
import { PlayersList } from "@/app/coach/players/players-list"
import { AnnouncementsList } from "@/app/coach/announcement/announcements-list"
import { UpcomingMatches } from "@/app/coach/matches/upcoming-matches"
import { TeamStatsComponent } from "@/app/coach/team/team-stats"
import { LeagueStandings } from "@/app/coach/league/league-standings"
import FieldBookingComponent from "@/app/coach/field-booking/page"
import { PlayerRequests } from "@/app/coach/requests/player-requests"
import MatchesOverview from "@/app/coach/matches/matches-overview"
import { MedicalRecords } from "@/app/coach/medical/medical-records"
import {
  mockPlayers,
  mockAnnouncements,
  mockTeamStats,
  mockLeagueStandings,
  mockFieldBookings,
  mockPlayerRequests,
  mockMedicalRecords,
  mockFixtures,
} from "@/lib/mockData"
import type { Player, Announcement, FieldBooking, PlayerRequest, MedicalRecord } from "@/lib/mockData"

export default function CoachDashboard() {
  const router = useRouter()

  const [coach, setCoach] = useState<{ name: string; team?: string; role: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [players, setPlayers] = useState(mockPlayers)
  const [announcements, setAnnouncements] = useState(mockAnnouncements)
  const [fieldBookings, setFieldBookings] = useState(mockFieldBookings)
  const [playerRequests, setPlayerRequests] = useState(mockPlayerRequests)
  const [medicalRecords, setMedicalRecords] = useState(mockMedicalRecords)

  // Load coach from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      setCoach(JSON.parse(storedUser))
    } else {
      router.replace("/login") // redirect if not logged in
    }
    setIsLoading(false)
  }, [router])

  // Fixtures
  const mockRecentMatches = mockFixtures.slice(0, 5)
  const mockUpcomingMatches = mockFixtures.slice(5, 10)

  // Filter records for coach's team
  const teamMedicalRecords = useMemo(() => {
    if (!coach?.team) return []
    return medicalRecords.filter((record) => record.team === coach.team)
  }, [coach, medicalRecords])

  const teamPlayers = useMemo(() => {
    if (!coach?.team) return []
    return players.filter((p) => p.team === coach.team)
  }, [coach, players])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Player management
  const handleUpdatePlayer = (updatedPlayer: Player) => {
    setPlayers(players.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p)))
  }

  // Announcements
  const handleCreateAnnouncement = (announcementData: Omit<Announcement, "id">) => {
    const newAnnouncement: Announcement = { ...announcementData, id: Date.now().toString() }
    setAnnouncements([newAnnouncement, ...announcements])
  }

  const handleUpdateAnnouncement = (updatedAnnouncement: Announcement) => {
    setAnnouncements(announcements.map((a) => (a.id === updatedAnnouncement.id ? updatedAnnouncement : a)))
  }

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements(announcements.filter((a) => a.id !== id))
  }

  // Quick actions
  const handleQuickAction = (action: string) => {
    switch (action) {
      case "new-announcement":
        setActiveTab("announcements")
        break
      case "add-player":
        setActiveTab("players")
        break
      case "schedule-match":
        setActiveTab("matches")
        break
      case "team-report":
        alert("Team report feature coming soon!")
        break
      case "new-booking":
        setActiveTab("bookings")
        break
      case "new-request":
        setActiveTab("requests")
        break
      case "new-medical-record":
        setActiveTab("medical")
        break
    }
  }

  // Bookings
  const handleCreateBooking = (bookingData: Omit<FieldBooking, "id">) => {
    const newBooking: FieldBooking = { ...bookingData, id: Date.now().toString() }
    setFieldBookings([...fieldBookings, newBooking])
  }

  // Requests
  const handleUpdateRequest = (id: string, status: PlayerRequest["status"], notes?: string) => {
    setPlayerRequests(
      playerRequests.map((req) => (req.id === id ? { ...req, status, notes: notes || req.notes } : req)),
    )
  }

  // Medical Records
  const handleCreateMedicalRecord = (recordData: Omit<MedicalRecord, "id">) => {
    const newRecord: MedicalRecord = { ...recordData, id: Date.now().toString() }
    setMedicalRecords([...medicalRecords, newRecord])
  }

  const handleUpdateMedicalRecord = (updatedRecord: MedicalRecord) => {
    setMedicalRecords(medicalRecords.map((r) => (r.id === updatedRecord.id ? updatedRecord : r)))
  }

  // Render tabs
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Welcome back, {coach?.name}</h1>
              <p className="text-muted-foreground">Here's what's happening with your team today.</p>
            </div>

            <DashboardStats
              players={players}
              recentMatches={mockRecentMatches}
              announcements={announcements}
              upcomingMatches={mockUpcomingMatches}
            />

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <MatchesOverview upcomingMatches={mockUpcomingMatches} recentMatches={mockRecentMatches} />
              </div>
              <div className="space-y-6">
                <QuickActions onAction={handleQuickAction} />
                <RecentActivity announcements={announcements} players={players} />
              </div>
            </div>
          </div>
        )

      case "players":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Team Players</h1>
            <p className="text-muted-foreground">Manage your team roster and player information.</p>
            <PlayersList players={teamPlayers} onUpdatePlayer={handleUpdatePlayer} />
          </div>
        )

      case "announcements":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Announcements</h1>
            <p className="text-muted-foreground">Communicate with your team members.</p>
            <AnnouncementsList
              announcements={announcements}
              players={teamPlayers}
              coachTeam={coach?.team || ""}
              onCreateAnnouncement={handleCreateAnnouncement}
              onUpdateAnnouncement={handleUpdateAnnouncement}
              onDeleteAnnouncement={handleDeleteAnnouncement}
            />
          </div>
        )

      case "matches":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Upcoming Matches</h1>
            <p className="text-muted-foreground">View and manage your team's match schedule.</p>
            <UpcomingMatches fixtures={mockUpcomingMatches.filter(f => f.homeTeam === coach?.team || f.awayTeam === coach?.team)} />
          </div>
        )

      case "results":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Match Results</h1>
            <p className="text-muted-foreground">Review your team's recent performance.</p>
            <RecentMatches matches={mockRecentMatches.filter(f => f.homeTeam === coach?.team || f.awayTeam === coach?.team)} />
          </div>
        )

      case "team-stats":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Team Statistics</h1>
            <p className="text-muted-foreground">Comprehensive overview of your team's performance</p>
            <TeamStatsComponent stats={mockTeamStats} />
          </div>
        )

      case "league":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">League Standings</h1>
            <p className="text-muted-foreground">Current position in the university league</p>
            <LeagueStandings standings={mockLeagueStandings} />
          </div>
        )

      case "bookings":
        return <FieldBookingComponent bookings={fieldBookings} onCreateBooking={handleCreateBooking} />

      case "requests":
        return <PlayerRequests requests={playerRequests} onUpdateRequest={handleUpdateRequest} />

      case "medical":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Medical Records</h1>
            <p className="text-muted-foreground">Track player health and medical information.</p>
            <MedicalRecords
              records={teamMedicalRecords}
              players={teamPlayers}
              onCreateRecord={handleCreateMedicalRecord}
              onUpdateRecord={handleUpdateMedicalRecord}
            />
          </div>
        )

      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Page Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">The requested page could not be found.</p>
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">{renderContent()}</div>
      </main>
    </div>
  )
}
