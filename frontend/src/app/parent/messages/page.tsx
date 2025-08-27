// "use client"

// import { MainLayout } from "@/components/layout/main-layout"
// import { LoadingSpinner } from "@/components/LoadingSpinner"
// import { useAuthStore, useUIStore } from "@/lib/store"
// import { MessagingCenter } from "@/views/parent/MessagingCenter"
// import { useRouter } from "next/navigation"
// import { useEffect } from "react"

// export default function ParentMessagesPage() {
//   const { user, isAuthenticated } = useAuthStore()
//   const { isLoading } = useUIStore()
//   const router = useRouter()

//   useEffect(() => {
//     if (!isLoading && (!isAuthenticated || user?.role !== "parent")) {
//       router.push("/public")
//     }
//   }, [isAuthenticated, user, isLoading, router])

//   if (isLoading) {
//     return <LoadingSpinner />
//   }

//   if (!isAuthenticated || user?.role !== "parent") {
//     return null
//   }

//   return (
//     <MainLayout title="Messages" subtitle="Communicate with your child's caregivers">
//       <MessagingCenter />
//     </MainLayout>
//   )
// }
