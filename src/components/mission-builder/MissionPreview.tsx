import React, { useState } from 'react'
import { BaseMissionRule, EventTypeDefinition, FieldDefinition } from '../../core/types'
import { CheckCircle, XCircle, AlertCircle, Zap, Target, Clock, Users, Code, Eye, Copy } from 'lucide-react'

interface MissionPreviewProps {
  rule: BaseMissionRule
  eventTypes: EventTypeDefinition[]
  availableFields?: FieldDefinition[]
  availableFieldsGrouped?: Record<string, { field: FieldDefinition; displayLabel: string }[]>
  className?: string
}

export function MissionPreview({ rule, eventTypes, availableFields = [], availableFieldsGrouped, className = '' }: MissionPreviewProps) {
  const [viewMode, setViewMode] = useState<'visual' | 'json'>('visual')
  const getEventIcon = (eventKey: string) => {
    const event = eventTypes.find(e => e.key === eventKey)
    return event?.icon || '📌'
  }

  const getEventLabel = (eventKey: string) => {
    const event = eventTypes.find(e => e.key === eventKey)
    return event?.label || eventKey
  }

  const getTriggerStatus = (trigger: any) => {
    // Since we removed trigger-specific conditions, triggers are always valid if they have an event
    if (trigger.event) {
      return { status: 'success', message: 'Configurado' }
    }
    return { status: 'error', message: 'Evento não selecionado' }
  }

  const getMissionComplexity = () => {
    const triggerCount = rule.triggers?.length || 0
    const conditionCount = rule.conditions?.length || 0
    const totalConditions = rule.triggers?.reduce((acc, t) => acc + (t.conditions?.length || 0), 0) || 0
    
    if (triggerCount > 1) return 'cross-sell'
    if (totalConditions + conditionCount > 3) return 'complex'
    if (totalConditions + conditionCount > 1) return 'medium'
    return 'simple'
  }

  const getComplexityColor = () => {
    const complexity = getMissionComplexity()
    switch (complexity) {
      case 'cross-sell': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'complex': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  const getComplexityLabel = () => {
    const complexity = getMissionComplexity()
    switch (complexity) {
      case 'cross-sell': return 'Cross-Sell'
      case 'complex': return 'Complexa'
      case 'medium': return 'Média'
      default: return 'Simples'
    }
  }

  const hasValidConfiguration = () => {
    if (!rule.triggers || rule.triggers.length === 0) return false

    // NEW UNIFIED ARCHITECTURE: A mission is valid if it has triggers with events
    // Filters in triggers are optional (they can be "catch all" events)
    // Business rules (conditionTree/businessRules) are optional (rarely used - 5% of cases)

    // Check if all triggers have valid events
    const allTriggersHaveEvents = rule.triggers.every(trigger => trigger.event)

    return allTriggersHaveEvents
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const generateLogicExpression = (conditionTree: any): JSX.Element => {
    if (!conditionTree?.conditions) return <></>

    const renderConditionGroup = (group: any) => {
      const parts: JSX.Element[] = []

      group.conditions.forEach((condition: any, index: number) => {
        const isLast = index === group.conditions.length - 1

        if ('type' in condition) {
          parts.push(
            <div key={index} className="bg-white border-l-4 border-l-blue-400 border border-gray-200 rounded-lg p-4 shadow-sm">
              {renderConditionGroup(condition)}
            </div>
          )
        } else {
          let fieldName = condition.field || '?'

          if (availableFieldsGrouped) {
            Object.values(availableFieldsGrouped).forEach(categoryFields => {
              const foundField = categoryFields.find(item => item.field.name === condition.field)
              if (foundField) {
                fieldName = foundField.displayLabel
              }
            })
          } else {
            const field = availableFields.find(f => f.name === condition.field)
            fieldName = field?.label || condition.field || '?'
          }

          const operator = condition.operator === '==' ? '=' : condition.operator
          const value = condition.value || '?'

          parts.push(
            <div key={index} className="bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-base font-semibold text-gray-900">
                {fieldName} <span className="text-blue-600">{operator}</span> <span className="text-green-600">{value}</span>
              </div>
            </div>
          )
        }

        if (!isLast) {
          const operatorBg = group.type === 'AND' ? 'bg-blue-100' : 'bg-green-100'
          const operatorText = group.type === 'AND' ? 'text-blue-700' : 'text-green-700'
          const operatorBorder = group.type === 'AND' ? 'border-blue-300' : 'border-green-300'

          parts.push(
            <div key={`op-${index}`} className="flex justify-center my-3">
              <div className={`px-4 py-2 ${operatorBg} ${operatorText} ${operatorBorder} border rounded-full font-bold text-sm shadow-sm`}>
                {group.type}
              </div>
            </div>
          )
        }
      })

      return <div className="space-y-3">{parts}</div>
    }

    return (
      <div className="p-4">
        <div className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="bg-gray-800 text-white px-3 py-1 rounded-lg text-sm">SE</span>
          <span className="text-gray-500">a missão será completada quando:</span>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 shadow-inner">
          {renderConditionGroup(conditionTree)}
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Target size={20} />
            Preview da Missão
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex bg-white border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('visual')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  viewMode === 'visual'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Eye size={14} className="inline mr-1" />
                Visual
              </button>
              <button
                onClick={() => setViewMode('json')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  viewMode === 'json'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Code size={14} className="inline mr-1" />
                JSON
              </button>
            </div>
            <div className={`px-3 py-1 rounded-full border text-xs font-medium ${getComplexityColor()}`}>
              {getComplexityLabel()}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {viewMode === 'json' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Code size={16} />
                Estrutura JSON da Missão
              </h4>
              <button
                onClick={() => copyToClipboard(JSON.stringify(rule, null, 2))}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                title="Copiar JSON"
              >
                <Copy size={12} />
                Copiar
              </button>
            </div>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto font-mono text-sm">
              <pre>{JSON.stringify(rule, null, 2)}</pre>
            </div>
          </div>
        ) : (
          <>
            {/* Enhanced Comprehensive Logic Display */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-blue-900">
                  💡 Lógica Completa da Missão:
                </div>
                <div className="text-xs text-blue-600">
                  {(() => {
                    const triggerCount = rule.triggers?.length || 0
                    const totalFilters = rule.triggers?.reduce((sum, t) => sum + (t.filters?.length || 0), 0) || 0
                    const conditionCount = rule.conditionTree ? JSON.stringify(rule.conditionTree).split('"field":').length - 1 : 0
                    return `${triggerCount} trigger(s), ${totalFilters} filtro(s), ${conditionCount} regra(s) de negócio`
                  })()}
                </div>
              </div>

              <div className="bg-white rounded border shadow-sm p-4 space-y-4">
                {/* Trigger Logic */}
                {rule.triggers && rule.triggers.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-gray-600 mb-2">🎯 FILTROS DOS TRIGGERS:</div>
                    <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
                      <div className="font-medium text-green-900 mb-2">
                        SE a missão será completada quando:
                      </div>
                      <div className="ml-2">
                        {rule.triggers.map((trigger, index) => (
                          <div key={index} className="mb-2">
                            <span className="font-medium text-green-800">
                              {trigger.label || getEventLabel(trigger.event)}
                            </span>
                            {trigger.filters && trigger.filters.length > 0 && (
                              <span className="text-green-700">
                                {' '}onde {trigger.filters.map((filter, filterIndex) => (
                                  <span key={filterIndex}>
                                    {filterIndex > 0 && ' E '}
                                    <strong>{filter.field}</strong> {filter.operator} {
                                      Array.isArray(filter.value)
                                        ? `[${filter.value.join(', ')}]`
                                        : filter.value
                                    }
                                  </span>
                                ))}
                              </span>
                            )}
                            {index < rule.triggers.length - 1 && (
                              <div className="text-blue-600 font-medium text-center my-1">
                                {rule.logic || 'AND'}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Business Rules Logic */}
                {(() => {
                  const hasValidConditions = rule.conditionTree?.conditions?.some((condition: any) => {
                    if ('type' in condition) return true
                    return condition.field && condition.operator && condition.value
                  })

                  return hasValidConditions && (
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-2">🏢 REGRAS DE NEGÓCIO:</div>
                      <div className="bg-orange-50 border border-orange-200 rounded p-3">
                        {generateLogicExpression(rule.conditionTree)}
                      </div>
                    </div>
                  )
                })()}

                {/* No conditions message */}
                {(() => {
                  const hasValidConditions = rule.conditionTree?.conditions?.some((condition: any) => {
                    if ('type' in condition) return true
                    return condition.field && condition.operator && condition.value
                  })

                  return (rule.triggers?.length || 0) === 0 && !hasValidConditions && (
                    <div className="text-gray-500 text-sm text-center py-3">
                      Nenhuma lógica configurada ainda
                    </div>
                  )
                })()}
              </div>

              <div className="text-xs text-blue-600 mt-2">
                ✨ Esta é a lógica completa que será aplicada para validar se uma missão foi completada
              </div>
            </div>

            {/* Triggers Overview */}
        {rule.triggers && rule.triggers.length > 0 ? (
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Zap size={16} />
              Triggers ({rule.triggers.length})
            </h4>
            
            <div className="space-y-2">
              {rule.triggers.map((trigger, index) => {
                const status = getTriggerStatus(trigger)
                const StatusIcon = status.status === 'success' ? CheckCircle : 
                                 status.status === 'warning' ? AlertCircle : XCircle
                const statusColor = status.status === 'success' ? 'text-green-600' : 
                                  status.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                
                return (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getEventIcon(trigger.event)}</span>
                      <div>
                        <div className="font-medium text-sm text-gray-900">
                          {trigger.label || getEventLabel(trigger.event)}
                        </div>
                        {trigger.aggregation && (
                          <div className="text-xs text-gray-600">
                            Agregação: {trigger.aggregation}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <StatusIcon size={16} className={statusColor} />
                      <span className={`text-xs font-medium ${statusColor}`}>
                        {status.message}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Logic between triggers */}
            {rule.triggers.length > 1 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-blue-900">Lógica:</span>
                  <span className="px-2 py-1 bg-blue-100 rounded text-blue-800 font-semibold">
                    {rule.logic === 'AND' ? 'TODOS devem ocorrer' : 'QUALQUER UM vale'}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 p-3 rounded-lg">
            <AlertCircle size={16} />
            <span className="text-sm">Nenhum trigger configurado</span>
          </div>
        )}

        {/* Business Rules (when configured) */}
        {((rule.businessRules && rule.businessRules.length > 0) ||
          (rule.conditionTree && rule.conditionTree.conditions && rule.conditionTree.conditions.length > 0 &&
           rule.conditionTree.conditions.some(c => ('type' in c) || (c.field && c.operator && c.value)))) && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Target size={16} />
              Regras de Negócio Externas
            </h4>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="text-sm text-orange-800">
                <span className="font-medium">Raramente Usado:</span> Validações específicas como tier VIP, idade da conta, etc.
              </div>
            </div>
          </div>
        )}

        {/* Time Window */}
        {rule.timeWindow && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Clock size={16} />
              Janela de Tempo
            </h4>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-700">
                <strong>{rule.timeWindow.duration}</strong>
                {rule.timeWindow.sliding ? ' (deslizante)' : ' (fixa)'}
              </div>
            </div>
          </div>
        )}

        {/* Advanced Settings */}
        {(rule.cooldown || rule.maxClaims) && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Users size={16} />
              Configurações
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {rule.cooldown && (
                <div className="bg-gray-50 rounded p-2">
                  <div className="text-xs text-gray-600">Cooldown</div>
                  <div className="text-sm font-medium">{rule.cooldown}s</div>
                </div>
              )}
              {rule.maxClaims && (
                <div className="bg-gray-50 rounded p-2">
                  <div className="text-xs text-gray-600">Max Claims</div>
                  <div className="text-sm font-medium">{rule.maxClaims}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Validation Status */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Status da Configuração</span>
            {hasValidConfiguration() ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle size={16} />
                <span className="text-sm font-medium">Válida</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <XCircle size={16} />
                <span className="text-sm font-medium">Incompleta</span>
              </div>
            )}
          </div>
          
          {!hasValidConfiguration() && (
            <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
              Selecione eventos para os triggers configurados
            </div>
          )}
        </div>
          </>
        )}
      </div>
    </div>
  )
}