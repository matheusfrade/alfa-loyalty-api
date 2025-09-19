// Main Mission Builder Component
// Orchestrates the modular mission creation workflow

import React, { useState, useEffect, useCallback } from 'react'
// import { ModuleSelector } from './ModuleSelector' // Removed - no longer selecting modules
import { ModularRuleBuilder } from './ModularRuleBuilder'
import { RewardSelector } from '../admin/RewardSelector'
import { QuickTemplates, type MissionTemplate } from './QuickTemplates'
import { CustomerGroupsStep } from './CustomerGroupsStep'
import { initializeModules } from '../../modules'
import type { BaseMissionRule } from '../../core/types'
import { CustomerGroupSelection } from '@/types/customer-groups'
import { Sparkles } from 'lucide-react'

interface MissionBuilderProps {
  onMissionCreate?: (mission: {
    module: string
    rule: BaseMissionRule
    name: string
    description: string
    reward: number
    coins: number
    tierPoints?: number
    productRewards?: Array<{ productId: string; quantity: number }>
    customerGroups?: CustomerGroupSelection
  }) => void
  locale?: string
  className?: string
}

interface MissionData {
  name: string
  description: string
  reward: number
  coins: number
  tierPoints: number
  type: 'SINGLE' | 'RECURRING' | 'STREAK' | 'MILESTONE'
  category: string
  recurrence?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'UNLIMITED'
  maxClaims?: number
  startDate?: string
  endDate?: string
  productRewards: Array<{ productId: string; quantity: number }>
  customerGroups: CustomerGroupSelection
}

export function MissionBuilder({
  onMissionCreate,
  locale = 'pt-BR',
  className = ''
}: MissionBuilderProps) {
  // Module is now internal - we use iGaming as default
  const defaultModule = 'igaming'
  const [currentRule, setCurrentRule] = useState<BaseMissionRule | null>(null)
  const [missionData, setMissionData] = useState<MissionData>({
    name: '',
    description: '',
    reward: 0,
    coins: 0,
    tierPoints: 0,
    type: 'RECURRING',
    category: 'CUSTOM',
    recurrence: 'UNLIMITED',
    maxClaims: undefined,
    startDate: '',
    endDate: '',
    productRewards: [],
    customerGroups: { include: [], exclude: [] }
  })
  const [systemInitialized, setSystemInitialized] = useState(false)
  const [step, setStep] = useState<'templates' | 'rule' | 'groups' | 'details' | 'review'>('templates')
  const [showTemplates, setShowTemplates] = useState(true)

  useEffect(() => {
    initializeSystem()
  }, [])

  const initializeSystem = async () => {
    try {
      console.log('🔧 Starting mission system initialization...')
      const result = initializeModules()
      console.log('🔧 Module initialization result:', result)

      if (result.success) {
        console.log('✅ Mission system initialized successfully')
        setSystemInitialized(true)
      } else {
        console.error('❌ Mission system initialization failed:', result.error)
        console.log('🔧 Forcing initialization to proceed anyway for debugging...')
        setSystemInitialized(true) // Force enable for debugging
      }
    } catch (error) {
      console.error('❌ Failed to initialize mission system:', error)
      console.log('🔧 Forcing initialization to proceed anyway for debugging...')
      setSystemInitialized(true) // Force enable for debugging
    }
  }

  // Module selection removed - we now use iGaming as default

  const handleTemplateSelect = (template: MissionTemplate) => {
    
    // Apply template data
    // Note: Using default module 'igaming' - no need to set selectedModule as it's internal
    setCurrentRule(template.rule)
    setMissionData({
      ...missionData,
      name: template.name,
      description: template.description,
      reward: template.reward,
      coins: template.xp || 0,
      type: template.rule.maxClaims === 1 ? 'SINGLE' : 'RECURRING',
      category: 'CUSTOM',
      recurrence: template.timeWindow === '1d' ? 'DAILY' :
                  template.timeWindow === '7d' ? 'WEEKLY' : 'UNLIMITED',
      maxClaims: template.maxClaims,
      startDate: new Date().toISOString().slice(0, 16),
      endDate: '',
      productRewards: [],
      customerGroups: { include: [], exclude: [] }
    })
    
    // Go to rules step to show the applied template rules
    setStep('rule')
    setShowTemplates(true) // Mark that we came from templates
  }

  const handleRuleChange = useCallback((rule: BaseMissionRule) => {
    setCurrentRule(rule)
  }, [])

  const handleCustomerGroupsChange = useCallback((customerGroups: CustomerGroupSelection) => {
    setMissionData(prev => ({ ...prev, customerGroups }))
  }, [])

  // Initialize empty rule when needed
  const initializeEmptyRule = () => {
    if (!currentRule) {
      const emptyRule: BaseMissionRule = {
        triggers: [],
        conditions: [],
        logic: 'AND'
      }
      setCurrentRule(emptyRule)
    }
  }

  const handleNextStep = () => {
    switch (step) {
      case 'templates':
        initializeEmptyRule()
        setStep('rule')
        break
      case 'rule':
        // Use same logic as canProceed() - always allow progression from rules step
        setStep('groups')
        break
      case 'groups':
        setStep('details')
        break
      case 'details':
        if (isMissionDataValid(missionData)) setStep('review')
        break
      case 'review':
        handleCreateMission()
        break
    }
  }

  const handlePreviousStep = () => {
    switch (step) {
      case 'rule':
        setStep('templates')
        break
      case 'groups':
        setStep('rule')
        break
      case 'details':
        setStep('groups')
        break
      case 'review':
        setStep('details')
        break
    }
  }

  const isRuleValid = (rule: BaseMissionRule): boolean => {
    // Very relaxed validation - allow progression even with empty rules for simple missions
    if (!rule || (!rule.triggers && !rule.conditions)) {
      return true // Allow empty rules for simple missions
    }
    
    const hasValidTriggers = rule.triggers?.length > 0 && rule.triggers.every(trigger => trigger.event)
    const hasValidConditions = (rule.conditions?.length ?? 0) > 0 && (rule.conditions ?? []).every(condition =>
      condition.field && condition.operator && (condition.value !== undefined && condition.value !== null)
    )
    
    // Always allow progression - user can create simple missions without complex rules
    return true
  }

  const isMissionDataValid = (data: MissionData): boolean => {
    // Validações básicas
    const hasValidName = data.name.trim() !== ''
    const hasValidReward = data.reward >= 0
    const hasValidCoins = data.coins >= 0
    const hasValidTierPoints = data.tierPoints >= 0

    // Validação de datas - pelo menos uma data deve estar presente
    const hasStartDate = Boolean(data.startDate && data.startDate.trim() !== '')
    const hasEndDate = Boolean(data.endDate && data.endDate.trim() !== '')
    const hasAtLeastOneDate = hasStartDate || hasEndDate

    return hasValidName && hasValidReward && hasValidCoins && hasValidTierPoints && hasAtLeastOneDate
  }

  const handleCreateMission = () => {
    if (currentRule && isMissionDataValid(missionData)) {
      onMissionCreate?.({
        module: defaultModule,
        rule: currentRule,
        ...missionData
      })
    }
  }

  const canProceed = () => {
    switch (step) {
      case 'rule':
        return true // Always allow progression from rules step
      case 'groups':
        return true // Customer groups are optional
      case 'details':
        return isMissionDataValid(missionData)
      case 'review':
        return true
      default:
        return false
    }
  }

  if (!systemInitialized) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Inicializando Sistema de Missões</h2>
          <p className="mt-2 text-gray-600">Carregando módulos e configurações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Progress Indicator */}
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center justify-between">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-md ${
            step === 'rule' ? 'bg-blue-100 text-blue-800' : ['groups', 'details', 'review'].includes(step) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
          }`}>
            <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-sm font-semibold">1</span>
            <span className="text-sm font-medium">Regras</span>
          </div>
          <div className="flex-1 h-px bg-gray-200 mx-2"></div>
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-md ${
            step === 'groups' ? 'bg-blue-100 text-blue-800' : ['details', 'review'].includes(step) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
          }`}>
            <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-sm font-semibold">2</span>
            <span className="text-sm font-medium">Grupos</span>
          </div>
          <div className="flex-1 h-px bg-gray-200 mx-2"></div>
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-md ${
            step === 'details' ? 'bg-blue-100 text-blue-800' : step === 'review' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
          }`}>
            <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-sm font-semibold">3</span>
            <span className="text-sm font-medium">Detalhes</span>
          </div>
          <div className="flex-1 h-px bg-gray-200 mx-2"></div>
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-md ${
            step === 'review' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
          }`}>
            <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-sm font-semibold">4</span>
            <span className="text-sm font-medium">Revisão</span>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        {step === 'templates' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-500" />
                Comece Rapidamente
              </h2>
              <button
                onClick={() => {
                  initializeEmptyRule()
                  setStep('rule')
                }}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                ou crie do zero →
              </button>
            </div>
            
            <QuickTemplates onSelectTemplate={handleTemplateSelect} />
            
            <div className="flex justify-center pt-4 border-t">
              <button
                onClick={() => {
                  initializeEmptyRule()
                  setStep('rule')
                }}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Criar Missão do Zero
              </button>
            </div>
          </div>
        )}
        
        {/* Module selection step removed */}

        {step === 'rule' && (
          <div className="space-y-4">
            {showTemplates && currentRule && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-green-900">Template Aplicado com Sucesso!</h4>
                    <p className="text-sm text-green-700">
                      As regras do template "{missionData.name}" foram aplicadas. Você pode revisar e modificar conforme necessário.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="text-green-600 hover:text-green-800"
                >
                  ✕
                </button>
              </div>
            )}
            
            <ModularRuleBuilder
              initialRule={currentRule || undefined}
              onRuleChange={handleRuleChange}
              locale={locale}
              showTemplates={false}
            />
          </div>
        )}

        {step === 'groups' && (
          <CustomerGroupsStep
            value={missionData.customerGroups}
            onChange={handleCustomerGroupsChange}
            onNext={handleNextStep}
            onBack={handlePreviousStep}
            disabled={false}
          />
        )}

        {step === 'details' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <span>📝</span>
              Detalhes da Missão
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="mission-name" className="block text-sm font-medium text-gray-700">Nome da Missão *</label>
                <input
                  id="mission-name"
                  type="text"
                  value={missionData.name}
                  onChange={(e) => setMissionData({ ...missionData, name: e.target.value })}
                  placeholder="Ex: Apostador Semanal de Futebol"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="mission-description" className="block text-sm font-medium text-gray-700">Descrição *</label>
                <textarea
                  id="mission-description"
                  value={missionData.description}
                  onChange={(e) => setMissionData({ ...missionData, description: e.target.value })}
                  placeholder="Descreva o que o usuário precisa fazer para completar esta missão..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="mission-reward" className="block text-sm font-medium text-gray-700">Recompensa (R$) *</label>
                <input
                  id="mission-reward"
                  type="number"
                  value={missionData.reward}
                  onChange={(e) => setMissionData({ ...missionData, reward: Number(e.target.value) })}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="mission-coins" className="block text-sm font-medium text-gray-700">Coins *</label>
                <input
                  id="mission-coins"
                  type="number"
                  value={missionData.coins}
                  onChange={(e) => setMissionData({ ...missionData, coins: Number(e.target.value) })}
                  placeholder="0"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="mission-tier-points" className="block text-sm font-medium text-gray-700">Pontos de Tier</label>
                <input
                  id="mission-tier-points"
                  type="number"
                  value={missionData.tierPoints}
                  onChange={(e) => setMissionData({ ...missionData, tierPoints: Number(e.target.value) })}
                  placeholder="0"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="mission-type" className="block text-sm font-medium text-gray-700">Tipo de Missão *</label>
                <select
                  id="mission-type"
                  value={missionData.type}
                  onChange={(e) => setMissionData({ ...missionData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="SINGLE">🎯 Única - Completada uma vez</option>
                  <option value="RECURRING">🔄 Recorrente - Pode ser repetida</option>
                  <option value="STREAK">🔥 Sequência - Dias consecutivos</option>
                  <option value="MILESTONE">🏆 Marco - Objetivo de longo prazo</option>
                </select>
              </div>
              
              {missionData.type === 'RECURRING' && (
                <div className="space-y-2">
                  <label htmlFor="mission-recurrence" className="block text-sm font-medium text-gray-700">Período de Recorrência</label>
                  <select
                    id="mission-recurrence"
                    value={missionData.recurrence}
                    onChange={(e) => setMissionData({ ...missionData, recurrence: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="DAILY">📅 Diária - Reseta todo dia</option>
                    <option value="WEEKLY">📆 Semanal - Reseta toda semana</option>
                    <option value="MONTHLY">🗓️ Mensal - Reseta todo mês</option>
                    <option value="UNLIMITED">♾️ Ilimitada - Sem período definido</option>
                  </select>
                </div>
              )}
              
              <div className="space-y-2">
                <label htmlFor="mission-category" className="block text-sm font-medium text-gray-700">Categoria</label>
                <select
                  id="mission-category"
                  value={missionData.category}
                  onChange={(e) => setMissionData({ ...missionData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="DAILY">📅 Diária</option>
                  <option value="BETTING">🎰 Apostas</option>
                  <option value="DEPOSIT">💰 Depósito</option>
                  <option value="TUTORIAL">📚 Tutorial</option>
                  <option value="SPECIAL">⭐ Especial</option>
                  <option value="CUSTOM">🎯 Customizada</option>
                </select>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Período de Validade (Opcional)</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="mission-start" className="block text-xs text-gray-500 mb-1">Data Início</label>
                    <input
                      id="mission-start"
                      type="datetime-local"
                      value={missionData.startDate || ''}
                      onChange={(e) => setMissionData({ ...missionData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="mission-end" className="block text-xs text-gray-500 mb-1">Data Fim</label>
                    <input
                      id="mission-end"
                      type="datetime-local"
                      value={missionData.endDate || ''}
                      onChange={(e) => setMissionData({ ...missionData, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              {(
                <div className="space-y-2">
                  <label htmlFor="mission-max-claims" className="block text-sm font-medium text-gray-700">
                    Limite de Conclusões {missionData.type === 'SINGLE' ? '(Padrão: 1)' : '(Opcional)'}
                  </label>
                  <input
                    id="mission-max-claims"
                    type="number"
                    value={missionData.maxClaims || ''}
                    onChange={(e) => setMissionData({ ...missionData, maxClaims: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder={missionData.type === 'SINGLE' ? '1' : 'Ilimitado'}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>
            
            {/* Rewards Section */}
            <div className="md:col-span-2 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                🎁 Rewards Físicos/Digitais (Opcional)
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Além de coins e XP, você pode adicionar produtos como rewards para esta missão.
              </p>
              <RewardSelector
                selectedRewards={missionData.productRewards}
                onRewardsChange={(rewards) => setMissionData({ ...missionData, productRewards: rewards })}
              />
            </div>
          </div>
        )}

        {step === 'review' && currentRule && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <span>👁️</span>
              Revisar Missão
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Módulo</h3>
                <div className="text-sm text-gray-600">
                  <strong className="text-gray-900">{defaultModule.toUpperCase()}</strong>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Detalhes da Missão</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div><strong className="text-gray-900">Nome:</strong> {missionData.name}</div>
                  <div><strong className="text-gray-900">Descrição:</strong> {missionData.description}</div>
                  <div><strong className="text-gray-900">Tipo:</strong> {
                    missionData.type === 'SINGLE' ? '🎯 Única' :
                    missionData.type === 'RECURRING' ? '🔄 Recorrente' :
                    missionData.type === 'STREAK' ? '🔥 Sequência' :
                    '🏆 Marco'
                  }</div>
                  {missionData.type === 'RECURRING' && (
                    <div><strong className="text-gray-900">Período:</strong> {
                      missionData.recurrence === 'DAILY' ? '📅 Diária' :
                      missionData.recurrence === 'WEEKLY' ? '📆 Semanal' :
                      missionData.recurrence === 'MONTHLY' ? '🗓️ Mensal' :
                      '♾️ Ilimitada'
                    }</div>
                  )}
                  <div><strong className="text-gray-900">Categoria:</strong> {missionData.category}</div>
                  <div><strong className="text-gray-900">Recompensa:</strong> R$ {missionData.reward.toFixed(2)}</div>
                  <div><strong className="text-gray-900">Coins:</strong> {missionData.coins}</div>
                  <div><strong className="text-gray-900">Pontos de Tier:</strong> {missionData.tierPoints}</div>
                  {missionData.productRewards.length > 0 && (
                    <div><strong className="text-gray-900">Rewards:</strong> {missionData.productRewards.length} produto(s)</div>
                  )}
                  {missionData.maxClaims && (
                    <div><strong className="text-gray-900">Limite:</strong> {missionData.maxClaims} conclusões</div>
                  )}
                  {(missionData.customerGroups.include.length > 0 || missionData.customerGroups.exclude.length > 0) && (
                    <div><strong className="text-gray-900">Grupos:</strong> {
                      missionData.customerGroups.include.length > 0 ? `${missionData.customerGroups.include.length} incluídos` : ''
                    } {
                      missionData.customerGroups.include.length > 0 && missionData.customerGroups.exclude.length > 0 ? ', ' : ''
                    } {
                      missionData.customerGroups.exclude.length > 0 ? `${missionData.customerGroups.exclude.length} excluídos` : ''
                    }</div>
                  )}
                  {(missionData.startDate || missionData.endDate) && (
                    <div><strong className="text-gray-900">Validade:</strong> {
                      missionData.startDate ? `De ${new Date(missionData.startDate).toLocaleDateString('pt-BR')}` : ''
                    } {
                      missionData.endDate ? `Até ${new Date(missionData.endDate).toLocaleDateString('pt-BR')}` : ''
                    }</div>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Regras Configuradas</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div><strong className="text-gray-900">Eventos Disparadores:</strong> {currentRule.triggers.length}</div>
                  <div><strong className="text-gray-900">Condições:</strong> {currentRule.conditions?.length ?? 0}</div>
                  <div><strong className="text-gray-900">Lógica:</strong> {currentRule.logic || 'AND'}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Validation Message */}
      {step === 'details' && !canProceed() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mt-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Validação de formulário
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Para prosseguir, corrija os seguintes problemas:</p>
                <ul className="list-disc list-inside mt-1">
                  {!missionData.name.trim() && <li>Nome da Missão é obrigatório</li>}
                  {missionData.reward < 0 && <li>Recompensa deve ser maior ou igual a 0</li>}
                  {missionData.coins < 0 && <li>Coins deve ser maior ou igual a 0</li>}
                  {missionData.tierPoints < 0 && <li>Pontos de Tier deve ser maior ou igual a 0</li>}
                  {(() => {
                    const hasStartDate = missionData.startDate && missionData.startDate.trim() !== ''
                    const hasEndDate = missionData.endDate && missionData.endDate.trim() !== ''
                    const hasAtLeastOneDate = hasStartDate || hasEndDate
                    
                    if (!hasAtLeastOneDate) {
                      return <li key="no-date">Pelo menos uma data (início ou fim) deve ser preenchida</li>
                    }
                    
                    return null
                  })()}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-6">
        {step !== 'templates' && (
          <button
            onClick={handlePreviousStep}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            ← Voltar
          </button>
        )}
        
        <button
          onClick={handleNextStep}
          disabled={!canProceed()}
          className={`px-6 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            canProceed() 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          title={!canProceed() && step === 'details' ? 'Preencha todos os campos obrigatórios para prosseguir' : ''}
        >
          {step === 'review' ? 'Criar Missão' : 'Próximo →'}
        </button>
      </div>
    </div>
  )
}

// Export components for individual use
export { ModularRuleBuilder }