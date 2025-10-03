"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type WatchlistPlayer = {
  id: number;
  playerName: string;
  position: string;
  notes?: string;
  nextScoutingDate?: string | null;
};

interface AddPlayerModalProps {
  onClose: () => void;
  onAdd: (player: WatchlistPlayer) => void;
}

export default function AddPlayerModal({ onClose, onAdd }: AddPlayerModalProps) {
  const [formData, setFormData] = useState({
    playerName: "",
    position: "",
    notes: "",
    nextScoutingDate: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.playerName.trim() || !formData.position.trim()) {
      alert("Player name and position are required.");
      return;
    }

    setLoading(true);

    const newPlayerPayload = {
      player_name: formData.playerName.trim(),
      position: formData.position.trim(),
      age: null,
      current_team: "Free Agent",
      league: null,
      priority: "Medium",
      added_by: "You",
      added_date: new Date().toISOString().split("T")[0],
      next_scouting_date: formData.nextScoutingDate || null,
      notes: formData.notes.trim(),
    };

    try {
      const res = await fetch("http://localhost:3001/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPlayerPayload),
      });

      const contentType = res.headers.get("content-type") ?? "";
      const responseBody = contentType.includes("application/json") ? await res.json() : await res.text();

      if (!res.ok) {
        console.error("Server response:", responseBody);
        throw new Error("Failed to add player");
      }

      const bodyObj: any = typeof responseBody === "string" ? {} : responseBody;

      const normalized: WatchlistPlayer = {
        id: bodyObj.watchlist_id ?? bodyObj.id ?? 0,
        playerName: bodyObj.player_name ?? bodyObj.playerName ?? newPlayerPayload.player_name,
        position: bodyObj.position ?? newPlayerPayload.position,
        notes: bodyObj.notes ?? newPlayerPayload.notes ?? "",
        nextScoutingDate:
          bodyObj.next_scouting_date ?? bodyObj.nextScoutingDate ?? newPlayerPayload.next_scouting_date ?? null,
      };

      onAdd(normalized);
      onClose();
    } catch (err) {
      console.error("Error saving player:", err);
      alert("Could not add player. Please check your backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Player to Watchlist</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="playerName">Player Name</Label>
            <Input
              id="playerName"
              value={formData.playerName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, playerName: e.target.value })
              }
              placeholder="e.g. John Smith"
            />
          </div>

          <div>
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, position: e.target.value })
              }
              placeholder="e.g. Midfielder"
            />
          </div>

          <div>
            <Label htmlFor="notes">Scouting Notes</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="e.g. Strong passing, needs fitness work"
            />
          </div>

          <div>
            <Label htmlFor="nextScoutingDate">Next Scouting Date</Label>
            <Input
              id="nextScoutingDate"
              type="date"
              value={formData.nextScoutingDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, nextScoutingDate: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Adding..." : "Add Player"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
