import { useEffect, useState } from 'react'
import { Button, Card, Input, Badge, EmptyState, useToast } from 'codexa-ui'
import { api } from '../api'
import type { Friendship, User } from '../types'

export default function Friends() {
  const toast = useToast()
  const [friendships, setFriendships] = useState<Friendship[]>([])
  const [email, setEmail] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  const load = () => {
    api<{ friendships: Friendship[] }>('/api/friends')
      .then((data) => setFriendships(data.friendships))
      .catch(() => toast.add('Erro ao carregar amigos', 'danger'))
  }

  useEffect(() => {
    load()
  }, [toast])

  useEffect(() => {
    if (!email.trim()) {
      setSearchResults([])
      return
    }
    const timer = setTimeout(() => {
      api<{ users: User[] }>(`/api/users/search?email=${encodeURIComponent(email.trim())}`)
        .then((data) => setSearchResults(data.users))
        .catch(() => setSearchResults([]))
    }, 400)
    return () => clearTimeout(timer)
  }, [email])

  const handleSend = async (targetEmail: string) => {
    setLoading(true)
    try {
      await api('/api/friends', {
        method: 'POST',
        body: JSON.stringify({ email: targetEmail }),
      })
      setEmail('')
      setSearchResults([])
      load()
      toast.add('Convite enviado', 'success')
    } catch (err: any) {
      toast.add(err?.message || 'Erro ao enviar convite', 'danger')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (friendshipId: string) => {
    try {
      await api(`/api/friends/${friendshipId}/accept`, { method: 'PATCH' })
      load()
      toast.add('Amigo adicionado', 'success')
    } catch {
      toast.add('Erro ao aceitar convite', 'danger')
    }
  }

  const handleRemove = async (friendshipId: string) => {
    try {
      await api(`/api/friends/${friendshipId}`, { method: 'DELETE' })
      load()
      toast.add('Removido', 'success')
    } catch {
      toast.add('Erro ao remover', 'danger')
    }
  }

  const pending = friendships.filter((f) => f.status === 'pending')
  const accepted = friendships.filter((f) => f.status === 'accepted')

  return (
    <div>
      <div className="page-header">
        <h1>Amigos</h1>
      </div>

      <Card padding="medium" style={{ marginBottom: 24 }}>
        <h3 style={{ marginTop: 0 }}>Adicionar por e-mail</h3>
        <div className="form-grid" style={{ maxWidth: 600 }}>
          <Input
            label="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="exemplo@email.com"
          />
          {searchResults.length > 0 && (
            <div className="section-list">
              {searchResults.map((u) => (
                <div key={u.id} className="friend-row">
                  <span>{u.name} ({u.email})</span>
                  <Button size="small" onClick={() => handleSend(u.email)} loading={loading}>
                    Adicionar
                  </Button>
                </div>
              ))}
            </div>
          )}
          <Button onClick={() => handleSend(email)} loading={loading}>
            Enviar convite
          </Button>
        </div>
      </Card>

      {pending.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.25rem', margin: '0 0 16px' }}>Convites pendentes</h2>
          <div className="section-list">
            {pending.map((f) => (
              <Card key={f.id} padding="small">
                <div className="friend-row">
                  <span>
                    <strong>{f.otherUser.name}</strong> — {f.otherUser.email}
                    <span style={{ marginLeft: 8 }}>
                      <Badge tone="warning" size="small">
                        {f.direction === 'received' ? 'recebido' : 'enviado'}
                      </Badge>
                    </span>
                  </span>
                  {f.direction === 'received' ? (
                    <Button size="small" onClick={() => handleAccept(f.id)}>
                      Aceitar
                    </Button>
                  ) : (
                    <Button variant="ghost" size="small" onClick={() => handleRemove(f.id)}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <h2 style={{ fontSize: '1.25rem', margin: '0 0 16px' }}>Meus amigos</h2>
      {accepted.length === 0 ? (
        <EmptyState
          icon="users"
          title="Nenhum amigo"
          description="Adicione pessoas pelo e-mail para compartilhar listas."
        />
      ) : (
        <div className="section-list">
          {accepted.map((f) => (
            <Card key={f.id} padding="small">
              <div className="friend-row">
                <span>
                  <strong>{f.otherUser.name}</strong> — {f.otherUser.email}
                </span>
                <Button variant="ghost" size="small" onClick={() => handleRemove(f.id)}>
                  Remover
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
