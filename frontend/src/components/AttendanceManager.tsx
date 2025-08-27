"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/crd"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { attendanceAPI } from "@/lib/api/index"
import { useAttendanceStore, useChildStore, useUIStore } from "@/lib/store"
import { attendanceSchema } from "@/lib/validationSchemas"
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from "formik"
import { AlertCircle, CheckCircle, Clock, Plus, XCircle } from "lucide-react"
import { useState } from "react"

interface AttendanceFormValues {
  childId: string
  date: string
  checkIn: string
  checkOut: string
  status: "present" | "absent" | "late"
}

export function AttendanceManager() {
  const [showForm, setShowForm] = useState(false)
  const { children } = useChildStore()
  const { attendance, addAttendance, updateAttendance } = useAttendanceStore()
  const { setLoading, setError, error } = useUIStore()

  const today = new Date().toISOString().split("T")[0]
  const [selectedDate, setSelectedDate] = useState(today)

  const filteredAttendance = attendance.filter((record) => record.date === selectedDate)

  const handleSubmit = async (values: AttendanceFormValues, { resetForm }: FormikHelpers<AttendanceFormValues>) => {
    try {
      setLoading(true)
      setError(null)

      const newRecord = await attendanceAPI.createAttendance(values)
      addAttendance(newRecord)
      resetForm()
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create attendance record")
    } finally {
      setLoading(false)
    }
  }

  const handleCheckOut = async (recordId: string) => {
    try {
      setLoading(true)
      const currentTime = new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      })

      await attendanceAPI.updateAttendance(recordId, {
        checkOut: currentTime,
      })
      updateAttendance(recordId, { checkOut: currentTime })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update attendance")
    } finally {
      setLoading(false)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Attendance Management</h2>
          <p className="text-gray-600">Track daily attendance for all children</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="ssgi-gradient text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Attendance
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Date Filter */}
      <Card className="ssgi-card">
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
        </CardHeader>
        <CardContent>
          <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-48" />
        </CardContent>
      </Card>

      {/* Attendance Form */}
      {showForm && (
        <Card className="ssgi-card">
          <CardHeader>
            <CardTitle>Add Attendance Record</CardTitle>
          </CardHeader>
          <CardContent>
            <Formik<AttendanceFormValues>
              initialValues={{
                childId: "",
                date: selectedDate,
                checkIn: "",
                checkOut: "",
                status: "present",
              }}
              validationSchema={attendanceSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, setFieldValue }) => (
                <Form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="childId">Child</Label>
                      <Select onValueChange={(value) => setFieldValue("childId", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a child" />
                        </SelectTrigger>
                        <SelectContent>
                          {children.map((child) => {
                            // Calculate age from date_of_birth if not present
                            let age = '';
                            if (child.date_of_birth) {
                              const today = new Date();
                              const dob = new Date(child.date_of_birth);
                              let years = today.getFullYear() - dob.getFullYear();
                              const m = today.getMonth() - dob.getMonth();
                              if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                                years--;
                              }
                              age = years.toString();
                            }
                            return (
                              <SelectItem key={child.id} value={String(child.id)}>
                                {child.first_name} {child.last_name} (Age {age})
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <ErrorMessage name="childId" component="div" className="text-red-500 text-sm" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Field as={Input} id="date" name="date" type="date" />
                      <ErrorMessage name="date" component="div" className="text-red-500 text-sm" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="checkIn">Check In Time</Label>
                      <Field as={Input} id="checkIn" name="checkIn" type="time" placeholder="HH:MM" />
                      <ErrorMessage name="checkIn" component="div" className="text-red-500 text-sm" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select onValueChange={(value) => setFieldValue("status", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">Present</SelectItem>
                          <SelectItem value="absent">Absent</SelectItem>
                          <SelectItem value="late">Late</SelectItem>
                        </SelectContent>
                      </Select>
                      <ErrorMessage name="status" component="div" className="text-red-500 text-sm" />
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button type="submit" disabled={isSubmitting} className="ssgi-gradient text-white">
                      {isSubmitting ? "Adding..." : "Add Record"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>
      )}

      {/* Attendance Records */}
      <Card className="ssgi-card">
        <CardHeader>
          <CardTitle>Attendance Records - {new Date(selectedDate).toLocaleDateString()}</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAttendance.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No attendance records for this date</p>
          ) : (
            <div className="space-y-4">
              {filteredAttendance.map((record) => {
                const child = children.find((c) => String(c.id) === String(record.childId))
                return (
                  <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(record.status)}
                      <div>
                        <h4 className="font-medium">{child?.first_name}</h4>
                        {/* Calculate age from date_of_birth if available */}
                        {child?.date_of_birth && (
                          <p className="text-sm text-gray-600">
                            Age {(() => {
                              const today = new Date();
                              const dob = new Date(child.date_of_birth);
                              let years = today.getFullYear() - dob.getFullYear();
                              const m = today.getMonth() - dob.getMonth();
                              if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                                years--;
                              }
                              return years;
                            })()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm">
                          <span className="font-medium">In:</span> {record.checkIn || "Not checked in"}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Out:</span> {record.checkOut || "Not checked out"}
                        </p>
                      </div>

                      <Badge variant={record.status === "present" ? "default" : "secondary"}>{record.status}</Badge>

                      {record.status === "present" && !record.checkOut && (
                        <Button size="sm" variant="outline" onClick={() => handleCheckOut(record.id)}>
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
