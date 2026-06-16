import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import {authRouter} from './routes/auth.routes'
import { reviewRouter } from './routes/review.routes'

const app = express()
app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.use('/reviews', reviewRouter)
app.use('/auth', authRouter)

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

export default app