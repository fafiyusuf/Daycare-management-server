"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { useAuthStore, useUIStore } from "@/lib/store"
import { BabysitterDashboard } from "@/views/babysitter/BabysitterDashboard"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function BabysitterPage() {
  const { user, isAuthenticated } = useAuthStore()
  const { isLoading } = useUIStore()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "babysitter")) {
      router.push("/public")
    }
  }, [isAuthenticated, user, isLoading, router])

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated || user?.role !== "babysitter") {
    return null
  }

  return (
    <MainLayout title="Babysitter Dashboard" subtitle="Log activities and care for children">
      <BabysitterDashboard />
    </MainLayout>
  )
}
