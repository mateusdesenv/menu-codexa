import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Button, Card, Input, Select, Checkbox, Textarea, FilterChip, useToast } from 'codexa-ui'
import { api } from '../api'
import type { Dish, List, Ingredient } from '../types'

const TAG_OPTIONS = [
  'rápido',
  'marmita',
  'jantar',
  'almoço',
  'café da manhã',
  'lanche',
  'sobremesa',
  'saudável',
  'conforto',
  'vegetariano',
]

export default function DishForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const prefillListId = (location.state as any)?.listId as string | undefined

  const [lists, setLists] = useState<List[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [listId, setListId] = useState(prefillListId || '')
  const [required, setRequired] = useState<Ingredient[]>([{ name: '' }])
  const [optional, setOptional] = useState<Ingredient[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [prepTime, setPrepTime] = useState('')
  const [isQuick, setIsQuick] = useState(false)
  const [yieldsLeftovers, setYieldsLeftovers] = useState(false)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api<{ lists: List[] }>('/api/lists')
      .then((data) => {
        setLists(data.lists)
        if (!listId && data.lists.length > 0) setListId(data.lists[0].id)
      })
      .catch(() => toast.add('Erro ao carregar listas', 'danger'))
  }, [toast])

  useEffect(() => {
    if (!id) return
    api<Dish>(`/api/dishes/${id}`)
      .then((dish) => {
        setName(dish.name)
        setDescription(dish.description || '')
        setListId(dish.listId)
        setRequired(dish.requiredIngredients.length ? dish.requiredIngredients : [{ name: '' }])
        setOptional(dish.optionalIngredients)
        setTags(dish.tags)
        setPrepTime(dish.prepTimeMinutes ? String(dish.prepTimeMinutes) : '')
        setIsQuick(dish.isQuick)
        setYieldsLeftovers(dish.yieldsLeftovers)
        setNotes(dish.notes || '')
      })
      .catch(() => toast.add('Erro ao carregar prato', 'danger'))
  }, [id, toast])

  const addIngredient = (type: 'required' | 'optional') => {
    const arr = type === 'required' ? required : optional
    const set = type === 'required' ? setRequired : setOptional
    set([...arr, { name: '' }])
  }

  const updateIngredient = (
    type: 'required' | 'optional',
    index: number,
    field: keyof Ingredient,
    value: string,
  ) => {
    const arr = type === 'required' ? [...required] : [...optional]
    arr[index] = { ...arr[index], [field]: value }
    const set = type === 'required' ? setRequired : setOptional
    set(arr)
  }

  const removeIngredient = (type: 'required' | 'optional', index: number) => {
    const arr = type === 'required' ? [...required] : [...optional]
    arr.splice(index, 1)
    const set = type === 'required' ? setRequired : setOptional
    set(arr)
  }

  const toggleTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const handleSubmit = async () => {
    if (!name.trim() || !listId) {
      toast.add('Preencha o nome e a lista', 'warning')
      return
    }

    const payload = {
      listId,
      name: name.trim(),
      description: description.trim(),
      requiredIngredients: required.filter((i) => i.name.trim()),
      optionalIngredients: optional.filter((i) => i.name.trim()),
      tags,
      prepTimeMinutes: prepTime ? Number(prepTime) : undefined,
      isQuick,
      yieldsLeftovers,
      notes: notes.trim(),
    }

    setSaving(true)
    try {
      if (id) {
        await api(`/api/dishes/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
        toast.add('Prato atualizado', 'success')
      } else {
        await api('/api/dishes', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        toast.add('Prato criado', 'success')
      }
      navigate(listId ? `/lists/${listId}` : '/')
    } catch (err: any) {
      toast.add(err?.message || 'Erro ao salvar prato', 'danger')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>{id ? 'Editar prato' : 'Novo prato'}</h1>
        <div className="actions-row">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} loading={saving}>
            Salvar
          </Button>
        </div>
      </div>

      <Card padding="large">
        <div className="form-grid" style={{ maxWidth: 800 }}>
          <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
          <Select
            label="Lista"
            value={listId}
            onChange={(value) => setListId(value)}
            options={lists.map((l) => ({ value: l.id, label: l.name }))}
            required
          />
          <Textarea
            label="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="form-section">
            <h3>Ingredientes necessários</h3>
            {required.map((item, index) => (
              <div key={index} className="ingredient-row">
                <Input
                  label={index === 0 ? 'Ingrediente' : ''}
                  value={item.name}
                  onChange={(e) => updateIngredient('required', index, 'name', e.target.value)}
                  placeholder="Nome"
                />
                <Input
                  label={index === 0 ? 'Quantidade' : ''}
                  value={item.quantity || ''}
                  onChange={(e) => updateIngredient('required', index, 'quantity', e.target.value)}
                  placeholder="Quantidade"
                />
                <Button variant="ghost" size="small" onClick={() => removeIngredient('required', index)}>
                  Remover
                </Button>
              </div>
            ))}
            <Button variant="secondary" size="small" onClick={() => addIngredient('required')}>
              + ingrediente
            </Button>
          </div>

          <div className="form-section">
            <h3>Ingredientes opcionais</h3>
            {optional.map((item, index) => (
              <div key={index} className="ingredient-row">
                <Input
                  label=""
                  value={item.name}
                  onChange={(e) => updateIngredient('optional', index, 'name', e.target.value)}
                  placeholder="Nome"
                />
                <Input
                  label=""
                  value={item.quantity || ''}
                  onChange={(e) => updateIngredient('optional', index, 'quantity', e.target.value)}
                  placeholder="Quantidade"
                />
                <Button variant="ghost" size="small" onClick={() => removeIngredient('optional', index)}>
                  Remover
                </Button>
              </div>
            ))}
            <Button variant="secondary" size="small" onClick={() => addIngredient('optional')}>
              + opcional
            </Button>
          </div>

          <Input
            label="Tempo de preparo (minutos)"
            type="number"
            value={prepTime}
            onChange={(e) => setPrepTime(e.target.value)}
          />

          <div className="actions-row">
            <Checkbox
              label="Rápido de preparar"
              checked={isQuick}
              onChange={(e) => setIsQuick(e.target.checked)}
            />
            <Checkbox
              label="Rende marmita/sobras"
              checked={yieldsLeftovers}
              onChange={(e) => setYieldsLeftovers(e.target.checked)}
            />
          </div>

          <div>
            <h3 style={{ fontSize: '1rem', margin: '0 0 8px' }}>Características</h3>
            <div className="actions-row">
              {TAG_OPTIONS.map((tag) => (
                <FilterChip
                  key={tag}
                  active={tags.includes(tag)}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </FilterChip>
              ))}
            </div>
          </div>

          <Textarea label="Anotações" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </Card>
    </div>
  )
}
