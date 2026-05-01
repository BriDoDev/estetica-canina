import OpenAI from 'openai'
import type { PetAnalysisResult } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function analyzePetPhoto(
  imageBase64: string,
  mimeType: string,
): Promise<PetAnalysisResult> {
  const prompt = `Eres un experto groomer canino con 20 años de experiencia. Analiza esta foto de una mascota y proporciona un análisis detallado en formato JSON.

PRIMERO: Determina si la foto contiene un animal (perro, gato, conejo, hurón, etc.) o una persona/objeto. Si claramente NO contiene ningún animal (es un paisaje, objeto, persona, texto, selfie sin mascota, etc.), responde ÚNICAMENTE con:
{ "isDog": false, "breed": "No se detecta mascota", "estimatedAge": "", "coatCondition": "poor", "coatType": "", "recommendations": [], "urgentCare": null, "estimatedGroomingTime": 0 }

Si la foto contiene un animal (sea perro, gato u otra mascota), asume que es un perro y proporciona tu mejor análisis. Responde ÚNICAMENTE con un objeto JSON válido con esta estructura exacta:
{
  "isDog": true,
  "breed": "raza detectada o 'Mestizo'",
  "estimatedAge": "estimación de edad (ej: '2-3 años')",
  "coatCondition": "excellent|good|needs_attention|poor",
  "coatType": "descripción del tipo de pelo",
  "recommendations": [
    {
      "service": "nombre del servicio",
      "priority": "high|medium|low",
      "description": "descripción breve del por qué",
      "estimatedPrice": "rango de precio en MXN"
    }
  ],
  "urgentCare": "descripción de cuidado urgente o null",
  "estimatedGroomingTime": número en minutos,
  "specialNotes": "notas especiales en español (2-3 frases) describiendo el estado general del pelaje, nudos visibles, suciedad, y recomendaciones clave para el groomer. NO incluyas precios ni nombres de servicios."
}

Proporciona exactamente 4 recomendaciones.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${imageBase64}`,
              detail: 'high',
            },
          },
          {
            type: 'text',
            text: prompt,
          },
        ],
      },
    ],
    max_tokens: 1000,
    temperature: 0.3,
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('No se recibió respuesta del análisis de IA')
  }

  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Respuesta de IA en formato inválido')
  }

  return JSON.parse(jsonMatch[0]) as PetAnalysisResult
}
