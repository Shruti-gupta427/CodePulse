import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  PORT:                  z.string().default('3000'),
  NODE_ENV:              z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL:          z.string(),
  REDIS_URL:             z.string(),
  JWT_SECRET:            z.string().min(8),
  JWT_REFRESH_SECRET:    z.string().min(8),
  JWT_EXPIRES_IN:        z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  GROQ_API_KEY:        z.string(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {s
  console.error('Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)  
}

// export the clean validated env
export const env = parsed.data