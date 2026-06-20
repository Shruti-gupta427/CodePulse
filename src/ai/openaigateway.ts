import Groq from 'groq-sdk'
import { env } from '../config/env'
import CircuitBreaker from 'opossum'

const client = new Groq({ apiKey: env.GROQ_API_KEY })

const callAI = async (system: string, user: string): Promise<string> => {
  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',  // free + very capable
    messages: [
      { role: 'system', content: system },
      { role: 'user',   content: user }
    ],
    response_format: { type: 'json_object' },
    max_tokens: 2000
  })
  return response.choices[0]?.message?.content ?? ''
}

export const aiBreaker = new CircuitBreaker(callAI, {
  timeout: 30000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000
})

aiBreaker.on('open',     () => console.warn('Circuit OPEN — AI is down'))
aiBreaker.on('halfOpen', () => console.warn('Circuit testing AI...'))
aiBreaker.on('close',    () => console.log('Circuit CLOSED — AI is back'))