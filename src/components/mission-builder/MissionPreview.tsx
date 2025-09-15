import React from 'react'
import { BaseMissionRule, EventTypeDefinition } from '../../core/types'
import { CheckCircle, XCircle, AlertCircle, Zap, Target, Clock, Users } from 'lucide-react'

interface MissionPreviewProps {
  rule: BaseMissionRule
  eventTypes: EventTypeDefinition[]
  className?: string
}

export function MissionPreview({ rule, eventTypes, className = '' }: MissionPreviewProps) {
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
    
    // Since we removed trigger-specific conditions, only check global conditions
    const hasGlobalConditions = rule.conditions && rule.conditions.length > 0
    const hasConditionTree = rule.conditionTree && rule.conditionTree.conditions && rule.conditionTree.conditions.length > 0
    
    return hasGlobalConditions || hasConditionTree
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
          <div className={`px-3 py-1 rounded-full border text-xs font-medium ${getComplexityColor()}`}>
            {getComplexityLabel()}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
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

        {/* Global Conditions */}
        {rule.conditions && rule.conditions.length > 0 && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Target size={16} />
              Condições Globais ({rule.conditions.length})
            </h4>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="text-sm text-amber-800">
                Aplicam-se a TODOS os eventos da missão
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
              Configure condições nos triggers ou adicione condições globais
            </div>
          )}
        </div>
      </div>
    </div>
  )
}