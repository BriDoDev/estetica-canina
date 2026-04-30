'use server'

import { generateGroomingPreview, extractPetVisualFeatures } from '@/lib/ai/generate-grooming'
import { createClient } from '@/lib/supabase/server'
import type { GroomingStylePreview } from '@/lib/ai/generate-grooming'

export async function generateGroomingPreviewAction(
  breed: string,
  imageBase64?: string,
  imageMimeType?: string
): Promise<{
  data: GroomingStylePreview[] | null
  error: string | null
  featuresUsed: boolean
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

    // ── Image-to-Image pipeline ──
    // Extract detailed visual features from the uploaded photo
    let features = null
    if (imageBase64 && imageMimeType) {
      features = await extractPetVisualFeatures(imageBase64, imageMimeType)
      if (features) {
        console.log('[Grooming] Image-to-image mode: visual features extracted')
      }
    }

    const previews = await generateGroomingPreview(breed, count, features)
    return { data: previews, error: null, featuresUsed: !!features }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Error generando la preview',
      featuresUsed: false,
    }
  }
}
