"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { MapPin, Search, Plus, Edit, Trash2, Users, Calendar, Phone, Mail, AlertCircle } from "lucide-react"
import Link from "next/link"

import { useEffect } from "react"
import { getVenues } from "@/lib/adminApi"

export default function VenueManagement() {
  const [venues, setVenues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    getVenues()
      .then(setVenues)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

const venueTypes = ["Stadium", "Multi-purpose", "Training Ground", "Indoor Arena"]
const surfaceTypes = ["Natural Grass", "Artificial Turf", "Hybrid Grass", "Indoor Court"]
const statusOptions = ["Active", "Maintenance", "Inactive"]
}
