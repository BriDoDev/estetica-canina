'use server'

import { analyzePetPhoto } from '@/lib/ai/analyze-pet'
import sharp from 'sharp'
import type { PetAnalysisResult } from '@/types'

export interface AnalyzePetActionResult {
  data: (PetAnalysisResult & { compressedBase64: string; compressedMimeType: string }) | null
  error: string | null
}

export async function analyzePetAction(formData: FormData): Promise<AnalyzePetActionResult> {
  try {
    const file = formData.get('petPhoto') as File | null

    if (!file || file.size === 0) {
      return { data: null, error: 'No se proporcionó una foto de la mascota' }
    }

    if (file.size > 10 * 1024 * 1024) {
      return { data: null, error: 'La imagen es demasiado grande (máximo 10MB)' }
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
    if (!allowedTypes.includes(file.type)) {
      return { data: null, error: 'Tipo de archivo no permitido' }
    }

    const arrayBuffer = await file.arrayBuffer()
    const inputBuffer = Buffer.from(arrayBuffer)

    // Compress image server-side with sharp (max 1024px, JPEG)
    const compressedBuffer = await sharp(inputBuffer)
      .resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 75 })
      .toBuffer()

    const compressedBase64 = compressedBuffer.toString('base64')
    const compressedMimeType = 'image/jpeg'

    const analysis = await analyzePetPhoto(compressedBase64, compressedMimeType)

    return { data: { ...analysis, compressedBase64, compressedMimeType }, error: null }
  } catch (err) {
    console.error('[analyzePetAction] Error:', err)
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Error al analizar la foto',
    }
  }
}
