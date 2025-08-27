import type { GalleryPhoto } from "@/lib/types"
import toast from "react-hot-toast"
import { create } from "zustand"

interface GalleryState {
  gallery: GalleryPhoto[]
  setGallery: (gallery: GalleryPhoto[]) => void
  addPhoto: (photo: GalleryPhoto) => void
  deletePhoto: (id: string) => void
}

export const useGalleryStore = create<GalleryState>()((set) => ({
  gallery: [],
  setGallery: (gallery) => set({ gallery }),
  addPhoto: (photo) => {
    set((state) => ({ gallery: [...state.gallery, photo] }))
    toast.success("Photo added to gallery!")
  },
  deletePhoto: (id) => set((state) => ({ gallery: state.gallery.filter((photo) => photo.id !== id) })),
})) 