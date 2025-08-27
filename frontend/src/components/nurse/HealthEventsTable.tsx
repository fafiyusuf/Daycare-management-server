// src/components/nurse/HealthEventsTable.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { HealthEvent } from "@/lib/types"
// import { formatDateTime } from "@/lib/utils"
import { Pencil, Trash2 } from "lucide-react"

interface HealthEventsTableProps {
  events: HealthEvent[]
  childNameMap: Map<string, string>
  parentNameMap: Map<string, string>
  isLoading: boolean
  currentPage: number
  totalCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onNextPage: () => void
  onPreviousPage: () => void
}

export function HealthEventsTable({
  events,
  childNameMap,
  parentNameMap,
  isLoading,
  currentPage,
  totalCount,
  hasNextPage,
  hasPreviousPage,
  onEdit,
  onDelete,
  onNextPage,
  onPreviousPage
}: HealthEventsTableProps) {
  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Child</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Event Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading health events...
                </TableCell>
              </TableRow>
            ) : events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No health events found
                </TableCell>
              </TableRow>
            ) : (
              events.map(event => (
                <TableRow key={event.id}>
                  <TableCell>
                    {childNameMap.get(String(event.childId || event.child)) || '-'}
                  </TableCell>
                  <TableCell>
                    {parentNameMap.get(String(event.childId || event.child)) || '-'}
                  </TableCell>
                  <TableCell>{event.event_type || event.type}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {event.description || event.event}
                    {event.medication_name && (
                      <div className="text-sm text-gray-500">
                        Med: {event.medication_name} {event.dosage && `(${event.dosage})`}
                      </div>
                    )}
                    {event.temperature && (
                      <div className="text-sm text-gray-500">
                        Temp: {event.temperature}°C
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {(event.timestamp || event.time)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(event.id)}
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4 text-yellow-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(event.id)}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
        <div className="text-sm text-muted-foreground">
          Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} events
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={(e) => { e.preventDefault(); if (hasPreviousPage) onPreviousPage(); }} 
                isActive={!hasPreviousPage ? false : undefined}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="px-4 py-2">Page {currentPage}</span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext 
                onClick={(e) => { e.preventDefault(); if (hasNextPage) onNextPage(); }} 
                isActive={!hasNextPage ? false : undefined}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </>
  )
}