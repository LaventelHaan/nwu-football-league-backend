"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
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
          <h1 className="text-2xl font-bold">Terms of Service</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">Acceptance of Terms</h2>
          <p>
            By using the NWU Sports League website and participating in league activities, you agree to comply with these Terms of Service. Please read them carefully before using our services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Eligibility</h2>
          <p>
            Participation in the league is limited to registered students and members of the respective university sports clubs. You must provide accurate information during registration.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">User Conduct</h2>
          <p>
            Users are expected to behave respectfully towards other participants, staff, and officials. Any form of harassment, cheating, or disruptive behavior may result in suspension or removal from league activities.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Content and Intellectual Property</h2>
          <p>
            All content provided on the NWU Sports League platform, including logos, data, and multimedia, is owned by the league or its licensors. You may not use or reproduce any content without explicit permission.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Disclaimers</h2>
          <p>
            The NWU Sports League website is provided "as is." While we strive to provide accurate and timely information, we do not guarantee the accuracy or completeness of content and are not responsible for any errors or omissions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Limitation of Liability</h2>
          <p>
            The league is not liable for any direct, indirect, incidental, or consequential damages arising from your use of our services or participation in league events.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms of Service at any time. Changes will be communicated via the website, and continued use constitutes acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Governing Law</h2>
          <p>
            These Terms of Service are governed by and construed in accordance with the laws of South Africa. Any disputes arising from the use of our services will be subject to the jurisdiction of South African courts.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Contact</h2>
          <p>
            For questions regarding these Terms of Service, please contact the NWU Sports League administrators via the contact page on our website.
          </p>
        </section>
      </main>
    </div>
  )
}

