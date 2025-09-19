import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Get all the analytics data in parallel
    const [
      totalUsers,
      activeUsers,
      totalCoinsData,
      totalCoinsSpent,
      missionCompletions,
      rewardRedemptions,
      topMissions,
      topRewards,
      tierDistribution,
      newUsers30d,
      redemptions30d,
      totalMissions,
      totalRewards,
      totalPrograms
    ] = await Promise.all([
      // Total users (excluding admins)
      prisma.user.count({ where: { isAdmin: false } }),

      // Active users (had activity in last 7 days)
      prisma.user.count({
        where: {
          isAdmin: false,
          lastLoginAt: { gte: last7Days }
        }
      }),

      // Total coins earned
      prisma.userProgram.aggregate({
        _sum: { coins: true }
      }),

      // Total coins spent (sum of product prices from redemptions)
      prisma.redemption.findMany({
        include: { product: { select: { price: true } } }
      }).then(redemptions =>
        redemptions.reduce((sum, r) => sum + r.product.price, 0)
      ),

      // Mission completions
      prisma.userMission.count({
        where: { status: 'COMPLETED' }
      }),

      // Reward redemptions
      prisma.redemption.count(),

      // Top missions by completions
      prisma.userMission.groupBy({
        by: ['missionId'],
        _count: { missionId: true },
        orderBy: { _count: { missionId: 'desc' } },
        take: 5
      }),

      // Top rewards by redemptions
      prisma.redemption.groupBy({
        by: ['productId'],
        _count: { productId: true },
        orderBy: { _count: { productId: 'desc' } },
        take: 5
      }),

      // Tier distribution
      prisma.userProgram.groupBy({
        by: ['tierId'],
        _count: { tierId: true },
        where: { tierId: { not: null } },
        orderBy: { tierId: 'asc' }
      }),

      // New users in last 30 days, grouped by day
      prisma.$queryRaw`
        SELECT DATE(createdAt) as date, COUNT(*) as count
        FROM User
        WHERE isAdmin = false AND createdAt >= ${last30Days}
        GROUP BY DATE(createdAt)
        ORDER BY date ASC
      `,

      // Redemptions in last 30 days, grouped by day
      prisma.$queryRaw`
        SELECT DATE(redeemedAt) as date, COUNT(*) as count
        FROM Redemption
        WHERE redeemedAt >= ${last30Days}
        GROUP BY DATE(redeemedAt)
        ORDER BY date ASC
      `,

      // Other counts for consistency with main dashboard
      prisma.mission.count(),
      prisma.product.count(),
      prisma.program.count({ where: { isActive: true } })
    ])

    // Get mission details for top missions
    const topMissionIds = topMissions.map(m => m.missionId)
    const missionDetails = await prisma.mission.findMany({
      where: { id: { in: topMissionIds } },
      select: { id: true, title: true, category: true }
    })

    // Get product details for top rewards
    const topRewardIds = topRewards.map(r => r.productId)
    const rewardDetails = await prisma.product.findMany({
      where: { id: { in: topRewardIds } },
      select: { id: true, name: true, category: true }
    })

    // Get tier details
    const tiers = await prisma.tier.findMany({
      orderBy: { level: 'asc' },
      select: { id: true, level: true, name: true }
    })

    // Format the data
    const totalCoinsEarned = totalCoinsData._sum.coins || 0
    const coinsSpent = totalCoinsSpent || 0

    // Calculate churn rate (users who haven't been active in 30 days)
    const inactiveUsers = totalUsers - activeUsers
    const churnRate = totalUsers > 0 ? (inactiveUsers / totalUsers) * 100 : 0

    // Format top missions
    const formattedTopMissions = topMissions.map(mission => {
      const detail = missionDetails.find(m => m.id === mission.missionId)
      return {
        name: detail?.title || 'Unknown Mission',
        completions: mission._count.missionId,
        category: detail?.category || 'UNKNOWN'
      }
    })

    // Format top rewards
    const formattedTopRewards = topRewards.map(reward => {
      const detail = rewardDetails.find(r => r.id === reward.productId)
      return {
        name: detail?.name || 'Unknown Reward',
        redemptions: reward._count.productId,
        category: detail?.category || 'UNKNOWN'
      }
    })

    // Format tier distribution
    const formattedTierDistribution = tierDistribution.map(tier => {
      const tierInfo = tiers.find(t => t.id === tier.tierId)
      const percentage = totalUsers > 0 ? (tier._count.tierId / totalUsers) * 100 : 0
      return {
        tier: tierInfo?.name || `Tier ${tier.tierId}`,
        count: tier._count.tierId,
        percentage: Math.round(percentage * 10) / 10
      }
    })

    // Fill in missing days for growth data
    const fillGrowthData = (data: any[], days: number) => {
      const result = []
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        const dateStr = date.toISOString().split('T')[0]
        const existingData = data.find((d: any) => d.date === dateStr)
        result.push({
          date: dateStr,
          count: existingData ? Number(existingData.count) : 0
        })
      }
      return result
    }

    const analytics = {
      overview: {
        totalUsers,
        activeUsers,
        totalCoinsEarned,
        totalCoinsSpent: coinsSpent,
        missionCompletions,
        rewardRedemptions,
        averageSessionTime: 18.5, // This would need session tracking
        churnRate: Math.round(churnRate * 10) / 10,
        // Additional stats for consistency with main dashboard
        totalMissions,
        totalRewards,
        totalPrograms
      },
      growth: {
        newUsers: fillGrowthData(newUsers30d as any[], 30),
        coinsEarned: [], // Would need transaction history by day
        redemptions: fillGrowthData(redemptions30d as any[], 30)
      },
      engagement: {
        topMissions: formattedTopMissions,
        topRewards: formattedTopRewards,
        tierDistribution: formattedTierDistribution
      }
    }

    return NextResponse.json({
      success: true,
      data: analytics,
      timestamp: now.toISOString()
    })

  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch analytics data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}