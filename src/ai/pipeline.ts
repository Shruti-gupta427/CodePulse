import { buildPrompt }   from './promptBuilder'
import { aiBreaker }     from './openaiGateway'
import { parseResponse } from './responseParser'
import { prisma }        from '../config/prisma'
export const runAIPipeline = async (reviewId: string) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId }
  })
  if (!review) throw new Error('Review not found')
  const { system, user } = buildPrompt(review.code, review.language)
  const raw = await aiBreaker.fire(system, user)
  const result = parseResponse(raw as string)
  return result
}