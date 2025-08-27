import { userAPI } from "@/lib/api/user";
import type { User } from "@/lib/types";
import { create } from "zustand";

interface UserState {
  users: User[];
  isLoading: boolean;
  count: number;
  next: string | null;
  previous: string | null;
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  updateUser: (id: number, updates: Partial<User>) => void;
  fetchUsers: (params?: { page?: number; search?: string; role?: string; is_active?: string }) => Promise<void>;
}

export const useUserStore = create<UserState>()((set) => ({
  users: [],
  isLoading: false,
  count: 0,
  next: null,
  previous: null,
  setUsers: (users) => set({ users }),
  addUser: (user) => set((state) => ({ users: [...state.users, user] })),
  updateUser: (id, updates) =>
    set((state) => ({
      users: state.users.map((user) => (user.id === id ? { ...user, ...updates } : user)),
    })),
  fetchUsers: async (params) => {
    try {
      set({ isLoading: true });
      const response = await userAPI.getUsers(params);
      set({ 
        users: response.results || [], 
        count: response.count || 0,
        next: response.next,
        previous: response.previous,
        isLoading: false 
      });
    } catch (error) {
      console.error("Failed to fetch users:", error);
      set({ isLoading: false });
      throw error; // Re-throw to handle in components
    }
  },
}));