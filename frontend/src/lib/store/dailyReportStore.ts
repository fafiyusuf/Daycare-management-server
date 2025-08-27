import type { DailyReport } from "@/lib/types"
import toast from "react-hot-toast"
import { create } from "zustand"

interface DailyReportState {
  dailyReports: DailyReport[]
  setDailyReports: (reports: DailyReport[]) => void
  addDailyReport: (report: DailyReport) => void
}

export const useDailyReportStore = create<DailyReportState>()((set) => ({
  dailyReports: [],
  setDailyReports: (dailyReports) => set({ dailyReports }),
  addDailyReport: (report) => {
    try {
      set((state) => ({ dailyReports: [...state.dailyReports, report] }))
      toast.success("Daily report added successfully!")
    } catch (error) {
      console.error("Failed to add daily report:", error)
      toast.error("Failed to add daily report")
    }
  },
})) 