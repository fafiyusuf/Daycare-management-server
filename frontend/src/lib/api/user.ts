// lib/api/user.ts
import axiosInstance from '@/lib/api'; // Import your configured Axios instance
import type { Child, User, UserAPIResponse } from "@/lib/types";

// The delay function is no longer needed for real API calls
// const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const userAPI = {
  // Create Staff (User Creation)
  createStaff: async (userData: Omit<User, "id" | "createdAt" | "is_active_staff"> & { password: string }): Promise<User> => {
    try {
      // Use axiosInstance to make a POST request to your users creation endpoint
      // Ensure your backend endpoint is configured to accept staff creation with roles and password.
      const response = await axiosInstance.post('/users/', userData);
      return response.data; // Assuming the backend returns the created user object
    } catch (error: any) {
      console.error("Error creating staff user:", error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || Object.values(error.response?.data || {}).flat().join(" ") || "Failed to create staff user.");
    }
  },

  // Create Staff with Image
  createStaffWithImage: async (formData: FormData): Promise<User> => {
    try {
      const response = await axiosInstance.post('/users/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("Error creating staff user with image:", error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || Object.values(error.response?.data || {}).flat().join(" ") || "Failed to create staff user.");
    }
  },

  updateStaff: async (id: number, updates: Partial<User>): Promise<User> => {
    try {
      console.log('Updating staff:', { id, updates });
      const response = await axiosInstance.patch(`/users/${id}/`, updates);
      console.log('Update response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating staff user ${id}:`, error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      throw error;
    }
  },

  // Update Staff with Image
  updateStaffWithImage: async (id: number, formData: FormData): Promise<User> => {
    try {
      console.log('Updating staff with image:', { id });
      const response = await axiosInstance.patch(`/users/${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Update response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating staff user ${id} with image:`, error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      throw error;
    }
  },

  // Note: createFamily might also be a form of user creation (for parents/children)
  // You'll need to implement this with a real API call when ready.
  createFamily: async (familyData: { parent: Omit<User, "id" | "createdAt">; child: Omit<Child, "id" | "createdAt"> }): Promise<{ parent: User; child: Child }> => {
    console.warn("User createFamily API is mocked. Implement real API call.");
    throw new Error("Not implemented: Real API for createFamily");
  },
  
  assignChild: async (childId: string, babysitterId: string): Promise<Child> => {
    console.warn("User assignChild API is mocked. Implement real API call.");
    throw new Error("Not implemented: Real API for assignChild");
  },
  
  // You will also likely need a 'getUsers' or 'listUsers' function for UserManagement to fetch existing users
  getUsers: async (params?: { page?: number; search?: string; role?: string; is_active?: string }): Promise<UserAPIResponse> => {
    try {
      const response = await axiosInstance.get('/users/', { params });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch users:", error);
      throw error;
    }
  },

  // Update any user (for parents, etc.)
  updateUser: async (id: number, updates: Partial<User>): Promise<User> => {
    try {
      const response = await axiosInstance.patch(`/users/${id}/`, updates);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating user ${id}:`, error);
      throw error;
    }
  },
};