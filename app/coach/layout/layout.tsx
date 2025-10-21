"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  LayoutDashboard,
  Users,
  Megaphone,
  Calendar,
  Trophy,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  TrendingUp,
  MapPin,
  UserPlus,
  Heart,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { User as UserType } from "@/lib/mockData"

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser))
    }
  }, [])

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "players", label: "Players", icon: Users },
    { id: "team-stats", label: "Team Stats", icon: TrendingUp },
    { id: "league", label: "League", icon: Trophy },
    { id: "announcements", label: "Announcements", icon: Megaphone },
    { id: "matches", label: "Matches", icon: Calendar },
    { id: "results", label: "Results", icon: Trophy },
    { id: "bookings", label: "Field Booking", icon: MapPin },
    { id: "requests", label: "Player Requests", icon: UserPlus },
    { id: "medical", label: "Medical Records", icon: Heart },
  ]

 const handleLogout = () => {
  localStorage.removeItem("currentUser")
  // Optionally call an API logout if needed
  router.replace("/login") // Redirect to login page
}

  return (
    <div
      className={cn(
        "bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-sidebar-primary rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h2 className="font-bold text-sidebar-foreground">
                  {currentUser
                    ? currentUser.role === "coach" && currentUser.team
                      ? currentUser.team
                      : currentUser.name
                    : "Welcome"}
                </h2>
                <p className="text-xs text-sidebar-foreground/70">Portal</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 text-sidebar-foreground",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isCollapsed && "justify-center px-2"
                )}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="w-4 h-4" />
                {!isCollapsed && <span>{item.label}</span>}
              </Button>
            )
          })}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        {!isCollapsed && currentUser && (
          <div className="mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                  {currentUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{currentUser.name}</p>
                {currentUser.role === "coach" && (
                  <p className="text-xs text-sidebar-foreground/70 truncate">{currentUser.team}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {/* Profile button */}
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent",
              isCollapsed && "justify-center px-2"
            )}
            onClick={() => router.push("/profile")}
          >
            <User className="w-4 h-4" />
            {!isCollapsed && <span>Profile</span>}
          </Button>

          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent",
              isCollapsed && "justify-center px-2"
            )}
            onClick={() => router.push("/settings")}
          >
            <Settings className="w-4 h-4" />
            {!isCollapsed && <span>Settings</span>}
          </Button>

          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-destructive",
              isCollapsed && "justify-center px-2"
            )}
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsed && <span>Logout</span>}
          </Button>
        </div>
      </div>
    </div>
  )
}
