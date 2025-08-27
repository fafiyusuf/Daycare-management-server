// src/views/administrator/UserManagement.tsx
"use client"

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/crd";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { Check, Edit, Eye, EyeOff, List, Plus, UserCheck, Users, UserX, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { applicationsAPI, type ApplicationItem } from "@/lib/api/applications";
import { userAPI } from "@/lib/api/user";
import { useUIStore } from "@/lib/store/uiStore";
import { useUserStore } from "@/lib/store/userStore";
import { User } from "@/lib/types";
import { userSchema } from "@/lib/validationSchemas";

// Debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

// Consistent light/dark friendly badge classes (tinted background, readable text)
const getRoleBadgeClasses = (role: string) => {
  switch (role) {
    case "admin":
      return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 border border-red-200 dark:border-red-500/30";
    case "receptionist":
      return "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30";
    case "nurse":
      return "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300 border border-green-200 dark:border-green-500/30";
    case "babysitter":
      return "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30";
    case "parent":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-500/30";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300 border border-gray-200 dark:border-gray-500/30";
  }
};

const getStatusBadgeClasses = (isActive: boolean) =>
  isActive
    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30"
    : "bg-gray-200 text-gray-600 dark:bg-gray-500/20 dark:text-gray-300 border border-gray-300 dark:border-gray-500/30";

// Helper function to get application status badge classes
const getApplicationStatusClass = (status?: string) => {
  switch (status) {
    case 'accepted':
      return "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300 border border-green-200 dark:border-green-500/30";
    case 'rejected':
      return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 border border-red-200 dark:border-red-500/30";
    case 'reviewed':
      return "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30";
    default: // 'new' or undefined
      return "bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300 border border-gray-200 dark:border-gray-500/30";
  }
};

// Helper function to calculate age in months from birth date
const calculateAge = (birthDate: Date): number => {
  const today = new Date();
  let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
  months -= birthDate.getMonth();
  months += today.getMonth();
  return months <= 0 ? 0 : months;
};

const STAFF_ROLES = ["admin", "receptionist", "babysitter", "nurse"];

export function UserManagement() {
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const { users, fetchUsers: fetchUsersFromStore, count, addUser, updateUser } = useUserStore()
  const { setLoading, setError, error, isLoading } = useUIStore()
  const [updatingProfile, setUpdatingProfile] = useState<number | null>(null)
  const [appsOpen, setAppsOpen] = useState(false)
  const [applications, setApplications] = useState<ApplicationItem[]>([])
  const [appsLoading, setAppsLoading] = useState(false)
  const [appFilterStatus, setAppFilterStatus] = useState("all")
  const [appCurrentPage, setAppCurrentPage] = useState(1)
  const [appTotalCount, setAppTotalCount] = useState(0)
  const appTotalPages = Math.ceil(appTotalCount / 10) // Assuming 10 items per page

  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page: currentPage };
      if (debouncedSearchTerm) params.search = debouncedSearchTerm;
      if (filterRole) params.role = filterRole;
      if (filterStatus) params.is_active = filterStatus;
      
      await fetchUsersFromStore(params);
    } catch (err: any) {
      setError(err.message || "Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, filterRole, filterStatus, setLoading, setError, fetchUsersFromStore]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const fetchApplications = async () => {
    setAppsLoading(true);
    try {
      const { applications: data, count } = await applicationsAPI.list({
        page: appCurrentPage,
        status: appFilterStatus
      });
      setApplications(data);
      setAppTotalCount(count);
    } catch (e) {
      toast.error("Failed to load applicants");
    } finally {
      setAppsLoading(false);
    }
  };

  const openApplicants = async () => {
    setAppsOpen(true);
    fetchApplications();
  };
  
  const handleUpdateApplicationStatus = async (id: number | string, status: string) => {
    setAppsLoading(true);
    try {
      await applicationsAPI.updateStatus(id, status);
      // Refresh applications after status update
      fetchApplications();
      toast.success(`Application status updated to ${status}`);
    } catch (e) {
      toast.error("Failed to update application status");
      setAppsLoading(false);
    }
  }

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterRole, filterStatus]);

  // Refetch applications when filters or page changes
  useEffect(() => {
    if (appsOpen) {
      fetchApplications();
    }
  }, [appCurrentPage, appFilterStatus, appsOpen]);

  const handleSubmit = async (
    values: Partial<User>,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    setLoading(true)
    setError(null)
    try {
      // Create a FormData object to handle file uploads
      const formData = new FormData();
      
      // Add all non-file fields to the FormData
      Object.entries(values).forEach(([key, value]) => {
        if (key !== 'profile_picture' && value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      
      // Add the profile picture if it exists
      if (values.profile_picture && typeof values.profile_picture !== 'string') {
        formData.append('profile_picture', values.profile_picture);
      }
      
      if (editingUser) {
        // UPDATE user
        const updated = await userAPI.updateStaffWithImage(editingUser.id, formData);
        updateUser(editingUser.id, updated);
        toast.success("User updated successfully!");
      } else {
        // CREATE user
        const newUser = await userAPI.createStaffWithImage(formData);
        addUser(newUser);
        toast.success("User created successfully!");
      }
      setShowForm(false);
      setEditingUser(null);
      fetchUsers(); // Refetch users to see the new/updated one
    } catch (err: any) {
      setError(err.message || "Failed to save user.");
      toast.error(err.message || "Failed to save user.");
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  const handleDeactivate = async (id: number) => {
    setLoading(true);
    try {
      const user = users.find((u) => u.id === id);
      if (!user) throw new Error("User not found");
      let updatedUser;
      if (STAFF_ROLES.includes(user.role)) {
        updatedUser = await userAPI.updateStaff(id, { is_active_staff: false });
      } else if (user.role === "parent") {
        updatedUser = await userAPI.updateUser(id, { is_active_staff: false });
      } else {
        throw new Error("Unsupported user role for deactivation");
      }
      updateUser(id, updatedUser);
      toast.success("User deactivated successfully.");
      fetchUsers(); // Refetch to ensure consistency
    } catch (err: any) {
      toast.error(err.message || "Failed to deactivate user.");
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (id: number) => {
    setLoading(true);
    try {
      const user = users.find((u) => u.id === id);
      if (!user) throw new Error("User not found");
      let updatedUser;
      if (STAFF_ROLES.includes(user.role)) {
        updatedUser = await userAPI.updateStaff(id, { is_active_staff: true });
      } else if (user.role === "parent") {
        updatedUser = await userAPI.updateUser(id, { is_active_staff: true });
      } else {
        throw new Error("Unsupported user role for activation");
      }
      updateUser(id, updatedUser);
      toast.success("User activated successfully.");
      fetchUsers(); // Refetch to ensure consistency
    } catch (err: any) {
      toast.error(err.message || "Failed to activate user.");
    } finally {
      setLoading(false);
    }
  };

  const safeUsers = Array.isArray(users) ? users : []
  
  // Debug: Log the users being rendered
  useEffect(() => {
    console.log('Rendering users:', safeUsers.map(u => ({
      id: u.id,
      name: `${u.first_name} ${u.last_name}`,
      role: u.role,
      is_public: u.is_public,
      hasPublicField: 'is_public' in u
    })))
  }, [safeUsers])
  
  // Handle toggling public visibility
  const handleTogglePublic = async (userId: number, currentState: boolean = false) => {
    try {
      setUpdatingProfile(userId);
      console.log('Toggling visibility for user:', userId, 'Current state:', currentState);
      
      // Update the user's public status
      const updatedUser = await userAPI.updateStaff(userId, { is_public: !currentState });
      console.log('Updated user after toggle:', updatedUser);
      
      // Update the local state to reflect the change
      updateUser(userId, { ...updatedUser });
      
      // If the value did not change, force a refetch
      if (typeof updatedUser.is_public !== 'undefined' && updatedUser.is_public === currentState) {
        // Refetch users to sync state
        fetchUsers();
      }
      toast.success(`Profile ${!currentState ? 'made public' : 'hidden from public view'}`);
    } catch (error: any) {
      console.error('Error toggling profile visibility:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile visibility');
    } finally {
      setUpdatingProfile(null);
    }
  };

  const totalPages = Math.ceil(count / 10); // Assuming page size is 10

  return (
    <div className="container mx-auto py-4 sm:py-8">
      <Card className="ssgi-card shadow-lg">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <Users className="h-6 w-6" /> Staff & Family Management
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={openApplicants} className="w-auto px-2 py-2 sm:px-4 sm:py-2">
              <span className="sm:hidden"><List className="h-5 w-5" /></span>
              <span className="hidden sm:inline-flex"><List className="h-4 w-4 mr-2" /> Childcare Applications</span>
            </Button>
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingUser(null); setShowForm(true); }} className="w-auto px-2 py-2 sm:px-4 sm:py-2">
                  <span className="sm:hidden"><Plus className="h-5 w-5" /></span>
                  <span className="hidden sm:inline-flex"><Plus className="h-4 w-4 mr-2" /> Add New User</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto sm:overflow-y-visible">
                <DialogHeader>
                  <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
                </DialogHeader>
                <Formik
                  initialValues={
                    editingUser
                      ? { ...editingUser, password: "", profile_picture: null }
                      : { id: 0, first_name: "", last_name: "", username: "", email: "", role: "", phone: "", bio: "", password: "", is_active_staff: true, profile_picture: null }
                  }
                  validationSchema={userSchema}
                  onSubmit={handleSubmit}
                  enableReinitialize
                >
                  {({ isSubmitting, setFieldValue, values }) => (
                    <Form className="grid gap-4 py-4">
                      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="first_name">First Name</Label>
                          <Field as={Input} id="first_name" name="first_name" />
                          <ErrorMessage name="first_name" component="div" className="text-red-500 text-xs mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="last_name">Last Name</Label>
                          <Field as={Input} id="last_name" name="last_name" />
                          <ErrorMessage name="last_name" component="div" className="text-red-500 text-xs mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="username">Username</Label>
                          <Field as={Input} id="username" name="username" />
                          <ErrorMessage name="username" component="div" className="text-red-500 text-xs mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Field as={Input} id="email" name="email" type="email" />
                          <ErrorMessage name="email" component="div" className="text-red-500 text-xs mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Field as={Input} id="phone" name="phone" />
                          <ErrorMessage name="phone" component="div" className="text-red-500 text-xs mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="role">Role</Label>
                          <Select onValueChange={(value) => setFieldValue("role", value)} value={values.role}>
                            <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Administrator</SelectItem>
                              <SelectItem value="receptionist">Receptionist</SelectItem>
                              <SelectItem value="parent">Parent</SelectItem>
                              <SelectItem value="babysitter">Babysitter</SelectItem>
                              <SelectItem value="nurse">Nurse</SelectItem>
                            </SelectContent>
                          </Select>
                          <ErrorMessage name="role" component="div" className="text-red-500 text-xs mt-1" />
                        </div>
                        <div className="sm:col-span-2">
                          <Label htmlFor="profile_picture">Profile Picture</Label>
                          <Input 
                            id="profile_picture" 
                            name="profile_picture" 
                            type="file" 
                            accept="image/*"
                            onChange={(event) => {
                              const file = event.currentTarget.files?.[0];
                              setFieldValue("profile_picture", file || null);
                            }} 
                          />
                          <ErrorMessage name="profile_picture" component="div" className="text-red-500 text-xs mt-1" />
                          {editingUser?.profile_picture && (
                            <div className="mt-2">
                              <p className="text-xs text-muted-foreground">Current profile picture: {editingUser.profile_picture}</p>
                            </div>
                          )}
                        </div>
                        <div className="sm:col-span-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Field as={Input} id="bio" name="bio" />
                          <ErrorMessage name="bio" component="div" className="text-red-500 text-xs mt-1" />
                        </div>
                        <div className="sm:col-span-2">
                          <Label htmlFor="password">Password {editingUser ? "(Leave blank to keep unchanged)" : ""}</Label>
                          <Field as={Input} id="password" name="password" type="password" />
                          <ErrorMessage name="password" component="div" className="text-red-500 text-xs mt-1" />
                        </div>
                      </div>
                      <Button type="submit" className="w-full mt-4" disabled={isSubmitting || isLoading}>
                        {isSubmitting ? "Saving..." : (editingUser ? "Save Changes" : "Add User")}
                      </Button>
                    </Form>
                  )}
                </Formik>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter and Search Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Input
              placeholder="Search by name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Roles</SelectLabel>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="receptionist">Receptionist</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="babysitter">Babysitter</SelectItem>
                  <SelectItem value="nurse">Nurse</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => { setFilterRole(''); setFilterStatus(''); }}>Clear Filters</Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-40"><p>Loading users...</p></div>
          ) : safeUsers.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No users found. Add some!</p>
          ) : (
            <>
              {/* Responsive Table View */}
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Public Profile</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {safeUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.avatar} alt={user.username} />
                              <AvatarFallback>{user.first_name[0]}{user.last_name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.first_name} {user.last_name}</div>
                              <div className="text-sm text-gray-600">@{user.username}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div><span className="font-semibold">Email:</span> {user.email}</div>
                          <div className="text-sm text-gray-600"><span className="font-semibold">Phone:</span> {user.phone}</div>
                          <div className="text-sm text-gray-600"><span className="font-semibold">Username:</span> @{user.username}</div>
                        </TableCell>
                        <TableCell>
                          <Badge className={"capitalize font-medium px-2 py-1 text-xs " + getRoleBadgeClasses(user.role)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={"font-medium px-2 py-1 text-xs " + getStatusBadgeClasses(user.is_active_staff)}>
                            {user.is_active_staff ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            {STAFF_ROLES.includes(user.role) ? (
                              <div className="flex items-center gap-2">
                                <div className="flex items-center px-2 py-1 rounded-md border">
                                  {user.is_public ? (
                                    <>
                                      <Eye className="h-4 w-4 text-green-600 mr-1" />
                                      <span className="text-sm">Public</span>
                                    </>
                                  ) : (
                                    <>
                                      <EyeOff className="h-4 w-4 text-gray-400 mr-1" />
                                      <span className="text-sm">Private</span>
                                    </>
                                  )}
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleTogglePublic(user.id, user.is_public)}
                                  disabled={updatingProfile === user.id}
                                  className="h-8 w-8 p-0"
                                >
                                  {updatingProfile === user.id ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                                  ) : (
                                    user.is_public ? (
                                      <X className="h-4 w-4 text-red-500" />
                                    ) : (
                                      <Check className="h-4 w-4 text-green-500" />
                                    )
                                  )}
                                </Button>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">N/A</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button size="sm" variant="outline" onClick={() => { setEditingUser(user); setShowForm(true); }}><Edit className="h-4 w-4" /></Button>
                            {user.is_active_staff ? (
                              <Button size="sm" variant="destructive" onClick={() => handleDeactivate(user.id)}><UserX className="h-4 w-4" /></Button>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => handleActivate(user.id)}><UserCheck className="h-4 w-4" /></Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* Pagination Controls */}
              <div className="flex items-center justify-end space-x-2 py-4">
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={appsOpen} onOpenChange={setAppsOpen}>
  <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto sm:overflow-y-visible">
          <DialogHeader>
            <DialogTitle>Childcare Service Applications</DialogTitle>
          </DialogHeader>
          
          {/* Status Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <Label htmlFor="status-filter">Filter by Status</Label>
              <Select 
                value={appFilterStatus} 
                onValueChange={setAppFilterStatus}
              >
                <SelectTrigger className="w-full" id="status-filter">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setAppFilterStatus("all");
                  setAppCurrentPage(1);
                }}
              >
                Clear Filter
              </Button>
            </div>
          </div>
          
          {appsLoading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : applications.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No applications found.</div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto w-full">
                <Table className="min-w-[700px] md:min-w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Name</TableHead>
                      <TableHead className="whitespace-nowrap">Contact</TableHead>
                      <TableHead className="whitespace-nowrap">Employment</TableHead>
                      <TableHead className="whitespace-nowrap">Child Birth Date</TableHead>
                      <TableHead className="whitespace-nowrap">Residential Address</TableHead>
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                      <TableHead className="whitespace-nowrap">Date</TableHead>
                      <TableHead className="whitespace-nowrap">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map(app => (
                      <TableRow key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                        <TableCell className="font-medium max-w-[120px] truncate">{app.full_name}</TableCell>
                        <TableCell className="max-w-[120px] truncate">
                          <div className="text-sm">{app.email}</div>
                          {app.phone && <div className="text-xs text-muted-foreground">{app.phone}</div>}
                        </TableCell>
                        <TableCell className="max-w-[140px] truncate">
                          <div className="text-sm"><span className="font-semibold">Dept:</span> {app.department}</div>
                          <div className="text-sm"><span className="font-semibold">Position:</span> {app.position}</div>
                          <div className="text-xs text-muted-foreground">
                            <span className="font-semibold">Employee Salary:</span> {app.employee_monthly_salary} ETB
                            {app.spouse_monthly_salary && 
                              <><br /><span className="font-semibold">Spouse Salary:</span> {app.spouse_monthly_salary} ETB</>
                            }
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[120px] truncate">
                          {new Date(app.child_birth_date).toLocaleDateString()}
                          <div className="text-xs text-muted-foreground">
                            Age: {calculateAge(new Date(app.child_birth_date))} months
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[120px] truncate">
                          <div className="text-sm"><span className="font-semibold">Sub-city:</span> {app.sub_city}</div>
                          <div className="text-xs text-muted-foreground">
                            <span className="font-semibold">Woreda:</span> {app.woreda}, <span className="font-semibold">Kebele:</span> {app.kebele}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[80px] truncate">
                          <Badge className={getApplicationStatusClass(app.status)}>
                            {app.status || 'New'}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[80px] truncate">{new Date(app.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="max-w-[120px] truncate">
                          <Select 
                            defaultValue={app.status} 
                            onValueChange={(value) => handleUpdateApplicationStatus(app.id, value)}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue placeholder="Update Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="reviewed">Reviewed</SelectItem>
                              <SelectItem value="accepted">Accept</SelectItem>
                              <SelectItem value="rejected">Reject</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* Pagination Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 py-4 mt-4">
                <span className="text-sm text-muted-foreground">
                  Page {appCurrentPage} of {appTotalPages || 1}
                </span>
                <div className="flex gap-2 w-full sm:w-auto justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAppCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={appCurrentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAppCurrentPage(prev => Math.min(prev + 1, appTotalPages || 1))}
                    disabled={appCurrentPage === appTotalPages || appTotalPages === 0}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}