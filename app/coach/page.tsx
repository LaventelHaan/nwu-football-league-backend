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
import FieldBookingComponent from "@/components/ui/field-booking"
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
  const [recentMatches, setRecentMatches] = useState(mockRecentMatches)



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
    try {
      // Generate a unique ID for the booking
      const bookingId = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const response = await fetch('/api/field-bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: bookingId,
          ...bookingData,
        }),
      });

      if (response.ok) {
        console.log('Field booking created successfully');
        // Refresh the bookings list
        fetchFieldBookings();
      } else {
        const error = await response.json();
        console.error('Error creating field booking:', error);
        alert(error.error || 'Error creating field booking');
      }
    } catch (error) {
      console.error('Error creating field booking:', error);
      alert('Error creating field booking');
    }
  }

  const handleUpdateRequest = (id: string, status: PlayerRequest["status"], notes?: string) => {
    setPlayerRequests(
      playerRequests.map((req) => (req.id === id ? { ...req, status, notes: notes || req.notes } : req)),
    )
  }

  const handleCreateMedicalRecord = async (recordData: Omit<MedicalRecord, "id">) => {
    try {
      // Transform the data to match API expectations
      const apiData = {
        player_id: recordData.playerId,
        player_name: players.find(p => p.id === parseInt(recordData.playerId))?.name || '',
        date: recordData.date,
        type: recordData.type,
        description: recordData.description,
        doctor: recordData.doctor,
        status: recordData.status,
        follow_up_date: recordData.followUpDate,
        restrictions: recordData.restrictions,
        medications: recordData.medications,
        created_by: coach?.name || 'Coach'
      };

      const response = await fetch('/api/medical-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (response.ok) {
        console.log('Medical record created successfully');
        // Refresh medical records by fetching from API
        fetchMedicalRecords();
      } else {
        const error = await response.json();
        console.error('Error creating medical record:', error);
        alert(error.error || 'Error creating medical record');
      }
    } catch (error) {
      console.error('Error creating medical record:', error);
      alert('Error creating medical record');
    }
  };

  const handleUpdateMedicalRecord = async (updatedRecord: MedicalRecord) => {
    try {
      const response = await fetch(`/api/medical-records/${updatedRecord.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: updatedRecord.status }),
      })

      if (response.ok) {
        console.log('Medical record updated successfully')
        // Refresh medical records by fetching from API
        fetchMedicalRecords()
      } else {
        const error = await response.json()
        console.error('Error updating medical record:', error)
        alert(error.error || 'Error updating medical record')
      }
    } catch (error) {
      console.error('Error updating medical record:', error)
      alert('Error updating medical record')
    }
  }

  // Fetch functions
  const fetchMedicalRecords = async () => {
    try {
      const response = await fetch('/api/medical-records')
      if (response.ok) {
        const data = await response.json()
        // Transform data to match expected format
        const transformedData = data.map((record: any) => ({
          ...record,
          restrictions: record.restrictions ? JSON.parse(record.restrictions) : undefined,
          medications: record.medications ? JSON.parse(record.medications) : undefined,
        }))
        setMedicalRecords(transformedData)
      } else {
        console.error('Failed to fetch medical records')
      }
    } catch (error) {
      console.error('Error fetching medical records:', error)
    }
  }

  const fetchFieldBookings = async () => {
    try {
      const response = await fetch('/api/field-bookings')
      if (response.ok) {
        const data = await response.json()
        setFieldBookings(data)
      } else {
        console.error('Failed to fetch field bookings')
      }
    } catch (error) {
      console.error('Error fetching field bookings:', error)
    }
  }

  // Initialize data on mount
  useEffect(() => {
    fetchMedicalRecords()
    fetchFieldBookings()
  }, [])

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
              recentMatches={mockRecentMatches as any}
              announcements={announcements}
              upcomingMatches={mockUpcomingMatches as any}
            />

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <MatchesOverview upcomingMatches={mockUpcomingMatches as any} recentMatches={mockRecentMatches as any} />
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
            <RecentMatches matches={mockRecentMatches as any} />
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