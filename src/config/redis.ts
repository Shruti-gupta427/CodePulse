import Redis from 'ioredis'
import { env } from './env'
import { createIORedisClient } from 'bullmq'

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null
})

redis.on('connect', () => console.log('Redis connected'))
redis.on('error', (err) => console.error('Redis error:', err))
