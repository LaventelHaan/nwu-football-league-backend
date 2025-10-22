"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Save, User, Mail, Phone, Calendar, Ruler, FootprintsIcon } from "lucide-react"
import Link from "next/link"

interface UserData {
  user_id: number
  email: string
  phone_e164: string | null
  is_active: boolean
  profile: {
    first_name: string
    last_name: string
    birth_date: string | null
  }
  roles: string[]
  player_data?: {
    dominant_foot: string
    height_cm: number
    preferred_position: string
  }
  coach_data?: {
    qualification: string
  }
}

export default function EditUserPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    phone_e164: '',
    first_name: '',
    last_name: '',
    birth_date: '',
    is_active: true,
    roles: [] as string[],
    // Player specific
    dominant_foot: '',
    height_cm: '',
    preferred_position: '',
    // Coach specific
    qualification: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/admin/users/${userId}`)
        const data = await response.json()
        
        if (data.success) {
          setUser(data.user)
          setFormData({
            email: data.user.email,
            phone_e164: data.user.phone_e164 || '',
            first_name: data.user.profile.first_name,
            last_name: data.user.profile.last_name,
            birth_date: data.user.profile.birth_date || '',
            is_active: data.user.is_active,
            roles: data.user.roles,
            dominant_foot: data.user.player_data?.dominant_foot || '',
            height_cm: data.user.player_data?.height_cm?.toString() || '',
            preferred_position: data.user.player_data?.preferred_position || '',
            qualification: data.user.coach_data?.qualification || '',
          })
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [userId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        router.push('/admin/users')
      } else {
        alert(data.error || 'Failed to update user')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleRoleChange = (role: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      roles: checked 
        ? [...prev.roles, role]
        : prev.roles.filter(r => r !== role)
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/users">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Edit User</h1>
            <p className="text-muted-foreground">Loading user data...</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading user...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">User not found</h1>
          <Link href="/admin/users">
            <Button>Back to Users</Button>
          </Link>
        </div>
      </div>
    )
  }

  const isPlayer = user.roles.includes('PLAYER')
  const isCoach = user.roles.includes('COACH')

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/users">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Edit User</h1>
            <p className="text-muted-foreground">
              Editing {user.profile.first_name} {user.profile.last_name}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main User Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name *</Label>
                      <Input
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name *</Label>
                      <Input
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birth_date">Birth Date</Label>
                    <Input
                      id="birth_date"
                      name="birth_date"
                      type="date"
                      value={formData.birth_date}
                      onChange={handleChange}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone_e164">Phone Number</Label>
                    <Input
                      id="phone_e164"
                      name="phone_e164"
                      type="tel"
                      value={formData.phone_e164}
                      onChange={handleChange}
                      placeholder="+27123456789"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Player Specific Information */}
              {isPlayer && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FootprintsIcon className="w-5 h-5" />
                      Player Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dominant_foot">Dominant Foot</Label>
                        <Select 
                          value={formData.dominant_foot} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, dominant_foot: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select foot" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LEFT">Left</SelectItem>
                            <SelectItem value="RIGHT">Right</SelectItem>
                            <SelectItem value="BOTH">Both</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="height_cm">Height (cm)</Label>
                        <Input
                          id="height_cm"
                          name="height_cm"
                          type="number"
                          value={formData.height_cm}
                          onChange={handleChange}
                          min="100"
                          max="250"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="preferred_position">Preferred Position</Label>
                      <Select 
                        value={formData.preferred_position} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, preferred_position: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GK">Goalkeeper</SelectItem>
                          <SelectItem value="CB">Center Back</SelectItem>
                          <SelectItem value="LB">Left Back</SelectItem>
                          <SelectItem value="RB">Right Back</SelectItem>
                          <SelectItem value="CDM">Defensive Midfielder</SelectItem>
                          <SelectItem value="CM">Central Midfielder</SelectItem>
                          <SelectItem value="CAM">Attacking Midfielder</SelectItem>
                          <SelectItem value="LW">Left Winger</SelectItem>
                          <SelectItem value="RW">Right Winger</SelectItem>
                          <SelectItem value="ST">Striker</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Coach Specific Information */}
              {isCoach && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Coach Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="qualification">Qualifications</Label>
                      <Input
                        id="qualification"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleChange}
                        placeholder="e.g., UEFA B License, National Diploma"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_active">Account Active</Label>
                    <input
                      id="is_active"
                      name="is_active"
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="w-4 h-4"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Roles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {['ADMIN', 'COACH', 'PLAYER', 'SCOUT'].map((role) => (
                    <div key={role} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`role-${role}`}
                        checked={formData.roles.includes(role)}
                        onChange={(e) => handleRoleChange(role, e.target.checked)}
                        className="w-4 h-4"
                      />
                      <Label htmlFor={`role-${role}`}>{role}</Label>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <Button type="submit" className="w-full" disabled={saving}>
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Link href="/admin/users">
                      <Button type="button" variant="outline" className="w-full">
                        Cancel
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}