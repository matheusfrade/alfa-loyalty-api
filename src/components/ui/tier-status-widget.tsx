'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Award, TrendingUp, Clock, Coins } from 'lucide-react'

interface TierInfo {
  id: string
  name: string
  level: number
  benefits: string | null
}

interface PlayerProgram {
  id: string
  coins: number
  xp: number
  tier: TierInfo | null
  program: {
    id: string
    name: string
    slug: string
  }
}

interface TierStatusWidgetProps {
  playerId?: string
  programId?: string
  showDetails?: boolean
  className?: string
}

interface TierPointsData {
  pointsHistory: any[]
  playerPrograms: PlayerProgram[]
  summary: {
    totalPoints: number
    livePoints: number
    expiredPoints: number
  }
}

export function TierStatusWidget({
  playerId,
  programId,
  showDetails = true,
  className = ''
}: TierStatusWidgetProps) {
  const [data, setData] = useState<TierPointsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTierStatus()
  }, [playerId, programId])

  const fetchTierStatus = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (programId) {
        params.append('programId', programId)
      }
      params.append('limit', '1') // Just need summary

      const response = await fetch(`/api/tier-points?${params.toString()}`)
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Failed to fetch tier status:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || !data.playerPrograms.length) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum programa encontrado</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const playerProgram = data.playerPrograms[0] // Get first program or specific one
  const tier = playerProgram.tier

  const getTierColor = (level: number) => {
    const colors = {
      1: 'text-gray-600 bg-gray-100',
      2: 'text-green-600 bg-green-100',
      3: 'text-blue-600 bg-blue-100',
      4: 'text-purple-600 bg-purple-100',
      5: 'text-yellow-600 bg-yellow-100'
    }
    return colors[level as keyof typeof colors] || 'text-gray-600 bg-gray-100'
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Award className="h-5 w-5" />
          Status do Tier
        </CardTitle>
        {showDetails && (
          <p className="text-sm text-gray-600">{playerProgram.program.name}</p>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        {tier ? (
          <div className="space-y-4">
            {/* Current Tier */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Tier Atual</div>
                <div className="font-semibold text-gray-900">{tier.name}</div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getTierColor(tier.level)}`}>
                Nível {tier.level}
              </div>
            </div>

            {/* Points Summary */}
            <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-100">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-lg font-bold text-green-600">
                  {data.summary.livePoints.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">Pontos Ativos</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                  <Coins className="h-4 w-4" />
                </div>
                <div className="text-lg font-bold text-blue-600">
                  {playerProgram.coins.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">Moedas</div>
              </div>
            </div>

            {showDetails && (
              <>
                {/* Additional Stats */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">XP Total:</span>
                    <span className="font-medium">{playerProgram.xp.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Pontos Totais:</span>
                    <span className="font-medium">{data.summary.totalPoints.toLocaleString()}</span>
                  </div>
                  {data.summary.expiredPoints > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Pontos Expirados:</span>
                      <span className="font-medium text-red-600">{data.summary.expiredPoints.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Benefits */}
                {tier.benefits && (
                  <div className="pt-2 border-t border-gray-100">
                    <div className="text-sm text-gray-600 mb-1">Benefícios:</div>
                    <div className="text-xs text-gray-500">{tier.benefits}</div>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-gray-500 mb-2">
              <Award className="h-8 w-8 mx-auto opacity-50" />
            </div>
            <p className="text-sm text-gray-600">Nenhum tier atribuído</p>
            <p className="text-xs text-gray-500">
              Pontos Ativos: {data.summary.livePoints.toLocaleString()}
            </p>
          </div>
        )}

        {/* Expiring Points Alert */}
        {data.summary.livePoints > data.summary.totalPoints - data.summary.expiredPoints && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Pontos expirando em breve</span>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              Verifique seu extrato para detalhes sobre pontos próximos ao vencimento.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}