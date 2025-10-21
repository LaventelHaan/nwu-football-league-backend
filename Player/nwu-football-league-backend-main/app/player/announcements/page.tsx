"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle } from "lucide-react"

type Announcement = {
  id: number
  title: string
  message: string
  priority: string
  date: string
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser")
    if (!userStr) return setLoading(false)

    const user = JSON.parse(userStr)

    const fetchAnnouncements = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/player/announcements/${user.user_id}`)
        if (!res.ok) throw new Error("Failed to fetch announcements")
        const data = await res.json()
        setAnnouncements(data)
      } catch (err) {
        console.error("Announcements fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnnouncements()
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>All Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : announcements.length > 0 ? (
              announcements.map((announcement) => (
                <div key={announcement.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{announcement.title}</h3>
                    <Badge className={getPriorityColor(announcement.priority)} variant="outline">
                      {announcement.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{announcement.message}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{new Date(announcement.date).toLocaleDateString()}</span>
                    <span>From: NWU Football</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No announcements at this time</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}