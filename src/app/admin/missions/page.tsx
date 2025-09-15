'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface Mission {
  id: string
  title: string
  description: string
  category: string
  type: string
  reward: number
  xpReward: number
  isActive: boolean
  order: number
  program: {
    id: string
    name: string
  }
  _count?: {
    userMissions: number
  }
}

export default function MissionsPage() {
  const router = useRouter()
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadMissions()
  }, [])

  const loadMissions = async () => {
    try {
      const response = await fetch('/api/missions')
      if (response.ok) {
        const data = await response.json()
        setMissions(data.missions || [])
      } else {
        console.error('Failed to load missions')
        setMissions([])
      }
    } catch (error) {
      console.error('Failed to load missions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      DAILY: 'bg-blue-100 text-blue-800',
      BETTING: 'bg-green-100 text-green-800',
      TUTORIAL: 'bg-purple-100 text-purple-800',
      DEPOSIT: 'bg-yellow-100 text-yellow-800',
      SPECIAL: 'bg-red-100 text-red-800',
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      SINGLE: '🎯',
      RECURRING: '🔄',
      STREAK: '🔥',
      MILESTONE: '🏆',
    }
    return icons[type] || '📋'
  }

  const handleToggleMission = async (missionId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/missions/${missionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      })

      if (response.ok) {
        loadMissions()
      }
    } catch (error) {
      console.error('Error toggling mission:', error)
    }
  }

  const handleEditMission = (missionId: string) => {
    router.push(`/admin/missions/${missionId}/edit`)
  }

  const handleDeleteMission = async (missionId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta missão?')) return

    try {
      const response = await fetch(`/api/missions/${missionId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        loadMissions()
      } else {
        const error = await response.json()
        alert('Erro ao excluir missão: ' + (error.message || 'Erro desconhecido'))
      }
    } catch (error) {
      console.error('Error deleting mission:', error)
      alert('Erro ao excluir missão')
    }
  }

  const filteredMissions = missions.filter(mission => {
    if (filter === 'all') return true
    if (filter === 'active') return mission.isActive
    if (filter === 'inactive') return !mission.isActive
    return mission.category === filter
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Missions</h2>
          <p className="text-gray-600">Manage gamification challenges</p>
        </div>
        
        <div className="animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
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
          <h2 className="text-2xl font-bold text-gray-900">Missions</h2>
          <p className="text-gray-600">Manage gamification challenges</p>
        </div>
        <Button 
          onClick={() => router.push('/admin/missions/new')}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Mission
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'All Missions' },
          { key: 'active', label: 'Active' },
          { key: 'inactive', label: 'Inactive' },
          { key: 'DAILY', label: 'Daily' },
          { key: 'BETTING', label: 'Betting' },
          { key: 'TUTORIAL', label: 'Tutorial' },
          { key: 'DEPOSIT', label: 'Deposit' },
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
      
      <div className="grid gap-4">
        {filteredMissions.map((mission) => (
          <Card key={mission.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg">{getTypeIcon(mission.type)}</span>
                    <CardTitle className="text-lg">{mission.title}</CardTitle>
                    <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(mission.category)}`}>
                      {mission.category}
                    </span>
                    {mission.isActive ? (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                  <CardDescription className="mb-3">
                    {mission.description}
                  </CardDescription>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">🪙</span>
                      <span>{mission.reward} coins</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-purple-500">✨</span>
                      <span>{mission.xpReward} XP</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-blue-500">👥</span>
                      <span>{mission._count?.userMissions || 0} participants</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400">🏷️</span>
                      <span>{mission.program.name}</span>
                    </div>
                  </div>
                  
                  {/* Product Rewards - Commented out until productRewards is added to Mission model */}
                  {/* 
                  {mission.productRewards && mission.productRewards.length > 0 && (
                    <div className="flex flex-wrap gap-2 text-sm">
                      <span className="text-green-600 font-medium">🎁 Rewards:</span>
                      {mission.productRewards.map((reward: any) => (
                        <div key={reward.product.id} className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs">
                          <span>{reward.quantity}x</span>
                          <span>{reward.product.name}</span>
                          {reward.product.image && (
                            <img src={reward.product.image} alt={reward.product.name} className="w-4 h-4 rounded-full ml-1" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  */}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditMission(mission.id)}
                  >
                    ✏️ Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className={mission.isActive ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'}
                    onClick={() => handleToggleMission(mission.id, mission.isActive)}
                  >
                    {mission.isActive ? '⏸️ Disable' : '▶️ Enable'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    onClick={() => handleDeleteMission(mission.id)}
                  >
                    🗑️ Delete
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {filteredMissions.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <span className="text-4xl">🎯</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No missions yet' : `No ${filter} missions`}
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all' 
                ? 'Create your first mission to engage users.'
                : `Try adjusting your filter or create a new ${filter} mission.`
              }
            </p>
            <Button onClick={() => router.push('/admin/missions/new')}>Create Mission</Button>
          </CardContent>
        </Card>
      )}

    </div>
  )
}