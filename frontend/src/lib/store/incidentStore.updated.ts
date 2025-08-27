// src/lib/store/incidentStore.ts

import { incidentAPI } from "@/lib/api/incident"
import type { IncidentLog } from "@/lib/types"
import toast from "react-hot-toast"
import { create } from "zustand"

interface IncidentState {
  incidents: IncidentLog[]
  isLoading: boolean
  error: string | null
  count: number
  currentPage: number
  nextPageUrl: string | null
  previousPageUrl: string | null
  fetchIncidents: (childId?: string, date?: string, page?: number) => Promise<void>
  fetchIncidentsByUrl: (url: string) => Promise<void>
  logIncident: (incidentData: {
    child: string
    title: string
    description: string
  }) => Promise<void>
}

export const useIncidentStore = create<IncidentState>()((set, get) => ({
  incidents: [],
  isLoading: false,
  error: null,
  count: 0,
  currentPage: 1,
  nextPageUrl: null,
  previousPageUrl: null,

  fetchIncidents: async (childId, date, page = 1) => {
    set({ isLoading: true, error: null })
    try {
      // Construct URL with page parameter if provided
      const baseUrl = "/incident-logs/"
      const url = page > 1 ? `${baseUrl}?page=${page}` : baseUrl
      
      const response = await incidentAPI.getIncidents(
        url,
        childId,
        date
      )
      set({
        incidents: response.results,
        count: response.count,
        currentPage: page,
        nextPageUrl: response.next,
        previousPageUrl: response.previous,
        isLoading: false,
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch incidents"
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  fetchIncidentsByUrl: async (url) => {
    set({ isLoading: true, error: null })
    try {
      const response = await incidentAPI.getIncidents(url)
      // Extract page from URL if possible
      let currentPage = get().currentPage
      const pageMatch = url.match(/page=(\d+)/)
      if (pageMatch && pageMatch[1]) {
        currentPage = parseInt(pageMatch[1], 10)
      }
      
      set({
        incidents: response.results,
        count: response.count,
        currentPage,
        nextPageUrl: response.next,
        previousPageUrl: response.previous,
        isLoading: false,
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch incidents"
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },

  logIncident: async (incidentData) => {
    set({ isLoading: true })
    try {
      await incidentAPI.logIncident(incidentData)
      toast.success("Incident logged successfully!")
      // No refetch needed since only admins can view the list
      set({ isLoading: false })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to log incident"
      set({ error: errorMessage, isLoading: false })
      toast.error(errorMessage)
    }
  },
}))
