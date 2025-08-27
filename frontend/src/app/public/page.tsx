"use client"

import { LoginForm } from "@/components/LoginForm"
import { PublicPortal } from "@/components/PublicPortal"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function PublicPage() {
  return (
    <div className="relative flex flex-col min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFBF78] via-[#FB9E3A] to-[#27548A] dark:from-[#1E1E1E] dark:via-[#121212] dark:to-[#0D0D0D]">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#FFBF78] rounded-full blur-2xl animate-float"></div>
          <div className="absolute -bottom-20 -right-20 w-30 h-30 bg-[#FB9E3A] rounded-full blur-2xl animate-float-slow"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-[#27548A] rounded-full blur-2xl animate-float-fast"></div>
        </div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 left-1/4 w-20 h-20 bg-[#FFBF78] rounded-full blur-xl animate-bounce"></div>
          <div className="absolute -bottom-10 right-1/4 w-16 h-16 bg-[#FB9E3A] rounded-full blur-xl animate-bounce-slow"></div>
          <div className="absolute top-1/3 left-1/3 w-12 h-12 bg-[#27548A] rounded-full blur-xl animate-bounce-fast"></div>
        </div>
      </div>
      <div className="relative flex-1">
        <PublicPortal />
        <div className="fixed bottom-4 right-4 z-50">
          <LoginForm />
        </div>
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}
