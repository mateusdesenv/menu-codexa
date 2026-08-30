import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Card, Badge, Tag, useToast } from 'codexa-ui'
import { api } from '../api'
import type { Dish } from '../types'

export default function DishDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const [dish, setDish] = useState<Dish | null>(null)
  const [canEdit, setCanEdit] = useState(false)

  useEffect(() => {
    if (!id) return
    api<Dish>(`/api/dishes/${id}`)
      .then((data) => {
        setDish(data)
      })
      .catch(() => toast.add('Erro ao carregar prato', 'danger'))
  }, [id, toast])

  useEffect(() => {
    if (!dish) return
    api<{ lists: any[] }>('/api/lists')
      .then((data) => {
        const list = data.lists.find((l) => l.id === dish.listId)
        setCanEdit(list?.permission === 'owner' || list?.permission === 'edit')
      })
      .catch(() => {})
  }, [dish])

  const handleDelete = async () => {
    if (!id || !confirm('Deseja excluir este prato?')) return
    try {
      await api(`/api/dishes/${id}`, { method: 'DELETE' })
      toast.add('Prato excluído', 'success')
      navigate('/')
    } catch {
      toast.add('Erro ao excluir prato', 'danger')
    }
  }

  if (!dish) return <p style={{ color: 'var(--ds-gray)' }}>Carregando...</p>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{dish.name}</h1>
          <div className="dish-meta">
            {dish.prepTimeMinutes ? <Badge size="small">{dish.prepTimeMinutes} min</Badge> : null}
            {dish.isQuick ? <Badge tone="success" size="small">rápido</Badge> : null}
            {dish.yieldsLeftovers ? <Badge tone="info" size="small">marmita</Badge> : null}
          </div>
        </div>
        <div className="actions-row">
          {canEdit && (
            <>
              <Button variant="secondary" onClick={() => navigate(`/dishes/${dish.id}/edit`)}>
                Editar
              </Button>
              <Button variant="ghost" onClick={handleDelete}>
                Excluir
              </Button>
            </>
          )}
        </div>
      </div>

      {dish.description && <p style={{ marginBottom: 24 }}>{dish.description}</p>}

      <div className="dish-meta" style={{ marginBottom: 24 }}>
        {dish.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>

      <div className="catalog-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        <Card padding="medium">
          <h3 style={{ marginTop: 0 }}>Ingredientes necessários</h3>
          {dish.requiredIngredients.length === 0 ? (
            <p style={{ color: 'var(--ds-gray)' }}>Nenhum ingrediente cadastrado.</p>
          ) : (
            <ul>
              {dish.requiredIngredients.map((item, index) => (
                <li key={index}>
                  <span className="ingredient-name">{item.name}</span>
                  {item.quantity && <span className="ingredient-quantity"> — {item.quantity}</span>}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card padding="medium">
          <h3 style={{ marginTop: 0 }}>Ingredientes opcionais</h3>
          {dish.optionalIngredients.length === 0 ? (
            <p style={{ color: 'var(--ds-gray)' }}>Nenhum ingrediente opcional.</p>
          ) : (
            <ul>
              {dish.optionalIngredients.map((item, index) => (
                <li key={index}>
                  <span className="ingredient-name">{item.name}</span>
                  {item.quantity && <span className="ingredient-quantity"> — {item.quantity}</span>}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {dish.notes && (
        <Card padding="medium" style={{ marginTop: 24 }}>
          <h3 style={{ marginTop: 0 }}>Anotações</h3>
          <p style={{ whiteSpace: 'pre-wrap' }}>{dish.notes}</p>
        </Card>
      )}
    </div>
  )
}
