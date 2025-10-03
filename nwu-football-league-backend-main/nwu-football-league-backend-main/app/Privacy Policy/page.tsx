"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
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
                    <h1 className="text-2xl font-bold">Privacy Policy</h1>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 space-y-6">
                <section>
                    <h2 className="text-xl font-semibold mb-2">Introduction</h2>
                    <p>
                        NWU Sports League is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">Information We Collect</h2>
                    <p>
                        We may collect personal information such as your name, email, and league participation data to provide our services effectively.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">How We Use Your Information</h2>
                    <p>
                        Your information is used to manage league activities, communicate updates, and improve our services. We do not sell your personal data.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">Data Security</h2>
                    <p>
                        We implement appropriate technical and organizational measures to protect your personal information against unauthorized access or disclosure.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, you can contact the league administrators through the contact page.
                    </p>
                </section>
            </main>
        </div>
    )
}
