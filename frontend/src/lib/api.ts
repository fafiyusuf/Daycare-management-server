// lib/api/api.ts
import { useAuthStore } from '@/lib/store/authStore'; // Ensure this path is correct for your project
import axios from "axios";

// Base URL for your API, read from environment variables.
// It's recommended to use NEXT_PUBLIC_API_BASE_URL for consistency with our previous steps.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  // This check ensures the environment variable is configured
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined in your environment variables. Please set it in .env.local");
}

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,

  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get the current access token from the Zustand store
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const { refreshToken, setTokens, logout } = useAuthStore.getState();

    // Check if it's a 401 error AND not a retry AND not the login/refresh token endpoint itself
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/login/' && // Exclude login endpoint
      originalRequest.url !== '/token/refresh/' // Exclude refresh endpoint
    ) {
      originalRequest._retry = true; // Mark this request as retried

      if (refreshToken) {
        try {
          // Attempt to get a new access token using the refresh token
          const response = await axios.post(
            `${API_BASE_URL}/token/refresh/`, // Use absolute URL to avoid circular dependency
            { refresh: refreshToken }
            // No custom options that TypeScript doesn't recognize
          );

          // Check if the response contains the expected tokens
          if (response.data && response.data.access) {
            // Get new refresh token if provided (token rotation) or use existing
            const newRefreshToken = response.data.refresh || refreshToken;
            
            // Update tokens in the Zustand store
            setTokens(response.data.access, newRefreshToken);
            
            // Update the Authorization header for the retried request
            originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;

            // Retry the original failed request with the new access token
            return api(originalRequest);
          } else {
            throw new Error("Invalid token refresh response");
          }
        } catch (refreshError: any) {
          console.error("Token refresh failed:", refreshError);
          // If refresh fails (e.g., refresh token expired/invalid), log out the user
          logout();
          // You might want to explicitly redirect here, or rely on a global guard
          // window.location.href = "/login"; // This is a full page reload redirect
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token available, so just log out
        console.warn("No refresh token available. Logging out.");
        logout();
        // You might want to explicitly redirect here
        // window.location.href = "/login";
      }
    }

    // For any other error status, or if it's already retried, or if it's the login/refresh endpoint itself
    return Promise.reject(error);
  },
);

// Export only the configured Axios instance
export default api;
// Removed: export * from "./api" - This line was problematic and should not be there.