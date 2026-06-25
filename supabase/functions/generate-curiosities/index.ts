import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const categories = [
  { key: 'science & nature', label: 'Science and Nature' },
  { key: 'psychology', label: 'Psychology and Human Behavior' },
  { key: 'history & politics', label: 'History and Politics' },
  { key: 'philosophy', label: 'Philosophy and Ideas' },
  { key: 'technology', label: 'Technology and the Future' },
  { key: 'art & culture', label: 'Art and Culture' },
  { key: 'economics & society', label: 'Economics and Society' },
  { key: 'language & words', label: 'Language and Words' },
]

function extractText(data: any): string {
  // Log the full response so we can see exactly what Gemini returned
  console.log('Gemini raw response:', JSON.stringify(data, null, 2))

  if (data.error) {
    throw new Error(`Gemini API error: ${JSON.stringify(data.error)}`)
  }

  if (!data.candidates || data.candidates.length === 0) {
    const reason = data.promptFeedback?.blockReason ?? 'unknown'
    throw new Error(`No candidates in response. blockReason: ${reason}. Full response logged above.`)
  }

  const candidate = data.candidates[0]

  if (candidate.finishReason && candidate.finishReason !== 'STOP') {
    throw new Error(`Candidate finish reason: ${candidate.finishReason}`)
  }

  const text = candidate.content?.parts?.[0]?.text
  if (!text) {
    throw new Error(`No text in candidate: ${JSON.stringify(candidate)}`)
  }

  return text
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SERVICE_ROLE_KEY')!
  )

  const results = []

  for (const category of categories) {
    try {
      const prompt = `Generate 5 fascinating curiosities about ${category.label}.

Rules:
- hook: max 60 characters, surprising and specific, never vague
- body: max 120 characters, the complete fact in 1-2 sentences, self-contained
- deepDive: 3-4 sentences of extra context and detail
- Tone: smart friend, not Wikipedia. Surprising, with a twist
- Can be serious or completely trivial but fascinating
- Never motivational, never self-help

Respond ONLY with a valid JSON array, no markdown, no preamble:
[{"hook":"...","body":"...","deepDive":"...","angle":"how_did_we_get_here","surpriseType":"nobody_knows","tags":["tag1"]}]

Valid angle values: how_did_we_get_here, why_people_act, whats_coming_next, who_has_power
Valid surpriseType values: nobody_knows, challenges_belief, explains_wonder, wildly_unexpected`

      console.log(`Calling Gemini for category: ${category.key}`)

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key=${Deno.env.get('GEMINI_API_KEY')}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.9 },
          }),
        }
      )

      console.log(`Gemini HTTP status: ${geminiResponse.status}`)
      const data = await geminiResponse.json()

      const text = extractText(data)
      const clean = text.replace(/```json|```/g, '').trim()

      let curiosities: any[]
      try {
        curiosities = JSON.parse(clean)
      } catch (parseErr) {
        throw new Error(`JSON parse failed. Raw text: ${text}`)
      }

      if (!Array.isArray(curiosities) || curiosities.length === 0) {
        throw new Error(`Expected array, got: ${typeof curiosities}`)
      }

      const rows = curiosities.map((c: any) => ({
        category: category.key,
        angle: c.angle,
        surprise_type: c.surpriseType,
        hook: c.hook,
        body: c.body,
        deep_dive: c.deepDive,
        tags: c.tags,
      }))

      const { error } = await supabase.from('curiosities').insert(rows)
      if (error) throw new Error(`Supabase insert error: ${JSON.stringify(error)}`)

      results.push({ category: category.key, count: rows.length, status: 'ok' })
      await delay(4000)
    } catch (err) {
      console.error(`Error for category ${category.key}:`, err)
      results.push({ category: category.key, status: 'error', error: String(err) })
    }
  }

  return new Response(JSON.stringify({ results }, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  })
})
