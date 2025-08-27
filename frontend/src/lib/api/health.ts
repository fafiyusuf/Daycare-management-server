import api from '@/lib/api'
import type { HealthEvent } from "@/lib/types"

// Map simplified UI types to backend canonical event_type values
const mapToBackendEventType = (t: string): string => {
  switch (t) {
    case 'checkup':
      return 'health_check'
    case 'incident':
      return 'injury'
    case 'medication':
    case 'health_check':
    case 'injury':
    case 'illness':
    case 'temperature':
    case 'other':
      return t
    default:
      return 'other'
  }
}

// Normalise backend response/object into unified HealthEvent shape consumed by UI
const normalise = (e: any): HealthEvent => {
  const timestamp: string = e.timestamp || e.time || ''
  const date = timestamp ? timestamp.split('T')[0] : (e.date || '')
  const event_type = e.event_type || e.type || 'other'
  return {
    id: String(e.id),
    childId: String(e.child),
    child: e.child,
    event_type,
    description: e.description || e.event || '',
    medication_name: e.medication_name || '',
    dosage: e.dosage || '',
    temperature: e.temperature !== undefined && e.temperature !== null ? String(e.temperature) : '',
    timestamp,
    notes: e.notes || '',
    recorded_by_name: e.recorded_by_name || e.recorded_by || '',
    // Legacy/simple convenience fields
    event: e.description || e.event || '',
    time: timestamp,
    date,
    loggedBy: e.recorded_by_name || e.recorded_by || '',
    type: event_type as any,
  }
}

export const healthAPI = {
  // Create a new health event (accepts either simplified or full shape)
  logHealthEvent: async (eventData: any): Promise<HealthEvent> => {
    let payload: Record<string, any>
    if (eventData.child || eventData.childId) {
      if (eventData.event_type && eventData.description) {
        payload = { ...eventData, event_type: mapToBackendEventType(eventData.event_type) }
      } else {
        payload = {
          child: eventData.childId || eventData.child,
          description: eventData.event,
          event_type: mapToBackendEventType(eventData.type),
          medication_name: eventData.medication_name || '',
          dosage: eventData.dosage || '',
          temperature: eventData.temperature || '',
          notes: eventData.notes || '',
        }
      }
    } else {
      payload = eventData
    }
    const response = await api.post('/health-events/', payload)
    return normalise(response.data)
  },

  // Get all health events with pagination and filtering
  getHealthEvents: async (childId?: string, date?: string, page = 1, pageSize = 10): Promise<{ 
    count: number; 
    next: string | null; 
    previous: string | null; 
    results: HealthEvent[] 
  }> => {
    const params: Record<string, any> = {
      page: String(page),
      page_size: String(pageSize),
    }

    if (childId) {
      params.child_id = childId
    }

    if (date) {
      params.timestamp__date = date  // Changed from 'date' to 'timestamp__date'
    }

    const response = await api.get('/health-events/', { params })
    return {
      count: response.data.count,
      next: response.data.next,
      previous: response.data.previous,
      results: response.data.results.map(normalise)
    }
  },

  // Get a specific health event by ID
  getHealthEventById: async (id: string): Promise<HealthEvent> => {
    const response = await api.get(`/health-events/${id}/`)
    return normalise(response.data)
  },

  // Update a health event (partial)
  updateHealthEvent: async (id: string, updates: Partial<HealthEvent>): Promise<HealthEvent> => {
    const transformed: any = { ...updates }
    if ((updates as any).type && !updates.event_type) {
      transformed.event_type = mapToBackendEventType((updates as any).type as string)
    }
    if ((updates as any).event && !updates.description) {
      transformed.description = (updates as any).event
    }
    if ((updates as any).childId && !updates.child) {
      transformed.child = (updates as any).childId
    }
    const response = await api.patch(`/health-events/${id}/`, transformed)
    return normalise(response.data)
  },

  // Delete a health event
  deleteHealthEvent: async (id: string): Promise<void> => {
    await api.delete(`/health-events/${id}/`)
  },
}