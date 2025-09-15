'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface User {
  id: string
  name: string
  email: string
  isActive: boolean
  createdAt: string
  lastLoginAt?: string
  programs: {
    id: string
    coins: number
    xp: number
    tier?: {
      name: string
      level: number
      color: string
    }
    program: {
      name: string
    }
  }[]
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      // Mock data since we don't have the API endpoint yet
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockUsers: User[] = [
        {
          id: '1',
          name: 'Test User 1',
          email: 'user1@test.com',
          isActive: true,
          createdAt: '2025-01-01T00:00:00Z',
          lastLoginAt: '2025-09-05T08:30:00Z',
          programs: [{
            id: '1',
            coins: 1250,
            xp: 350,
            tier: { name: 'Bronze', level: 1, color: '#CD7F32' },
            program: { name: 'Alfa Gaming' }
          }]
        },
        {
          id: '2',
          name: 'Test User 2',
          email: 'user2@test.com',
          isActive: true,
          createdAt: '2025-01-02T00:00:00Z',
          lastLoginAt: '2025-09-04T18:45:00Z',
          programs: [{
            id: '2',
            coins: 2800,
            xp: 750,
            tier: { name: 'Prata', level: 2, color: '#C0C0C0' },
            program: { name: 'Alfa Gaming' }
          }]
        },
        {
          id: '3',
          name: 'Test User 3',
          email: 'user3@test.com',
          isActive: true,
          createdAt: '2025-01-03T00:00:00Z',
          lastLoginAt: '2025-09-05T09:15:00Z',
          programs: [{
            id: '3',
            coins: 4500,
            xp: 1850,
            tier: { name: 'Ouro', level: 3, color: '#FFD700' },
            program: { name: 'Alfa Gaming' }
          }]
        },
        {
          id: '4',
          name: 'Test User 4',
          email: 'user4@test.com',
          isActive: false,
          createdAt: '2025-01-04T00:00:00Z',
          lastLoginAt: '2025-08-20T14:20:00Z',
          programs: [{
            id: '4',
            coins: 150,
            xp: 50,
            tier: { name: 'Iniciante', level: 0, color: '#6b7280' },
            program: { name: 'Alfa Gaming' }
          }]
        },
        {
          id: '5',
          name: 'VIP User',
          email: 'vip@test.com',
          isActive: true,
          createdAt: '2024-12-15T00:00:00Z',
          lastLoginAt: '2025-09-05T07:00:00Z',
          programs: [{
            id: '5',
            coins: 8750,
            xp: 18500,
            tier: { name: 'VIP', level: 5, color: '#9333EA' },
            program: { name: 'Alfa Gaming' }
          }]
        }
      ]
      
      setUsers(mockUsers)
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (isActive: boolean, lastLogin?: string) => {
    if (!isActive) return 'bg-red-100 text-red-800'
    
    if (lastLogin) {
      const lastLoginDate = new Date(lastLogin)
      const daysSinceLogin = (Date.now() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24)
      
      if (daysSinceLogin < 1) return 'bg-green-100 text-green-800'
      if (daysSinceLogin < 7) return 'bg-yellow-100 text-yellow-800'
      return 'bg-orange-100 text-orange-800'
    }
    
    return 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (isActive: boolean, lastLogin?: string) => {
    if (!isActive) return 'Inactive'
    
    if (lastLogin) {
      const lastLoginDate = new Date(lastLogin)
      const hoursSinceLogin = (Date.now() - lastLoginDate.getTime()) / (1000 * 60 * 60)
      
      if (hoursSinceLogin < 24) return 'Online Today'
      if (hoursSinceLogin < 168) return 'Active This Week'
      return 'Inactive'
    }
    
    return 'Never Logged In'
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
                         user.email.toLowerCase().includes(search.toLowerCase())
    
    if (!matchesSearch) return false
    
    if (filter === 'all') return true
    if (filter === 'active') return user.isActive
    if (filter === 'inactive') return !user.isActive
    if (filter === 'vip') return user.programs.some(p => p.tier && p.tier.level >= 4)
    if (filter === 'new') {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return new Date(user.createdAt) > weekAgo
    }
    
    return true
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Users</h2>
          <p className="text-gray-600">Manage user accounts and activity</p>
        </div>
        
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
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
          <h2 className="text-2xl font-bold text-gray-900">Users</h2>
          <p className="text-gray-600">Manage user accounts and activity</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export CSV</Button>
          <Button>Invite User</Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'All Users' },
            { key: 'active', label: 'Active' },
            { key: 'inactive', label: 'Inactive' },
            { key: 'vip', label: 'VIP' },
            { key: 'new', label: 'New (7d)' },
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
      </div>
      
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{user.name}</CardTitle>
                      <CardDescription>{user.email}</CardDescription>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(user.isActive, user.lastLoginAt)}`}>
                      {getStatusText(user.isActive, user.lastLoginAt)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-lg font-bold text-yellow-600">
                        🪙 {user.programs[0]?.coins?.toLocaleString() || 0}
                      </div>
                      <div className="text-xs text-gray-600">Coins</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">
                        ✨ {user.programs[0]?.xp?.toLocaleString() || 0}
                      </div>
                      <div className="text-xs text-gray-600">XP</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold" style={{ color: user.programs[0]?.tier?.color || '#6b7280' }}>
                        🏆 {user.programs[0]?.tier?.name || 'No Tier'}
                      </div>
                      <div className="text-xs text-gray-600">Tier</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-600">
                        📅 {Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))}d
                      </div>
                      <div className="text-xs text-gray-600">Member for</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Created:</span> {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                    {user.lastLoginAt && (
                      <div>
                        <span className="font-medium">Last login:</span> {new Date(user.lastLoginAt).toLocaleDateString()}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Program:</span> {user.programs[0]?.program.name}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className={user.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}
                  >
                    {user.isActive ? 'Suspend' : 'Activate'}
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <span className="text-4xl">👥</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {search ? 'No users found' : 'No users yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {search 
                ? `No users match "${search}" with the selected filters.`
                : 'Users will appear here once they join your loyalty program.'
              }
            </p>
            {search && (
              <Button variant="outline" onClick={() => setSearch('')}>
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{users.length}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.isActive).length}
            </div>
            <div className="text-sm text-gray-600">Active Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {users.filter(u => u.programs.some(p => p.tier && p.tier.level >= 4)).length}
            </div>
            <div className="text-sm text-gray-600">VIP Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {users.filter(u => {
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return new Date(u.createdAt) > weekAgo
              }).length}
            </div>
            <div className="text-sm text-gray-600">New This Week</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}