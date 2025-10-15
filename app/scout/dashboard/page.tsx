"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import ScouterDashboard from "@/components/ui/scouter-dashboard"

export default function ScouterDashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted before rendering
  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect if user is not authorized
  useEffect(() => {
    if (!isLoading && mounted) {
      if (!user) {
        router.push("/")
      } else if (user.role !== "scouter") {
        router.push("/dashboard")
      }
    }
  }, [user, isLoading, mounted, router])

  if (!mounted || isLoading || !user || user.role !== "scouter") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return <ScouterDashboard />
}
