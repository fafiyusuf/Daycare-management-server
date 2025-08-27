// lib/api/system.ts
import axiosInstance from '@/lib/api'; // Import your configured Axios instance

// The delay function is no longer needed for real API calls
// const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const systemAPI = {
  getStatus: async (): Promise<{ uptime: string; status: string; version: string }> => {
    try {
      // Use axiosInstance to make a GET request to your system status endpoint
      const response = await axiosInstance.get('/system/status/');
      
      // Assuming your backend returns data like { uptime: "...", status: "...", version: "..." }
      return response.data; 
    } catch (error: any) {
      console.error("Error fetching system status:", error.response?.data || error.message);
      // Re-throw the error so it can be caught by SystemOverview.tsx
      throw new Error(error.response?.data?.detail || "Failed to fetch system status.");
    }
  },
};