'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MissionBuilder } from '@/components/mission-builder'
import { ModularRuleBuilder } from '@/components/mission-builder/ModularRuleBuilder'
import { RewardSelector } from '@/components/admin/RewardSelector'
import { CustomerGroupsStep } from '@/components/mission-builder/CustomerGroupsStep'
import { BaseMissionRule } from '@/core/types'
import { CustomerGroupSelection } from '@/types/customer-groups'
import { ArrowLeft, Save, Settings, ChevronDown, ChevronRight } from 'lucide-react'

interface Mission {
  id: string
  title: string
  description: string
  category: string
  type: string
  reward: number
  xpReward: number
  tierPointsReward?: number
  requirement?: any
  metadata?: any
  startDate?: string
  endDate?: string
  maxClaims?: number
  order?: number
  program?: {
    id: string
    name: string
  }
  productRewards?: Array<{
    productId: string
    quantity: number
    product: {
      id: string
      name: string
      image?: string
    }
  }>
}

export default function EditMissionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [mission, setMission] = useState<Mission | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [useFullBuilder, setUseFullBuilder] = useState(false)

  useEffect(() => {
    loadMission()
  }, [params.id])

  const loadMission = async () => {
    try {
      const response = await fetch(`/api/missions/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setMission(data)

        // Check if user wants to use full builder for advanced editing
        setUseFullBuilder(data.metadata?.created_with === 'modular_system' || false)
      } else {
        alert('Erro ao carregar missão')
        router.push('/admin/missions')
      }
    } catch (error) {
      console.error('Error loading mission:', error)
      alert('Erro ao carregar missão')
      router.push('/admin/missions')
    } finally {
      setLoading(false)
    }
  }

  const handleFullBuilderUpdate = async (updatedMission: {
    module: string
    rule: BaseMissionRule
    name: string
    description: string
    reward: number
    coins: number
    tierPoints?: number
    productRewards?: Array<{ productId: string; quantity: number }>
    customerGroups?: any
  }) => {
    if (!mission) return

    setSaving(true)
    try {
      console.log('🔄 Updating mission with full builder:', mission.id, updatedMission)

      const missionData = {
        title: updatedMission.name,
        description: updatedMission.description,
        reward: updatedMission.reward,
        xpReward: updatedMission.coins,
        tierPointsReward: updatedMission.tierPoints || 0,
        requirement: updatedMission.rule,
        productRewards: updatedMission.productRewards || [],
        metadata: {
          ...mission.metadata,
          module: updatedMission.module,
          customerGroups: updatedMission.customerGroups,
          updated_with: 'modular_system',
          updated_at: new Date().toISOString()
        }
      }

      const response = await fetch(`/api/missions/${mission.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(missionData),
      })

      if (response.ok) {
        console.log('✅ Mission updated successfully!')
        router.push('/admin/missions')
      } else {
        const error = await response.json()
        console.error('❌ Error updating mission:', error)
        alert('Erro ao atualizar missão: ' + (error.message || 'Erro desconhecido'))
      }
    } catch (error) {
      console.error('❌ Error updating mission:', error)
      alert('Erro ao atualizar missão: ' + error)
    } finally {
      setSaving(false)
    }
  }

  const toggleEditMode = () => {
    setUseFullBuilder(!useFullBuilder)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!mission) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Missão não encontrada</p>
        <Button onClick={() => router.push('/admin/missions')} className="mt-4">
          Voltar para Missões
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/admin/missions')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Editar Missão</h2>
          <p className="text-gray-600">Atualize os detalhes da missão</p>
        </div>
      </div>

      {/* Edit Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle>✏️ {mission.title}</CardTitle>
          <CardDescription>
            Escolha o modo de edição para atualizar sua missão
          </CardDescription>

          <div className="flex gap-4 mt-4">
            <Button
              variant={!useFullBuilder ? 'default' : 'outline'}
              onClick={() => setUseFullBuilder(false)}
              className="flex-1"
            >
              📝 Edição Simples
            </Button>
            <Button
              variant={useFullBuilder ? 'default' : 'outline'}
              onClick={() => setUseFullBuilder(true)}
              className="flex-1"
            >
              🛠️ Edição Completa (Rewards, Grupos, etc.)
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <p className="text-sm text-blue-800">
              {!useFullBuilder ? (
                <><strong>Edição Simples:</strong> Edite apenas campos básicos como nome, descrição e recompensas simples.</>
              ) : (
                <><strong>Edição Completa:</strong> Acesso total ao sistema modular com triggers, rewards de produtos, grupos de clientes e configurações avançadas.</>
              )}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {useFullBuilder ? (
            <MissionEditor
              mission={mission}
              onMissionUpdate={handleFullBuilderUpdate}
              locale="pt-BR"
            />
          ) : (
            <SimpleEditForm mission={mission} onSave={handleFullBuilderUpdate} />
          )}
        </CardContent>
      </Card>

      {/* Saving overlay */}
      {saving && useFullBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Salvando alterações...</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Simple Edit Form Component
function SimpleEditForm({ mission, onSave }: { mission: Mission, onSave: any }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: mission.title || '',
    description: mission.description || '',
    reward: mission.reward || 0,
    coins: mission.xpReward || 0,
    tierPoints: mission.tierPointsReward || 0,
  })

  const handleSimpleSave = async () => {
    setSaving(true)
    try {
      // Convert simple form data to the format expected by handleFullBuilderUpdate
      const missionData = {
        module: 'igaming',
        rule: {
          triggers: mission.requirement?.triggers || [],
          conditions: mission.requirement?.conditions || [],
          logic: mission.requirement?.logic || 'AND'
        } as BaseMissionRule,
        name: formData.name,
        description: formData.description,
        reward: formData.reward,
        coins: formData.coins,
        tierPoints: formData.tierPoints,
        productRewards: mission.productRewards?.map(pr => ({
          productId: pr.productId,
          quantity: pr.quantity
        })) || [],
        customerGroups: mission.metadata?.customerGroups || { include: [], exclude: [] }
      }

      await onSave(missionData)
    } catch (error) {
      console.error('Error saving simple mission:', error)
      alert('Erro ao salvar missão: ' + error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Basic Fields */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nome da Missão
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Digite o nome da missão"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            id="description"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Descreva o que o usuário precisa fazer"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="reward" className="block text-sm font-medium text-gray-700 mb-1">
              🪙 Recompensa (coins)
            </label>
            <input
              id="reward"
              type="number"
              min="0"
              value={formData.reward}
              onChange={(e) => setFormData({ ...formData, reward: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="coins" className="block text-sm font-medium text-gray-700 mb-1">
              ⭐ XP
            </label>
            <input
              id="coins"
              type="number"
              min="0"
              value={formData.coins}
              onChange={(e) => setFormData({ ...formData, coins: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="tierPoints" className="block text-sm font-medium text-gray-700 mb-1">
              🎯 Pontos de Tier
            </label>
            <input
              id="tierPoints"
              type="number"
              min="0"
              value={formData.tierPoints}
              onChange={(e) => setFormData({ ...formData, tierPoints: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Current Settings Display */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">📋 Configurações Atuais</h3>
        <div className="space-y-2 text-sm">
          <div><strong>Categoria:</strong> {mission.category}</div>
          <div><strong>Tipo:</strong> {mission.type}</div>
          {mission.maxClaims && <div><strong>Máximo de Resgates:</strong> {mission.maxClaims}</div>}
          {mission.startDate && <div><strong>Data de Início:</strong> {new Date(mission.startDate).toLocaleDateString('pt-BR')}</div>}
          {mission.endDate && <div><strong>Data de Fim:</strong> {new Date(mission.endDate).toLocaleDateString('pt-BR')}</div>}
        </div>
        <p className="text-xs text-blue-600 mt-2">
          💡 Para modificar essas configurações, use a "Edição Completa"
        </p>
      </div>

      {/* Product Rewards */}
      {mission.productRewards && mission.productRewards.length > 0 && (
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">🎁 Recompensas de Produtos</h3>
          <div className="flex flex-wrap gap-2">
            {mission.productRewards.map((reward) => (
              <div key={reward.product.id} className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                <span>{reward.quantity}x</span>
                <span>{reward.product.name}</span>
                {reward.product.image && (
                  <img src={reward.product.image} alt={reward.product.name} className="w-5 h-5 rounded-full ml-1" />
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-blue-600 mt-2">
            💡 Para modificar recompensas de produtos, use a "Edição Completa"
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => router.push('/admin/missions')}
          disabled={saving}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSimpleSave}
          disabled={saving || !formData.name.trim()}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </div>
  )
}

// Mission Editor Component - Skips template selection for editing
function MissionEditor({ mission, onMissionUpdate, locale }: {
  mission: Mission,
  onMissionUpdate: any,
  locale?: string
}) {
  const [currentStep, setCurrentStep] = useState<'rule' | 'groups' | 'details' | 'review'>('rule')
  const [saving, setSaving] = useState(false)

  // Initialize with mission data
  const [currentRule, setCurrentRule] = useState<BaseMissionRule>(() => {
    const requirement = mission.requirement
    if (requirement && typeof requirement === 'object') {
      return {
        triggers: requirement.triggers || [],
        conditions: requirement.conditions || [],
        logic: requirement.logic || 'AND'
      }
    }
    return {
      triggers: [],
      conditions: [],
      logic: 'AND'
    }
  })

  const [missionData, setMissionData] = useState({
    name: mission.title || '',
    description: mission.description || '',
    reward: mission.reward || 0,
    coins: mission.xpReward || 0,
    tierPoints: mission.tierPointsReward || 0,
    productRewards: mission.productRewards?.map(pr => ({
      productId: pr.productId,
      quantity: pr.quantity
    })) || [],
    customerGroups: mission.metadata?.customerGroups || { include: [], exclude: [] }
  })

  const handleNext = () => {
    switch (currentStep) {
      case 'rule':
        setCurrentStep('groups')
        break
      case 'groups':
        setCurrentStep('details')
        break
      case 'details':
        setCurrentStep('review')
        break
      case 'review':
        handleSave()
        break
    }
  }

  const handlePrevious = () => {
    switch (currentStep) {
      case 'groups':
        setCurrentStep('rule')
        break
      case 'details':
        setCurrentStep('groups')
        break
      case 'review':
        setCurrentStep('details')
        break
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updatedMission = {
        module: 'igaming',
        rule: currentRule,
        name: missionData.name,
        description: missionData.description,
        reward: missionData.reward,
        coins: missionData.coins,
        tierPoints: missionData.tierPoints,
        productRewards: missionData.productRewards,
        customerGroups: missionData.customerGroups
      }

      await onMissionUpdate(updatedMission)
    } catch (error) {
      console.error('Error saving mission:', error)
    } finally {
      setSaving(false)
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 'rule': return 'Configurar Regras'
      case 'groups': return 'Grupos de Clientes'
      case 'details': return 'Detalhes da Missão'
      case 'review': return 'Revisão Final'
      default: return 'Editar Missão'
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 'rule': return true // Rules are optional
      case 'groups': return true // Groups are optional
      case 'details': return missionData.name.trim() !== ''
      case 'review': return true
      default: return false
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-8">
          {[
            { key: 'rule', label: 'Regras', number: 1 },
            { key: 'groups', label: 'Grupos', number: 2 },
            { key: 'details', label: 'Detalhes', number: 3 },
            { key: 'review', label: 'Revisão', number: 4 }
          ].map((step) => (
            <div key={step.key} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${currentStep === step.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
                }
              `}>
                {step.number}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep === step.key ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step title */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900">{getStepTitle()}</h3>
      </div>

      {/* Step content */}
      <div className="min-h-[400px]">
        {currentStep === 'rule' && (
          <ModularRuleBuilder
            moduleName="igaming"
            initialRule={currentRule}
            onRuleChange={setCurrentRule}
            locale={locale}
          />
        )}

        {currentStep === 'groups' && (
          <CustomerGroupsStep
            value={missionData.customerGroups}
            onChange={(groups) =>
              setMissionData(prev => ({ ...prev, customerGroups: groups }))
            }
            onNext={() => setCurrentStep('details')}
            onBack={() => setCurrentStep('rule')}
          />
        )}

        {currentStep === 'details' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Missão
                </label>
                <input
                  type="text"
                  value={missionData.name}
                  onChange={(e) => setMissionData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Digite o nome da missão"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  rows={3}
                  value={missionData.description}
                  onChange={(e) => setMissionData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descreva o que o usuário precisa fazer"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    🪙 Recompensa (coins)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={missionData.reward}
                    onChange={(e) => setMissionData(prev => ({ ...prev, reward: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ⭐ XP
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={missionData.coins}
                    onChange={(e) => setMissionData(prev => ({ ...prev, coins: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    🎯 Pontos de Tier
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={missionData.tierPoints}
                    onChange={(e) => setMissionData(prev => ({ ...prev, tierPoints: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <RewardSelector
              selectedRewards={missionData.productRewards}
              onRewardsChange={(rewards) =>
                setMissionData(prev => ({ ...prev, productRewards: rewards }))
              }
            />
          </div>
        )}

        {currentStep === 'review' && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Resumo da Missão</h4>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Informações Básicas</h5>
                  <div className="space-y-1 text-sm">
                    <div><strong>Nome:</strong> {missionData.name}</div>
                    <div><strong>Descrição:</strong> {missionData.description}</div>
                    <div><strong>Recompensa:</strong> {missionData.reward} coins</div>
                    <div><strong>XP:</strong> {missionData.coins}</div>
                    <div><strong>Tier Points:</strong> {missionData.tierPoints}</div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Configurações</h5>
                  <div className="space-y-1 text-sm">
                    <div><strong>Triggers:</strong> {currentRule.triggers?.length || 0} trigger(s)</div>
                    <div><strong>Condições:</strong> {currentRule.conditions?.length || 0} condição(ões)</div>
                    <div><strong>Recompensas de Produtos:</strong> {missionData.productRewards?.length || 0} produto(s)</div>
                    <div><strong>Grupos:</strong> {(missionData.customerGroups?.include?.length || 0) + (missionData.customerGroups?.exclude?.length || 0)} configurado(s)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 'rule' || saving}
        >
          Anterior
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canProceed() || saving}
          className="gap-2"
        >
          {saving ? (
            <>Salvando...</>
          ) : currentStep === 'review' ? (
            <>
              <Save className="h-4 w-4" />
              Salvar Alterações
            </>
          ) : (
            'Próximo'
          )}
        </Button>
      </div>
    </div>
  )
}