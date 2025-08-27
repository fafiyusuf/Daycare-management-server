import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../styles/globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: {
    default: "Next.js TypeScript Tailwind Starter",
    template: "%s | Next.js Starter",
  },
  description: "A modern Next.js starter with TypeScript and Tailwind CSS",
  keywords: ["Next.js", "TypeScript", "Tailwind CSS", "React"],
  authors: [{ name: "Your Name" }],
  creator: "Your Name",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://your-domain.com",
    title: "Next.js TypeScript Tailwind Starter",
    description: "A modern Next.js starter with TypeScript and Tailwind CSS",
    siteName: "Next.js Starter",
  },
  twitter: {
    card: "summary_large_image",
    title: "Next.js TypeScript Tailwind Starter",
    description: "A modern Next.js starter with TypeScript and Tailwind CSS",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
