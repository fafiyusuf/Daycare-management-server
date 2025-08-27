"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent } from "@/components/ui/crd"
import { useGalleryStore } from "@/lib/store"
import { ImageIcon } from "lucide-react"
import Image from "next/image"

export default function GalleryPage() {
  const { gallery } = useGalleryStore()
  const publicPhotos = gallery.filter((p) => p.isPublic)

  return (
    <MainLayout
      title="SSGI Daycare Gallery"
      subtitle="Explore our space-themed learning environments"
      showUserInfo={false}
    >
      <div className="space-y-6">
        {publicPhotos.length === 0 ? (
          <Card className="ssgi-card">
            <CardContent className="text-center py-12">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No photos available</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicPhotos.map((photo) => (
              <Card key={photo.id} className="ssgi-card overflow-hidden">
                <div className="relative w-full h-64">
                  <Image
                    src={photo.url || "/placeholder.svg"}
                    alt={photo.caption}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={true}
                  />
                </div>
                <CardContent className="p-4">
                  <p className="text-sm font-medium mb-1">{photo.caption}</p>
                  <p className="text-xs text-gray-500">
                    {photo.uploadedBy}  {new Date(photo.uploadedAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
