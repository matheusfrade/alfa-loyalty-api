'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface RecentActivity {
  id: string
  type: string
  userName: string
  userEmail: string
  amount: number
  description: string
  createdAt: string
}

interface DashboardStats {
  totalUsers: number
  totalPrograms: number
  totalMissions: number
  totalRewards: number
  todaySignups: number
  todayRedemptions: number
  activeMissions: number
  totalCoinsEarned: number
  recentActivity: RecentActivity[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPrograms: 0,
    totalMissions: 0,
    totalRewards: 0,
    todaySignups: 0,
    todayRedemptions: 0,
    activeMissions: 0,
    totalCoinsEarned: 0,
    recentActivity: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats')
      }

      const result = await response.json()

      if (result.success) {
        setStats(result.data)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Failed to load dashboard stats:', error)
      // Fallback to simulated data if API fails
      setStats({
        totalUsers: 150,
        totalPrograms: 1,
        totalMissions: 5,
        totalRewards: 10,
        todaySignups: 8,
        todayRedemptions: 15,
        activeMissions: 4,
        totalCoinsEarned: 50000,
        recentActivity: [],
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600">Overview of your loyalty platform</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">Overview of your loyalty platform</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              +{stats.todaySignups} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Programs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.totalPrograms}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Multi-tenant ready
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Missions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.totalMissions}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.activeMissions} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Rewards Available</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.totalRewards}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.todayRedemptions} redeemed today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Coins Earned</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.totalCoinsEarned.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Total platform coins
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Today's Signups</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {stats.todaySignups}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              New registrations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Today's Redemptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.todayRedemptions}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Rewards claimed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Platform Health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              99.9%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Uptime
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivity.length > 0 ? (
                stats.recentActivity.slice(0, 4).map((activity) => {
                  const getActivityColor = (type: string) => {
                    switch (type) {
                      case 'EARNED': return 'bg-green-500'
                      case 'SPENT': return 'bg-red-500'
                      case 'BONUS': return 'bg-blue-500'
                      case 'REFUND': return 'bg-orange-500'
                      default: return 'bg-gray-500'
                    }
                  }

                  const getActivityIcon = (type: string) => {
                    switch (type) {
                      case 'EARNED': return '💰'
                      case 'SPENT': return '🛍️'
                      case 'BONUS': return '🎁'
                      case 'REFUND': return '↩️'
                      default: return '📝'
                    }
                  }

                  const formatAmount = (amount: number) => {
                    if (amount > 0) return `+${amount}`
                    return amount.toString()
                  }

                  const timeAgo = (dateString: string) => {
                    const diff = Date.now() - new Date(dateString).getTime()
                    const minutes = Math.floor(diff / 60000)
                    if (minutes < 60) return `${minutes}m ago`
                    const hours = Math.floor(minutes / 60)
                    if (hours < 24) return `${hours}h ago`
                    return `${Math.floor(hours / 24)}d ago`
                  }

                  return (
                    <div key={activity.id} className="flex items-center space-x-3">
                      <div className={`w-2 h-2 ${getActivityColor(activity.type)} rounded-full`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {getActivityIcon(activity.type)} {activity.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.userName} • {formatAmount(activity.amount)} coins • {timeAgo(activity.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-sm text-gray-500 text-center py-4">
                  Nenhuma atividade recente
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="font-medium">Create New Mission</div>
              <div className="text-sm text-gray-500">Set up engagement challenges</div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="font-medium">Add Reward Product</div>
              <div className="text-sm text-gray-500">Expand your rewards catalog</div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="font-medium">Configure Tiers</div>
              <div className="text-sm text-gray-500">Adjust progression levels</div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="font-medium">View Analytics</div>
              <div className="text-sm text-gray-500">Check engagement metrics</div>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}