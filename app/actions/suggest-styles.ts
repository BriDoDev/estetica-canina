'use server'

import { suggestGroomingStyles } from '@/lib/ai/suggest-styles'
import type { PetAnalysisResult, GroomingStyleSuggestion } from '@/types'

export async function suggestStylesAction(
  analysis: PetAnalysisResult,
  count: number,
): Promise<{ data: GroomingStyleSuggestion[] | null; error: string | null }> {
  try {
    if (!analysis.isDog) {
      return { data: null, error: 'Solo se puede sugerir cortes para perros' }
    }

    const safeCount = Math.min(4, Math.max(1, Math.round(count)))
    const styles = await suggestGroomingStyles(analysis, safeCount)

    return { data: styles, error: null }
  } catch (err) {
    console.error('[suggestStylesAction] Error:', err)
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Error al sugerir estilos de corte',
    }
  }
}
