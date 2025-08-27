"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { useAuthStore, useUIStore } from "@/lib/store"
import { GalleryManagement } from "@/views/administrator/GalleryManagement"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminGalleryPage() {
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
    <MainLayout title="Gallery Management" subtitle="Upload and manage photos for the public gallery">
      <GalleryManagement />
    </MainLayout>
  )
}
