"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type IncomingPlayerShape = {
  watchlist_id?: number;
  id?: number;
  player_name?: string;
  playerName?: string;
  position?: string;
  notes?: string;
  next_scouting_date?: string | null;
  nextScoutingDate?: string | null;
};

type WatchlistPlayer = {
  id: number;
  playerName: string;
  position: string;
  notes?: string;
  nextScoutingDate?: string | null;
};

interface EditPlayerModalProps {
  player: IncomingPlayerShape | null;
  onClose: () => void;
  onSave: (player: WatchlistPlayer) => void;
}

export default function EditPlayerModal({ player, onClose, onSave }: EditPlayerModalProps) {
  const [formData, setFormData] = useState({
    playerName: "",
    position: "",
    notes: "",
    nextScoutingDate: "",
  });
  const [loading, setLoading] = useState(false);

  const getPlayerId = (p: IncomingPlayerShape | null): number | undefined => p?.id ?? p?.watchlist_id;

  useEffect(() => {
    if (!player) {
      setFormData({ playerName: "", position: "", notes: "", nextScoutingDate: "" });
      return;
    }

    setFormData({
      playerName: player.player_name ?? player.playerName ?? "",
      position: player.position ?? "",
      notes: player.notes ?? "",
      nextScoutingDate: player.next_scouting_date ?? player.nextScoutingDate ?? "",
    });
  }, [player]);

  const handleSave = async () => {
    const id = getPlayerId(player);
    if (!id) {
      alert("Missing player id — cannot update.");
      return;
    }

    if (!formData.playerName.trim() || !formData.position.trim()) {
      alert("Player name and position are required.");
      return;
    }

    setLoading(true);

    const updatedPayload = {
      player_name: formData.playerName.trim(),
      position: formData.position.trim(),
      notes: formData.notes.trim(),
      next_scouting_date: formData.nextScoutingDate || null,
    };

    try {
      const res = await fetch(`http://localhost:3001/api/watchlist/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPayload),
      });

      const contentType = res.headers.get("content-type") ?? "";
      const responseBody = contentType.includes("application/json") ? await res.json() : await res.text();

      if (!res.ok) {
        console.error("Server response:", responseBody);
        throw new Error("Failed to update player");
      }

      const bodyObj: any = typeof responseBody === "string" ? {} : responseBody;

      const normalized: WatchlistPlayer = {
        id: bodyObj.watchlist_id ?? bodyObj.id ?? id,
        playerName: bodyObj.player_name ?? bodyObj.playerName ?? updatedPayload.player_name,
        position: bodyObj.position ?? updatedPayload.position,
        notes: bodyObj.notes ?? updatedPayload.notes ?? "",
        nextScoutingDate: bodyObj.next_scouting_date ?? bodyObj.nextScoutingDate ?? updatedPayload.next_scouting_date ?? null,
      };

      onSave(normalized);
      onClose();
    } catch (err) {
      console.error("Error updating player:", err);
      alert("Could not update player. Please check your backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!player} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Player</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="playerName">Player Name</Label>
            <Input
              id="playerName"
              value={formData.playerName}
              onChange={(e) => setFormData({ ...formData, playerName: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="notes">Scouting Notes</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="nextScoutingDate">Next Scouting Date</Label>
            <Input
              id="nextScoutingDate"
              type="date"
              value={formData.nextScoutingDate}
              onChange={(e) => setFormData({ ...formData, nextScoutingDate: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
