'use server'

import { editPetPhotoWithStyle } from '@/lib/ai/edit-grooming'
import type { GroomingEditResult } from '@/lib/ai/edit-grooming'

export async function editGroomingPhotoAction(
  styleId: string,
  styleName: string,
  styleDescription: string,
  imageBase64: string,
  imageMimeType: string,
): Promise<{
  data: GroomingEditResult | null
  error: string | null
}> {
  try {
    const result = await editPetPhotoWithStyle(
      imageBase64,
      imageMimeType,
      styleId,
      styleName,
      styleDescription,
    )

    if (!result.base64) {
      return {
        data: null,
        error: 'No se pudo generar la imagen editada. Intenta de nuevo.',
      }
    }

    return { data: result, error: null }
  } catch (err) {
    console.error('[editGroomingPhotoAction] Error:', err)
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Error al editar la foto.',
    }
  }
}
