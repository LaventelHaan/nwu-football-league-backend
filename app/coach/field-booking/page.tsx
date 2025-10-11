"use client"

import { useState, useEffect } from "react"
import  FieldBookingComponent, { FieldBooking }  from "@/components/ui/field-booking"

export default function FieldBookingPage() {
  const [bookings, setBookings] = useState<FieldBooking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/field-bookings')
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      } else {
        console.error('Failed to fetch field bookings')
      }
    } catch (error) {
      console.error('Error fetching field bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBooking = async (booking: Omit<FieldBooking, "id">) => {
    try {
      // Generate a unique ID for the booking
      const bookingId = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const response = await fetch('/api/field-bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: bookingId,
          ...booking,
        }),
      })

      if (response.ok) {
        console.log('Field booking created successfully')
        // Refresh the bookings list
        fetchBookings()
      } else {
        const error = await response.json()
        console.error('Error creating field booking:', error)
        alert(error.error || 'Error creating field booking')
      }
    } catch (error) {
      console.error('Error creating field booking:', error)
      alert('Error creating field booking')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading field bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <FieldBookingComponent bookings={bookings} onCreateBooking={handleCreateBooking} />
  )
}