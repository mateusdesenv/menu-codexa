import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, useToast } from 'codexa-ui'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    try {
      await loginWithGoogle()
      navigate('/')
    } catch (err) {
      toast.add('Falha no login. Tente novamente.', 'danger')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <Card padding="large" style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <h1 style={{ margin: '0 0 8px' }}>Menu Codexa</h1>
        <p style={{ color: 'var(--ds-gray, #6d7480)', margin: '0 0 24px' }}>
          Monte seu cardápio pessoal e decida com facilidade o que cozinhar hoje.
        </p>
        <Button onClick={handleLogin} loading={loading} fullWidth>
          Entrar com Google
        </Button>
      </Card>
    </div>
  )
}
