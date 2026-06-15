import { Worker } from 'bullmq'
import { redis } from '../config/redis'
import { prisma } from '../config/prisma'

export const reviewWorker = new Worker('review-queue', async (job) => {
  const { reviewId } = job.data
  console.log(`Processing review ${reviewId}`)

  await prisma.review.update({
    where: { id: reviewId },
    data: { status: 'PROCESSING' }
  })

  // to add ai pipeline
  
  await new Promise(resolve => setTimeout(resolve, 2000))

  await prisma.review.update({
    where: { id: reviewId },
    data: { 
      status: 'COMPLETED',
      completedAt: new Date()
    }
  })

}, { connection: redis, concurrency: 3 })

reviewWorker.on('completed', (job) => {
  console.log(`Review ${job.id} completed`)
})

reviewWorker.on('failed', (job, err) => {
  console.error(`Review ${job?.id} failed:`, err.message)
})