'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface DashboardStats {
  totalUsers: number
  totalPrograms: number
  totalMissions: number
  totalRewards: number
  todaySignups: number
  todayRedemptions: number
  activeMissions: number
  totalCoinsEarned: number
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
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      // For now, we'll simulate some stats since we haven't built the analytics API yet
      // In a real app, you'd fetch from /api/admin/stats
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setStats({
        totalUsers: 125,
        totalPrograms: 3,
        totalMissions: 45,
        totalRewards: 28,
        todaySignups: 8,
        todayRedemptions: 15,
        activeMissions: 32,
        totalCoinsEarned: 24750,
      })
    } catch (error) {
      console.error('Failed to load dashboard stats:', error)
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
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New user registered</p>
                  <p className="text-xs text-gray-500">user@example.com • 2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Mission completed</p>
                  <p className="text-xs text-gray-500">Daily Login Streak • 5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Reward redeemed</p>
                  <p className="text-xs text-gray-500">Free Bet R$ 50 • 12 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Tier upgrade</p>
                  <p className="text-xs text-gray-500">Bronze → Silver • 1 hour ago</p>
                </div>
              </div>
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