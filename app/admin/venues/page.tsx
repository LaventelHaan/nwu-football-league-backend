"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { MapPin, Search, Plus, Edit, Trash2, Users, Calendar, Phone, Mail, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

// Types
interface Venue {
  id: number
  name: string
  address: string
  city: string
  capacity: number
  surface: string
  status: string
  type: string
  facilities: string[]
  contact: {
    manager: string
    phone: string
    email: string
  }
  fields: Field[]
  bookings: number
  fieldCount: number
  lastMaintenance: string
  nextMaintenance: string
}

interface Field {
  id: number
  name: string
  dimensions: string
  surface: string
  status: string
  activeBookings?: number
}

const venueTypes = ["Stadium", "Multi-purpose", "Training Ground", "Indoor Arena"]
const surfaceTypes = ["Natural Grass", "Artificial Turf", "Hybrid Grass", "Indoor Court"]
const statusOptions = ["Active", "Inactive"]

export default function VenueManagement() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false)
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null)
  const [editingField, setEditingField] = useState<Field | null>(null)
  const [newVenue, setNewVenue] = useState({
    name: "",
    address: "",
    city: "",
    capacity: "",
    surface: "",
    status: "Active",
    facilities: [] as string[],
    fields: [] as Array<{ name: string }>,
    contact: {
      manager: "",
      phone: "",
      email: "",
    },
  })
  const [newField, setNewField] = useState({
    name: "",
    status: "Active"
  })

  // Fetch venues from API
  const fetchVenues = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/venues')
      if (response.ok) {
        const data = await response.json()
        setVenues(data)
      } else {
        console.error('Failed to fetch venues')
        toast.error('Failed to load venues')
      }
    } catch (error) {
      console.error('Error fetching venues:', error)
      toast.error('Failed to load venues')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVenues()
  }, [])

  const filteredVenues = venues.filter((venue) => {
    const matchesSearch =
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.city.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "ALL" || venue.type === typeFilter
    const matchesStatus = statusFilter === "ALL" || venue.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  const handleViewDetails = async (venue: Venue) => {
    try {
      const response = await fetch(`/api/admin/venues/${venue.id}`)
      if (response.ok) {
        const venueDetails = await response.json()
        setSelectedVenue(venueDetails)
        setIsDetailDialogOpen(true)
      }
    } catch (error) {
      console.error('Error fetching venue details:', error)
      toast.error('Failed to load venue details')
    }
  }

  const handleEditVenue = (venue: Venue) => {
    setEditingVenue({ ...venue })
    setIsEditDialogOpen(true)
  }

  const handleUpdateVenue = async () => {
    if (!editingVenue) return

    try {
      const response = await fetch(`/api/admin/venues/${editingVenue.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingVenue.name,
          address: editingVenue.address,
          city: editingVenue.city,
          capacity: editingVenue.capacity,
          surface: editingVenue.surface,
          status: editingVenue.status,
        }),
      })

      if (response.ok) {
        await fetchVenues()
        setIsEditDialogOpen(false)
        setEditingVenue(null)
        toast.success('Venue updated successfully')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update venue')
      }
    } catch (error) {
      console.error('Error updating venue:', error)
      toast.error('Failed to update venue')
    }
  }

  const handleCreateVenue = async () => {
    try {
      const response = await fetch('/api/admin/venues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newVenue.name,
          address: newVenue.address,
          city: newVenue.city,
          capacity: parseInt(newVenue.capacity),
          surface: newVenue.surface,
          fields: newVenue.fields
        }),
      })

      if (response.ok) {
        await fetchVenues()
        setIsCreateDialogOpen(false)
        setNewVenue({
          name: "",
          address: "",
          city: "",
          capacity: "",
          surface: "",
          status: "Active",
          facilities: [],
          fields: [],
          contact: {
            manager: "",
            phone: "",
            email: "",
          },
        })
        toast.success('Venue created successfully')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create venue')
      }
    } catch (error) {
      console.error('Error creating venue:', error)
      toast.error('Failed to create venue')
    }
  }

  const handleDeleteVenue = async (venueId: number) => {
    if (confirm("Are you sure you want to permanently delete this venue? This action cannot be undone.")) {
      try {
        const response = await fetch(`/api/admin/venues/${venueId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          await fetchVenues()
          toast.success('Venue deleted successfully')
        } else {
          const error = await response.json()
          toast.error(error.error || 'Failed to delete venue')
        }
      } catch (error) {
        console.error('Error deleting venue:', error)
        toast.error('Failed to delete venue')
      }
    }
  }

  const handleToggleStatus = async (venueId: number, currentStatus: string) => {
    try {
      const venue = venues.find(v => v.id === venueId)
      if (!venue) return

      const newStatus = currentStatus === "Active" ? "Inactive" : "Active"
      
      const response = await fetch(`/api/admin/venues/${venueId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...venue,
          status: newStatus,
        }),
      })

      if (response.ok) {
        await fetchVenues()
        toast.success(`Venue ${newStatus.toLowerCase()} successfully`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update venue status')
      }
    } catch (error) {
      console.error('Error updating venue status:', error)
      toast.error('Failed to update venue status')
    }
  }

  // Field Management Functions
  const handleEditField = (field: Field) => {
    setEditingField({ ...field })
    setIsFieldDialogOpen(true)
  }

  // In handleUpdateField function:
const handleUpdateField = async () => {
  if (!editingField || !selectedVenue) return

  try {
    const response = await fetch(
      `/api/admin/venues/${selectedVenue.id}/fields/manage?fieldId=${editingField.id}&venueId=${selectedVenue.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingField.name,
          status: editingField.status,
        }),
      }
    )

    if (response.ok) {
      await fetchVenues()
      const venueResponse = await fetch(`/api/admin/venues/${selectedVenue.id}`)
      if (venueResponse.ok) {
        const venueDetails = await venueResponse.json()
        setSelectedVenue(venueDetails)
      }
      setIsFieldDialogOpen(false)
      setEditingField(null)
      toast.success('Field updated successfully')
    } else {
      const error = await response.json()
      toast.error(error.error || 'Failed to update field')
    }
  } catch (error) {
    console.error('Error updating field:', error)
    toast.error('Failed to update field')
  }
}

// In handleDeleteField function:
const handleDeleteField = async (fieldId: number) => {
  if (!selectedVenue) return

  if (confirm("Are you sure you want to permanently delete this field? This action cannot be undone.")) {
    try {
      const response = await fetch(
        `/api/admin/venues/${selectedVenue.id}/fields/manage?fieldId=${fieldId}&venueId=${selectedVenue.id}`,
        {
          method: 'DELETE',
        }
      )

      if (response.ok) {
        await fetchVenues()
        const venueResponse = await fetch(`/api/admin/venues/${selectedVenue.id}`)
        if (venueResponse.ok) {
          const venueDetails = await venueResponse.json()
          setSelectedVenue(venueDetails)
        }
        toast.success('Field deleted successfully')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete field')
      }
    } catch (error) {
      console.error('Error deleting field:', error)
      toast.error('Failed to delete field')
    }
  }
}

// In handleAddField function (stays the same):
const handleAddField = async (venueId: number) => {
  try {
    const response = await fetch(`/api/admin/venues/${venueId}/fields`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: newField.name,
      }),
    })

    if (response.ok) {
      await fetchVenues()
      if (selectedVenue?.id === venueId) {
        const venueResponse = await fetch(`/api/admin/venues/${venueId}`)
        if (venueResponse.ok) {
          const venueDetails = await venueResponse.json()
          setSelectedVenue(venueDetails)
        }
      }
      setNewField({ name: "", status: "Active" })
      toast.success('Field added successfully')
    } else {
      const error = await response.json()
      toast.error(error.error || 'Failed to add field')
    }
  } catch (error) {
    console.error('Error adding field:', error)
    toast.error('Failed to add field')
  }
}

  const handleToggleFieldStatus = async (fieldId: number, currentStatus: string) => {
    if (!selectedVenue) return

    const field = selectedVenue.fields.find(f => f.id === fieldId)
    if (!field) return

    const newStatus = currentStatus === "Active" ? "Inactive" : "Active"
    
    try {
      const response = await fetch(`/api/admin/venues/${selectedVenue.id}/fields/${fieldId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: field.name,
          status: newStatus,
        }),
      })

      if (response.ok) {
        const venueResponse = await fetch(`/api/admin/venues/${selectedVenue.id}`)
        if (venueResponse.ok) {
          const venueDetails = await venueResponse.json()
          setSelectedVenue(venueDetails)
        }
        toast.success(`Field ${newStatus.toLowerCase()} successfully`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update field status')
      }
    } catch (error) {
      console.error('Error updating field status:', error)
      toast.error('Failed to update field status')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200"
      case "Maintenance":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Inactive":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const availableFacilities = [
    "Floodlights",
    "Changing Rooms",
    "Medical Room",
    "VIP Lounge",
    "Press Box",
    "Scoreboard",
    "Concessions",
    "Equipment Storage",
    "Parking",
    "Security",
  ]

  const handleFacilityToggle = (facility: string, isEditing = false) => {
    if (isEditing && editingVenue) {
      const facilities = editingVenue.facilities.includes(facility)
        ? editingVenue.facilities.filter((f: string) => f !== facility)
        : [...editingVenue.facilities, facility]
      setEditingVenue({ ...editingVenue, facilities })
    } else {
      const facilities = newVenue.facilities.includes(facility)
        ? newVenue.facilities.filter((f) => f !== facility)
        : [...newVenue.facilities, facility]
      setNewVenue({ ...newVenue, facilities })
    }
  }

  const addFieldToNewVenue = () => {
    if (newVenue.fields.some(f => f.name === newField.name)) {
      toast.error('Field name must be unique')
      return
    }
    setNewVenue({
      ...newVenue,
      fields: [...newVenue.fields, { name: newField.name }]
    })
    setNewField({ name: "", status: "Active" })
  }

  const removeFieldFromNewVenue = (index: number) => {
    const updatedFields = newVenue.fields.filter((_, i) => i !== index)
    setNewVenue({ ...newVenue, fields: updatedFields })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading venues...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Venue Management</h1>
              <p className="text-muted-foreground mt-1">Manage venues, fields, and facility information</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Venue
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
                    placeholder="Search venues by name, address, or city..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    {venueTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Venues Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredVenues.map((venue) => (
            <Card key={venue.id} className="bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{venue.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{venue.address}, {venue.city}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={getStatusColor(venue.status)}>
                    {venue.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Users className="w-4 h-4 mr-2" />
                      Capacity: {venue.capacity.toLocaleString()}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      {venue.bookings} Bookings
                    </div>
                    <div className="text-muted-foreground">Type: {venue.type}</div>
                    <div className="text-muted-foreground">Surface: {venue.surface}</div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Fields ({venue.fieldCount})</p>
                    <div className="space-y-1">
                      {venue.fields.slice(0, 2).map((field) => (
                        <div key={field.id} className="text-xs text-muted-foreground flex items-center justify-between">
                          <span>{field.name}</span>
                          <Badge
                            variant="outline"
                            className={getStatusColor(field.status)}
                            style={{ fontSize: "10px", padding: "2px 6px" }}
                          >
                            {field.status}
                          </Badge>
                        </div>
                      ))}
                      {venue.fields.length > 2 && (
                        <div className="text-xs text-muted-foreground">+{venue.fields.length - 2} more fields</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Facilities</p>
                    <div className="flex flex-wrap gap-1">
                      {venue.facilities.slice(0, 3).map((facility) => (
                        <Badge key={facility} variant="secondary" className="text-xs">
                          {facility}
                        </Badge>
                      ))}
                      {venue.facilities.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{venue.facilities.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(venue)}>
                      View Details
                    </Button>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditVenue(venue)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(venue.id, venue.status)}
                        className={venue.status === "Active" ? "text-yellow-600" : "text-green-600"}
                      >
                        {venue.status === "Active" ? (
                          <AlertCircle className="w-4 h-4" />
                        ) : (
                          <Users className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteVenue(venue.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredVenues.length === 0 && !loading && (
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No venues found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detail Dialog with Field Management */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>{selectedVenue?.name} Details</span>
              </div>
              <Button 
                onClick={() => {
                  setNewField({ name: "", status: "Active" })
                  setIsFieldDialogOpen(true)
                }}
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Field
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedVenue && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant="outline" className={getStatusColor(selectedVenue.status)}>
                    {selectedVenue.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <p className="text-sm">{selectedVenue.type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Capacity</Label>
                  <p className="text-sm">{selectedVenue.capacity.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Surface</Label>
                  <p className="text-sm">{selectedVenue.surface}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Address</Label>
                <p className="text-sm text-muted-foreground">{selectedVenue.address}, {selectedVenue.city}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Fields ({selectedVenue.fields.length})</Label>
                <div className="mt-2 space-y-2">
                  {selectedVenue.fields.map((field) => (
                    <div key={field.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{field.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {field.dimensions} • {field.surface}
                          {field.activeBookings && field.activeBookings > 0 && (
                            <span className="ml-2 text-orange-600">
                              • {field.activeBookings} active booking(s)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getStatusColor(field.status)}>
                          {field.status}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditField(field)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleFieldStatus(field.id, field.status)}
                          className={field.status === "Active" ? "text-yellow-600" : "text-green-600"}
                        >
                          {field.status === "Active" ? (
                            <AlertCircle className="w-3 h-3" />
                          ) : (
                            <Users className="w-3 h-3" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteField(field.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {selectedVenue.fields.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No fields added yet
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Facilities</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedVenue.facilities.map((facility) => (
                    <Badge key={facility} variant="secondary">
                      {facility}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Total Bookings</Label>
                  <p className="text-sm">{selectedVenue.bookings}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Maintenance</Label>
                  <p className="text-sm">{selectedVenue.lastMaintenance}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Venue Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Venue</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Venue Name</Label>
                <Input
                  id="name"
                  placeholder="Enter venue name"
                  value={newVenue.name}
                  onChange={(e) => setNewVenue({ ...newVenue, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  placeholder="Enter capacity"
                  value={newVenue.capacity}
                  onChange={(e) => setNewVenue({ ...newVenue, capacity: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Enter venue address"
                value={newVenue.address}
                onChange={(e) => setNewVenue({ ...newVenue, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Enter city"
                  value={newVenue.city}
                  onChange={(e) => setNewVenue({ ...newVenue, city: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="surface">Surface</Label>
                <Select
                  value={newVenue.surface}
                  onValueChange={(value) => setNewVenue({ ...newVenue, surface: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select surface type" />
                  </SelectTrigger>
                  <SelectContent>
                    {surfaceTypes.map((surface) => (
                      <SelectItem key={surface} value={surface}>
                        {surface}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Fields Section for New Venue */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Fields</Label>
              <div className="space-y-3">
                {newVenue.fields.map((field, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <span className="text-sm">{field.name}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFieldFromNewVenue(index)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter field name"
                    value={newField.name}
                    onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                  />
                  <Button onClick={addFieldToNewVenue} disabled={!newField.name}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateVenue}
                disabled={!newVenue.name || !newVenue.address || !newVenue.capacity || !newVenue.surface}
              >
                Create Venue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Venue Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Venue</DialogTitle>
          </DialogHeader>
          {editingVenue && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editName">Venue Name</Label>
                  <Input
                    id="editName"
                    value={editingVenue.name}
                    onChange={(e) => setEditingVenue({ ...editingVenue, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="editCapacity">Capacity</Label>
                  <Input
                    id="editCapacity"
                    type="number"
                    value={editingVenue.capacity}
                    onChange={(e) =>
                      setEditingVenue({ ...editingVenue, capacity: Number.parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="editAddress">Address</Label>
                <Textarea
                  id="editAddress"
                  value={editingVenue.address}
                  onChange={(e) => setEditingVenue({ ...editingVenue, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="editCity">City</Label>
                  <Input
                    id="editCity"
                    value={editingVenue.city}
                    onChange={(e) => setEditingVenue({ ...editingVenue, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="editSurface">Surface</Label>
                  <Select
                    value={editingVenue.surface}
                    onValueChange={(value) => setEditingVenue({ ...editingVenue, surface: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {surfaceTypes.map((surface) => (
                        <SelectItem key={surface} value={surface}>
                          {surface}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editStatus">Status</Label>
                  <Select
                    value={editingVenue.status}
                    onValueChange={(value) => setEditingVenue({ ...editingVenue, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateVenue}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Field Management Dialog */}
      <Dialog open={isFieldDialogOpen} onOpenChange={setIsFieldDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingField ? 'Edit Field' : 'Add New Field'}
            </DialogTitle>
            {editingField?.activeBookings && editingField.activeBookings > 0 && (
              <DialogDescription className="text-orange-600">
                This field has {editingField.activeBookings} active booking(s). 
                You cannot deactivate or delete it until these bookings are completed or cancelled.
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="fieldName">Field Name</Label>
              <Input
                id="fieldName"
                placeholder="Enter field name"
                value={editingField ? editingField.name : newField.name}
                onChange={(e) => 
                  editingField 
                    ? setEditingField({ ...editingField, name: e.target.value })
                    : setNewField({ ...newField, name: e.target.value })
                }
              />
            </div>

            {editingField && (
            <div>
              <Label htmlFor="fieldStatus">Status</Label>
              <Select
                value={editingField.status}
                onValueChange={(value) => setEditingField({ ...editingField, status: value })}
                disabled={!!(editingField.activeBookings && editingField.activeBookings > 0 && editingField.status === "Active")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editingField.activeBookings && editingField.activeBookings > 0 && editingField.status === "Active" && (
                <p className="text-xs text-orange-600 mt-1">
                  Cannot deactivate field with active bookings
                </p>
              )}
            </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => {
                setIsFieldDialogOpen(false)
                setEditingField(null)
              }}>
                Cancel
              </Button>
              {editingField ? (
                <Button 
                  onClick={handleUpdateField}
                  disabled={!editingField.name}
                >
                  Save Changes
                </Button>
              ) : (
                <Button 
                  onClick={() => selectedVenue && handleAddField(selectedVenue.id)}
                  disabled={!newField.name}
                >
                  Add Field
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
