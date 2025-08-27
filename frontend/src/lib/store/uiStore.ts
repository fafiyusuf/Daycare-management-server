import { create } from "zustand"

interface UIState {
  isLoading: boolean
  error: string | null
  unreadMessages: number
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useUIStore = create<UIState>()((set) => ({
  isLoading: false,
  error: null,
  unreadMessages: 0,
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
})) 