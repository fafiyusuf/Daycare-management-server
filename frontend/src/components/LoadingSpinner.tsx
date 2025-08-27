"use client"

import { Smile } from "lucide-react"

export function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-blue-50/10 flex items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-4">
        {/* <Loader2 className="h-12 w-12 text-yellow-500 animate-spin" /> */}
        <Smile className="h-12 w-12 text-blue-500" />
        <div className="flex flex-col items-center">
          <span className="text-2xl font-semibold text-gray-700">Loading...</span>
          <span className="text-sm text-gray-500 animate-pulse">Just a moment...</span>
        </div>
      </div>
    </div>
  )
}
