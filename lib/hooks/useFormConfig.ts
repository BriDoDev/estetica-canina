'use client'

import { useState, useEffect } from 'react'
import type { FormConfig } from '@/lib/types/form-config'
import { DEFAULT_FORM_CONFIG } from '@/lib/types/form-config'
import type { LandingService } from '@/app/api/form-config/route'

interface UseFormConfigResult {
  config: FormConfig
  services: LandingService[]
  groomingImageCount: number
  isLoading: boolean
}

export function useFormConfig(): UseFormConfigResult {
  const [config, setConfig] = useState<FormConfig>(DEFAULT_FORM_CONFIG)
  const [services, setServices] = useState<LandingService[]>([])
  const [groomingImageCount, setGroomingImageCount] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch('/api/form-config')
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        if (data.config) setConfig(data.config)
        if (data.services) setServices(data.services)
        if (typeof data.groomingImageCount === 'number') setGroomingImageCount(data.groomingImageCount)
      } catch {
        // fallback to defaults on error
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { config, services, groomingImageCount, isLoading }
}
