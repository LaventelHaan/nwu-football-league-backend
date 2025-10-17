"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import LogoutButton from "./logout-button"
import { useState, useEffect } from "react"

export default function NavigationBar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Check if user is logged in
    const currentUser = localStorage.getItem("currentUser")
    if (currentUser) {
      try {
        const userData = JSON.parse(currentUser)
        setUser(userData)
        setIsLoggedIn(true)
      } catch (error) {
        console.error("Error parsing user data:", error)
        localStorage.removeItem("currentUser")
        localStorage.removeItem("token")
      }
    }
  }, [])

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUser(null)
  }
  return (
    <nav className="bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 px-6 py-4 shadow-lg">
      <div className="flex items-center justify-between">
        {/* Logo/Brand */}
        <div className="flex items-center space-x-3">
          <div className="text-2xl font-black text-white">NWU</div>
          <div className="text-lg font-bold text-white">Sports</div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center space-x-4">
          {/* Standings Button - Magenta */}
          <Button
            asChild
            className="bg-pink-500 hover:bg-pink-600 text-gray-800 font-semibold px-6 py-2 rounded-lg shadow-md transition-all duration-200"
          >
            <Link href="/standings">Standings</Link>
          </Button>

          {/* Fixtures Button - Magenta */}
          <Button
            asChild
            className="bg-pink-500 hover:bg-pink-600 text-gray-800 font-semibold px-6 py-2 rounded-lg shadow-md transition-all duration-200"
          >
            <Link href="/fixtures">Fixtures</Link>
          </Button>

          {/* Players Button - Magenta */}
          <Button
            asChild
            className="bg-pink-500 hover:bg-pink-600 text-gray-800 font-semibold px-6 py-2 rounded-lg shadow-md transition-all duration-200"
          >
            <Link href="/players">Players</Link>
          </Button>

          {/* Conditional Login/Logout Buttons */}
          {isLoggedIn ? (
            <>
              {/* User Info */}
              <div className="text-white text-sm">
                Welcome, {user?.name || user?.firstName || 'User'}!
              </div>
              {/* Logout Button - Darker Purple */}
              <LogoutButton 
                className="bg-purple-700 hover:bg-purple-800 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-all duration-200"
                variant="default"
              />
            </>
          ) : (
            <>
              {/* Login Button - Darker Purple */}
              <Button
                asChild
                className="bg-purple-700 hover:bg-purple-800 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-all duration-200"
              >
                <Link href="/login">Login</Link>
              </Button>

              {/* Register Button - Darkest Purple */}
              <Button
                asChild
                className="bg-purple-800 hover:bg-purple-900 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-all duration-200"
              >
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Bottom separator line */}
      <div className="mt-4 border-t border-white/20"></div>
    </nav>
  )
}
