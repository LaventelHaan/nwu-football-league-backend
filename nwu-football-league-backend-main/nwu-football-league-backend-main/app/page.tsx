"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { title } from "process"
import Image from "next/image";

<Image 
  src="/images/logosports-nwu2025.png" 
  alt="NWU Sports 2025 League Manager Logo"
  width={160}
  height={160}
  className="rounded-full"
/>

export default function LoadingPage() {
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIsComplete(true)
          clearInterval(interval)
          setTimeout(() => {
            router.push("/home")
          }, 1000)
          return 100
        }
        return prev + Math.random() * 3 + 1
      })
    }, 150)

    return () => clearInterval(interval)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-accent rounded-full animate-bounce delay-300"></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-secondary rounded-full animate-ping delay-700"></div>
      </div>


      <div className="text-center z-10">
        {/* NWU Logo Container with Animation */}
        <div className="relative mb-8">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 w-48 h-48 mx-auto">
            <div className="w-full h-full border-4 border-transparent border-t-primary border-r-accent rounded-full animate-spin"></div>
          </div>

          {/* Inner pulsing ring */}
          <div className="absolute inset-2 w-44 h-44 mx-auto">
            <div className="w-full h-full border-2 border-transparent border-b-secondary border-l-primary rounded-full animate-spin animate-reverse"></div>
          </div>

          {/* Logo container */}
          <div className="relative w-48 h-48 mx-auto bg-card rounded-full shadow-2xl flex items-center justify-center animate-pulse">
            {/* NWU Logo */}
            <div className="text-center">
              <div className="text-6xl font-black text-primary mb-2 tracking-tight">NWU</div>
              <div className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Sports</div>
            </div>

            {/* Loading counter in center */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
              <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg">
                <span className="text-lg font-bold tabular-nums">{Math.round(progress)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Loading text and tagline */}
        <div className="space-y-4">
          <h1 className="text-3xl font-black text-foreground tracking-tight">NWU Sports League Manager</h1>

          <div className="flex items-center justify-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-secondary rounded-full animate-bounce delay-200"></div>
            </div>
            <span className="text-muted-foreground font-medium">
              {isComplete ? "Ready to Play!" : "Loading your game..."}
            </span>
          </div>

          <p className="text-accent font-semibold text-lg animate-pulse">Get Ready for the Game!</p>
        </div>

        {/* Progress bar */}
        <div className="mt-8 w-80 mx-auto">
          <div className="bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary to-accent h-full transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}
