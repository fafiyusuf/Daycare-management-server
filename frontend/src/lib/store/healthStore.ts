import api from "@/lib/api"
import type { HealthEvent } from "@/lib/types"
import toast from "react-hot-toast"
import { create } from "zustand"

interface HealthState {
  healthEvents: HealthEvent[]
  currentPage: number
  totalCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  isLoading: boolean
  setHealthEvents: (data: {
    results: HealthEvent[]
    count: number
    next: string | null
    previous: string | null
  }) => void
  addHealthEvent: (event: HealthEvent) => void
  updateHealthEvent: (id: string, updatedEvent: HealthEvent) => void
  deleteHealthEvent: (id: string) => void
  getHealthEventById: (id: string) => HealthEvent | undefined
  fetchHealthEvents: (
    childId?: string,
    date?: string,
    page?: number,
    signal?: AbortSignal
  ) => Promise<void>
  setLoading: (isLoading: boolean) => void
  setCurrentPage: (page: number) => void
}

export const useHealthStore = create<HealthState>()((set, get) => ({
  healthEvents: [],
  currentPage: 1,
  totalCount: 0,
  hasNextPage: false,
  hasPreviousPage: false,
  isLoading: false,

  setHealthEvents: (data) => {
    try {
      set({
        healthEvents: Array.isArray(data.results) ? data.results : [],
        totalCount: data.count || 0,
        hasNextPage: !!data.next,
        hasPreviousPage: !!data.previous,
        isLoading: false,
      })
    } catch (error) {
      toast.error("Failed to set health events")
      console.error("Error setting health events:", error)
      set({ isLoading: false })
    }
  },

  setLoading: (isLoading) => set({ isLoading }),
  setCurrentPage: (page) => set({ currentPage: page }),

  addHealthEvent: (event) => {
    try {
      set((state) => ({ 
        healthEvents: [event, ...state.healthEvents],
        totalCount: state.totalCount + 1,
        isLoading: false
      }))
      toast.success("Health event logged successfully!")
    } catch (error) {
      toast.error("Failed to add health event")
      console.error("Error adding health event:", error)
      set({ isLoading: false })
    }
  },

  updateHealthEvent: (id, updatedEvent) => {
    try {
      set((state) => ({
        healthEvents: state.healthEvents.map((event) =>
          event.id === id ? updatedEvent : event
        ),
        isLoading: false
      }))
      toast.success("Health event updated successfully!")
    } catch (error) {
      toast.error("Failed to update health event")
      console.error("Error updating health event:", error)
      set({ isLoading: false })
    }
  },

  deleteHealthEvent: (id) => {
    try {
      set((state) => ({
        healthEvents: state.healthEvents.filter((event) => event.id !== id),
        totalCount: Math.max(0, state.totalCount - 1),
        isLoading: false
      }))
      toast.success("Health event deleted successfully!")
    } catch (error) {
      toast.error("Failed to delete health event")
      console.error("Error deleting health event:", error)
      set({ isLoading: false })
    }
  },

  getHealthEventById: (id) => {
    const state = get()
    return state.healthEvents.find((event) => event.id === id)
  },

  fetchHealthEvents: async (childId, date, page = 1, signal) => {
    try {
      set({ isLoading: true, currentPage: page })
      
      const params: Record<string, any> = {
        page: String(page),
        page_size: "10",
      }

      if (childId) {
        params.child_id = childId
      }

      if (date) {
        params.timestamp__date = date
      }

      const response = await api.get('/health-events/', { 
        params,
        signal 
      })

      if (!signal?.aborted) {
        const normalized: HealthEvent[] = Array.isArray(response.data?.results)
          ? response.data.results.map((r: any) => {
              const time = r.time || r.timestamp || r.created_at || r.datetime
              const normDate =
                r.date ||
                (typeof time === "string" ? time.slice(0, 10) : undefined) ||
                params.timestamp__date
              return {
                ...r,
                id: String(r.id ?? `${r.child ?? r.child_id ?? "evt"}-${time ?? Math.random()}`),
                childId: String(r.childId ?? r.child ?? r.child_id ?? r.child?.id ?? ""),
                type: r.type ?? r.event_type,
                event_type: r.event_type ?? r.type,
                description: r.description ?? r.event ?? r.notes,
                time,
                date: normDate,
                recorded_by_name: r.recorded_by_name ?? r.loggedBy ?? r.staff_name,
                medication_name: r.medication_name ?? r.medication ?? undefined,
              } as HealthEvent
            })
          : []

        get().setHealthEvents({
          results: normalized,
          count: response.data?.count ?? 0,
          next: response.data?.next ?? null,
          previous: response.data?.previous ?? null,
        })
      }
    } catch (error) {
      if (!signal?.aborted) {
        toast.error("Failed to fetch health events")
        set({ healthEvents: [], isLoading: false })
      }
    }
  },
}))