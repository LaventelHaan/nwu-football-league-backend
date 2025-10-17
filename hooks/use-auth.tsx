"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { mockCoach } from "@/lib/mockData"

interface Coach {
  id: number
  name: string
  team: string
  email: string
}

interface AuthContextType {
  coach: Coach | null
  isAuthenticated: boolean
  login: (email: string, password: string) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [coach, setCoach] = useState<Coach | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    try {
      const savedCoach = localStorage.getItem("nwu-coach")
      if (savedCoach) {
        setCoach(JSON.parse(savedCoach))
      }
    } catch (error) {
      console.error("Failed to load coach from localStorage:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = (email: string, password: string) => {
    // Mock authentication - replace with real API in production
    if (email === "coach@nwu.ac.za" && password === "coach123") {
      setCoach(mockCoach)
      localStorage.setItem("nwu-coach", JSON.stringify(mockCoach))
    }
  }

  const logout = () => {
    setCoach(null)
    localStorage.removeItem("nwu-coach")
    localStorage.removeItem("currentUser")
    localStorage.removeItem("token")
    router.push("/home")
  }

  const value: AuthContextType = {
    coach,
    isAuthenticated: !!coach,
    login,
    logout,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
