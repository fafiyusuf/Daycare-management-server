"use client"

import { LoadingSpinner } from "@/components/LoadingSpinner"
import {
  attendanceAPI,

  healthAPI,
  publicAPI,
  userAPI,
} from "@/lib/api/index"
import {
  useActivityStore,
  useAnnouncementStore,
  useAttendanceStore,
  useAuthStore,
  useChildStore,
  useHealthStore,
  useUIStore,
  useUserStore,
} from "@/lib/store"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore()
  const { setUsers } = useUserStore()
  const { fetchChildren } = useChildStore()
  const { setAttendance } = useAttendanceStore()
  const { fetchActivities } = useActivityStore()
  const { setHealthEvents } = useHealthStore()
  const { setAnnouncements } = useAnnouncementStore()
  const { isLoading, setLoading, setError } = useUIStore()

  const router = useRouter()

  // Load all initial data ONCE
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)

        const announcements = await publicAPI.getAnnouncements()
        setAnnouncements(announcements)

        if (isAuthenticated && user) {
          const promises = []

          switch (user.role) {
            case "admin":
              promises.push(
                userAPI.getUsers().then((res) => setUsers(res.results)),
                fetchChildren(),
                attendanceAPI.getAttendance().then(setAttendance),
                fetchActivities(),
                healthAPI.getHealthEvents().then(setHealthEvents),
              )
              break

            case "receptionist":
              promises.push(
                fetchChildren(),
                attendanceAPI.getAttendance().then(setAttendance),
                userAPI.getUsers().then((res) => setUsers(res.results)),
              )
              break

            case "parent":
              promises.push(
                fetchChildren(),
                fetchActivities(),
                healthAPI.getHealthEvents().then(setHealthEvents),
                attendanceAPI.getAttendance().then(setAttendance),
              )
              break

            case "babysitter":
            case "nurse":
              promises.push(
                fetchChildren(),
                fetchActivities(),
                healthAPI.getHealthEvents().then(setHealthEvents),
                attendanceAPI.getAttendance().then(setAttendance),
              )
              break
          }

          await Promise.all(promises)
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
    // only run on first render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Redirect after data is loaded
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/public")
      } else {
        switch (user?.role) {
          case "admin":
            router.push("/admin")
            break
          case "receptionist":
            router.push("/receptionist")
            break
          case "parent":
            router.push("/parent")
            break
          case "babysitter":
            router.push("/babysitter")
            break
          case "nurse":
            router.push("/nurse")
            break
          default:
            router.push("/public")
        }
      }
    }
  }, [isLoading, isAuthenticated, user, router])

  return <LoadingSpinner />
}
