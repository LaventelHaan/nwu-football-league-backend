"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react"

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4 flex items-center space-x-4">
          <Link href="/home">
            <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Support</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">Contact Us</h2>
          <ul className="space-y-2">
            <li className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-primary" />
              <span>NWU Sports Complex, Potchefstroom Campus, South Africa</span>
            </li>
            <li className="flex items-center space-x-2">
              <Phone className="w-5 h-5 text-primary" />
              <span>+27 18 299 1111</span>
            </li>
            <li className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-primary" />
              <span>sports@nwu.ac.za</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Need Help?</h2>
          <p>
            The NWU Sports League team is here to help with any questions or issues regarding the league, matches, registrations, or the website.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Frequently Asked Questions</h2>
          <p>
            Check the FAQ section on our website for answers to common questions regarding player eligibility, match scheduling, and league rules.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Feedback</h2>
          <p>
            We value your feedback! Please send us any suggestions or improvements you would like to see in the league or website.
          </p>
        </section>
      </main>
    </div>
  )
}

