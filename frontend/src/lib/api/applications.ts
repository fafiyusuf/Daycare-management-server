// src/lib/api/applications.ts
import api from "@/lib/api";

export interface ApplicationItem {
  id: number | string;
  full_name: string;
  email: string;
  phone?: string;
  
  // Employment details
  department: string;
  position: string;
  employee_monthly_salary: number;
  spouse_monthly_salary?: number;
  
  // Child information
  child_birth_date: string;
  
  // Residential address
  sub_city: string;
  woreda: string;
  kebele: string;
  
  status: string;
  created_at: string;
}

interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const applicationsAPI = {
  async list(params?: { page?: number, status?: string }): Promise<{ applications: ApplicationItem[], count: number }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.status && params.status !== 'all') queryParams.append('status', params.status);
    
    const url = `/applications/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const res = await api.get<ApplicationItem[] | Paginated<ApplicationItem>>(url);
    
    const data = res.data as any;
    if (Array.isArray(data)) return { applications: data, count: data.length };
    if (data && Array.isArray(data.results)) return { applications: data.results, count: data.count || 0 };
    return { applications: [], count: 0 };
  },
  
  async updateStatus(id: number | string, status: string): Promise<ApplicationItem> {
    const res = await api.post(`/applications/${id}/update_status/`, { status });
    return res.data;
  }
};
