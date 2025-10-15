"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { MapPin, Search, Plus, Edit, Trash2, Users, Calendar, Phone, Mail, AlertCircle } from "lucide-react"
import Link from "next/link"

// Mock venue data
const mockVenues = [
  {
    id: 1,
    name: "Main Stadium",
    address: "University Campus, Potchefstroom",
    capacity: 15000,
    type: "Stadium",
    surface: "Natural Grass",
    status: "Active",
    facilities: ["Floodlights", "Changing Rooms", "Medical Room", "VIP Lounge", "Parking"],
    contact: {
      manager: "John Smith",
      phone: "+27 18 299 1234",
      email: "stadium@nwu.ac.za",
    },
    fields: [
      {
        id: 1,
        name: "Main Pitch",
        dimensions: "105m x 68m",
        surface: "Natural Grass",
        status: "Active",
      },
    ],
    bookings: 45,
    lastMaintenance: "2024-02-15",
    nextMaintenance: "2024-04-15",
  },
  {
    id: 2,
    name: "Sports Complex A",
    address: "Sports Village, NWU Campus",
    capacity: 5000,
    type: "Multi-purpose",
    surface: "Artificial Turf",
    status: "Active",
    facilities: ["Floodlights", "Changing Rooms", "Scoreboard", "Parking"],
    contact: {
      manager: "Sarah Johnson",
      phone: "+27 18 299 5678",
      email: "complexa@nwu.ac.za",
    },
    fields: [
      {
        id: 2,
        name: "Field A1",
        dimensions: "100m x 64m",
        surface: "Artificial Turf",
        status: "Active",
      },
      {
        id: 3,
        name: "Field A2",
        dimensions: "100m x 64m",
        surface: "Artificial Turf",
        status: "Active",
      },
    ],
    bookings: 32,
    lastMaintenance: "2024-03-01",
    nextMaintenance: "2024-05-01",
  },
  {
    id: 3,
    name: "Sports Complex B",
    address: "Recreation Center, NWU Campus",
    capacity: 3000,
    type: "Training Ground",
    surface: "Natural Grass",
    status: "Maintenance",
    facilities: ["Changing Rooms", "Equipment Storage"],
    contact: {
      manager: "Mike Williams",
      phone: "+27 18 299 9012",
      email: "complexb@nwu.ac.za",
    },
    fields: [
      {
        id: 4,
        name: "Training Pitch 1",
        dimensions: "90m x 60m",
        surface: "Natural Grass",
        status: "Maintenance",
      },
      {
        id: 5,
        name: "Training Pitch 2",
        dimensions: "90m x 60m",
        surface: "Natural Grass",
        status: "Active",
      },
    ],
    bookings: 18,
    lastMaintenance: "2024-03-10",
    nextMaintenance: "2024-03-25",
  },
  {
    id: 4,
    name: "University Stadium",
    address: "Main Campus, Potchefstroom",
    capacity: 8000,
    type: "Stadium",
    surface: "Hybrid Grass",
    status: "Active",
    facilities: ["Floodlights", "Changing Rooms", "Press Box", "Concessions", "Parking"],
    contact: {
      manager: "Emma Davis",
      phone: "+27 18 299 3456",
      email: "unistadium@nwu.ac.za",
    },
    fields: [
      {
        id: 6,
        name: "Championship Pitch",
        dimensions: "105m x 68m",
        surface: "Hybrid Grass",
        status: "Active",
      },
    ],
    bookings: 28,
    lastMaintenance: "2024-01-20",
    nextMaintenance: "2024-04-20",
  },
]

const venueTypes = ["Stadium", "Multi-purpose", "Training Ground", "Indoor Arena"]
const surfaceTypes = ["Natural Grass", "Artificial Turf", "Hybrid Grass", "Indoor Court"]
const statusOptions = ["Active", "Maintenance", "Inactive"]

export default function VenueManagement() {
  const [venues, setVenues] = useState(mockVenues)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [selectedVenue, setSelectedVenue] = useState<any>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingVenue, setEditingVenue] = useState<any>(null)
  const [newVenue, setNewVenue] = useState({
    name: "",
    address: "",
    capacity: "",
    type: "",
    surface: "",
    status: "Active",
    facilities: [] as string[],
    contact: {
      manager: "",
      phone: "",
      email: "",
    },
  })

  const filteredVenues = venues.filter((venue) => {
    const matchesSearch =
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "ALL" || venue.type === typeFilter
    const matchesStatus = statusFilter === "ALL" || venue.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  const handleViewDetails = (venue: any) => {
    setSelectedVenue(venue)
    setIsDetailDialogOpen(true)
  }

  const handleEditVenue = (venue: any) => {
    setEditingVenue({ ...venue })
    setIsEditDialogOpen(true)
  }

  const handleUpdateVenue = () => {
    setVenues(venues.map((venue) => (venue.id === editingVenue.id ? editingVenue : venue)))
    setIsEditDialogOpen(false)
    setEditingVenue(null)
  }

  const handleCreateVenue = () => {
    const venue = {
      id: venues.length + 1,
      ...newVenue,
      capacity: Number.parseInt(newVenue.capacity),
      fields: [],
      bookings: 0,
      lastMaintenance: new Date().toISOString().split("T")[0],
      nextMaintenance: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    }
    setVenues([...venues, venue])
    setIsCreateDialogOpen(false)
    setNewVenue({
      name: "",
      address: "",
      capacity: "",
      type: "",
      surface: "",
      status: "Active",
      facilities: [],
      contact: {
        manager: "",
        phone: "",
        email: "",
      },
    })
  }

  const handleDeleteVenue = (venueId: number) => {
    if (confirm("Are you sure you want to delete this venue?")) {
      setVenues(venues.filter((venue) => venue.id !== venueId))
    }
  }

  const handleToggleStatus = (venueId: number) => {
    setVenues(
      venues.map((venue) =>
        venue.id === venueId ? { ...venue, status: venue.status === "Active" ? "Inactive" : "Active" } : venue,
      ),
    )
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
                    placeholder="Search venues by name or address..."
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
                      <p className="text-sm text-muted-foreground">{venue.address}</p>
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
                    <p className="text-sm font-medium mb-2">Fields ({venue.fields.length})</p>
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
                        onClick={() => handleToggleStatus(venue.id)}
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

        {filteredVenues.length === 0 && (
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No venues found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>{selectedVenue?.name} Details</span>
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
                <p className="text-sm text-muted-foreground">{selectedVenue.address}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Contact Information</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-2" />
                    Manager: {selectedVenue.contact.manager}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 mr-2" />
                    {selectedVenue.contact.phone}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground col-span-2">
                    <Mail className="w-4 h-4 mr-2" />
                    {selectedVenue.contact.email}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Fields ({selectedVenue.fields.length})</Label>
                <div className="mt-2 space-y-2">
                  {selectedVenue.fields.map((field: any) => (
                    <div key={field.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{field.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {field.dimensions} • {field.surface}
                        </div>
                      </div>
                      <Badge variant="outline" className={getStatusColor(field.status)}>
                        {field.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Facilities</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedVenue.facilities.map((facility: string) => (
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
                <Label htmlFor="type">Type</Label>
                <Select value={newVenue.type} onValueChange={(value) => setNewVenue({ ...newVenue, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select venue type" />
                  </SelectTrigger>
                  <SelectContent>
                    {venueTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

            <div>
              <Label className="text-sm font-medium mb-3 block">Facilities</Label>
              <div className="grid grid-cols-2 gap-2">
                {availableFacilities.map((facility) => (
                  <div key={facility} className="flex items-center space-x-2">
                    <Switch
                      id={facility}
                      checked={newVenue.facilities.includes(facility)}
                      onCheckedChange={() => handleFacilityToggle(facility)}
                    />
                    <Label htmlFor={facility} className="text-sm">
                      {facility}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">Contact Information</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="manager">Manager Name</Label>
                  <Input
                    id="manager"
                    placeholder="Enter manager name"
                    value={newVenue.contact.manager}
                    onChange={(e) =>
                      setNewVenue({ ...newVenue, contact: { ...newVenue.contact, manager: e.target.value } })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="Enter phone number"
                    value={newVenue.contact.phone}
                    onChange={(e) =>
                      setNewVenue({ ...newVenue, contact: { ...newVenue.contact, phone: e.target.value } })
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={newVenue.contact.email}
                    onChange={(e) =>
                      setNewVenue({ ...newVenue, contact: { ...newVenue.contact, email: e.target.value } })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateVenue}
                disabled={!newVenue.name || !newVenue.address || !newVenue.capacity || !newVenue.type}
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
                  <Label htmlFor="editType">Type</Label>
                  <Select
                    value={editingVenue.type}
                    onValueChange={(value) => setEditingVenue({ ...editingVenue, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {venueTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

              <div>
                <Label className="text-sm font-medium mb-3 block">Facilities</Label>
                <div className="grid grid-cols-2 gap-2">
                  {availableFacilities.map((facility) => (
                    <div key={facility} className="flex items-center space-x-2">
                      <Switch
                        id={`edit-${facility}`}
                        checked={editingVenue.facilities.includes(facility)}
                        onCheckedChange={() => handleFacilityToggle(facility, true)}
                      />
                      <Label htmlFor={`edit-${facility}`} className="text-sm">
                        {facility}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">Contact Information</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editManager">Manager Name</Label>
                    <Input
                      id="editManager"
                      value={editingVenue.contact.manager}
                      onChange={(e) =>
                        setEditingVenue({
                          ...editingVenue,
                          contact: { ...editingVenue.contact, manager: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="editPhone">Phone Number</Label>
                    <Input
                      id="editPhone"
                      value={editingVenue.contact.phone}
                      onChange={(e) =>
                        setEditingVenue({
                          ...editingVenue,
                          contact: { ...editingVenue.contact, phone: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="editEmail">Email Address</Label>
                    <Input
                      id="editEmail"
                      type="email"
                      value={editingVenue.contact.email}
                      onChange={(e) =>
                        setEditingVenue({
                          ...editingVenue,
                          contact: { ...editingVenue.contact, email: e.target.value },
                        })
                      }
                    />
                  </div>
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
    </div>
  )
}
