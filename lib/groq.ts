import Groq from 'groq-sdk'

let groqClient: Groq | null = null

function getGroqClient(): Groq {
  if (!groqClient) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY environment variable is not set')
    }
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY })
  }
  return groqClient
}

const SUMMARY_SYSTEM_PROMPT = `You are an expert article summarizer. When given article text, provide a clear, concise summary that:
- Captures the main argument or thesis
- Highlights 3-5 key points as bullet points
- Notes any important conclusions or takeaways
- Is written in plain, readable English
- Is approximately 150-250 words

Format your response as:
**Summary**
[1-2 sentence overview]

**Key Points**
• [point 1]
• [point 2]
• [point 3]
...

**Takeaway**
[1 sentence conclusion]`

export async function streamSummary(
  articleText: string,
  onChunk: (chunk: string) => void
): Promise<string> {
  const client = getGroqClient()

  // Truncate to avoid token limits (Groq free tier: 6000 tokens/min)
  const truncated = articleText.slice(0, 12000)

  const stream = await client.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: SUMMARY_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Please summarize the following article:\n\n${truncated}`,
      },
    ],
    stream: true,
    max_tokens: 600,
  })

  let fullText = ''
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content ?? ''
    if (delta) {
      fullText += delta
      onChunk(delta)
    }
  }

  return fullText
}
