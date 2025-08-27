import { AppProvider } from "@/components/app-provider"
import { ThemeProvider } from "@/components/theme-provider"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type React from "react"
import { Toaster } from "react-hot-toast"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SSGI Daycare Management System",
  description: "Space Science and Geospatial Institute - Daycare Management System",
  keywords: "daycare, management, SSGI, space science, geospatial",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AppProvider>{children}</AppProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#000',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
