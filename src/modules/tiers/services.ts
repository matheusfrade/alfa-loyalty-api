import { prisma } from '@/lib/prisma'
import {
  TierInput,
  TierRangeValidation,
  PeriodPolicyInput,
  PointsEntryInput,
  PlayerTierStatus,
  TierMetrics,
  TierSimulation,
  PointsSource,
  TIER_EVENT_TYPES
} from './types'
import { addMonths, startOfDay, endOfDay, addDays } from 'date-fns'

export class TierService {

  // ==================== TIER MANAGEMENT ====================

  /**
   * Criar novo tier com validação de ranges
   */
  async createTier(programId: string, tierData: TierInput): Promise<any> {
    // Validar ranges antes de criar
    const validation = await this.validateTierRanges(programId, [tierData])
    if (!validation.isValid) {
      throw new Error(`Tier ranges conflict: ${validation.conflicts.map(c => c.conflict).join(', ')}`)
    }

    const tier = await prisma.tier.create({
      data: {
        programId,
        name: tierData.name,
        level: tierData.level,
        requiredXP: tierData.minPoints || 0, // Para compatibilidade
        minPoints: tierData.minPoints,
        maxPoints: tierData.maxPoints,
        maintenancePoints: tierData.maintenancePoints,
        color: tierData.color,
        icon: tierData.icon,
        multiplier: tierData.multiplier || 1.0,
        benefits: JSON.stringify(tierData.benefits || []),
        isInviteOnly: tierData.isInviteOnly || false,
        isActive: tierData.isActive !== false
      }
    })

    return tier
  }

  /**
   * Atualizar tier existente
   */
  async updateTier(tierId: string, tierData: Partial<TierInput>): Promise<any> {
    const existingTier = await prisma.tier.findUnique({
      where: { id: tierId }
    })

    if (!existingTier) {
      throw new Error('Tier not found')
    }

    // Se mudando ranges, validar
    if (tierData.minPoints !== undefined || tierData.maxPoints !== undefined) {
      const allTiers = await prisma.tier.findMany({
        where: {
          programId: existingTier.programId,
          id: { not: tierId },
          isActive: true
        }
      })

      const updatedTier = {
        ...existingTier,
        ...tierData
      }

      const validation = await this.validateTierRanges(
        existingTier.programId,
        [updatedTier, ...allTiers]
      )

      if (!validation.isValid) {
        throw new Error(`Tier ranges conflict: ${validation.conflicts.map(c => c.conflict).join(', ')}`)
      }
    }

    const tier = await prisma.tier.update({
      where: { id: tierId },
      data: {
        ...(tierData.name && { name: tierData.name }),
        ...(tierData.level !== undefined && { level: tierData.level }),
        ...(tierData.minPoints !== undefined && { minPoints: tierData.minPoints }),
        ...(tierData.maxPoints !== undefined && { maxPoints: tierData.maxPoints }),
        ...(tierData.maintenancePoints !== undefined && { maintenancePoints: tierData.maintenancePoints }),
        ...(tierData.color && { color: tierData.color }),
        ...(tierData.icon !== undefined && { icon: tierData.icon }),
        ...(tierData.multiplier !== undefined && { multiplier: tierData.multiplier }),
        ...(tierData.benefits && { benefits: JSON.stringify(tierData.benefits) }),
        ...(tierData.isInviteOnly !== undefined && { isInviteOnly: tierData.isInviteOnly }),
        ...(tierData.isActive !== undefined && { isActive: tierData.isActive })
      }
    })

    return tier
  }

  /**
   * Validar ranges de tiers
   */
  async validateTierRanges(programId: string, tiers: any[]): Promise<TierRangeValidation> {
    const conflicts: Array<{ tier1: string; tier2: string; conflict: string }> = []
    const gaps: Array<{ fromTier: string; toTier: string; gap: number }> = []

    // Ordenar tiers por level
    const sortedTiers = tiers
      .filter(t => t.isActive !== false)
      .sort((a, b) => a.level - b.level)

    // Verificar sobreposições
    for (let i = 0; i < sortedTiers.length - 1; i++) {
      const current = sortedTiers[i]
      const next = sortedTiers[i + 1]

      if (current.minPoints && next.minPoints && current.maxPoints) {
        // Verificar sobreposição
        if (current.maxPoints >= next.minPoints) {
          conflicts.push({
            tier1: current.name,
            tier2: next.name,
            conflict: `${current.name} (max: ${current.maxPoints}) overlaps with ${next.name} (min: ${next.minPoints})`
          })
        }

        // Verificar gaps grandes (opcional)
        const gap = next.minPoints - current.maxPoints
        if (gap > 1000) { // Gap maior que 1000 pontos
          gaps.push({
            fromTier: current.name,
            toTier: next.name,
            gap
          })
        }
      }
    }

    return {
      isValid: conflicts.length === 0,
      conflicts,
      gaps
    }
  }

  // ==================== POINTS MANAGEMENT ====================

  /**
   * Lançar pontos para um jogador
   */
  async addPoints(pointsData: PointsEntryInput): Promise<any> {
    const { playerId, programId, source, amount, reference, description, meta } = pointsData

    // Buscar política de expiração
    const policy = await prisma.periodPolicy.findUnique({
      where: { programId }
    })

    if (!policy) {
      throw new Error('Period policy not found for program')
    }

    // Calcular data de expiração
    const expiresAt = addMonths(new Date(), policy.pointsExpireAfterM)

    // Calcular saldo atual
    const currentBalance = await this.getPlayerLivePoints(playerId, programId)
    const newBalance = currentBalance + amount

    // Criar registro no ledger
    const ledgerEntry = await prisma.playerPointsLedger.create({
      data: {
        playerId,
        programId,
        source,
        amount,
        balance: newBalance,
        reference,
        description,
        expiresAt,
        meta: JSON.stringify(meta || {})
      }
    })

    // Atualizar progresso do período atual
    await this.updateCurrentPeriodProgress(playerId, programId, amount)

    // Recalcular tier se necessário
    await this.recalculatePlayerTier(playerId, programId)

    // Emitir evento
    // TODO: Implement event emission

    return ledgerEntry
  }

  /**
   * Calcular pontos vivos de um jogador
   */
  async getPlayerLivePoints(playerId: string, programId: string): Promise<number> {
    const result = await prisma.playerPointsLedger.aggregate({
      where: {
        playerId,
        programId,
        isExpired: false,
        expiresAt: {
          gte: new Date()
        }
      },
      _sum: {
        amount: true
      }
    })

    return result._sum.amount || 0
  }

  /**
   * Obter status completo do tier do jogador
   */
  async getPlayerTierStatus(playerId: string, programId: string): Promise<PlayerTierStatus> {
    const pointsLive = await this.getPlayerLivePoints(playerId, programId)

    // Buscar tier atual
    const currentTier = await this.calculatePlayerTier(playerId, programId, pointsLive)

    // Buscar próximo tier
    const nextTier = await prisma.tier.findFirst({
      where: {
        programId,
        level: currentTier.level + 1,
        isActive: true
      },
      orderBy: { level: 'asc' }
    })

    // Buscar período atual
    const currentPeriod = await prisma.playerTierProgress.findFirst({
      where: {
        playerId,
        programId,
        isCurrent: true
      }
    })

    // Calcular pontos a expirar
    const expirationInfo = await this.getPlayerExpirationInfo(playerId, programId)

    return {
      playerId,
      programId,
      currentTier: {
        id: currentTier.id,
        name: currentTier.name,
        level: currentTier.level,
        color: currentTier.color,
        icon: currentTier.icon,
        multiplier: currentTier.multiplier,
        benefits: JSON.parse(currentTier.benefits)
      },
      pointsLive,
      pointsToNextTier: nextTier && nextTier.minPoints ? nextTier.minPoints - pointsLive : undefined,
      pointsToMaintain: currentTier.maintenancePoints ? currentTier.maintenancePoints : undefined,
      currentPeriod: {
        start: currentPeriod?.periodStart || new Date(),
        end: currentPeriod?.periodEnd || new Date(),
        pointsEarned: currentPeriod?.pointsEarned || 0,
        pointsCarry: currentPeriod?.pointsCarry || 0
      },
      expirationInfo
    }
  }

  /**
   * Calcular tier de um jogador baseado nos pontos
   */
  async calculatePlayerTier(playerId: string, programId: string, pointsLive?: number): Promise<any> {
    if (pointsLive === undefined) {
      pointsLive = await this.getPlayerLivePoints(playerId, programId)
    }

    // Buscar tier apropriado
    const tier = await prisma.tier.findFirst({
      where: {
        programId,
        isActive: true,
        OR: [
          // Tier com range definido
          {
            AND: [
              { minPoints: { lte: pointsLive } },
              { maxPoints: { gte: pointsLive } }
            ]
          },
          // Tier sem maxPoints (tier mais alto)
          {
            AND: [
              { minPoints: { lte: pointsLive } },
              { maxPoints: null }
            ]
          }
        ]
      },
      orderBy: { level: 'desc' }
    })

    if (!tier) {
      // Buscar tier mais baixo como fallback
      const fallbackTier = await prisma.tier.findFirst({
        where: { programId, isActive: true },
        orderBy: { level: 'asc' }
      })

      if (!fallbackTier) {
        throw new Error('No active tiers found for program')
      }

      return fallbackTier
    }

    return tier
  }

  /**
   * Recalcular tier de um jogador
   */
  async recalculatePlayerTier(playerId: string, programId: string): Promise<void> {
    const pointsLive = await this.getPlayerLivePoints(playerId, programId)
    const newTier = await this.calculatePlayerTier(playerId, programId, pointsLive)

    // Buscar tier atual no UserProgram
    const userProgram = await prisma.userProgram.findUnique({
      where: {
        userId_programId: { userId: playerId, programId }
      }
    })

    if (userProgram && userProgram.tierId !== newTier.id) {
      // Atualizar tier
      await prisma.userProgram.update({
        where: {
          userId_programId: { userId: playerId, programId }
        },
        data: {
          tierId: newTier.id
        }
      })

      // Emitir evento de mudança de tier
      // TODO: Implement event emission
    }
  }

  /**
   * Atualizar progresso do período atual
   */
  async updateCurrentPeriodProgress(playerId: string, programId: string, pointsEarned: number): Promise<void> {
    const currentPeriod = await prisma.playerTierProgress.findFirst({
      where: {
        playerId,
        programId,
        isCurrent: true
      }
    })

    if (currentPeriod) {
      await prisma.playerTierProgress.update({
        where: { id: currentPeriod.id },
        data: {
          pointsEarned: {
            increment: pointsEarned
          }
        }
      })
    } else {
      // Criar novo período atual
      const tier = await this.calculatePlayerTier(playerId, programId)
      const now = new Date()
      const periodEnd = addMonths(now, 6) // Semestre padrão

      await prisma.playerTierProgress.create({
        data: {
          playerId,
          programId,
          tierId: tier.id,
          periodStart: now,
          periodEnd,
          pointsEarned,
          pointsCarry: 0,
          isCurrent: true
        }
      })
    }
  }

  /**
   * Obter informações de expiração do jogador
   */
  async getPlayerExpirationInfo(playerId: string, programId: string) {
    const now = new Date()
    const in30Days = addDays(now, 30)
    const in60Days = addDays(now, 60)
    const in90Days = addDays(now, 90)

    const [points30, points60, points90] = await Promise.all([
      // Pontos expirando em 30 dias
      prisma.playerPointsLedger.aggregate({
        where: {
          playerId,
          programId,
          isExpired: false,
          expiresAt: {
            gte: now,
            lte: in30Days
          }
        },
        _sum: { amount: true }
      }),
      // Pontos expirando em 60 dias
      prisma.playerPointsLedger.aggregate({
        where: {
          playerId,
          programId,
          isExpired: false,
          expiresAt: {
            gte: now,
            lte: in60Days
          }
        },
        _sum: { amount: true }
      }),
      // Pontos expirando em 90 dias
      prisma.playerPointsLedger.aggregate({
        where: {
          playerId,
          programId,
          isExpired: false,
          expiresAt: {
            gte: now,
            lte: in90Days
          }
        },
        _sum: { amount: true }
      })
    ])

    return {
      pointsExpiring30Days: points30._sum.amount || 0,
      pointsExpiring60Days: points60._sum.amount || 0,
      pointsExpiring90Days: points90._sum.amount || 0
    }
  }

  // ==================== METRICS & ANALYTICS ====================

  /**
   * Obter métricas de tiers
   */
  async getTierMetrics(programId: string): Promise<TierMetrics> {
    // Contar jogadores por tier
    const tierDistribution = await prisma.$queryRaw<Array<{
      tierId: string
      tierName: string
      playerCount: bigint
    }>>`
      SELECT
        t.id as tierId,
        t.name as tierName,
        COUNT(up.id) as playerCount
      FROM Tier t
      LEFT JOIN UserProgram up ON t.id = up.tierId AND up.programId = ${programId}
      WHERE t.programId = ${programId} AND t.isActive = 1
      GROUP BY t.id, t.name
      ORDER BY t.level ASC
    `

    const totalPlayers = tierDistribution.reduce((sum, tier) => sum + Number(tier.playerCount), 0)

    // Pontos vivos totais
    const totalPointsResult = await prisma.playerPointsLedger.aggregate({
      where: {
        programId,
        isExpired: false,
        expiresAt: { gte: new Date() }
      },
      _sum: { amount: true }
    })

    const totalPointsLive = totalPointsResult._sum.amount || 0

    // Distribuição por tier
    const distributionByTier = tierDistribution.map(tier => ({
      tierId: tier.tierId,
      tierName: tier.tierName,
      playerCount: Number(tier.playerCount),
      percentage: totalPlayers > 0 ? (Number(tier.playerCount) / totalPlayers) * 100 : 0
    }))

    // Cronograma de expiração
    const now = new Date()
    const periods = [
      { label: '30 days', end: addDays(now, 30) },
      { label: '60 days', end: addDays(now, 60) },
      { label: '90 days', end: addDays(now, 90) }
    ]

    const expirationSchedule = await Promise.all(
      periods.map(async period => {
        const result = await prisma.playerPointsLedger.aggregate({
          where: {
            programId,
            isExpired: false,
            expiresAt: {
              gte: now,
              lte: period.end
            }
          },
          _sum: { amount: true },
          _count: { playerId: true }
        })

        return {
          period: period.label,
          pointsExpiring: result._sum.amount || 0,
          playersAffected: result._count.playerId || 0
        }
      })
    )

    // Alertas
    const topTier = distributionByTier[distributionByTier.length - 1]
    const vipInflationThreshold = 12
    const vipInflation = {
      isAlert: topTier ? topTier.percentage > vipInflationThreshold : false,
      percentage: topTier ? topTier.percentage : 0,
      threshold: vipInflationThreshold
    }

    return {
      totalPlayers,
      totalPointsLive,
      distributionByTier,
      expirationSchedule,
      alerts: {
        vipInflation,
        massExpiration: expirationSchedule.filter(e => e.pointsExpiring > 10000) // Alerta para mais de 10k pontos expirando
      }
    }
  }

  /**
   * Simular mudanças de ranges de tiers
   */
  async simulateTierRanges(programId: string, newTiers: TierInput[]): Promise<TierSimulation> {
    // Validar ranges
    const validation = await this.validateTierRanges(programId, newTiers)

    // Calcular impacto nos jogadores
    const currentTierAssignments = await prisma.userProgram.findMany({
      where: { programId },
      include: { tier: true }
    })

    const changes: Array<{ playerId: string; fromTier: string; toTier: string }> = []
    let playersMovingUp = 0
    let playersMovingDown = 0

    for (const userProgram of currentTierAssignments) {
      const pointsLive = await this.getPlayerLivePoints(userProgram.userId, programId)

      // Encontrar novo tier baseado nos ranges simulados
      const newTier = newTiers
        .filter(t => t.isActive !== false)
        .sort((a, b) => (b.level || 0) - (a.level || 0))
        .find(t => {
          if (t.minPoints === undefined) return true
          if (t.maxPoints === undefined) return pointsLive >= t.minPoints
          return pointsLive >= t.minPoints && pointsLive <= t.maxPoints
        })

      if (newTier && userProgram.tier && newTier.name !== userProgram.tier.name) {
        changes.push({
          playerId: userProgram.userId,
          fromTier: userProgram.tier.name,
          toTier: newTier.name
        })

        if ((newTier.level || 0) > userProgram.tier.level) {
          playersMovingUp++
        } else {
          playersMovingDown++
        }
      }
    }

    return {
      tiers: newTiers.map(tier => ({
        id: 'simulation',
        name: tier.name,
        minPoints: tier.minPoints || 0,
        maxPoints: tier.maxPoints,
        playerCount: 0, // TODO: Calculate
        percentage: 0 // TODO: Calculate
      })),
      validation,
      impact: {
        playersMovingUp,
        playersMovingDown,
        changes
      }
    }
  }
}

export const tierService = new TierService()