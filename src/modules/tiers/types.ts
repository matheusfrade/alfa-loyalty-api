// Tipos para o módulo de Tiers/Níveis

export type PeriodType = 'SEMESTRE' | 'TRIMESTRE' | 'ANO'

export type PointsSource =
  | 'MISSION'
  | 'BONUS'
  | 'ADJUSTMENT'
  | 'PURCHASE'
  | 'REFERRAL'
  | 'MANUAL'
  | 'PROMOTION'

export type TierJobType =
  | 'EXPIRE_POINTS'
  | 'CLOSE_PERIOD'
  | 'CALCULATE_METRICS'
  | 'TIER_RECALCULATION'

export type TierJobStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'

// Interface para criação/atualização de tier
export interface TierInput {
  name: string
  level: number
  minPoints?: number
  maxPoints?: number
  maintenancePoints?: number
  color: string
  icon?: string
  multiplier?: number
  benefits?: string[]
  isInviteOnly?: boolean
  isActive?: boolean
}

// Interface para validação de ranges de tiers
export interface TierRangeValidation {
  isValid: boolean
  conflicts: Array<{
    tier1: string
    tier2: string
    conflict: string
  }>
  gaps: Array<{
    fromTier: string
    toTier: string
    gap: number
  }>
}

// Interface para política de período
export interface PeriodPolicyInput {
  periodType: PeriodType
  pointsExpireAfterM: number
  softResetFactor: number
  reviewCron: string
  isActive?: boolean
}

// Interface para lançamento de pontos
export interface PointsEntryInput {
  playerId: string
  programId: string
  source: PointsSource
  amount: number
  reference?: string
  description: string
  meta?: Record<string, any>
}

// Interface para status do tier do jogador
export interface PlayerTierStatus {
  playerId: string
  programId: string
  currentTier: {
    id: string
    name: string
    level: number
    color: string
    icon?: string
    multiplier: number
    benefits: string[]
  }
  pointsLive: number
  pointsToNextTier?: number
  pointsToMaintain?: number
  currentPeriod: {
    start: Date
    end: Date
    pointsEarned: number
    pointsCarry: number
  }
  expirationInfo: {
    pointsExpiring30Days: number
    pointsExpiring60Days: number
    pointsExpiring90Days: number
  }
}

// Interface para métricas de tiers
export interface TierMetrics {
  totalPlayers: number
  totalPointsLive: number
  distributionByTier: Array<{
    tierId: string
    tierName: string
    playerCount: number
    percentage: number
  }>
  expirationSchedule: Array<{
    period: string
    pointsExpiring: number
    playersAffected: number
  }>
  alerts: {
    vipInflation: {
      isAlert: boolean
      percentage: number
      threshold: number
    }
    massExpiration: Array<{
      date: string
      pointsExpiring: number
      playersAffected: number
    }>
  }
}

// Interface para resultado de job
export interface JobResult {
  jobId: string
  type: TierJobType
  status: TierJobStatus
  startedAt?: Date
  completedAt?: Date
  result: {
    processed: number
    errors: number
    details: Record<string, any>
  }
  error?: string
}

// Interface para simulação de ranges
export interface TierSimulation {
  tiers: Array<{
    id: string
    name: string
    minPoints: number
    maxPoints?: number
    playerCount: number
    percentage: number
  }>
  validation: TierRangeValidation
  impact: {
    playersMovingUp: number
    playersMovingDown: number
    changes: Array<{
      playerId: string
      fromTier: string
      toTier: string
    }>
  }
}

// Event types específicos para tiers
export const TIER_EVENT_TYPES = {
  POINTS_EARNED: 'tier.points.earned',
  POINTS_EXPIRED: 'tier.points.expired',
  TIER_UPGRADED: 'tier.tier.upgraded',
  TIER_DOWNGRADED: 'tier.tier.downgraded',
  PERIOD_CLOSED: 'tier.period.closed',
  MAINTENANCE_APPLIED: 'tier.maintenance.applied'
} as const

export type TierEventType = typeof TIER_EVENT_TYPES[keyof typeof TIER_EVENT_TYPES]