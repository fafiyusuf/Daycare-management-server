// src/components/DailyAttendanceTable.tsx

"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/crd"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAttendanceStore, useAuthStore, useChildStore } from "@/lib/store"
import { Clock } from "lucide-react"
import { useMemo } from "react"

export function DailyAttendanceTable() {
  const { user } = useAuthStore()
  const { children } = useChildStore()
  const { attendance, isLoading } = useAttendanceStore()

  // Create a memoized list of IDs for the children assigned to this babysitter
  const myChildrenIds = useMemo(() => {
    if (!user?.id) return []
    return children
      .filter((child: any) => {
        const assignedId =
          typeof child.assigned_babysitter === "number"
            ? child.assigned_babysitter
            : child.assigned_babysitter?.id
        return assignedId === Number(user.id)
      })
      .map((child) => child.id)
  }, [children, user?.id])

  // Filter the general attendance list to find records for the babysitter's children who are currently checked in
  const presentChildren = useMemo(() => {
    return attendance.filter(
      (record) => !record.checkOut && myChildrenIds.includes(Number(record.childId))
    )
  }, [attendance, myChildrenIds])

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Today's Present Children</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Child Name</TableHead>
              <TableHead>Check-in Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  Loading attendance...
                </TableCell>
              </TableRow>
            ) : presentChildren.length > 0 ? (
              presentChildren.map((record) => {
                const child = children.find((c) => c.id === Number(record.childId))
                return (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {child ? `${child.first_name} ${child.last_name}` : `Child ID: ${record.childId}`}
                    </TableCell>
                    <TableCell>
                      {record.checkIn
                        ? new Date(record.checkIn).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">Present</Badge>
                    </TableCell>
                    <TableCell>{record.notes || "No notes"}</TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                    <Clock className="h-8 w-8" />
                    <span>No assigned children are present right now.</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}