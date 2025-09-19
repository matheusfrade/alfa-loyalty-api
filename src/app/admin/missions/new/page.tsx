'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MissionBuilder } from '@/components/mission-builder'
import { BaseMissionRule } from '@/core/types'
import { ArrowLeft } from 'lucide-react'

export default function NewMissionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleMissionCreate = async (mission: {
    module?: string
    rule?: BaseMissionRule
    name?: string
    description?: string
    reward?: number
    coins?: number
    tierPoints?: number
    startDate?: string
    endDate?: string
    productRewards?: { productId: string; quantity: number }[]
  }) => {
    setLoading(true)
    try {
      console.log('🚀 Creating new mission:', mission)
      
      // Get the default program ID (for now, we'll use a hardcoded one)
      const programResponse = await fetch('/api/programs')
      const programData = await programResponse.json()
      const defaultProgram = programData.programs?.[0]
      
      if (!defaultProgram) {
        alert('Erro: Nenhum programa encontrado. Crie um programa primeiro.')
        setLoading(false)
        return
      }

      // Build mission data
      const missionData = {
        programId: defaultProgram.id,
        title: mission.name || 'Nova Missão',
        description: mission.description || '',
        category: mission.module || 'CUSTOM',
        type: 'RECURRING',
        reward: mission.reward ?? 0,
        coinsReward: mission.coins ?? 0,
        tierPointsReward: mission.tierPoints ?? 0,
        requirement: mission.rule || {},
        startDate: mission.startDate,
        endDate: mission.endDate,
        productRewards: mission.productRewards,
        metadata: {
          module: mission.module,
          created_with: 'modular_system',
          created_at: new Date().toISOString()
        }
      }

      const response = await fetch('/api/missions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(missionData),
      })

      if (response.ok) {
        const createdMission = await response.json()
        console.log('✅ Mission created successfully!', createdMission)
        router.push('/admin/missions')
      } else {
        const error = await response.json()
        console.error('❌ Error creating mission:', error)
        alert('Erro ao criar missão: ' + (error.message || 'Erro desconhecido'))
      }
    } catch (error) {
      console.error('❌ Error creating mission:', error)
      alert('Erro ao criar missão: ' + error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/admin/missions')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Nova Missão</h2>
          <p className="text-gray-600">Crie uma nova missão para engajar seus usuários</p>
        </div>
      </div>

      {/* Mission Builder Card */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Configurar Missão</CardTitle>
          <CardDescription>
            Use o construtor de missões para criar desafios personalizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MissionBuilder
            onMissionCreate={handleMissionCreate}
            locale="pt-BR"
          />
        </CardContent>
      </Card>

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Criando missão...</p>
          </div>
        </div>
      )}
    </div>
  )
}