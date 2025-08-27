"use client"

import type React from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/crd"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

import { publicAPI } from "@/lib/api/public"

import { useAuthStore, useGalleryStore, useUIStore } from "@/lib/store"
import { Eye, EyeOff, ImageIcon, Plus, Trash2, Upload } from "lucide-react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export function GalleryManagement() {
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const { user } = useAuthStore()
  const { gallery, addPhoto, deletePhoto, setGallery } = useGalleryStore()
  const { setError, error, setLoading } = useUIStore()

  // --- Initial Data Fetching ---
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedGallery = await publicAPI.getGallery();
        setGallery(fetchedGallery);
      } catch (err) {
        console.error("Failed to fetch gallery:", err);
        setError(err instanceof Error ? err.message : "Failed to load gallery photos.");
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, [setGallery, setLoading, setError]);

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const isPublic = formData.get("isPublic") === "on";
    const photoFile = formData.get("photo") as File;

    if (!photoFile || photoFile.size === 0) {
      setError("Please select an image file to upload.");
      return;
    }
    if (!title || title.trim() === "") {
        setError("Please provide a title for the photo.");
        return;
    }

    try {
      setUploading(true)
      setError(null)

      // Pass object to API function which will create the correct FormData internally
      const newPhoto = await publicAPI.createGalleryPhoto({
        url: photoFile as unknown as string, // TypeScript hack for File object
        caption: description || title, // Required by GalleryPhoto type
        uploadedBy: user?.id ? String(user.id) : "", // Required by GalleryPhoto type
        formTitle: title,
        formDescription: description,
        isPublic: isPublic,
        // API function will handle the correct field naming for the backend
      });

      addPhoto(newPhoto)

      setShowUploadForm(false)
      // Removed: event.currentTarget.reset(); - State reset handles this.

      toast.success("Photo uploaded successfully!");
    } catch (err: any) {
      console.error("Gallery Upload Error:", err);
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || "Failed to upload photo.";
      setError(errorMessage);
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this photo?")) {
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await publicAPI.deletePhoto(id);
      deletePhoto(id);
      toast.success("Photo deleted successfully!");
    } catch (err) {
      console.error("Delete photo error:", err);
      setError(err instanceof Error ? err.message : "Failed to delete photo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gallery Management</h2>
          <p className="text-gray-600">Manage photos in the public gallery</p>
        </div>
        <Dialog open={showUploadForm} onOpenChange={setShowUploadForm}>
          <DialogTrigger asChild>
            <Button
              onClick={() => setShowUploadForm(true)}
              className="ssgi-gradient text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Photo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] ssgi-card">
            <DialogHeader>
              <DialogTitle>Upload New Photo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" placeholder="Enter photo title" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea id="description" name="description" placeholder="Brief description of the photo" rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="photo">Image File</Label>
                <Input id="photo" name="photo" type="file" accept="image/*" required />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="isPublic" name="isPublic" />
                <Label htmlFor="isPublic">Publicly Visible</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowUploadForm(false)}
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading} className="ssgi-gradient text-white">
                  {uploading ? "Uploading..." : "Upload"}
                  <Upload className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gallery.length === 0 ? (
          <Card className="ssgi-card col-span-full">
            <CardContent className="text-center py-12">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No photos in the gallery yet</p>
              <p className="text-sm text-gray-400">Add your first photo to get started</p>
            </CardContent>
          </Card>
        ) : (
          gallery.map((photo) => (
            <Card key={photo.id} className="ssgi-card overflow-hidden">
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                <img src={photo.url || "/placeholder.svg"} alt={photo.caption} className="w-full h-full object-cover" />
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={photo.isPublic ? "default" : "secondary"}>
                    {photo.isPublic ? (
                      <>
                        <Eye className="h-3 w-3 mr-1" />
                        Public
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3 mr-1" />
                        Private
                      </>
                    )}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(photo.id)} disabled={uploading}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm font-medium mb-1">{photo.caption}</p>
                <p className="text-xs text-gray-500">
                  By {photo.uploadedBy} • {new Date(photo.uploadedAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}