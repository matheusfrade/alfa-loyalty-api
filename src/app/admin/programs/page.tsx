'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Program {
  id: string
  name: string
  slug: string
  type: string
  isActive: boolean
  createdAt: string
  _count?: {
    users: number
    missions: number
    products: number
  }
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPrograms()
  }, [])

  const handleViewAnalytics = (programId: string) => {
    console.log('📊 View Analytics clicked for program:', programId)
    // TODO: Navigate to analytics page or open modal
    alert(`Analytics para programa ${programId} - Em desenvolvimento`)
  }

  const handleApiKeys = (programId: string) => {
    console.log('🔑 API Keys clicked for program:', programId)
    // TODO: Navigate to API keys page or open modal
    alert(`API Keys para programa ${programId} - Em desenvolvimento`)
  }

  const handleWhiteLabel = (programId: string) => {
    console.log('🎨 White-label Settings clicked for program:', programId)
    // TODO: Navigate to white-label settings or open modal
    alert(`White-label Settings para programa ${programId} - Em desenvolvimento`)
  }

  const loadPrograms = async () => {
    try {
      // For now, simulate data since we don't have the API endpoint yet
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockPrograms: Program[] = [
        {
          id: '1',
          name: 'Alfa Gaming Loyalty',
          slug: 'alfa-gaming',
          type: 'GAMING',
          isActive: true,
          createdAt: new Date().toISOString(),
          _count: {
            users: 125,
            missions: 15,
            products: 28
          }
        },
        {
          id: '2',
          name: 'E-commerce Rewards',
          slug: 'ecommerce-demo',
          type: 'ECOMMERCE',
          isActive: false,
          createdAt: new Date().toISOString(),
          _count: {
            users: 0,
            missions: 5,
            products: 10
          }
        }
      ]
      
      setPrograms(mockPrograms)
    } catch (error) {
      console.error('Failed to load programs:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Programs</h2>
          <p className="text-gray-600">Manage loyalty programs</p>
        </div>
        
        <div className="animate-pulse space-y-4">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
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
          <h2 className="text-2xl font-bold text-gray-900">Programs</h2>
          <p className="text-gray-600">Manage loyalty programs</p>
        </div>
        <Button>Create Program</Button>
      </div>
      
      <div className="grid gap-6">
        {programs.map((program) => (
          <Card key={program.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {program.name}
                    {program.isActive ? (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                        Inactive
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {program.type} • /{program.slug}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    Settings
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {program._count?.users || 0}
                  </div>
                  <div className="text-sm text-gray-600">Users</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {program._count?.missions || 0}
                  </div>
                  <div className="text-sm text-gray-600">Missions</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {program._count?.products || 0}
                  </div>
                  <div className="text-sm text-gray-600">Rewards</div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Created: {new Date(program.createdAt).toLocaleDateString()}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleViewAnalytics(program.id)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      View Analytics
                    </button>
                    <span>•</span>
                    <button 
                      onClick={() => handleApiKeys(program.id)}
                      className="text-green-600 hover:text-green-800 transition-colors"
                    >
                      API Keys
                    </button>
                    <span>•</span>
                    <button 
                      onClick={() => handleWhiteLabel(program.id)}
                      className="text-purple-600 hover:text-purple-800 transition-colors"
                    >
                      White-label Settings
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {programs.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No programs yet</h3>
            <p className="text-gray-600 mb-4">Create your first loyalty program to get started.</p>
            <Button>Create Your First Program</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}