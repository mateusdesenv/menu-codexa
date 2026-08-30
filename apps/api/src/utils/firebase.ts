import { config } from '../config.js'
import type { FirebaseUserInfo } from '../types.js'

export async function verifyFirebaseIdToken(idToken: string): Promise<FirebaseUserInfo | null> {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${config.firebaseApiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  })

  if (!response.ok) {
    const body = await response.text()
    console.error('Firebase token lookup failed', response.status, body)
    return null
  }

  const data = (await response.json()) as { users?: FirebaseUserInfo[] }
  const user = data.users?.[0]

  if (!user?.localId) {
    return null
  }

  return user
}
