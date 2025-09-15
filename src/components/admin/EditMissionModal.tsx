/**
 * @deprecated This component has been replaced by dedicated pages.
 * Use /admin/missions/[id]/edit instead of this modal.
 * This file is kept for reference only.
 */
'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { MissionBuilder } from '@/components/mission-builder'
import { BaseMissionRule } from '@/core/types'

interface Mission {
  id: string
  title: string
  description: string
  category: string
  type: string
  reward: number
  xpReward: number
  requirement?: any
  metadata?: any
}

interface EditMissionModalProps {
  mission: Mission | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditMissionModal({ mission, open, onOpenChange, onSuccess }: EditMissionModalProps) {
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'simple' | 'modular'>('simple')

  useEffect(() => {
    // Check if mission was created with modular system
    if (mission?.metadata?.created_with === 'modular_system') {
      setMode('modular')
    } else {
      setMode('simple')
    }
  }, [mission])

  const handleMissionUpdate = async (updatedMission: {
    module?: string
    rule?: BaseMissionRule
    name?: string
    description?: string
    reward?: number
    xp?: number
  }) => {
    if (!mission) return

    setLoading(true)
    try {
      console.log('🔄 Updating mission:', mission.id, updatedMission)
      
      const missionData = {
        title: updatedMission.name || mission.title,
        description: updatedMission.description || mission.description,
        reward: updatedMission.reward ?? mission.reward,
        xpReward: updatedMission.xp ?? mission.xpReward,
        requirement: updatedMission.rule || mission.requirement,
        metadata: {
          ...mission.metadata,
          module: updatedMission.module || mission.metadata?.module,
          updated_with: 'modular_system',
          updated_at: new Date().toISOString()
        }
      }

      const response = await fetch(`/api/missions/${mission.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(missionData),
      })

      if (response.ok) {
        console.log('✅ Mission updated successfully!')
        onOpenChange(false)
        onSuccess?.()
      } else {
        const error = await response.json()
        console.error('❌ Error updating mission:', error)
        alert('Erro ao atualizar missão: ' + (error.message || 'Erro desconhecido'))
      }
    } catch (error) {
      console.error('❌ Error updating mission:', error)
      alert('Erro ao atualizar missão: ' + error)
    } finally {
      setLoading(false)
    }
  }

  const handleSimpleUpdate = async () => {
    // Get form values from simple form (if you want to keep simple mode)
    const formData = {
      title: (document.getElementById('edit-mission-title') as HTMLInputElement)?.value,
      description: (document.getElementById('edit-mission-description') as HTMLTextAreaElement)?.value,
      reward: Number((document.getElementById('edit-mission-reward') as HTMLInputElement)?.value),
      xpReward: Number((document.getElementById('edit-mission-xp') as HTMLInputElement)?.value),
    }

    if (!mission) return

    setLoading(true)
    try {
      const response = await fetch(`/api/missions/${mission.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onOpenChange(false)
        onSuccess?.()
      } else {
        const error = await response.json()
        alert('Erro ao atualizar missão: ' + (error.message || 'Erro desconhecido'))
      }
    } catch (error) {
      alert('Erro ao atualizar missão: ' + error)
    } finally {
      setLoading(false)
    }
  }

  if (!mission) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>✏️ Editar Missão</DialogTitle>
          <DialogDescription>
            {mode === 'modular' 
              ? 'Edite a missão usando o sistema modular'
              : 'Edite os detalhes da missão'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {mode === 'modular' ? (
            <MissionBuilder
              onMissionCreate={handleMissionUpdate}
              locale="pt-BR"
              // Pass initial values if needed
            />
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="edit-mission-title" className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <input
                  id="edit-mission-title"
                  type="text"
                  defaultValue={mission.title}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="edit-mission-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  id="edit-mission-description"
                  rows={3}
                  defaultValue={mission.description}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-mission-reward" className="block text-sm font-medium text-gray-700 mb-1">
                    Recompensa (coins)
                  </label>
                  <input
                    id="edit-mission-reward"
                    type="number"
                    defaultValue={mission.reward}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="edit-mission-xp" className="block text-sm font-medium text-gray-700 mb-1">
                    XP
                  </label>
                  <input
                    id="edit-mission-xp"
                    type="number"
                    defaultValue={mission.xpReward}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  💡 Para editar regras avançadas e usar o sistema modular, 
                  recrie a missão com o botão "Create Mission"
                </p>
              </div>
            </div>
          )}
        </div>

        {mode === 'simple' && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSimpleUpdate} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}