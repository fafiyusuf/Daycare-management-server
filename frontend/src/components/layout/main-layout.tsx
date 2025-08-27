"use client"

import type React from "react"

import { Header } from "./header"

interface MainLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  showUserInfo?: boolean
}

export function MainLayout({ children, title, subtitle, showUserInfo = true }: MainLayoutProps) {
  return (
    <div className="relative flex flex-col min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent dark:from-gray-900 dark:via-gray-800 dark:to-gray-950">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary rounded-full blur-2xl animate-float"></div>
          <div className="absolute -bottom-20 -right-20 w-30 h-30 bg-secondary rounded-full blur-2xl animate-float-slow"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-accent rounded-full blur-2xl animate-float-fast"></div>
        </div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 left-1/4 w-20 h-20 bg-primary rounded-full blur-xl animate-bounce"></div>
          <div className="absolute -bottom-10 right-1/4 w-16 h-16 bg-secondary rounded-full blur-xl animate-bounce-slow"></div>
          <div className="absolute top-1/3 left-1/3 w-12 h-12 bg-accent rounded-full blur-xl animate-bounce-fast"></div>
        </div>
      </div>
      <div className="relative flex-1">
      <Header title={title} subtitle={subtitle} showUserInfo={showUserInfo} />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          {/* <div className="flex flex-col gap-4">
            {title && (
              <h1 className="text-3xl font-bold tracking-tight text-primary dark:text-accent">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div> */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </main>
      </div>
    </div>
  )
}
