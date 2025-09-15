// Modular Rule Builder Component
// Dynamically builds rule creation UI based on selected module

import React, { useState, useEffect, useMemo } from 'react'
import { getAllEventTypesForUI, getModule } from '../../modules'
import type { BaseMissionRule, EventTypeDefinition, FieldDefinition, ConditionGroup, BaseTrigger } from '../../core/types'
import { AdvancedConditionBuilder } from './AdvancedConditionBuilder'
import { TriggerConfigurator } from './TriggerConfigurator'
import { MissionPreview } from './MissionPreview'
import { InfoTooltip } from '../ui/info-tooltip'
import { Lightbulb, AlertCircle, Plus, Layers, Zap } from 'lucide-react'

interface ModularRuleBuilderProps {
  moduleName?: string // Now optional since we'll use all modules
  initialRule?: BaseMissionRule
  onRuleChange: (rule: BaseMissionRule) => void
  locale?: string
  showTemplates?: boolean // DEPRECATED - always false
  className?: string
}

interface EventTypeUI extends EventTypeDefinition {
  fields: FieldDefinition[]
}

export function ModularRuleBuilder({
  moduleName,
  initialRule,
  onRuleChange,
  locale = 'pt-BR',
  showTemplates = false, // DISABLED - simplifying interface
  className = ''
}: ModularRuleBuilderProps) {
  const [eventTypes, setEventTypes] = useState<EventTypeUI[]>([])
  const [showEventSelector, setShowEventSelector] = useState(false)
  const [currentRule, setCurrentRule] = useState<BaseMissionRule>(
    initialRule || {
      triggers: [],
      conditions: [],
      logic: 'AND'
    }
  )
  const [loading, setLoading] = useState(true)
  const [triggerLogic, setTriggerLogic] = useState<'AND' | 'OR'>('AND')
  const [isSyncingFromParent, setIsSyncingFromParent] = useState(false)

  useEffect(() => {
    loadModuleData()
  }, [locale])

  // Only sync from parent when initialRule actually changes
  useEffect(() => {
    if (initialRule) {
      setIsSyncingFromParent(true)
      
      // Deep clone to avoid mutation issues
      const ruleToApply = JSON.parse(JSON.stringify(initialRule))
      
      // Always ensure conditionTree exists for advanced mode
      if (!ruleToApply.conditionTree && ruleToApply.conditions?.length > 0) {
        ruleToApply.conditionTree = {
          type: ruleToApply.logic || 'AND',
          conditions: ruleToApply.conditions
        }
      }
      
      // Ensure basic structure
      ruleToApply.conditions = ruleToApply.conditions || []
      
      setCurrentRule(ruleToApply)
      
      // Reset sync flag after a short delay to allow state to update
      setTimeout(() => setIsSyncingFromParent(false), 10)
    }
  }, [JSON.stringify(initialRule)])

  useEffect(() => {
    // Only call onRuleChange if this is a user-initiated change, not a sync from parent
    if (!isSyncingFromParent) {
      onRuleChange(currentRule)
    }
  }, [currentRule, onRuleChange, isSyncingFromParent])

  const loadModuleData = async () => {
    try {
      setLoading(true)
      
      // Initialize modules first
      const { initializeModules } = await import('../../modules')
      const initResult = initializeModules()
      
      if (!initResult.success) {
        console.error('Failed to initialize modules:', initResult.error)
        return
      }
      
      // Load event types from ALL modules
      const allEventTypes = getAllEventTypesForUI(locale)
      setEventTypes(allEventTypes)
      
    } catch (error) {
      console.error('Failed to load module data:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTrigger = (eventKey: string) => {
    // Check if trigger already exists
    if (currentRule.triggers.some(t => t.event === eventKey)) {
      return
    }
    
    const newTrigger: BaseTrigger = {
      event: eventKey,
      filters: [],
      conditions: []
    }
    
    setCurrentRule({
      ...currentRule,
      triggers: [...currentRule.triggers, newTrigger]
    })
    setShowEventSelector(false)
  }

  const removeTrigger = (index: number) => {
    const newTriggers = currentRule.triggers.filter((_, i) => i !== index)
    setCurrentRule({ ...currentRule, triggers: newTriggers })
  }

  // Template functionality removed for simplification

  const handleTriggerChange = (triggerIndex: number, field: string, value: any) => {
    const newTriggers = [...currentRule.triggers]
    newTriggers[triggerIndex] = {
      ...newTriggers[triggerIndex],
      [field]: value
    }
    
    setCurrentRule({
      ...currentRule,
      triggers: newTriggers
    })
  }

  const handleConditionChange = (conditionIndex: number, field: string, value: any) => {
    const newConditions = [...currentRule.conditions]
    newConditions[conditionIndex] = {
      ...newConditions[conditionIndex],
      [field]: value
    }
    
    setCurrentRule({
      ...currentRule,
      conditions: newConditions
    })
  }

  const addCondition = () => {
    const newCondition = {
      field: '',
      operator: '==' as const,
      value: ''
    }
    
    setCurrentRule({
      ...currentRule,
      conditions: [...currentRule.conditions, newCondition]
    })
  }

  const removeCondition = (index: number) => {
    const newConditions = currentRule.conditions.filter((_, i) => i !== index)
    setCurrentRule({
      ...currentRule,
      conditions: newConditions
    })
  }

  const handleAdvancedConditionChange = (conditionTree: ConditionGroup) => {
    setCurrentRule({
      ...currentRule,
      conditionTree,
      // Keep simple conditions in sync for backward compatibility
      conditions: flattenConditionTree(conditionTree)
    })
  }

  // Helper function to flatten condition tree for backward compatibility
  const flattenConditionTree = (tree: ConditionGroup): any[] => {
    const conditions: any[] = []
    
    tree.conditions.forEach(condition => {
      if ('type' in condition) {
        // It's a group, flatten recursively
        conditions.push(...flattenConditionTree(condition))
      } else {
        // It's a simple condition
        conditions.push(condition)
      }
    })
    
    return conditions
  }

  // Define generic fields as a constant
  const genericFields: FieldDefinition[] = useMemo(() => [
    {
      name: 'user_id',
      label: 'ID do Usuário',
      type: 'string',
      required: false,
      helper: 'Identificador único do usuário'
    },
    {
      name: 'amount',
      label: 'Valor',
      type: 'currency',
      required: false,
      helper: 'Valor monetário'
    },
    {
      name: 'count',
      label: 'Quantidade',
      type: 'number',
      required: false,
      helper: 'Número de ocorrências'
    },
    {
      name: 'streak_days',
      label: 'Dias em Sequência',
      type: 'number',
      required: false,
      helper: 'Dias consecutivos',
      validation: { min: 1, max: 365 }
    },
    {
      name: 'timestamp',
      label: 'Data/Hora',
      type: 'string',
      required: false,
      helper: 'Quando ocorreu'
    },
    {
      name: 'status',
      label: 'Status',
      type: 'enum',
      required: false,
      options: [
        { value: 'active', label: 'Ativo' },
        { value: 'inactive', label: 'Inativo' },
        { value: 'pending', label: 'Pendente' },
        { value: 'completed', label: 'Completo' }
      ],
      helper: 'Estado atual'
    }
  ], [])

  // Compute available fields and grouped fields
  const { availableFields, availableFieldsGrouped } = useMemo(() => {
    const fieldMap = new Map<string, FieldDefinition>()
    const grouped: Record<string, { field: FieldDefinition; displayLabel: string }[]> = {}
    const fieldNameCount: Record<string, string[]> = {}
    
    // Process ALL event types to get ALL fields (not just from triggers)
    let hasFields = false
    
    // First pass: collect ALL fields from ALL event types
    eventTypes.forEach(eventType => {
      if (eventType?.fields) {
        const categoryShort = 
          eventType.category === 'sportsbook' || eventType.category === 'betting' ? 'Sportsbook' :
          eventType.category === 'casino' || eventType.category === 'gameplay' ? 'Casino' :
          eventType.category === 'achievement' ? 'Conquistas' :
          eventType.category === 'general' ? 'Geral' : 'Outros'
        
        eventType.fields.forEach(field => {
          hasFields = true
          if (!fieldMap.has(field.name)) {
            fieldMap.set(field.name, field)
          }
          if (!fieldNameCount[field.name]) {
            fieldNameCount[field.name] = []
          }
          if (!fieldNameCount[field.name].includes(categoryShort)) {
            fieldNameCount[field.name].push(categoryShort)
          }
        })
      }
    })
    
    // Second pass: create grouped structure using ALL event types
    eventTypes.forEach(eventType => {
      if (eventType?.fields) {
        let categoryLabel = '💰 Geral'
        let categoryShort = 'Geral'
        
        if (eventType.category === 'sportsbook' || eventType.category === 'betting') {
          categoryLabel = '⚽ Sportsbook'
          categoryShort = 'Sportsbook'
        } else if (eventType.category === 'casino' || eventType.category === 'gameplay') {
          categoryLabel = '🎰 Casino'
          categoryShort = 'Casino'
        } else if (eventType.category === 'achievement') {
          categoryLabel = '🏆 Conquistas'
          categoryShort = 'Conquistas'
        } else if (eventType.category === 'general') {
          categoryLabel = '💰 Geral'
          categoryShort = 'Geral'
        }
        
        if (!grouped[categoryLabel]) {
          grouped[categoryLabel] = []
        }
        
        eventType.fields.forEach(field => {
          // Create unique field ID by combining original name with category
          const uniqueFieldId = `${field.name}_${categoryShort.toLowerCase()}`
          const uniqueField = { 
            ...field, 
            name: uniqueFieldId,
            originalName: field.name 
          }
          
          // Add to field map with unique ID
          fieldMap.set(uniqueFieldId, uniqueField)
          
          // Check if we already have this specific field in this category
          const alreadyAdded = grouped[categoryLabel].some(f => f.field.name === uniqueFieldId)
          if (!alreadyAdded) {
            const categoriesWithField = fieldNameCount[field.name] || []
            const needsSuffix = categoriesWithField.length > 1
            const displayLabel = needsSuffix ? `${field.label} (${categoryShort})` : field.label
            
            grouped[categoryLabel].push({
              field: uniqueField,
              displayLabel
            })
          }
        })
      }
    })
    
    // If no fields from triggers, use generic fields
    if (!hasFields) {
      genericFields.forEach(field => {
        fieldMap.set(field.name, field)
      })
      
      grouped['Campos Genéricos'] = genericFields.map(field => ({
        field,
        displayLabel: field.label
      }))
    }
    
    return {
      availableFields: Array.from(fieldMap.values()),
      availableFieldsGrouped: grouped
    }
  }, [eventTypes, genericFields])

  const renderFieldInput = (field: FieldDefinition, value: any, onChange: (value: any) => void, compact: boolean = false) => {
    const fieldId = `field-${field.name}`
    
    switch (field.type) {
      case 'string':
        return (
          <div className="space-y-1">
            <input
              id={fieldId}
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={field.placeholder}
              className={`w-full border border-gray-300 rounded focus:outline-none focus:ring-blue-500 ${
                compact 
                  ? 'text-xs px-2 py-1 focus:ring-1' 
                  : 'px-3 py-2 text-sm focus:ring-2'
              }`}
            />
            {field.helper && !compact && <div className="text-xs text-gray-500 mt-1">{field.helper}</div>}
          </div>
        )
        
      case 'number':
      case 'currency':
        return (
          <div className="space-y-1">
            <input
              id={fieldId}
              type="number"
              value={value || ''}
              onChange={(e) => onChange(Number(e.target.value))}
              placeholder={field.placeholder}
              min={field.validation?.min}
              max={field.validation?.max}
              className={`w-full border border-gray-300 rounded focus:outline-none focus:ring-blue-500 ${
                compact 
                  ? 'text-xs px-2 py-1 focus:ring-1' 
                  : 'px-3 py-2 text-sm focus:ring-2'
              }`}
            />
            {field.helper && !compact && <div className="text-xs text-gray-500 mt-1">{field.helper}</div>}
          </div>
        )
        
      case 'enum':
        return (
          <div className="space-y-1">
            <select
              id={fieldId}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className={`w-full border border-gray-300 rounded focus:outline-none bg-white ${
                compact 
                  ? 'text-xs px-2 py-1 focus:ring-1 focus:ring-blue-500' 
                  : 'px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500'
              }`}
            >
              <option value="">Selecione...</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.icon && `${option.icon} `}{option.label}
                </option>
              ))}
            </select>
            {field.helper && !compact && <div className="text-xs text-gray-500 mt-1">{field.helper}</div>}
          </div>
        )
        
      case 'boolean':
        return (
          <div className="space-y-1">
            <select
              value={value === undefined ? '' : String(value)}
              onChange={(e) => onChange(e.target.value === 'true')}
              className={`w-full border border-gray-300 rounded focus:outline-none bg-white focus:ring-blue-500 ${
                compact 
                  ? 'text-xs px-2 py-1 focus:ring-1' 
                  : 'px-3 py-2 text-sm focus:ring-2'
              }`}
            >
              <option value="">Selecione...</option>
              <option value="true">Sim</option>
              <option value="false">Não</option>
            </select>
            {field.helper && !compact && <div className="text-xs text-gray-500 mt-1">{field.helper}</div>}
          </div>
        )
        
      default:
        return (
          <div className="space-y-1">
            <input
              id={fieldId}
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className={`w-full border border-gray-300 rounded focus:outline-none focus:ring-blue-500 ${
                compact 
                  ? 'text-xs px-2 py-1 focus:ring-1' 
                  : 'px-3 py-2 text-sm focus:ring-2'
              }`}
            />
            {field.helper && !compact && <div className="text-xs text-gray-500 mt-1">{field.helper}</div>}
          </div>
        )
    }
  }


  if (loading) {
    return (
      <div className={`flex justify-center items-center min-h-[300px] ${className}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-3 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="text-gray-600">Carregando construtor de regras...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`max-w-6xl mx-auto space-y-8 ${className}`}>
      {/* Event Selector Modal */}
      {showEventSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Selecione um Evento</h3>
                <button
                  onClick={() => setShowEventSelector(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              {(() => {
                const groupedEvents: Record<string, EventTypeUI[]> = {}
                const categoryInfo: Record<string, { icon: string; label: string }> = {
                  'sportsbook': { icon: '⚽', label: 'Sportsbook' },
                  'casino': { icon: '🎰', label: 'Cassino' },
                  'live_casino': { icon: '🎲', label: 'Casino Ao Vivo' },
                  'general': { icon: '💰', label: 'Geral' }
                }
                
                eventTypes.forEach(event => {
                  const category = event.category || 'general'
                  if (!groupedEvents[category]) {
                    groupedEvents[category] = []
                  }
                  groupedEvents[category].push(event)
                })
                
                return Object.entries(groupedEvents).map(([category, events]) => (
                  <div key={category} className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">
                        {categoryInfo[category]?.icon || '📌'}
                      </span>
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        {categoryInfo[category]?.label || category}
                      </h4>
                      <div className="flex-1 h-px bg-gray-200"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {events.map(eventType => {
                        const isAlreadyAdded = currentRule.triggers.some(t => t.event === eventType.key)
                        return (
                          <button
                            key={eventType.key}
                            onClick={() => !isAlreadyAdded && addTrigger(eventType.key)}
                            disabled={isAlreadyAdded}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                              isAlreadyAdded
                                ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                                : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                            }`}
                          >
                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xl">
                              {eventType.icon}
                            </div>
                            <div className="text-left flex-1">
                              <h5 className="text-sm font-medium text-gray-900">{eventType.label}</h5>
                              <p className="text-xs text-gray-600">{eventType.description}</p>
                            </div>
                            {isAlreadyAdded && (
                              <span className="text-xs text-gray-500">Já adicionado</span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))
              })()}
            </div>
          </div>
        )}

      {/* Trigger Configuration Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
            <Zap className="w-5 h-5" />
            Configuração de Triggers
          </h3>
          {currentRule.triggers.length > 1 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full">
              <Layers size={16} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Missão Cross-Sell Ativa
              </span>
            </div>
          )}
        </div>

        {/* Trigger Cards */}
        <div className="space-y-3">
          {currentRule.triggers.map((trigger, index) => {
              
              const triggerEvent = eventTypes.find(et => et.key === trigger.event)
              if (!triggerEvent) return null
              
              return (
                <TriggerConfigurator
                  key={index}
                  trigger={trigger}
                  eventType={triggerEvent}
                  onUpdate={(updatedTrigger) => {
                    const newTriggers = [...currentRule.triggers]
                    newTriggers[index] = updatedTrigger
                    setCurrentRule({ ...currentRule, triggers: newTriggers })
                  }}
                  onDelete={() => removeTrigger(index)}
                  index={index}
                  totalTriggers={currentRule.triggers.length}
                  availableFields={triggerEvent.fields || []}
                />
              )
          })}
          
          {/* Add Trigger Button */}
          <button
            onClick={() => setShowEventSelector(true)}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            <span className="font-medium">Adicionar Trigger</span>
          </button>
        </div>

        {/* Cross-sell Mission Logic */}
        {currentRule.triggers.length > 1 && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900">Lógica entre Triggers</h4>
                <InfoTooltip
                  title="Como funciona a lógica?"
                  content="Define como os triggers se relacionam para completar a missão."
                  examples={[
                    "AND: Todos os triggers devem ocorrer",
                    "OR: Qualquer trigger completa a missão"
                  ]}
                />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="trigger-logic"
                    value="AND"
                    checked={currentRule.logic === 'AND'}
                    onChange={() => setCurrentRule({ ...currentRule, logic: 'AND' })}
                    className="text-blue-600"
                  />
                  <span className="text-sm">
                    <strong>AND</strong> - Todos devem ocorrer
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="trigger-logic"
                    value="OR"
                    checked={currentRule.logic === 'OR'}
                    onChange={() => setCurrentRule({ ...currentRule, logic: 'OR' })}
                    className="text-blue-600"
                  />
                  <span className="text-sm">
                    <strong>OR</strong> - Qualquer um vale
                  </span>
                </label>
              </div>
            </div>
          )}
      </div>

      {/* Rule Conditions */}
      {currentRule.triggers.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
              <span>🎯</span>
              Condições da Regra
            </h3>
            <div className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200">
              Modo Avançado
            </div>
          </div>
          
          <AdvancedConditionBuilder
            initialConditionTree={currentRule.conditionTree}
            availableFields={availableFields}
            availableFieldsGrouped={availableFieldsGrouped}
            onChange={handleAdvancedConditionChange}
            className="bg-gray-50 rounded-lg p-4"
          />
        </div>
      ) : currentRule.triggers.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-yellow-600">⚠️</span>
            <h3 className="text-lg font-semibold text-yellow-800 m-0">Selecione Eventos</h3>
          </div>
          <p className="text-sm text-yellow-700 m-0">
            Para configurar condições, primeiro selecione um ou mais eventos disparadores acima.
            <br />
            <strong>Dica:</strong> Você pode selecionar múltiplos eventos para criar missões cross-sell!
          </p>
        </div>
      )}

      {/* Advanced Rule Settings */}
      {currentRule.triggers.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
              <span>⚙️</span>
              Configurações Avançadas
            </h3>
            <InfoTooltip
              title="Configurações Opcionais"
              content="Estas configurações são opcionais e permitem criar missões mais complexas com limites de tempo, cooldown entre completações e número máximo de vezes que pode ser completada."
              examples={[
                "Missão diária: Janela de 1d, reseta todo dia",
                "Missão única: Máximo de claims = 1",
                "Missão com cooldown: Pode completar a cada 1 hora"
              ]}
            />
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="block text-xs font-semibold text-gray-700">
                    Janela de Tempo
                  </label>
                  <InfoTooltip
                    title="O que é Janela de Tempo?"
                    content="Define o período em que os eventos são contabilizados. Por exemplo, numa janela de '1d', só eventos das últimas 24h contam para a missão."
                    examples={[
                      "1h = Últimas 1 hora",
                      "1d = Últimas 24 horas",
                      "7d = Últimos 7 dias",
                      "30d = Últimos 30 dias"
                    ]}
                  />
                </div>
                <input
                  type="text"
                  value={currentRule.timeWindow?.duration || ''}
                  onChange={(e) => setCurrentRule({
                    ...currentRule,
                    timeWindow: {
                      ...currentRule.timeWindow,
                      duration: e.target.value
                    } as any
                  })}
                  placeholder="Ex: 1d, 7d, 30d, 1h"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="text-xs text-gray-500 mt-1">
                  💡 Deixe vazio para considerar eventos de qualquer período
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Cooldown (segundos)
                </label>
                <input
                  type="number"
                  value={currentRule.cooldown || ''}
                  onChange={(e) => setCurrentRule({
                    ...currentRule,
                    cooldown: Number(e.target.value) || undefined
                  })}
                  placeholder="Ex: 3600 (1 hora)"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Tempo de espera entre completações da missão
                </div>
              </div>
              
              
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentRule.timeWindow?.sliding || false}
                    onChange={(e) => setCurrentRule({
                      ...currentRule,
                      timeWindow: {
                        ...currentRule.timeWindow,
                        sliding: e.target.checked,
                        duration: currentRule.timeWindow?.duration || '1d'
                      } as any
                    })}
                    className="text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Janela Deslizante</span>
                      <InfoTooltip
                        title="Diferença: Janela Fixa vs Deslizante"
                        content="FIXA: Reseta em horários específicos (ex: todo dia às 00h). DESLIZANTE: Conta a partir do momento atual para trás (ex: últimas 24h a partir de agora)."
                        examples={[
                          "Fixa: 'Faça 3 apostas hoje' (reseta à meia-noite)",
                          "Deslizante: 'Faça 3 apostas nas últimas 24h' (sempre conta 24h para trás)",
                          "Use fixa para missões diárias/semanais, deslizante para sequências"
                        ]}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      Conta o tempo a partir de agora, não de um horário fixo
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rule Summary */}
      {currentRule.triggers.length > 0 && currentRule.conditions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
            <span>📝</span>
            Resumo da Regra
          </h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-700 m-0">
              <strong className="text-gray-900">Quando:</strong> {currentRule.triggers.map(t => {
                const event = eventTypes.find(e => e.key === t.event)
                return event?.label || t.event
              }).join(currentRule.triggers.length > 1 ? ` ${triggerLogic} ` : '')}
            </p>
            <p className="text-sm text-gray-700 m-0">
              <strong className="text-gray-900">Triggers:</strong> {currentRule.triggers.length} trigger(s)
              {currentRule.triggers.length > 1 && (
                <span className="text-blue-600 font-medium"> [{triggerLogic}]</span>
              )}
              {currentRule.triggers[0]?.debounce && (
                <span> (debounce: {currentRule.triggers[0].debounce}ms)</span>
              )}
            </p>
            <p className="text-sm text-gray-700 m-0">
              <strong className="text-gray-900">Condições:</strong> {currentRule.conditions.length} condição(ões)
              {currentRule.conditions.length > 1 && (
                <span> com lógica <strong className="text-gray-900">{currentRule.logic}</strong></span>
              )}
            </p>
            {currentRule.timeWindow?.duration && (
              <p className="text-sm text-gray-700 m-0">
                <strong className="text-gray-900">Janela de Tempo:</strong> {currentRule.timeWindow.duration}
                {currentRule.timeWindow.sliding && " (deslizante)"}
              </p>
            )}
            {currentRule.cooldown && (
              <p className="text-sm text-gray-700 m-0">
                <strong className="text-gray-900">Cooldown:</strong> {currentRule.cooldown} segundos
              </p>
            )}
            {currentRule.maxClaims && (
              <p className="text-sm text-gray-700 m-0">
                <strong className="text-gray-900">Máximo de Claims:</strong> {currentRule.maxClaims}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Mission Preview - Enhanced Validation */}
      {currentRule.triggers.length > 0 && (
        <MissionPreview
          rule={currentRule}
          eventTypes={eventTypes}
          className="mt-6"
        />
      )}
    </div>
  )
}

