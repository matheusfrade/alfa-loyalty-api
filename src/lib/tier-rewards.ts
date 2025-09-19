import { prisma } from '@/lib/prisma'

interface TierChangeResult {
  success: boolean
  message: string
  rewardsDelivered: Array<{
    tierRewardId: string
    productName: string
    rewardType: string
  }>
}

export async function deliverTierRewards(
  userId: string,
  programId: string,
  newTierId: string,
  oldTierId?: string
): Promise<TierChangeResult> {
  try {
    const rewardsDelivered: Array<{
      tierRewardId: string
      productName: string
      rewardType: string
    }> = []

    // Get all tier rewards for the new tier that should be auto-delivered
    const tierRewards = await prisma.tierReward.findMany({
      where: {
        tierId: newTierId,
        autoDeliver: true,
        isActive: true,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            deliveryType: true,
          },
        },
        tier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    for (const tierReward of tierRewards) {
      // Check if user should receive this reward based on type
      let shouldReceive = false

      switch (tierReward.rewardType) {
        case 'WELCOME':
          // Only deliver welcome rewards if this is a tier upgrade (not initial assignment)
          shouldReceive = oldTierId !== undefined && oldTierId !== newTierId
          break
        case 'RECURRING':
          // Recurring rewards should be delivered every time user enters tier
          shouldReceive = true
          break
        case 'MILESTONE':
          // Check if user has already received this milestone reward
          const existingMilestone = await prisma.tierRewardUsage.findFirst({
            where: {
              userId,
              tierRewardId: tierReward.id,
            },
          })
          shouldReceive = !existingMilestone
          break
        case 'EXCLUSIVE':
          // Exclusive rewards are delivered once per tier membership
          shouldReceive = true
          break
      }

      if (!shouldReceive) continue

      // Check quota limits
      const quotaExceeded = await checkQuotaLimits(userId, tierReward.id, tierReward.quotaType, tierReward.quotaLimit)
      if (quotaExceeded) continue

      // Create redemption record
      const redemption = await prisma.redemption.create({
        data: {
          userId,
          productId: tierReward.productId,
          status: 'COMPLETED',
          deliveryInfo: JSON.stringify({
            tierRewardId: tierReward.id,
            tierName: tierReward.tier.name,
            rewardType: tierReward.rewardType,
            deliveredAt: new Date().toISOString(),
          }),
          deliveredAt: new Date(),
        },
      })

      // Create tier reward usage record
      await prisma.tierRewardUsage.create({
        data: {
          userId,
          tierRewardId: tierReward.id,
          redemptionId: redemption.id,
          usedAt: new Date(),
          period: getCurrentQuotaPeriod(tierReward.quotaType),
        },
      })

      rewardsDelivered.push({
        tierRewardId: tierReward.id,
        productName: tierReward.product.name,
        rewardType: tierReward.rewardType,
      })
    }

    return {
      success: true,
      message: `Successfully delivered ${rewardsDelivered.length} tier rewards`,
      rewardsDelivered,
    }
  } catch (error) {
    console.error('Error delivering tier rewards:', error)
    return {
      success: false,
      message: 'Failed to deliver tier rewards',
      rewardsDelivered: [],
    }
  }
}

async function checkQuotaLimits(
  userId: string,
  tierRewardId: string,
  quotaType: string,
  quotaLimit: number | null
): Promise<boolean> {
  if (quotaType === 'UNLIMITED' || !quotaLimit) {
    return false
  }

  const currentPeriod = getCurrentQuotaPeriod(quotaType)

  const usageCount = await prisma.tierRewardUsage.count({
    where: {
      userId,
      tierRewardId,
      period: currentPeriod,
    },
  })

  return usageCount >= quotaLimit
}

function getCurrentQuotaPeriod(quotaType: string): string {
  const now = new Date()

  switch (quotaType) {
    case 'DAILY':
      return now.toISOString().split('T')[0] // YYYY-MM-DD
    case 'WEEKLY':
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      return `${startOfWeek.getFullYear()}-W${Math.ceil(startOfWeek.getDate() / 7)}`
    case 'MONTHLY':
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    case 'PER_TIER':
      return 'tier-lifetime'
    default:
      return 'unlimited'
  }
}

export async function updateUserTier(
  userId: string,
  programId: string,
  newTierId: string
): Promise<{ success: boolean; message: string; tierRewards?: TierChangeResult }> {
  try {
    // Get current user program data
    const userProgram = await prisma.userProgram.findUnique({
      where: {
        userId_programId: {
          userId,
          programId,
        },
      },
    })

    if (!userProgram) {
      return {
        success: false,
        message: 'User not enrolled in program',
      }
    }

    const oldTierId = userProgram.tierId

    // Update user tier
    await prisma.userProgram.update({
      where: {
        userId_programId: {
          userId,
          programId,
        },
      },
      data: {
        tierId: newTierId,
        updatedAt: new Date(),
      },
    })

    // Deliver tier rewards
    const tierRewards = await deliverTierRewards(userId, programId, newTierId, oldTierId || undefined)

    return {
      success: true,
      message: 'Tier updated successfully',
      tierRewards,
    }
  } catch (error) {
    console.error('Error updating user tier:', error)
    return {
      success: false,
      message: 'Failed to update user tier',
    }
  }
}

export async function checkAndUpgradeTiers(userId: string, programId: string): Promise<void> {
  try {
    // Get user's current XP and tier
    const userProgram = await prisma.userProgram.findUnique({
      where: {
        userId_programId: {
          userId,
          programId,
        },
      },
      include: {
        tier: true,
      },
    })

    if (!userProgram) return

    // Get all tiers for this program, ordered by level
    const tiers = await prisma.tier.findMany({
      where: {
        programId,
        isActive: true,
      },
      orderBy: {
        level: 'asc',
      },
    })

    // Find the highest tier the user qualifies for
    let targetTier = tiers[0] // Default to lowest tier

    for (const tier of tiers) {
      if (userProgram.xp >= tier.requiredXP) {
        targetTier = tier
      } else {
        break
      }
    }

    // If user should be in a different tier, update it
    if (targetTier.id !== userProgram.tierId) {
      await updateUserTier(userId, programId, targetTier.id)
    }
  } catch (error) {
    console.error('Error checking tier upgrades:', error)
  }
}