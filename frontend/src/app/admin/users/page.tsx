"use client"

import { AdminAuthGuard } from "@/components/auth/AdminAuthGuard"
import { MainLayout } from "@/components/layout/main-layout"
import { UserManagement } from "@/views/administrator/UserManagement"

export default function AdminUsersPage() {
  return (
    <AdminAuthGuard>
      <MainLayout title="User Management" subtitle="Manage staff accounts and user permissions">
        <UserManagement />
      </MainLayout>
    </AdminAuthGuard>
  )
}

