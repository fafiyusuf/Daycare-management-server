// src/lib/store/authStore.ts
import type { User } from "@/lib/types"
import toast from "react-hot-toast"
import { create } from "zustand"
import { persist } from "zustand/middleware"

// Corrected AuthState interface - ensure this matches lib/types.ts
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  token: string | null         // Access token
  refreshToken: string | null  // Refresh token
  login: (user: User, accessToken: string, refreshToken: string) => void // Updated signature
  logout: () => void
  setTokens: (accessToken: string, refreshToken: string) => void // New action to update tokens
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      refreshToken: null, // Initialize refreshToken
      login: (user, accessToken, refreshToken) => { // Updated login to accept both tokens
        set({ user, isAuthenticated: true, token: accessToken, refreshToken })
        // Crucial: Store tokens in localStorage
        localStorage.setItem('access', accessToken);
        localStorage.setItem('refresh', refreshToken);
        toast.success(`Welcome, ${user.first_name}!`) // Changed from user.name to user.first_name
      },
      logout: () => {
        set({ user: null, isAuthenticated: false, token: null, refreshToken: null })
        // Crucial: Remove tokens from localStorage on logout
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        toast.success("Successfully logged out")
        // Optional: Force a redirect to login page if not handled by interceptor
        // window.location.href = '/login';
      },
      setTokens: (accessToken, refreshToken) => { // Implementation for setTokens
        set({ token: accessToken, refreshToken });
        localStorage.setItem('access', accessToken);
        localStorage.setItem('refresh', refreshToken);
      },
    }),
    {
      name: "ssgi-daycare-auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        refreshToken: state.refreshToken, // IMPORTANT: Persist the refresh token as well
      }),
    },
  ),
)