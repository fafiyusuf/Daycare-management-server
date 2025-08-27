"use client"

import { NurseAuthGuard } from "@/components/auth/NurseAuthGuard"
import { MainLayout } from "@/components/layout/main-layout"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { useAuthStore, useUIStore } from "@/lib/store"
import { NurseDashboard } from "@/views/nurse/NurseDashboard"
import { useEffect } from "react"

export default function NurseHealthPage() {
  const { user, isAuthenticated } = useAuthStore()
  const { isLoading } = useUIStore()

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "nurse")) {
    }
  }, [isAuthenticated, user, isLoading])

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <NurseAuthGuard>
      <MainLayout title="Nurse Dashboard" subtitle="Monitor health and log medical events">
        <NurseDashboard />
      </MainLayout>
    </NurseAuthGuard>
  )
}
