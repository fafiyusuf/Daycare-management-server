"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/crd"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createAdminAnnouncement, deleteAdminAnnouncement, updateAdminAnnouncement } from "@/lib/api/admin"
import { useAnnouncementStore, useAuthStore, useUIStore } from "@/lib/store"
import { announcementSchema } from "@/lib/validationSchemas"
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from "formik"
import { Calendar, Edit, Megaphone, Plus, Trash2 } from "lucide-react"
import { useState } from "react"

interface AnnouncementFormValues {
  title: string
  content: string
  date: string
  author: string
}

export function AnnouncementManager() {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { user } = useAuthStore()
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useAnnouncementStore()
  const { setLoading, setError, error } = useUIStore()

  const handleSubmit = async (values: AnnouncementFormValues, { resetForm }: FormikHelpers<AnnouncementFormValues>) => {
    try {
      setLoading(true)
      setError(null)
      if (editingId) {
        await updateAdminAnnouncement(editingId, {
          title: values.title,
          content: values.content,
          created_at: values.date,
          author_name: values.author,
          is_public: true,
        })
        updateAnnouncement(editingId, values)
        setEditingId(null)
      } else {
        const newAnnouncement = await createAdminAnnouncement({
          title: values.title,
          content: values.content,
          created_at: values.date,
          author_name: values.author,
          is_public: true,
        })
        addAnnouncement(newAnnouncement)
      }
      resetForm()
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save announcement")
    } finally {
      setLoading(false)
    }
  }

  // Use correct type for announcement
  const handleEdit = (announcement: any) => {
    setEditingId(announcement.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        setLoading(true)
  // await adminPublicAPI.deleteAnnouncement(id) // removed, use deleteAdminAnnouncement only
  await deleteAdminAnnouncement(id)
        deleteAnnouncement(id)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete announcement")
      } finally {
        setLoading(false)
      }
    }
  }

  const editingAnnouncement = editingId ? announcements.find((a) => a.id === editingId) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Announcement Management</h2>
          <p className="text-gray-600">Create and manage public announcements</p>
        </div>
        <Button
          onClick={() => {
            setEditingId(null)
            setShowForm(true)
          }}
          className="ssgi-gradient text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Announcement
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Announcement Form */}
      {showForm && (
        <Card className="ssgi-card">
          <CardHeader>
            <CardTitle>{editingId ? "Edit Announcement" : "Create New Announcement"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Formik
              initialValues={{
                title: editingAnnouncement?.title || "",
                content: editingAnnouncement?.content || "",
                date: editingAnnouncement?.date || new Date().toISOString().split("T")[0],
                author: editingAnnouncement?.author || `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
              }}
              validationSchema={announcementSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Field as={Input} id="title" name="title" placeholder="Enter announcement title" />
                      <ErrorMessage name="title" component="div" className="text-red-500 text-sm" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Field as={Input} id="date" name="date" type="date" />
                      <ErrorMessage name="date" component="div" className="text-red-500 text-sm" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="author">Author</Label>
                    <Field as={Input} id="author" name="author" placeholder="Author name" />
                    <ErrorMessage name="author" component="div" className="text-red-500 text-sm" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Field
                      as={Textarea}
                      id="content"
                      name="content"
                      placeholder="Enter announcement content..."
                      rows={4}
                    />
                    <ErrorMessage name="content" component="div" className="text-red-500 text-sm" />
                  </div>

                  <div className="flex space-x-2">
                    <Button type="submit" disabled={isSubmitting} className="ssgi-gradient text-white">
                      {isSubmitting ? (editingId ? "Updating..." : "Creating...") : editingId ? "Update" : "Create"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false)
                        setEditingId(null)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>
      )}

      {/* Announcements List */}
      <div className="grid gap-6">
        {announcements.length === 0 ? (
          <Card className="ssgi-card">
            <CardContent className="text-center py-12">
              <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No announcements yet</p>
              <p className="text-sm text-gray-400">Create your first announcement to get started</p>
            </CardContent>
          </Card>
        ) : (
          announcements
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((announcement) => (
              <Card key={announcement.id} className="ssgi-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Megaphone className="h-5 w-5 text-blue-500" />
                      <CardTitle className="text-xl">{announcement.title}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(announcement.date).toLocaleDateString()}
                      </Badge>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(announcement)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(announcement.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4 whitespace-pre-wrap">{announcement.content}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
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
