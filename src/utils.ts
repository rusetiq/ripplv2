export class UnreadableImageError extends Error {
  constructor() {
    super('That image could not be read. Try a JPEG or PNG.')
    this.name = 'UnreadableImageError'
  }
}

/* Phone cameras produce images far larger than anything the feed shows, and a
   tall portrait shot constrained only by width still lands on an oversized
   canvas, so both axes are capped. */
export function compressImage(file: File, maxEdge = 900, quality = 0.7): Promise<string> {
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
        w = Math.round(w * scale)
        h = Math.round(h * scale)
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new UnreadableImageError())
          return
        }
        ctx.drawImage(img, 0, 0, w, h)
        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        if (dataUrl.length > 1048000) {
          if (quality > 0.3) {
            resolve(compressImage(file, maxEdge, quality - 0.2))
          } else if (maxEdge > 640) {
            resolve(compressImage(file, 640, 0.6))
          } else {
            resolve(canvas.toDataURL('image/jpeg', 0.2))
          }
        } else {
          resolve(dataUrl)
        }
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
