import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { signOut } from 'firebase/auth'
import { auth, googleProvider, signInWithPopup } from '../lib/firebase.js'
import { api } from '../api.js'
import type { User } from '../types.js'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  loginWithGoogle: async () => {},
  logout: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('menu-codexa-token')
    if (!token) {
      setIsLoading(false)
      return
    }

    api('/api/auth/me')
      .then((data) => setUser(data as User))
      .catch(() => {
        localStorage.removeItem('menu-codexa-token')
      })
      .finally(() => setIsLoading(false))
  }, [])

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider)
    const idToken = await result.user.getIdToken()
    const data = await api<{ token: string; user: User }>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    })
    localStorage.setItem('menu-codexa-token', data.token)
    setUser(data.user)
  }

  const logout = async () => {
    await signOut(auth)
    localStorage.removeItem('menu-codexa-token')
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, isLoading, loginWithGoogle, logout }}>{children}</AuthContext.Provider>
}
