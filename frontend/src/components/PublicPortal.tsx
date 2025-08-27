"use client"

import { PublicApplicationForm } from "@/components/PublicApplicationForm"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/crd"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAnnouncementStore, useGalleryStore, useStaffProfileStore, useUserStore } from "@/lib/store"
import useEmblaCarousel from 'embla-carousel-react'
import { Calendar, ChevronLeft, ChevronRight, ClockIcon, Globe, Mail, MapPinIcon, PhoneIcon, Rocket, RocketIcon, Star, Users } from "lucide-react"
import Image from "next/image"
import { useCallback, useEffect, useState } from "react"

export function PublicPortal() {
  const { announcements } = useAnnouncementStore()
  const { gallery } = useGalleryStore()
  const { staffProfiles } = useStaffProfileStore()
  const { users } = useUserStore()
  const [aboutOpen, setAboutOpen] = useState(false)
  const [applyOpen, setApplyOpen] = useState(false)
  
  // Debug staff profiles
  useEffect(() => {
    console.log('Staff Profiles in PublicPortal:', staffProfiles);
    console.log('First staff profile:', staffProfiles[0]);
    console.log('Staff profile properties:', staffProfiles[0] ? Object.keys(staffProfiles[0]) : []);
    console.log('Users in PublicPortal:', users);
    
    // Debug profile pictures
    if (staffProfiles.length > 0) {
      staffProfiles.forEach(staff => {
        const user = staff.user || users.find(u => String(u.id) === String(staff.userId));
        if (user) {
          console.log(`Staff ${user.first_name} ${user.last_name} profile picture:`, user.profile_picture);
        }
      });
    }
  }, [staffProfiles, users]);
  
  // Refs for carousels
  const [announcementsViewportRef, emblaApi] = useEmblaCarousel({ 
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true
  })
  const [teamViewportRef, teamEmblaApi] = useEmblaCarousel({ 
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true
  })
  // Hero carousel
  const [heroViewportRef, heroEmblaApi] = useEmblaCarousel({ loop: true })
  const heroImages = [
    "/bg-img.jpeg",
    "/bg-img2.jpeg",
    "/bg-img3.jpeg",
    "/bg-img1.jpeg",
  ]
  
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [teamSelectedIndex, setTeamSelectedIndex] = useState(0)
  const [slidesInView, setSlidesInView] = useState(4) // Default for desktop
  const [teamSlidesInView, setTeamSlidesInView] = useState(4) // Default for desktop
  const [heroSelectedIndex, setHeroSelectedIndex] = useState(0)
  
  const scrollPrev = () => emblaApi?.scrollPrev()
  const scrollNext = () => emblaApi?.scrollNext()
  // Team carousel arrows (not rendered currently)
  const scrollHeroPrev = () => heroEmblaApi?.scrollPrev()
  const scrollHeroNext = () => heroEmblaApi?.scrollNext()
  
  // Calculate slides in view based on screen size
  useEffect(() => {
    const updateSlidesInView = () => {
      const width = window.innerWidth
      if (width < 640) {
        setSlidesInView(1)
        setTeamSlidesInView(1)
      } else if (width < 1024) {
        setSlidesInView(2)
        setTeamSlidesInView(2)
      } else {
        setSlidesInView(3)
        setTeamSlidesInView(4)
      }
    }
    
    updateSlidesInView()
    window.addEventListener('resize', updateSlidesInView)
    return () => window.removeEventListener('resize', updateSlidesInView)
  }, [])
  
  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])
  
  const onTeamSelect = useCallback(() => {
    if (!teamEmblaApi) return
    setTeamSelectedIndex(teamEmblaApi.selectedScrollSnap())
  }, [teamEmblaApi])
  const onHeroSelect = useCallback(() => {
    if (!heroEmblaApi) return
    setHeroSelectedIndex(heroEmblaApi.selectedScrollSnap())
  }, [heroEmblaApi])
  
  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])
  
  useEffect(() => {
    if (!teamEmblaApi) return
    onTeamSelect()
    teamEmblaApi.on('select', onTeamSelect)
    teamEmblaApi.on('reInit', onTeamSelect)
    return () => {
      teamEmblaApi.off('select', onTeamSelect)
      teamEmblaApi.off('reInit', onTeamSelect)
    }
  }, [teamEmblaApi, onTeamSelect])
  
  // Setup hero carousel listeners and autoplay
  useEffect(() => {
    if (!heroEmblaApi) return
    onHeroSelect()
    heroEmblaApi.on('select', onHeroSelect)
    heroEmblaApi.on('reInit', onHeroSelect)
    const id = setInterval(() => {
      heroEmblaApi.scrollNext()
    }, 5000)
    return () => {
      heroEmblaApi.off('select', onHeroSelect)
      heroEmblaApi.off('reInit', onHeroSelect)
      clearInterval(id)
    }
  }, [heroEmblaApi, onHeroSelect])

  return (
    <div className="relative">
     
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image src="/images/ssgi-logo.png" alt="SSGI Logo" width={120} height={60} className="h-12 w-auto" />
              <div>
                <h1 className="text-2xl font-bold text-accent dark:text-primary">SSGI Daycare</h1>
                <p className="text-sm text-muted-foreground">From Earth to Space...</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-accent dark:text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Building tommorow</span>
            </div>
            <div className="flex items-center gap-4">
              {/* Mobile Apply button */}
              <Button size="sm" className="md:hidden" onClick={() => setApplyOpen(true)}>Apply</Button>
              <nav className="hidden md:flex items-center gap-4">
                <button
                  type="button"
                  className="px-3 py-2 text-sm rounded-md text-muted-foreground hover:text-accent dark:hover:text-primary hover:bg-muted/20"
                  onClick={() => setAboutOpen(true)}
                >
                  About
                </button>
                <Button size="sm" onClick={() => setApplyOpen(true)}>Apply</Button>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Image Carousel */}
      <section className="py-6 sm:py-10 md:py-14 px-0">
        <div className="container mx-auto">
          <div className="relative rounded-xl overflow-hidden shadow-lg">
            {/* Carousel viewport */}
            <div className="hero-embla embla" ref={heroViewportRef}>
              <div className="embla__container">
                {heroImages.map((src, index) => (
                  <div key={src} className="embla__slide">
                    <div className="relative h-[360px] sm:h-[420px] md:h-[520px] lg:h-[600px]">
                      <Image
                        src={src}
                        alt={`SSGI Daycare - Slide ${index + 1}`}
                        fill
                        priority={index === 0}
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Overlay content */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              <h2 className="pointer-events-auto text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-md">
                Welcome to SSGI Daycare
              </h2>
              <p className="pointer-events-auto text-base sm:text-lg md:text-xl text-white/90 mb-6 max-w-3xl mx-auto drop-shadow">
                Where young minds explore the wonders of space science while receiving exceptional childcare. Our
                space-themed learning environment nurtures curiosity and discovery.
              </p>
              <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2">
                <Badge variant="secondary" className="bg-white/90 text-gray-900">
                  <Star className="h-4 w-4 mr-2 text-yellow-600" />
                  Space-Themed Learning
                </Badge>
                <Badge variant="secondary" className="bg-white/90 text-gray-900">
                  <Users className="h-4 w-4 mr-2 text-yellow-600" />
                  Expert Caregivers
                </Badge>
                {/* <Badge variant="secondary" className="bg-white/90 text-gray-900">
                  <Globe className="h-4 w-4 mr-2 text-yellow-600" />
                  STEM Education
                </Badge> */}
              </div>
            </div>

            {/* Navigation arrows */}
            {heroImages.length > 1 && (
              <>
                <button
                  onClick={scrollHeroPrev}
                  aria-label="Previous slide"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/80 p-2 rounded-full shadow hover:bg-white dark:hover:bg-gray-700 transition"
                >
                  <ChevronLeft className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                </button>
                <button
                  onClick={scrollHeroNext}
                  aria-label="Next slide"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/80 p-2 rounded-full shadow hover:bg-white dark:hover:bg-gray-700 transition"
                >
                  <ChevronRight className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                </button>
              </>
            )}

            {/* Dots */}
            {heroImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                {heroImages.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Go to slide ${i + 1}`}
                    onClick={() => heroEmblaApi?.scrollTo(i)}
                    className={`h-2 rounded-full transition-all ${i === heroSelectedIndex ? 'w-6 bg-white' : 'w-2 bg-white/60'}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-accent dark:text-primary mb-4">Latest Announcements</h3>
            <p className="text-muted-foreground">Stay updated with our latest news and events</p>
          </div>

          <div className="relative px-8 md:px-12">
            {announcements.length > 0 && (
              <>
                {announcements.length > slidesInView && (
                  <>
                    <button 
                      onClick={scrollPrev}
                      className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/80 p-2 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-all ${selectedIndex === 0 ? 'opacity-50 cursor-default' : 'opacity-100'}`}
                      aria-label="Previous announcement"
                      disabled={selectedIndex === 0}
                    >
                      <ChevronLeft className="h-6 w-6 text-accent dark:text-primary" />
                    </button>
                    <button 
                      onClick={scrollNext}
                      className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/80 p-2 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-all ${selectedIndex >= announcements.length - slidesInView ? 'opacity-50 cursor-default' : 'opacity-100'}`}
                      aria-label="Next announcement"
                      disabled={selectedIndex >= announcements.length - slidesInView}
                    >
                      <ChevronRight className="h-6 w-6 text-accent dark:text-primary" />
                    </button>
                  </>
                )}
                
                <div className="overflow-hidden" ref={announcementsViewportRef}>
                  <div className="flex">
                    {announcements.map((announcement, index) => (
                      <div 
                        key={announcement.id} 
                        className={`flex-shrink-0 px-2 w-full sm:w-1/2 lg:w-1/3 transition-opacity duration-300 ${index >= selectedIndex && index < selectedIndex + slidesInView ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}
                      >
                        <Card className="ssgi-card hover:shadow-xl transition-shadow h-full">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{announcement.title}</CardTitle>
                              <Badge variant="outline" className="text-yellow-600 dark:text-blue-600">
                                <Calendar className="h-3 w-3 mr-1 text-yellow-600 dark:text-blue-600" />
                                {new Date(announcement.date).toLocaleDateString()}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground mb-4 line-clamp-3">{announcement.content}</p>
                            <p className="text-sm text-muted-foreground">By {announcement.author}</p>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Dots indicator */}
                {announcements.length > slidesInView && (
                  <div className="flex justify-center mt-6 space-x-2">
                    {Array.from({ length: Math.ceil(announcements.length / slidesInView) }).map((_, index) => (
                      <button 
                        key={index}
                        className={`w-3 h-3 rounded-full transition-all ${index === Math.floor(selectedIndex / slidesInView) ? 'bg-accent dark:bg-primary w-8' : 'bg-gray-300 dark:bg-gray-600 w-3'}`}
                        aria-label={`Go to page ${index + 1}`}
                        onClick={() => emblaApi?.scrollTo(index * slidesInView)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          {announcements.length > 3 && (
            <div className="flex justify-center mt-6 space-x-2">
              {announcements.map((_, index) => (
                <button 
                  key={index}
                  className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-accent dark:bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        <style jsx global>{`
          .embla {
            overflow: hidden;
          }
          .embla__container {
            display: flex;
            will-change: transform;
          }
          .embla__slide {
            flex: 0 0 auto;
            min-width: 0;
            position: relative;
            padding: 0 0.5rem;
            transition: opacity 0.3s ease-in-out;
          }
          /* Ensure hero slides take full width */
          .hero-embla .embla__slide {
            width: 100% !important;
            padding: 0; /* edge-to-edge */
          }
          .line-clamp-3 {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          @media (max-width: 640px) {
            .embla__slide {
              width: 100%;
            }
          }
          @media (min-width: 641px) and (max-width: 1023px) {
            .embla__slide {
              width: 50%;
            }
          }
          @media (min-width: 1024px) {
            .embla__slide {
              width: 33.333%;
            }
            .team-embla .embla__slide {
              width: 25%;
            }
          }
        `}</style>
      </section>

      {/* Staff Profiles Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-accent dark:text-primary mb-4">Our Expert Team</h3>
            <p className="text-muted-foreground">Meet our dedicated staff who make learning an adventure</p>
          </div>

          <div className="relative px-8 md:px-12">
            {staffProfiles.length > 0 ? (
              <>
                <div className="overflow-hidden" ref={teamViewportRef}>
                  <div className="flex">
                    {staffProfiles.map((staff, index) => {
                      // Get user information from the staff profile's user property
                      const user = staff.user || users.find((u) => String(u.id) === String(staff.userId))
                      const fullName = user ? `${user.first_name} ${user.last_name}` : 'Staff Member'
                      const role = user?.role || 'staff'
                      return (
                      <div 
                        key={staff.id} 
                        className={`flex-shrink-0 px-2 w-full sm:w-1/2 lg:w-1/4 transition-opacity duration-300 ${index >= teamSelectedIndex && index < teamSelectedIndex + teamSlidesInView ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}
                      >
                        <Card className="ssgi-card text-center hover:shadow-xl transition-shadow h-full">
                          <CardHeader>
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-blue-600 flex items-center justify-center overflow-hidden">
                              {user?.profile_picture ? (
                                <Image 
                                  src={user.profile_picture.toString().startsWith("http") 
                                    ? user.profile_picture.toString() 
                                    : `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api\/?$/, "")}/${user.profile_picture}`
                                  } 
                                  alt={`${user.first_name} ${user.last_name}`}
                                  width={80}
                                  height={80}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Users className="h-10 w-10 text-white" />
                              )}
                            </div>
                            <CardTitle className="text-lg">
                              {fullName}
                            </CardTitle>
                            <Badge variant="secondary" className="text-yellow-600 dark:text-blue-600 capitalize">
                              {role}
                            </Badge>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-2">{staff.experience}</p>
                            <p className="text-sm font-medium text-yellow-600 dark:text-blue-600 mb-3">{staff.specialty}</p>
                            {user?.bio && (
                              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-xs text-muted-foreground mb-1 font-semibold">About Me</p>
                                <p className="text-sm text-muted-foreground line-clamp-3">{user.bio}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                      )
                    })}
                  </div>
                </div>
                
                {/* Dots indicator */}
                {staffProfiles.length > teamSlidesInView && (
                  <div className="flex justify-center mt-6 space-x-2">
                    {Array.from({ length: Math.ceil(staffProfiles.length / teamSlidesInView) }).map((_, index) => (
                      <button 
                        key={index}
                        className={`w-3 h-3 rounded-full transition-all ${index === Math.floor(teamSelectedIndex / teamSlidesInView) ? 'bg-accent dark:bg-primary w-8' : 'bg-gray-300 dark:bg-gray-600 w-3'}`}
                        aria-label={`Go to page ${index + 1}`}
                        onClick={() => teamEmblaApi?.scrollTo(index * teamSlidesInView)}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">Our staff profiles will be available soon!</p>
              </div>
            )}
          </div>
        </div>
      </section>

  {/* Gallery Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-accent dark:text-primary mb-4">Our Space-Themed Facility</h3>
            <p className="text-muted-foreground">Explore our learning environments designed to inspire wonder</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallery.length > 0 ? gallery.map((photo) => (
              <Card key={photo.id} className="ssgi-card overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-48 bg-gray-100">
                  <Image
                    src={photo.url || "/placeholder.svg"}
                    alt={photo.caption}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-lg mb-2 text-yellow-600 dark:text-blue-600">{photo.caption}</h4>
                  <p className="text-muted-foreground text-sm">
                    {new Date(photo.uploadedAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            )) : (
              <Card className="ssgi-card">
                <CardContent className="text-center py-12">
                  <Rocket className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No photos available</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Application Modal */}
      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Form</DialogTitle>
          </DialogHeader>
          <PublicApplicationForm onSubmitted={() => setApplyOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Footer */}
<footer className="bg-gradient-to-b from-background/90 to-background dark:from-background/80 dark:to-background/60 text-background-foreground py-16 px-4 border-t border-gray-200 dark:border-gray-700">
  <div className="container mx-auto max-w-6xl">
    <div className="grid md:grid-cols-4 gap-10">
      {/* Logo and Description */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Image
            src="/images/ssgi-logo.png" 
            alt="SSGI Logo"
            width={80}
            height={40}
            className="h-12 w-auto"
          />
          <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            SSGI Daycare
          </span>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Providing stellar early education in a nurturing environment that inspires young minds to reach for the stars.
        </p>
        <div className="flex space-x-4 pt-2">
          {['twitter', 'facebook', 'instagram'].map((social) => (
            <a key={social} href="#" className="text-muted-foreground hover:text-accent dark:hover:text-accent transition-colors">
              <span className="sr-only">{social}</span>
              <Globe className="h-5 w-5" />
            </a>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h4 className="font-semibold text-lg mb-5 pb-2 border-b border-gray-200 dark:border-gray-700 text-accent dark:text-primary">
          Quick Links
        </h4>
        <nav className="space-y-3">
          {['About Us', 'Gallery', 'Announcement'].map((link) => (
            <a 
              key={link} 
              href="#" 
              className="block text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 duration-200"
            >
              {link}
            </a>
          ))}
        </nav>
      </div>

      {/* Contact Information */}
      <div>
        <h4 className="font-semibold text-lg mb-5 pb-2 border-b border-gray-200 dark:border-gray-700 text-accent dark:text-primary">
          Contact Us
        </h4>
        <div className="space-y-3 text-muted-foreground">
          <div className="flex items-start space-x-3">
            <MapPinIcon className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
            <p>Space Science Institute Campus</p>
          </div>
          <div className="flex items-center space-x-3">
            <PhoneIcon className="h-5 w-5 text-primary flex-shrink-0" />
            <p>+1 (555) 123-SSGI</p>
          </div>
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-primary flex-shrink-0" />
            <p>daycare@ssgi.org</p>
          </div>
          <div className="flex items-center space-x-3">
            <ClockIcon className="h-5 w-5 text-primary flex-shrink-0" />
            <p>Mon-Fri: 7:00 AM - 6:00 PM</p>
          </div>
        </div>
      </div>

      {/* Newsletter */}
    </div>

    {/* Copyright */}
    <div className="border-t border-gray-800 mt-12 pt-8 text-center">
      <p className="text-muted-foreground text-sm">
        &copy; {new Date().getFullYear()} Space Science and Geospatial Institute. All rights reserved.
      </p>
      <p className="mt-2 text-sm flex items-center justify-center space-x-1">
        <span>From Earth to Space...</span>
        <RocketIcon className="h-5 w-5 text-primary animate-bounce" />
      </p>
    </div>
  </div>
</footer>
      {/* About Modal */}
      {aboutOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background/80 dark:bg-background/60 p-8 rounded-xl max-w-4xl w-full relative">
            <button
              onClick={() => setAboutOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-2xl font-semibold mb-6 text-accent dark:text-primary">About SSGI Daycare System</h3>
            <div className="space-y-6">
              <p className="text-muted-foreground">
                SSGI Daycare is a modern childcare management system designed to streamline operations for daycare centers.
                The system provides comprehensive features for staff management, attendance tracking, health monitoring,
                announcements, and parent communication. Its built with a user-friendly interface and modern design,
                ensuring efficient management of daily operations while maintaining high standards of care.
              </p>
              <div className="space-y-2">
                <p className="text-muted-foreground">Key Features:</p>
                <ul className="list-disc list-inside pl-5 space-y-2 text-muted-foreground">
                  <li>Staff Management</li>
                  <li>Attendance Tracking</li>
                  <li>Health Monitoring</li>
                  <li>Announcements & Notifications</li>
                  <li>Parent Communication</li>
                  <li>Child Activity Logging</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
