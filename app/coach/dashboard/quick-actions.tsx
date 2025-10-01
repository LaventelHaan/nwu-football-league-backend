"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, UserPlus, Megaphone, Calendar, FileText } from "lucide-react"

interface QuickActionsProps {
  onAction: (action: string) => void
}

export default function QuickActions({ onAction }: QuickActionsProps) {
  const actions = [
    {
      id: "new-announcement",
      label: "New Announcement",
      icon: Megaphone,
      description: "Send message to team",
      color: "bg-orange-500 hover:bg-orange-600",
    },
    {
      id: "add-player",
      label: "Add Player",
      icon: UserPlus,
      description: "Register new player",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      id: "schedule-match",
      label: "Schedule Match",
      icon: Calendar,
      description: "Add upcoming game",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      id: "team-report",
      label: "Team Report",
      icon: FileText,
      description: "Generate statistics",
      color: "bg-purple-500 hover:bg-purple-600",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.id}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start gap-2 hover:shadow-md transition-shadow bg-transparent"
                onClick={() => onAction(action.id)}
              >
                <div className="flex items-center gap-2 w-full">
                  <div className={`p-2 rounded-md ${action.color} text-white`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-medium text-sm">{action.label}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </div>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
