"use client"

import { useState, useEffect } from "react"
import FieldBookingComponent from "@/components/ui/field-booking"

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

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function FieldBookingPage() {
  const [bookings, setBookings] = useState<FieldBooking[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load current user and fetch bookings on component mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const userData = localStorage.getItem("currentUser")
        if (userData) {
          const user = JSON.parse(userData)
          setCurrentUser(user)
          fetchBookings(user.id)
        }
      } catch (error) {
        console.error("Error loading user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const fetchBookings = async (coachId: string) => {
    try {
      const response = await fetch(`http://localhost:3002/api/field-bookings/${coachId}`)
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      } else {
        console.error("Failed to fetch bookings")
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
    }
  }

  const handleCreateBooking = async (booking: Omit<FieldBooking, "id">) => {
    if (!currentUser) {
      console.error("No user logged in")
      return
    }

    try {
      const response = await fetch('http://localhost:3002/api/field-bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coachId: currentUser.id,
          date: booking.date,
          time: booking.time,
          duration: booking.duration,
          field: booking.field,
          purpose: booking.purpose,
          notes: booking.notes || null,
        }),
      })

      if (response.ok) {
        const newBooking = await response.json()
        // Add the new booking to the local state
        setBookings(prevBookings => [...prevBookings, {
          id: newBooking.booking.id,
          date: newBooking.booking.date,
          time: newBooking.booking.time,
          duration: newBooking.booking.duration,
          field: newBooking.booking.field,
          purpose: newBooking.booking.purpose,
          notes: newBooking.booking.notes,
          status: newBooking.booking.status,
        }])
      } else {
        console.error("Failed to create booking")
      }
    } catch (error) {
      console.error("Error creating booking:", error)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (!currentUser) {
    return <div className="flex justify-center items-center min-h-screen">Please log in to access field bookings.</div>
  }

  return (
    <FieldBookingComponent bookings={bookings} onCreateBooking={handleCreateBooking} />
  )
}