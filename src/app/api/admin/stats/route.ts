import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Get parallel queries for dashboard stats
    const [
      totalUsers,
      totalPrograms,
      totalMissions,
      totalRewards,
      todaySignups,
      todayRedemptions,
      activeMissions,
      totalCoinsData,
      recentActivity
    ] = await Promise.all([
      // Total users
      prisma.user.count({ where: { isAdmin: false } }),

      // Total programs
      prisma.program.count({ where: { isActive: true } }),

      // Total missions
      prisma.mission.count(),

      // Total rewards/products
      prisma.product.count(),

      // Today's signups
      prisma.user.count({
        where: {
          isAdmin: false,
          createdAt: { gte: todayStart }
        }
      }),

      // Today's redemptions
      prisma.redemption.count({
        where: {
          redeemedAt: { gte: todayStart }
        }
      }),

      // Active missions
      prisma.mission.count({
        where: { isActive: true }
      }),

      // Total coins earned (sum of all user coins)
      prisma.userProgram.aggregate({
        _sum: { coins: true }
      }),

      // Recent activity for the activity feed
      prisma.transaction.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } }
        }
      })
    ])

    const stats = {
      totalUsers,
      totalPrograms,
      totalMissions,
      totalRewards,
      todaySignups,
      todayRedemptions,
      activeMissions,
      totalCoinsEarned: totalCoinsData._sum.coins || 0,
      recentActivity: recentActivity.map(activity => ({
        id: activity.id,
        type: activity.type,
        userName: activity.user.name,
        userEmail: activity.user.email,
        amount: activity.amount,
        description: activity.description,
        createdAt: activity.createdAt
      }))
    }

    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: now.toISOString()
    })

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}