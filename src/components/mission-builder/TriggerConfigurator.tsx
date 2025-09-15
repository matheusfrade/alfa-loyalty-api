import React, { useState, useEffect } from 'react'
import { BaseTrigger, BaseCondition, FieldDefinition, EventTypeDefinition } from '../../core/types'
import { ChevronDown, ChevronUp, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react'
import { InfoTooltip } from '../ui/info-tooltip'

interface TriggerConfiguratorProps {
  trigger: BaseTrigger
  eventType: EventTypeDefinition
  onUpdate: (trigger: BaseTrigger) => void
  onDelete: () => void
  index: number
  totalTriggers: number
  availableFields: FieldDefinition[]
}

export function TriggerConfigurator({
  trigger,
  eventType,
  onUpdate,
  onDelete,
  index,
  totalTriggers,
  availableFields
}: TriggerConfiguratorProps) {
  const [isExpanded, setIsExpanded] = useState(true)

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

          {/* Trigger Summary & Role Explanation */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-sm text-blue-900 mb-2">
              <strong>Este trigger monitora:</strong>
            </p>
            <ul className="text-sm text-blue-800 ml-4 list-disc space-y-1">
              <li>Evento: {eventType.label}</li>
              {trigger.aggregation && (
                <li>Agregação: {trigger.aggregation}</li>
              )}
              {trigger.debounce && (
                <li>Anti-spam: {trigger.debounce}ms</li>
              )}
            </ul>
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-xs text-yellow-800 font-medium">
                🎯 <strong>Triggers definem QUANDO verificar</strong>
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                As condições específicas (O QUE verificar) são configuradas nas "Condições da Regra" na próxima seção.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}