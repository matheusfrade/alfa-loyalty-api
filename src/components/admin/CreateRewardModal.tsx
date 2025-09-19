'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ProductCategory, DeliveryType } from '@/types/enums'

interface CreateRewardModalProps {
  onSuccess?: () => void
}

export function CreateRewardModal({ onSuccess }: CreateRewardModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'BONUS',
    price: 100,
    image: '',
    stock: undefined as number | undefined,
    deliveryType: 'AUTOMATIC',
    metadata: {
      value: '',
      duration: '',
      details: '',
    },
    isActive: true,
    isShopVisible: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // For now, we'll get the first program
      // In a real app, you'd have a program selector
      const programsResponse = await fetch('/api/programs')
      const programsData = await programsResponse.json()
      const programId = programsData.programs?.[0]?.id || 'default-program-id'

      const response = await fetch('/api/rewards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          programId,
          stock: formData.stock || null,
          metadata: formData.metadata,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create reward')
      }

      setOpen(false)
      setFormData({
        name: '',
        description: '',
        category: 'BONUS',
        price: 100,
        image: '',
        stock: undefined,
        deliveryType: 'AUTOMATIC',
        metadata: {
          value: '',
          duration: '',
          details: '',
        },
        isActive: true,
        isShopVisible: true,
      })
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error creating reward:', error)
      alert('Failed to create reward. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Reward</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Reward</DialogTitle>
          <DialogDescription>
            Add a new product to the rewards catalog
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Product Name
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Free Bet R$ 50"
              required
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Free bet to use on any sports event"
              rows={3}
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                Category
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                {Object.entries(ProductCategory).map(([key, value]) => (
                  <option key={key} value={value}>{key}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="deliveryType" className="text-sm font-medium">
                Delivery Type
              </label>
              <select
                id="deliveryType"
                value={formData.deliveryType}
                onChange={(e) => setFormData({ ...formData, deliveryType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                {Object.entries(DeliveryType).map(([key, value]) => (
                  <option key={key} value={value}>{key}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-medium">
                Price (in coins)
              </label>
              <input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="100"
                min={1}
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="stock" className="text-sm font-medium">
                Stock (leave empty for unlimited)
              </label>
              <input
                id="stock"
                type="number"
                value={formData.stock || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  stock: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="100"
                min={0}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="image" className="text-sm font-medium">
              Image URL (optional)
            </label>
            <input
              id="image"
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Metadata (optional)</label>
            <div className="space-y-2">
              <input
                type="text"
                value={formData.metadata.value}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  metadata: { ...formData.metadata, value: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Value (e.g., 50 for R$50)"
                disabled={loading}
              />
              <input
                type="text"
                value={formData.metadata.duration}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  metadata: { ...formData.metadata, duration: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Duration (e.g., 24 hours)"
                disabled={loading}
              />
              <input
                type="text"
                value={formData.metadata.details}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  metadata: { ...formData.metadata, details: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional details"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                id="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={loading}
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                Active immediately
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="isShopVisible"
                type="checkbox"
                checked={formData.isShopVisible}
                onChange={(e) => setFormData({ ...formData, isShopVisible: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={loading}
              />
              <label htmlFor="isShopVisible" className="text-sm font-medium">
                📦 Available in User Shop
              </label>
              <span className="text-xs text-gray-500">
                (Unchecked = System rewards only)
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Reward'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}