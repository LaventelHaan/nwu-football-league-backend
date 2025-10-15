"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { users, mockPlayers } from "@/lib/mockData"

// Unified user type with optional avatar
export type User = {
  id: string
  name: string
  email: string
  role: "player" | "coach" | "admin" | "scouter"
  password?: string // only for non-player users
  team?: string
  avatar?: string // optional avatar for players
}

// Auth context type
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("nwu-user")
      if (savedUser) setUser(JSON.parse(savedUser))
    } catch (error) {
      console.error("Failed to load user from localStorage:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = (email: string, password: string) => {
    // Check regular users (coaches, admins, scouters)
    const regularUser = users.find(u => u.email === email && u.password === password)
    if (regularUser) {
      setUser(regularUser)
      localStorage.setItem("nwu-user", JSON.stringify(regularUser))
      return true
    }

    // Check players (all use "player123")
    const player = mockPlayers.find(p => p.email === email && password === "player123")
    if (player) {
      // Include avatar and all necessary fields for dashboard
      const playerUser: User = {
        id: player.id.toString(),
        name: player.name,
        email: player.email,
        role: "player",
        team: player.team,
        avatar: player.avatar,
      }
      setUser(playerUser)
      localStorage.setItem("nwu-user", JSON.stringify(playerUser))
      return true
    }

    // Login failed
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("nwu-user")
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
