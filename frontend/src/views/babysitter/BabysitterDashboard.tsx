"use client"

import { ActivityFormModal } from "@/components/ActivityFormModal";
import { DailyAttendanceTable } from "@/components/DailyAttendanceTable";
import { IncidentLogModal } from "@/components/IncidentLogModal"; // 1. Import the new modal
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/crd";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useActivityStore,
  useAttendanceStore,
  useAuthStore,
  useChildStore,
} from "@/lib/store";
import type { ActivityLog } from "@/lib/types";
import {
  AlertTriangle, // Import icon for the new button
  Baby,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Heart,
  ImageIcon,

  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

export function BabysitterDashboard() {
  const { user } = useAuthStore()
  const { children, fetchChildren } = useChildStore()
  const {
    activities,
    isLoading: isActivitiesLoading,
    count,
    nextPageUrl,
    previousPageUrl,
    fetchActivities,
    deleteActivity,
    logActivity,
    updateActivity,
  } = useActivityStore()
  const { fetchAttendance } = useAttendanceStore()

  const [activeTab, setActiveTab] = useState("overview")
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [showIncidentModal, setShowIncidentModal] = useState(false) // 2. State for the new modal
  const [editingActivity, setEditingActivity] = useState<ActivityLog | null>(
    null
  )
  const [filterDate, setFilterDate] = useState(
    new Date().toISOString().split("T")[0]
  )

  // Fetch base data (children) when user is available
  useEffect(() => {
    if (user?.id) fetchChildren({ is_active: "true" })
  }, [user?.id, fetchChildren])

  // Fetch activities and attendance whenever the date filter changes
  useEffect(() => {
    if (filterDate) {
      fetchActivities("/child-activities/", undefined, filterDate)
      fetchAttendance(filterDate)
    }
  }, [filterDate, fetchActivities, fetchAttendance])

  // Memoized list of children assigned to this babysitter
  const myChildren = useMemo(
    () =>
      children.filter((child: any) => {
        const assignedId =
          typeof child.assigned_babysitter === "number"
            ? child.assigned_babysitter
            : child.assigned_babysitter?.id
        return assignedId === Number(user?.id)
      }),
    [children, user?.id]
  )

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "activities", label: "Activities", icon: Heart },
    // { id: "chat", label: "Chat", icon: MessageCircle },
  ]

  const handleAddActivitySubmit = async (
    formData: any,
    photoFile?: File | null
  ) => {
    if (!formData.childId) {
      toast.error("Please select a child.")
      return
    }
    
    // Create payload with the correct field names expected by the backend
    const payload = {
      child: formData.childId,
      activity_type: formData.type,
      description: formData.description,
      start_time: `${formData.date}T${formData.time}:00Z`,
      notes: formData.notes || "",
      // logged_by is auto-assigned on the backend
    }
    
    try {
      // The payload doesn't match ActivityLog type exactly, but this is the format the API expects
      await logActivity(payload as any, photoFile || null, filterDate)
      toast.success("Activity logged successfully!")
      setShowActivityModal(false)
      setEditingActivity(null)
    } catch (error) {
      console.error("Error logging activity:", error)
      toast.error("Failed to log activity. Please check all required fields.")
    }
  }

  const handleUpdateActivitySubmit = async (
    formData: any,
    photoFile?: File | null
  ) => {
    if (!editingActivity?.id) return
    
    // Create payload with the correct field names expected by the backend
    const payload = {
      child: formData.childId,
      activity_type: formData.type,
      description: formData.description,
      start_time: `${formData.date}T${formData.time}:00Z`,
      notes: formData.notes || "",
      // logged_by is auto-assigned on the backend
    }
    
    try {
      // The payload doesn't match ActivityLog type exactly, but this is the format the API expects
      await updateActivity(
        editingActivity.id.toString(),
        payload as any,
        photoFile || null
      )
      toast.success("Activity updated successfully!")
      setShowActivityModal(false)
      setEditingActivity(null)
    } catch (error) {
      console.error("Error updating activity:", error)
      toast.error("Failed to update activity. Please check all required fields.")
    }
  }

  const handleDeleteActivity = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this activity?")) {
      await deleteActivity(id)
    }
  }

  const handleEditClick = (activity: ActivityLog) => {
    setEditingActivity(activity)
    setShowActivityModal(true)
  }

  const handlePageChange = (url: string | null) => {
    if (url) {
      const urlObject = new URL(url)
      fetchActivities(
        urlObject.pathname + urlObject.search,
        undefined,
        filterDate
      )
    }
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        
        <Badge variant="secondary" className="px-4 py-2 text-sm">
          Babysitter Role
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex w-full justify-center gap-4">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-2"
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  My Assigned Children
                </CardTitle>
                <Baby className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{myChildren.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Activities Logged Today
                </CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-xs text-muted-foreground">for {filterDate}</p>
              </CardContent>
            </Card>
          </div>
          <DailyAttendanceTable />
        </TabsContent>

        <TabsContent value="activities" className="mt-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <CardTitle>Activity Log</CardTitle>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full sm:w-[180px]"
                />
                {/* 3. Button to log a new incident */}
                <Button
                  variant="outline"
                  onClick={() => setShowIncidentModal(true)}
                  className="w-full md:w-auto flex items-center justify-center gap-2"
                  disabled={myChildren.length === 0}
                  title={
                    myChildren.length === 0
                      ? "You have no assigned children"
                      : "Log a new incident"
                  }
                >
                  <AlertTriangle className="w-5 h-5" />
                  <span className=" md:inline">Log Incident</span>
                </Button>
                <Button
                  onClick={() => {
                    setEditingActivity(null)
                    setShowActivityModal(true)
                  }}
                  className="w-full md:w-auto flex items-center justify-center gap-2"
                  disabled={myChildren.length === 0}
                  title={
                    myChildren.length === 0
                      ? "You have no assigned children"
                      : "Log a new activity"
                  }
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden md:inline">Log Activity</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Photo</TableHead>
                    <TableHead>Child</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isActivitiesLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">
                        Loading activities...
                      </TableCell>
                    </TableRow>
                  ) : activities.length > 0 ? (
                    activities.map((activity) => {
                      const child = children.find(
                        (c) => c.id.toString() === activity.childId?.toString()
                      )
                      return (
                        <TableRow key={activity.id}>
                          <TableCell>
                            {activity.photos ? (
                              <a
                                href={activity.photos}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  src={activity.photos}
                                  alt="Activity"
                                  className="h-12 w-12 rounded-md object-cover"
                                />
                              </a>
                            ) : (
                              <div className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center text-gray-400">
                                <ImageIcon className="h-6 w-6" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {child
                              ? `${child.first_name} ${child.last_name}`
                              : `Child ID: ${activity.childId}`}
                          </TableCell>
                          <TableCell>
                            {activity.start_time
                              ? new Date(
                                  activity.start_time
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "N/A"}
                          </TableCell>
                          <TableCell className="capitalize">
                            {activity.activity_type}
                          </TableCell>
                          <TableCell>{activity.description}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditClick(activity)}
                              >
                                <Pencil className="w-4 h-4 text-yellow-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleDeleteActivity(activity.id.toString())
                                }
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">
                        No activities found for {filterDate}.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="flex items-center justify-end space-x-2 py-4">
                <span className="text-sm text-muted-foreground">
                  Total: {count}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(previousPageUrl)}
                  disabled={!previousPageUrl || isActivitiesLoading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(nextPageUrl)}
                  disabled={!nextPageUrl || isActivitiesLoading}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
{/* 
        <TabsContent value="chat" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <Chat userId={user?.id || ""} />
            </CardContent>
          </Card>
        </TabsContent> */}
      </Tabs>

      {/* Activity Modal */}
      <ActivityFormModal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        onSubmit={
          editingActivity ? handleUpdateActivitySubmit : handleAddActivitySubmit
        }
        initialData={editingActivity}
      />

      {/* 4. Incident Modal */}
      <IncidentLogModal
        isOpen={showIncidentModal}
        onClose={() => setShowIncidentModal(false)}
      />
    </div>
  )
}

export default BabysitterDashboard
