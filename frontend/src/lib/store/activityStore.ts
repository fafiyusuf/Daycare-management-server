// src/lib/store/activityStore.ts

import { activityAPI } from "@/lib/api/activity";
import type { ActivityLog } from "@/lib/types";
import toast from "react-hot-toast";
import { create } from "zustand";

interface ActivityState {
  activities: ActivityLog[];
  isLoading: boolean;
  error: string | null;
  count: number;
  nextPageUrl: string | null;
  previousPageUrl: string | null;
  fetchActivities: (url?: string, childId?: string, date?: string) => Promise<void>;
  fetchActivitiesByUrl: (fullUrl: string) => Promise<void>;
  // ✅ UPDATED SIGNATURES
  logActivity: (
    activityData: Omit<ActivityLog, "id">,
    photoFile: File | null,
    filterDate: string
  ) => Promise<void>;
  updateActivity: (
    id: string,
    activityData: Partial<ActivityLog>,
    photoFile: File | null
  ) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
}

export const useActivityStore = create<ActivityState>()((set, get) => ({
  activities: [],
  isLoading: false,
  error: null,
  count: 0,
  nextPageUrl: null,
  previousPageUrl: null,

  fetchActivities: async (url, childId, date) => {
    // ... (no changes in this function)
    set({ isLoading: true, error: null });
    const targetUrl = url || "/child-activities/";
    try {
      const response = await activityAPI.getActivities(targetUrl, childId, date);
      const normalized = response.results.map((r: any) => ({
        ...r,
        childId: r.childId || r.child || r.child_id || String(r.child || r.childId || ""),
      }));
      set({
        activities: normalized,
        count: response.count,
        nextPageUrl: response.next,
        previousPageUrl: response.previous,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch activities";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  fetchActivitiesByUrl: async (fullUrl: string) => {
    // ... (no changes in this function)
    set({ isLoading: true, error: null });
    try {
      const response = await activityAPI.getActivitiesByUrl(fullUrl);
      const normalized = response.results.map((r: any) => ({
        ...r,
        childId: r.childId || r.child || r.child_id || String(r.child || r.childId || ""),
      }));
      set({
        activities: normalized,
        count: response.count,
        nextPageUrl: response.next,
        previousPageUrl: response.previous,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch activities";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  // ✅ CORRECTED logActivity: Creates FormData here
  logActivity: async (activityData, photoFile, filterDate) => {
    set({ isLoading: true });
    try {
      const fd = new FormData();
      
      // Required fields from backend (based on error message)
      const requiredFields = ['child', 'activity_type', 'start_time'];
      
      // Append all key-value pairs from the data object
      Object.entries(activityData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Ensure required fields are present
          fd.append(key, String(value));
        }
      });
      
      // Verify all required fields are included
      for (const field of requiredFields) {
        if (!fd.has(field)) {
          throw new Error(`Required field missing: ${field}`);
        }
      }
      
      // Append the photo if it exists
      if (photoFile) {
        fd.append("photos", photoFile);
      }

      // Log what's being sent for debugging
      console.log('Sending activity data:');
      for (const [key, value] of fd.entries()) {
        console.log(`${key}: ${value}`);
      }

      await activityAPI.logActivity(fd);
      toast.success("Activity logged successfully!");
      await get().fetchActivities("/child-activities/", undefined, filterDate);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to log activity";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      console.error("Activity logging error:", error);
    }
  },

  // ✅ CORRECTED updateActivity: Creates FormData here
  updateActivity: async (id, activityData, photoFile) => {
    try {
      const fd = new FormData();
      // Append all key-value pairs from the data object
      Object.entries(activityData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          fd.append(key, String(value));
        }
      });
      // Append the photo if it exists
      if (photoFile) {
        fd.append("photos", photoFile);
      }

      await activityAPI.updateActivity(id, fd);
      toast.success("Activity updated successfully!");
      const { fetchActivities, activities } = get();
      // A simple way to refetch the current page's data
      await fetchActivities();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update activity";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  deleteActivity: async (id: string) => {
    // ... (no changes in this function)
    try {
      await activityAPI.deleteActivity(id);
      toast.success("Activity deleted successfully!");
      const { fetchActivities } = get();
      await fetchActivities();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete activity";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },
}));