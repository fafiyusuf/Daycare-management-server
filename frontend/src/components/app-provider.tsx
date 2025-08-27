"use client"

import type React from "react"

import { publicAPI } from "@/lib/api/index"
import { useAnnouncementStore, useGalleryStore, useStaffProfileStore, useUIStore } from "@/lib/store"
import { useEffect } from "react"

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { setAnnouncements } = useAnnouncementStore()
  const { setGallery } = useGalleryStore()
  const { setStaffProfiles } = useStaffProfileStore()
  const { setLoading, setError } = useUIStore()

  useEffect(() => {
    const loadPublicData = async () => {
      try {
        setLoading(true)
        const [announcements, gallery, staffProfiles] = await Promise.all([
          publicAPI.getAnnouncements(),
          publicAPI.getGallery(),
          publicAPI.getStaffProfiles(),
        ])
        setAnnouncements(announcements)
        setGallery(gallery)
        setStaffProfiles(staffProfiles)
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    loadPublicData()
  }, [setAnnouncements, setGallery, setStaffProfiles, setLoading, setError])

  return <>{children}</>
}
