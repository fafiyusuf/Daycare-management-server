// src/components/IncidentLogModal.tsx

"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useChildStore } from "@/lib/store/childStore"
import { useIncidentStore } from "@/lib/store/incidentStore"
import { X } from "lucide-react"
import type React from "react"
import { useEffect, useState } from "react"

interface IncidentLogModalProps {
  isOpen: boolean
  onClose: () => void
}

export function IncidentLogModal({ isOpen, onClose }: IncidentLogModalProps) {
  const { children, fetchChildren } = useChildStore()
  const { logIncident, isLoading } = useIncidentStore()

  const [form, setForm] = useState({
    childId: "",
    title: "",
    description: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Fetch children if the list is empty
    if (isOpen && children.length === 0) {
      fetchChildren({ is_active: "true" })
    }
    // Reset form when modal opens
    if (isOpen) {
      setForm({ childId: "", title: "", description: "" })
    }
  }, [isOpen, children.length, fetchChildren])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.childId || !form.title || !form.description) {
      alert("Please fill out all fields.")
      return
    }
    setIsSubmitting(true)
    try {
      await logIncident({
        child: form.childId,
        title: form.title,
        description: form.description,
      })
      onClose() // Close modal on success
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

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
        <h2 className="text-2xl font-bold mb-4">Log New Incident</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <label htmlFor="incident-title" className="block mb-1 font-medium">
              Incident Title
            </label>
            <Input
              id="incident-title"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="e.g., Minor fall on playground"
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label
              htmlFor="incident-description"
              className="block mb-1 font-medium"
            >
              Description
            </label>
            <Textarea
              id="incident-description"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Provide a detailed description of the incident..."
              disabled={isSubmitting}
              required
              rows={5}
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
            <Button type="submit" disabled={isSubmitting || isLoading}>
              {isSubmitting || isLoading ? "Saving..." : "Log Incident"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
