// src/hooks/useNurseDashboard.ts
import { healthAPI } from "@/lib/api/health"
import { useChildStore, useHealthStore } from "@/lib/store"
import type { HealthEvent } from "@/lib/types"
import { useEffect, useMemo, useState } from "react"

export function useNurseDashboard() {
  const { children, fetchChildren } = useChildStore()
  const { 
    healthEvents, 
    addHealthEvent, 
    updateHealthEvent, 
    deleteHealthEvent, 
    fetchHealthEvents,
    isLoading,
    currentPage,
    totalCount,
    hasNextPage,
    hasPreviousPage,
    setCurrentPage
  } = useHealthStore()
  
  const [activeTab, setActiveTab] = useState("overview")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<HealthEvent | null>(null)
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0])
  const [form, setForm] = useState({
    child: '',
    event_type: '',
    description: '',
    medication_name: '',
    dosage: '',
    temperature: '',
    timestamp: new Date().toISOString().slice(0, 16),
    notes: '',
  })

  // Memoized maps for efficient lookups
  const childNameMap = useMemo(() => {
    const map = new Map<string, string>()
    children.forEach(child => {
      map.set(String(child.id), `${child.first_name} ${child.last_name}`.trim())
    })
    return map
  }, [children])

  const parentNameMap = useMemo(() => {
    const map = new Map<string, string>()
    children.forEach(child => {
      const parent = child.parents?.[0]
      map.set(
        String(child.id), 
        parent ? `${parent.first_name} ${parent.last_name}`.trim() : '-'
      )
    })
    return map
  }, [children])

  // Fetch children on mount
  useEffect(() => {
    fetchChildren()
  }, [fetchChildren])

  // Fetch health events when tab, date or page changes
  useEffect(() => {
    if (activeTab === "health") {
      fetchHealthEvents(undefined, selectedDate, currentPage)
    }
  }, [activeTab, selectedDate, currentPage, fetchHealthEvents])

  // Handle form submission for adding event
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!form.child) {
        throw new Error("Please select a child")
      }

      const response = await healthAPI.logHealthEvent({
        ...form,
        timestamp: new Date(form.timestamp).toISOString(),
        child: String(form.child),
        temperature: form.temperature || "",
      })
      
      addHealthEvent(response)
      setShowAddModal(false)
      setForm({
        child: "", 
        event_type: "", 
        description: "", 
        medication_name: "",
        dosage: "", 
        temperature: "", 
        timestamp: new Date().toISOString().slice(0, 16), 
        notes: ""
      })
    } catch (error) {
      console.error("Failed to log health event:", error)
    }
  }

  // Handle form submission for updating event
  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingEvent?.id) return
    
    try {
      const response = await healthAPI.updateHealthEvent(editingEvent.id, {
        ...form,
        timestamp: new Date(form.timestamp).toISOString(),
        child: String(form.child),
        temperature: form.temperature ,
      })
      
      updateHealthEvent(editingEvent.id, response)
      setShowEditModal(false)
      setEditingEvent(null)
    } catch (error) {
      console.error("Failed to update health event:", error)
    }
  }

  // Handle deleting an event
  const handleDeleteEvent = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await healthAPI.deleteHealthEvent(id)
        deleteHealthEvent(id)
      } catch (error) {
        console.error("Failed to delete health event:", error)
      }
    }
  }

  // Handle editing an event
  const handleEditEvent = (id: string) => {
    const eventToEdit = healthEvents.find(event => event.id === id)
    if (eventToEdit) {
      setEditingEvent(eventToEdit)
      setForm({
        child: String(eventToEdit.childId || eventToEdit.child),
        event_type: eventToEdit.event_type || eventToEdit.type || '',
        description: eventToEdit.description || eventToEdit.event || '',
        medication_name: eventToEdit.medication_name || '',
        dosage: eventToEdit.dosage || '',
        temperature: eventToEdit.temperature || '',
        timestamp: formatDateTimeForInput(eventToEdit.timestamp || ''),
        notes: eventToEdit.notes || '',
      })
      setShowEditModal(true)
    }
  }

  // Handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value)
    setCurrentPage(1)
  }

  // Helper function to format datetime for input fields
  const formatDateTimeForInput = (timestamp: string) => {
    if (!timestamp) return ""
    try {
      const date = new Date(timestamp)
      return date.toISOString().slice(0, 16)
    } catch {
      return ""
    }
  }

  return {
    activeTab,
    setActiveTab,
    children,
    healthEvents,
    isLoading,
    currentPage,
    totalCount,
    hasNextPage,
    hasPreviousPage,
    setCurrentPage,
    showAddModal,
    setShowAddModal,
    showEditModal,
    setShowEditModal,
    editingEvent,
    selectedDate,
    form,
    setForm,
    childNameMap,
    parentNameMap,
    handleAddEvent,
    handleUpdateEvent,
    handleDeleteEvent,
    handleEditEvent,
    handleDateChange,
  }
}