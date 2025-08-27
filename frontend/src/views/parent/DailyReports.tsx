"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/crd"
import { Input } from "@/components/ui/input"
import { childAPI } from "@/lib/api/child"
import { useActivityStore, useAuthStore, useChildStore, useHealthStore, useUIStore } from "@/lib/store"
import type { DailyReport } from "@/lib/types"
import { AlertTriangle, Calendar, Coffee, FileText, Heart, Moon, Play, Stethoscope } from "lucide-react"
import { useEffect, useState } from "react"

export function DailyReports() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedChild, setSelectedChild] = useState("")
  const [reports, setReports] = useState<DailyReport[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuthStore()
  const { children, fetchChildren } = useChildStore()
  const { activities, fetchActivities } = useActivityStore()
  const { healthEvents, fetchHealthEvents } = useHealthStore();
  const { setError, error } = useUIStore()

  // Fetch data when component mounts
  useEffect(() => {
    if (user) {
      fetchChildren();
      fetchActivities();
    }
  }, [user, fetchChildren, fetchActivities]);

  const myChildren = children.filter((child) => child.parents?.some((p) => p.id === user?.id));

  useEffect(() => {
    if (myChildren.length > 0 && !selectedChild) {
      setSelectedChild(myChildren[0].id.toString())
    }
  }, [myChildren, selectedChild])

  const loadDailyReport = async () => {
    if (!selectedChild) return;
    try {
      setLoading(true);
      const report = await childAPI.getDailyReport(selectedChild, selectedDate);
      setReports([report]);
    } catch (err) {
      // Fallback: synthesize from local data
      const child = myChildren.find((c) => c.id.toString() === selectedChild);
      const childActivities = activities.filter((a) => a.childId === selectedChild && a.date === selectedDate);
      const childHealthEvents = healthEvents.filter((e) => e.childId === selectedChild && e.date === selectedDate);
      if (child) {
        const mockReport = {
          id: `mock-${selectedChild}-${selectedDate}`,
          childId: selectedChild,
          date: selectedDate,
          activities: childActivities,
          healthEvents: childHealthEvents,
          attendance: {
            id: `mock-attendance-${selectedChild}-${selectedDate}`,
            childId: selectedChild,
            date: selectedDate,
            status: 'absent' as const,
            checkIn: undefined,
            checkOut: undefined,
            checkedInBy: undefined,
            checkedOutBy: undefined,
          },
          summary:
            childActivities.length > 0
              ? `${child.first_name} ${child.last_name} had ${childActivities.length} activities logged today.`
              : `No activities recorded for ${child.first_name} ${child.last_name} on this date.`,
        };
        setReports([mockReport]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChild && selectedDate) {
      loadDailyReport()
    }
  }, [selectedChild, selectedDate])

  // Fetch store-backed health events when selection changes
  useEffect(() => {
    if (selectedChild && selectedDate) {
      fetchHealthEvents(selectedChild, selectedDate);
    }
  }, [selectedChild, selectedDate, fetchHealthEvents]);

  // NEW: Fetch activities with filters whenever selection changes
  useEffect(() => {
    if (selectedChild && selectedDate) {
      fetchActivities(undefined, selectedChild, selectedDate);
    }
  }, [selectedChild, selectedDate, fetchActivities]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "meal":
        return <Coffee className="h-4 w-4 text-orange-500" />
      case "nap":
        return <Moon className="h-4 w-4 text-blue-500" />
      case "play":
        return <Play className="h-4 w-4 text-green-500" />
      default:
        return <Heart className="h-4 w-4 text-gray-500" />
    }
  }

  const getHealthIcon = (type: string) => {
    switch (type) {
      case "medication":
        return <Stethoscope className="h-4 w-4 text-red-500" />
      case "checkup":
        return <Heart className="h-4 w-4 text-blue-500" />
      case "incident":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Stethoscope className="h-4 w-4 text-gray-500" />
    }
  }

  const isProfileComplete = (child: any) => {
    return child.first_name && child.last_name && child.date_of_birth && child.emergency_contact &&
           child.profile_picture && child.birth_certificate && child.vaccination_card;
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Daily Reports</h2>
          <p className="text-gray-600 text-sm sm:text-base">
            View detailed daily activities and health reports for your child
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card className="ssgi-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span className="text-base sm:text-lg">Select Report</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium">Child</label>
              <select
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
                className="w-full p-2 border rounded-md text-xs sm:text-sm"
              >
                {myChildren.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.first_name} {child.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium">Date</label>
              <Input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)} 
                className="text-xs sm:text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Report */}
      {loading ? (
        <Card className="ssgi-card">
          <CardContent className="text-center py-8">
            <div className="animate-pulse">Loading daily report...</div>
          </CardContent>
        </Card>
      ) : reports.length === 0 ? (
        <Card className="ssgi-card">
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No report available</p>
            <p className="text-sm text-gray-400">Select a child and date to view the daily report</p>
          </CardContent>
        </Card>
      ) : (
        reports.map((report, reportIdx) => {
          const child = myChildren.find((c) => c.id.toString() === report.childId);
          const childName = child ? `${child.first_name} ${child.last_name}` : '';
          // Avoid shadowing store activities; build a derived list
          const reportActivities = report.activities || [];
          const filteredActivities = activities.filter((a) => {
            const aChild = String(a.childId);
            const aDate =
              a.date ||
              (typeof a.start_time === "string" ? a.start_time.slice(0, 10) : undefined) ||
              (typeof a.time === "string" ? a.time.slice(0, 10) : undefined);
            return aChild === String(selectedChild) && aDate === selectedDate;
          });
          const activitiesToShow =
            filteredActivities.length > 0 ? filteredActivities : reportActivities;

          // Health events: prefer normalized store for selected child/date, else fallback to report payload
          const filteredHealthEvents = healthEvents.filter((e) => {
            const eChild = String(e.childId);
            const eDate =
              e.date ||
              (typeof e.time === "string" ? e.time.slice(0, 10) : undefined) ||
              (typeof (e as any).timestamp === "string" ? (e as any).timestamp.slice(0, 10) : undefined);
            return eChild === String(selectedChild) && eDate === selectedDate;
          });
          const healthEventsToShow =
            filteredHealthEvents.length > 0 ? filteredHealthEvents : report.healthEvents || [];

          return (
            <Card key={report.id ?? `${report.childId ?? "child"}-${report.date ?? reportIdx}`} className="ssgi-card p-4 sm:p-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Daily Report for {childName}</CardTitle>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {new Date(report.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 text-sm sm:text-base mb-4">{report.summary}</p>

              {/* Divider */}
              <hr className="my-4" />

              {/* Activities Section */}
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="font-bold text-base sm:text-lg">
                    Activities ({activitiesToShow.length})
                  </span>
                </div>
                {activitiesToShow.length === 0 ? (
                  <p className="text-gray-500 text-center py-4 text-sm sm:text-base">
                    No activities recorded
                  </p>
                ) : (
                  <div className="flex flex-row space-x-4 overflow-x-auto pb-2 -mx-2 px-2">
                    {activitiesToShow
                      .sort((a, b) => (a.start_time || a.time || "").localeCompare(b.start_time || b.time || ""))
                      .map((activityRaw, activityIdx) => {
                        const activity = activityRaw as import("@/lib/types").ActivityLog;
                        return (
                          <div
                            key={
                              activity.id ??
                              `${report.id ?? reportIdx}-activity-${
                                activity.activity_type || activity.type || activity.start_time || activity.time || activityIdx
                              }`
                            }
                            className="min-w-[280px] sm:min-w-[320px] max-w-xs flex-shrink-0 flex flex-col items-start space-y-2 p-3 sm:p-4 border rounded-xl bg-gray-50 shadow-md"
                          >
                            <div className="flex items-center space-x-2 w-full">
                              {getActivityIcon(activity.activity_type || activity.type)}
                              <Badge variant="outline" className="text-sm sm:text-base font-semibold">
                                {activity.activity_type || activity.type}
                              </Badge>
                              <span className="text-sm sm:text-base text-gray-700 ml-auto">
                                {activity.start_time ? new Date(activity.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : activity.time}
                                {activity.end_time && (
                                  <>
                                    {" - "}
                                    {new Date(activity.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </>
                                )}
                              </span>
                            </div>
                            <p className="text-base sm:text-lg font-bold text-gray-800">
                              {activity.description || activity.activity}
                            </p>
                            {activity.notes && (
                              <p className="text-sm sm:text-base text-gray-600 mt-1">
                                Notes: {activity.notes}
                              </p>
                            )}
                            {activity.photos && (
                              <div className="mt-2 w-full flex justify-center">
                                <img 
                                  src={activity.photos} 
                                  alt="Activity photo" 
                                  className="max-h-32 sm:max-h-40 rounded shadow" 
                                />
                              </div>
                            )}
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">
                              Logged by <span className="font-semibold">{activity.logged_by_name || activity.loggedBy}</span>
                            </p>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Divider */}
              <hr className="my-4" />

              {/* Health Events Section */}
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <Stethoscope className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="font-semibold text-sm sm:text-base">
                    Health Events ({healthEventsToShow.length})
                  </span>
                </div>
                {healthEventsToShow.length === 0 ? (
                  <p className="text-gray-500 text-center py-4 text-sm sm:text-base">
                    No health events recorded
                  </p>
                ) : (
                  <div className="flex flex-row space-x-4 overflow-x-auto pb-2 -mx-2 px-2">
                    {healthEventsToShow
                      .sort((a, b) => (a.time || "").localeCompare(b.time || ""))
                      .map((event, eventIdx) => (
                        <div
                          key={
                            event.id ??
                            `${report.id ?? reportIdx}-health-${
                              event.type || (event as any).event_type || event.time || eventIdx
                            }`
                          }
                          className="min-w-[280px] sm:min-w-[320px] max-w-xs flex-shrink-0 flex flex-col items-start space-y-2 p-3 sm:p-4 border rounded-xl bg-red-50 shadow-md"
                        >
                          <div className="flex items-center space-x-2 w-full">
                            {getHealthIcon(event.type || event.event_type)}
                            <Badge variant="outline" className="text-sm sm:text-base font-semibold bg-red-100 text-red-800">
                              {event.type || event.event_type}
                            </Badge>
                            <span className="text-sm sm:text-base text-gray-700 ml-auto">
                              {event.time ? new Date(event.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>
                          <p className="text-base sm:text-lg font-bold text-gray-800">
                            {event.description || event.event}
                          </p>
                          <div className="text-sm sm:text-base text-gray-700 space-y-1">
                            <div><span className="font-semibold">Recorded by:</span> {event.loggedBy || event.recorded_by_name}</div>
                            <div><span className="font-semibold">Date:</span> {event.time ? new Date(event.time).toLocaleDateString() : ''}</div>
                            <div><span className="font-semibold">Medication:</span> {event.medication_name || 'N/A'}</div>
                            <div><span className="font-semibold">Dosage:</span> {event.dosage || 'N/A'}</div>
                            <div><span className="font-semibold">Temperature:</span> {event.temperature || 'N/A'}</div>
                          </div>
                          {event.notes && (
                            <p className="text-sm sm:text-base text-gray-600 mt-1">
                              Notes: {event.notes}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </Card>
          );
        })
      )}
    </div>
  )
}

export default DailyReports;