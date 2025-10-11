"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, MapPin, Plus } from "lucide-react"
import { format } from "date-fns"

// Same type as in page.tsx (can centralize in "@/types/coach")
export interface FieldBooking {
  id: string
  date: string
  time: string
  duration: number
  field: string
  purpose: string
  notes?: string
  status: "pending" | "confirmed" | "cancelled"
}

interface FieldBookingProps {
  bookings: FieldBooking[]
  onCreateBooking: (booking: Omit<FieldBooking, "id">) => void
}

export default function FieldBookingComponent({ bookings, onCreateBooking }: FieldBookingProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    duration: "2",
    field: "",
    purpose: "",
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreateBooking({
      ...formData,
      duration: Number.parseFloat(formData.duration),
      status: "pending",
    })
    setFormData({ date: "", time: "", duration: "2", field: "", purpose: "", notes: "" })
    setIsDialogOpen(false)
  }

  const getStatusColor = (status: FieldBooking["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Field Bookings</h2>
          <p className="text-muted-foreground">Manage training field reservations</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Book Field
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Book Training Field</DialogTitle>
            </DialogHeader>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Duration (hours)</Label>
                  <Select
                    value={formData.duration}
                    onValueChange={(value) => setFormData({ ...formData, duration: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="1.5">1.5 hours</SelectItem>
                      <SelectItem value="2">2 hours</SelectItem>
                      <SelectItem value="2.5">2.5 hours</SelectItem>
                      <SelectItem value="3">3 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Field</Label>
                  <Select
                    value={formData.field}
                    onValueChange={(value) => setFormData({ ...formData, field: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Main Field">Main Field</SelectItem>
                      <SelectItem value="Training Ground A">Training Ground A</SelectItem>
                      <SelectItem value="Training Ground B">Training Ground B</SelectItem>
                      <SelectItem value="Indoor Facility">Indoor Facility</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Purpose</Label>
                <Input
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  placeholder="e.g., Morning Training, Tactical Session"
                  required
                />
              </div>

              <div>
                <Label>Notes (optional)</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes or requirements"
                />
              </div>

              <Button type="submit" className="w-full">Book Field</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Bookings */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {bookings.map((booking) => (
          <Card key={booking.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{booking.purpose}</CardTitle>
                <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                {format(new Date(booking.date), "EEEE, MMM d, yyyy")}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                {booking.time} ({booking.duration}h)
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                {booking.field}
              </div>
              {booking.notes && <p className="text-sm text-muted-foreground">{booking.notes}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
