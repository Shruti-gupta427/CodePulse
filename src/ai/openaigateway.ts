import OpenAI from 'openai'
import { env } from '../config/env'
import CircuitBreaker from 'opossum'
const client = new OpenAI({ apiKey: env.OPENAI_API_KEY })
const callOpenAI = async (system: string, user: string): Promise<string> => {
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: system },
      { role: 'user',   content: user }
    ],
    response_format: { type: 'json_object' },
    max_tokens: 2000
  })
  return response.choices[0]?.message?.content ?? ''
}
export const aiBreaker = new CircuitBreaker(callOpenAI, {
  timeout: 30000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000
})
aiBreaker.on('open',     () => console.warn('Circuit OPEN ,OpenAI is down'))
aiBreaker.on('halfOpen', () => console.warn('Circuit testing OpenAI...'))
aiBreaker.on('close',    () => console.log('Circuit CLOSED, OpenAI is back'))