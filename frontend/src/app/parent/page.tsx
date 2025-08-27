"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { useAuthStore, useUIStore } from "@/lib/store"
import { ParentDashboard } from "@/views/parent/ParentDashboard"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ParentPage() {
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
    <MainLayout title="Parent Portal" subtitle="Stay connected with your child's daily activities">
      <ParentDashboard />
    </MainLayout>
  )
}
