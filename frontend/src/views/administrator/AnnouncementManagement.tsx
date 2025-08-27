"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/crd"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

// Import decoupled admin API functions from the new admin.ts file
import {
    createAdminAnnouncement,
    deleteAdminAnnouncement,
    getAdminAnnouncements,
    updateAdminAnnouncement,
} from "@/lib/api/admin"

import type { Announcement } from "@/lib/store"
import { useAnnouncementStore, useAuthStore, useUIStore } from "@/lib/store"
import { announcementSchema } from "@/lib/validationSchemas"
import { ErrorMessage, Field, Form, Formik } from "formik"

import { Calendar, Edit, Eye, EyeOff, Megaphone, Plus, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"


interface AnnouncementFormValues {
  title: string
  content: string
  date: string // This will be sent as 'created_at' to backend
  author: string
  isPublic: boolean
}

export function AnnouncementManagement() {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { user } = useAuthStore()
  const { announcements, setAnnouncements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useAnnouncementStore()
  const { setError, error, setLoading } = useUIStore()

  const initialValues: AnnouncementFormValues = {
    title: "",
    content: "",
    date: new Date().toISOString().split("T")[0], // Default to today's date (YYYY-MM-DD)
    author: user?.first_name || "Admin", // Default author to current user's name
    isPublic: true,
  }

  // --- Data Fetching (Admin Announcements) ---
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        setError(null);
        // Use the decoupled admin API function to fetch announcements
        // The getAdminAnnouncements function in admin.ts now handles the .results access.
        const fetchedAnnouncements = await getAdminAnnouncements(); //
        setAnnouncements(fetchedAnnouncements);
      } catch (err) {
        console.error("Failed to fetch admin announcements:", err);
        setError(err instanceof Error ? err.message : "Failed to load announcements.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, [setAnnouncements, setLoading, setError]);

  const handleSubmit = async (values: AnnouncementFormValues, { resetForm }: any) => {
    try {
      setLoading(true);
      setError(null);

      // Prepare data for backend. Note the mapping from 'date' (frontend) to 'created_at' (backend)
      const dataToSend = {
        title: values.title,
        content: values.content,
        created_at: values.date, // Send frontend 'date' as backend 'created_at'
        author_name: values.author,
        is_public: values.isPublic,
      };

      if (editingId) {
        // Use the decoupled admin API function for update
        const updated = await updateAdminAnnouncement(editingId, dataToSend); //
        updateAnnouncement(editingId, updated);
        toast.success("Announcement updated successfully!");
      } else {
        // Use the decoupled admin API function for create
        const newAnnouncement = await createAdminAnnouncement(dataToSend); //
        addAnnouncement(newAnnouncement);
        toast.success("Announcement posted successfully!");
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
    } catch (err: any) {
      console.error("Announcement submission error:", err);
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || "Failed to save announcement.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (announcement: Announcement) => {
    setEditingId(announcement.id);
    setShowForm(true);
    // Formik's enableReinitialize will handle setting initialValues based on editingId
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) {
      return;
    }
    try {
      setLoading(true);
      setError(null);
      // Use the decoupled admin API function for delete
      await deleteAdminAnnouncement(id); //
      deleteAnnouncement(id);
      toast.success("Announcement deleted successfully!");
    } catch (err) {
      console.error("Delete announcement error:", err);
      setError(err instanceof Error ? err.message : "Failed to delete announcement.");
    } finally {
      setLoading(false);
    }
  }

  const sortedAnnouncements = [...announcements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 overflow-x-hidden"> {/* Added responsive padding and overflow-x-hidden for general container */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6"> {/* Responsive layout for header */}
        <div className="mb-4 sm:mb-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Announcements</h2> {/* Responsive text size */}
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">Manage school announcements for parents and staff</p> {/* Responsive text size */}
        </div>
        {!showForm && (
          <Button onClick={() => { setShowForm(true); setEditingId(null); }} className="ssgi-gradient text-white flex-shrink-0  sm:w-auto"> {/* Full width on small screens, auto on larger */}
            <Plus className="h-4 w-4 mr-2" />
            Create Announcement
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6"> {/* Added margin-bottom */}
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showForm && (
        <Card className="ssgi-card p-4 sm:p-6 shadow-lg mb-6"> {/* Responsive padding, added margin-bottom */}
          <CardHeader className="pb-4"> {/* Adjusted padding */}
            <CardTitle className="text-xl sm:text-2xl">{editingId ? "Edit Announcement" : "New Announcement"}</CardTitle> {/* Responsive text size */}
          </CardHeader>
          <CardContent>
            <Formik
              initialValues={editingId ? announcements.find(ann => ann.id === editingId) || initialValues : initialValues}
              validationSchema={announcementSchema}
              onSubmit={handleSubmit}
              enableReinitialize // Important for updating initialValues when editingId changes
            >
              {({ isSubmitting, setFieldValue, values }) => (
                <Form className="space-y-4 sm:space-y-6"> {/* Responsive spacing */}
                  <div>
                    <Label htmlFor="title" className="mb-1 block">Title</Label> {/* Added block for better spacing */}
                    <Field as={Input} id="title" name="title" placeholder="Announcement title" className="w-full" />
                    <ErrorMessage name="title" component="div" className="text-red-500 text-sm mt-1" /> {/* Added margin-top */}
                  </div>
                  <div>
                    <Label htmlFor="content" className="mb-1 block">Content</Label>
                    <Field as={Textarea} id="content" name="content" placeholder="Announcement details..." rows={5} className="w-full" />
                    <ErrorMessage name="content" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"> {/* Responsive grid gap */}
                    <div>
                      <Label htmlFor="date" className="mb-1 block">Date</Label>
                      <Field as={Input} id="date" name="date" type="date" className="w-full" />
                      <ErrorMessage name="date" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="author" className="mb-1 block">Author</Label>
                      <Field as={Input} id="author" name="author" placeholder="Author's name" className="w-full" />
                      <ErrorMessage name="author" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 pt-2"> {/* Added padding-top */}
                    <Switch
                      id="isPublic"
                      checked={values.isPublic}
                      onCheckedChange={(checked) => setFieldValue("isPublic", checked)}
                    />
                    <Label htmlFor="isPublic">Publicly Visible</Label>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4"> {/* Responsive button layout and spacing */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => { setShowForm(false); setEditingId(null); }}
                      disabled={isSubmitting}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="ssgi-gradient text-white w-full sm:w-auto">
                      {isSubmitting ? "Saving..." : editingId ? "Update Announcement" : "Post Announcement"}
                      <Megaphone className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {announcements.length === 0 && !error ? (
          <Card className="ssgi-card">
            <CardContent className="text-center py-8">
              <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No announcements posted yet.</p>
              <p className="text-sm text-gray-400">Click "Create Announcement" to add one.</p>
            </CardContent>
          </Card>
        ) : (
          sortedAnnouncements.map((announcement) => (
            <Card key={announcement.id} className="ssgi-card shadow-sm">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-2"> {/* Responsive layout for header */}
                <CardTitle className="text-lg sm:text-xl font-semibold break-words max-w-full"> {/* Responsive text size and word breaking */}
                  {announcement.title}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0 justify-end"> {/* Responsive spacing and wrapping for badges/buttons */}
                  <Badge variant={announcement.isPublic ? "default" : "secondary"} className="flex items-center flex-shrink-0"> {/* Ensure badges don't cause overflow */}
                    {announcement.isPublic ? (
                      <>
                        <Eye className="h-3 w-3 mr-1" />
                        Public
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3 mr-1" />
                        Internal
                      </>
                    )}
                  </Badge>
                  <Badge variant="outline" className="flex items-center flex-shrink-0">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(announcement.date).toLocaleDateString()}
                  </Badge>
                  <Button size="icon" variant="outline" onClick={() => handleEdit(announcement)} className="flex-shrink-0"> {/* Use icon size for smaller buttons */}
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline" onClick={() => handleDelete(announcement.id)} className="flex-shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4 whitespace-pre-wrap text-sm sm:text-base break-words"> {/* Responsive text size and word breaking */}
                  {announcement.content}
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs sm:text-sm text-gray-500 mt-4"> {/* Responsive text size and layout */}
                  <span>By {announcement.author}</span>
                  <span>Published {new Date(announcement.date).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
