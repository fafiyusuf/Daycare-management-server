"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useAuthStore } from "@/lib/store"
import { LogOut, Menu, Rocket, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
interface HeaderProps {
  title: string
  subtitle?: string
  showUserInfo?: boolean
}

export function Header({ title, subtitle, showUserInfo = true }: HeaderProps) {
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const [aboutOpen, setAboutOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/public")
  }

  return (
    <>
      <header className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/95 dark:bg-gray-900/95 shadow-md' 
          : 'bg-background/80 dark:bg-gray-900/80 shadow-sm'
      } border-gray-200 dark:border-gray-700 backdrop-blur`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
            <Link href="/public" className="flex items-center">
              <Image 
                src="/images/ssgi-logo.png" 
                alt="SSGI Logo" 
                width={100} 
                height={50} 
                className="h-10 w-auto sm:h-12" 
                priority
              />
            </Link>
              <div className="hidden sm:block">
                <h1 className="text-xl sm:text-2xl font-bold text-primary dark:text-accent">{title}</h1>
                {subtitle && (
                  <p className="text-xs sm:text-sm text-muted-foreground">{subtitle}</p>
                )}
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              {showUserInfo && (
                <div className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-accent dark:text-primary" />
                  <span className="text-sm text-muted-foreground hidden lg:inline">Inspiring Young Explorers</span>
                </div>
              )}
              
              {showUserInfo && user && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground hidden lg:inline">{user.first_name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogout}
                    className="hidden sm:flex items-center gap-1"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="ml-1">Logout</span>
                  </Button>
                </div>
              )}
              <ThemeToggle />
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 md:hidden">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div 
            className={`md:hidden transition-all duration-300 overflow-hidden ${
              isMobileMenuOpen ? 'max-h-96 py-4 border-t mt-3' : 'max-h-0 py-0'
            }`}
          >
            <div className="flex flex-col space-y-4">
              {showUserInfo && user && (
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center gap-2">
                    <Rocket className="h-5 w-5 text-accent dark:text-primary" />
                    <span className="text-sm">Inspiring Young Explorers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{user.first_name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogout}
                    className="w-full justify-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
