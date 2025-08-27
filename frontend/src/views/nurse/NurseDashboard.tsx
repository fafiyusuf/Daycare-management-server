"use client"

import { IncidentLogModal } from "@/components/IncidentLogModal"
import { AddEditEventModal } from "@/components/nurse/AddEditEventModal"
import { HealthEventsTable } from "@/components/nurse/HealthEventsTable"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/crd"
import { AxiosError } from "axios"
import { AlertTriangle, Baby, BarChart3, Plus, Stethoscope } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "react-hot-toast"
// import { Chat } from "@/components/ui/Chat"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { healthAPI } from "@/lib/api/health"
import { useChildStore, useHealthStore } from "@/lib/store"
import type { HealthEvent } from "@/lib/types"

export function NurseDashboard() {
  const { children, fetchChildren } = useChildStore()
  const {
    healthEvents,
    addHealthEvent,
    updateHealthEvent,
    deleteHealthEvent,
    fetchHealthEvents,
    isLoading,
    setLoading,
    currentPage,
    totalCount,
    hasNextPage,
    hasPreviousPage,
    setCurrentPage,
  } = useHealthStore()

  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("nurseActiveTab") || "overview"
    }
    return "overview"
  })
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<HealthEvent | null>(null)
  const [showIncidentModal, setShowIncidentModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  )

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("nurseActiveTab", activeTab)
    }
  }, [activeTab])

  const [form, setForm] = useState({
    child: "",
    event_type: "",
    description: "",
    medication_name: "",
    dosage: "",
    temperature: "",
    timestamp: new Date().toISOString().slice(0, 16),
    notes: "",
  })

  const childNameMap = useMemo(() => {
    const map = new Map<string, string>()
    children.forEach((child) => {
      map.set(String(child.id), `${child.first_name} ${child.last_name}`.trim())
    })
    return map
  }, [children])

  const parentNameMap = useMemo(() => {
    const map = new Map<string, string>()
    children.forEach((child) => {
      const parent = child.parents?.[0]
      map.set(
        String(child.id),
        parent ? `${parent.first_name} ${parent.last_name}`.trim() : "-"
      )
    })
    return map
  }, [children])

  const todayString = useMemo(
    () => new Date().toISOString().split("T")[0],
    []
  )
  const todayHealthEvents = useMemo(() => {
    return healthEvents.filter((event) => {
      const ts = event.timestamp || event.time
      if (!ts) return false
      try {
        const eventDate = new Date(ts).toISOString().split("T")[0]
        return eventDate === todayString
      } catch {
        return false
      }
    })
  }, [healthEvents, todayString])

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        await fetchChildren()
      } catch (err) {
        if (!(err instanceof DOMException)) {
          toast.error("Failed to fetch children data")
        }
      } finally {
        setLoading(false)
      }
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (activeTab !== "health") return
    const controller = new AbortController()
    const run = async () => {
      try {
        setLoading(true)
        await fetchHealthEvents(
          undefined,
          selectedDate,
          currentPage,
          controller.signal
        )
      } catch (err) {
        const errObj = err as { name?: string } | DOMException | undefined
        if (!(err instanceof DOMException) && errObj?.name !== "AbortError") {
          toast.error("Failed to fetch health events")
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    run()
    return () => controller.abort()
  }, [activeTab, selectedDate, currentPage, fetchHealthEvents, setLoading])

  const handleNextPage = useCallback(
    () => hasNextPage && setCurrentPage(currentPage + 1),
    [hasNextPage, currentPage, setCurrentPage]
  )
  const handlePreviousPage = useCallback(
    () => hasPreviousPage && setCurrentPage(currentPage - 1),
    [hasPreviousPage, currentPage, setCurrentPage]
  )
  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedDate(e.target.value)
      setCurrentPage(1)
    },
    [setCurrentPage]
  )

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob)
    const today = new Date()
    let years = today.getFullYear() - birthDate.getFullYear()
    let months = today.getMonth() - birthDate.getMonth()
    if (today.getDate() < birthDate.getDate()) months--
    if (months < 0) {
      years--
      months += 12
    }
    return years === 0 ? `${months} months` : `${years} years, ${months} months`
  }

  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!form.child) {
        toast.error("Please select a child")
        return
      }
      setLoading(true)
      const eventData = {
        ...form,
        timestamp: new Date(form.timestamp).toISOString(),
        child: String(form.child),
        temperature: form.temperature || undefined,
      }
      if (editingEvent) {
        const response = await healthAPI.updateHealthEvent(editingEvent.id, eventData)
        updateHealthEvent(editingEvent.id, response)
        toast.success("Health event updated successfully")
      } else {
        const response = await healthAPI.logHealthEvent(eventData)
        addHealthEvent(response)
        toast.success("Health event logged successfully")
      }
      setShowAddModal(false)
      setEditingEvent(null)
      setForm({
        child: "",
        event_type: "",
        description: "",
        medication_name: "",
        dosage: "",
        temperature: "",
        timestamp: new Date().toISOString().slice(0, 16),
        notes: "",
      })
      await fetchHealthEvents(undefined, selectedDate, currentPage)
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string }>
      toast.error(
        axiosError.response?.data?.detail ||
          `Failed to ${editingEvent ? "update" : "log"} health event`
      )
    } finally {
      setLoading(false)
    }
  }

  const handleEditEvent = (id: string) => {
    const eventToEdit = healthEvents.find((event) => event.id === id)
    if (eventToEdit) {
      setEditingEvent(eventToEdit)
      setForm({
        child: String(eventToEdit.childId || eventToEdit.child),
        event_type: eventToEdit.event_type || eventToEdit.type || "",
        description: eventToEdit.description || eventToEdit.event || "",
        medication_name: eventToEdit.medication_name || "",
        dosage: eventToEdit.dosage || "",
        temperature: eventToEdit.temperature || "",
        timestamp: new Date(
          eventToEdit.timestamp || eventToEdit.time
        )
          .toISOString()
          .slice(0, 16),
        notes: eventToEdit.notes || "",
      })
      setShowAddModal(true)
    }
  }

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return
    try {
      setLoading(true)
      await healthAPI.deleteHealthEvent(id)
      deleteHealthEvent(id)
      toast.success("Health event deleted successfully")
      await fetchHealthEvents(undefined, selectedDate, currentPage)
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string }>
      toast.error(
        axiosError.response?.data?.detail || "Failed to delete health event"
      )
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "health", label: "Health Events", icon: Stethoscope },
    // { id: "chat", label: "Chat", icon: MessageCircle },
  ]

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
           <div className="flex items-center justify-between mb-6">
             
             <Badge variant="secondary" className="px-4 py-2 text-sm">
               Nurse Role
             </Badge>
           </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex justify-center w-full">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-2"
            >
              <tab.icon className="w-4 h-4" />
              <span className=" lg:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Today&#39;s Health Events</CardTitle>
                <Stethoscope className="w-6 h-6 text-blue-500" />
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{todayHealthEvents.length}</p>
                <p className="text-sm text-gray-500">Total events logged today</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Total Children</CardTitle>
                <Baby className="w-6 h-6 text-green-500" />
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{children.length}</p>
                <p className="text-sm text-gray-500">Total children in daycare</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-lg mt-6">
            <CardHeader>
              <CardTitle>All Children</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead className="hidden md:table-cell">Parent</TableHead>
                      <TableHead className="hidden md:table-cell">Medical Info</TableHead>
                      <TableHead className="hidden sm:table-cell">Allergies</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {children.length > 0 ? (
                      children.map((child) => (
                        <TableRow key={child.id}>
                          <TableCell className="font-medium">{`${child.first_name} ${child.last_name}`}</TableCell>
                          <TableCell>{calculateAge(child.date_of_birth)}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {child.parents?.[0]
                              ? `${child.parents[0].first_name} ${child.parents[0].last_name}`
                              : "-"}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{child.medical_info || "-"}</TableCell>
                          <TableCell className="hidden sm:table-cell">{child.allergies || "-"}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          {isLoading ? "Loading..." : "No children found"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="mt-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <CardTitle>Health Events Log</CardTitle>
              <div className="flex w-full flex-col sm:flex-row sm:w-auto gap-2">
                <input
                  id="health-event-date-filter"
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="px-2 py-1.5 border rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
                  disabled={isLoading}
                />
                <Button
                  variant="outline"
                  onClick={() => setShowIncidentModal(true)}
                  className="gap-2 justify-center"
                >
                  <AlertTriangle className="w-5 h-5" />
                  <span className="hidden lg:inline">Log Incident</span>
                </Button>
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="gap-2 justify-center"
                  disabled={isLoading}
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden lg:inline">Log Event</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <HealthEventsTable
                  events={healthEvents}
                  childNameMap={childNameMap}
                  parentNameMap={parentNameMap}
                  isLoading={isLoading}
                  currentPage={currentPage}
                  totalCount={totalCount}
                  hasNextPage={hasNextPage}
                  hasPreviousPage={hasPreviousPage}
                  onEdit={handleEditEvent}
                  onDelete={handleDeleteEvent}
                  onNextPage={handleNextPage}
                  onPreviousPage={handlePreviousPage}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* <TabsContent value="chat">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-0">
              <Chat />
            </CardContent>
          </Card>
        </TabsContent> */}
      </Tabs>

      <AddEditEventModal
        isOpen={showAddModal}
        isEdit={!!editingEvent}
        childrenOptions={children}
        initialData={editingEvent || undefined}
        onClose={() => {
          setShowAddModal(false)
          setEditingEvent(null)
        }}
        onSubmit={handleSubmitEvent}
        form={form}
        setForm={setForm}
      />

      <IncidentLogModal
        isOpen={showIncidentModal}
        onClose={() => setShowIncidentModal(false)}
      />
    </div>
  )
}