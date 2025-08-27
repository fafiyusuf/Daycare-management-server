"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { useAuthStore, useUIStore } from "@/lib/store"
import { DailyReports } from "@/views/parent/DailyReports"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ParentReportsPage() {
  const { user, isAuthenticated } = useAuthStore()
  const { isLoading } = useUIStore()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "parent")) {
      router.push("/public")
    }
  }, [isAuthenticated, user, isLoading, router])

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated || user?.role !== "parent") {
    return null
  }

  return (
    <MainLayout title="Daily Reports" subtitle="View detailed daily activities and health reports for your child">
      <DailyReports />
    </MainLayout>
  )
}
