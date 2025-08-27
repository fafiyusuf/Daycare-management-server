// src/lib/api/incident.ts

import api from "@/lib/api"
import type { IncidentLog, PaginatedResponse } from "@/lib/types"

export const incidentAPI = {
  // Fetch all incident logs (for admins)
  getIncidents: async (
    url: string = "/incident-logs/",
    childId?: string,
    date?: string
  ): Promise<PaginatedResponse<IncidentLog>> => {
    const params = new URLSearchParams()
    if (childId) params.append("child", childId)
    if (date) params.append("created_at__date", date)
    const res = await api.get(url, { params })
    return res.data
  },

  // Log a new incident
  logIncident: async (incidentData: {
    child: string
    title: string
    description: string
  }): Promise<IncidentLog> => {
    const res = await api.post("/incident-logs/", incidentData)
    return res.data
  },
}
