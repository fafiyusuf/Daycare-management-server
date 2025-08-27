// src/lib/api/attendance.ts

import axiosInstance from "@/lib/api"
import type { AttendanceRecord } from "@/lib/types"
import axios from "axios"

// This is an interface to correctly type the paginated response from the backend
interface PaginatedAttendanceResponse {
  count: number
  next: string | null
  previous: string | null
  results: AttendanceRecord[]
}

export const attendanceAPI = {
  checkIn: async (childId: string, notes?: string, time?: string): Promise<AttendanceRecord> => {
    const response = await axiosInstance.post("/attendance/checkin/", { child_id: childId, notes, time })
    return response.data
  },

  checkOut: async (attendanceId: string, childId: number | string, time?: string): Promise<AttendanceRecord> => {
    const response = await axiosInstance.post("/attendance/checkout/", {
      attendance_id: attendanceId, // This is now the primary identifier for checkout
      child_id: childId, // Kept for potential backend authorization checks
      time,
    })
    return response.data
  },

  getAttendance: async (date?: string): Promise<AttendanceRecord[]> => {
    const url = "/attendance/"
    // FIX: Changed the parameter name from 'date' to 'check_in_time__date'
    const params: { check_in_time__date?: string } = {}
    if (date) {
      params.check_in_time__date = date
    }

    // Since the backend now handles filtering and pagination, we can simplify this.
    // This example will just fetch the first page based on the filter.
    // If you need all records across all pages, the while loop is still an option,
    // but be cautious of performance with large datasets.
    try {
      const response = await axiosInstance.get<PaginatedAttendanceResponse>(url, { params })
      // The backend filters, so we just return the results from the paginated response.
      return response.data.results
    } catch (error) {
      console.error("API Error: Failed to fetch attendance", error)
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || "Failed to fetch attendance records.")
      }
      throw error
    }
  },

  createAttendance: async (attendanceData: Omit<AttendanceRecord, "id">): Promise<AttendanceRecord> => {
    // This function is not used in the dashboard, but keeping it for completeness
    throw new Error("Not implemented")
  },

  updateAttendance: async (id: string, updates: Partial<AttendanceRecord>): Promise<AttendanceRecord> => {
    // This function is not used in the dashboard, but keeping it for completeness
    throw new Error("Not implemented")
  },
}