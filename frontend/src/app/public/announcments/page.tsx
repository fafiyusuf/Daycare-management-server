"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/crd"
import { useAnnouncementStore } from "@/lib/store"
import { Calendar, Megaphone } from "lucide-react"

export default function AnnouncementsPage() {
  const { announcements } = useAnnouncementStore()
  const publicAnnouncements = announcements.filter((a) => a.isPublic)

  return (
    <MainLayout
      title="SSGI Daycare Announcements"
      subtitle="Stay updated with our latest news and events"
      showUserInfo={false}
    >
      <div className="space-y-6">
        {publicAnnouncements.length === 0 ? (
          <Card className="ssgi-card">
            <CardContent className="text-center py-12">
              <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No announcements available</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {publicAnnouncements
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((announcement) => (
                <Card key={announcement.id} className="ssgi-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Megaphone className="h-5 w-5 text-blue-500" />
                        <CardTitle className="text-xl">{announcement.title}</CardTitle>
                      </div>
                      <Badge variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(announcement.date).toLocaleDateString()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4 whitespace-pre-wrap">{announcement.content}</p>
                    <div className="flex items-center justify-end text-sm text-gray-500">
                      <span>Published {new Date(announcement.date).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
