// src/lib/api/publicApi.ts
import axios from 'axios';

// Create a separate Axios instance for public, unauthenticated routes
export const publicApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  // No interceptors are added to this instance
});