"use client"

import { MyChildrenTable } from "@/components/MyChildrenTable"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/crd"
// import { Chat } from "@/components/ui/Chat"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useActivityStore, useAuthStore, useChildStore, useHealthStore } from "@/lib/store"
// 4. Stethoscope icon is now imported
import { Baby, BarChart3, FileText, Heart, Stethoscope } from "lucide-react"
import { useEffect, useState } from "react"
import { ChildProfile } from "./ChildProfile"
import { DailyReports } from "./DailyReports"

export function ParentDashboard() {
  const { user } = useAuthStore()
  const { children, fetchChildren } = useChildStore()
  const { activities, fetchActivities } = useActivityStore()
  const { healthEvents, fetchHealthEvents } = useHealthStore()
  const [activeTab, setActiveTab] = useState("overview")

  // Fetch data when component mounts
  useEffect(() => {
    if (user) {
      fetchChildren()
      fetchActivities()
      fetchHealthEvents()
    }
  }, [user, fetchChildren, fetchActivities, fetchHealthEvents])

  // Filter data for current user's children
  const myChildren = children.filter((child) => child.parents?.some((p) => p.id === user?.id))
  const myChildIds = myChildren.map((child) => child.id.toString())

  const today = new Date().toISOString().split("T")[0]

  // 1. CORRECTED: Filter logic for today's activities
  const todayActivities = activities.filter((activity) => {
    // Check the start_time field and extract the date part
    const activityDate = activity.start_time ? activity.start_time.split("T")[0] : null
    return myChildIds.includes(activity.childId?.toString() || "") && activityDate === today
  })

  // 2. CORRECTED: Filter logic for today's health events
  const todayHealthEvents = healthEvents.filter((event) => {
    // Check the time field and extract the date part
    const eventDate = event.time ? event.time.split("T")[0] : null
    return myChildIds.includes(event.childId?.toString() || "") && eventDate === today
  })

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "profile", label: "Child Profile", icon: Baby },
    { id: "reports", label: "Daily Reports", icon: FileText },
    // { id: "chat", label: "Chat", icon: MessageCircle },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
       
        <Badge variant="secondary" className="px-4 py-2">
          Parent Portal
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid-rows-3 w-full space-x-4">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
              <tab.icon className="h-4 w-4" />
              <span className=" sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="ssgi-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Children</CardTitle>
                <Baby className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{myChildren.length}</div>
                <p className="text-xs text-muted-foreground">Enrolled children</p>
              </CardContent>
            </Card>

            <Card className="ssgi-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Activities</CardTitle>
                <Heart className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayActivities.length}</div>
                <p className="text-xs text-muted-foreground">Logged today</p>
              </CardContent>
            </Card>
            
            {/* 3. NEW: Card for Today's Health Logs */}
            <Card className="ssgi-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Health Logs</CardTitle>
                <Stethoscope className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayHealthEvents.length}</div>
                <p className="text-xs text-muted-foreground">Logged today</p>
              </CardContent>
            </Card>
          </div>

          <MyChildrenTable children={myChildren} />

          {myChildren.length === 0 && (
            <Card className="ssgi-card">
              <CardContent className="text-center py-12">
                <Baby className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No children registered</p>
                <p className="text-sm text-gray-400">Contact the receptionist to register your child</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="profile">
          <ChildProfile />
        </TabsContent>

        <TabsContent value="reports">
          <DailyReports />
        </TabsContent>

        {/* <TabsContent value="chat">
          <Chat />
        </TabsContent> */}
      </Tabs>
    </div>
  )
}