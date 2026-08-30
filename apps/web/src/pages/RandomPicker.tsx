import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, FilterChip, Select, EmptyState, useToast, Badge } from 'codexa-ui'
import { api } from '../api'
import type { Dish, List } from '../types'

export default function RandomPicker() {
  const navigate = useNavigate()
  const toast = useToast()
  const [lists, setLists] = useState<List[]>([])
  const [listId, setListId] = useState('')
  const [quickFilter, setQuickFilter] = useState(false)
  const [leftoversFilter, setLeftoversFilter] = useState(false)
  const [tag, setTag] = useState('')
  const [result, setResult] = useState<Dish | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api<{ lists: List[] }>('/api/lists')
      .then((data) => setLists(data.lists))
      .catch(() => toast.add('Erro ao carregar listas', 'danger'))
  }, [toast])

  const handleDraw = async () => {
    setLoading(true)
    setResult(null)
    try {
      const params = new URLSearchParams()
      if (listId) params.set('listId', listId)
      if (tag) params.set('tag', tag)
      if (quickFilter) params.set('isQuick', 'true')
      if (leftoversFilter) params.set('yieldsLeftovers', 'true')

      const data = await api<{ dish: Dish }>(`/api/random?${params}`)
      setResult(data.dish)
    } catch (err: any) {
      toast.add(err?.message || 'Nenhum prato encontrado com esses filtros', 'warning')
    } finally {
      setLoading(false)
    }
  }

  const allTags = ['rápido', 'marmita', 'jantar', 'almoço', 'café da manhã', 'lanche', 'sobremesa', 'saudável', 'conforto', 'vegetariano']

  return (
    <div>
      <div className="page-header">
        <h1>Sorteador de refeições</h1>
      </div>

      <Card padding="large">
        <h3 style={{ marginTop: 0 }}>Filtros</h3>
        <div className="form-grid" style={{ maxWidth: 600 }}>
          <Select
            label="Lista"
            value={listId}
            onChange={(value) => setListId(value)}
            options={[{ value: '', label: 'Todas as listas' }, ...lists.map((l) => ({ value: l.id, label: l.name }))]}
          />
          <Select
            label="Característica"
            value={tag}
            onChange={(value) => setTag(value)}
            options={[{ value: '', label: 'Qualquer' }, ...allTags.map((t) => ({ value: t, label: t }))]}
          />
          <div className="actions-row">
            <FilterChip active={quickFilter} onClick={() => setQuickFilter((v) => !v)}>
              Rápido
            </FilterChip>
            <FilterChip active={leftoversFilter} onClick={() => setLeftoversFilter((v) => !v)}>
              Rende marmita
            </FilterChip>
          </div>
          <Button onClick={handleDraw} loading={loading} size="large">
            Sortear refeição
          </Button>
        </div>
      </Card>

      {result && (
        <Card padding="large" style={{ marginTop: 24 }} className="random-result">
          <p style={{ color: 'var(--ds-green-dark)', fontWeight: 600, margin: '0 0 8px' }}>O prato escolhido foi:</p>
          <h2>{result.name}</h2>
          <p style={{ color: 'var(--ds-gray)' }}>{result.description || 'Sem descrição'}</p>
          <div className="dish-meta" style={{ justifyContent: 'center', margin: '16px 0' }}>
            {result.prepTimeMinutes ? <Badge size="small">{result.prepTimeMinutes} min</Badge> : null}
            {result.isQuick ? <Badge tone="success" size="small">rápido</Badge> : null}
            {result.yieldsLeftovers ? <Badge tone="info" size="small">marmita</Badge> : null}
          </div>
          <div className="actions-row" style={{ justifyContent: 'center' }}>
            <Button variant="secondary" onClick={handleDraw}>
              Sortear novamente
            </Button>
            <Button onClick={() => navigate(`/dishes/${result.id}`)}>Ver prato</Button>
          </div>
        </Card>
      )}

      {!result && !loading && (
        <div style={{ marginTop: 24 }}>
          <EmptyState
            icon="refresh"
            title="Ainda não sorteamos"
            description="Escolha os filtros e clique em Sortear para descobrir o que cozinhar."
          />
        </div>
      )}
    </div>
  )
}
