"use client"

import { ChildManager } from "@/components/ChildManager"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/crd"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    useActivityStore,
    useAnnouncementStore,
    useAttendanceStore,
    useAuthStore,
    useChildStore,
} from "@/lib/store"
import { Activity, Baby, Clock, Heart, LogOut, Megaphone, Settings } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { ActivityLogger } from "./ActivityLogger"
import { AnnouncementManager } from "./AnnouncementManager"
import { AttendanceManager } from "./AttendanceManager"

export function Dashboard() {
  const { user, logout } = useAuthStore()
  const { children } = useChildStore()
  const { attendance } = useAttendanceStore()
  const { activities } = useActivityStore()
  const { announcements } = useAnnouncementStore()
  const [activeTab, setActiveTab] = useState("overview")

  const handleLogout = () => {
    logout()
  }

  const todayAttendance = attendance.filter((record) => record.date === new Date().toISOString().split("T")[0])

  const todayActivities = activities.filter((activity) => activity.date === new Date().toISOString().split("T")[0])

  const getTabsForRole = () => {
    const baseTabs = [{ id: "overview", label: "Overview", icon: Activity }]

    switch (user?.role) {
      case "admin":
        return [
          ...baseTabs,
          { id: "children", label: "Children", icon: Baby },
          { id: "attendance", label: "Attendance", icon: Clock },
          { id: "activities", label: "Activities", icon: Heart },
          { id: "announcements", label: "Announcements", icon: Megaphone },
        ]
      case "receptionist":
        return [
          ...baseTabs,
          { id: "attendance", label: "Attendance", icon: Clock },
          { id: "children", label: "Children", icon: Baby },
        ]
      case "babysitter":
        return [
          ...baseTabs,
          { id: "activities", label: "Activities", icon: Heart },
          { id: "attendance", label: "Attendance", icon: Clock },
        ]
      case "nurse":
        return [...baseTabs, { id: "activities", label: "Health Logs", icon: Heart }]
      case "parent":
        return [...baseTabs, { id: "activities", label: "My Child", icon: Heart }]
      default:
        return baseTabs
    }
  }

  const tabs = getTabsForRole()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image src="/images/ssgi-logo.png" alt="SSGI Logo" width={120} height={60} className="h-12 w-auto" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SSGI Daycare Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : ""}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="px-3 py-1">
                {user && user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ""}
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 mb-8">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="ssgi-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Children</CardTitle>
                  <Baby className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{children.length}</div>
                  <p className="text-xs text-muted-foreground">Enrolled in daycare</p>
                </CardContent>
              </Card>

              <Card className="ssgi-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {todayAttendance.filter((a) => a.status === "present").length}
                  </div>
                  <p className="text-xs text-muted-foreground">Out of {children.length} children</p>
                </CardContent>
              </Card>

              <Card className="ssgi-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Activities Today</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{todayActivities.length}</div>
                  <p className="text-xs text-muted-foreground">Logged activities</p>
                </CardContent>
              </Card>

              <Card className="ssgi-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Announcements</CardTitle>
                  <Megaphone className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{announcements.length}</div>
                  <p className="text-xs text-muted-foreground">Active announcements</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="ssgi-card">
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {todayActivities.slice(0, 5).map((activity) => {
                      const child = children.find((c) => String(c.id) === String(activity.childId))
                      return (
                        <div key={activity.id} className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{child ? `${child.first_name || ""} ${child.last_name || ""}`.trim() : ""}</p>
                            <p className="text-xs text-gray-600">{activity.activity}</p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {activity.type}
                          </Badge>
                        </div>
                      )
                    })}
                    {todayActivities.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No activities logged today</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="ssgi-card">
                <CardHeader>
                  <CardTitle>Today's Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {todayAttendance.map((record) => {
                      const child = children.find((c) => String(c.id) === String(record.childId))
                      return (
                        <div key={record.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{child ? `${child.first_name || ""} ${child.last_name || ""}`.trim() : ""}</p>
                            <p className="text-xs text-gray-600">Check-in: {record.checkIn || "Not checked in"}</p>
                          </div>
                          <Badge variant={record.status === "present" ? "default" : "secondary"}>{record.status}</Badge>
                        </div>
                      )
                    })}
                    {todayAttendance.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No attendance records today</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {tabs.find((t) => t.id === "children") && (
            <TabsContent value="children">
              <ChildManager />
            </TabsContent>
          )}

          {tabs.find((t) => t.id === "attendance") && (
            <TabsContent value="attendance">
              <AttendanceManager />
            </TabsContent>
          )}

          {tabs.find((t) => t.id === "activities") && (
            <TabsContent value="activities">
              <ActivityLogger />
            </TabsContent>
          )}

          {tabs.find((t) => t.id === "announcements") && (
            <TabsContent value="announcements">
              <AnnouncementManager />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  )
}
