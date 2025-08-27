
// components/ChildManager.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/crd";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { childAPI } from "@/lib/api/child";
import type { Family } from "@/lib/api/family";
import { useChildStore, useUserStore } from "@/lib/store";
import { useFamilyStore } from "@/lib/store/familyStore";
import { Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";

interface ChildRegistrationProps {
  onChildRegistered?: () => void;
  onClose?: () => void;
}

export function ChildManager({ onChildRegistered, onClose }: ChildRegistrationProps) {
  const { addChild } = useChildStore();
  const { users, fetchUsers, isLoading: isUsersLoading } = useUserStore();
  const { families, fetchFamilies, isLoading: isFamiliesLoading, addFamily } = useFamilyStore();
  
  const [isFamilyDialogOpen, setIsFamilyDialogOpen] = useState(false);
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
    babysitterId: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

    try {
      // Find the parent and family objects
      const parentUser = parents.find(p => p.id.toString() === formData.parentId);
      const selectedFamily = families.find((f: Family) => f.id.toString() === formData.familyId);
      
      if (!parentUser || !selectedFamily) {
        toast({
          title: "Invalid Selection",
          description: "Please select a valid parent and family.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        parent_ids: [parentUser.id],
        familyId: selectedFamily.id,
        family: selectedFamily, // Add family object as required
        medicalInfo: formData.medicalInfo,
        allergies: formData.allergies,
        babysitterId: formData.babysitterId || null
      };

      const newChild = await childAPI.createChild(payload);
      addChild(newChild);
      
      setFormData({
        firstName: "", lastName: "", dateOfBirth: "", parentId: "", familyId: "",
        medicalInfo: "", allergies: "", emergencyContact: "", babysitterId: ""
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

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? "Registering..." : "Register Child"}
        </Button>
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
    </>
  );
}