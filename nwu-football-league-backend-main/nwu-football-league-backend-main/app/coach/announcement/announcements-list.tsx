"use client"

import { useState } from "react"
import type { Announcement, Player } from "@/lib/mockData"
import { AnnouncementCard } from "./announcement-card"
import { AnnouncementForm } from "./announcement-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Megaphone } from "lucide-react"

interface AnnouncementsListProps {
  announcements: Announcement[]
  players: Player[]
  onCreateAnnouncement: (announcement: Omit<Announcement, "id">) => void
  onUpdateAnnouncement: (announcement: Announcement) => void
  onDeleteAnnouncement: (id: string) => void
}

export function AnnouncementsList({
  announcements,
  players,
  onCreateAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement,
}: AnnouncementsListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPriority = priorityFilter === "all" || announcement.priority === priorityFilter
    return matchesSearch && matchesPriority
  })

  const handleCreateNew = () => {
    setSelectedAnnouncement(null)
    setFormOpen(true)
  }

  const handleEdit = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement)
    setFormOpen(true)
  }

  const handleSave = (announcementData: Omit<Announcement, "id"> | Announcement) => {
    if ("id" in announcementData) {
      onUpdateAnnouncement(announcementData)
    } else {
      onCreateAnnouncement(announcementData)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleCreateNew} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          New Announcement
        </Button>
      </div>

      <div className="space-y-4">
        {filteredAnnouncements.map((announcement) => (
          <AnnouncementCard
            key={announcement.id}
            announcement={announcement}
            onEdit={handleEdit}
            onDelete={onDeleteAnnouncement}
          />
        ))}
      </div>

      {filteredAnnouncements.length === 0 && (
        <div className="text-center py-12">
          <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No announcements found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchTerm || priorityFilter !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Create your first announcement to communicate with your team"}
          </p>
          {!searchTerm && priorityFilter === "all" && (
            <Button onClick={handleCreateNew} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Announcement
            </Button>
          )}
        </div>
      )}

      <AnnouncementForm
        announcement={selectedAnnouncement}
        players={players}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSave={handleSave}
      />
    </div>
  )
}
