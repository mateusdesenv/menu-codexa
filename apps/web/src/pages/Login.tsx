import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, useToast, Icon } from 'codexa-ui'
import { useAuth } from '../contexts/AuthContext'
import menuCodexaLogo from 'codexa-ui/logos/menu-codexa-logo-variations/horizontal-primary-light.svg'

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
    <div className="login-page">
      <div className="login-illustration" aria-hidden="true" />
      <Card padding="large" className="login-card">
        <div className="login-brand">
          <img src={menuCodexaLogo} alt="Menu Codexa" height="40" />
        </div>
        <h1 className="login-title">Bem-vindo</h1>
        <p className="login-description">
          Monte seu cardápio pessoal e decida com facilidade o que cozinhar hoje.
        </p>
        <Button
          onClick={handleLogin}
          loading={loading}
          fullWidth
          size="large"
          leadingIcon={<Icon name="login" size={20} />}
        >
          Entrar com Google
        </Button>
        <p className="login-footer">
          Ao entrar, você concorda com os termos de uso.
        </p>
      </Card>
    </div>
  )
}
