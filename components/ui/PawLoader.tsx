'use client'

import { useEffect, useRef, useState } from 'react'

interface PawLoaderProps {
  isLoading: boolean
  message?: string
}

export function PawLoader({ isLoading, message = 'Cargando...' }: PawLoaderProps) {
  const [visible, setVisible] = useState(isLoading)
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    if (isLoading) {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current)
        hideTimer.current = null
      }
      queueMicrotask(() => setVisible(true))
    } else {
      hideTimer.current = setTimeout(() => setVisible(false), 400)
    }
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
  }, [isLoading])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm transition-opacity duration-400 ${
        isLoading ? 'opacity-100' : 'opacity-0'
      }`}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-20 w-20 animate-bounce">
          <div className="flex h-20 w-20 items-center justify-center">
            <svg
              viewBox="0 0 100 100"
              className="h-full w-full fill-[#FF8C7A] opacity-90"
              aria-hidden="true"
            >
              <ellipse cx="50" cy="75" rx="22" ry="18" />
              <ellipse cx="25" cy="52" rx="10" ry="13" transform="rotate(-15 25 52)" />
              <ellipse cx="75" cy="52" rx="10" ry="13" transform="rotate(15 75 52)" />
              <ellipse cx="38" cy="38" rx="9" ry="12" transform="rotate(-5 38 38)" />
              <ellipse cx="62" cy="38" rx="9" ry="12" transform="rotate(5 62 38)" />
            </svg>
          </div>
        </div>
        <p className="animate-pulse text-sm font-medium text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}
