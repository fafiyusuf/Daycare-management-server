// src/lib/store/childStore.ts
import { toast } from "react-hot-toast";
import { create } from "zustand";
import { childAPI } from "../api/child";

export interface BackendChild {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  family: number;

  parents: { id: number; first_name: string; last_name: string }[];
  assigned_babysitter: number | null;
  medical_info?: string;
  allergies?: string;
  emergency_contact?: string;
  profile_picture?: string;
  birth_certificate?: string;
  vaccination_card?: string;
  is_active: boolean;
}

// NOTE: This interface is no longer used by the getChildren API call,
// but might be used elsewhere. It's safe to keep.
export interface ChildAPIResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BackendChild[];
}

interface ChildStore {
  children: BackendChild[];
  isChildrenLoading: boolean;
  // The 'count' can be derived from the array length now, simplifying the state.
  fetchChildren: (params?: { page?: number; search?: string; is_active?: string }) => Promise<void>;
  fetchChildById: (childId: number) => Promise<BackendChild>;
  addChild: (child: BackendChild) => void;
  updateChild: (childId: number, updatedData: Partial<BackendChild>) => Promise<void>;
  deactivateChild: (childId: number) => Promise<void>;
  activateChild: (childId: number) => Promise<void>;
}

export const useChildStore = create<ChildStore>((set, get) => ({
  children: [],
  isChildrenLoading: false,
  // 'count' is removed from state as it can be derived via `children.length` if needed.
  // This simplifies the store.

  fetchChildren: async (params) => {
    set({ isChildrenLoading: true });
    try {
      // FIX: childAPI.getChildren now returns a simple array directly.
      const childrenArray = await childAPI.getChildren(params);
      
      // FIX: Set the state with the clean array. No more '.results' or '.count'.
      set({ 
        children: childrenArray || [],
      });
    } catch (error) {
      console.error("Failed to fetch children:", error);
      set({ children: [] });
    } finally {
      set({ isChildrenLoading: false });
    }
  },

  fetchChildById: async (childId: number) => {
    set({ isChildrenLoading: true });
    try {
      const child = await childAPI.getChildById(childId);
      return child;
    } catch (error) {
      console.error(`Failed to fetch child with id ${childId}:`, error);
      toast.error('Failed to fetch child details.');
      throw error;
    } finally {
      set({ isChildrenLoading: false });
    }
  },

  addChild: (child) => {
    set((state) => ({
      children: [...state.children, child],
    }));
  },

  updateChild: async (childId, updatedData) => {
    set({ isChildrenLoading: true });
    try {
      const updatedChild = await childAPI.updateChild(childId, updatedData);
      set((state) => ({
        children: state.children.map((child) =>
          child.id === childId ? { ...child, ...updatedChild } : child
        ),
      }));
    } catch (error) {
      console.error("Failed to update child:", error);
      throw error;
    } finally {
      set({ isChildrenLoading: false });
    }
  },

  deactivateChild: async (childId) => {
    try {
      await childAPI.deactivateChild(childId);
      set((state) => ({
        children: state.children.map((child) =>
          child.id === childId ? { ...child, is_active: false } : child
        ),
      }));
      toast.success("Child deactivated successfully.");
    } catch (error) {
      console.error("Failed to deactivate child:", error);
      toast.error('Failed to deactivate child.');
      throw error;
    }
  },

  activateChild: async (childId) => {
    try {
      await childAPI.activateChild(childId);
      set((state) => ({
        children: state.children.map((child) =>
          child.id === childId ? { ...child, is_active: true } : child
        ),
      }));
      toast.success("Child activated successfully.");
    } catch (error) {
      console.error("Failed to activate child:", error);
      toast.error('Failed to activate child.');
      throw error;
    }
  }
  
}));