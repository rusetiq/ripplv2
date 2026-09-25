export class UnreadableImageError extends Error {
  constructor() {
    super('That image could not be read. Try a JPEG or PNG.')
    this.name = 'UnreadableImageError'
  }
}

/* Phone cameras produce images far larger than anything the feed shows, and a
   tall portrait shot constrained only by width still lands on an oversized
   canvas, so both axes are capped. Photos now travel as binary to R2 rather
   than as base64 in a database row, so this returns a Blob. */
export function compressImage(file: File, maxEdge = 1280, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let w = img.naturalWidth || img.width
        let h = img.naturalHeight || img.height
        if (!w || !h) {
          reject(new UnreadableImageError())
          return
        }
        const scale = Math.min(1, maxEdge / Math.max(w, h))
        canvas.width = w = Math.round(w * scale)
        canvas.height = h = Math.round(h * scale)
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new UnreadableImageError())
          return
        }
        ctx.drawImage(img, 0, 0, w, h)
        canvas.toBlob(
          blob => (blob ? resolve(blob) : reject(new UnreadableImageError())),
          'image/jpeg',
          quality,
        )
      }
      // Formats the browser cannot decode (a HEIC picked from Files, for one)
      // fail here rather than silently producing a blank post.
      img.onerror = () => reject(new UnreadableImageError())
      img.src = reader.result as string
    }
    reader.onerror = () => reject(new UnreadableImageError())
    reader.readAsDataURL(file)
  })
}

export const previewUrl = (blob: Blob) => URL.createObjectURL(blob)
