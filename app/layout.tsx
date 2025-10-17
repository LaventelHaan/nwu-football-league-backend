import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

import { AuthProvider } from "@/hooks/use-auth";
import FAQWrapper from "@/components/ui/FloatingFAQ"; // Use the wrapper here
import { Toaster } from "@/components/ui/sonner";

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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider>
          {children}
          <FAQWrapper /> {/* Now only renders on home page */}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
