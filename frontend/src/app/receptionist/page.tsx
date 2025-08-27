"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { useAuthStore, useUIStore } from "@/lib/store"
import { ReceptionistDashboard } from "@/views/receptionist/ReceptionistDashboard"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ReceptionistPage() {
  const { user, isAuthenticated } = useAuthStore()
  const { isLoading } = useUIStore()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "receptionist")) {
      router.push("/public")
    }
  }, [isAuthenticated, user, isLoading, router])

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated || user?.role !== "receptionist") {
    return null
  }

  return (
    <MainLayout title="Receptionist Dashboard" subtitle="Manage daily operations and family registrations">
      <ReceptionistDashboard />
    </MainLayout>
  )
}
