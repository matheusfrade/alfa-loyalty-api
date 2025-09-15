'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MissionBuilder } from '@/components/mission-builder'
import { ModularRuleBuilder } from '@/components/mission-builder/ModularRuleBuilder'
import { BaseMissionRule } from '@/core/types'
import { ArrowLeft, Save, Settings, ChevronDown, ChevronRight } from 'lucide-react'

interface Mission {
  id: string
  title: string
  description: string
  category: string
  type: string
  reward: number
  xpReward: number
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
  const [mode, setMode] = useState<'simple' | 'modular'>('simple')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [advancedRule, setAdvancedRule] = useState<BaseMissionRule | null>(null)

  // Form state for simple mode
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    type: '',
    reward: 0,
    xpReward: 0,
    startDate: '',
    endDate: '',
    maxClaims: 0,
    order: 0,
  })

  useEffect(() => {
    loadMission()
  }, [params.id])

  const loadMission = async () => {
    try {
      const response = await fetch(`/api/missions/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setMission(data)
        
        // Check if mission was created with modular system
        if (data.metadata?.created_with === 'modular_system') {
          setMode('modular')
        } else {
          setMode('simple')
        }

        // Initialize form data
        setFormData({
          title: data.title || '',
          description: data.description || '',
          category: data.category || '',
          type: data.type || '',
          reward: data.reward || 0,
          xpReward: data.xpReward || 0,
          startDate: data.startDate ? new Date(data.startDate).toISOString().slice(0, 16) : '',
          endDate: data.endDate ? new Date(data.endDate).toISOString().slice(0, 16) : '',
          maxClaims: data.maxClaims || 0,
          order: data.order || 0,
        })

        // Initialize advanced rule if it exists
        if (data.requirement && typeof data.requirement === 'object') {
          setAdvancedRule(data.requirement)
        }
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

  const handleModularUpdate = async (updatedMission: {
    module?: string
    rule?: BaseMissionRule
    name?: string
    description?: string
    reward?: number
    xp?: number
    startDate?: string
    endDate?: string
    productRewards?: { productId: string; quantity: number }[]
  }) => {
    if (!mission) return

    setSaving(true)
    try {
      console.log('🔄 Updating mission:', mission.id, updatedMission)
      
      const missionData = {
        title: updatedMission.name || mission.title,
        description: updatedMission.description || mission.description,
        reward: updatedMission.reward ?? mission.reward,
        xpReward: updatedMission.xp ?? mission.xpReward,
        requirement: updatedMission.rule || mission.requirement,
        startDate: updatedMission.startDate,
        endDate: updatedMission.endDate,
        productRewards: updatedMission.productRewards,
        metadata: {
          ...mission.metadata,
          module: updatedMission.module || mission.metadata?.module,
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

  const handleSimpleUpdate = async () => {
    if (!mission) return

    setSaving(true)
    try {
      const response = await fetch(`/api/missions/${mission.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined,
          requirement: advancedRule || mission.requirement,
        }),
      })

      if (response.ok) {
        router.push('/admin/missions')
      } else {
        const error = await response.json()
        alert('Erro ao atualizar missão: ' + (error.message || 'Erro desconhecido'))
      }
    } catch (error) {
      alert('Erro ao atualizar missão: ' + error)
    } finally {
      setSaving(false)
    }
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

      {/* Edit Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>✏️ {mission.title}</CardTitle>
          <CardDescription>
            {mode === 'modular' 
              ? 'Edite a missão usando o sistema modular'
              : 'Edite os detalhes da missão'
            }
          </CardDescription>
          {mode === 'simple' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <p className="text-sm text-blue-800">
                💡 Esta missão foi criada no modo simples. Para usar recursos avançados, 
                recrie a missão usando o sistema modular.
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {mode === 'modular' ? (
            <MissionBuilder
              onMissionCreate={handleModularUpdate}
              locale="pt-BR"
            />
          ) : (
            <div className="space-y-6">
              {/* Simple form with all fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Título
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione...</option>
                    <option value="DAILY">Diária</option>
                    <option value="BETTING">Apostas</option>
                    <option value="TUTORIAL">Tutorial</option>
                    <option value="DEPOSIT">Depósito</option>
                    <option value="SPECIAL">Especial</option>
                    <option value="CUSTOM">Personalizada</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo
                  </label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione...</option>
                    <option value="SINGLE">Única</option>
                    <option value="RECURRING">Recorrente</option>
                    <option value="STREAK">Sequência</option>
                    <option value="MILESTONE">Marco</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="reward" className="block text-sm font-medium text-gray-700 mb-1">
                    Recompensa (coins)
                  </label>
                  <input
                    id="reward"
                    type="number"
                    value={formData.reward}
                    onChange={(e) => setFormData({ ...formData, reward: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="xpReward" className="block text-sm font-medium text-gray-700 mb-1">
                    XP
                  </label>
                  <input
                    id="xpReward"
                    type="number"
                    value={formData.xpReward}
                    onChange={(e) => setFormData({ ...formData, xpReward: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="maxClaims" className="block text-sm font-medium text-gray-700 mb-1">
                    Máximo de Resgates
                  </label>
                  <input
                    id="maxClaims"
                    type="number"
                    value={formData.maxClaims}
                    onChange={(e) => setFormData({ ...formData, maxClaims: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Início
                  </label>
                  <input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Término
                  </label>
                  <input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
                    Ordem de Exibição
                  </label>
                  <input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Advanced Rules Section */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-medium text-gray-900">Regras Avançadas</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="gap-2"
                  >
                    {showAdvanced ? (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Ocultar
                      </>
                    ) : (
                      <>
                        <ChevronRight className="h-4 w-4" />
                        Configurar Triggers e Condições
                      </>
                    )}
                  </Button>
                </div>

                {showAdvanced && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <div className="text-sm text-gray-700 mb-4">
                      <p className="mb-2">Configure quando e como esta missão será ativada:</p>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        <li><strong>Triggers:</strong> Eventos que iniciam a missão (ex: fazer aposta, fazer login)</li>
                        <li><strong>Conditions:</strong> Condições que devem ser atendidas (ex: valor mínimo, categoria)</li>
                      </ul>
                    </div>

                    <ModularRuleBuilder
                      moduleName="igaming"
                      initialRule={advancedRule || undefined}
                      onRuleChange={(rule) => setAdvancedRule(rule)}
                      locale="pt-BR"
                      className="bg-white rounded-lg"
                    />

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        💡 <strong>Dica:</strong> Se você não configurar regras específicas, a missão será ativada manualmente ou por eventos padrão do sistema.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Product Rewards */}
              {mission.productRewards && mission.productRewards.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">🎁 Recompensas de Produtos</h3>
                  <div className="flex flex-wrap gap-2">
                    {mission.productRewards.map((reward) => (
                      <div key={reward.product.id} className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                        <span>{reward.quantity}x</span>
                        <span>{reward.product.name}</span>
                        {reward.product.image && (
                          <img src={reward.product.image} alt={reward.product.name} className="w-5 h-5 rounded-full ml-1" />
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Para modificar as recompensas de produtos, recrie a missão usando o sistema modular.
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => router.push('/admin/missions')}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSimpleUpdate}
                  disabled={saving}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Saving overlay */}
      {saving && mode === 'modular' && (
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