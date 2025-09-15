/**
 * @deprecated This component has been replaced by dedicated pages.
 * Use /admin/missions/new instead of this modal.
 * This file is kept for reference only.
 */
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
import { MissionBuilder } from '@/components/mission-builder'
import { BaseMissionRule } from '@/core/types'

interface CreateMissionModalProps {
  onSuccess?: () => void
}

export function CreateMissionModal({ onSuccess }: CreateMissionModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleMissionCreate = async (mission: {
    module: string
    rule: BaseMissionRule
    name: string
    description: string
    reward: number
    xp: number
    type?: string
    category?: string
    recurrence?: string
    maxClaims?: number
    startDate?: string
    endDate?: string
    productRewards?: Array<{ productId: string; quantity: number }>
  }) => {
    setLoading(true)
    try {
      console.log('🎯 Creating mission with modular system:', mission)
      
      // Get the first program ID (or create a way to select it)
      const programsResponse = await fetch('/api/programs')
      const programsData = await programsResponse.json()
      const defaultProgramId = programsData.programs?.[0]?.id || 'default-program-id'
      
      // Convert our modular mission to the format expected by the API
      const missionData = {
        programId: defaultProgramId, // Now including required programId
        title: mission.name,
        description: mission.description,
        category: mission.category || 'CUSTOM',
        type: mission.type || 'RECURRING',
        icon: '🎮', // Could come from module definition
        reward: mission.reward,
        xpReward: mission.xp,
        requirement: mission.rule, // Our modular rule
        maxClaims: mission.maxClaims,
        startDate: mission.startDate,
        endDate: mission.endDate,
        productRewards: mission.productRewards || [],
        metadata: {
          module: mission.module,
          created_with: 'modular_system',
          version: '1.0.0',
          recurrence: mission.recurrence
        }
      }

      // Call the missions API
      const response = await fetch('/api/missions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(missionData),
      })

      if (response.ok) {
        console.log('✅ Mission created successfully!')
        setOpen(false)
        onSuccess?.()
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="ml-4">Create Mission</Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>🎮 Criar Nova Missão - Sistema Modular</DialogTitle>
          <DialogDescription>
            Use o sistema modular para criar missões específicas por vertical (iGaming, E-commerce, etc.)
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <MissionBuilder
            onMissionCreate={handleMissionCreate}
            locale="pt-BR"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}