import dotenv from 'dotenv'

dotenv.config()

export const config = {
  port: Number(process.env.PORT || 3333),
  mongoUri: process.env.MONGO_URI!,
  firebaseApiKey: process.env.FIREBASE_API_KEY!,
  jwtSecret: process.env.JWT_SECRET!,
}

if (!config.mongoUri || !config.firebaseApiKey || !config.jwtSecret) {
  throw new Error('Missing required environment variables')
}
