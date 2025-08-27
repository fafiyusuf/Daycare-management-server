"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { useAuthStore, useUIStore } from "@/lib/store"
import { AnnouncementManagement } from "@/views/administrator/AnnouncementManagement"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminAnnouncementsPage() {
  const { user, isAuthenticated } = useAuthStore()
  const { isLoading } = useUIStore()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "admin")) {
      router.push("/public")
    }
  }, [isAuthenticated, user, isLoading, router])

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null
  }

  return (
    <MainLayout title="Announcement Management" subtitle="Create and manage public and internal announcements">
      <AnnouncementManagement />
    </MainLayout>
  )
}
