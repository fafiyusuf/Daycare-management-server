"use client"

import { NurseAuthGuard } from "@/components/auth/NurseAuthGuard"
import { MainLayout } from "@/components/layout/main-layout"
import { useAuthStore, useUIStore } from "@/lib/store"
import { NurseDashboard } from "@/views/nurse/NurseDashboard"

export default function NursePage() {
  const { user, isAuthenticated } = useAuthStore()
  const { isLoading } = useUIStore()

  // Keep this page lean. Let the dashboard/stores handle fetching like BabysitterPage does.
  if (isLoading) {
    return null
  }

  if (!isAuthenticated || user?.role !== "nurse") {
    return null
  }

  return (
    <NurseAuthGuard>
      <MainLayout title="Nurse Dashboard" subtitle="Monitor health and log medical events">
        <NurseDashboard />
      </MainLayout>
    </NurseAuthGuard>
  )
}
