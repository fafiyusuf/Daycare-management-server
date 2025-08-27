// src/lib/api/activity.ts

import api from "@/lib/api"
import type { ActivityLog } from "@/lib/types"

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// NOTE: Ensure PaginatedResponse is defined in a global types file (e.g., src/lib/types.ts)
/*
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
*/

export const activityAPI = {
  getActivities: async (
    url: string = "/child-activities/",
    childId?: string,
    date?: string,
  ): Promise<PaginatedResponse<ActivityLog>> => {
    const params = new URLSearchParams()
    if (childId) params.append("child", childId)
    if (date) params.append("start_time__date", date)
    const res = await api.get(url, { params })
    return res.data
  },

  // Fetch using a full pagination URL returned by backend (already contains query params)
  getActivitiesByUrl: async (fullUrl: string): Promise<PaginatedResponse<ActivityLog>> => {
    const res = await api.get(fullUrl)
    return res.data
  },

  // ✅ UPDATED: To handle multipart/form-data for photo uploads
  logActivity: async (formData: FormData): Promise<ActivityLog> => {
    const res = await api.post("/child-activities/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return res.data
  },

  getActivity: async (id: string): Promise<ActivityLog> => {
    const res = await api.get(`/child-activities/${id}/`)
    return res.data
  },

  // ✅ UPDATED: To handle multipart/form-data for photo updates
  updateActivity: async (id: string, formData: FormData): Promise<ActivityLog> => {
    const res = await api.patch(`/child-activities/${id}/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return res.data
  },

  deleteActivity: async (id: string): Promise<void> => {
    await api.delete(`/child-activities/${id}/`)
  },
}
