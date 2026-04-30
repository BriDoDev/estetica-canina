'use server'

import { generateGroomingPreview } from '@/lib/ai/generate-grooming'
import { createClient } from '@/lib/supabase/server'
import type { GroomingStylePreview } from '@/lib/ai/generate-grooming'

export async function generateGroomingPreviewAction(
  breed: string,
  imageBase64?: string,
  imageMimeType?: string
): Promise<{
  data: GroomingStylePreview[] | null
  error: string | null
}> {
  try {
    const supabase = await createClient()
    const { data: configData } = await supabase
      .from('landing_config')
      .select('value')
      .eq('key', 'grooming_image_count')
      .single()

    const count = configData?.value
      ? Math.min(parseInt(String(configData.value), 10) || 1, 4)
      : 1

    // ── Image-to-Image pipeline for faithful grooming previews ──
    const previews = await generateGroomingPreview(breed, count, imageBase64, imageMimeType)
    return { data: previews, error: null }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Error al generar las vistas previas de cortes.',
    }
  }
}
