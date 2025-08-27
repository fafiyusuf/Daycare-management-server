"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore, useChildStore } from "@/lib/store";
import type { ActivityLog } from "@/lib/types";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

import Image from "next/image";

interface ActivityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: {
    childId: string;
    type: string;
    description: string;
    time: string;
    date: string;
    notes: string;
  }, photoFile?: File | null) => Promise<void>;
  initialData?: ActivityLog | null;
}

export function ActivityFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
}: ActivityFormModalProps) {
  const { user } = useAuthStore();
  const { children } = useChildStore();

  // Updated form state to use 'type' for the activity
  const [form, setForm] = useState({
    childId: "",
    type: "",
    description: "",
    time: "",
    date: "",
    notes: "",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setForm({
          childId: initialData.childId || "",
          // Use activity_type from the initial data
          type: initialData.activity_type || "",
          description: initialData.description || "",
          time: initialData.start_time
            ? new Date(initialData.start_time).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
            : "",
          date: initialData.start_time
            ? new Date(initialData.start_time).toISOString().split("T")[0]
            : "",
          notes: initialData.notes || "",
        });
        setPhotoPreview(initialData.photos || null);
      } else {
        // Reset form for new entry
        setForm({
          childId: "",
          type: "",
          description: "",
          time: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          date: new Date().toISOString().split("T")[0],
          notes: "",
        });
        setPhotoFile(null);
        setPhotoPreview(null);
      }
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (photoFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(photoFile);
    }
  }, [photoFile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(form, photoFile);
      onClose(); // Close modal on successful submission
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-2 right-2 rounded-full"
          disabled={isSubmitting}
        >
          <X className="h-5 w-5" />
        </Button>
        <h2 className="text-2xl font-bold mb-4">
          {initialData ? "Edit Activity" : "Log New Activity"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {user?.role !== "parent" && (
            <div>
              <label htmlFor="child-select" className="block mb-1 font-medium">
                Child
              </label>
              <Select
                value={form.childId}
                onValueChange={(value) =>
                  setForm((f) => ({ ...f, childId: value }))
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="child-select">
                  <SelectValue placeholder="Select a child" />
                </SelectTrigger>
                <SelectContent>
                  {children.map((child) => (
                    <SelectItem key={child.id} value={child.id.toString()}>
                      {child.first_name} {child.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* New Input for Activity Type */}
          <div>
            <label htmlFor="activity-type" className="block mb-1 font-medium">
              Activity Type
            </label>
            <Input
              id="activity-type"
              value={form.type}
              onChange={(e) =>
                setForm((f) => ({ ...f, type: e.target.value }))
              }
              placeholder="e.g., Meal, Nap, Play"
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block mb-1 font-medium"
            >
              Description
            </label>
            <Input
              id="description"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="e.g., Ate all the pasta, Slept for 1 hour"
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block mb-1 font-medium">
                Date
              </label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="time" className="block mb-1 font-medium">
                Time
              </label>
              <Input
                id="time"
                type="time"
                value={form.time}
                onChange={(e) =>
                  setForm((f) => ({ ...f, time: e.target.value }))
                }
                disabled={isSubmitting}
              />
            </div>
          </div>
          {user?.role !== "parent" && (
            <div className="space-y-2">
              <label className="block mb-1 font-medium">
                Add Photo (optional)
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setPhotoFile(e.target.files[0]);
                    } else {
                      setPhotoFile(null);
                    }
                  }}
                  disabled={isSubmitting}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              {photoPreview && (
                <div className="space-y-2">
                  <div className="relative w-full h-48 border rounded-md overflow-hidden">
                    <Image
                      src={photoPreview}
                      alt="Photo preview"
                      fill
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-red-500"
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview(initialData?.photos || null);
                    }}
                  >
                    Remove photo
                  </Button>
                </div>
              )}
            </div>
          )}
          <div>
            <label className="block mb-1 font-medium">Notes (optional)</label>
            <Textarea
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : initialData
                ? "Update Activity"
                : "Log Activity"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}