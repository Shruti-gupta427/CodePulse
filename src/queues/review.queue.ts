import { Queue } from 'bullmq'
import { env } from '../config/env'
import {redis} from '../config/redis'
export const reviewQueue = new Queue('review-queue', {
  connection: { url: env.REDIS_URL },
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  }
})