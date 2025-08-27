"use client"

import { AdminAuthGuard } from "@/components/auth/AdminAuthGuard"
import { MainLayout } from "@/components/layout/main-layout"
import { AdminDashboard } from "@/views/administrator/AdminDashboard"

export default function AdminPage() {
  return (
    <AdminAuthGuard>
      <MainLayout title="Administrator Dashboard">
        <AdminDashboard />
      </MainLayout>
    </AdminAuthGuard>
  )
}

