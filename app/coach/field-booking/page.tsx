"use client"

import { useState } from "react" 
import  FieldBookingComponent  from "@/components/ui/field-booking"

// Define the FieldBooking type here (or import from "@/types/coach")
interface FieldBooking {
  id: number
  date: string
  time: string
  duration: number
  field: string
  purpose: string
  notes?: string
  status: "pending" | "confirmed" | "cancelled"
}

export default function FieldBookingPage() {
  const [bookings, setBookings] = useState<FieldBooking[]>([
    {
      id: 1,
      date: "2025-01-20",
      time: "15:00",
      duration: 2,
      field: "Main Field",
      purpose: "Tactical Session",
      notes: "Focus on defense strategies",
      status: "confirmed",
    },
    {
      id: 2,
      date: "2025-01-22",
      time: "10:00",
      duration: 1.5,
      field: "Training Ground A",
      purpose: "Morning Training",
      notes: "",
      status: "pending",
    },
  ])

  const handleCreateBooking = (booking: Omit<FieldBooking, "id">) => {
    const newBooking: FieldBooking = {
      id: bookings.length + 1,
      ...booking,
    }
    setBookings([...bookings, newBooking])
  }

  return (
    <FieldBookingComponent bookings={bookings} onCreateBooking={handleCreateBooking} />
  )
}
