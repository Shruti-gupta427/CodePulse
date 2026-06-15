import type { Request, Response, NextFunction } from 'express'
import { redis } from '../config/redis'

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  const key = `rate:${req.user!.id}`
  const now = Date.now()
  const oneHourAgo = now - 3600 * 1000  // 3600 seconds in ms

  const pipe = redis.pipeline()
  pipe.zremrangebyscore(key, '-inf', oneHourAgo) 
  pipe.zadd(key, now, `${now}`)               
  pipe.zcard(key)                             
  pipe.expire(key, 3600)                    

  const results = await pipe.exec()
  const count = (results?.[2]?.[1] as number) ?? 0       // zcard result is at index 2

  if (count > 10) {                       // max requests per hour
    return res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: '1 hour'
    })
  }

  next()
}