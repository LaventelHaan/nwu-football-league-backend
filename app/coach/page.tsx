"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sidebar } from "@/app/coach/layout/layout"
import DashboardStats  from "@/app/coach/dashboard/dashboard-stats"
import QuickActions from "@/app/coach/dashboard/quick-actions"
import  RecentActivity  from "@/app/coach/dashboard/recent-activity"
import { RecentMatches } from "@/app/coach/matches/recent-matches"
import { PlayersList } from "@/app/coach/players/players-list"
import { AnnouncementsList } from "@/app/coach/announcement/announcements-list"
import { UpcomingMatches } from "@/app/coach/matches/upcoming-matches"
import { TeamStatsComponent } from "@/app/coach/team/team-stats"
import { LeagueStandings } from "@/app/coach/league/league-standings"
import  FieldBookingComponent  from "@/components/ui/field-booking"
import { PlayerRequests } from "@/app/coach/requests/player-requests"
import  MatchesOverview from "@/app/coach/matches/matches-overview"
import { MedicalRecords } from "@/app/coach/medical/medical-records"
import {
  mockPlayers,
  mockAnnouncements,
  mockTeamStats,
  mockLeagueStandings,
  mockFieldBookings,
  mockPlayerRequests,
  mockMedicalRecords,
  mockRecentMatches,
  mockUpcomingMatches,
} from "@/lib/mockData"
import type { Player, Announcement, FieldBooking, PlayerRequest, MedicalRecord } from "@/lib/mockData"

export default function CoachDashboard() {
  const { coach, isAuthenticated, login, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [players, setPlayers] = useState(mockPlayers)
  const [announcements, setAnnouncements] = useState(mockAnnouncements)
  const [fieldBookings, setFieldBookings] = useState(mockFieldBookings)
  const [playerRequests, setPlayerRequests] = useState(mockPlayerRequests)
  const [medicalRecords, setMedicalRecords] = useState(mockMedicalRecords)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Load current user
  useEffect(() => {
    try {
      const userData = localStorage.getItem("currentUser")
      if (userData) {
        const user = JSON.parse(userData)
        setCurrentUser(user)
      }
    } catch (error) {
      console.error("Error loading user:", error)
    }
  }, [])


  
  // Player management functions
  const handleUpdatePlayer = (updatedPlayer: Player) => {
    setPlayers(players.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p)))
  }

   // Announcement management functions
  const handleCreateAnnouncement = (announcementData: Omit<Announcement, "id">) => {
    const newAnnouncement: Announcement = {
      ...announcementData,
      id: Date.now().toString(),
    }
    setAnnouncements([newAnnouncement, ...announcements])
  }


  const handleUpdateAnnouncement = (updatedAnnouncement: Announcement) => {
    setAnnouncements(announcements.map((a) => (a.id === updatedAnnouncement.id ? updatedAnnouncement : a)))
  }

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements(announcements.filter((a) => a.id !== id))
  }

  // Quick actions handler
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
        // In a real app, this would generate a report
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

  // Handlers for new features
  const handleCreateBooking = async (bookingData: Omit<FieldBooking, "id">) => {
    // First update local state for immediate UI feedback
    const newBooking: FieldBooking = {
      ...bookingData,
      id: Date.now(),
    }
    setFieldBookings([...fieldBookings, newBooking])

    // Then save to database
    try {
      console.log('Sending field booking to API:', {
        coachId: currentUser?.id || '1',
        date: bookingData.date,
        time: bookingData.time,
        duration: bookingData.duration,
        field: bookingData.field,
        purpose: bookingData.purpose,
        notes: bookingData.notes,
      });
      const response = await fetch('http://localhost:3002/api/field-bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coachId: '2', // Use a valid coach ID that exists in users table
          date: bookingData.date,
          time: bookingData.time,
          duration: bookingData.duration,
          field: bookingData.field,
          purpose: bookingData.purpose,
          notes: bookingData.notes,
        }),
      });

      console.log('Field booking API response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Field booking API error:', errorText);
      } else {
        const responseData = await response.json();
        console.log('Field booking saved successfully:', responseData);
      }
    } catch (error) {
      console.error('Error saving field booking:', error);
    }
  }

  const handleUpdateRequest = (id: string, status: PlayerRequest["status"], notes?: string) => {
    setPlayerRequests(
      playerRequests.map((req) => (req.id === id ? { ...req, status, notes: notes || req.notes } : req)),
    )
  }

  const handleCreateMedicalRecord = async (recordData: Omit<MedicalRecord, "id">) => {
    // First update local state for immediate UI feedback
    const newRecord: MedicalRecord = {
      ...recordData,
      id: Date.now(),
    }
    setMedicalRecords([...medicalRecords, newRecord])

    // Then save to database
    try {
      console.log('Sending medical record to API:', recordData);
      const response = await fetch('http://localhost:3002/api/medical-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...recordData,
          playerId: recordData.playerId.toString() // Ensure it's a string for the API
        }),
      });

      console.log('Medical record API response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Medical record API error:', errorText);
      } else {
        const responseData = await response.json();
        console.log('Medical record saved successfully:', responseData);
      }
    } catch (error) {
      console.error('Error saving medical record:', error);
    }
  }

  const handleUpdateMedicalRecord = async (updatedRecord: MedicalRecord) => {
    // First update local state for immediate UI feedback
    setMedicalRecords(medicalRecords.map((record) => (record.id === updatedRecord.id ? updatedRecord : record)))

    // Then save to database
    try {
      const response = await fetch(`http://localhost:3002/api/medical-records/${updatedRecord.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: updatedRecord.status }),
      });

      if (!response.ok) {
        console.error('Failed to update medical record in database');
      }
    } catch (error) {
      console.error('Error updating medical record:', error);
    }
  }
  // Render main content based on active tab
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
            <div>
              <h1 className="text-3xl font-bold text-foreground">Team Players</h1>
              <p className="text-muted-foreground">Manage your team roster and player information.</p>
            </div>
            <PlayersList players={players} onUpdatePlayer={handleUpdatePlayer} />
          </div>
        )

      case "announcements":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Announcements</h1>
              <p className="text-muted-foreground">Communicate with your team members.</p>
            </div>
            <AnnouncementsList
              announcements={announcements}
              players={players}
              onCreateAnnouncement={handleCreateAnnouncement}
              onUpdateAnnouncement={handleUpdateAnnouncement}
              onDeleteAnnouncement={handleDeleteAnnouncement}
            />
          </div>
        )

      case "matches":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Upcoming Matches</h1>
              <p className="text-muted-foreground">View and manage your team's match schedule.</p>
            </div>
            <UpcomingMatches matches={mockUpcomingMatches} />
          </div>
        )

      case "results":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Match Results</h1>
              <p className="text-muted-foreground">Review your team's recent performance.</p>
            </div>
            <RecentMatches matches={mockRecentMatches} />
          </div>
        )

      case "team-stats":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Team Statistics</h1>
              <p className="text-muted-foreground">Comprehensive overview of your team's performance</p>
            </div>
            <TeamStatsComponent stats={mockTeamStats} />
          </div>
        )

      case "league":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">League Standings</h1>
              <p className="text-muted-foreground">Current position in the university league</p>
            </div>
            <LeagueStandings standings={mockLeagueStandings} />
          </div>
        )

      case "bookings":
        return (
          <div className="space-y-6">
            <FieldBookingComponent bookings={fieldBookings} onCreateBooking={handleCreateBooking} />
          </div>
        )

      case "requests":
        return (
          <div className="space-y-6">
            <PlayerRequests requests={playerRequests} onUpdateRequest={handleUpdateRequest} />
          </div>
        )

      case "medical":
        return (
          <div className="space-y-6">
            <MedicalRecords
              records={medicalRecords}
              players={players}
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