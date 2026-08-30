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
      <div className="login-hero">
        <div className="login-hero-content">
          <img src={menuCodexaLogo} alt="Menu Codexa" height="48" />
          <h2 className="login-hero-title">
            Seu cardápio pessoal, organizado e prático.
          </h2>
          <p className="login-hero-description">
            Monte listas de pratos, convide amigos e deixe o Menu Codexa
            decidir o que cozinhar hoje. Tudo em um só lugar.
          </p>
          <ul className="login-hero-features">
            <li>
              <Icon name="check-circle" size={20} />
              <span>Crie e gerencie seus pratos favoritos</span>
            </li>
            <li>
              <Icon name="check-circle" size={20} />
              <span>Monte cardápios e listas para qualquer ocasião</span>
            </li>
            <li>
              <Icon name="check-circle" size={20} />
              <span>Convide amigos e sorteie o menu do dia</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="login-form">
        <Card padding="large" className="login-card">
          <h1 className="login-title">Bem-vindo</h1>
          <p className="login-description">
            Entre para montar seu cardápio e decidir com facilidade o que
            cozinhar hoje.
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
    </div>
  )
}
