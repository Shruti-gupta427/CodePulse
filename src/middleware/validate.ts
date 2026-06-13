import { z } from 'zod'
import { Request, Response, NextFunction } from 'express'

export const validate = (schema: z.ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)  

    if (!result.success) {
      return res.status(400).json({
        error: 'wrong request',
        fields: result.error.flatten().fieldErrors
      })
    }

    req.body = result.data  
    next()                
  }