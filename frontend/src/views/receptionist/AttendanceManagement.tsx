
  // Date helpers (must be after selectedDate is defined)



import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/crd"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { attendanceAPI } from "@/lib/api/index"
import { useAttendanceStore, useChildStore } from "@/lib/store"
import { AlertCircle, CheckCircle, Clock, LogIn, LogOut, XCircle } from "lucide-react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export function AttendanceManagement() {
  const [selectedChild, setSelectedChild] = useState("")
  const [notes, setNotes] = useState("") // State for the check-in note
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const { children, fetchChildren } = useChildStore()
  const { attendance, fetchAttendance, addAttendance, updateAttendance, isLoading, error } = useAttendanceStore()
  const todayStr = new Date().toISOString().split("T")[0]
  const isFuture = selectedDate > todayStr
  const isToday = selectedDate === todayStr
  useEffect(() => {
    fetchChildren()
  }, [fetchChildren])

  useEffect(() => {
    // Always clear attendance before fetching new data for a date
    if (typeof useAttendanceStore.getState().setAttendance === 'function') {
      useAttendanceStore.getState().setAttendance([])
    }
    fetchAttendance(selectedDate)
  }, [selectedDate, fetchAttendance])

  const handleCheckIn = async () => {
    if (!selectedChild) return
    try {
      // Pass the notes from the state to the API call
      const record = await attendanceAPI.checkIn(selectedChild, notes)
      addAttendance(record)
      setSelectedChild("")
      setNotes("") // Clear the notes field after successful check-in
      toast.success("Child checked in successfully.")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to check in child"
      toast.error(message)
    }
  }

  const handleCheckOut = async (attendanceId: string, childId: number | string) => {
    try {
      const updatedRecord = await attendanceAPI.checkOut(attendanceId, childId)
      updateAttendance(attendanceId, updatedRecord)
      toast.success("Child checked out successfully.")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to check out child"
      toast.error(message)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "absent":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "late":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const availableChildren = children.filter(
    (child) => !attendance.some((att) => att.childId === child.id.toString() && !att.checkOut)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Attendance Management</h2>
          <p className="text-gray-600">Check children in and out daily</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isFuture && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            You cannot check in or out for a future date. Please select today or a past date to view records.
          </AlertDescription>
        </Alert>
      )}

      <Card className="ssgi-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <LogIn className="h-5 w-5" />
            <span>Quick Check-In</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedChild} onValueChange={setSelectedChild}>
            <SelectTrigger>
              <SelectValue placeholder="Select child to check in" />
            </SelectTrigger>
            <SelectContent>
              {availableChildren.map((child) => (
                <SelectItem key={child.id} value={child.id.toString()}>
                  {child.first_name} {child.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="text"
            placeholder="Add a note (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <Button onClick={handleCheckIn} disabled={!selectedChild || isLoading || isFuture} className="ssgi-gradient text-white w-full">
            <LogIn className="h-4 w-4 mr-2" />
            Check In
          </Button>
        </CardContent>
      </Card>

      <Card className="ssgi-card">
        <CardHeader>
          <CardTitle>View Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-48"
            />
            <Badge variant="outline">
              {attendance.length} records for {new Date(selectedDate).toLocaleDateString()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="ssgi-card">
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p>Loading attendance...</p>
            </div>
          ) : attendance.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No attendance records for this date</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Only render records if not loading and attendance is for the selected date */}
              {attendance.map((record) => {
                const child = children.find((c) => c.id.toString() === record.childId)
                return (
                  <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(record.status)}
                      <div>
                        <h4 className="font-medium">{child ? `${child.first_name} ${child.last_name}` : "Unknown Child"}</h4>
                        {/* Display the note if it exists */}
                        {record.notes && <p className="text-sm text-gray-500 italic">Note: {record.notes}</p>}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm">
                          <span className="font-medium">In:</span>{" "}
                          {record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : "N/A"}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Out:</span>{" "}
                          {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : "Not checked out"}
                        </p>
                        {record.checkedInBy && <p className="text-xs text-gray-500">By: {record.checkedInBy}</p>}
                      </div>

                      <Badge variant={!record.checkOut ? "default" : "secondary"}>
                        {!record.checkOut ? "Present" : "Checked Out"}
                      </Badge>

                      {!record.checkOut && child && isToday && !isFuture && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCheckOut(record.id, child.id)}
                          disabled={isLoading}
                        >
                          <LogOut className="h-4 w-4 mr-1" />
                          Check Out
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}