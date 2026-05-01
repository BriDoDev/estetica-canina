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

function buildEditPrompt(styleName: string): string {
  const details: Record<string, string> = {
    'Teddy Bear':
      'round fluffy even cut all over, fur trimmed to equal rounded length like a teddy bear',
    'Puppy Cut': 'short uniform cut all over the body, 1-2 inches length, neat tidy puppy look',
    'Lion Cut': 'body shaved very short, full voluminous mane around head/neck, fluffy tail pompom',
    'Estándar de Raza': 'breed standard professional show cut, precise elegant grooming',
  }
  return `Same dog, same background, same lighting, same pose. Only change: give the dog a ${styleName} haircut. ${details[styleName] ?? styleName}. Keep the dog's face, eyes, body shape, and background completely unchanged. Preserve 90% of the original image.`
}

function createTransparentMask(width: number, height: number): Buffer {
  // RGBA buffer: fully transparent (all zeros = alpha 0 = editable area)
  return Buffer.alloc(width * height * 4, 0)
}

function getImageDimensions(base64: string): { width: number; height: number } | null {
  try {
    const buf = Buffer.from(base64, 'base64')
    // JPEG: starts with FF D8 FF
    if (buf[0] === 0xff && buf[1] === 0xd8) {
      // Parse JPEG header for dimensions
      let i = 2
      while (i < buf.length - 1) {
        if (buf[i] === 0xff) {
          const marker = buf[i + 1]
          if (marker === 0xc0 || marker === 0xc2) {
            const h = buf.readUInt16BE(i + 5)
            const w = buf.readUInt16BE(i + 7)
            return { width: w, height: h }
          }
          i += 2 + buf.readUInt16BE(i + 2)
        } else {
          i++
        }
      }
    }
    // PNG: check IHDR
    if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
      const w = buf.readUInt32BE(16)
      const h = buf.readUInt32BE(20)
      return { width: w, height: h }
    }
  } catch {
    /* fall through */
  }
  return null
}

export async function generateGroomingPreview(
  breed: string,
  count = 1,
  imageBase64?: string,
  imageMimeType?: string,
): Promise<GroomingStylePreview[]> {
  const styles = GROOMING_STYLES.slice(0, Math.min(count, GROOMING_STYLES.length))
  const previews: GroomingStylePreview[] = []

  // If we have an image, use DALL-E 2 edit for faithful results
  // Without image, fall back to DALL-E 3 text-to-image
  const hasImage = !!imageBase64

  for (const style of styles) {
    try {
      if (hasImage && imageBase64) {
        const imageBuffer = Buffer.from(imageBase64, 'base64')
        const mime = imageMimeType ?? 'image/png'

        // Get dimensions for mask
        const dims = getImageDimensions(imageBase64) ?? { width: 1024, height: 1024 }
        const maskBuffer = createTransparentMask(dims.width, dims.height)

        const formData = new FormData()
        const imageBlob = new Blob([new Uint8Array(imageBuffer)], { type: mime })
        const maskBlob = new Blob([new Uint8Array(maskBuffer)], { type: 'image/png' })
        formData.append('image', imageBlob, 'pet.png')
        formData.append('mask', maskBlob, 'mask.png')
        formData.append('prompt', buildEditPrompt(style.name))
        formData.append('n', '1')
        formData.append('size', '1024x1024')

        const response = await fetch('https://api.openai.com/v1/images/edits', {
          method: 'POST',
          headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
          body: formData,
        })
        const json = await response.json()
        const url = json?.data?.[0]?.url ?? ''
        if (!url) {
          console.warn(
            `[Grooming] DALL-E 2 no URL for ${style.id}:`,
            JSON.stringify(json).slice(0, 300),
          )
        }
        previews.push({
          styleId: style.id,
          name: style.name,
          description: style.description,
          imageUrl: url,
        })
      } else {
        // Fallback: DALL-E 3 text-to-image
        const prompt = `Professional studio photograph of a freshly groomed ${breed} dog with a ${style.name} style. ${style.description}. Clean white background, professional pet photography lighting, high quality 4K, photorealistic. The dog looks happy and beautiful.`

        const response = await openai.images.generate({
          model: 'dall-e-3',
          prompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
          style: 'natural',
        })
        const url = response.data?.[0]?.url ?? ''
        previews.push({
          styleId: style.id,
          name: style.name,
          description: style.description,
          imageUrl: url,
        })
      }
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
