"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4 flex items-center space-x-4">
          <Link href="/home">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">League Rules & Regulations</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* General Rules */}
        <Card>
          <CardHeader>
            <CardTitle>General Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ul className="list-disc list-inside space-y-1">
              <li>All teams must be officially registered with the league.</li>
              <li>Players must meet eligibility criteria set by the league.</li>
              <li>Matches will be played according to the official league schedule.</li>
              <li>Teams are expected to maintain sportsmanship and fair play at all times.</li>
              <li>Any disputes will be resolved by the league committee.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Match Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Match Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ul className="list-disc list-inside space-y-1">
              <li>Each match consists of two halves of 45 minutes each.</li>
              <li>Standard international football rules apply unless otherwise specified.</li>
              <li>Substitutions are limited to a maximum of 5 per match.</li>
              <li>Teams must arrive at least 30 minutes before the scheduled kickoff.</li>
              <li>Referees' decisions are final and binding.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Disciplinary Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Disciplinary Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ul className="list-disc list-inside space-y-1">
              <li>Yellow and red card accumulation may result in player suspension.</li>
              <li>Unsportsmanlike conduct can lead to fines or disqualification.</li>
              <li>Teams are responsible for the behavior of their supporters.</li>
              <li>Violations of league rules may lead to match forfeiture.</li>
              <li>Severe breaches will be reviewed by the league disciplinary board.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ul className="list-disc list-inside space-y-1">
              <li>The league reserves the right to amend rules at any time with proper notice.</li>
              <li>All teams must comply with health and safety regulations.</li>
              <li>Equipment and uniforms must meet league specifications.</li>
              <li>Players must have valid insurance coverage while participating.</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
