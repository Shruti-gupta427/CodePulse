import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'
import { env } from '../config/env'

export const authenticate =
  (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization
    const token = authHeader?.split(' ')[1]
    if(!token){
        return res.status(400).json({error: 'authorization failed'})
    }
    try {
  const payload = jwt.verify(token, env.JWT_SECRET as string) as { userId: string }
  req.user = { id: payload.userId, email: '' }
  next()
} catch {
  return res.status(401).json({ error: 'Invalid or expired token' })
}               
  }