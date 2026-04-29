import OpenAI, { toFile } from 'openai'

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

function getEditPrompt(styleName: string): string {
  const styleDetails: Record<string, string> = {
    'Teddy Bear': 'Round fluffy even cut all over, all fur trimmed to equal rounded length',
    'Puppy Cut': 'Short uniform cut all over the body, 1-2 inches, neat and tidy',
    'Lion Cut': 'Body shaved short, full voluminous mane around head and neck, fluffy tail pompom',
    'Estándar de Raza': 'Breed standard show cut, precise and elegant',
  }
  const detail = styleDetails[styleName] ?? styleName
  return `Professional dog grooming photo. Same dog, same pose, same background, same lighting. Only change: apply a ${styleName} grooming style to the dog's fur. ${detail}. Keep the dog's exact face, eyes, body shape, pose, and background completely unchanged.`
}

export async function generateGroomingPreview(
  breed: string,
  count = 1,
  imageBase64?: string,
  imageMimeType?: string
): Promise<GroomingStylePreview[]> {
  const styles = GROOMING_STYLES.slice(0, Math.min(count, GROOMING_STYLES.length))
  const previews: GroomingStylePreview[] = []

  for (const style of styles) {
    try {
      if (imageBase64) {
        const imageBuffer = Buffer.from(imageBase64, 'base64')
        const mimeType = imageMimeType ?? 'image/png'
        const ext = mimeType.includes('jpeg') || mimeType.includes('jpg') ? 'jpg' : 'png'
        const imageFile = await toFile(imageBuffer, `pet.${ext}`, { type: mimeType })

        const response = await openai.images.edit({
          model: 'dall-e-2',
          image: imageFile,
          prompt: getEditPrompt(style.name),
          n: 1,
          size: '1024x1024',
        })

        previews.push({
          styleId: style.id,
          name: style.name,
          description: style.description,
          imageUrl: response.data?.[0]?.url ?? '',
        })
      } else {
        // Fallback: text-to-image with DALL-E 3
        const prompt = `Highly realistic professional studio photograph of a ${breed} dog with a ${style.name} grooming style. The dog is freshly groomed, clean, fluffy. White or soft neutral background, professional studio lighting, high-quality pet photography. Photorealistic, no cartoon, no illustration. 4K quality.`

        const response = await openai.images.generate({
          model: 'dall-e-3',
          prompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
          style: 'natural',
        })

        previews.push({
          styleId: style.id,
          name: style.name,
          description: style.description,
          imageUrl: response.data?.[0]?.url ?? '',
        })
      }
    } catch (err) {
      console.error(`[generateGroomingPreview] Error for style ${style.id}:`, err)
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
