// AdminDashboard.tsx
"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/crd"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// Ensure these imports are correct based on your store file locations
import { ChildList } from "@/components/ChildList"
import { useAttendanceStore, useChildStore, useHealthStore, useUserStore } from "@/lib/store"
import { useActivityStore } from "@/lib/store/activityStore"
import "@/styles/admin-dashboard.css"
import { Baby, BarChart3, Clock, Heart, ImageIcon, Megaphone, Users } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { AnnouncementManagement } from "./AnnouncementManagement"
import { GalleryManagement } from "./GalleryManagement"
import { UserManagement } from "./UserManagement"

export function AdminDashboard() {
  const { children } = useChildStore()
  const { users } = useUserStore()
  const { attendance } = useAttendanceStore()
  const { healthEvents, fetchHealthEvents, currentPage: healthPage } = useHealthStore()
  const [activeTab, setActiveTab] = useState("overview")
  const { activities, fetchActivities, fetchActivitiesByUrl, isLoading: activitiesLoading, nextPageUrl: activityNext, previousPageUrl: activityPrev } = useActivityStore()
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split("T")[0])
  const [selectedChild, setSelectedChild] = useState<string>("all")

  // --- SAFEGUARDS ADDED HERE ---
  // Ensure data is an array before filtering/using array methods
  const safeUsers = Array.isArray(users) ? users : [];
  const safeChildren = Array.isArray(children) ? children : [];
  const safeAttendance = Array.isArray(attendance) ? attendance : [];
  const safeHealthEvents = Array.isArray(healthEvents) ? healthEvents : [];
  const safeActivities = Array.isArray(activities) ? activities : [];

  const todayStr = new Date().toISOString().split("T")[0]
  const todayAttendance = safeAttendance.filter((record) => record.date === todayStr)
  const activeUsers = safeUsers.filter((user) => user.is_active_staff)
  // --- END SAFEGUARDS ---

  // Build child name map for quick lookup
  const childNameMap = useMemo(() => {
    return Object.fromEntries(
      safeChildren.map((c: any) => {
        const first = c.first_name || c.firstName || c.name || ""
        const last = c.last_name || c.lastName || ""
        const full = `${first} ${last}`.trim()
        return [c.id?.toString(), full || `Child #${c.id}`]
      }),
    ) as Record<string, string>
  }, [safeChildren])

  const resolveChildName = (rawId: any) => {
    if (rawId == null) return "Unknown"
    const id = String(rawId)
    return childNameMap[id] || childNameMap[parseInt(id).toString()] || `Child #${id}`
  }

  // Fetch activities & health events for selected date & child
  useEffect(() => {
    const childFilter = selectedChild === "all" ? undefined : selectedChild
    fetchActivities("/child-activities/", childFilter, selectedDate).catch(() => {})
    fetchHealthEvents(childFilter, selectedDate).catch(() => {})
  }, [fetchActivities, fetchHealthEvents, selectedDate, selectedChild])

  // Filter activities and health events for chosen date
  const filteredActivities = useMemo(() => {
    return safeActivities.filter((a) => {
      const date = a.date || (a.start_time ? a.start_time.split("T")[0] : "")
      if (date !== selectedDate) return false
      if (selectedChild !== "all") {
        const cid = String(a.childId || (a as any).child || "")
        if (cid !== selectedChild) return false
      }
      return true
    })
  }, [safeActivities, selectedDate, selectedChild])

  const filteredHealthEvents = useMemo(() => {
    return safeHealthEvents.filter((e) => {
      const date = e.date || e.timestamp?.split("T")[0]
      if (date !== selectedDate) return false
      if (selectedChild !== "all") {
        const cid = String(e.childId || (e as any).child || "")
        if (cid !== selectedChild) return false
      }
      return true
    })
  }, [safeHealthEvents, selectedDate, selectedChild])

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "users", label: "User Management", icon: Users },
    { id: "announcements", label: "Announcements", icon: Megaphone },
    { id: "gallery", label: "Gallery", icon: ImageIcon },
    // { id: "system", label: "System", icon: Settings },
    // { id: "chat", label: "Chat", icon: MessageCircle },
    { id: "children", label: "Child Registration", icon: Baby },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {/* <div>
          <h1 className="text-3xl font-bold">Administrator Dashboard</h1>
          <p className="text-gray-600">Complete system management and oversight</p>
        </div> */}
        <Badge variant="secondary" className="px-4 py-2">
          System Administrator
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex w-full space-x-4">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:block">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* <SystemOverview /> */}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="ssgi-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {/* Use safeUsers for length and filter */}
                <div className="text-2xl font-bold">{activeUsers.length}</div>
                <p className="text-xs text-muted-foreground">{safeUsers.filter((u) => !u.is_active_staff).length} inactive</p>
              </CardContent>
            </Card>

            <Card className="ssgi-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Children</CardTitle>
                <Baby className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {/* Use safeChildren for length and filter */}
                <div className="text-2xl font-bold">{safeChildren.length}</div>
                <p className="text-xs text-muted-foreground">
                  {safeChildren.filter((c: any) => c.profileComplete).length} profiles complete
                </p>
              </CardContent>
            </Card>

            <Card className="ssgi-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today&apos;s Attendance</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {/* Use todayAttendance (already filtered safely) and safeChildren for length */}
                <div className="text-2xl font-bold">{todayAttendance.filter((a) => a.status === "present").length}</div>
                <p className="text-xs text-muted-foreground">Out of {safeChildren.length} children</p>
              </CardContent>
            </Card>

            <Card className="ssgi-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Health Events</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {/* Use safeHealthEvents for length */}
                <div className="text-2xl font-bold">{safeHealthEvents.length}</div>
                <p className="text-xs text-muted-foreground">This week</p>
              </CardContent>
            </Card>
          </div>

          {/* Daily Activity & Health Events (Replaces removed cards) */}
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between admin-filters">
              <div>
                <h2 className="admin-section-title">Daily Logs & Health Events</h2>
                <p className="admin-section-sub">Select a date to review all children activity & health events.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <div className="flex items-center gap-2">
                  <label htmlFor="admin-date-filter" className="text-sm font-medium">Date:</label>
                  <input
                    id="admin-date-filter"
                    type="date"
                    className="border rounded-md px-2 py-1 text-sm bg-background"
                    value={selectedDate}
                    max={todayStr}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="admin-child-filter" className="text-sm font-medium">Child:</label>
                  <select
                    id="admin-child-filter"
                    className="border rounded-md px-2 py-1 text-sm bg-background"
                    value={selectedChild}
                    onChange={(e) => setSelectedChild(e.target.value)}
                  >
                    <option value="all">All</option>
                    {safeChildren.map((c: any) => {
                      const first = c.first_name || c.firstName || c.name || ""
                      const last = c.last_name || c.lastName || ""
                      const label = `${first} ${last}`.trim() || `Child #${c.id}`
                      return (
                        <option key={c.id} value={String(c.id)}>
                          {label}
                        </option>
                      )
                    })}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {/* Activity Log Table */}
              <Card className="ssgi-card admin-table-wrapper">
                <CardHeader className="pb-2">
                  <CardTitle className="card-title-sm">Activity Log <span className="table-meta">({filteredActivities.length})</span></CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="overflow-x-auto -mx-2">
                    <table className="admin-table">
                      <thead>
                        <tr className="text-left text-xs text-muted-foreground border-b">
                          <th className="py-2 px-2 font-medium">Time</th>
                          <th className="py-2 px-2 font-medium">Child</th>
                          <th className="py-2 px-2 font-medium">Activity</th>
                          <th className="py-2 px-2 font-medium">Type</th>
                          <th className="py-2 px-2 font-medium">Logged By</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activitiesLoading && (
                          <tr>
                            <td colSpan={5} className="py-4 px-2 text-center text-xs">Loading...</td>
                          </tr>
                        )}
                        {!activitiesLoading && filteredActivities.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-6 px-2 text-center text-xs text-muted-foreground">No activities for this date.</td>
                          </tr>
                        )}
                        {!activitiesLoading && filteredActivities.map((a: any) => {
                          const time = (a.time || a.start_time || "").split("T")[1]?.slice(0,5) || "--:--"
                          const cid = a.childId || (a as any).child || (a.child ? String(a.child) : undefined)
                          const cname = resolveChildName(cid) || a.child_name || a.childName || "Unknown"
                          return (
                            <tr key={a.id} className="border-b last:border-0">
                              <td className="py-1.5 px-2 whitespace-nowrap">{time}</td>
                              <td className="py-1.5 px-2">{cname}</td>
                              <td className="py-1.5 px-2 max-w-[160px] truncate" title={a.activity || a.description}>{a.activity || a.description || "-"}</td>
                              <td className="py-1.5 px-2 capitalize">{a.type || a.activity_type || "other"}</td>
                              <td className="py-1.5 px-2">{a.loggedBy || a.logged_by_name || a.logged_by || ""}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                    <div className="flex justify-between items-center mt-2 px-2 admin-pagination">
                      <button
                        disabled={!activityPrev}
                        onClick={() => activityPrev && fetchActivitiesByUrl(activityPrev)}
                        className="text-xs px-2 py-1 border rounded disabled:opacity-40"
                      >Prev</button>
                      <span className="text-xs text-muted-foreground">{filteredActivities.length} shown</span>
                      <button
                        disabled={!activityNext}
                        onClick={() => activityNext && fetchActivitiesByUrl(activityNext)}
                        className="text-xs px-2 py-1 border rounded disabled:opacity-40"
                      >Next</button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Health Events Table */}
              <Card className="ssgi-card admin-table-wrapper">
                <CardHeader className="pb-2">
                  <CardTitle className="card-title-sm">Health Events <span className="table-meta">({filteredHealthEvents.length})</span></CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="overflow-x-auto -mx-2">
                    <table className="admin-table">
                      <thead>
                        <tr className="text-left text-xs text-muted-foreground border-b">
                          <th className="py-2 px-2 font-medium">Time</th>
                          <th className="py-2 px-2 font-medium">Child</th>
                          <th className="py-2 px-2 font-medium">Event</th>
                          <th className="py-2 px-2 font-medium">Type</th>
                          <th className="py-2 px-2 font-medium">Recorded By</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredHealthEvents.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-6 px-2 text-center text-xs text-muted-foreground">No health events for this date.</td>
                          </tr>
                        )}
                        {filteredHealthEvents.map((e: any) => {
                          const time = (e.time || e.timestamp || "").split("T")[1]?.slice(0,5) || "--:--"
                          const cid = e.childId || (e as any).child || (e.child ? String(e.child) : undefined)
                          const cname = resolveChildName(cid) || e.child_name || e.childName || "Unknown"
                          return (
                            <tr key={e.id} className="border-b last:border-0">
                              <td className="py-1.5 px-2 whitespace-nowrap">{time}</td>
                              <td className="py-1.5 px-2">{cname}</td>
                              <td className="py-1.5 px-2 max-w-[160px] truncate" title={e.event || e.description}>{e.event || e.description || "-"}</td>
                              <td className="py-1.5 px-2 capitalize">{e.type || e.event_type || "other"}</td>
                              <td className="py-1.5 px-2">{e.loggedBy || e.recorded_by_name || e.loggedBy || ""}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                    <div className="flex justify-between items-center mt-2 px-2 admin-pagination">
                      {/* Pagination for health events removed due to missing nextPage/previousPage in HealthState */}
                      <button
                        disabled={healthPage <= 1}
                        onClick={() => fetchHealthEvents(selectedChild === "all" ? undefined : selectedChild, selectedDate, Math.max(1, healthPage - 1))}
                        className="text-xs px-2 py-1 border rounded disabled:opacity-40"
                      >Prev</button>
                      <span className="text-xs text-muted-foreground">{filteredHealthEvents.length} shown (page {healthPage})</span>
                      <button
                        onClick={() => fetchHealthEvents(selectedChild === "all" ? undefined : selectedChild, selectedDate, healthPage + 1)}
                        className="text-xs px-2 py-1 border rounded disabled:opacity-40"
                      >Next</button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="announcements">
          <AnnouncementManagement />
        </TabsContent>

        <TabsContent value="gallery">
          <GalleryManagement />
        </TabsContent>

        {/* <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure system-wide settings and preferences.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">System settings will be available here.</p>
            </CardContent>
          </Card>
        </TabsContent> */}

        {/* <TabsContent value="chat">
     
          <Chat userId={activeUsers[0]?.id?.toString() || ""} />
        </TabsContent> */}
        <TabsContent value="children">
          <ChildList/>
        </TabsContent>
      </Tabs>
    </div>
  )
}