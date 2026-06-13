import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../middleware/validate'
import {authenticate} from '../middleware/autenticate'
import * as reviewService from '../services/review.service'

const router = Router()
const reviewSchema = z.object({
  code:     z.string().min(1, 'Code cannot be empty').max(50000),
  language: z.enum(['javascript', 'typescript', 'python', 'go', 'java', 'cpp'])
})

router.post('/',authenticate, validate(reviewSchema),async (req,res)=>{
       try {
          const result = await reviewService.createReview(req.user!.id, req.body.code, req.body.language)
          res.status(201).json(result)
        } catch (err: any) {
          res.status(400).json({ error: err.message })
        }
})
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await reviewService.getReviews(req.user!.id) 
    res.json(result)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await reviewService.getReviewwithIssues(req.params.id, req.user!.id)
    if (!result) return res.status(404).json({ error: 'Review not found' })
    res.json(result)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

export { router as reviewRouter }