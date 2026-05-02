import OpenAI from 'openai'
import type { PetAnalysisResult } from '@/types'
import type { LandingService } from '@/app/api/form-config/route'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export interface ServiceRecommendation {
  serviceId: string
  reason: string
}

export async function recommendService(
  analysis: PetAnalysisResult,
  services: LandingService[],
): Promise<ServiceRecommendation> {
  const servicesList = services
    .filter((s) => s.active)
    .map(
      (s) => `- ID: "${s.id}" | Nombre: "${s.name}" | Descripción: "${s.description}" | Precio: "${s.price}"`,
    )
    .join('\n')

  const prompt = `Eres un groomer canino experto con 20 años de experiencia. Basándote en el análisis de esta mascota y los servicios disponibles, recomienda el servicio MÁS ADECUADO.

ANÁLISIS DE LA MASCOTA:
- Raza: ${analysis.breed}
- Edad estimada: ${analysis.estimatedAge}
- Condición del pelaje: ${analysis.coatCondition}
- Tipo de pelo: ${analysis.coatType}
- Tiempo estimado de grooming: ${analysis.estimatedGroomingTime} minutos
${analysis.specialNotes ? `- Notas especiales: ${analysis.specialNotes}` : ''}
${analysis.urgentCare ? `- Cuidado urgente: ${analysis.urgentCare}` : ''}
${analysis.recommendations.length > 0 ? `- Problemas detectados: ${analysis.recommendations.map((r) => r.service).join(', ')}` : ''}

SERVICIOS DISPONIBLES:
${servicesList}

Responde ÚNICAMENTE con un objeto JSON con esta estructura exacta:
{
  "serviceId": "ID del servicio recomendado (debe coincidir exactamente con uno de los IDs de arriba)",
  "reason": "explicación breve en español (1-2 frases) de por qué este servicio es el mejor para esta mascota"
}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 300,
    temperature: 0.3,
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('No se recibió recomendación de servicio')

  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Respuesta de recomendación en formato inválido')

  return JSON.parse(jsonMatch[0]) as ServiceRecommendation
}
