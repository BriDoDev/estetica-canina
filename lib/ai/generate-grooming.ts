import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export interface GroomingStylePreview {
  styleId: string
  name: string
  description: string
  imageUrl: string
}

export interface PetVisualFeatures {
  furColor: string
  furPattern: string
  faceDescription: string
  earType: string
  size: string
  distinctiveFeatures: string
  fullDescription: string
}

const GROOMING_STYLES = [
  { id: 'teddy_bear', name: 'Teddy Bear', description: 'Corte redondeado y esponjoso' },
  { id: 'puppy_cut', name: 'Puppy Cut', description: 'Corte uniforme corto en todo el cuerpo' },
  { id: 'lion_cut', name: 'Lion Cut', description: 'Cuerpo rapado con melena y pompón en la cola' },
  { id: 'breed_standard', name: 'Estándar de Raza', description: 'Corte según el estándar de la raza' },
]

/**
 * Extract detailed visual features from a pet photo using GPT-4o-mini (vision).
 * These features drive the image-to-image pipeline: DALL-E 3 uses them to
 * generate grooming previews that resemble the specific dog in the photo.
 */
export async function extractPetVisualFeatures(
  imageBase64: string,
  imageMimeType: string
): Promise<PetVisualFeatures | null> {
  const prompt = `Analyze this dog photo and describe its exact visual appearance for AI image generation purposes.
Focus on objective, reproducible visual details. Do NOT guess the breed — just describe what you see.

Return ONLY a valid JSON object (no markdown fences, no extra text) with these exact keys:
{
  "furColor": "detailed fur colors including any gradients, patches, or multi-color patterns",
  "furPattern": "fur pattern (solid, brindle, merle, spotted, patched, sable, etc.)",
  "faceDescription": "detailed face — snout length/shape, eye color, expression, head shape, nose color",
  "earType": "ear type (floppy/drop, pointed/pricked, folded, rose, button) and position",
  "size": "estimated size category: toy, small, medium, large",
  "distinctiveFeatures": "any unique markings, white patches, eye patches, collar, or notable traits",
  "fullDescription": "ONE paragraph: a highly detailed, photorealistic description of this EXACT dog suitable for an AI image generator. Include ALL visual details — fur colors, pattern, markings, face shape, ear type, body proportions, expression. Write it so another AI could recreate this specific dog."
}`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${imageMimeType};base64,${imageBase64}`,
                detail: 'high',
              },
            },
            { type: 'text', text: prompt },
          ],
        },
      ],
      max_tokens: 800,
      temperature: 0.3,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      console.warn('[Img2Img] GPT-4o-mini returned empty response')
      return null
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.warn('[Img2Img] Could not parse JSON from GPT-4o-mini response:', content.slice(0, 200))
      return null
    }

    return JSON.parse(jsonMatch[0]) as PetVisualFeatures
  } catch (err) {
    console.error('[Img2Img] Feature extraction failed:', err)
    return null
  }
}

/**
 * Enhance a DALL-E prompt using local Ollama (qwen2.5-coder).
 * Takes the visual features + style and produces a more creative,
 * natural-language prompt optimized for DALL-E 3.
 * Falls back to the original prompt if Ollama is unavailable.
 */
async function enhancePromptWithOllama(
  basePrompt: string,
  styleName: string
): Promise<string> {
  const ollamaPrompt = `You are a professional AI image prompt engineer. Enhance this DALL-E 3 prompt for a dog grooming preview. Make it more vivid, descriptive, and photorealistic while keeping all factual details intact. Add professional photography terminology. Return ONLY the enhanced prompt text, nothing else.

STYLE: ${styleName}
ORIGINAL PROMPT: ${basePrompt}

ENHANCED PROMPT:`

  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5-coder:7b',
        prompt: ollamaPrompt,
        stream: false,
        options: { temperature: 0.7, max_tokens: 300 },
      }),
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) throw new Error(`Ollama status ${response.status}`)
    const data = await response.json()
    const enhanced = data.response?.trim()
    if (enhanced && enhanced.length > 50) {
      console.log('[Img2Img] Ollama prompt enhancement applied')
      return enhanced
    }
    throw new Error('Ollama response too short')
  } catch (err) {
    console.warn('[Img2Img] Ollama enhancement skipped:', (err as Error).message)
    return basePrompt
  }
}

function buildPrompt(
  breed: string,
  styleName: string,
  styleDesc: string,
  features?: PetVisualFeatures | null
): string {
  const styleDetails: Record<string, string> = {
    'Teddy Bear': 'round fluffy even cut all over, all fur trimmed to equal rounded length, teddy bear look',
    'Puppy Cut': 'short uniform cut all over the body, 1-2 inches length, neat tidy puppy look',
    'Lion Cut': 'body shaved very short, full voluminous mane around head and neck, fluffy tail pompom, dramatic lion look',
    'Estándar de Raza': 'breed standard show cut, precise elegant professional grooming',
  }
  const detail = styleDetails[styleName] ?? styleDesc

  // Image-to-image mode: describe the specific dog
  if (features?.fullDescription) {
    return [
      'Professional studio photograph of a freshly groomed dog.',
      `GROOMING STYLE: ${detail} (${styleName}).`,
      `THE DOG: ${features.fullDescription}`,
      `VISUAL DETAILS — Fur: ${features.furColor} (${features.furPattern}). Face: ${features.faceDescription}. Ears: ${features.earType}. Size: ${features.size}. Distinctive: ${features.distinctiveFeatures || 'none'}.`,
      'Clean white studio background, professional pet photography lighting, 4K, photorealistic, no illustration, no cartoon. The dog looks happy, clean, and beautiful. CRITICAL: the dog must match the description above exactly.',
    ].join(' ')
  }

  // Fallback: generic breed-based prompt (no reference photo)
  return `Professional studio photograph of a freshly groomed ${breed} dog with ${detail}. Clean white background, professional pet photography lighting, high quality 4K, photorealistic, no illustration no cartoon. The dog looks happy, clean, and beautiful.`
}

export async function generateGroomingPreview(
  breed: string,
  count = 1,
  features?: PetVisualFeatures | null,
): Promise<GroomingStylePreview[]> {
  const styles = GROOMING_STYLES.slice(0, Math.min(count, GROOMING_STYLES.length))
  const previews: GroomingStylePreview[] = []

  for (const style of styles) {
    try {
      let prompt = buildPrompt(breed, style.name, style.description, features)

      // Enhance prompt with Ollama when features are available (image-to-image mode)
      if (features) {
        prompt = await enhancePromptWithOllama(prompt, style.name)
      }

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
