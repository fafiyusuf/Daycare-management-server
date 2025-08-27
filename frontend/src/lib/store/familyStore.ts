import { create } from "zustand";
import type { Family } from "../api/family";
import { familyAPI } from "../api/family";

interface FamilyStore {
    families: Family[];
    isFamiliesLoading: boolean;
    isLoading: boolean;
    fetchFamilies: () => Promise<void>;
    addFamily: (familyData: Omit<Family, 'id'>) => Promise<Family>;
}

export const useFamilyStore = create<FamilyStore>((set, get) => ({
    families: [],
    isFamiliesLoading: false,
    isLoading: false,
    fetchFamilies: async () => {
        set({ isFamiliesLoading: true });
        try {
            const families = await familyAPI.getFamilies();
            set({ families });
        } catch (error) {
            console.error("Failed to fetch families:", error);
            set({ families: [] });
        } finally {
            set({ isFamiliesLoading: false });
        }
    },
    addFamily: async (familyData) => {
        set({ isLoading: true });
        try {
            const newFamily = await familyAPI.createFamily(familyData);
            set(state => ({
                families: [...state.families, newFamily]
            }));
            return newFamily;
        } catch (error) {
            console.error("Failed to add family:", error);
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },
}));
