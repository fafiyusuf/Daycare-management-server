"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
import {
  useActivityStore,
  useAuthStore,
  useChildStore,
} from "@/lib/store";
import type { BackendChild } from "@/lib/store/childStore";
import type { ActivityLog } from "@/lib/types";
import { ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { ActivityFormModal } from "@/components/ActivityFormModal";

export function ActivityLogger() {
  const { user } = useAuthStore();
  const { fetchChildren, children } = useChildStore();
  const {
    activities,
    fetchActivities, // Add fetchActivities to destructuring
    logActivity, // Add logActivity to destructuring
    updateActivity, // Add updateActivity to destructuring
    deleteActivity, // Add deleteActivity to destructuring
    isLoading, // We can now use the isLoading state from the store
  } = useActivityStore();

  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityLog | null>(
    null
  );
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);

  // Fetch data when component mounts or selectedDate changes
  useEffect(() => {
    // You only need to fetch children once
    fetchChildren({ is_active: "true" });
  }, [fetchChildren]);

  useEffect(() => {
    // Now you can just call the store's method
    fetchActivities(undefined, undefined, selectedDate);
  }, [selectedDate, fetchActivities]);

  type ActivityFormData = {
    childId: string;
    type: string;
    description: string;
    time: string;
    date: string;
    notes: string;
  };
  const handleAddActivitySubmit = async (
    formData: ActivityFormData,
    photoFile?: File | null
  ) => {
    if (!formData.childId) {
      toast.error("Please select a child");
      return;
    }

    const payload: Record<string, string> = {
      child: formData.childId,
      activity_type: formData.type,
      description: formData.description,
      start_time: `${formData.date}T${formData.time}:00Z`,
      notes: formData.notes || "",
    };

    try {
      if (photoFile) {
        const formToSend = new FormData();
        // Make sure to include all required fields
        Object.keys(payload).forEach((key) => {
          formToSend.append(key, payload[key]);
        });
        formToSend.append("photos", photoFile);
        // @ts-expect-error: FormData is required for file upload, but type expects ActivityLog
        await logActivity(formToSend, photoFile, selectedDate);
      } else {
        // @ts-expect-error: payload may not match ActivityLog type exactly
        await logActivity(payload, null, selectedDate);
      }
      toast.success("Activity logged successfully!");
      setShowModal(false);
      setEditingActivity(null);
    } catch (error) {
      console.error("Error logging activity:", error);
      toast.error("Failed to log activity. Please check all required fields.");
    }
  };

  const handleUpdateActivitySubmit = async (
    formData: ActivityFormData,
    photoFile?: File | null
  ) => {
    if (!editingActivity?.id) return;

    const payload: Record<string, string> = {
      child: formData.childId,
      activity_type: formData.type,
      description: formData.description,
      start_time: `${formData.date}T${formData.time}:00Z`,
      notes: formData.notes || "",
    };

    try {
      if (photoFile) {
        const formToSend = new FormData();
        // Make sure to include all required fields
        Object.keys(payload).forEach((key) => {
          formToSend.append(key, payload[key]);
        });
        formToSend.append("photos", photoFile);
        // @ts-expect-error: FormData is required for file upload, but type expects ActivityLog
        await updateActivity(editingActivity.id.toString(), formToSend, photoFile);
      } else {
        await updateActivity(editingActivity.id.toString(), payload, null);
      }
      toast.success("Activity updated successfully!");
      setShowModal(false);
      setEditingActivity(null);
    } catch (error) {
      console.error("Error updating activity:", error);
      toast.error("Failed to update activity. Please check all required fields.");
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this activity?")) {
      await deleteActivity(id);
    }
  };

  const handleEditActivity = (id: string) => {
    const activityToEdit = activities.find((activity) => activity.id === id);
    if (activityToEdit) {
      setEditingActivity(activityToEdit);
      setShowModal(true);
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "meal":
        return "bg-orange-100 text-orange-800";
      case "nap":
        return "bg-blue-100 text-blue-800";
      case "play":
        return "bg-green-100 text-green-800";
      case "health":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredActivities = activities.filter((activity) => {
    if (!activity.date) return false;
    try {
      const activityDate = new Date(activity.date).toISOString().split("T")[0];
      return activityDate === selectedDate;
    } catch (error) {
      console.error("Error parsing activity date:", activity.date, error);
      return false;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {user?.role === "nurse" ? "Health Logs" : "Activity Logger"}
          </h2>
          <p className="text-gray-600">
            {user?.role === "nurse"
              ? "Record health-related activities and medical observations"
              : "Log daily activities for children"}
          </p>
        </div>
        {user?.role !== "parent" && (
          <Button
            onClick={() => {
              setEditingActivity(null);
              setShowModal(true);
            }}
            className="hidden sm:inline-flex"
          >
            <Plus className="w-4 h-4 mr-2" /> Log New Activity
          </Button>
        )}
      </div>

      <div className="flex justify-between items-center">
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full sm:w-[200px]"
        />
        {user?.role !== "parent" && (
          <Button
            onClick={() => {
              setEditingActivity(null);
              setShowModal(true);
            }}
            className="sm:hidden ml-2"
          >
            <Plus className="w-4 h-4" />
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activities for {selectedDate}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading activities...</div>
          ) : filteredActivities.length === 0 ? (
            <Alert>
              <AlertDescription>
                No activities logged for this date.
              </AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Time</TableHead>
                  <TableHead>Child</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead className="hidden md:table-cell">Notes</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities
                  .sort(
                    (a, b) =>
                      new Date(a.start_time ?? '').getTime() -
                      new Date(b.start_time ?? '').getTime()
                  )
                  .map((activity) => {
                    // Find child object from store by childId
                    const child: BackendChild | undefined = children.find(
                      (c) => c.id.toString() === activity.childId
                    );
                    return (
                      <TableRow key={activity.id}>
                        <TableCell>
                          {activity.start_time
                            ? new Date(activity.start_time).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : ""}
                        </TableCell>
                        <TableCell>
                          {child ? `${child.first_name} ${child.last_name}` : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${getActivityColor(activity.activity_type || "")}`}
                          >
                            {activity.activity_type}
                          </Badge>
                          <p className="text-sm mt-1">{activity.description}</p>
                          {activity.photos && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <ImageIcon className="w-3 h-3" />
                                Photo attached
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {activity.notes}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditActivity(activity.id)}
                              className="p-1 rounded-full hover:bg-yellow-100 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4 text-yellow-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteActivity(activity.id)}
                              className="p-1 rounded-full hover:bg-red-100 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ActivityFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={
          editingActivity ? handleUpdateActivitySubmit : handleAddActivitySubmit
        }
        initialData={editingActivity}
      />
    </div>
  );
}