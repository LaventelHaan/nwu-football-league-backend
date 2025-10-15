import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

import { AuthProvider } from "@/lib/auth-context"; // Make sure this is the actual provider
import FAQWrapper from "@/components/ui/FloatingFAQ";

export async function generateMetadata({
  params,
}: {
  params: { slug?: string };
}): Promise<Metadata> {
  const page = params?.slug ? params.slug : "Home";
  const formattedPage = page.charAt(0).toUpperCase() + page.slice(1);

  return {
    title: `NWU Sports: ${formattedPage} - NWU2025 League Manager`,
    description: "Official NWU Badge - Sports League Manager 2025",
  };
}

export default function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params?: { slug?: string };
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider>
          {children}
          {/* Render FAQ only on the home page */}
          {(!params?.slug || params.slug === "home") && <FAQWrapper />}
        </AuthProvider>
      </body>
    </html>
  );
}
