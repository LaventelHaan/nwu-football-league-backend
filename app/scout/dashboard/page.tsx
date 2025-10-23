"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import ScoutDashboard from "@/components/ui/scout-dashboard"

export default function ScoutDashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted before rendering
  useEffect(() => {
    setMounted(true)
  }, [])

  // Compute if the user has the Scout role
  const userRole = user?.roles?.[0]?.toLowerCase() // take first role

  // Redirect if user is not authorized
  useEffect(() => {
    if (!isLoading && mounted) {
      if (!user) {
        router.push("/")
      } else if (userRole !== "scout") {
        console.log("Logged in user:", user)
        router.push("/dashboard")
      }
    }
  }, [user, isLoading, mounted, router, userRole])

  // Show loading if not mounted, still loading, or user not authorized
  if (!mounted || isLoading || !user || userRole !== "scout") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  // Render Scout Dashboard
  return <ScoutDashboard />
}
