'use server'

import { recommendService } from '@/lib/ai/recommend-service'
import type { PetAnalysisResult } from '@/types'
import type { LandingService } from '@/app/api/form-config/route'

export interface RecommendServiceResult {
  data: { serviceId: string; reason: string } | null
  error: string | null
}

export async function recommendServiceAction(
  analysis: PetAnalysisResult,
  services: LandingService[],
): Promise<RecommendServiceResult> {
  try {
    if (analysis.isDog === false) {
      return { data: null, error: 'No se detecta mascota para recomendar servicio' }
    }

    if (!services || services.length === 0) {
      return { data: null, error: 'No hay servicios disponibles para recomendar' }
    }

    const recommendation = await recommendService(analysis, services)

    return { data: recommendation, error: null }
  } catch (err) {
    console.error('[recommendServiceAction] Error:', err)
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Error al recomendar servicio',
    }
  }
}
