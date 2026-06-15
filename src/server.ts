import 'dotenv/config'
import { env } from './config/env'
import app from './app'
import './queues/review.worker'  

const PORT = parseInt(env.PORT)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})