import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, FilterChip, SearchInput, Badge, EmptyState, useToast } from 'codexa-ui'
import { api } from '../api'
import type { Dish, List } from '../types'

export default function Home() {
  const navigate = useNavigate()
  const toast = useToast()
  const [dishes, setDishes] = useState<Dish[]>([])
  const [lists, setLists] = useState<List[]>([])
  const [search, setSearch] = useState('')
  const [selectedList, setSelectedList] = useState('')
  const [quickFilter, setQuickFilter] = useState(false)
  const [leftoversFilter, setLeftoversFilter] = useState(false)
  const [loading, setLoading] = useState(false)

  const query = useMemo(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (selectedList) params.set('listId', selectedList)
    if (quickFilter) params.set('isQuick', 'true')
    if (leftoversFilter) params.set('yieldsLeftovers', 'true')
    return params.toString()
  }, [search, selectedList, quickFilter, leftoversFilter])

  useEffect(() => {
    api<{ lists: List[] }>('/api/lists')
      .then((data) => setLists(data.lists))
      .catch(() => toast.add('Erro ao carregar listas', 'danger'))
  }, [toast])

  useEffect(() => {
    setLoading(true)
    api<{ dishes: Dish[] }>(`/api/dishes?${query}`)
      .then((data) => setDishes(data.dishes))
      .catch(() => toast.add('Erro ao carregar pratos', 'danger'))
      .finally(() => setLoading(false))
  }, [query, toast])

  const listName = useMemo(
    () => lists.find((l) => l.id === selectedList)?.name || 'Todas as listas',
    [lists, selectedList],
  )

  return (
    <div>
      <div className="page-header">
        <h1>Cardápio</h1>
        <div className="actions-row">
          <Button variant="secondary" onClick={() => navigate('/random')}>
            Sortear refeição
          </Button>
          <Button onClick={() => navigate('/dishes/new')}>Novo prato</Button>
        </div>
      </div>

      <div className="filters-bar">
        <SearchInput
          label="Buscar"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          placeholder="Pesquisar prato..."
        />
        <select
          value={selectedList}
          onChange={(e) => setSelectedList(e.target.value)}
          className="ds-select ds-select--medium"
        >
          <option value="">Todas as listas</option>
          {lists.map((list) => (
            <option key={list.id} value={list.id}>
              {list.name}
            </option>
          ))}
        </select>
        <FilterChip active={quickFilter} onClick={() => setQuickFilter((v) => !v)}>
          Rápido
        </FilterChip>
        <FilterChip active={leftoversFilter} onClick={() => setLeftoversFilter((v) => !v)}>
          Rende marmita
        </FilterChip>
      </div>

      {loading ? (
        <p style={{ color: 'var(--ds-gray)' }}>Carregando...</p>
      ) : dishes.length === 0 ? (
        <EmptyState
          icon="info"
          title="Nenhum prato encontrado"
          description={`${listName} ainda não tem pratos para esses filtros.`}
          action={<Button onClick={() => navigate('/dishes/new')}>Cadastrar primeiro prato</Button>}
        />
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
              <div className="tags">
                {dish.tags.slice(0, 4).map((tag) => (
                  <Badge key={tag} size="small" tone="neutral">
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
