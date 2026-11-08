'use client'

import React, { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from './theme-provider'

interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
}

export function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Placeholder skeleton yang identik untuk mencegah layout shift sebelum hydration
    return (
      <div
        className={`w-9 h-9 rounded-xl border border-pink-200/80 dark:border-[#2E2838] bg-[#FFF0F6]/60 dark:bg-[#1E1B24]/60 flex items-center justify-center opacity-0 ${className}`}
      />
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
      title={isDark ? 'Mode Terang' : 'Mode Gelap'}
      className={`relative inline-flex items-center justify-center gap-2 p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-[#E11D48] dark:hover:text-[#FF80AB] bg-[#FFF0F6] dark:bg-[#1E1B24] hover:bg-[#FFE4EE] dark:hover:bg-[#292433] border border-pink-200/80 dark:border-[#2E2838] transition-all duration-200 active:scale-95 shadow-2xs ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {/* Sun Icon */}
        <Sun
          className={`w-4 h-4 text-amber-500 transition-all duration-300 absolute ${
            isDark
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 -rotate-90 scale-50 pointer-events-none'
          }`}
        />
        {/* Moon Icon */}
        <Moon
          className={`w-4 h-4 text-[#E11D48] dark:text-[#FF80AB] transition-all duration-300 absolute ${
            isDark
              ? 'opacity-0 rotate-90 scale-50 pointer-events-none'
              : 'opacity-100 rotate-0 scale-100'
          }`}
        />
      </div>

      {showLabel && (
        <span className="text-xs font-semibold">
          {isDark ? 'Mode Terang' : 'Mode Gelap'}
        </span>
      )}
    </button>
  )
}

