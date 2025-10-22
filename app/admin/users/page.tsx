"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Shield,
  UserCheck,
  UserX,
  Eye,
  Plus,
  ArrowLeft,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

// Types based on your database schema
interface User {
  user_id: number
  email: string
  phone_e164: string | null
  is_active: boolean
  email_verified_at: string | null
  phone_verified_at: string | null
  created_at: string
  updated_at: string
  profile: {
    first_name: string
    last_name: string
    birth_date: string | null
  }
  roles: string[]
  organizations: Array<{
    organization_name: string
    org_role: string
  }>
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const router = useRouter()

  // Fetch users from database
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/users')
        const data = await response.json()
        
        if (data.success) {
          setUsers(data.users)
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === "" || 
      user.profile.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.profile.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone_e164?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = filterRole === "all" || user.roles.some(role => 
      role.toLowerCase().includes(filterRole.toLowerCase())
    )
    
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" && user.is_active) ||
      (filterStatus === "inactive" && !user.is_active)

    return matchesSearch && matchesRole && matchesStatus
  })

  const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !currentStatus })
      })

      if (response.ok) {
        setUsers(users.map(user => 
          user.user_id === userId 
            ? { ...user, is_active: !currentStatus }
            : user
        ))
      }
    } catch (error) {
      console.error('Error updating user status:', error)
    }
  }

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (!confirm(`Are you sure you want to delete user ${userName}? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        setUsers(users.filter(user => user.user_id !== userId))
      } else {
        alert(data.error || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Failed to delete user')
    }
  }

  const handleEditUser = (userId: number) => {
    router.push(`/admin/users/${userId}/edit`)
  }

  const handleViewUser = (userId: number) => {
    router.push(`/admin/users/${userId}`)
  }

  const handleAddUser = () => {
    router.push('/admin/users/new')
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString()
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive'
      case 'COACH':
        return 'default'
      case 'PLAYER':
        return 'secondary'
      case 'SCOUT':
        return 'outline'
      default:
        return 'outline'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">User Management</h1>
              <p className="text-muted-foreground">Manage system users and permissions</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage system users and permissions</p>
          </div>
        </div>
        <Button onClick={handleAddUser}>
          <Plus className="w-4 h-4 mr-2" />
          Add New User
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name, email, or phone..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="coach">Coach</option>
                <option value="player">Player</option>
                <option value="scout">Scout</option>
              </select>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Organizations</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No users found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {user.profile.first_name[0]}{user.profile.last_name[0]}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">
                            {user.profile.first_name} {user.profile.last_name}
                          </div>
                          {user.profile.birth_date && (
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(user.profile.birth_date)}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm">{user.email}</span>
                          {user.email_verified_at && (
                            <Badge variant="outline" className="text-xs">Verified</Badge>
                          )}
                        </div>
                        {user.phone_e164 && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm">{user.phone_e164}</span>
                            {user.phone_verified_at && (
                              <Badge variant="outline" className="text-xs">Verified</Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <Badge key={role} variant={getRoleBadgeVariant(role)}>
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {user.organizations.map((org, index) => (
                          <div key={index} className="text-sm">
                            <span className="font-medium">{org.organization_name}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {org.org_role}
                            </Badge>
                          </div>
                        ))}
                        {user.organizations.length === 0 && (
                          <span className="text-sm text-muted-foreground">No organizations</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? "default" : "secondary"}>
                        {user.is_active ? (
                          <>
                            <UserCheck className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <UserX className="w-3 h-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(user.created_at)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewUser(user.user_id)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditUser(user.user_id)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleToggleUserStatus(user.user_id, user.is_active)}
                          >
                            {user.is_active ? (
                              <>
                                <UserX className="w-4 h-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-4 h-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteUser(user.user_id, `${user.profile.first_name} ${user.profile.last_name}`)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}