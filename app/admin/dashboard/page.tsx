"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Users,
  Calendar,
  Trophy,
  MapPin,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  TrendingUp,
  Eye,
  Zap,
} from "lucide-react"
import Link from "next/link"

// Aligned dashboard metrics based on centralized mock data
import { mockResults,mockTeamRegistrations, mockFixtures, mockPlayers, mockTeams } from "@/lib/mockData";

const dashboardMetrics = {
  // Count of team applications that are still pending
  pendingTeamApplications: mockTeamRegistrations.filter(reg => reg.status === "PENDING").length,

  // Count of fixtures that are pending approval
  unapprovedFixtures: mockFixtures.filter(fix => fix.status === "PENDING").length,

  // Total users (admin, coaches, players, scouters) — assuming you have a centralized users array
  totalUsers: 1247, // Replace with actual count if you have mockUsers: mockUsers.length

  // Count of active leagues based on unique league names in fixtures or registrations
  activeLeagues: Array.from(new Set(mockFixtures.map(f => f.league))).length,

  // Total venues used across all fixtures (unique)
  totalVenues: Array.from(new Set(mockFixtures.map(f => f.venue))).length,

  // Recent activity: you can generate dynamically from team registrations and fixtures
  recentActivity: [
    ...mockTeamRegistrations
      .slice(-3)
      .map(reg => ({
        id: reg.id,
        action: "Team Registration",
        description: `${reg.name} submitted registration application`,
        timestamp: "Just now", // or derive from submittedDate
        type: reg.status === "PENDING" ? "pending" : "approved",
        user: reg.coach || reg.organizer || "System",
      })),
    ...mockFixtures
      .slice(-3)
      .map(fix => ({
        id: fix.id,
        action: "Fixture Created",
        description: `${fix.homeTeam} vs ${fix.awayTeam} scheduled`,
        timestamp: "Just now",
        type: fix.status === "PENDING" ? "pending" : "approved",
        user: fix.createdBy || "System",
      })),
  ],

  // System stats derived from fixtures and players
  systemStats: {
    totalMatches: mockFixtures.length + mockResults.length,
    completedMatches: mockResults.length,
    upcomingMatches: mockFixtures.filter(f => f.status === "upcoming").length,
    totalGoals: mockPlayers.reduce((sum, p) => sum + p.goals, 0),
    averageGoalsPerMatch: parseFloat(
      (mockPlayers.reduce((sum, p) => sum + p.goals, 0) / (mockFixtures.length + mockResults.length)).toFixed(2)
    ),
  },
};


export default function AdminDashboard() {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "completed":
        return <CheckCircle className="w-4 h-4 text-blue-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getActivityBadgeColor = (type: string) => {
    switch (type) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">NWU Sports League Management System</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                Administrator
              </Badge>
              <Link href="/home">
                <Button variant="outline">View Public Site</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card/50 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{dashboardMetrics.pendingTeamApplications}</div>
              <p className="text-xs text-muted-foreground">Teams awaiting approval</p>
              <Link href="/admin/teams">
                <Button size="sm" variant="outline" className="mt-2 w-full bg-transparent">
                  Review Applications
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-red-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unapproved Fixtures</CardTitle>
              <Calendar className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{dashboardMetrics.unapprovedFixtures}</div>
              <p className="text-xs text-muted-foreground">Fixtures pending review</p>
              <Link href="/admin/fixtures">
                <Button size="sm" variant="outline" className="mt-2 w-full bg-transparent">
                  Review Fixtures
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{dashboardMetrics.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline w-3 h-3 mr-1" />
                +12% from last month
              </p>
              <Link href="/admin/users">
                <Button size="sm" variant="outline" className="mt-2 w-full bg-transparent">
                  Manage Users
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-green-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Leagues</CardTitle>
              <Trophy className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{dashboardMetrics.activeLeagues}</div>
              <p className="text-xs text-muted-foreground">Currently running</p>
              <Link href="/admin/leagues">
                <Button size="sm" variant="outline" className="mt-2 w-full bg-transparent">
                  View Leagues
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* System Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2 text-primary" />
                System Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{dashboardMetrics.systemStats.totalMatches}</div>
                  <div className="text-sm text-muted-foreground">Total Matches</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {dashboardMetrics.systemStats.completedMatches}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{dashboardMetrics.systemStats.upcomingMatches}</div>
                  <div className="text-sm text-muted-foreground">Upcoming</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{dashboardMetrics.systemStats.totalGoals}</div>
                  <div className="text-sm text-muted-foreground">Total Goals</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {dashboardMetrics.systemStats.averageGoalsPerMatch}
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Goals/Match</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">{dashboardMetrics.totalVenues}</div>
                  <div className="text-sm text-muted-foreground">Total Venues</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/live-scores" className="block">
                
                  
              </Link>
              <Link href="/admin/users" className="block">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
              </Link>
              <Link href="/admin/teams" className="block">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Trophy className="w-4 h-4 mr-2" />
                  Teams Participating in the League
                </Button>
              </Link>
              <Link href="/admin/fixtures" className="block">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Calendar className="w-4 h-4 mr-2" />
                  Fixture Management
                </Button>
              </Link>
              <Link href="/admin/venues" className="block">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <MapPin className="w-4 h-4 mr-2" />
                  Venue Management
                </Button>
              </Link>
              <Link href="/admin/players" className="block">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Users className="w-4 h-4 mr-2" />
                  Player Management
                </Button>
              </Link>
              <Link href="/admin/scouting" className="block">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Eye className="w-4 h-4 mr-2" />
                  Scouting Dashboard
                </Button>
              </Link>
              <Link href="/admin/faq" className="block">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  FAQ Management
                </Button>
              </Link>

            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="w-5 h-5 mr-2 text-primary" />
                Recent Activity
              </div>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardMetrics.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">{activity.action}</p>
                      <Badge variant="outline" className={getActivityBadgeColor(activity.type)}>
                        {activity.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground">by {activity.user}</p>
                      <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
