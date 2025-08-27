// src/components/nurse/AddEditEventModal.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { HealthEvent } from "@/lib/types"
import { X } from "lucide-react"

interface AddEditEventModalProps {
  isOpen: boolean
  isEdit?: boolean
  childrenOptions: { id: number; first_name: string; last_name: string }[]
  initialData?: Partial<HealthEvent>
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  form: {
    child: string
    event_type: string
    description: string
    medication_name: string
    dosage: string
    temperature: string
    timestamp: string
    notes: string
  }
  setForm: React.Dispatch<React.SetStateAction<{
    child: string
    event_type: string
    description: string
    medication_name: string
    dosage: string
    temperature: string
    timestamp: string
    notes: string
  }>>
}

export function AddEditEventModal({
  isOpen,
  isEdit = false,
  childrenOptions,
  
  onClose,
  onSubmit,
  form,
  setForm
}: AddEditEventModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{isEdit ? 'Edit' : 'Log'} Health Event</h2>
          <Button 
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>Child</Label>
            <Select 
              value={form.child} 
              onValueChange={(value) => setForm(f => ({ ...f, child: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select child" />
              </SelectTrigger>
              <SelectContent>
                {childrenOptions.map(child => (
                  <SelectItem key={child.id} value={String(child.id)}>
                    {child.first_name} {child.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
  <Label>Event Type</Label>
  <input
    type="text"
    value={form.event_type}
    onChange={(e) => setForm(f => ({ ...f, event_type: e.target.value }))}
    placeholder="Enter event type"
    required
    className="border rounded px-2 py-1 w-full" // optional styling
  />
</div>

          <div>
            <Label>Description</Label>
            <Textarea 
              value={form.description} 
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} 
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Medication</Label>
              <Input 
                value={form.medication_name} 
                onChange={(e) => setForm(f => ({ ...f, medication_name: e.target.value }))} 
                
              />
            </div>
            <div>
              <Label>Dosage</Label>
              <Input 
                value={form.dosage} 
                onChange={(e) => setForm(f => ({ ...f, dosage: e.target.value }))} 
                
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Temperature (°C)</Label>
              <Input 
                value={form.temperature} 
                onChange={(e) => setForm(f => ({ ...f, temperature: e.target.value }))} 
                type="number"
                step="0.1"
              />
            </div>
            <div>
              <Label>Timestamp</Label>
              <Input 
                type="datetime-local" 
                value={form.timestamp} 
                onChange={(e) => setForm(f => ({ ...f, timestamp: e.target.value }))} 
                required
              />
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea 
              value={form.notes} 
              onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} 
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEdit ? 'Update' : 'Log'} Event
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}