// components/ChildRegistration.tsx
"use client";

import { IncidentsTable } from "@/components/admin/IncidentsTable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/crd";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { childAPI } from "@/lib/api/child";
import { Family } from "@/lib/api/family";
import { useChildStore, useUserStore } from "@/lib/store";
import type { BackendChild } from "@/lib/store/childStore";
import { useFamilyStore } from "@/lib/store/familyStore";
import { useIncidentStore } from "@/lib/store/incidentStore";
import { AlertCircle, Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";

interface ChildRegistrationProps {
  onChildRegistered?: () => void;
  onClose?: () => void;
}

export function ChildRegistration({ onChildRegistered, onClose }: ChildRegistrationProps) {
  const { addChild } = useChildStore();
  const { users, fetchUsers, isLoading: isUsersLoading } = useUserStore();
  const { families, fetchFamilies, isFamiliesLoading, addFamily } = useFamilyStore();
  
  const [isFamilyDialogOpen, setIsFamilyDialogOpen] = useState(false);
  const [isIncidentsDialogOpen, setIsIncidentsDialogOpen] = useState(false);
  const [newFamily, setNewFamily] = useState({
    name: '',
    address: '',
    emergency_contact: ''
  });

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    parentId: "",
    familyId: "",
    medicalInfo: "",
    allergies: "",
    emergencyContact: "",
    babysitterId: "",
    profilePicture: null as File | null // Added profilePicture to state
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Incidents state
  const { incidents, isLoading: isIncidentsLoading, fetchIncidents, count } = useIncidentStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [childNameMap, setChildNameMap] = useState(new Map<string, string>());

  const calculateAgeFromDate = (dateString: string): number => {
    if (!dateString) return 0;
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    Promise.all([fetchUsers(), fetchFamilies()]);
  }, [fetchUsers, fetchFamilies]);

  // Fetch incidents when the incidents dialog is opened
  useEffect(() => {
    if (isIncidentsDialogOpen) {
      fetchIncidents();
      
      // Create a map of child IDs to names for the incidents table
      const nameMap = new Map<string, string>();
      const { children } = useChildStore.getState();
      children.forEach(child => {
        nameMap.set(child.id.toString(), `${child.first_name} ${child.last_name}`);
      });
      setChildNameMap(nameMap);
    }
  }, [isIncidentsDialogOpen, fetchIncidents, currentPage]);

  // Handle incidents table pagination
  const handleNextPage = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  // Handle incident deletion (placeholder)
  const handleDeleteIncident = (id: string | number) => {
    // Add delete functionality here
    toast({
      title: "Not Implemented",
      description: "Incident deletion functionality is not yet implemented.",
    });
  };

  // Update emergencyContact whenever familyId changes
  useEffect(() => {
    if (formData.familyId) {
      const selectedFamily = families.find((f: Family) => f.id === parseInt(formData.familyId));
      if (selectedFamily) {
        setFormData(prev => ({
          ...prev,
          emergencyContact: selectedFamily.emergency_contact
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        emergencyContact: ""
      }));
    }
  }, [formData.familyId, families]);

  const parents = Array.isArray(users)
    ? users.filter(u => u.role?.toLowerCase() === "parent")
    : [];
  const babysitters = Array.isArray(users)
    ? users.filter(u => u.role?.toLowerCase() === "babysitter" && u.is_active_staff)
    : [];

  const handleFamilySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const createdFamily = await addFamily(newFamily);
      setFormData(prev => ({ ...prev, familyId: createdFamily.id.toString() }));
      setNewFamily({ name: '', address: '', emergency_contact: '' });
      setIsFamilyDialogOpen(false);
      toast({
        title: "Family Added!",
        description: `Family "${createdFamily.name}" has been successfully added.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add new family.",
        variant: "destructive",
      });
    }
  };

  // Modified handleChange to handle file inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'file') {
      const fileInput = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: fileInput.files?.[0] || null,
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.parentId || !formData.familyId) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // --- START DEBUGGING LOGS ---
    console.log("------------------- Child Registration Submit Debugging -------------------");
    console.log("Current formData:", formData);
    console.log("Parents available in store (filtered):", parents);
    console.log("Families available in store:", families);
    // --- END DEBUGGING LOGS ---

    try {
      const parentUser = parents.find(p => p.id.toString() === formData.parentId);
      const selectedFamily = families.find(f => f.id.toString() === formData.familyId);
      
      // --- START DEBUGGING LOGS ---
      console.log("Attempting to find parent with ID:", formData.parentId);
      console.log("Found parentUser:", parentUser);
      if (parentUser) {
        console.log("parentUser.id (found):", parentUser.id);
      } else {
        console.log("parentUser was NOT found based on formData.parentId.");
      }
      console.log("Attempting to find family with ID:", formData.familyId);
      console.log("Found selectedFamily:", selectedFamily);
      // --- END DEBUGGING LOGS ---

      if (!parentUser || !selectedFamily) {
        toast({
          title: "Invalid Selection",
          description: "Please select a valid parent and family.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      const babysitterUser = babysitters.find(b => b.id.toString() === formData.babysitterId) || null;

      // Build object matching CreateChildPayload (childAPI will translate to FormData internally)
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        parent_ids: [parentUser.id],
        family: { id: selectedFamily.id, emergency_contact: selectedFamily.emergency_contact },
        medicalInfo: formData.medicalInfo || '',
        allergies: formData.allergies || '',
        babysitter: babysitterUser,
        profilePicture: formData.profilePicture,
      };

      // Debug
      console.log("Payload (CreateChildPayload) -> childAPI.createChild:", payload);

      const newChild = await childAPI.createChild(payload as any);
      
      // --- START DEBUGGING LOGS ---
      console.log("Response from childAPI.createChild:", newChild);
      if (newChild && newChild.parents) {
        console.log("Parents array in returned newChild object:", newChild.parents);
      } else {
        console.log("newChild or newChild.parents property is missing/empty in the response.");
      }
      console.log("------------------- Child Registration Submit Debugging END -------------------");
      // --- END DEBUGGING LOGS ---

      addChild(newChild as unknown as BackendChild);
      
      // Reset form including file input
      setFormData({
        firstName: "", lastName: "", dateOfBirth: "", parentId: "", familyId: "",
        medicalInfo: "", allergies: "", emergencyContact: "", babysitterId: "",
        profilePicture: null // Reset file input
      });
      
      if (onChildRegistered) {
        onChildRegistered();
      }
      if (onClose) {
        onClose();
      }
      
      toast({
        title: "Child Registered!",
        description: `${newChild.first_name} ${newChild.last_name} has been successfully registered.`,
      });
    } catch (error) {
      console.error('Child registration failed:', error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
      console.log("------------------- Child Registration Submit Debugging END (with error) -------------------");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedFamily = formData.familyId ? families.find((f: Family) => f.id === parseInt(formData.familyId)) : null;

  if (isUsersLoading || isFamiliesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto max-h-[70vh]">
        {/* Child Information */}
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Child Information</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} required />
            </div>
            {formData.dateOfBirth && (
              <div>
                <Label>Age</Label>
                <div className="mt-2 text-sm text-gray-500">
                  {calculateAgeFromDate(formData.dateOfBirth)} years old
                </div>
              </div>
            )}
            {/* Added Profile Picture Input */}
            <div>
              <Label htmlFor="profilePicture">Profile Picture (Optional)</Label>
              <Input
                id="profilePicture"
                name="profilePicture"
                type="file" // Set type to file
                accept="image/*" // Restrict to image files
                onChange={handleChange}
              />
            </div>
          </div>
        </Card>

        {/* Parent and Family Selection */}
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Parent & Family</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="familyId">Family</Label>
              <div className="flex gap-2 items-center">
                <select id="familyId" name="familyId" value={formData.familyId} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" required>
                  <option value="">Select a family</option>
                  {families.map((family: Family) => (
                    <option key={family.id} value={family.id}>{family.name}</option>
                  ))}
                </select>
                <Button type="button" variant="outline" size="icon" onClick={() => setIsFamilyDialogOpen(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="parentId">Parent</Label>
              <select id="parentId" name="parentId" value={formData.parentId} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" required>
                <option value="">Select a parent</option>
                {parents.map(parent => (
                  <option key={parent.id} value={parent.id}>{parent.first_name} {parent.last_name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="babysitterId">Assigned Babysitter (Optional)</Label>
              <select id="babysitterId" name="babysitterId" value={formData.babysitterId} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="">Select a babysitter</option>
                {babysitters.map(babysitter => (
                  <option key={babysitter.id} value={babysitter.id}>{babysitter.first_name} {babysitter.last_name}</option>
                ))}
              </select>
            </div>
            {selectedFamily && (
              <div>
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  name="emergencyContact"
                  value={selectedFamily.emergency_contact}
                  readOnly
                  className="bg-gray-100"
                />
              </div>
            )}
          </div>
        </Card>

        {/* Medical Information */}
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Medical & Allergy Information</h2>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="medicalInfo">Medical Info (Optional)</Label>
              <Textarea id="medicalInfo" name="medicalInfo" value={formData.medicalInfo} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="allergies">Allergies (Optional)</Label>
              <Textarea id="allergies" name="allergies" value={formData.allergies} onChange={handleChange} />
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Registering..." : "Register Child"}
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            className="flex items-center" 
            onClick={() => setIsIncidentsDialogOpen(true)}
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            View Incidents
          </Button>
        </div>
      </form>

      {/* Add Family Dialog */}
      <Dialog open={isFamilyDialogOpen} onOpenChange={setIsFamilyDialogOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto bg-background">
          <DialogHeader>
            <DialogTitle>Add New Family</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFamilySubmit} className="grid gap-4 py-4">
                         <div className="grid grid-cols-4 items-center gap-4">
               <Label htmlFor="newFamilyName" className="text-right">Name</Label>
               <Input id="newFamilyName" value={newFamily.name} onChange={(e) => setNewFamily({ ...newFamily, name: e.target.value })} className="col-span-3" required />
             </div>
             <div className="grid grid-cols-4 items-center gap-4">
               <Label htmlFor="newFamilyAddress" className="text-right">Address</Label>
               <Input id="newFamilyAddress" value={newFamily.address} onChange={(e) => setNewFamily({ ...newFamily, address: e.target.value })} className="col-span-3" required />
             </div>
             <div className="grid grid-cols-4 items-center gap-4">
               <Label htmlFor="newFamilyEmergencyContact" className="text-right">Emergency Contact</Label>
               <Input id="newFamilyEmergencyContact" value={newFamily.emergency_contact} onChange={(e) => setNewFamily({ ...newFamily, emergency_contact: e.target.value })} className="col-span-3" required />
             </div>
            <Button type="submit" disabled={isLoading}>Save Family</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Incidents Table Dialog */}
      <Dialog open={isIncidentsDialogOpen} onOpenChange={setIsIncidentsDialogOpen}>
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
                currentPage={currentPage}
                totalCount={count}
                hasNextPage={currentPage * 10 < count}
                hasPreviousPage={currentPage > 1}
                onDelete={handleDeleteIncident}
                onNextPage={handleNextPage}
                onPreviousPage={handlePreviousPage}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}