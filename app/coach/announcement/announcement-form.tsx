"use client"

import { useState } from "react"
import type { Announcement, Player } from "@/lib/mockData"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AnnouncementFormProps {
  announcement: Announcement | null
  players: Player[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (announcement: Omit<Announcement, "id"> | Announcement) => void
}

export function AnnouncementForm({ announcement, players, open, onOpenChange, onSave }: AnnouncementFormProps) {
  const [formData, setFormData] = useState<Omit<Announcement, "id">>({
    title: announcement?.title || "",
    message: announcement?.message || "",
    date: announcement?.date || new Date().toISOString().split("T")[0],
    priority: announcement?.priority || "medium",
    recipients: announcement?.recipients || ["all"],
  })

  const handleSave = () => {
    if (announcement) {
      onSave({ ...announcement, ...formData })
    } else {
      onSave(formData)
    }
    onOpenChange(false)
    // Reset form
    setFormData({
      title: "",
      message: "",
      date: new Date().toISOString().split("T")[0],
      priority: "medium",
      recipients: ["all"],
    })
  }

  const handleRecipientChange = (playerId: string, checked: boolean) => {
    if (playerId === "all") {
      setFormData({
        ...formData,
        recipients: checked ? ["all"] : [],
      })
    } else {
      const newRecipients = formData.recipients.filter((id) => id !== "all")
      if (checked) {
        setFormData({
          ...formData,
          recipients: [...newRecipients, playerId],
        })
      } else {
        setFormData({
          ...formData,
          recipients: newRecipients.filter((id) => id !== playerId),
        })
      }
    }
  }

  const isAllSelected = formData.recipients.includes("all")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{announcement ? "Edit Announcement" : "Create New Announcement"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter announcement title..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Enter your announcement message..."
              rows={4}
            />
          </div>

          <div className="space-y-3">
            <Label>Recipients</Label>
            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Checkbox
                  id="all-players"
                  checked={isAllSelected}
                  onCheckedChange={(checked) => handleRecipientChange("all", checked as boolean)}
                />
                <Label htmlFor="all-players" className="font-medium">
                  All Players
                </Label>
              </div>

              {!isAllSelected && (
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {players.map((player) => (
                      <div key={player.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={player.id}
                          checked={formData.recipients.includes(player.id)}
                          onCheckedChange={(checked) => handleRecipientChange(player.id, checked as boolean)}
                        />
                        <Label htmlFor={player.id} className="text-sm">
                          {player.name} - {player.position}
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
            {announcement ? "Update" : "Create"} Announcement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
