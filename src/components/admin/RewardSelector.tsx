'use client'

import { useState, useEffect } from 'react'

interface Product {
  id: string
  name: string
  description: string
  category: string
  price: number
  image?: string
  stock?: number
  isActive: boolean
}

interface SelectedReward {
  productId: string
  quantity: number
}

interface RewardSelectorProps {
  selectedRewards: SelectedReward[]
  onRewardsChange: (rewards: SelectedReward[]) => void
  programId?: string
}

export function RewardSelector({ 
  selectedRewards = [], 
  onRewardsChange,
  programId 
}: RewardSelectorProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [category, setCategory] = useState('all')

  useEffect(() => {
    loadProducts()
  }, [programId])

  const loadProducts = async () => {
    try {
      const params = new URLSearchParams()
      if (programId) params.append('programId', programId)
      
      const response = await fetch(`/api/rewards?${params}`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleReward = (productId: string) => {
    const existing = selectedRewards.find(r => r.productId === productId)
    
    if (existing) {
      // Remove if already selected
      onRewardsChange(selectedRewards.filter(r => r.productId !== productId))
    } else {
      // Add with default quantity of 1
      onRewardsChange([...selectedRewards, { productId, quantity: 1 }])
    }
  }

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity < 1) return
    
    const updated = selectedRewards.map(r => 
      r.productId === productId ? { ...r, quantity } : r
    )
    onRewardsChange(updated)
  }

  const isSelected = (productId: string) => {
    return selectedRewards.some(r => r.productId === productId)
  }

  const getQuantity = (productId: string) => {
    return selectedRewards.find(r => r.productId === productId)?.quantity || 1
  }

  const filteredProducts = products.filter(product => {
    if (!product.isActive) return false
    if (category !== 'all' && product.category !== category) return false
    if (filter && !product.name.toLowerCase().includes(filter.toLowerCase()) &&
        !product.description.toLowerCase().includes(filter.toLowerCase())) return false
    return true
  })

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'PHYSICAL': '📦',
      'DIGITAL': '💻',
      'BONUS': '🎁',
      'DISCOUNT': '🏷️',
      'EXPERIENCE': '🎯',
      'MERCHANDISE': '👕',
    }
    return icons[category] || '🎁'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Buscar rewards..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todas Categorias</option>
          <option value="PHYSICAL">📦 Físico</option>
          <option value="DIGITAL">💻 Digital</option>
          <option value="BONUS">🎁 Bônus</option>
          <option value="DISCOUNT">🏷️ Desconto</option>
          <option value="EXPERIENCE">🎯 Experiência</option>
          <option value="MERCHANDISE">👕 Merchandise</option>
        </select>
      </div>

      {/* Selected Count */}
      {selectedRewards.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            {selectedRewards.length} reward(s) selecionado(s)
          </p>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {filteredProducts.map(product => (
          <div
            key={product.id}
            className={`border rounded-lg p-4 transition-all ${
              isSelected(product.id) 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={isSelected(product.id)}
                onChange={() => handleToggleReward(product.id)}
                className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <span>{getCategoryIcon(product.category)}</span>
                      {product.name}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                    
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        💰 {product.price} coins
                      </span>
                      {product.stock !== null && (
                        <span className="flex items-center gap-1">
                          📦 {product.stock} em estoque
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                </div>
                
                {/* Quantity Selector */}
                {isSelected(product.id) && (
                  <div className="mt-3 flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      Quantidade:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={product.stock || 99}
                      value={getQuantity(product.id)}
                      onChange={(e) => handleQuantityChange(product.id, Number(e.target.value))}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhum reward encontrado</p>
          <p className="text-sm mt-2">Tente ajustar os filtros ou criar novos rewards</p>
        </div>
      )}
    </div>
  )
}