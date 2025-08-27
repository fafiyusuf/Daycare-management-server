import toast from "react-hot-toast"
import { create } from "zustand"

export interface Announcement {
  id: string
  title: string
  content: string
  date: string
  author: string
  isPublic: boolean
  createdAt: string
}

interface AnnouncementState {
  announcements: Announcement[]
  setAnnouncements: (announcements: Announcement[]) => void
  addAnnouncement: (announcement: Announcement) => void
  updateAnnouncement: (id: string, updates: Partial<Announcement>) => void
  deleteAnnouncement: (id: string) => void
}

export const useAnnouncementStore = create<AnnouncementState>()((set) => ({
  announcements: [],
  setAnnouncements: (announcements) => set({ announcements }),
  addAnnouncement: (announcement) => {
    set((state) => ({ announcements: [...state.announcements, announcement] }))
    toast.success("Announcement published successfully!")
  },
  updateAnnouncement: (id, updates) =>
    set((state) => ({
      announcements: state.announcements.map((ann) => (ann.id === id ? { ...ann, ...updates } : ann)),
    })),
  deleteAnnouncement: (id) =>
    set((state) => ({
      announcements: state.announcements.filter((ann) => ann.id !== id),
    })),
})) 