import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../middleware/validate'
import * as authService from '../services/auth.services'

const validationSchema = z.object({
  email:    z.string(),
password: z.string().min(6, 'Password must be at least 6 characters'),
  
})
const router = Router();

router.post('/register' , validate(validationSchema), async (req, res) =>{
    try {
    const result = await authService.register(req.body.email, req.body.password)
    res.status(201).json(result)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

router.post('/login', validate(validationSchema), async (req, res) => {
  try {
    const result = await authService.login(req.body.email, req.body.password)
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})
router.post('/refresh', async (req, res) => {
  const { token } = req.body
  if (!token) return res.status(400).json({ error: 'Token required' })

  try {
    const result = authService.refresh(token)
    res.json(result)
  } catch (err: any) {
    res.status(401).json({ error: err.message })
  }
})
export { router as authRouter }