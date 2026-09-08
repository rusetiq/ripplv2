/* html-to-image embeds webfonts by reading document.styleSheets, which throws a
   SecurityError for the cross-origin Google Fonts link. Without embedded faces
   the exported PNG falls back to a system serif, so the card that gets shared
   looks nothing like the one on screen. This fetches the face declarations and
   inlines the font files itself, and is cached for the session. */
const FONT_CSS_URL = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap'
const FILE_PATTERN = /url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/g

let pending: Promise<string> | null = null

async function asDataUrl(url: string): Promise<string> {
  const blob = await fetch(url).then(response => response.blob())
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

/* Google serves one @font-face block per unicode range. Only the latin block is
   ever drawn here, so the rest would be a few hundred kilobytes of nothing. */
function latinOnly(css: string): string {
  const blocks = css.split('@font-face').slice(1)
  const latin = blocks.filter(block => /unicode-range:\s*U\+0000/i.test(block))
  const chosen = latin.length ? latin : blocks
  return chosen.map(block => `@font-face${block}`).join('\n')
}

export function brandFontEmbedCss(): Promise<string> {
  if (!pending) {
    pending = (async () => {
      try {
        const css = latinOnly(await fetch(FONT_CSS_URL).then(response => response.text()))
        const files = [...new Set([...css.matchAll(FILE_PATTERN)].map(match => match[1]))]
        const inlined = new Map(
          await Promise.all(files.map(async file => [file, await asDataUrl(file)] as const)),
        )
        return css.replace(FILE_PATTERN, (whole, file: string) => {
          const data = inlined.get(file)
          return data ? `url(${data})` : whole
        })
      } catch {
        // Offline or blocked: the export still renders, just in a fallback face.
        return ''
      }
    })()
  }
  return pending
}
