"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import  PlayerDashboard  from "@/app/player/dashboard/page"

export default function PlayerDashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isLoading && mounted) {
      if (!user) {
        router.push("/")
      } else if (user.role !== "player") {
        router.push("/dashboard")
      }
    }
  }, [user, isLoading, mounted, router])

  if (!mounted || isLoading || !user || user.role !== "player") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return <PlayerDashboard />
}
