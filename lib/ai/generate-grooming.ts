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
  { id: 'breed_standard', name: 'Estándar de Raza', description: 'Corte según el estándar de la raza' },
]

function buildPrompt(breed: string, styleName: string, styleDesc: string): string {
  const styleDetails: Record<string, string> = {
    'Teddy Bear': 'round fluffy even cut all over, all fur trimmed to equal rounded length, teddy bear look',
    'Puppy Cut': 'short uniform cut all over the body, 1-2 inches length, neat tidy puppy look',
    'Lion Cut': 'body shaved very short, full voluminous mane around head and neck, fluffy tail pompom, dramatic lion look',
    'Estándar de Raza': 'breed standard show cut, precise elegant professional grooming',
  }
  const detail = styleDetails[styleName] ?? styleDesc
  return `Professional studio photograph of a freshly groomed ${breed} dog with ${detail}. Clean white background, professional pet photography lighting, high quality 4K, photorealistic, no illustration no cartoon. The dog looks happy, clean, and beautiful.`
}

export async function generateGroomingPreview(
  breed: string,
  count = 1,
): Promise<GroomingStylePreview[]> {
  const styles = GROOMING_STYLES.slice(0, Math.min(count, GROOMING_STYLES.length))
  const previews: GroomingStylePreview[] = []

  for (const style of styles) {
    try {
      const prompt = buildPrompt(breed, style.name, style.description)

      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        style: 'natural',
      })

      const url = response.data?.[0]?.url
      if (!url) {
        console.warn(`[Grooming] DALL-E 3 returned no URL for ${style.id}`)
      }
      previews.push({
        styleId: style.id,
        name: style.name,
        description: style.description,
        imageUrl: url ?? '',
      })
    } catch (err) {
      console.error(`[Grooming] Failed for ${style.id}:`, err)
      previews.push({
        styleId: style.id,
        name: style.name,
        description: style.description,
        imageUrl: '',
      })
    }
  }

  return previews
}
