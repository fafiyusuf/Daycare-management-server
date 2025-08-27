// components/ChildList.tsx
"use client"

import { IncidentsTable } from "@/components/admin/IncidentsTable"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/crd"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useChildStore, useUserStore } from "@/lib/store"
import type { BackendChild } from "@/lib/store/childStore"
import { useIncidentStore } from "@/lib/store/incidentStore"
import { AlertCircle, Edit, Loader2, Plus, User2, UserCheck, UserX } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { ChildManager } from "./ChildManager"

interface EditChildForm {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  parentId: string;
  familyId: string;
  medicalInfo: string;
  allergies: string;
  emergencyContact: string;
  babysitterId: string;
  isActive: boolean;
}

const getAge = (dateString: string): string => {
  if (!dateString) return 'N/A';
  const today = new Date();
  const birthDate = new Date(dateString); // Corrected line

  if (isNaN(birthDate.getTime())) {
    return 'Invalid Date';
  }

  let ageYears = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    ageYears--;
  }

  let ageMonths = (today.getMonth() - birthDate.getMonth() + 12) % 12;
  if (today.getDate() < birthDate.getDate()) {
    ageMonths = (ageMonths - 1 + 12) % 12;
  }

  if (ageYears > 0) {
    return `${ageYears} year${ageYears > 1 ? 's' : ''}, ${ageMonths} month${ageMonths !== 1 ? 's' : ''}`;
  }
  return `${ageMonths} month${ageMonths !== 1 ? 's' : ''}`;
};


export function ChildList() {
  const { children, fetchChildren, isChildrenLoading, updateChild, deactivateChild, activateChild } = useChildStore()
  const { users, fetchUsers } = useUserStore()
  const [showAddChildModal, setShowAddChildModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showIncidentsModal, setShowIncidentsModal] = useState(false)
  const [currentChild, setCurrentChild] = useState<BackendChild | null>(null)
  
  // Incidents state
  const { 
    incidents, 
    isLoading: isIncidentsLoading, 
    fetchIncidents, 
    fetchIncidentsByUrl,
    count: incidentsCount, 
    currentPage: storeCurrentPage,
    nextPageUrl,
    previousPageUrl
  } = useIncidentStore()
  const [childNameMap, setChildNameMap] = useState(new Map<string, string>())
  const [editForm, setEditForm] = useState<EditChildForm>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    parentId: '',
    familyId: '',
    medicalInfo: '',
    allergies: '',
    emergencyContact: '',
    babysitterId: '',
    isActive: true
  })
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const childrenPerPage = 10;
  // Use children.length for pagination since count is not in store
  const safeCount: number = Array.isArray(children) ? children.length : 0;
  const totalPages = Math.max(1, Math.ceil(safeCount / childrenPerPage));
  const hasNextPage = currentPage < totalPages;


  // Load child data
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchChildren({
            page: currentPage,
            search: searchQuery,
            is_active: filter === 'all' ? '' : filter,
          }),
          fetchUsers()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data');
      }
    };
    loadData();
  }, [fetchChildren, fetchUsers, currentPage, searchQuery, filter]);

  // Clamp currentPage if count changes and we are beyond the last page
  useEffect(() => {
    const total = Math.max(1, Math.ceil(safeCount / childrenPerPage));
    if (currentPage > total) {
      setCurrentPage(total);
    }
  }, [safeCount, childrenPerPage, currentPage]);


  const handleEditClick = (child: BackendChild) => {
    setCurrentChild(child)
    setEditForm({
      firstName: child.first_name,
      lastName: child.last_name,
      dateOfBirth: child.date_of_birth,
      parentId: child.parents && child.parents.length > 0 ? child.parents[0].id.toString() : '',
      // Support both legacy numeric family id and new nested family object
      familyId: (typeof (child as any).family === 'object' && (child as any).family !== null)
        ? ((child as any).family.id?.toString() || '')
        : ((child as any).family?.toString() || ''),
      medicalInfo: child.medical_info || '',
      allergies: child.allergies || '',
      emergencyContact: child.emergency_contact || '',
      // Support both numeric babysitter id and nested babysitter object
      babysitterId: (typeof (child as any).assigned_babysitter === 'object' && (child as any).assigned_babysitter !== null)
        ? (((child as any).assigned_babysitter.id)?.toString() || '')
        : ((child as any).assigned_babysitter?.toString() || ''),
      isActive: child.is_active
    })
    setShowEditModal(true)
  }

  const handleDeactivate = async (childId: number) => {
    if (window.confirm("Are you sure you want to deactivate this child? This action cannot be undone.")) {
      await deactivateChild(childId);
    }
  }

  const handleActivate = async (childId: number) => {
    if (window.confirm("Are you sure you want to activate this child?")) {
      await activateChild(childId);
    }
  }

  const availableParents = users.filter(u => u.role === 'parent')
  const availableBabysitters = users.filter(u => u.role === 'babysitter')

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentChild) return;

    try {
      const parentIdNum = parseInt(editForm.parentId, 10);
      if (isNaN(parentIdNum) || !availableParents.some(p => p.id === parentIdNum)) {
        toast.error("Selected parent not found.");
        return;
      }

      const babysitterIdNum = editForm.babysitterId ? parseInt(editForm.babysitterId, 10) : null;
      if (editForm.babysitterId && isNaN(babysitterIdNum as number)) {
        toast.error("Invalid babysitter selected.");
        return;
      }

      // Build payload safely
      const updatedData: Record<string, any> = {
        first_name: editForm.firstName,
        last_name: editForm.lastName,
        date_of_birth: editForm.dateOfBirth,
        parent_ids: [parentIdNum], // use write-only field expected by backend
        medical_info: editForm.medicalInfo,
        allergies: editForm.allergies,
        emergency_contact: editForm.emergencyContact,
        is_active: editForm.isActive,
      };

      if (editForm.familyId) {
        const famId = parseInt(editForm.familyId, 10);
        if (!isNaN(famId)) {
          updatedData.family_id = famId; // Use family_id, not family
        }
      }

      if (babysitterIdNum !== null) {
        updatedData.assigned_babysitter_id = babysitterIdNum; // Use assigned_babysitter_id, not assigned_babysitter
      }

      await updateChild(currentChild.id, updatedData);
      setShowEditModal(false);
      toast.success("Child updated successfully.");
    } catch (error) {
      console.error('Error updating child:', error);
      toast.error('Failed to update child profile.');
    }
  }

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Incidents table handlers
  const handleViewIncidents = () => {
    // Create a map of child IDs to names for the incidents table
    const nameMap = new Map<string, string>();
    if (Array.isArray(children)) {
      children.forEach((child: any) => {
        nameMap.set(child.id.toString(), `${child.first_name} ${child.last_name}`);
      });
    }
    setChildNameMap(nameMap);
    
    // Fetch incidents with page 1 and open modal
    fetchIncidents(undefined, undefined, 1);
    setShowIncidentsModal(true);
  };
  
  const handleNextIncidentsPage = () => {
    if (nextPageUrl) {
      fetchIncidentsByUrl(nextPageUrl);
    }
  };

  const handlePreviousIncidentsPage = () => {
    if (previousPageUrl) {
      fetchIncidentsByUrl(previousPageUrl);
    }
  };

  // Handle incident deletion (placeholder)
  const handleDeleteIncident = (id: string | number) => {
    // Add delete functionality here
    toast.error("Incident deletion functionality is not yet implemented.");
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };
  const handleFilterChange = (value: string) => {
    setFilter(value);
    setCurrentPage(1);
  };
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };


  if (isChildrenLoading && !children.length) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Child Management</h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowAddChildModal(true)} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" /> Add Child
          </Button>
          <Button 
            variant="outline" 
            onClick={handleViewIncidents} 
            className="flex items-center"
          >
            <AlertCircle className="mr-2 h-4 w-4" /> View Incidents
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Children</CardTitle>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search children..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="max-w-sm"
              />
              <Select onValueChange={handleFilterChange} defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Profile</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Parents</TableHead>
                <TableHead>Babysitter</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isChildrenLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              )}
              {!isChildrenLoading && Array.isArray(children) && children.length > 0 ? (
                children.map(child => {
                  const profilePicture = (child as any).profile_picture;
                  const resolvedImage = profilePicture
                    ? (profilePicture.startsWith('http')
                        ? profilePicture
                        : `${process.env.NEXT_PUBLIC_MEDIA_BASE_URL || ''}${profilePicture.startsWith('/') ? '' : '/'}${profilePicture}`)
                    : null;
                  // Babysitter name resolution supporting id or nested object
                  let babysitterDisplay = 'N/A';
                  const rawBabysitter: any = (child as any).assigned_babysitter;
                  if (rawBabysitter) {
                    if (typeof rawBabysitter === 'object') {
                      babysitterDisplay = `${rawBabysitter.first_name || ''} ${rawBabysitter.last_name || ''}`.trim() || 'Babysitter';
                    } else {
                      const bs = users.find(u => u.id === rawBabysitter);
                      babysitterDisplay = bs ? `${bs.first_name} ${bs.last_name}` : 'Babysitter not found';
                    }
                  }
                  return (
                    <TableRow key={child.id}>
                      <TableCell>
                        {resolvedImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={resolvedImage}
                            alt={`${child.first_name} ${child.last_name}`}
                            className="h-8 w-8 rounded-full object-cover border"
                          />
                        ) : (
                          <User2 className="h-6 w-6 text-gray-500" />
                        )}
                      </TableCell>
                    <TableCell className="font-medium flex items-center">
                      <Link href={`/children/${child.id}`} className="hover:underline">
                        {`${child.first_name} ${child.last_name}`}
                      </Link>
                      {!child.is_active && (
                        <span className="ml-2 px-2 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded-full">
                          Inactive
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{getAge(child.date_of_birth)}</TableCell>
                    <TableCell>
                      {child.parents && child.parents.length > 0 ?
                        child.parents.map(parent => `${parent.first_name} ${parent.last_name}`).join(', ') : 'N/A'}
                    </TableCell>
                    <TableCell>{babysitterDisplay}</TableCell>
                    <TableCell className="text-right flex space-x-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(child)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {child.is_active ? (
                        <Button variant="destructive" size="sm" onClick={() => handleDeactivate(child.id)}>
                          <UserX className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => handleActivate(child.id)}>
                          <UserCheck className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                  )
                })
              ) : (
                !isChildrenLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No children found.
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={!hasNextPage}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Child Modal */}
      <Dialog open={showAddChildModal} onOpenChange={setShowAddChildModal}>
        <DialogContent className="sm:max-w-[425px] md:max-w-[700px] lg:max-w-[900px] max-h-[90vh] overflow-y-auto bg-background">
          <DialogHeader>
            <DialogTitle>Add New Child</DialogTitle>
          </DialogHeader>
          <ChildManager onClose={() => setShowAddChildModal(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Child Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[425px] md:max-w-[700px] lg:max-w-[900px] max-h-[90vh] overflow-y-auto bg-background">
          <DialogHeader>
            <DialogTitle>Edit Child Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={editForm.firstName}
                  onChange={handleEditFormChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={editForm.lastName}
                  onChange={handleEditFormChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={editForm.dateOfBirth}
                  onChange={handleEditFormChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="parentId">Parent</Label>
                <select
                  id="parentId"
                  name="parentId"
                  value={editForm.parentId}
                  onChange={handleEditFormChange}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                >
                  <option value="">Select a parent</option>
                  {Array.isArray(users) && users
                    .filter(u => u.role?.toLowerCase() === "parent")
                    .map((parent) => (
                      <option key={parent.id} value={parent.id}>
                        {parent.first_name} {parent.last_name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="medicalInfo">Medical Information</Label>
                <Input
                  id="medicalInfo"
                  name="medicalInfo"
                  value={editForm.medicalInfo}
                  onChange={handleEditFormChange}
                  placeholder="Any medical conditions or notes"
                />
              </div>
              <div>
                <Label htmlFor="allergies">Allergies</Label>
                <Input
                  id="allergies"
                  name="allergies"
                  value={editForm.allergies}
                  onChange={handleEditFormChange}
                  placeholder="List any allergies (separate with commas)"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input
                id="emergencyContact"
                name="emergencyContact"
                value={editForm.emergencyContact}
                onChange={handleEditFormChange}
                placeholder="Emergency contact number"
                required
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditModal(false)}
                disabled={isChildrenLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isChildrenLoading}
              >
                {isChildrenLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Incidents Table Dialog */}
      <Dialog open={showIncidentsModal} onOpenChange={setShowIncidentsModal}>
        <DialogContent className="sm:max-w-[90%] md:max-w-[80%] max-h-[90vh] overflow-y-auto bg-background">
          <DialogHeader>
            <DialogTitle>Incident Reports</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {isIncidentsLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <IncidentsTable 
                incidents={incidents}
                childNameMap={childNameMap}
                isLoading={isIncidentsLoading}
                currentPage={storeCurrentPage}
                totalCount={incidentsCount || 0}
                hasNextPage={!!nextPageUrl}
                hasPreviousPage={!!previousPageUrl}
                onDelete={handleDeleteIncident}
                onNextPage={handleNextIncidentsPage}
                onPreviousPage={handlePreviousIncidentsPage}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}