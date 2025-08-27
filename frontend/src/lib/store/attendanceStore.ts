// src/lib/store/attendanceStore.ts

import { attendanceAPI } from "@/lib/api/attendance"
import type { AttendanceRecord } from "@/lib/types"
import toast from "react-hot-toast"
import { create } from "zustand"

interface AttendanceState {
  attendance: AttendanceRecord[]
  isLoading: boolean
  error: string | null
  setAttendance: (attendance: AttendanceRecord[]) => void
  addAttendance: (record: AttendanceRecord) => void
  updateAttendance: (id: string, updates: Partial<AttendanceRecord>) => void
  fetchAttendance: (date: string) => Promise<void>
}

export const useAttendanceStore = create<AttendanceState>()(set => ({
  attendance: [],
  isLoading: false,
  error: null,
  setAttendance: attendance => set({ attendance }),
  addAttendance: record => set(state => ({ attendance: [...state.attendance, record] })),
  updateAttendance: (id, updates) =>
    set(state => ({
      attendance: state.attendance.map(att => (att.id === id ? { ...att, ...updates } : att)),
    })),

  // Fetches attendance for a specific date and updates the global store
  fetchAttendance: async date => {
    set({ isLoading: true, error: null })
    try {
      // The API call is now correctly filtered by the backend.
      const records: any[] = await attendanceAPI.getAttendance(date)
      const normalized = (Array.isArray(records) ? records : []).map(r => ({
        ...r,
        childId: r.childId ?? (r.child != null ? r.child.toString() : r.child_id?.toString() ?? ""),
        date: r.date ?? (r.check_in_time ? r.check_in_time.split("T")[0] : r.checkOut ? r.checkOut.split("T")[0] : date),
        checkIn: r.checkIn ?? r.check_in_time,
        checkOut: r.checkOut ?? r.check_out_time,
        status: r.status ?? (r.check_in_time ? "present" : "absent"),
      }))
      set({ attendance: normalized, isLoading: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch attendance"
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },
}))