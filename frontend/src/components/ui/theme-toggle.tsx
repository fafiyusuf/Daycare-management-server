'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="group relative inline-flex h-10 w-10 shrink-0 cursor-pointer rounded-full transition-colors hover:bg-primary/20 dark:hover:bg-accent/20 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
      aria-label="Toggle theme"
    >
      <div className="relative flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out bg-background/80 dark:bg-background/60">
        <Sun className="h-5 w-5 transition-all duration-300 ease-in-out group-data-[state=checked]:-rotate-90 group-data-[state=checked]:scale-0" />
        <Moon className="absolute h-5 w-5 transition-all duration-300 ease-in-out -rotate-90 scale-0 group-data-[state=checked]:rotate-0 group-data-[state=checked]:scale-100" />
      </div>
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
