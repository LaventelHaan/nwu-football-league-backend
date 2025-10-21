"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import {
  Trophy,
  Target,
  Users,
  TrendingUp,
  Calendar,
  AlertCircle,
  MessageSquare,
  LogOut,
  Settings,
  Mail,
  CheckCircle,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"


type Player = {
  player_id: number
  name: string
  email: string
  teamId: number
  team: string
  gamesPlayed: number
  goals: number
  assists: number
  performance: number
}

type PlayerInvite = {
  id: string
  scouterName: string
  message: string
  teamId: string
  createdAt: string
  status: "pending" | "accepted" | "declined"
}


export default function PlayerDashboard() {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [loading, setLoading] = useState(true)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [surname, setSurname] = useState("")
  const [email, setEmail] = useState("")
  const [trialInvites, setTrialInvites] = useState<PlayerInvite[]>([])
  const router = useRouter()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [fixtures, setFixtures] = useState<Fixture[]>([])

  useEffect(() => {
  const fetchPlayer = async () => {
    const userStr = localStorage.getItem("currentUser");
    if (!userStr) return setLoading(false);

    const user = JSON.parse(userStr);

    try {
      const res = await fetch(`http://localhost:3001/api/player/${user.email}`);
      if (!res.ok) throw new Error("Failed to fetch player");
      const playerData = await res.json();
      setCurrentPlayer(playerData);

      const nameParts = playerData.name.split(" ");
      setFirstName(nameParts[0] || "");
      setSurname(nameParts.slice(1).join(" ") || "");
      setEmail(playerData.email);
    } catch (err) {
      console.error("Player fetch error:", err);
    } finally {
      setLoading(false);
    }
	  };

	  fetchPlayer();
	}, []);
	
	useEffect(() => {
  if (!currentPlayer) return;

  const fetchFixtures = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/player/fixtures/${currentPlayer.player_id}`);
      if (!res.ok) throw new Error("Failed to fetch fixtures");
      const data = await res.json();
      setFixtures(data);
    } catch (err) {
      console.error("Fixtures fetch error:", err);
    }
  };

  fetchFixtures();
}, [currentPlayer]);


  useEffect(() => {
    if (!currentPlayer) return;

    const fetchAnnouncements = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/player/announcements/${currentPlayer.player_id}`);
        if (!res.ok) throw new Error("Failed to fetch announcements");
        const data = await res.json();
        setAnnouncements(data);
      } catch (err) {
        console.error("Announcements fetch error:", err);
      }
    };

  fetchAnnouncements();
  }, [currentPlayer]);

useEffect(() => {
  if (!currentPlayer) return;

  const fetchInvites = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/player/invites/${currentPlayer.player_id}`);
      if (!res.ok) throw new Error("Failed to fetch invites");
      const data: PlayerInvite[] = await res.json();
      setTrialInvites(data);
    } catch (err) {
      console.error("Invites fetch error:", err);
    }
  };

  fetchInvites();
}, [currentPlayer]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/login")
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPlayer) return

    const updatedName = `${firstName} ${surname}`.trim()
    const updatedPlayer = { ...currentPlayer, name: updatedName, email }

    localStorage.setItem("currentUser", JSON.stringify(updatedPlayer))
    setCurrentPlayer(updatedPlayer)
    setIsProfileOpen(false)
  }
  
  const handleInviteStatus = async (inviteId: string, status: "accepted" | "declined") => {
    try {
      await fetch(`http://localhost:3001/api/player/invites/${inviteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      setTrialInvites(trialInvites.map(inv =>
        inv.id === inviteId ? {
			...inv, status 
		} : inv
      ))
    } catch (err) {
      console.error("Failed to update invite status", err)
    }
  }
  
  const handleAcceptInvite = (inviteId: string) => handleInviteStatus(inviteId, "accepted")
  const handleDeclineInvite = (inviteId: string) => handleInviteStatus(inviteId, "declined")

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800 border-green-200"
      case "declined":
        return "bg-red-100 text-red-800 border-red-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-black text-primary">NWU</div>
              <div className="text-xl font-bold">Player Portal</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="font-semibold">{currentPlayer?.name}</div>
                <div className="text-sm text-muted-foreground">{currentPlayer?.team}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" title="Profile Settings">
                    <Settings className="w-5 h-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Profile</DialogTitle>
                    <DialogDescription>Update your personal information</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="surname">Surname</Label>
                      <Input id="surname" value={surname} onChange={(e) => setSurname(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsProfileOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Save Changes</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, {currentPlayer?.name.split(" ")[0]}</h1>
          <p className="text-muted-foreground">Track your performance and stay updated</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Matches Played</p>
                  <p className="text-3xl font-bold">{currentPlayer?.gamesPlayed}</p>
                  <p className="text-xs text-muted-foreground mt-1">This season</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Goals</p>
                  <p className="text-3xl font-bold">{currentPlayer?.goals}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total scored</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Assists</p>
                  <p className="text-3xl font-bold">{currentPlayer?.assists}</p>
                  <p className="text-xs text-muted-foreground mt-1">Team contributions</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Performance</p>
                  <p className="text-3xl font-bold">{currentPlayer?.performance}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Overall rating</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Team Announcements */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Team Announcements
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/player/announcements">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
			  <div className="space-y-4">
				{announcements.length > 0 ? (
				  announcements.slice(0, 3).map((announcement) => (
					<div key={announcement.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
					  <div className="flex items-start justify-between mb-2">
						<h3 className="font-semibold">{announcement.title}</h3>
						<Badge className={getPriorityColor(announcement.priority)} variant="outline">
						  {announcement.priority}
						</Badge>
					  </div>
					  <p className="text-sm text-muted-foreground mb-2">{announcement.message}</p>
					  <div className="flex items-center justify-between text-xs text-muted-foreground">
						<span>{new Date(announcement.date).toLocaleDateString()}</span>
						<span>From: NWU Football</span>
					  </div>
					</div>
				  ))
				) : (
				  <div className="text-center py-8 text-muted-foreground">
					<AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
					<p>No announcements at this time</p>
				  </div>
				)}
			  </div>
			</CardContent>
          </Card>

          {/* Upcoming Matches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Upcoming Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
			  <div className="space-y-3">
				{fixtures.length > 0 ? (
				  fixtures.slice(0, 5).map((match) => (
					<div key={match.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
					  <div className="flex items-center justify-between mb-2">
						<div className="font-semibold text-sm">
						  {match.homeTeam} vs {match.awayTeam}
						</div>
						<Badge variant="outline">{match.league}</Badge>
					  </div>
					  <div className="flex items-center justify-between text-xs text-muted-foreground">
						<span>
						  {new Date(match.datetime).toLocaleDateString()} •{" "}
						  {new Date(match.datetime).toLocaleTimeString()}
						</span>
						<Button size="sm" variant="ghost" asChild>
						  <Link href={`/player/match?id=${match.id}`}>Details</Link>
						</Button>
					  </div>
					</div>
				  ))
				) : (
				  <div className="text-center py-8 text-muted-foreground">
					<Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
					<p>No upcoming matches scheduled</p>
				  </div>
				)}
			  </div>
			</CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Trial Invitations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trialInvites.length > 0 ? (
                trialInvites.map((invite) => (
                  <div key={invite.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">Trial Invitation from {invite.scouterName}</h3>
                          <Badge className={getStatusColor(invite.status)} variant="outline">
                            {invite.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{invite.message}</p>
                        <div className="text-xs text-muted-foreground">
                          <p>Team: {invite.teamId}</p>
                          <p>Sent: {new Date(invite.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    {invite.status === "pending" && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptInvite(invite.id)}
                          className="flex items-center gap-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeclineInvite(invite.id)}
                          className="flex items-center gap-1"
                        >
                          <XCircle className="w-4 h-4" />
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No trial invitations at this time</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
