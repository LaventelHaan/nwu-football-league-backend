"use client"

import { useState } from "react"
import type { PlayerRequest } from "@/lib/mockData"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { UserCheck, UserX, Eye, Mail, Phone } from "lucide-react"
import { format } from "date-fns"

interface PlayerRequestsProps {
  requests: PlayerRequest[]
  onUpdateRequest: (id: string, status: PlayerRequest["status"], notes?: string) => void
}

export function PlayerRequests({ requests, onUpdateRequest }: PlayerRequestsProps) {
  const [selectedRequest, setSelectedRequest] = useState<PlayerRequest | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")

  const handleApprove = () => {
    if (selectedRequest) {
      onUpdateRequest(selectedRequest.id, "approved", reviewNotes)
      setSelectedRequest(null)
      setReviewNotes("")
    }
  }

  const handleReject = () => {
    if (selectedRequest) {
      onUpdateRequest(selectedRequest.id, "rejected", reviewNotes)
      setSelectedRequest(null)
      setReviewNotes("")
    }
  }

  const getStatusColor = (status: PlayerRequest["status"]) => {
    switch (status) {
      case "approved":
        return "bg-green-500"
      case "rejected":
        return "bg-red-500"
      case "pending":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getSkillLevelColor = (level: PlayerRequest["skillLevel"]) => {
    switch (level) {
      case "advanced":
        return "text-green-600"
      case "intermediate":
        return "text-yellow-600"
      case "beginner":
        return "text-blue-600"
      default:
        return "text-gray-600"
    }
  }

  const pendingRequests = requests.filter((r) => r.status === "pending")
  const reviewedRequests = requests.filter((r) => r.status !== "pending")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Player Requests</h2>
        <p className="text-muted-foreground">Review applications from players who attended trials</p>
      </div>

      {pendingRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Pending Reviews ({pendingRequests.length})</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingRequests.map((request) => (
              <Card key={request.id} className="border-yellow-200">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{request.playerName}</CardTitle>
                    <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{request.position}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Age:</span>
                    <span className="font-medium">{request.age}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Skill Level:</span>
                    <span className={`font-medium capitalize ${getSkillLevelColor(request.skillLevel)}`}>
                      {request.skillLevel}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Trial Date:</span>
                    <span className="font-medium">{format(new Date(request.trialDate), "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate">{request.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{request.phone}</span>
                  </div>
                  {request.notes && <p className="text-sm text-muted-foreground italic">"{request.notes}"</p>}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Review Application
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Review Player Application</DialogTitle>
                      </DialogHeader>
                      {selectedRequest && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Player Name</Label>
                              <p className="font-medium">{selectedRequest.playerName}</p>
                            </div>
                            <div>
                              <Label>Position</Label>
                              <p className="font-medium">{selectedRequest.position}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Age</Label>
                              <p className="font-medium">{selectedRequest.age}</p>
                            </div>
                            <div>
                              <Label>Skill Level</Label>
                              <p className={`font-medium capitalize ${getSkillLevelColor(selectedRequest.skillLevel)}`}>
                                {selectedRequest.skillLevel}
                              </p>
                            </div>
                          </div>
                          <div>
                            <Label>Trial Notes</Label>
                            <p className="text-sm text-muted-foreground">
                              {selectedRequest.notes || "No notes available"}
                            </p>
                          </div>
                          <div>
                            <Label htmlFor="reviewNotes">Review Notes</Label>
                            <Textarea
                              id="reviewNotes"
                              value={reviewNotes}
                              onChange={(e) => setReviewNotes(e.target.value)}
                              placeholder="Add your review notes..."
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleApprove} className="flex-1">
                              <UserCheck className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button onClick={handleReject} variant="destructive" className="flex-1">
                              <UserX className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {reviewedRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Reviewed Applications</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reviewedRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{request.playerName}</CardTitle>
                    <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{request.position}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm">
                    <span>Skill Level:</span>
                    <span className={`font-medium capitalize ${getSkillLevelColor(request.skillLevel)}`}>
                      {request.skillLevel}
                    </span>
                  </div>
                  {request.notes && <p className="text-sm text-muted-foreground mt-2 italic">"{request.notes}"</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}