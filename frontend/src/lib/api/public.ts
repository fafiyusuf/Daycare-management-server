// src/lib/api/public.ts

import api from "@/lib/api";
import { publicApi } from "./adminPublic";

import type { Announcement, GalleryPhoto, StaffProfile, User } from "@/lib/types";

// Backend response types
interface GalleryApiResponse {
  id: number | string;
  uploaded_by_details?: {
    id: number | string;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    role?: string;
    phone?: string;
    is_active_staff?: boolean;
    profile_picture?: string | null;
    bio?: string;
  };
  title?: string;
  description?: string;
  photo: URL | string;
  is_public: boolean;
  created_at: string;
  uploaded_by_name?: number | string;
}

interface StaffApiResponse {
    id: string | number;
    user: User;
    bio: string;
    experience: string;
    specialty: string;
    is_public: boolean;
}

export const publicAPI = {
  getAnnouncements: async (): Promise<Announcement[]> => {
    const response = await publicApi.get<any[]>("/public/announcements/");
    return response.data.map((item: any) => ({
      id: String(item.id),
      title: item.title,
      content: item.content,
      date: item.created_at || item.date || "",
      author: item.author_name || "Unknown",
      isPublic: item.is_public,
      createdAt: item.created_at || "",
    }));
  },

  getGallery: async (): Promise<GalleryPhoto[]> => {
    const response = await publicApi.get<GalleryApiResponse[]>("/public/gallery/");
    return response.data.map(item => ({
      id: String(item.id),
      url: item.photo.toString().startsWith("http")
        ? item.photo.toString()
        : `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api\/?$/, "")}/${item.photo}`,
      caption: item.description || item.title || "",
      uploadedAt: item.created_at,
      isPublic: item.is_public,
      uploadedBy: item.uploaded_by_details?.username || String(item.uploaded_by_name || '')
    }));
  },

  createGalleryPhoto: async (
    photoData: Omit<GalleryPhoto, "id" | "uploadedAt"> & { formTitle?: string; formDescription?: string }
  ): Promise<GalleryPhoto> => {
    const formData = new FormData();
    formData.append("photo", photoData.url as unknown as File);
    formData.append("title", photoData.formTitle || photoData.caption || "");
    formData.append("description", photoData.formDescription || photoData.caption || "");
    formData.append("is_public", String(photoData.isPublic));

    const response = await api.post<GalleryApiResponse>("/gallery/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return {
      id: String(response.data.id),
      url: response.data.photo.toString().startsWith("http")
        ? response.data.photo.toString()
        : `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api\/?$/, "")}/${response.data.photo}`,
      caption: response.data.description || response.data.title || "",
      uploadedAt: response.data.created_at,
      isPublic: response.data.is_public,
      uploadedBy: response.data.uploaded_by_details?.username || String(response.data.uploaded_by_name || '')
    };
  },

  deletePhoto: async (id: string): Promise<void> => {
    // Uses authenticated API; DELETE /gallery/{id}/ is provided by DRF ModelViewSet
    await api.delete(`/gallery/${id}/`);
  },

  getStaffProfiles: async (): Promise<(StaffProfile & { user: User })[]> => {
    try {
      // This now returns User objects directly, not StaffProfile objects
      const response = await publicApi.get<User[]>("/public/staff/");

      if (!Array.isArray(response.data)) {
        console.error('Unexpected API response format for staff profiles:', response.data);
        return [];
      }
      
      console.log('Raw staff users from API:', response.data);
      
      // Transform User objects into StaffProfile format to maintain interface compatibility
      return response.data.map((user: User) => {
          if (!user) {
            console.warn('Skipping invalid user data', user);
            return null;
          }
          
          // Create a compatible staff profile object from the user
          const profile: StaffProfile & { user: User } = {
            id: String(user.id), // Use user ID as profile ID
            userId: String(user.id),
            user: user,
            bio: user.bio || '',
            experience: '', // These fields may not be available in User objects
            specialty: '',
            isPublic: user.is_public !== undefined ? user.is_public : true,
          };
          
          return profile;
          
      }).filter((p): p is StaffProfile & { user: User } => p !== null);
      
    } catch (error) {
      console.error('Error fetching staff profiles:', error);
      return [];
    }
  },

  submitApplication: async (data: {
    full_name: string;
    email: string;
    phone?: string;
    department: string;
    position: string;
    employee_monthly_salary: number;
    spouse_monthly_salary?: number;
    child_birth_date: string;
    sub_city: string;
    woreda: string;
    kebele: string;
  }) => {
    const response = await publicApi.post('/public/apply/', data);
    return response.data;
  },
};