import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Input, Badge, EmptyState, useToast } from 'codexa-ui'
import { api } from '../api'
import type { List } from '../types'

export default function Lists() {
  const navigate = useNavigate()
  const toast = useToast()
  const [lists, setLists] = useState<List[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    api<{ lists: List[] }>('/api/lists')
      .then((data) => setLists(data.lists))
      .catch(() => toast.add('Erro ao carregar listas', 'danger'))
  }

  useEffect(() => {
    load()
  }, [toast])

  const handleCreate = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await api<{ id: string }>('/api/lists', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      })
      setName('')
      setDescription('')
      load()
      toast.add('Lista criada', 'success')
    } catch {
      toast.add('Erro ao criar lista', 'danger')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir esta lista? Os pratos também serão removidos.')) return
    try {
      await api(`/api/lists/${id}`, { method: 'DELETE' })
      load()
      toast.add('Lista excluída', 'success')
    } catch {
      toast.add('Erro ao excluir lista', 'danger')
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Minhas listas</h1>
      </div>

      <Card padding="medium" style={{ marginBottom: 24 }}>
        <div className="form-grid" style={{ maxWidth: 600 }}>
          <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            label="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button onClick={handleCreate} loading={saving}>
            Criar lista
          </Button>
        </div>
      </Card>

      {lists.length === 0 ? (
        <EmptyState
          icon="info"
          title="Nenhuma lista"
          description="Crie sua primeira lista de pratos para começar."
        />
      ) : (
        <div className="catalog-grid">
          {lists.map((list) => (
            <Card key={list.id} interactive padding="medium" onClick={() => navigate(`/lists/${list.id}`)}>
              <h3>{list.name}</h3>
              <p>{list.description || 'Sem descrição'}</p>
              <div className="dish-meta">
                <Badge tone={list.permission === 'owner' ? 'success' : 'neutral'} size="small">
                  {list.permission === 'owner' ? 'proprietário' : list.permission}
                </Badge>
              </div>
              {list.permission === 'owner' && (
                <div style={{ marginTop: 12 }}>
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(list.id)
                    }}
                  >
                    Excluir
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
