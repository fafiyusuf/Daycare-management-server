import type { StaffProfile } from "@/lib/types"
import toast from "react-hot-toast"
import { create } from "zustand"

interface StaffProfileState {
  staffProfiles: StaffProfile[]
  setStaffProfiles: (profiles: StaffProfile[]) => void
  addStaffProfile: (profile: StaffProfile) => void
  updateStaffProfile: (id: string, updates: Partial<StaffProfile>) => void
}

export const useStaffProfileStore = create<StaffProfileState>()((set) => ({
  staffProfiles: [],
  setStaffProfiles: (staffProfiles) => set({ staffProfiles }),
  addStaffProfile: (profile) => {
    set((state) => ({ staffProfiles: [...state.staffProfiles, profile] }))
    toast.success("Staff profile created successfully!")
  },
  updateStaffProfile: (id, updates) =>
    set((state) => ({
      staffProfiles: state.staffProfiles.map((profile) =>
        profile.id === id ? { ...profile, ...updates } : profile,
      ),
    })),
})) 