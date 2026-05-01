import OpenAI from 'openai'
import type { PetAnalysisResult, GroomingStyleSuggestion } from '@/types'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function suggestGroomingStyles(
  analysis: PetAnalysisResult,
  count: number,
): Promise<GroomingStyleSuggestion[]> {
  const safeCount = Math.min(4, Math.max(1, count))

  const prompt = `Eres un estilista canino profesional con 20 años de experiencia. Basándote en el siguiente análisis de un perro, sugiere los ${safeCount} mejores cortes de pelo para este perro específico.

ANÁLISIS DEL PERRO:
- Raza: ${analysis.breed}
- Edad estimada: ${analysis.estimatedAge}
- Tipo de pelo: ${analysis.coatType}
- Condición del pelaje: ${analysis.coatCondition}
- Tiempo estimado de grooming: ${analysis.estimatedGroomingTime} minutos

Responde ÚNICAMENTE con un array JSON de exactamente ${safeCount} objetos, ordenados del más recomendado al menos recomendado. Cada objeto debe tener esta estructura:

[
  {
    "id": "identificador unico en snake_case",
    "name": "nombre del corte en español",
    "description": "descripción breve en español (1 frase) de por qué este corte es ideal para este perro",
    "dallePrompt": "prompt en inglés para DALL-E describiendo exactamente cómo debe verse el corte: incluye detalles de largo de pelo en cada parte del cuerpo (cabeza, cuerpo, patas, cola), forma general, textura. IMPORTANTE: solo describe el corte, NO menciones raza, color, ni características del perro."
  }
]

REGLAS:
- Adapta los cortes a la raza, tipo y condición del pelaje
- Si el pelaje tiene nudos o está en mal estado, sugiere cortes que resuelvan ese problema
- Si es una raza con estándar específico, incluye el corte de raza como opción
- El dallePrompt DEBE estar en inglés y ser ultra detallado sobre el estilo del corte
- NO inventes nombres de razas ni características - usa solo lo del análisis
- El array debe tener exactamente ${safeCount} elementos`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 800,
    temperature: 0.7,
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('No se recibieron sugerencias de estilos')

  const jsonMatch = content.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('Respuesta de estilos en formato inválido')

  const styles: GroomingStyleSuggestion[] = JSON.parse(jsonMatch[0])

  return styles.slice(0, safeCount)
}
