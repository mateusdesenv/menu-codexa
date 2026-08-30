import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Card, Input, Select, Badge, Avatar, useToast } from 'codexa-ui'
import { api } from '../api'
import type { Dish, List } from '../types'

export default function ListDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const [list, setList] = useState<List | null>(null)
  const [dishes, setDishes] = useState<Dish[]>([])
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'view' | 'edit'>('view')
  const [loading, setLoading] = useState(false)

  const load = () => {
    if (!id) return
    api<List>(`/api/lists/${id}`)
      .then(setList)
      .catch(() => toast.add('Erro ao carregar lista', 'danger'))
    api<{ dishes: Dish[] }>(`/api/dishes?listId=${id}`)
      .then((data) => setDishes(data.dishes))
      .catch(() => toast.add('Erro ao carregar pratos', 'danger'))
  }

  useEffect(() => {
    load()
  }, [id, toast])

  const handleShare = async () => {
    if (!id || !email.trim() || !list) return
    setLoading(true)
    try {
      const data = await api<List>(`/api/lists/${id}/shares`, {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), role }),
      })
      setList(data)
      setEmail('')
      toast.add('Compartilhamento atualizado', 'success')
    } catch (err: any) {
      toast.add(err?.message || 'Erro ao compartilhar', 'danger')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveShare = async (userId: string) => {
    if (!id) return
    try {
      const data = await api<List>(`/api/lists/${id}/shares/${userId}`, { method: 'DELETE' })
      setList(data)
      toast.add('Membro removido', 'success')
    } catch {
      toast.add('Erro ao remover membro', 'danger')
    }
  }

  const canEdit = list?.permission === 'owner' || list?.permission === 'edit'

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{list?.name}</h1>
          <p style={{ color: 'var(--ds-gray)', margin: 0 }}>{list?.description}</p>
        </div>
        <div className="actions-row">
          {canEdit && <Button onClick={() => navigate('/dishes/new', { state: { listId: id } })}>Novo prato</Button>}
        </div>
      </div>

      {list?.permission === 'owner' && (
        <Card padding="medium" style={{ marginBottom: 24 }}>
          <h3 style={{ marginTop: 0 }}>Compartilhar</h3>
          <div className="form-grid" style={{ maxWidth: 600 }}>
            <Input
              label="E-mail do amigo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@email.com"
            />
            <Select
              label="Permissão"
              value={role}
              onChange={(value) => setRole(value as 'view' | 'edit')}
              options={[
                { value: 'view', label: 'Visualizar' },
                { value: 'edit', label: 'Editar' },
              ]}
            />
            <Button onClick={handleShare} loading={loading}>
              Convidar
            </Button>
          </div>
          <div className="section-list" style={{ marginTop: 16 }}>
            {list.members.map((m) => (
              <div key={m.userId} className="member-row">
                <span>
                  <Avatar name={m.userId} size="small" />
                  <span style={{ marginLeft: 8 }}>{m.role}</span>
                </span>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => handleRemoveShare(m.userId)}
                >
                  Remover
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <h2 style={{ fontSize: '1.25rem', margin: '0 0 16px' }}>Pratos</h2>
      {dishes.length === 0 ? (
        <p style={{ color: 'var(--ds-gray)' }}>Nenhum prato nesta lista ainda.</p>
      ) : (
        <div className="catalog-grid">
          {dishes.map((dish) => (
            <Card
              key={dish.id}
              interactive
              padding="medium"
              className="dish-card"
              onClick={() => navigate(`/dishes/${dish.id}`)}
            >
              <h3>{dish.name}</h3>
              <p>{dish.description || 'Sem descrição'}</p>
              <div className="dish-meta">
                {dish.prepTimeMinutes ? <Badge size="small">{dish.prepTimeMinutes} min</Badge> : null}
                {dish.isQuick ? <Badge tone="success" size="small">rápido</Badge> : null}
                {dish.yieldsLeftovers ? <Badge tone="info" size="small">marmita</Badge> : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
