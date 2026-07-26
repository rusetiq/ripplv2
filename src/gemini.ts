export interface VerificationResult {
  confidence: number
  reason: string
  action: string
  category: string
  points: number
}

export async function verifyActionPhoto(imageBase64: string): Promise<VerificationResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) {
    return { confidence: 100, reason: 'No API key configured - auto-approved', action: 'Walked instead of drove', category: 'transport', points: 20 }
  }

  const model = 'gemini-3.1-flash-lite'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: `You are a sustainability action verifier.

Analyze the photo evidence provided. Identify the sustainability action shown (transport, food, energy, water, or waste reduction). Even if it's not a standard action, if it is sustainable, accept it and provide a concise name for it.

Assign a reasonable point value (10-100) based on the action's impact.

Respond with ONLY valid JSON (no markdown, no backticks) in this exact format:
{"confidence": 0-100, "reason": "brief 1-sentence explanation", "action": "name of action", "category": "transport/food/energy/water/waste", "points": 10-100}` },
          { inline_data: { mime_type: 'image/jpeg', data: base64Data } }
        ]
      }]
    })
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini API error: ${res.status} - ${err}`)
  }

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''

  try {
    const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
    return JSON.parse(cleaned) as VerificationResult
  } catch {
    return { confidence: 0, reason: 'Could not parse result', action: 'Unknown action', category: 'waste', points: 5 }
  }
}

