import { app } from './app.js'
import { connectDb } from './db.js'
import { config } from './config.js'

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
