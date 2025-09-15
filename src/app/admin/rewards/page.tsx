'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreateRewardModal } from '@/components/admin/CreateRewardModal'

interface Product {
  id: string
  name: string
  description: string
  category: string
  price: number
  image?: string
  stock?: number
  isActive: boolean
  deliveryType: string
  program: {
    id: string
    name: string
  }
  tier?: {
    name: string
    level: number
  }
  _count?: {
    redemptions: number
  }
}

export default function RewardsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/rewards')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      } else {
        // Fallback to mock data
        const mockProducts: Product[] = [
          {
            id: '1',
            name: 'Free Bet R$ 50',
            description: 'Aposta grátis de R$ 50 para usar em qualquer esporte',
            category: 'BONUS',
            price: 150,
            image: 'https://images.unsplash.com/photo-1518611507436-f9221403cca2?w=400',
            isActive: true,
            deliveryType: 'CODE',
            program: { id: '1', name: 'Alfa Gaming' },
            _count: { redemptions: 234 }
          },
          {
            id: '2',
            name: '100 Free Spins - Gates of Olympus',
            description: '100 rodadas grátis no slot Gates of Olympus',
            category: 'FREESPINS',
            price: 200,
            image: 'https://images.unsplash.com/photo-1517232115160-ff93364542dd?w=400',
            isActive: true,
            deliveryType: 'AUTOMATIC',
            program: { id: '1', name: 'Alfa Gaming' },
            _count: { redemptions: 156 }
          },
          {
            id: '3',
            name: 'Cashback 10% - 24 horas',
            description: '10% de cashback em todas as perdas nas próximas 24 horas',
            category: 'CASHBACK',
            price: 300,
            image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400',
            isActive: true,
            deliveryType: 'AUTOMATIC',
            program: { id: '1', name: 'Alfa Gaming' },
            _count: { redemptions: 89 }
          },
          {
            id: '4',
            name: 'Camiseta Alfa Gaming',
            description: 'Camiseta oficial Alfa Gaming - Edição Limitada',
            category: 'PHYSICAL',
            price: 500,
            stock: 100,
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
            isActive: true,
            deliveryType: 'PHYSICAL',
            program: { id: '1', name: 'Alfa Gaming' },
            tier: { name: 'Ouro', level: 3 },
            _count: { redemptions: 12 }
          },
          {
            id: '5',
            name: 'Ingresso Final Brasileirão',
            description: 'Par de ingressos para a final do Campeonato Brasileiro',
            category: 'EXPERIENCE',
            price: 2000,
            stock: 5,
            image: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=400',
            isActive: false,
            deliveryType: 'MANUAL',
            program: { id: '1', name: 'Alfa Gaming' },
            tier: { name: 'Diamante', level: 4 },
            _count: { redemptions: 3 }
          }
        ]
        setProducts(mockProducts)
      }
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      BONUS: 'bg-green-100 text-green-800',
      FREESPINS: 'bg-blue-100 text-blue-800',
      CASHBACK: 'bg-yellow-100 text-yellow-800',
      PHYSICAL: 'bg-purple-100 text-purple-800',
      EXPERIENCE: 'bg-red-100 text-red-800',
      CREDITS: 'bg-indigo-100 text-indigo-800',
      PREMIUM: 'bg-pink-100 text-pink-800',
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const getDeliveryIcon = (type: string) => {
    const icons: Record<string, string> = {
      AUTOMATIC: '⚡',
      CODE: '🔑',
      PHYSICAL: '📦',
      MANUAL: '👤',
    }
    return icons[type] || '📋'
  }

  const handleToggleProduct = async (productId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/rewards/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      })

      if (response.ok) {
        loadProducts()
      }
    } catch (error) {
      console.error('Error toggling product:', error)
    }
  }

  const filteredProducts = products.filter(product => {
    if (filter === 'all') return true
    if (filter === 'active') return product.isActive
    if (filter === 'inactive') return !product.isActive
    if (filter === 'low_stock') return product.stock !== undefined && product.stock < 10
    return product.category === filter
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rewards</h2>
          <p className="text-gray-600">Manage reward products and catalog</p>
        </div>
        
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rewards</h2>
          <p className="text-gray-600">Manage reward products and catalog</p>
        </div>
        <CreateRewardModal onSuccess={loadProducts} />
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'All Products' },
          { key: 'active', label: 'Active' },
          { key: 'inactive', label: 'Inactive' },
          { key: 'low_stock', label: 'Low Stock' },
          { key: 'BONUS', label: 'Bonus' },
          { key: 'FREESPINS', label: 'Free Spins' },
          { key: 'CASHBACK', label: 'Cashback' },
          { key: 'PHYSICAL', label: 'Physical' },
          { key: 'EXPERIENCE', label: 'Experience' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filter === key
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            {product.image && (
              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(product.category)}`}>
                    {product.category}
                  </span>
                  {!product.isActive && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>
                {product.tier && (
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 text-xs bg-black/50 text-white rounded-full">
                      {product.tier.name}+
                    </span>
                  </div>
                )}
              </div>
            )}
            
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="truncate">{product.name}</span>
                <div className="flex items-center gap-1 text-sm font-normal text-yellow-600">
                  <span>🪙</span>
                  <span>{product.price}</span>
                </div>
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {product.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <span>{getDeliveryIcon(product.deliveryType)}</span>
                  <span>{product.deliveryType}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🔢</span>
                  <span>
                    {product.stock !== undefined ? `${product.stock} left` : 'Unlimited'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <span>📊</span>
                  <span>{product._count?.redemptions || 0} redeemed</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🏷️</span>
                  <span className="truncate">{product.program.name}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={`flex-1 ${product.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                  onClick={() => handleToggleProduct(product.id, product.isActive)}
                >
                  {product.isActive ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <span className="text-4xl">🎁</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No rewards yet' : `No ${filter} rewards`}
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all' 
                ? 'Create your first reward to motivate users.'
                : `Try adjusting your filter or create a new ${filter} reward.`
              }
            </p>
            <Button>Create Reward</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}