'use server'

import { analyzePetPhoto } from '@/lib/ai/analyze-pet'
import type { PetAnalysisResult } from '@/types'

interface AnalyzePetResult {
  data: PetAnalysisResult | null
  error: string | null
}

export async function analyzePetAction(formData: FormData): Promise<AnalyzePetResult> {
  try {
    const file = formData.get('petPhoto') as File | null

    if (!file || file.size === 0) {
      return { data: null, error: 'No se proporcionó una foto de la mascota' }
    }

    if (file.size > 5 * 1024 * 1024) {
      return { data: null, error: 'La imagen es demasiado grande (máximo 5MB)' }
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return { data: null, error: 'Tipo de archivo no permitido' }
    }

    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    const analysis = await analyzePetPhoto(base64, file.type)

    return { data: analysis, error: null }
  } catch (err) {
    console.error('[analyzePetAction] Error:', err)
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Error al analizar la foto',
    }
  }
}
