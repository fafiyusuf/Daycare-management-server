// src/lib/api/auth.ts
import axiosInstance from '@/lib/api'; // Import your configured Axios instance
import { useAuthStore } from '@/lib/store/authStore'; // Import useAuthStore for logout
import type { User } from "@/lib/types";

export const authAPI = {
  login: async (
    username: string,
    password: string,
  ): Promise<{ user: User; access: string; refresh: string }> => {
    // Use the axiosInstance to make the POST request to your login endpoint
    const response = await axiosInstance.post('/login/', { username, password });
    
    // The backend should return user, access, and refresh tokens in response.data
    return {
      user: response.data.user,
      access: response.data.access,
      refresh: response.data.refresh,
    };
  },

  register: async (userData: Omit<User, "id" | "createdAt" | "isActive"> & { password: string }): Promise<User> => {
    // Use axiosInstance for registration as well
    const response = await axiosInstance.post('/users/', userData);
    return response.data;
  },

  // This function now handles blacklisting the refresh token on the backend
  // and then clears the client-side state.
  logout: async (): Promise<void> => {
    const refreshToken = useAuthStore.getState().refreshToken; // Get the refresh token from the store
    if (refreshToken) {
      try {
        // Send the refresh token to the backend to blacklist it
        await axiosInstance.post('/logout/', { refresh: refreshToken });
      } catch (error) {
        console.error("Backend logout failed (refresh token blacklisting):", error);
        // Continue with client-side logout even if backend blacklisting fails
        // This might happen if the refresh token is already invalid/expired on the backend
      }
    }
    // Always clear tokens from the frontend store immediately on client-side logout
    useAuthStore.getState().logout(); 
  },

  resetPassword: async (_username: string): Promise<void> => {
    // This is a mock function, so it can remain as is or use axiosInstance if backend endpoint exists
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Password reset functionality is not fully implemented in the mock API.");
    // Example if you had an endpoint:
    // await axiosInstance.post('/password-reset/', { username });
  },
};