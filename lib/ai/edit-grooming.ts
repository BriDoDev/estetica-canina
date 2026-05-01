import OpenAI, { toFile } from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export interface GroomingEditResult {
  styleId: string
  name: string
  description: string
  base64: string
}

export async function editPetPhotoWithStyle(
  imageBase64: string,
  mimeType: string,
  styleId: string,
  styleName: string,
  styleDescription: string,
): Promise<GroomingEditResult> {
  const buffer = Buffer.from(imageBase64, 'base64')
  const file = await toFile(buffer, `pet-photo.${mimeType.split('/')[1] ?? 'png'}`, {
    type: mimeType,
  })

  const prompt = [
    `Transform this dog's haircut to a ${styleName} style — ${styleDescription}.`,
    'Keep EVERYTHING else IDENTICAL:',
    '- The dog\'s face, eyes, nose, and facial expression must remain EXACTLY the same',
    '- The dog\'s body position and pose must stay unchanged',
    '- The background, lighting, floor, and overall scene must be identical',
    '- Collar, accessories, and any objects must stay the same',
    '- Only the fur length, texture, and style should change to match the new haircut',
    '- The dog should look like the SAME dog, not a different dog',
    'Result must be photorealistic and natural.',
  ].join(' ')

  const response = await openai.images.edit({
    model: 'gpt-image-1.5',
    image: file,
    prompt,
    input_fidelity: 'high',
    background: 'opaque',
    output_format: 'png',
    size: 'auto',
    response_format: 'b64_json',
  })

  const base64 = response.data?.[0]?.b64_json ?? ''
  if (!base64) {
    console.warn(
      `[EditGrooming] gpt-image-1.5 no b64_json for ${styleId}:`,
      JSON.stringify(response).slice(0, 300),
    )
  }

  return {
    styleId,
    name: styleName,
    description: styleDescription,
    base64,
  }
}
