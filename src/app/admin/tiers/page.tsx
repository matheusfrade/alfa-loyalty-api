'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, RefreshCw, AlertTriangle, TrendingUp, Users, Clock, X } from 'lucide-react'
import { TierMetrics } from '@/modules/tiers/types'

interface TierData {
  id: string
  name: string
  level: number
  minPoints?: number
  maxPoints?: number
  maintenancePoints?: number
  color: string
  icon?: string
  multiplier: number
  benefits: string[]
  isInviteOnly: boolean
  isActive: boolean
  playerCount: number
  avgPointsLive: number
}

export default function TiersPage() {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<TierMetrics | null>(null)
  const [tiers, setTiers] = useState<TierData[]>([])
  const [selectedProgram] = useState('cmfo9wui100011b6eanlnbfne') // TODO: Implementar seleção de programa
  const [refreshing, setRefreshing] = useState(false)
  const [showNewTierModal, setShowNewTierModal] = useState(false)
  const [newTierForm, setNewTierForm] = useState({
    name: '',
    level: 0,
    minPoints: 0,
    maxPoints: '',
    maintenancePoints: '',
    color: '#6366f1',
    multiplier: 1.0,
    benefits: ['']
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [selectedProgram])

  const loadData = async () => {
    try {
      setLoading(true)

      // Carregar métricas e tiers em paralelo
      const [metricsRes, tiersRes] = await Promise.all([
        fetch(`/api/admin/metrics/tiers?programId=${selectedProgram}`),
        fetch(`/api/admin/tiers?programId=${selectedProgram}`)
      ])

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json()
        setMetrics(metricsData.data)
      }

      if (tiersRes.ok) {
        const tiersData = await tiersRes.json()
        setTiers(tiersData.data)
      }

    } catch (error) {
      console.error('Error loading tier data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num)
  }

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`
  }

  const handleCreateTier = async () => {
    try {
      setSaving(true)

      // Use a hardcoded program ID for now since we know the seed creates one
      // In a real implementation, this would come from the user's selection
      const programId = selectedProgram

      const tierData = {
        programId,
        name: newTierForm.name,
        level: newTierForm.level,
        minPoints: newTierForm.minPoints,
        maxPoints: newTierForm.maxPoints ? parseInt(newTierForm.maxPoints) : null,
        maintenancePoints: newTierForm.maintenancePoints ? parseInt(newTierForm.maintenancePoints) : null,
        color: newTierForm.color,
        multiplier: newTierForm.multiplier,
        benefits: newTierForm.benefits.filter(b => b.trim() !== '')
      }

      const response = await fetch('/api/admin/tiers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tierData)
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`Erro ao criar tier: ${error.error}`)
        return
      }

      // Reload data and close modal
      await loadData()
      setShowNewTierModal(false)

      // Reset form
      setNewTierForm({
        name: '',
        level: 0,
        minPoints: 0,
        maxPoints: '',
        maintenancePoints: '',
        color: '#6366f1',
        multiplier: 1.0,
        benefits: ['']
      })

    } catch (error) {
      console.error('Error creating tier:', error)
      alert('Erro ao criar tier')
    } finally {
      setSaving(false)
    }
  }

  const addBenefit = () => {
    setNewTierForm(prev => ({
      ...prev,
      benefits: [...prev.benefits, '']
    }))
  }

  const removeBenefit = (index: number) => {
    setNewTierForm(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }))
  }

  const updateBenefit = (index: number, value: string) => {
    setNewTierForm(prev => ({
      ...prev,
      benefits: prev.benefits.map((benefit, i) => i === index ? value : benefit)
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados de tiers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sistema de Tiers</h1>
          <p className="text-gray-600">
            Gerencie níveis, pontos e políticas de manutenção
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button
            size="sm"
            onClick={() => setShowNewTierModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Tier
          </Button>
        </div>
      </div>

      {/* Alertas */}
      {metrics?.alerts.vipInflation.isAlert && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Alerta de Inflação VIP
              </h3>
              <p className="text-sm text-red-700">
                {formatPercentage(metrics.alerts.vipInflation.percentage)} dos usuários
                estão no tier máximo (limite: {metrics.alerts.vipInflation.threshold}%)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Jogadores</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(metrics?.totalPlayers || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pontos Vivos</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(metrics?.totalPointsLive || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">% Tier Máximo</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPercentage(metrics?.alerts.vipInflation.percentage || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Expirando 30d</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(
                  metrics?.expirationSchedule.find(e => e.period === '30 days')?.pointsExpiring || 0
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Distribuição por Tier */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Distribuição por Tier
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {metrics?.distributionByTier.map((tierData) => {
              const tier = tiers.find(t => t.id === tierData.tierId)
              return (
                <div key={tierData.tierId} className="flex items-center">
                  <div
                    className="w-4 h-4 rounded mr-3"
                    style={{ backgroundColor: tier?.color || '#gray' }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        {tierData.tierName}
                      </span>
                      <span className="text-sm text-gray-600">
                        {formatNumber(tierData.playerCount)} jogadores ({formatPercentage(tierData.percentage)})
                      </span>
                    </div>
                    <div className="mt-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          backgroundColor: tier?.color || '#gray',
                          width: `${tierData.percentage}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Cronograma de Expiração */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Cronograma de Expiração
          </h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-sm font-medium text-gray-600">
                    Período
                  </th>
                  <th className="text-right py-2 text-sm font-medium text-gray-600">
                    Pontos Expirando
                  </th>
                  <th className="text-right py-2 text-sm font-medium text-gray-600">
                    Jogadores Afetados
                  </th>
                </tr>
              </thead>
              <tbody>
                {metrics?.expirationSchedule.map((schedule) => (
                  <tr key={schedule.period} className="border-b border-gray-100">
                    <td className="py-3 text-sm text-gray-900">
                      Próximos {schedule.period}
                    </td>
                    <td className="py-3 text-sm text-gray-900 text-right">
                      {formatNumber(schedule.pointsExpiring)}
                    </td>
                    <td className="py-3 text-sm text-gray-900 text-right">
                      {formatNumber(schedule.playersAffected)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Lista de Tiers */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Configuração de Tiers
          </h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-sm font-medium text-gray-600">
                    Tier
                  </th>
                  <th className="text-right py-2 text-sm font-medium text-gray-600">
                    Range de Pontos
                  </th>
                  <th className="text-right py-2 text-sm font-medium text-gray-600">
                    Manutenção
                  </th>
                  <th className="text-right py-2 text-sm font-medium text-gray-600">
                    Jogadores
                  </th>
                  <th className="text-right py-2 text-sm font-medium text-gray-600">
                    Multiplier
                  </th>
                  <th className="text-right py-2 text-sm font-medium text-gray-600">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {tiers.map((tier) => (
                  <tr key={tier.id} className="border-b border-gray-100">
                    <td className="py-3">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded mr-2"
                          style={{ backgroundColor: tier.color }}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {tier.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            Level {tier.level}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-sm text-gray-900 text-right">
                      {tier.minPoints ? formatNumber(tier.minPoints) : '0'} - {' '}
                      {tier.maxPoints ? formatNumber(tier.maxPoints) : '∞'}
                    </td>
                    <td className="py-3 text-sm text-gray-900 text-right">
                      {tier.maintenancePoints ? formatNumber(tier.maintenancePoints) : '-'}
                    </td>
                    <td className="py-3 text-sm text-gray-900 text-right">
                      {formatNumber(tier.playerCount)}
                    </td>
                    <td className="py-3 text-sm text-gray-900 text-right">
                      {tier.multiplier}x
                    </td>
                    <td className="py-3 text-right">
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal para Novo Tier */}
      {showNewTierModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Criar Novo Tier</h2>
              <button
                onClick={() => setShowNewTierModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Tier
                  </label>
                  <input
                    type="text"
                    value={newTierForm.name}
                    onChange={(e) => setNewTierForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Ouro"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nível
                  </label>
                  <input
                    type="number"
                    value={newTierForm.level}
                    onChange={(e) => setNewTierForm(prev => ({ ...prev, level: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pontos Mínimos
                  </label>
                  <input
                    type="number"
                    value={newTierForm.minPoints}
                    onChange={(e) => setNewTierForm(prev => ({ ...prev, minPoints: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pontos Máximos
                  </label>
                  <input
                    type="number"
                    value={newTierForm.maxPoints}
                    onChange={(e) => setNewTierForm(prev => ({ ...prev, maxPoints: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Deixe vazio para ilimitado"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pontos de Manutenção
                  </label>
                  <input
                    type="number"
                    value={newTierForm.maintenancePoints}
                    onChange={(e) => setNewTierForm(prev => ({ ...prev, maintenancePoints: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Opcional"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cor
                  </label>
                  <input
                    type="color"
                    value={newTierForm.color}
                    onChange={(e) => setNewTierForm(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Multiplicador
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newTierForm.multiplier}
                    onChange={(e) => setNewTierForm(prev => ({ ...prev, multiplier: parseFloat(e.target.value) || 1.0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0.1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Benefícios
                </label>
                {newTierForm.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={benefit}
                      onChange={(e) => updateBenefit(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Digite um benefício"
                    />
                    <button
                      onClick={() => removeBenefit(index)}
                      className="text-red-600 hover:text-red-800"
                      disabled={newTierForm.benefits.length === 1}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addBenefit}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Adicionar benefício
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t">
              <Button
                variant="outline"
                onClick={() => setShowNewTierModal(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateTier}
                disabled={saving || !newTierForm.name.trim()}
              >
                {saving ? 'Criando...' : 'Criar Tier'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}