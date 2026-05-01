import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export interface GroomingStylePreview {
  styleId: string
  name: string
  description: string
  imageUrl: string
}

const GROOMING_STYLES = [
  { id: 'teddy_bear', name: 'Teddy Bear', description: 'Corte redondeado y esponjoso' },
  { id: 'puppy_cut', name: 'Puppy Cut', description: 'Corte uniforme corto en todo el cuerpo' },
  { id: 'lion_cut', name: 'Lion Cut', description: 'Cuerpo rapado con melena y pompón en la cola' },
  {
    id: 'breed_standard',
    name: 'Estándar de Raza',
    description: 'Corte según el estándar de la raza',
  },
]

const STYLE_DETAILS: Record<string, string> = {
  'Teddy Bear':
    'round fluffy even cut all over, fur trimmed to equal rounded length like a teddy bear, soft plush appearance',
  'Puppy Cut':
    'short uniform cut all over the body, 1-2 inches length, neat tidy clean puppy look',
  'Lion Cut':
    'body shaved very short and smooth, full voluminous mane around head neck and chest, fluffy tail pompom',
  'Estándar de Raza':
    'breed standard professional show cut, precise elegant breed-specific grooming, clean crisp lines',
}

let cachedDogDescription: string | null = null

export async function describeDogPhoto(imageBase64: string, mimeType: string): Promise<string> {
  if (cachedDogDescription) return cachedDogDescription

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Describe this dog in extreme detail for an AI image generator. Focus on every visual detail: exact coat colors and patterns (be specific about where each color appears on the body), fur texture and length, ear shape and position, eye color, nose color, body shape and size, tail shape and length, leg length, paw details, facial expression, any markings or spots, collar if present, the angle of the photo, the background, the lighting, the floor surface, the pose. Be as specific and detailed as possible. Format as a single paragraph of descriptive text that can be used in a DALL-E prompt. Start with "A photorealistic dog with..."',
          },
          {
            type: 'image_url',
            image_url: { url: `data:${mimeType};base64,${imageBase64}` },
          },
        ],
      },
    ],
    max_tokens: 400,
  })

  const description = response.choices[0]?.message?.content ?? ''
  cachedDogDescription = description
  return description
}

export function clearDogDescriptionCache() {
  cachedDogDescription = null
}

export function getGroomingStyles() {
  return GROOMING_STYLES
}

export function getStyleDetails() {
  return STYLE_DETAILS
}
