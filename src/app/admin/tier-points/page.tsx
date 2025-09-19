'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Coins, Clock, Award, TrendingUp, Calendar } from 'lucide-react'

interface PointsEntry {
  id: string
  amount: number
  balance: number
  source: string
  reference: string | null
  description: string
  createdAt: string
  expiresAt: string | null
  program: {
    id: string
    name: string
    slug: string
  }
}

interface PlayerProgram {
  id: string
  userId: string
  programId: string
  coins: number
  xp: number
  tier: {
    id: string
    name: string
    level: number
    benefits: string | null
  } | null
  program: {
    id: string
    name: string
    slug: string
  }
}

interface Summary {
  totalPoints: number
  livePoints: number
  expiredPoints: number
}

interface TierPointsData {
  pointsHistory: PointsEntry[]
  playerPrograms: PlayerProgram[]
  summary: Summary
  pagination: {
    limit: number
    offset: number
    total: number
  }
}

const sourceIcons: Record<string, string> = {
  'MISSION': '🎯',
  'BONUS': '🎁',
  'PURCHASE': '🛒',
  'REFERRAL': '👥',
  'PROMOTION': '📢',
  'MANUAL': '✋',
  'ADJUSTMENT': '⚖️'
}

const sourceLabels: Record<string, string> = {
  'MISSION': 'Missão',
  'BONUS': 'Bônus',
  'PURCHASE': 'Compra',
  'REFERRAL': 'Indicação',
  'PROMOTION': 'Promoção',
  'MANUAL': 'Manual',
  'ADJUSTMENT': 'Ajuste'
}

export default function TierPointsPage() {
  const [data, setData] = useState<TierPointsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedProgram, setSelectedProgram] = useState<string>('all')

  useEffect(() => {
    fetchTierPoints()
  }, [selectedProgram])

  const fetchTierPoints = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedProgram !== 'all') {
        params.append('programId', selectedProgram)
      }
      params.append('limit', '50')

      const response = await fetch(`/api/tier-points?${params.toString()}`)
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Failed to fetch tier points:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isExpiring = (expiresAt: string | null) => {
    if (!expiresAt) return false
    const expirationDate = new Date(expiresAt)
    const now = new Date()
    const diffInDays = (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return diffInDays <= 30 && diffInDays > 0
  }

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) <= new Date()
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-500">
          Erro ao carregar dados dos pontos de tier
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Extrato de Pontos de Tier
        </h1>
        <p className="text-gray-600">
          Acompanhe seu histórico de pontos e status nos programas de fidelidade
        </p>
      </div>

      {/* Program Filter */}
      <div className="mb-6">
        <select
          value={selectedProgram}
          onChange={(e) => setSelectedProgram(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos os Programas</option>
          {data.playerPrograms.map((program) => (
            <option key={program.id} value={program.programId}>
              {program.program.name}
            </option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pontos Totais</CardTitle>
            <Coins className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalPoints.toLocaleString()}</div>
            <p className="text-xs text-gray-600">Pontos acumulados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pontos Ativos</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.summary.livePoints.toLocaleString()}</div>
            <p className="text-xs text-gray-600">Não expiraram</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pontos Expirados</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data.summary.expiredPoints.toLocaleString()}</div>
            <p className="text-xs text-gray-600">Perdidos por expiração</p>
          </CardContent>
        </Card>
      </div>

      {/* Player Programs Status */}
      {data.playerPrograms.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Status nos Programas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.playerPrograms.map((playerProgram) => (
                <div key={playerProgram.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{playerProgram.program.name}</h3>
                    {playerProgram.tier && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${{
                        1: 'bg-gray-100 text-gray-700',
                        2: 'bg-green-100 text-green-700',
                        3: 'bg-blue-100 text-blue-700',
                        4: 'bg-purple-100 text-purple-700',
                        5: 'bg-yellow-100 text-yellow-700'
                      }[playerProgram.tier.level] || 'bg-gray-100 text-gray-700'}`}>
                        {playerProgram.tier.name}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Moedas:</span>
                      <span className="font-medium">{playerProgram.coins.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>XP:</span>
                      <span className="font-medium">{playerProgram.xp.toLocaleString()}</span>
                    </div>
                    {playerProgram.tier && (
                      <div className="flex justify-between">
                        <span>Nível:</span>
                        <span className="font-medium">{playerProgram.tier.level}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Points History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Histórico de Pontos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.pointsHistory.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Nenhum movimento de pontos encontrado
            </div>
          ) : (
            <div className="space-y-4">
              {data.pointsHistory.map((entry) => (
                <div key={entry.id} className={`flex items-center justify-between p-4 rounded-lg border ${
                  isExpired(entry.expiresAt) ? 'bg-red-50 border-red-200' :
                  isExpiring(entry.expiresAt) ? 'bg-yellow-50 border-yellow-200' :
                  'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">
                      {sourceIcons[entry.source] || '📋'}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {entry.description}
                      </div>
                      <div className="text-sm text-gray-600">
                        {sourceLabels[entry.source] || entry.source} • {entry.program.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(entry.createdAt)}
                        {entry.expiresAt && (
                          <span className={`ml-2 ${
                            isExpired(entry.expiresAt) ? 'text-red-600' :
                            isExpiring(entry.expiresAt) ? 'text-yellow-600' :
                            'text-gray-500'
                          }`}>
                            • Expira em {formatDate(entry.expiresAt)}
                            {isExpired(entry.expiresAt) && ' (EXPIRADO)'}
                            {isExpiring(entry.expiresAt) && ' (EXPIRA EM BREVE)'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      entry.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {entry.amount > 0 ? '+' : ''}{entry.amount}
                    </div>
                    <div className="text-sm text-gray-500">
                      Saldo: {entry.balance}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}