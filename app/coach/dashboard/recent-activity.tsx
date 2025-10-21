"use client"

import type { Announcement, Player } from "@/lib/mockData"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Megaphone, Users, Calendar } from "lucide-react"
import { format } from "date-fns"

interface RecentActivityProps {
  announcements: Announcement[]
  players: Player[]
}

export default function RecentActivity({ announcements, players }: RecentActivityProps) {
  // Mock recent activities - in real app would come from activity log
  const activities = [
    {
      id: "1",
      type: "announcement",
      title: "New announcement posted",
      description: announcements[0]?.title || "Training Schedule Update",
      time: new Date().toISOString(),
      icon: Megaphone,
      color: "text-orange-600",
    },
    {
      id: "2",
      type: "player",
      title: "Player profile updated",
      description: `${players[0]?.name || "Player"} statistics updated`,
      time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      icon: Users,
      color: "text-blue-600",
    },
    {
      id: "3",
      type: "match",
      title: "Match result recorded",
      description: "Victory against University of Cape Town",
      time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      icon: Calendar,
      color: "text-green-600",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`p-2 rounded-full bg-muted ${activity.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <Badge variant="secondary" className="text-xs">
                      {format(new Date(activity.time), "HH:mm")}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
