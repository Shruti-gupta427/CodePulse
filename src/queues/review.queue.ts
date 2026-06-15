import { Queue } from 'bullmq'
import {redis} from '../config/redis'
export const reviewQueue = new Queue('review-queue', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  }
})