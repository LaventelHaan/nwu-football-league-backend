"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

interface LogoutButtonProps {
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

export default function LogoutButton({ 
  className = "", 
  variant = "outline", 
  size = "default" 
}: LogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    
    try {
      // Call logout API
      const response = await fetch('http://localhost:3002/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        // Clear local storage
        localStorage.removeItem("currentUser")
        localStorage.removeItem("token")
        
        // Redirect to home page
        router.push("/home")
      } else {
        console.error('Logout failed')
        // Still clear local storage and redirect even if API fails
        localStorage.removeItem("currentUser")
        localStorage.removeItem("token")
        router.push("/home")
      }
    } catch (error) {
      console.error('Logout error:', error)
      // Still clear local storage and redirect even if API fails
      localStorage.removeItem("currentUser")
      localStorage.removeItem("token")
      router.push("/home")
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoggingOut}
      variant={variant}
      size={size}
      className={className}
    >
      <LogOut className="w-4 h-4 mr-2" />
      {isLoggingOut ? "Logging out..." : "Logout"}
    </Button>
  )
}

