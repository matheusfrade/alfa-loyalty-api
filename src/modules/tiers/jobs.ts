import { prisma } from '@/lib/prisma'
import { TierJobType, TierJobStatus, JobResult } from './types'
import { tierService } from './services'
import { addMonths, startOfDay, endOfDay } from 'date-fns'

export class TierJobService {

  /**
   * Executar job de expiração de pontos
   */
  async executeExpirePointsJob(programId?: string): Promise<JobResult> {
    const jobId = await this.createJob('EXPIRE_POINTS', programId)

    try {
      await this.updateJobStatus(jobId, 'RUNNING')

      const now = new Date()
      let processed = 0
      let errors = 0

      // Buscar pontos vencidos
      const expiredPoints = await prisma.playerPointsLedger.findMany({
        where: {
          ...(programId && { programId }),
          isExpired: false,
          expiresAt: {
            lt: now
          }
        }
      })

      console.log(`Found ${expiredPoints.length} expired point entries`)

      // Processar em lotes
      const batchSize = 100
      for (let i = 0; i < expiredPoints.length; i += batchSize) {
        const batch = expiredPoints.slice(i, i + batchSize)

        try {
          // Marcar como expirados
          await prisma.playerPointsLedger.updateMany({
            where: {
              id: {
                in: batch.map(p => p.id)
              }
            },
            data: {
              isExpired: true
            }
          })

          // Recalcular tiers dos jogadores afetados
          const affectedPlayers = [...new Set(batch.map(p => `${p.playerId}:${p.programId}`))]

          for (const playerProgram of affectedPlayers) {
            const [playerId, programId] = playerProgram.split(':')
            try {
              await tierService.recalculatePlayerTier(playerId, programId)
            } catch (error) {
              console.error(`Error recalculating tier for player ${playerId}:`, error)
              errors++
            }
          }

          processed += batch.length

          // Log progresso
          if (i % (batchSize * 10) === 0) {
            console.log(`Processed ${processed}/${expiredPoints.length} expired points`)
          }

        } catch (error) {
          console.error(`Error processing batch ${i}:`, error)
          errors += batch.length
        }
      }

      const result = {
        processed,
        errors,
        details: {
          totalExpired: expiredPoints.length,
          batchSize,
          executedAt: now.toISOString()
        }
      }

      await this.completeJob(jobId, result)

      return {
        jobId,
        type: 'EXPIRE_POINTS',
        status: 'COMPLETED',
        result
      }

    } catch (error) {
      await this.failJob(jobId, error instanceof Error ? error.message : String(error))
      throw error
    }
  }

  /**
   * Executar job de fechamento de período
   */
  async executeClosePeriodJob(programId: string): Promise<JobResult> {
    const jobId = await this.createJob('CLOSE_PERIOD', programId)

    try {
      await this.updateJobStatus(jobId, 'RUNNING')

      // Buscar política do programa
      const policy = await prisma.periodPolicy.findUnique({
        where: { programId }
      })

      if (!policy) {
        throw new Error(`Period policy not found for program ${programId}`)
      }

      let processed = 0
      let errors = 0
      const details: any = {}

      // Buscar todos os períodos atuais
      const currentPeriods = await prisma.playerTierProgress.findMany({
        where: {
          programId,
          isCurrent: true
        },
        include: {
          player: true,
          tier: true
        }
      })

      console.log(`Processing ${currentPeriods.length} current periods`)

      for (const period of currentPeriods) {
        try {
          const playerId = period.playerId
          const currentTier = period.tier

          // Verificar se precisa fazer downgrade por manutenção
          const needsDowngrade = currentTier.maintenancePoints &&
            period.pointsEarned < currentTier.maintenancePoints

          let newTierId = currentTier.id
          let downgradedFrom: string | null = null

          if (needsDowngrade && !currentTier.isInviteOnly) {
            // Encontrar tier inferior
            const lowerTier = await prisma.tier.findFirst({
              where: {
                programId,
                level: currentTier.level - 1,
                isActive: true
              }
            })

            if (lowerTier) {
              newTierId = lowerTier.id
              downgradedFrom = currentTier.name

              // Atualizar UserProgram
              await prisma.userProgram.update({
                where: {
                  userId_programId: { userId: playerId, programId }
                },
                data: { tierId: newTierId }
              })
            }
          }

          // Calcular pontos vivos atuais
          const currentLivePoints = await tierService.getPlayerLivePoints(playerId, programId)

          // Aplicar soft reset
          const carryOverPoints = Math.floor(currentLivePoints * policy.softResetFactor)

          // Marcar período atual como não-atual
          await prisma.playerTierProgress.update({
            where: { id: period.id },
            data: { isCurrent: false }
          })

          // Criar novo período
          const newPeriodStart = new Date()
          const newPeriodEnd = addMonths(newPeriodStart, 6) // Assumindo semestre

          await prisma.playerTierProgress.create({
            data: {
              playerId,
              programId,
              tierId: newTierId,
              periodStart: newPeriodStart,
              periodEnd: newPeriodEnd,
              pointsEarned: 0,
              pointsCarry: carryOverPoints,
              isCurrent: true
            }
          })

          processed++

          if (downgradedFrom) {
            if (!details.downgrades) details.downgrades = []
            details.downgrades.push({
              playerId,
              from: downgradedFrom,
              to: period.tier.name,
              reason: 'maintenance'
            })
          }

        } catch (error) {
          console.error(`Error processing period for player ${period.playerId}:`, error)
          errors++
        }
      }

      const result = {
        processed,
        errors,
        details: {
          ...details,
          totalPeriods: currentPeriods.length,
          executedAt: new Date().toISOString(),
          softResetFactor: policy.softResetFactor
        }
      }

      await this.completeJob(jobId, result)

      return {
        jobId,
        type: 'CLOSE_PERIOD',
        status: 'COMPLETED',
        result
      }

    } catch (error) {
      await this.failJob(jobId, error instanceof Error ? error.message : String(error))
      throw error
    }
  }

  /**
   * Executar job de cálculo de métricas
   */
  async executeCalculateMetricsJob(programId?: string): Promise<JobResult> {
    const jobId = await this.createJob('CALCULATE_METRICS', programId)

    try {
      await this.updateJobStatus(jobId, 'RUNNING')

      const programs = programId
        ? [{ id: programId }]
        : await prisma.program.findMany({ where: { isActive: true } })

      let processed = 0
      const metricsResults: any = {}

      for (const program of programs) {
        try {
          const metrics = await tierService.getTierMetrics(program.id)

          // Salvar métricas no Analytics
          const timestamp = new Date()

          const analyticsEntries = [
            {
              programId: program.id,
              date: timestamp,
              metric: 'tier_total_players',
              value: metrics.totalPlayers,
              dimensions: JSON.stringify({ category: 'tiers' })
            },
            {
              programId: program.id,
              date: timestamp,
              metric: 'tier_total_points_live',
              value: metrics.totalPointsLive,
              dimensions: JSON.stringify({ category: 'tiers' })
            },
            {
              programId: program.id,
              date: timestamp,
              metric: 'tier_vip_inflation',
              value: metrics.alerts.vipInflation.percentage,
              dimensions: JSON.stringify({ category: 'tiers', alert: metrics.alerts.vipInflation.isAlert })
            }
          ]

          // Adicionar métricas por tier
          for (const tierData of metrics.distributionByTier) {
            analyticsEntries.push({
              programId: program.id,
              date: timestamp,
              metric: 'tier_distribution',
              value: tierData.percentage,
              dimensions: JSON.stringify({
                category: 'tiers',
                tierId: tierData.tierId,
                tierName: tierData.tierName,
                playerCount: tierData.playerCount
              })
            })
          }

          // Salvar no banco
          await prisma.analytics.createMany({
            data: analyticsEntries
          })

          metricsResults[program.id] = {
            totalPlayers: metrics.totalPlayers,
            totalPointsLive: metrics.totalPointsLive,
            vipInflation: metrics.alerts.vipInflation.percentage
          }

          processed++

        } catch (error) {
          console.error(`Error calculating metrics for program ${program.id}:`, error)
        }
      }

      const result = {
        processed,
        errors: programs.length - processed,
        details: {
          programs: metricsResults,
          executedAt: new Date().toISOString()
        }
      }

      await this.completeJob(jobId, result)

      return {
        jobId,
        type: 'CALCULATE_METRICS',
        status: 'COMPLETED',
        result
      }

    } catch (error) {
      await this.failJob(jobId, error instanceof Error ? error.message : String(error))
      throw error
    }
  }

  /**
   * Recalcular tiers de todos os jogadores
   */
  async executeRecalculateTiersJob(programId: string): Promise<JobResult> {
    const jobId = await this.createJob('TIER_RECALCULATION', programId)

    try {
      await this.updateJobStatus(jobId, 'RUNNING')

      // Buscar todos os jogadores do programa
      const userPrograms = await prisma.userProgram.findMany({
        where: { programId }
      })

      let processed = 0
      let errors = 0
      const changes: any[] = []

      for (const userProgram of userPrograms) {
        try {
          const oldTierId = userProgram.tierId
          await tierService.recalculatePlayerTier(userProgram.userId, programId)

          // Verificar se houve mudança
          const updatedUserProgram = await prisma.userProgram.findUnique({
            where: {
              userId_programId: { userId: userProgram.userId, programId }
            },
            include: { tier: true }
          })

          if (updatedUserProgram && updatedUserProgram.tierId !== oldTierId) {
            changes.push({
              playerId: userProgram.userId,
              oldTierId,
              newTierId: updatedUserProgram.tierId,
              newTierName: updatedUserProgram.tier?.name
            })
          }

          processed++

        } catch (error) {
          console.error(`Error recalculating tier for player ${userProgram.userId}:`, error)
          errors++
        }
      }

      const result = {
        processed,
        errors,
        details: {
          totalPlayers: userPrograms.length,
          changes,
          executedAt: new Date().toISOString()
        }
      }

      await this.completeJob(jobId, result)

      return {
        jobId,
        type: 'TIER_RECALCULATION',
        status: 'COMPLETED',
        result
      }

    } catch (error) {
      await this.failJob(jobId, error instanceof Error ? error.message : String(error))
      throw error
    }
  }

  // ==================== JOB MANAGEMENT ====================

  /**
   * Criar novo job
   */
  private async createJob(type: TierJobType, programId?: string): Promise<string> {
    const job = await prisma.tierJob.create({
      data: {
        type,
        programId,
        status: 'PENDING'
      }
    })

    return job.id
  }

  /**
   * Atualizar status do job
   */
  private async updateJobStatus(jobId: string, status: TierJobStatus): Promise<void> {
    await prisma.tierJob.update({
      where: { id: jobId },
      data: {
        status,
        ...(status === 'RUNNING' && { startedAt: new Date() })
      }
    })
  }

  /**
   * Completar job com sucesso
   */
  private async completeJob(jobId: string, result: any): Promise<void> {
    await prisma.tierJob.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        result: JSON.stringify(result)
      }
    })
  }

  /**
   * Marcar job como falhou
   */
  private async failJob(jobId: string, error: string): Promise<void> {
    await prisma.tierJob.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        error
      }
    })
  }

  /**
   * Buscar status de jobs
   */
  async getJobStatus(limit: number = 50): Promise<any[]> {
    return await prisma.tierJob.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        program: {
          select: { name: true, slug: true }
        }
      }
    })
  }

  /**
   * Cancelar job em execução
   */
  async cancelJob(jobId: string): Promise<void> {
    await prisma.tierJob.update({
      where: { id: jobId },
      data: {
        status: 'CANCELLED',
        completedAt: new Date()
      }
    })
  }
}

export const tierJobService = new TierJobService()