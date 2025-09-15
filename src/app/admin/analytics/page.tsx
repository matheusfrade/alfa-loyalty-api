'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface AnalyticsData {
  overview: {
    totalUsers: number
    activeUsers: number
    totalCoinsEarned: number
    totalCoinsSpent: number
    missionCompletions: number
    rewardRedemptions: number
    averageSessionTime: number
    churnRate: number
  }
  growth: {
    newUsers: { date: string; count: number }[]
    coinsEarned: { date: string; amount: number }[]
    redemptions: { date: string; count: number }[]
  }
  engagement: {
    topMissions: { name: string; completions: number; category: string }[]
    topRewards: { name: string; redemptions: number; category: string }[]
    tierDistribution: { tier: string; count: number; percentage: number }[]
  }
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    try {
      // Mock data since we don't have the analytics API yet
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockData: AnalyticsData = {
        overview: {
          totalUsers: 1247,
          activeUsers: 892,
          totalCoinsEarned: 245750,
          totalCoinsSpent: 156200,
          missionCompletions: 3456,
          rewardRedemptions: 678,
          averageSessionTime: 18.5,
          churnRate: 12.3,
        },
        growth: {
          newUsers: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            count: Math.floor(Math.random() * 20) + 5
          })),
          coinsEarned: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            amount: Math.floor(Math.random() * 5000) + 2000
          })),
          redemptions: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            count: Math.floor(Math.random() * 30) + 10
          })),
        },
        engagement: {
          topMissions: [
            { name: 'Daily Login', completions: 1245, category: 'DAILY' },
            { name: 'First Bet', completions: 892, category: 'BETTING' },
            { name: 'KYC Complete', completions: 567, category: 'TUTORIAL' },
            { name: 'Weekly Challenge', completions: 334, category: 'WEEKLY' },
            { name: 'High Roller', completions: 123, category: 'SPECIAL' },
          ],
          topRewards: [
            { name: 'Free Bet R$ 50', redemptions: 234, category: 'BONUS' },
            { name: '100 Free Spins', redemptions: 189, category: 'FREESPINS' },
            { name: 'Cashback 10%', redemptions: 145, category: 'CASHBACK' },
            { name: 'Credit R$ 100', redemptions: 98, category: 'CREDITS' },
            { name: 'VIP Support', redemptions: 45, category: 'PREMIUM' },
          ],
          tierDistribution: [
            { tier: 'Iniciante', count: 456, percentage: 36.6 },
            { tier: 'Bronze', count: 312, percentage: 25.0 },
            { tier: 'Prata', count: 234, percentage: 18.8 },
            { tier: 'Ouro', count: 156, percentage: 12.5 },
            { tier: 'Diamante', count: 67, percentage: 5.4 },
            { tier: 'VIP', count: 22, percentage: 1.8 },
          ],
        },
      }
      
      setData(mockData)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
          <p className="text-gray-600">Platform performance and insights</p>
        </div>
        
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
          <p className="text-gray-600">Platform performance and insights</p>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <span className="text-4xl">📊</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Unavailable</h3>
            <p className="text-gray-600">Unable to load analytics data at this time.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
          <p className="text-gray-600">Platform performance and insights</p>
        </div>
        
        <div className="flex gap-2">
          {[
            { key: '7d', label: 'Last 7 days' },
            { key: '30d', label: 'Last 30 days' },
            { key: '90d', label: 'Last 3 months' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTimeRange(key)}
              className={`px-3 py-1 rounded text-sm font-medium ${
                timeRange === key
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data.overview.totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {data.overview.activeUsers} active ({Math.round((data.overview.activeUsers / data.overview.totalUsers) * 100)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Coins Economy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data.overview.totalCoinsEarned.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {data.overview.totalCoinsSpent.toLocaleString()} spent ({Math.round((data.overview.totalCoinsSpent / data.overview.totalCoinsEarned) * 100)}% rate)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Mission Completions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {data.overview.missionCompletions.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Avg {Math.round(data.overview.missionCompletions / data.overview.totalUsers * 10) / 10} per user
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Reward Redemptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {data.overview.rewardRedemptions.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {Math.round((data.overview.rewardRedemptions / data.overview.activeUsers) * 100)}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Session Time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {data.overview.averageSessionTime} min
            </div>
            <p className="text-xs text-gray-500 mt-1">
              High engagement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Churn Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {data.overview.churnRate}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {data.overview.churnRate < 15 ? 'Healthy' : 'Needs attention'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-600">
              {data.overview.activeUsers}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {Math.round((data.overview.activeUsers / data.overview.totalUsers) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Coins Per User</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {Math.round(data.overview.totalCoinsEarned / data.overview.totalUsers)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Average earned
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Missions */}
        <Card>
          <CardHeader>
            <CardTitle>Top Missions</CardTitle>
            <CardDescription>Most completed challenges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.engagement.topMissions.map((mission, index) => (
                <div key={mission.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{mission.name}</div>
                      <div className="text-sm text-gray-500">{mission.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-purple-600">
                      {mission.completions.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">completions</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Rewards */}
        <Card>
          <CardHeader>
            <CardTitle>Top Rewards</CardTitle>
            <CardDescription>Most redeemed products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.engagement.topRewards.map((reward, index) => (
                <div key={reward.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{reward.name}</div>
                      <div className="text-sm text-gray-500">{reward.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-orange-600">
                      {reward.redemptions.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">redemptions</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tier Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>User Tier Distribution</CardTitle>
            <CardDescription>User progression levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.engagement.tierDistribution.map((tier) => (
                <div key={tier.tier} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="font-medium">{tier.tier}</div>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300"
                        style={{ width: `${tier.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-right min-w-0 ml-3">
                    <div className="font-bold">{tier.count}</div>
                    <div className="text-xs text-gray-500">{tier.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Growth Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Growth Trends</CardTitle>
            <CardDescription>User growth over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-2xl mb-2">📈</div>
                <div className="text-sm">Growth chart coming soon</div>
                <div className="text-xs mt-1">Interactive charts with detailed metrics</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline">Export Report</Button>
        <Button variant="outline">Schedule Report</Button>
        <Button>Create Dashboard</Button>
      </div>
    </div>
  )
}