import React, { useState, useEffect } from 'react'
import { BaseTrigger, BaseCondition, FieldDefinition, EventTypeDefinition, EventFilter, Operator } from '../../core/types'
import { ChevronDown, ChevronUp, Plus, Trash2, AlertCircle, CheckCircle, Edit3, Filter } from 'lucide-react'
import { InfoTooltip } from '../ui/info-tooltip'
import { EventSelector } from './EventSelector'

interface TriggerConfiguratorProps {
  trigger: BaseTrigger
  eventType: EventTypeDefinition
  onUpdate: (trigger: BaseTrigger) => void
  onDelete: () => void
  index: number
  totalTriggers: number
  availableFields: FieldDefinition[]
  availableEvents?: any[] // EventTypeUI[]
  onEventChange?: (newEventKey: string) => void
  excludeEvents?: string[]
}

export function TriggerConfigurator({
  trigger,
  eventType,
  onUpdate,
  onDelete,
  index,
  totalTriggers,
  availableFields,
  availableEvents,
  onEventChange,
  excludeEvents
}: TriggerConfiguratorProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showEventSelector, setShowEventSelector] = useState(false)

  const getCategoryIcon = () => {
    switch (eventType.category) {
      case 'sportsbook':
        return '⚽'
      case 'casino':
        return '🎰'
      case 'live_casino':
        return '🎲'
      case 'general':
        return '💰'
      default:
        return '📌'
    }
  }

  const getCategoryColor = () => {
    switch (eventType.category) {
      case 'sportsbook':
        return 'border-green-500 bg-green-50'
      case 'casino':
        return 'border-purple-500 bg-purple-50'
      case 'live_casino':
        return 'border-pink-500 bg-pink-50'
      case 'general':
        return 'border-blue-500 bg-blue-50'
      default:
        return 'border-gray-500 bg-gray-50'
    }
  }



  return (
    <div className={`border-2 rounded-lg overflow-hidden transition-all ${getCategoryColor()}`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-opacity-80"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getCategoryIcon()}</span>
          <div>
            <h4 className="font-semibold text-gray-900">
              Trigger {index + 1}: {eventType.label}
            </h4>
            <p className="text-xs text-gray-600">{eventType.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {availableEvents && onEventChange && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowEventSelector(true)
              }}
              className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
              title="Alterar tipo de evento"
            >
              <Edit3 size={16} />
            </button>
          )}
          {totalTriggers > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
              title="Remover trigger"
            >
              <Trash2 size={16} />
            </button>
          )}
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-white p-4 space-y-4">
          {/* Basic Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-1">
                Debounce (Anti-Spam)
                <InfoTooltip
                  title="O que é Debounce?"
                  content="Evita que o evento seja processado múltiplas vezes em sequência rápida."
                  examples={[
                    "5000ms = Aguarda 5 segundos entre verificações",
                    "0 = Processa instantaneamente"
                  ]}
                  variant="help"
                />
              </label>
              <input
                type="number"
                value={trigger.debounce || ''}
                onChange={(e) => onUpdate({ ...trigger, debounce: Number(e.target.value) || undefined })}
                placeholder="Ex: 5000"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-1">
                Agregação
                <InfoTooltip
                  title="Como agregar valores?"
                  content="Define como múltiplos eventos são combinados."
                  examples={[
                    "sum: Soma todos os valores",
                    "count: Conta número de vezes",
                    "max: Pega o maior valor"
                  ]}
                  variant="help"
                />
              </label>
              <select
                value={trigger.aggregation || ''}
                onChange={(e) => onUpdate({ ...trigger, aggregation: e.target.value as any || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Nenhuma</option>
                <option value="sum">Soma</option>
                <option value="count">Contagem</option>
                <option value="avg">Média</option>
                <option value="max">Máximo</option>
                <option value="min">Mínimo</option>
              </select>
            </div>
          </div>

          {/* Label and Required */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-1">
                Label do Trigger
                <InfoTooltip
                  title="Label do Trigger"
                  content="Nome descritivo para este trigger, usado na interface."
                  examples={[
                    "Apostas Esportivas",
                    "Depósitos de Alto Valor",
                    "Giros em Slots"
                  ]}
                  variant="help"
                />
              </label>
              <input
                type="text"
                value={trigger.label || ''}
                onChange={(e) => onUpdate({ ...trigger, label: e.target.value || undefined })}
                placeholder="Ex: Apostas Esportivas"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-1">
                Obrigatório
                <InfoTooltip
                  title="Trigger Obrigatório"
                  content="Para missões multi-produto, define se este trigger é obrigatório."
                  examples={[
                    "Obrigatório: Deve acontecer para completar a missão",
                    "Opcional: Pode acontecer OU outro trigger"
                  ]}
                  variant="help"
                />
              </label>
              <select
                value={trigger.required ? 'true' : 'false'}
                onChange={(e) => onUpdate({ ...trigger, required: e.target.value === 'true' })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="false">Opcional</option>
                <option value="true">Obrigatório</option>
              </select>
            </div>
          </div>

          {/* Unified Filters Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Filter size={16} />
                Filtros do Trigger
                <InfoTooltip
                  title="Filtros Unificados"
                  content="Todos os filtros (valor, esporte, método, etc.) agora ficam no trigger. Definem exatamente quais eventos devem ser capturados."
                  examples={[
                    "amount >= 100: Apenas eventos com valor >= R$ 100",
                    "sport == 'futebol': Apenas apostas de futebol",
                    "sport in ['futebol', 'basquete']: Futebol OU basquete",
                    "payment_method == 'pix': Apenas depósitos via PIX"
                  ]}
                  variant="help"
                />
              </h5>
              <button
                onClick={() => {
                  const newFilters = [...(trigger.filters || []), { field: '', operator: '==' as Operator, value: '' }]
                  onUpdate({ ...trigger, filters: newFilters })
                }}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
              >
                <Plus size={14} />
                Adicionar Filtro
              </button>
            </div>

            {(!trigger.filters || trigger.filters.length === 0) && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-900 font-medium mb-2">💡 Filtros te ajudam a ser específico</p>
                <div className="text-xs text-blue-800 space-y-1">
                  <p><strong>Exemplo 1:</strong> Esporte "está em" ['futebol', 'basquete'] = apostas de futebol OU basquete</p>
                  <p><strong>Exemplo 2:</strong> Valor "maior ou igual" 100 = apenas apostas de R$ 100+</p>
                  <p><strong>Exemplo 3:</strong> Sem filtros = captura TODAS as apostas esportivas</p>
                </div>
                <button
                  onClick={() => {
                    const newFilters = [...(trigger.filters || []), { field: '', operator: 'in' as Operator, value: [] }]
                    onUpdate({ ...trigger, filters: newFilters })
                  }}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  + Adicionar primeiro filtro
                </button>
              </div>
            )}

            {trigger.filters?.map((filter, filterIndex) => (
              <FilterRow
                key={filterIndex}
                filter={filter}
                availableFields={availableFields}
                onUpdate={(updatedFilter) => {
                  const newFilters = [...(trigger.filters || [])]
                  newFilters[filterIndex] = updatedFilter
                  onUpdate({ ...trigger, filters: newFilters })
                }}
                onDelete={() => {
                  const newFilters = (trigger.filters || []).filter((_, i) => i !== filterIndex)
                  onUpdate({ ...trigger, filters: newFilters.length > 0 ? newFilters : undefined })
                }}
              />
            ))}
          </div>

          {/* Trigger Summary & Role Explanation */}
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <p className="text-sm text-green-900 mb-2">
              <strong>Este trigger captura:</strong>
            </p>
            <ul className="text-sm text-green-800 ml-4 list-disc space-y-1">
              <li>Evento: {eventType.label}{trigger.label && ` (${trigger.label})`}</li>
              {trigger.aggregation && (
                <li>Agregação: {trigger.aggregation}</li>
              )}
              {trigger.debounce && (
                <li>Anti-spam: {trigger.debounce}ms</li>
              )}
              {trigger.filters && trigger.filters.length > 0 && (
                <li>Filtros: {trigger.filters.length} condição(ões) aplicada(s)</li>
              )}
              {trigger.required && (
                <li className="text-orange-700">✓ Trigger obrigatório</li>
              )}
            </ul>
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
              <p className="text-xs text-blue-800 font-medium">
                🎯 <strong>Nova Arquitetura:</strong> Triggers agora contêm filtros unificados
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Tudo que você precisa filtrar (valor, esporte, método, etc.) fica aqui no trigger.
                Condições externas são apenas para regras de negócio (tier do usuário, limites, etc.).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Event Selector Modal */}
      {showEventSelector && availableEvents && onEventChange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Alterar Tipo de Evento</h2>
              <button
                onClick={() => setShowEventSelector(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <EventSelector
                availableEvents={availableEvents}
                value={trigger.event}
                onChange={(eventKey) => {
                  onEventChange(eventKey)
                  setShowEventSelector(false)
                }}
                excludeEvents={excludeEvents}
                placeholder="Selecionar novo tipo de evento..."
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Filter Row Component
interface FilterRowProps {
  filter: EventFilter
  availableFields: FieldDefinition[]
  onUpdate: (filter: EventFilter) => void
  onDelete: () => void
}

function FilterRow({ filter, availableFields, onUpdate, onDelete }: FilterRowProps) {
  const operators: { value: Operator; label: string }[] = [
    { value: '==', label: 'Igual a' },
    { value: '!=', label: 'Diferente de' },
    { value: '>', label: 'Maior que' },
    { value: '>=', label: 'Maior ou igual' },
    { value: '<', label: 'Menor que' },
    { value: '<=', label: 'Menor ou igual' },
    { value: 'in', label: 'Está em' },
    { value: 'not_in', label: 'Não está em' },
    { value: 'contains', label: 'Contém' },
    { value: 'not_contains', label: 'Não contém' },
    { value: 'exists', label: 'Existe' },
    { value: 'not_exists', label: 'Não existe' }
  ]

  const selectedField = availableFields.find(f => f.name === filter.field)

  return (
    <div className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded">
      {/* Field */}
      <div className="flex-1">
        <select
          value={filter.field}
          onChange={(e) => onUpdate({ ...filter, field: e.target.value })}
          className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Selecionar campo...</option>
          {availableFields.map(field => (
            <option key={field.name} value={field.name}>
              {field.label}
            </option>
          ))}
        </select>
      </div>

      {/* Operator */}
      <div className="flex-1">
        <select
          value={filter.operator}
          onChange={(e) => onUpdate({ ...filter, operator: e.target.value as Operator })}
          className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {operators.map(op => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>
      </div>

      {/* Value */}
      <div className="flex-1">
        {/* Multiple values for 'in' and 'not_in' operators */}
        {(filter.operator === 'in' || filter.operator === 'not_in') && selectedField?.type === 'enum' && selectedField.options ? (
          <MultiSelectField
            selectedValues={Array.isArray(filter.value) ? filter.value : (filter.value ? [filter.value] : [])}
            options={selectedField.options}
            onChange={(values) => onUpdate({ ...filter, value: values })}
            placeholder={filter.operator === 'in' ? 'Selecionar opções...' : 'Excluir opções...'}
          />
        ) : selectedField?.type === 'enum' && selectedField.options ? (
          <select
            value={filter.value}
            onChange={(e) => onUpdate({ ...filter, value: e.target.value })}
            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Selecionar...</option>
            {selectedField.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : selectedField?.type === 'boolean' ? (
          <select
            value={filter.value}
            onChange={(e) => onUpdate({ ...filter, value: e.target.value === 'true' })}
            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Selecionar...</option>
            <option value="true">Sim</option>
            <option value="false">Não</option>
          </select>
        ) : (filter.operator === 'in' || filter.operator === 'not_in') ? (
          <input
            type="text"
            value={Array.isArray(filter.value) ? filter.value.join(', ') : filter.value || ''}
            onChange={(e) => {
              const values = e.target.value.split(',').map(v => v.trim()).filter(v => v)
              onUpdate({ ...filter, value: values })
            }}
            placeholder={filter.operator === 'in' ? 'valor1, valor2, valor3...' : 'excluir1, excluir2...'}
            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        ) : (
          <input
            type={selectedField?.type === 'number' || selectedField?.type === 'currency' ? 'number' : 'text'}
            value={filter.value}
            onChange={(e) => {
              const value = selectedField?.type === 'number' || selectedField?.type === 'currency'
                ? Number(e.target.value) || ''
                : e.target.value
              onUpdate({ ...filter, value })
            }}
            placeholder={selectedField?.placeholder || 'Valor...'}
            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        )}
      </div>

      {/* Delete */}
      <button
        onClick={onDelete}
        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
        title="Remover filtro"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}

// Multi Select Field for 'in' and 'not_in' operators
interface MultiSelectFieldProps {
  selectedValues: string[]
  options: Array<{ value: string | number; label: string }>
  onChange: (values: string[]) => void
  placeholder: string
}

function MultiSelectField({ selectedValues, options, onChange, placeholder }: MultiSelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleOption = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value))
    } else {
      onChange([...selectedValues, value])
    }
  }

  const selectedLabels = selectedValues
    .map(value => options.find(opt => String(opt.value) === value)?.label || value)
    .join(', ')

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-left bg-white"
      >
        {selectedValues.length > 0 ? (
          <span className="text-gray-900">
            {selectedLabels.length > 30 ? `${selectedLabels.substring(0, 30)}...` : selectedLabels}
          </span>
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
        <span className="float-right">▼</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded shadow-lg z-10 max-h-48 overflow-y-auto">
          {options.map(option => (
            <label
              key={option.value}
              className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 cursor-pointer text-xs"
            >
              <input
                type="checkbox"
                checked={selectedValues.includes(String(option.value))}
                onChange={() => toggleOption(String(option.value))}
                className="text-blue-600 text-xs"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}