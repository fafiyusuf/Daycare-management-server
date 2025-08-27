// src/lib/api/child.ts

import api from "@/lib/api"
import type { BackendChild, ChildAPIResponse } from "../store/childStore"
import type { User } from "../types"

// Update the CreateChildPayload type to include profilePicture
type CreateChildPayload = {
  firstName: string
  lastName: string
  dateOfBirth: string
  parent_ids: number[]
  family: { id: string | number; emergency_contact?: string }
  medicalInfo?: string
  allergies?: string
  babysitter?: User | null
  profilePicture?: File | null 
}

export const childAPI = {
  // FIX: Changed the return type from Promise<ChildAPIResponse> to Promise<BackendChild[]>
  getChildren: async (params?: { page?: number; search?: string; is_active?: string }): Promise<BackendChild[]> => {
    let allChildren: BackendChild[] = []
    let nextPage: string | null = "/children/"
    const requestParams = { ...params }

    try {
      while (nextPage) {
  const response: { data: ChildAPIResponse } = await api.get<ChildAPIResponse>(nextPage, { params: requestParams })
        allChildren = allChildren.concat(response.data.results)
        nextPage = response.data.next
        // Clear params after first request to not repeat them in subsequent paginated requests
        if (Object.keys(requestParams).length > 0) {
          delete requestParams.page
        }
      }
      return allChildren
    } catch (error) {
      console.error("API Error: Failed to fetch children", error)
      throw error
    }
  },

  getChildById: async (childId: number): Promise<BackendChild> => {
    try {
      const response = await api.get<BackendChild>(`/children/${childId}/`)
      return response.data
    } catch (error) {
      console.error(`API Error: Failed to fetch child with id ${childId}`, error)
      throw error
    }
  },

  createChild: async (childData: CreateChildPayload): Promise<BackendChild> => {
    try {
      const formData = new FormData() // Use FormData for file uploads

      // Append all fields to FormData
      formData.append("first_name", childData.firstName)
      formData.append("last_name", childData.lastName)
      formData.append("date_of_birth", childData.dateOfBirth)

      // Append each parent ID (Django expects multiple entries for M2M when using FormData)
      childData.parent_ids.forEach(id => {
        formData.append("parent_ids", id.toString())
      })

  // Backend expects 'family_id' (family is read-only in serializer)
  formData.append("family_id", childData.family.id.toString())

      // Handle optional babysitter ID
      if (childData.babysitter?.id) {
        // Serializer write-only field is assigned_babysitter_id
        formData.append("assigned_babysitter_id", childData.babysitter.id.toString())
      } else {
        formData.append("assigned_babysitter_id", "") // Empty if none
      }

      // Append optional text fields, ensuring they are not 'undefined'
      formData.append("medical_info", childData.medicalInfo || "")
      formData.append("allergies", childData.allergies || "")
      formData.append("emergency_contact", childData.family.emergency_contact || "")

      // Append the profile picture file if it exists
      if (childData.profilePicture) {
        formData.append("profile_picture", childData.profilePicture)
      }

      console.log("Sending FormData from child.ts:", formData) // Debugging FormData content

      const response = await api.post<BackendChild>("/children/", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Crucial header for file uploads
        },
      })
      return response.data
    } catch (error) {
      console.error("API Error: Failed to create child", error)
      // Propagate the error so the frontend can handle it
      throw error
    }
  },

  deactivateChild: async (childId: number): Promise<void> => {
    try {
      await api.patch(`/children/${childId}/`, { is_active: false }) // Assuming you use the custom action for deactivate
    } catch (error) {
      console.error("API Error: Failed to deactivate child", error)
      throw error
    }
  },

  activateChild: async (childId: number): Promise<BackendChild> => {
    try {
      // Send a PATCH request to update the 'is_active' field to true
      const response = await api.patch<BackendChild>(`/children/${childId}/`, { is_active: true })
      return response.data
    } catch (error) {
      console.error("API Error: Failed to activate child", error)
      throw error
    }
  },

  updateChild: async (childId: number, updatedData: Partial<BackendChild>): Promise<BackendChild> => {
    // Note: If you want to update profile picture here too,
    // you'll need a similar FormData logic for updateChild.
    // For now, it assumes no file update in this partial update.
    try {
      // Create a sanitized copy of the data to ensure we only send valid fields
      const sanitizedData: Record<string, any> = {};
      
      // Only include fields that are defined (not undefined)
      Object.entries(updatedData).forEach(([key, value]) => {
        if (value !== undefined) {
          // Convert to proper field names expected by the backend API
          if (key === 'parents' && Array.isArray(value)) {
            // Convert parents array to parent_ids for API
            sanitizedData.parent_ids = value.map(p => typeof p === 'object' ? p.id : p);
          } else if (key === 'family' && typeof value === 'number') {
            // Convert family to family_id
            sanitizedData.family_id = value;
          } else if (key === 'assigned_babysitter' && typeof value === 'number') {
            // Convert assigned_babysitter to assigned_babysitter_id
            sanitizedData.assigned_babysitter_id = value;
          } else {
            sanitizedData[key] = value;
          }
        }
      });
      
      // Check if we're trying to update file-related fields without FormData
      const fileFields = ['profile_picture', 'birth_certificate', 'vaccination_card'];
      fileFields.forEach(field => {
        if (typeof sanitizedData[field] === 'object' && sanitizedData[field] !== null) {
          console.warn(`Warning: Trying to update ${field} without FormData. Use updateChildDocuments instead.`);
          // Remove this field to prevent API errors
          delete sanitizedData[field];
        }
      });

      // Log what's being sent to the API
      console.log('Sending partial update with data:', sanitizedData);
      
      const response = await api.patch<BackendChild>(`/children/${childId}/`, sanitizedData);
      return response.data;
    } catch (error) {
      console.error("API Error: Failed to update child", error);
      throw error;
    }
  },
  updateChildDocuments: async (childId: number, formData: FormData): Promise<BackendChild> => {
    try {
      console.log(`Sending PATCH request to /children/${childId}/`);
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      
      // Ensure we have the right content type for multipart/form-data
      const response = await api.patch<BackendChild>(`/children/${childId}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Upload successful:', response.data);
      return response.data;
    } catch (error) {
      console.error("API Error: Failed to update child documents", error);
      console.error("Error response:", (error as any)?.response?.data);
      throw error;
    }
  },
  // === ADD THIS FUNCTION ===
  getDailyReport: async (childId: number | string, date: string) => {
    try {
      const response = await api.get(`/daily-reports/${childId}/${date}/`);
      return response.data;
    } catch (error) {
      console.error("API Error: Failed to fetch daily report", error);
      throw error;
    }
  },
};

