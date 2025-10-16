"use client"

import type React from "react"

import { useState } from "react"
import type { MedicalRecord, Player } from "@/lib/mockData"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Plus, Calendar, User, AlertCircle } from "lucide-react"
import { format } from "date-fns"

interface MedicalRecordsProps {
  records: MedicalRecord[]
  players: Player[]
  onCreateRecord: (record: Omit<MedicalRecord, "id">) => void
  onUpdateRecord: (record: MedicalRecord) => void
}

export function MedicalRecords({ records, players, onCreateRecord, onUpdateRecord }: MedicalRecordsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)
  const [formData, setFormData] = useState({
    playerId: "",
    date: "",
    type: "checkup" as MedicalRecord["type"],
    description: "",
    doctor: "",
    status: "active" as MedicalRecord["status"],
    followUpDate: "",
    restrictions: "",
    medications: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newRecord: Omit<MedicalRecord, "id"> = {
      ...formData,
      // Convert comma-separated strings to arrays for the API
      restrictions: formData.restrictions ? formData.restrictions.split(",").map((r) => r.trim()) : undefined,
      medications: formData.medications ? formData.medications.split(",").map((m) => m.trim()) : undefined,
      followUpDate: formData.followUpDate || undefined,
    }
    onCreateRecord(newRecord)
    setFormData({
      playerId: "",
      date: "",
      type: "checkup",
      description: "",
      doctor: "",
      status: "active",
      followUpDate: "",
      restrictions: "",
      medications: "",
    })
    setIsDialogOpen(false)
  }

  const handleUpdateStatus = (record: MedicalRecord, newStatus: MedicalRecord["status"]) => {
    onUpdateRecord({ ...record, status: newStatus })
  }

  const getStatusColor = (status: MedicalRecord["status"]) => {
    switch (status) {
      case "resolved":
        return "bg-green-500"
      case "ongoing":
        return "bg-yellow-500"
      case "active":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getTypeColor = (type: MedicalRecord["type"]) => {
    switch (type) {
      case "injury":
        return "text-red-600"
      case "treatment":
        return "text-orange-600"
      case "checkup":
        return "text-blue-600"
      case "clearance":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  const getPlayerName = (playerId: string) => {
    return players.find((p) => p.id === playerId)?.name || "Unknown Player"
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Medical Records</h2>
          <p className="text-muted-foreground">Track player health and medical information</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Medical Record</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="playerId">Player</Label>
                  <Select
                    value={formData.playerId}
                    onValueChange={(value) => setFormData({ ...formData, playerId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select player" />
                    </SelectTrigger>
                    <SelectContent>
                      {players.map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.name} - {player.position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: MedicalRecord["type"]) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checkup">Checkup</SelectItem>
                      <SelectItem value="injury">Injury</SelectItem>
                      <SelectItem value="treatment">Treatment</SelectItem>
                      <SelectItem value="clearance">Clearance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="doctor">Doctor</Label>
                  <Input
                    id="doctor"
                    value={formData.doctor}
                    onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                    placeholder="Dr. Name"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Medical details and observations"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: MedicalRecord["status"]) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="followUpDate">Follow-up Date (optional)</Label>
                  <Input
                    id="followUpDate"
                    type="date"
                    value={formData.followUpDate}
                    onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="restrictions">Restrictions (comma-separated, optional)</Label>
                <Input
                  id="restrictions"
                  value={formData.restrictions}
                  onChange={(e) => setFormData({ ...formData, restrictions: e.target.value })}
                  placeholder="No running, Light training only"
                />
              </div>
              <div>
                <Label htmlFor="medications">Medications (comma-separated, optional)</Label>
                <Input
                  id="medications"
                  value={formData.medications}
                  onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                  placeholder="Anti-inflammatory gel, Pain medication"
                />
              </div>
              <Button type="submit" className="w-full">
                Add Medical Record
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {records.map((record) => (
          <Card key={record.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  {getPlayerName(record.playerId)}
                </CardTitle>
                <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getTypeColor(record.type)}>
                  {record.type}
                </Badge>
                <span className="text-sm text-muted-foreground">{format(new Date(record.date), "MMM d, yyyy")}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">{record.description}</p>
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>{record.doctor}</span>
              </div>
              {record.followUpDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Follow-up: {format(new Date(record.followUpDate), "MMM d, yyyy")}</span>
                </div>
              )}
              {record.restrictions && record.restrictions.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-orange-600">
                    <AlertCircle className="w-4 h-4" />
                    Restrictions:
                  </div>
                  <ul className="text-sm text-muted-foreground ml-6">
                    {record.restrictions.map((restriction, index) => (
                      <li key={index}>• {restriction}</li>
                    ))}
                  </ul>
                </div>
              )}
              {record.medications && record.medications.length > 0 && (
                <div className="space-y-1">
                  <div className="text-sm font-medium">Medications:</div>
                  <ul className="text-sm text-muted-foreground">
                    {record.medications.map((medication, index) => (
                      <li key={index}>• {medication}</li>
                    ))}
                  </ul>
                </div>
              )}
              {record.status === "ongoing" && (
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(record, "resolved")}>
                    Mark Resolved
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}