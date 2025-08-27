"use client"

import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { IncidentLog as Incident } from "@/lib/types";

interface IncidentsTableProps {
  incidents: Array<Incident & {
    child?: string | number;
    child_name?: string;
    created_at?: string;
  }>;
  childNameMap: Map<string, string>;
  isLoading: boolean;
  currentPage: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onDelete: (id: string | number) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
}

export function IncidentsTable({
  incidents,
  childNameMap,
  isLoading,
  currentPage,
  totalCount,
  hasNextPage,
  hasPreviousPage,
  onDelete,
  onNextPage,
  onPreviousPage
}: IncidentsTableProps) {
  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return "N/A"
    return new Date(timestamp).toLocaleString([], {
      dateStyle: "short",
      timeStyle: "short",
    })
  }
  
  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Child</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading incidents...
                </TableCell>
              </TableRow>
            ) : incidents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No incidents found.
                </TableCell>
              </TableRow>
            ) : (
              incidents.map(incident => (
                <TableRow key={incident.id}>
                  <TableCell>
                    {incident.child_name || childNameMap.get(String(incident.child ?? '')) || incident.child || '-'}
                  </TableCell>
                  <TableCell>{incident.title}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {incident.description}
                  </TableCell>
                  <TableCell>
                    {formatTimestamp(incident.created_at || incident.createdAt || '')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {/* <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(incident.id)}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button> */}
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
          Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} incidents
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