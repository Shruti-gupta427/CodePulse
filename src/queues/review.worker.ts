import { Worker } from 'bullmq'
import { prisma } from '../config/prisma'
import { runAIPipeline } from '../ai/pipeline'
import { env } from '../config/env'


export const reviewWorker = new Worker('review-queue', async (job) => {
  const { reviewId } = job.data
  console.log(`Processing review ${reviewId}`)

  await prisma.review.update({
    where: { id: reviewId },
    data: { status: 'PROCESSING' }
  })

  
  const result = await runAIPipeline(reviewId)

  await prisma.review.update({
    where: { id: reviewId },
    data: { 
      status: 'COMPLETED',
      score: result.score,
      summary: result.summary,
      completedAt: new Date(),
      issues: { create: result.issues }

    }
  })

}, { connection: { url: env.REDIS_URL }, concurrency: 3 })

reviewWorker.on('completed', (job) => {
  console.log(`Review ${job.id} completed`)
})

reviewWorker.on('failed', (job, err) => {
  console.error(`Review ${job?.id} failed:`, err.message)
})