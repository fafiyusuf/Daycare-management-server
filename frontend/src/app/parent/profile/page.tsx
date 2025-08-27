"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { useAuthStore, useUIStore } from "@/lib/store"
import { ChildProfile } from "@/views/parent/ChildProfile"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ParentProfilePage() {
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
    <MainLayout title="Child Profile" subtitle="Complete and update your child's information">
      <ChildProfile />
    </MainLayout>
  )
}
