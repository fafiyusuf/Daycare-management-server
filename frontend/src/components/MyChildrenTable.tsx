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
import type { BackendChild } from "@/lib/store/childStore"
import { differenceInYears } from "date-fns"
import { Baby } from "lucide-react"

interface MyChildrenTableProps {
  children: BackendChild[]
}

export function MyChildrenTable({ children }: MyChildrenTableProps) {
  // Function to check if a child's profile is complete
  const isProfileComplete = (child: BackendChild) => {
    return (
      child.first_name &&
      child.last_name &&
      child.date_of_birth &&
      child.emergency_contact &&
      child.profile_picture &&
      child.birth_certificate &&
      child.vaccination_card
    )
  }
// The parent component handles the empty state message, so we don't render anything here if no children
  if (children.length === 0) {
    return null
  }

  return (
    <Card className="ssgi-card mt-6">
      <CardHeader>
        <CardTitle>My Children</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Age</TableHead>
              <TableHead>Profile Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {children.map((child) => {
              const age = child.date_of_birth
                ? differenceInYears(new Date(), new Date(child.date_of_birth))
                : "N/A"
              const profileComplete = isProfileComplete(child)

              return (
                <TableRow key={child.id}>
                  <TableCell className="font-medium flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {child.profile_picture ? (
                        <img
                          src={child.profile_picture}
                          alt={child.first_name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <Baby className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <span>{`${child.first_name} ${child.last_name}`}</span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{age}</TableCell>
                  <TableCell>
                    <Badge variant={profileComplete ? "default" : "secondary"}>
                      {profileComplete ? "Complete" : "Incomplete"}
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}