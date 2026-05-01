export interface GroomingStylePreview {
  styleId: string
  name: string
  description: string
  imageUrl: string
}

let cachedDogDescription: string | null = null

export async function describeDogPhoto(imageBase64: string, mimeType: string): Promise<string> {
  if (cachedDogDescription) return cachedDogDescription

  const OpenAI = (await import('openai')).default
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

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
