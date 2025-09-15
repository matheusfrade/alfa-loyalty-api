// TypeScript enums for type safety (since SQLite doesn't support native enums)

export const ProgramType = {
  GAMING: 'GAMING',
  ECOMMERCE: 'ECOMMERCE',
  RETAIL: 'RETAIL',
  SAAS: 'SAAS',
  EDUCATION: 'EDUCATION',
  CUSTOM: 'CUSTOM',
} as const

export type ProgramType = typeof ProgramType[keyof typeof ProgramType]

export const MissionCategory = {
  LOGIN: 'LOGIN',
  BETTING: 'BETTING',
  DEPOSIT: 'DEPOSIT',
  TUTORIAL: 'TUTORIAL',
  SPECIAL: 'SPECIAL',
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  ACHIEVEMENT: 'ACHIEVEMENT',
} as const

export type MissionCategory = typeof MissionCategory[keyof typeof MissionCategory]

export const MissionType = {
  SINGLE: 'SINGLE',       // Complete once
  RECURRING: 'RECURRING', // Can repeat
  STREAK: 'STREAK',       // Consecutive days
  MILESTONE: 'MILESTONE', // Progressive goals
} as const

export type MissionType = typeof MissionType[keyof typeof MissionType]

export const MissionStatus = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CLAIMED: 'CLAIMED',
  EXPIRED: 'EXPIRED',
} as const

export type MissionStatus = typeof MissionStatus[keyof typeof MissionStatus]

export const ProductCategory = {
  BONUS: 'BONUS',
  CASHBACK: 'CASHBACK',
  FREESPINS: 'FREESPINS',
  PHYSICAL: 'PHYSICAL',
  EXPERIENCE: 'EXPERIENCE',
  CREDITS: 'CREDITS',
  PREMIUM: 'PREMIUM',
  DISCOUNT: 'DISCOUNT',
  VOUCHER: 'VOUCHER',
} as const

export type ProductCategory = typeof ProductCategory[keyof typeof ProductCategory]

export const DeliveryType = {
  AUTOMATIC: 'AUTOMATIC', // Applied instantly
  CODE: 'CODE',           // Generate unique code
  PHYSICAL: 'PHYSICAL',   // Requires shipping
  MANUAL: 'MANUAL',       // Manual processing
} as const

export type DeliveryType = typeof DeliveryType[keyof typeof DeliveryType]

export const RedemptionStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
  FAILED: 'FAILED',
} as const

export type RedemptionStatus = typeof RedemptionStatus[keyof typeof RedemptionStatus]

export const TransactionType = {
  EARNED: 'EARNED',         // From missions
  SPENT: 'SPENT',           // On rewards
  BONUS: 'BONUS',           // Admin bonus
  ADJUSTMENT: 'ADJUSTMENT', // Manual adjustment
  EXPIRED: 'EXPIRED',       // Expired coins
  REFUND: 'REFUND',         // Refunded purchase
} as const

export type TransactionType = typeof TransactionType[keyof typeof TransactionType]

export const NotificationType = {
  MISSION_COMPLETE: 'MISSION_COMPLETE',
  REWARD_AVAILABLE: 'REWARD_AVAILABLE',
  TIER_UPGRADE: 'TIER_UPGRADE',
  COINS_EARNED: 'COINS_EARNED',
  PRODUCT_REDEEMED: 'PRODUCT_REDEEMED',
  GENERAL: 'GENERAL',
} as const

export type NotificationType = typeof NotificationType[keyof typeof NotificationType]

// Tier helpers
export const TierLevel = {
  INICIANTE: 0,
  BRONZE: 1,
  PRATA: 2,
  OURO: 3,
  DIAMANTE: 4,
  VIP: 5,
} as const

export type TierLevel = typeof TierLevel[keyof typeof TierLevel]

// Helper functions for category colors and icons
export function getCategoryColor(category: MissionCategory): string {
  const colors: Record<MissionCategory, string> = {
    LOGIN: 'bg-blue-500',
    BETTING: 'bg-green-500',
    DEPOSIT: 'bg-yellow-500',
    TUTORIAL: 'bg-purple-500',
    SPECIAL: 'bg-red-500',
    DAILY: 'bg-cyan-500',
    WEEKLY: 'bg-indigo-500',
    MONTHLY: 'bg-pink-500',
    ACHIEVEMENT: 'bg-orange-500',
  }
  return colors[category] || 'bg-gray-500'
}

export function getCategoryIcon(category: MissionCategory): string {
  const icons: Record<MissionCategory, string> = {
    LOGIN: '🎯',
    BETTING: '⚽',
    DEPOSIT: '💰',
    TUTORIAL: '📚',
    SPECIAL: '⭐',
    DAILY: '📅',
    WEEKLY: '📊',
    MONTHLY: '🗓️',
    ACHIEVEMENT: '🏆',
  }
  return icons[category] || '📋'
}