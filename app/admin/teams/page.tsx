"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Trophy, Search, Eye, Check, X, Clock, Users, Calendar, MapPin, Mail, Phone, Shield } from "lucide-react"
import Link from "next/link"

// Import centralized mock data
import { mockTeams } from "@/lib/mockData" 


const statusOptions = ["ALL", "PENDING", "APPROVED", "REJECTED"]
const typeOptions = ["ALL", "team", "league"]

export default function TeamLeagueApproval() {
  const [items, setItems] = useState(mockTeams)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false)
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject">("approve")
  const [approvalNotes, setApprovalNotes] = useState("")

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.type === "team" ? item.coach : item.organizer).toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter
    const matchesType = typeFilter === "ALL" || item.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const handleViewDetails = (item: any) => {
    setSelectedItem(item)
    setIsDetailDialogOpen(true)
  }

  const handleApprovalAction = (item: any, action: "approve" | "reject") => {
    setSelectedItem(item)
    setApprovalAction(action)
    setApprovalNotes("")
    setIsApprovalDialogOpen(true)
  }

  const handleSubmitApproval = () => {
    if (selectedItem) {
      const updatedStatus = approvalAction === "approve" ? "APPROVED" : "REJECTED"
      setItems(
        items.map((item) =>
          item.id === selectedItem.id
            ? {
                ...item,
                status: updatedStatus,
                approvalDate: new Date().toISOString().split("T")[0],
                approvalNotes: approvalNotes,
                ...(approvalAction === "reject" && { rejectionReason: approvalNotes }),
              }
            : item,
        ),
      )
    }
    setIsApprovalDialogOpen(false)
    setSelectedItem(null)
    setApprovalNotes("")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200"
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeIcon = (type: string) => {
    return type === "team" ? <Users className="w-4 h-4" /> : <Trophy className="w-4 h-4" />
  }

  const pendingCount = items.filter((item) => item.status === "PENDING").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Team & League Approval</h1>
              <p className="text-muted-foreground mt-1">
                Review and approve team registrations and league applications
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                {pendingCount} Pending
              </Badge>
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
                    placeholder="Search teams and leagues..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type === "ALL" ? "All Types" : type === "team" ? "Teams" : "Leagues"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status === "ALL" ? "All Statuses" : status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(item.type)}
                    <div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <p className="text-sm text-muted-foreground capitalize">
                        {item.type} • Submitted {item.submittedDate}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {item.type === "team" ? (
                      <>
                        <div className="flex items-center text-muted-foreground">
                          <Shield className="w-4 h-4 mr-2" />
                          Coach: {item.coach}
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Users className="w-4 h-4 mr-2" />
                          {item.players} Players
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Trophy className="w-4 h-4 mr-2" />
                          {item.league}
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-2" />
                          {item.homeVenue}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center text-muted-foreground">
                          <Shield className="w-4 h-4 mr-2" />
                          {item.organizer}
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Users className="w-4 h-4 mr-2" />
                          {item.teams} Teams
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-2" />
                          {item.season} Season
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="w-4 h-4 mr-2" />
                          {item.startDate} - {item.endDate}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(item)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>

                    {item.status === "PENDING" && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApprovalAction(item, "reject")}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                        <Button size="sm" onClick={() => handleApprovalAction(item, "approve")}>
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No applications found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedItem && getTypeIcon(selectedItem.type)}
              <span>{selectedItem?.name} Details</span>
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant="outline" className={getStatusColor(selectedItem.status)}>
                    {selectedItem.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Submitted Date</Label>
                  <p className="text-sm">{selectedItem.submittedDate}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground mt-1">{selectedItem.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Contact Email</Label>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="w-4 h-4 mr-2" />
                    {selectedItem.email}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Contact Phone</Label>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 mr-2" />
                    {selectedItem.phone}
                  </div>
                </div>
              </div>

              {selectedItem.type === "team" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">League</Label>
                    <p className="text-sm">{selectedItem.league}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Home Venue</Label>
                    <p className="text-sm">{selectedItem.homeVenue}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Number of Players</Label>
                    <p className="text-sm">{selectedItem.players}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Founded Year</Label>
                    <p className="text-sm">{selectedItem.foundedYear}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Number of Teams</Label>
                    <p className="text-sm">{selectedItem.teams}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Season</Label>
                    <p className="text-sm">{selectedItem.season}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Start Date</Label>
                    <p className="text-sm">{selectedItem.startDate}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">End Date</Label>
                    <p className="text-sm">{selectedItem.endDate}</p>
                  </div>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium">Submitted Documents</Label>
                <div className="mt-2 space-y-2">
                  {selectedItem.documents.map((doc: string, index: number) => (
                    <div key={index} className="flex items-center text-sm text-muted-foreground">
                      <Check className="w-4 h-4 mr-2 text-green-500" />
                      {doc}
                    </div>
                  ))}
                </div>
              </div>

              {selectedItem.status === "REJECTED" && selectedItem.rejectionReason && (
                <div>
                  <Label className="text-sm font-medium text-red-600">Rejection Reason</Label>
                  <p className="text-sm text-red-600 mt-1">{selectedItem.rejectionReason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalAction === "approve" ? "Approve" : "Reject"} {selectedItem?.type === "team" ? "Team" : "League"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to {approvalAction} <strong>{selectedItem?.name}</strong>?
            </p>
            <div>
              <Label htmlFor="notes">
                {approvalAction === "approve" ? "Approval Notes (Optional)" : "Rejection Reason (Required)"}
              </Label>
              <Textarea
                id="notes"
                placeholder={
                  approvalAction === "approve"
                    ? "Add any notes about the approval..."
                    : "Please provide a reason for rejection..."
                }
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsApprovalDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitApproval}
                disabled={approvalAction === "reject" && !approvalNotes.trim()}
                className={approvalAction === "reject" ? "bg-red-600 hover:bg-red-700" : ""}
              >
                {approvalAction === "approve" ? "Approve" : "Reject"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
