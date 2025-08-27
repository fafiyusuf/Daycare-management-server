// src/lib/api/admin.ts
// This file houses authenticated API calls for administrative tasks.

import api from "@/lib/api"; // This is your authenticated API instance (e.g., axios.create with auth interceptors)

import type { Announcement } from "@/lib/store"; // Assuming Announcement type is shared

// Base URL for admin announcements
const ANNOUNCEMENTS_ADMIN_BASE_URL = "/announcements"; // Corresponds to http://127.0.0.1:8001/api/announcements/

// Define the expected structure of the announcement response from your backend
interface BackendAnnouncementResponse {
  id: number | string;
  title: string;
  content: string;
  created_at: string; // Assuming your backend sends 'created_at' for the date
  author_name?: string; // Optional, if author name might not always be present
  is_public: boolean;
}

// Define the expected paginated response structure from your backend
interface PaginatedBackendResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[]; // The actual array of items is here
}

// Helper function to map the backend response object to your frontend Announcement type
const mapBackendToFrontendAnnouncement = (item: BackendAnnouncementResponse): Announcement => ({
  id: String(item.id),
  title: item.title,
  content: item.content,
  date: item.created_at || "", // Use created_at for the 'date' field in your frontend model
  author: item.author_name || "Unknown",
  isPublic: item.is_public,
  createdAt: item.created_at, // Keep createdAt for consistency if needed
});

// --- Admin Announcement API Functions ---

/**
 * Fetches all announcements for the admin dashboard.
 * Requires authentication.
 * @returns A promise that resolves to an array of Announcement objects.
 */
export const getAdminAnnouncements = async (): Promise<Announcement[]> => {
  // Now expecting a paginated response
  const response = await api.get<PaginatedBackendResponse<BackendAnnouncementResponse>>(ANNOUNCEMENTS_ADMIN_BASE_URL);
  // Access the 'results' array before mapping
  return response.data.results.map(mapBackendToFrontendAnnouncement);
};

/**
 * Creates a new announcement.
 * Requires authentication.
 * @param data The announcement data to send to the backend.
 * @returns A promise that resolves to the newly created Announcement object.
 */
export const createAdminAnnouncement = async (data: {
  title: string;
  content: string;
  created_at: string; // Matches backend field name for date
  author_name: string; // Matches backend field name for author
  is_public: boolean; // Matches backend field name for public status
}): Promise<Announcement> => {
  // Ensure trailing slash if your backend expects it for POST
  const response = await api.post<BackendAnnouncementResponse>(`${ANNOUNCEMENTS_ADMIN_BASE_URL}/`, data);
  return mapBackendToFrontendAnnouncement(response.data);
};

/**
 * Updates an existing announcement.
 * Requires authentication.
 * @param id The ID of the announcement to update.
 * @param data The partial announcement data to update.
 * @returns A promise that resolves to the updated Announcement object.
 */
export const updateAdminAnnouncement = async (
  id: string,
  data: {
    title?: string;
    content?: string;
    created_at?: string;
    author_name?: string;
    is_public?: boolean;
  }
): Promise<Announcement> => {
  // Ensure trailing slash if your backend expects it for PUT
  const response = await api.put<BackendAnnouncementResponse>(`${ANNOUNCEMENTS_ADMIN_BASE_URL}/${id}/`, data);
  return mapBackendToFrontendAnnouncement(response.data);
};

/**
 * Deletes an announcement.
 * Requires authentication.
 * @param id The ID of the announcement to delete.
 * @returns A promise that resolves when the announcement is successfully deleted.
 */
export const deleteAdminAnnouncement = async (id: string): Promise<void> => {
  // Ensure trailing slash if your backend expects it for DELETE
  await api.delete(`${ANNOUNCEMENTS_ADMIN_BASE_URL}/${id}/`);
};