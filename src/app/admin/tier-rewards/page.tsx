'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, RefreshCw, Gift, Users, Clock, X, Save } from 'lucide-react'

interface TierReward {
  id: string
  tierId: string
  productId: string
  rewardType: string
  quotaType: string
  quotaLimit?: number
  quotaPeriod?: string
  autoDeliver: boolean
  description?: string
  usageCount: number
  isActive: boolean
  tier: {
    id: string
    name: string
    level: number
    color: string
  }
  product: {
    id: string
    name: string
    description: string
    category: string
    price: number
    deliveryType: string
  }
  createdAt: string
  updatedAt: string
}

interface Tier {
  id: string
  name: string
  level: number
  color: string
}

interface Product {
  id: string
  name: string
  description: string
  category: string
  price: number
}

export default function TierRewardsPage() {
  const [tierRewards, setTierRewards] = useState<TierReward[]>([])
  const [tiers, setTiers] = useState<Tier[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showNewRewardModal, setShowNewRewardModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedProgram] = useState('cmfo9wui100011b6eanlnbfne') // TODO: Dynamic program selection

  const [newRewardForm, setNewRewardForm] = useState({
    tierId: '',
    productId: '',
    rewardType: 'WELCOME' as const,
    quotaType: 'PER_TIER' as const,
    quotaLimit: '',
    autoDeliver: true,
    description: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // Load tier rewards, tiers, and products in parallel
      const [tierRewardsRes, tiersRes, productsRes] = await Promise.all([
        fetch(`/api/admin/tier-rewards?programId=${selectedProgram}`),
        fetch(`/api/admin/tiers?programId=${selectedProgram}`),
        fetch(`/api/rewards?programId=${selectedProgram}`)
      ])

      if (tierRewardsRes.ok) {
        const tierRewardsData = await tierRewardsRes.json()
        setTierRewards(tierRewardsData.data || [])
      }

      if (tiersRes.ok) {
        const tiersData = await tiersRes.json()
        setTiers(tiersData.data || [])
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(productsData.products || [])
      }

    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const handleCreateReward = async () => {
    try {
      setSaving(true)

      const rewardData = {
        tierId: newRewardForm.tierId,
        productId: newRewardForm.productId,
        rewardType: newRewardForm.rewardType,
        quotaType: newRewardForm.quotaType,
        quotaLimit: newRewardForm.quotaLimit ? parseInt(newRewardForm.quotaLimit) : undefined,
        autoDeliver: newRewardForm.autoDeliver,
        description: newRewardForm.description || undefined,
      }

      const response = await fetch('/api/admin/tier-rewards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(rewardData)
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`Erro ao criar tier reward: ${error.error}`)
        return
      }

      // Reload data and close modal
      await loadData()
      setShowNewRewardModal(false)

      // Reset form
      setNewRewardForm({
        tierId: '',
        productId: '',
        rewardType: 'WELCOME',
        quotaType: 'PER_TIER',
        quotaLimit: '',
        autoDeliver: true,
        description: ''
      })

    } catch (error) {
      console.error('Error creating tier reward:', error)
      alert('Erro ao criar tier reward')
    } finally {
      setSaving(false)
    }
  }

  const getRewardTypeColor = (type: string) => {
    const colors = {
      WELCOME: 'bg-green-100 text-green-800',
      RECURRING: 'bg-blue-100 text-blue-800',
      MILESTONE: 'bg-purple-100 text-purple-800',
      EXCLUSIVE: 'bg-yellow-100 text-yellow-800',
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getQuotaTypeLabel = (type: string) => {
    const labels = {
      DAILY: 'Diário',
      WEEKLY: 'Semanal',
      MONTHLY: 'Mensal',
      PER_TIER: 'Por Tier',
      UNLIMITED: 'Ilimitado',
    }
    return labels[type as keyof typeof labels] || type
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando tier rewards...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tier Rewards</h1>
          <p className="text-gray-600">
            Configure recompensas automáticas por tier
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
            onClick={() => setShowNewRewardModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Tier Reward
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{tierRewards.length}</div>
            <div className="text-sm text-gray-600">Total Rewards</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {tierRewards.filter(r => r.autoDeliver).length}
            </div>
            <div className="text-sm text-gray-600">Auto Delivery</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {tierRewards.reduce((sum, r) => sum + r.usageCount, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Usage</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {tierRewards.filter(r => r.rewardType === 'RECURRING').length}
            </div>
            <div className="text-sm text-gray-600">Recurring</div>
          </CardContent>
        </Card>
      </div>

      {/* Tier Rewards List */}
      <Card>
        <CardHeader>
          <CardTitle>Tier Rewards Configurados</CardTitle>
          <CardDescription>
            Lista de recompensas automáticas por tier
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tierRewards.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Nenhum tier reward configurado
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Configure recompensas automáticas para diferentes tiers.
              </p>
              <div className="mt-6">
                <Button onClick={() => setShowNewRewardModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Reward
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {tierRewards.map((reward) => (
                <div key={reward.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: reward.tier.color }}
                        />
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {reward.tier.name} → {reward.product.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {reward.product.description}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getRewardTypeColor(reward.rewardType)}`}>
                          {reward.rewardType}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                        <div>
                          <span className="text-gray-600">Quota:</span>{' '}
                          <span className="font-medium">
                            {reward.quotaLimit ? `${reward.quotaLimit}x ` : ''}
                            {getQuotaTypeLabel(reward.quotaType)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Entrega:</span>{' '}
                          <span className="font-medium">
                            {reward.autoDeliver ? 'Automática' : 'Manual'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Uso:</span>{' '}
                          <span className="font-medium">{reward.usageCount}x</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Preço:</span>{' '}
                          <span className="font-medium">{reward.product.price} coins</span>
                        </div>
                      </div>

                      {reward.description && (
                        <p className="text-sm text-gray-600 mt-2">{reward.description}</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800">
                        Remover
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para Novo Tier Reward */}
      {showNewRewardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Criar Novo Tier Reward</h2>
              <button
                onClick={() => setShowNewRewardModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tier
                  </label>
                  <select
                    value={newRewardForm.tierId}
                    onChange={(e) => setNewRewardForm(prev => ({ ...prev, tierId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione um tier</option>
                    {tiers.map((tier) => (
                      <option key={tier.id} value={tier.id}>
                        {tier.name} (Level {tier.level})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Produto
                  </label>
                  <select
                    value={newRewardForm.productId}
                    onChange={(e) => setNewRewardForm(prev => ({ ...prev, productId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione um produto</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.price} coins)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Reward
                  </label>
                  <select
                    value={newRewardForm.rewardType}
                    onChange={(e) => setNewRewardForm(prev => ({ ...prev, rewardType: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="WELCOME">Welcome (ao subir tier)</option>
                    <option value="RECURRING">Recurring (recorrente)</option>
                    <option value="MILESTONE">Milestone (marcos)</option>
                    <option value="EXCLUSIVE">Exclusive (exclusivo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Quota
                  </label>
                  <select
                    value={newRewardForm.quotaType}
                    onChange={(e) => setNewRewardForm(prev => ({ ...prev, quotaType: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DAILY">Diário</option>
                    <option value="WEEKLY">Semanal</option>
                    <option value="MONTHLY">Mensal</option>
                    <option value="PER_TIER">Por Tier</option>
                    <option value="UNLIMITED">Ilimitado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Limite da Quota
                  </label>
                  <input
                    type="number"
                    value={newRewardForm.quotaLimit}
                    onChange={(e) => setNewRewardForm(prev => ({ ...prev, quotaLimit: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Deixe vazio para ilimitado"
                    min="1"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <input
                    type="checkbox"
                    id="autoDeliver"
                    checked={newRewardForm.autoDeliver}
                    onChange={(e) => setNewRewardForm(prev => ({ ...prev, autoDeliver: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="autoDeliver" className="ml-2 block text-sm text-gray-900">
                    Entrega Automática
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição (Opcional)
                </label>
                <textarea
                  value={newRewardForm.description}
                  onChange={(e) => setNewRewardForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Descrição personalizada do reward"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t">
              <Button
                variant="outline"
                onClick={() => setShowNewRewardModal(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateReward}
                disabled={saving || !newRewardForm.tierId || !newRewardForm.productId}
              >
                {saving ? 'Criando...' : 'Criar Tier Reward'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}