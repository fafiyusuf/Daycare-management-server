"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/crd"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { childAPI } from "@/lib/api/index"
import { useAuthStore, useChildStore, useUIStore } from "@/lib/store"
import type { BackendChild } from "@/lib/store/childStore"
import { differenceInYears } from 'date-fns'
import { AlertTriangle, Baby, FileImage, FileText, Save, Upload, X } from "lucide-react"
import { useEffect, useState } from "react"

export function ChildProfile() {
  const [editingChild, setEditingChild] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<{
    [childId: string]: {
      [field: string]: File | undefined;
    }
  }>({})
  const { user } = useAuthStore()
  const { children, fetchChildren, updateChild } = useChildStore()
  const { setLoading, setError, error } = useUIStore()

  // Fetch children data when component mounts
  useEffect(() => {
    if (user) {
      fetchChildren();
    }
  }, [user, fetchChildren]);

  const myChildren = children.filter((child) => child.parents?.some((p) => p.id === user?.id));

  const isProfileComplete = (child: BackendChild) => {
    return child.first_name && child.last_name && child.date_of_birth && child.emergency_contact && 
           child.birth_certificate && child.vaccination_card && child.profile_picture;
  };

  const handleFileChange = (childId: string, field: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFiles(prev => ({
        ...prev,
        [childId]: {
          ...prev[childId],
          [field]: file
        }
      }));
    }
  };

  const handleFileUpload = async (childId: string, field: string) => {
    const file = selectedFiles[childId]?.[field];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append(field, file);

      // Debug logging
      console.log(`Uploading ${field} for child ${childId}:`, file);
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      // Just update the document - no need to update child again
      const updatedChild = await childAPI.updateChildDocuments(parseInt(childId), formData);
      
      // Don't call updateChild again with the returned data as it can cause conflicts
      // This was causing the 400 error:
      // updateChild(parseInt(childId), updatedChild as Partial<BackendChild>);
      
      // The component will refresh documents from fetchChildren when needed
      setSelectedFiles(prev => ({
        ...prev,
        [childId]: {
          ...prev[childId],
          [field]: undefined
        }
      }));
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const clearSelectedFile = (childId: string, field: string) => {
    setSelectedFiles(prev => ({
      ...prev,
      [childId]: {
        ...prev[childId],
        [field]: undefined
      }
    }));
  };

  const getSelectedFileName = (childId: string, field: string) => {
    return selectedFiles[childId]?.[field]?.name;
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Child Profile Management</h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Complete your child's profile by uploading required documents
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {myChildren.length === 0 ? (
        <Card className="ssgi-card">
          <CardContent className="text-center py-12">
            <Baby className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No children registered</p>
            <p className="text-sm text-gray-400">Contact the receptionist to register your child</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {myChildren.map((child) => {
            const name = `${child.first_name} ${child.last_name}`;
            const age = child.date_of_birth ? differenceInYears(new Date(), new Date(child.date_of_birth)) : '';
            const profileComplete = isProfileComplete(child);
            return (
              <Card key={child.id} className="ssgi-card">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-400 to-blue-600 rounded-full flex items-center justify-center">
                        <Baby className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-base sm:text-lg">{name}</CardTitle>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="text-xs sm:text-sm">Age {age}</Badge>
                          <Badge variant={profileComplete ? "default" : "outline"} className="text-xs sm:text-sm">
                            {profileComplete ? "Complete" : "Incomplete"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() => setEditingChild(editingChild === child.id.toString() ? null : child.id.toString())}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {editingChild === child.id.toString() ? "Cancel" : "Upload Documents"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {!profileComplete && editingChild !== child.id.toString() && (
                    <Alert className="mb-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        Please complete your child's profile by uploading the required documents.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* View-only Basic Information */}
                  <div className="space-y-4 mb-6">
                    <h3 className="text-base sm:text-lg font-semibold">Basic Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs sm:text-sm font-medium text-gray-600">First Name</Label>
                        <p className="text-xs sm:text-sm">{child.first_name}</p>
                      </div>
                      <div>
                        <Label className="text-xs sm:text-sm font-medium text-gray-600">Last Name</Label>
                        <p className="text-xs sm:text-sm">{child.last_name}</p>
                      </div>
                      <div>
                        <Label className="text-xs sm:text-sm font-medium text-gray-600">Date of Birth</Label>
                        <p className="text-xs sm:text-sm">{child.date_of_birth}</p>
                      </div>
                      <div>
                        <Label className="text-xs sm:text-sm font-medium text-gray-600">Emergency Contact</Label>
                        <p className="text-xs sm:text-sm">{child.emergency_contact}</p>
                      </div>
                      <div>
                        <Label className="text-xs sm:text-sm font-medium text-gray-600">Medical Information</Label>
                        <p className="text-xs sm:text-sm">{child.medical_info || "No medical information provided"}</p>
                      </div>
                      <div>
                        <Label className="text-xs sm:text-sm font-medium text-gray-600">Allergies</Label>
                        <p className="text-xs sm:text-sm">{child.allergies || "No allergies recorded"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Document Upload Section */}
                  {editingChild === child.id.toString() && (
                    <div className="space-y-4">
                      <h3 className="text-base sm:text-lg font-semibold">Required Documents</h3>
                      
                      {/* Profile Picture Upload */}
                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-medium">Profile Picture</Label>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          {child.profile_picture ? (
                            <img 
                              src={child.profile_picture} 
                              alt="Profile" 
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                              <FileImage className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(String(child.id), 'profile_picture', e)}
                              disabled={uploading}
                              className="text-xs sm:text-sm"
                            />
                            {getSelectedFileName(String(child.id), 'profile_picture') && (
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                                <span className="text-xs sm:text-sm text-blue-600 flex-1 truncate">
                                  Selected: {getSelectedFileName(String(child.id), 'profile_picture')}
                                </span>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => clearSelectedFile(String(child.id), 'profile_picture')}
                                    disabled={uploading}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleFileUpload(String(child.id), 'profile_picture')}
                                    disabled={uploading}
                                  >
                                    <Save className="h-3 w-3 mr-1" />
                                    Upload
                                  </Button>
                                </div>
                              </div>
                            )}
                            <p className="text-xs text-gray-500 mt-1">Upload a clear photo of your child</p>
                          </div>
                        </div>
                      </div>

                      {/* Birth Certificate Upload */}
                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-medium">Birth Certificate</Label>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          {child.birth_certificate ? (
                            <div className="flex items-center space-x-2">
                              <FileText className="h-6 w-6 text-green-500" />
                              <span className="text-xs sm:text-sm text-green-600">Uploaded</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <FileText className="h-6 w-6 text-gray-400" />
                              <span className="text-xs sm:text-sm text-gray-500">Not uploaded</span>
                            </div>
                          )}
                          <div className="flex-1">
                            <Input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileChange(String(child.id), 'birth_certificate', e)}
                              disabled={uploading}
                              className="text-xs sm:text-sm"
                            />
                            {getSelectedFileName(String(child.id), 'birth_certificate') && (
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                                <span className="text-xs sm:text-sm text-blue-600 flex-1 truncate">
                                  Selected: {getSelectedFileName(String(child.id), 'birth_certificate')}
                                </span>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => clearSelectedFile(String(child.id), 'birth_certificate')}
                                    disabled={uploading}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleFileUpload(String(child.id), 'birth_certificate')}
                                    disabled={uploading}
                                  >
                                    <Save className="h-3 w-3 mr-1" />
                                    Upload
                                  </Button>
                                </div>
                              </div>
                            )}
                            <p className="text-xs text-gray-500 mt-1">Upload birth certificate (PDF or image)</p>
                          </div>
                        </div>
                      </div>

                      {/* Vaccination Card Upload */}
                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-medium">Vaccination Card</Label>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          {child.vaccination_card ? (
                            <div className="flex items-center space-x-2">
                              <FileText className="h-6 w-6 text-green-500" />
                              <span className="text-xs sm:text-sm text-green-600">Uploaded</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <FileText className="h-6 w-6 text-gray-400" />
                              <span className="text-xs sm:text-sm text-gray-500">Not uploaded</span>
                            </div>
                          )}
                          <div className="flex-1">
                            <Input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileChange(String(child.id), 'vaccination_card', e)}
                              disabled={uploading}
                              className="text-xs sm:text-sm"
                            />
                            {getSelectedFileName(String(child.id), 'vaccination_card') && (
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                                <span className="text-xs sm:text-sm text-blue-600 flex-1 truncate">
                                  Selected: {getSelectedFileName(String(child.id), 'vaccination_card')}
                                </span>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => clearSelectedFile(String(child.id), 'vaccination_card')}
                                    disabled={uploading}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleFileUpload(String(child.id), 'vaccination_card')}
                                    disabled={uploading}
                                  >
                                    <Save className="h-3 w-3 mr-1" />
                                    Upload
                                  </Button>
                                </div>
                              </div>
                            )}
                            <p className="text-xs text-gray-500 mt-1">Upload vaccination card (PDF or image)</p>
                          </div>
                        </div>
                      </div>

                      {uploading && (
                        <div className="text-center py-2">
                          <p className="text-xs sm:text-sm text-blue-600">Uploading document...</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Document Status Summary */}
                  {editingChild !== child.id.toString() && (
                    <div className="space-y-3">
                      <h3 className="text-base sm:text-lg font-semibold">Document Status</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${child.profile_picture ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-xs sm:text-sm">Profile Picture</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${child.birth_certificate ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-xs sm:text-sm">Birth Certificate</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${child.vaccination_card ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-xs sm:text-sm">Vaccination Card</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  )
}