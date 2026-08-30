import express from 'express'
import cors from 'cors'
import { config } from './config.js'
import { connectDb } from './db.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import listRoutes from './routes/lists.js'
import dishRoutes from './routes/dishes.js'
import friendRoutes from './routes/friends.js'
import randomRoutes from './routes/random.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => res.json({ ok: true }))

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/lists', listRoutes)
app.use('/api/dishes', dishRoutes)
app.use('/api/friends', friendRoutes)
app.use('/api/random', randomRoutes)

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  })
})

async function main() {
  await connectDb()
  app.listen(config.port, () => {
    console.log(`API running on http://localhost:${config.port}`)
  })
}

main().catch((err) => {
  console.error('Failed to start API', err)
  process.exit(1)
})
