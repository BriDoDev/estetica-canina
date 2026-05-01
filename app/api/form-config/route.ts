import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { FormConfig } from '@/lib/types/form-config'
import { DEFAULT_FORM_CONFIG } from '@/lib/types/form-config'

export interface LandingService {
  id: string
  icon: string
  name: string
  description: string
  price: string
  badge?: string | null
  active: boolean
  imageUrl?: string | null
}

export interface FormConfigResponse {
  config: FormConfig
  services: LandingService[]
  groomingImageCount: number
}

export async function GET() {
  try {
    const supabase = await createClient()

    const [configResult, servicesResult, groomingCountResult] = await Promise.all([
      supabase.from('landing_config').select('value').eq('key', 'appointment_form_config').single(),
      supabase.from('landing_config').select('value').eq('key', 'services').single(),
      supabase.from('landing_config').select('value').eq('key', 'grooming_image_count').single(),
    ])

    const config: FormConfig = configResult.data?.value
      ? (configResult.data.value as unknown as FormConfig)
      : DEFAULT_FORM_CONFIG

    const services: LandingService[] =
      servicesResult.data?.value && Array.isArray(servicesResult.data.value)
        ? (servicesResult.data.value as unknown as LandingService[])
        : []

    const groomingImageCount = parseInt(
      (groomingCountResult.data?.value as string) || '1',
      10,
    )

    const response: FormConfigResponse = { config, services, groomingImageCount }
    return NextResponse.json(response)
  } catch (err) {
    console.error('form-config route error:', err)
    return NextResponse.json(
      { config: DEFAULT_FORM_CONFIG, services: [], groomingImageCount: 1 } satisfies FormConfigResponse,
      { status: 200 },
    )
  }
}
