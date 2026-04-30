/**
 * Image compression utility — reduces image size before sending to OpenAI API.
 * Targets: max 1024px longest side, ~80% JPEG quality, ~500KB output.
 */
export interface CompressedImage {
  file: File
  base64: string
  originalSizeKB: number
  compressedSizeKB: number
}

export async function compressImageForAPI(file: File): Promise<CompressedImage> {
  const originalSizeKB = Math.round(file.size / 1024)

  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = () => {
      img.src = reader.result as string
    }

    img.onload = () => {
      // Calculate target dimensions
      const MAX_DIM = 1024
      let { width, height } = img

      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.round((height * MAX_DIM) / width)
          width = MAX_DIM
        } else {
          width = Math.round((width * MAX_DIM) / height)
          height = MAX_DIM
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      // Try JPEG at 0.75 quality first; adjust if still too large
      let quality = 0.75
      let dataUrl = canvas.toDataURL('image/jpeg', quality)
      let blob = dataURLtoBlob(dataUrl)

      // Reduce quality if > 600KB
      if (blob.size > 600 * 1024) {
        quality = 0.55
        dataUrl = canvas.toDataURL('image/jpeg', quality)
        blob = dataURLtoBlob(dataUrl)
      }

      // Fallback: further reduce if still > 800KB
      if (blob.size > 800 * 1024) {
        quality = 0.4
        dataUrl = canvas.toDataURL('image/jpeg', quality)
        blob = dataURLtoBlob(dataUrl)
      }

      const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
        type: 'image/jpeg',
      })

      const compressedSizeKB = Math.round(compressedFile.size / 1024)
      const base64 = dataUrl.split(',')[1] // Strip data URL prefix

      resolve({
        file: compressedFile,
        base64,
        originalSizeKB,
        compressedSizeKB,
      })
    }

    img.onerror = () => reject(new Error('Failed to load image for compression'))
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

function dataURLtoBlob(dataURL: string): Blob {
  const parts = dataURL.split(',')
  const mime = parts[0].match(/:(.*?);/)?.[1] ?? 'image/jpeg'
  const bytes = atob(parts[1])
  const buf = new ArrayBuffer(bytes.length)
  const arr = new Uint8Array(buf)
  for (let i = 0; i < bytes.length; i++) {
    arr[i] = bytes.charCodeAt(i)
  }
  return new Blob([buf], { type: mime })
}
