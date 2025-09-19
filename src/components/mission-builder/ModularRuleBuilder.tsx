// Modular Rule Builder Component
// Dynamically builds rule creation UI based on selected module

import React, { useState, useEffect, useMemo } from 'react'
import { getAllEventTypesForUI, getModule, initializeModules } from '../../modules'
import type { BaseMissionRule, ConditionGroup, BaseTrigger, FieldDefinition } from '../../core/types'
import { EventTypeUI } from '@/types/event-types'
import { AdvancedConditionBuilder } from './AdvancedConditionBuilder'
import { TriggerConfigurator } from './TriggerConfigurator'
import { MissionPreview } from './MissionPreview'
import { InfoTooltip } from '../ui/info-tooltip'
import { EventSelector } from './EventSelector'
import { Lightbulb, AlertCircle, Plus, Layers, Zap, Search, X } from 'lucide-react'
import { BUSINESS_RULES_FIELD_DEFINITIONS } from '../../modules/business-rules/types'

interface ModularRuleBuilderProps {
  moduleName?: string // Now optional since we'll use all modules
  initialRule?: BaseMissionRule
  onRuleChange: (rule: BaseMissionRule) => void
  locale?: string
  showTemplates?: boolean // DEPRECATED - always false
  className?: string
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
  const [eventSearchQuery, setEventSearchQuery] = useState('')
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
      console.log('🚀 ModularRuleBuilder: Starting to load module data...')

      // Initialize modules first
      console.log('🔄 Starting module initialization...')

      try {
        const initResult = initializeModules()
        console.log('📊 Initialize modules result:', initResult)

        if (!initResult.success) {
          console.error('❌ Failed to initialize modules:', initResult.error)
          console.error('❌ Full error details:', initResult)
          return
        }

        console.log('✅ Modules initialized successfully:', initResult.stats)

        // Load event types from ALL modules
        console.log('📋 Getting all event types for UI...')
        const allEventTypes = getAllEventTypesForUI(locale)
        console.log('📋 Loaded event types count:', allEventTypes.length)
        console.log('📋 Event types sample:', allEventTypes.slice(0, 3))
        console.log('📋 All categories found:', [...new Set(allEventTypes.map(e => e.category))])

        setEventTypes(allEventTypes)
        console.log('✅ Event types set in state')
      } catch (moduleError) {
        console.error('❌ Error during module initialization:', moduleError)
        console.error('❌ Module error stack:', (moduleError as Error)?.stack)
      }

    } catch (error) {
      console.error('❌ Failed to load module data:', error)
      console.error('❌ Error stack:', (error as Error)?.stack)
    } finally {
      console.log('🏁 ModularRuleBuilder: Load module data completed, setting loading to false')
      setLoading(false)
    }
  }

  const addTrigger = (eventKey: string) => {
    // Check if trigger already exists
    if (currentRule.triggers && currentRule.triggers.some(t => t.event === eventKey)) {
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
    setEventSearchQuery('') // Clear search when closing
  }

  // Filter events based on search query
  const filterEvents = (events: EventTypeUI[], query: string): EventTypeUI[] => {
    // Always show all events if no query, or filter if there is a query
    if (!query || query.trim() === '') {
      return events
    }

    const searchTerm = query.toLowerCase().trim()
    return events.filter(event =>
      event.label.toLowerCase().includes(searchTerm) ||
      event.description.toLowerCase().includes(searchTerm) ||
      event.key.toLowerCase().includes(searchTerm) ||
      event.category?.toLowerCase().includes(searchTerm)
    )
  }

  const removeTrigger = (index: number) => {
    const newTriggers = currentRule.triggers ? currentRule.triggers.filter((_, i) => i !== index) : []
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
    const newConditions = [...(currentRule.conditions ?? [])]
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
      conditions: [...(currentRule.conditions ?? []), newCondition]
    })
  }

  const removeCondition = (index: number) => {
    const newConditions = (currentRule.conditions ?? []).filter((_, i) => i !== index)
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

  // UNIFIED ARCHITECTURE: Business Rules fields ONLY for advanced conditions
  // This eliminates duplication - event fields go in trigger filters, business rules go here
  const { availableFields, availableFieldsGrouped } = useMemo(() => {
    const fieldMap = new Map<string, FieldDefinition>()
    const grouped: Record<string, { field: FieldDefinition; displayLabel: string }[]> = {}

    // ONLY USE BUSINESS RULES FIELDS - NO EVENT FIELDS
    // This implements the 95% (triggers) vs 5% (business rules) architecture
    BUSINESS_RULES_FIELD_DEFINITIONS.forEach(field => {
      fieldMap.set(field.name, field)
    })

    // Group business rules fields by category
    const userProfileFields = BUSINESS_RULES_FIELD_DEFINITIONS.filter(f =>
      ['user_tier', 'vip_level', 'account_age', 'account_status'].includes(f.name)
    )

    const verificationFields = BUSINESS_RULES_FIELD_DEFINITIONS.filter(f =>
      ['kyc_verified', 'phone_verified', 'email_verified'].includes(f.name)
    )

    const geographicFields = BUSINESS_RULES_FIELD_DEFINITIONS.filter(f =>
      ['region', 'timezone'].includes(f.name)
    )

    const limitsFields = BUSINESS_RULES_FIELD_DEFINITIONS.filter(f =>
      ['daily_bet_limit', 'monthly_deposit_limit', 'withdrawal_limit_daily'].includes(f.name)
    )

    const historicalFields = BUSINESS_RULES_FIELD_DEFINITIONS.filter(f =>
      ['total_deposits', 'total_withdrawals', 'total_bets_amount', 'total_wins_amount'].includes(f.name)
    )

    const behaviorFields = BUSINESS_RULES_FIELD_DEFINITIONS.filter(f =>
      ['preferred_device', 'login_count_7d', 'bet_count_30d', 'registration_date', 'last_login', 'last_deposit_date', 'last_bet_date'].includes(f.name)
    )

    // Populate grouped fields
    grouped['👤 Perfil do Usuário'] = userProfileFields.map(field => ({
      field,
      displayLabel: field.label
    }))

    grouped['✅ Verificações'] = verificationFields.map(field => ({
      field,
      displayLabel: field.label
    }))

    grouped['🌍 Geográfico'] = geographicFields.map(field => ({
      field,
      displayLabel: field.label
    }))

    grouped['📊 Limites & Controles'] = limitsFields.map(field => ({
      field,
      displayLabel: field.label
    }))

    grouped['💰 Dados Históricos'] = historicalFields.map(field => ({
      field,
      displayLabel: field.label
    }))

    grouped['📱 Comportamento'] = behaviorFields.map(field => ({
      field,
      displayLabel: field.label
    }))

    return {
      availableFields: Array.from(fieldMap.values()),
      availableFieldsGrouped: grouped
    }
  }, []) // No dependencies - business rules are static

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
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Adicionar Trigger</h2>
                <button
                  onClick={() => {
                    setShowEventSelector(false)
                    setEventSearchQuery('')
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6">
                <EventSelector
                  availableEvents={eventTypes}
                  onChange={(eventKey) => {
                    addTrigger(eventKey)
                    setShowEventSelector(false)
                    setEventSearchQuery('')
                  }}
                  excludeEvents={currentRule.triggers ? currentRule.triggers.map(t => t.event) : []}
                  placeholder="Selecionar tipo de evento..."
                  className="w-full"
                />
              </div>
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
          {currentRule.triggers && currentRule.triggers.length > 1 && (
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
          {currentRule.triggers && currentRule.triggers.map((trigger, index) => {
              
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
                  totalTriggers={currentRule.triggers ? currentRule.triggers.length : 0}
                  availableFields={triggerEvent.fields || []}
                  availableEvents={eventTypes}
                  onEventChange={(newEventKey) => {
                    const newTriggers = [...currentRule.triggers]
                    newTriggers[index] = { ...trigger, event: newEventKey }
                    setCurrentRule({ ...currentRule, triggers: newTriggers })
                  }}
                  excludeEvents={currentRule.triggers ? currentRule.triggers.filter((_, i) => i !== index).map(t => t.event) : []}
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
        {currentRule.triggers && currentRule.triggers.length > 1 && (
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

      {/* Business Rules Section - DRAMATICALLY SIMPLIFIED */}
      {currentRule.triggers && currentRule.triggers.length > 0 && (
        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-orange-900">
                <span>🏢</span>
                Regras de Negócio Externas
              </h3>
              <div className="px-3 py-1 bg-orange-200 text-orange-800 text-xs rounded-full font-medium">
                Raramente Usado
              </div>
            </div>

            <div className="text-sm text-orange-800 space-y-2 mb-4">
              <p><strong>🤔 Quando usar esta seção?</strong></p>
              <div className="text-xs space-y-1 ml-4">
                <p>• ✅ Verificar tier do usuário (VIP, Bronze, etc.)</p>
                <p>• ✅ Validar idade da conta (cadastro há 30+ dias)</p>
                <p>• ✅ Checar KYC/verificação de identidade</p>
                <p>• ✅ Aplicar limites regionais/temporários</p>
                <p className="text-orange-900 font-medium">• ❌ NÃO para filtros de eventos (valor, esporte, etc.) - isso vai no trigger!</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const showAdvanced = !document.getElementById('advanced-rules')?.classList.contains('hidden')
                  const element = document.getElementById('advanced-rules')
                  if (element) {
                    element.classList.toggle('hidden', showAdvanced)
                  }
                }}
                className="px-4 py-2 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 transition-colors"
              >
                🔧 Mostrar/Ocultar Regras Avançadas
              </button>
              <span className="text-xs text-orange-700">
                Na maioria dos casos, você não precisa desta seção
              </span>
            </div>
          </div>

          <div id="advanced-rules" className="hidden">
            <AdvancedConditionBuilder
              initialConditionTree={currentRule.conditionTree}
              availableFields={availableFields}
              availableFieldsGrouped={availableFieldsGrouped}
              onChange={handleAdvancedConditionChange}
              className="bg-gray-50 rounded-lg p-4 border-2 border-orange-200"
              placeholder="Validações de usuário/sistema: user_tier == 'vip', account_age >= 30, region == 'BR'"
              triggers={currentRule.triggers}
              triggerLogic={currentRule.logic}
            />
          </div>
        </div>
      )}

      {(!currentRule.triggers || currentRule.triggers.length === 0) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-blue-600">💡</span>
            <h3 className="text-lg font-semibold text-blue-800 m-0">Comece Adicionando Triggers</h3>
          </div>
          <div className="text-sm text-blue-700 space-y-2">
            <p className="m-0">
              <strong>1. Adicione triggers</strong> - Defina quais eventos monitorar (apostas, depósitos, etc.)
            </p>
            <p className="m-0">
              <strong>2. Configure filtros</strong> - Cada trigger pode ter filtros específicos (valor, esporte, método)
            </p>
            <p className="m-0">
              <strong>3. Escolha lógica</strong> - Para múltiplos triggers, defina se é AND (todos) ou OR (qualquer um)
            </p>
            <div className="mt-3 p-2 bg-blue-100 rounded">
              <p className="text-xs text-blue-800 m-0">
                ✨ <strong>Nova Arquitetura:</strong> Agora todos os filtros ficam nos triggers!
                Não há mais confusão entre triggers e condições.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Rule Settings */}
      {currentRule.triggers && currentRule.triggers.length > 0 && (
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
      {currentRule.triggers && currentRule.triggers.length > 0 && (currentRule.conditions?.length ?? 0) > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
            <span>📝</span>
            Resumo da Regra
          </h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-700 m-0">
              <strong className="text-gray-900">Quando:</strong> {currentRule.triggers && currentRule.triggers.map(t => {
                const event = eventTypes.find(e => e.key === t.event)
                return event?.label || t.event
              }).join(currentRule.triggers && currentRule.triggers.length > 1 ? ` ${triggerLogic} ` : '')}
            </p>
            <p className="text-sm text-gray-700 m-0">
              <strong className="text-gray-900">Triggers:</strong> {currentRule.triggers ? currentRule.triggers.length : 0} trigger(s)
              {currentRule.triggers && currentRule.triggers.length > 1 && (
                <span className="text-blue-600 font-medium"> [{triggerLogic}]</span>
              )}
              {currentRule.triggers[0]?.debounce && (
                <span> (debounce: {currentRule.triggers[0].debounce}ms)</span>
              )}
            </p>
            <p className="text-sm text-gray-700 m-0">
              <strong className="text-gray-900">Condições:</strong> {currentRule.conditions?.length ?? 0} condição(ões)
              {(currentRule.conditions?.length ?? 0) > 1 && (
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
      {currentRule.triggers && currentRule.triggers.length > 0 && (
        <MissionPreview
          rule={currentRule}
          eventTypes={eventTypes}
          availableFields={availableFields}
          availableFieldsGrouped={availableFieldsGrouped}
          className="mt-6"
        />
      )}
    </div>
  )
}

