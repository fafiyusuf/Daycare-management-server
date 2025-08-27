"use client"

import { ReceptionistAuthGuard } from "@/components/auth/ReceptionistAuthGuard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/crd"
// import { Chat } from "@/components/ui/Chat"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { attendanceAPI } from "@/lib/api/index"
import { useAttendanceStore, useChildStore, useUIStore, useUserStore } from "@/lib/store"
import { Baby, BarChart3, Clock } from "lucide-react"
import { useEffect, useState } from "react"
import { AttendanceManagement } from "./AttendanceManagement"

export function ReceptionistDashboard() {
  const { children } = useChildStore()
  const { attendance, setAttendance, updateAttendance } = useAttendanceStore()
  const { users } = useUserStore()
  const { setError } = useUIStore();
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (children.length === 0) {
      // Fetch children if not loaded
      // childAPI.getChildren() will update the store automatically
      // so no need to call setChildren
      // Optionally, you can call fetchChildren() if available
    }
    // Only fetch today's attendance if on overview tab and attendance is empty
    if (activeTab === "overview" && (!attendance || attendance.length === 0)) {
      const today = new Date().toISOString().split("T")[0]
      attendanceAPI.getAttendance(today).then(records => {
        setAttendance(Array.isArray(records) ? records : [])
      }).catch(err => {
        console.error("Failed to fetch attendance:", err);
        setError("Could not load attendance records.");
      });
    }
  }, [children.length, attendance, setAttendance, setError, activeTab])

  const today = new Date().toISOString().split("T")[0]
  const todayAttendance = attendance.filter(
    (record) => record.checkIn && record.checkIn.startsWith(today)
  )
  const presentToday = todayAttendance.filter((a) => a.checkIn && !a.checkOut)
  const parents = users.filter((u) => u.role === "parent")

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "attendance", label: "Attendance", icon: Clock },
    // { id: "chat", label: "Chat", icon: MessageCircle },
  ]

  const handleCheckOut = async (attendanceId: string, childId: number | string) => {
    try {
      const updatedRecord = await attendanceAPI.checkOut(attendanceId, childId)
      updateAttendance(attendanceId, updatedRecord)
      alert("Child checked out successfully!")
    } catch (error) {
      console.error("Error checking out child:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to check out child."
      setError(errorMessage);
      alert(errorMessage)
    }
  }

  return (
    <ReceptionistAuthGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">

          <Badge variant="secondary" className="px-4 py-2">
            Receptionist
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex w-full space-x-4">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="ssgi-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                  <Clock className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{presentToday.length}</div>
                  <p className="text-xs text-muted-foreground">Out of {children.length} children</p>
                </CardContent>
              </Card>



              <Card className="ssgi-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Children</CardTitle>
                  <Baby className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{children.length}</div>
                  <p className="text-xs text-muted-foreground">Enrolled children</p>
                </CardContent>
              </Card>
            </div>

            <Card className="ssgi-card">
              <CardHeader>
                <CardTitle>Today's Attendance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {presentToday.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No children currently checked in</p>
                  ) : (
                    presentToday.map((record) => {
                      const child = children.find((c) => c.id.toString() === record.childId)
                      return (
                        <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{child ? `${child.first_name} ${child.last_name}` : "Unknown Child"}</p>
                            <p className="text-sm text-gray-600">
                              Check-in: {record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : "N/A"}
                            </p>
                          </div>
                          {/* This condition will now pass, making the button visible */}
                          {!record.checkOut && child && (
                            <Button size="sm" variant="outline" onClick={() => handleCheckOut(record.id, child.id)}>
                              Check Out
                            </Button>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <AttendanceManagement />
          </TabsContent>

          {/* <TabsContent value="chat">
            <Chat userId="receptionist" />
          </TabsContent> */}
        </Tabs>
      </div>
    </ReceptionistAuthGuard>
  )
}