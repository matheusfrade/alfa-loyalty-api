import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)

    if (!payload || typeof payload.userId !== 'string' || !payload.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const programId = searchParams.get('programId')

    // If no programId provided, get the first available program
    let targetProgramId = programId
    if (!targetProgramId) {
      const firstProgram = await prisma.program.findFirst({
        where: { isActive: true },
        select: { id: true }
      })
      if (!firstProgram) {
        return NextResponse.json({
          data: {
            totalPlayers: 0,
            totalPointsLive: 0,
            distributionByTier: [],
            expirationSchedule: [],
            alerts: {
              vipInflation: {
                isAlert: false,
                percentage: 0,
                threshold: 20
              },
              massExpiration: []
            }
          }
        })
      }
      targetProgramId = firstProgram.id
    }

    // Get total players for this program
    const totalPlayers = await prisma.userProgram.count({
      where: {
        programId: targetProgramId
      }
    })

    // Get all tiers for this program
    const tiers = await prisma.tier.findMany({
      where: {
        programId: targetProgramId,
        isActive: true
      },
      orderBy: { level: 'asc' }
    })

    // Get distribution by tier
    const distributionByTier = await Promise.all(
      tiers.map(async (tier) => {
        const playerCount = await prisma.userProgram.count({
          where: {
            programId: targetProgramId,
            tierId: tier.id
          }
        })

        const percentage = totalPlayers > 0 ? (playerCount / totalPlayers) * 100 : 0

        return {
          tierId: tier.id,
          tierName: tier.name,
          playerCount,
          percentage: Math.round(percentage * 10) / 10
        }
      })
    )

    // Calculate total points live (simplified version)
    const totalPointsLive = await prisma.userProgram.aggregate({
      where: {
        programId: targetProgramId
      },
      _sum: {
        xp: true
      }
    })

    // Get highest tier to check VIP inflation
    const highestTier = tiers[tiers.length - 1]
    const vipCount = highestTier ? distributionByTier.find(d => d.tierId === highestTier.id)?.playerCount || 0 : 0
    const vipPercentage = totalPlayers > 0 ? (vipCount / totalPlayers) * 100 : 0
    const vipThreshold = 20 // 20%

    // Mock expiration schedule (in a real implementation, this would query PlayerPointsLedger)
    const expirationSchedule = [
      {
        period: '7 days',
        pointsExpiring: Math.floor(Math.random() * 1000),
        playersAffected: Math.floor(Math.random() * 10)
      },
      {
        period: '30 days',
        pointsExpiring: Math.floor(Math.random() * 5000),
        playersAffected: Math.floor(Math.random() * 50)
      },
      {
        period: '90 days',
        pointsExpiring: Math.floor(Math.random() * 15000),
        playersAffected: Math.floor(Math.random() * 150)
      }
    ]

    const metrics = {
      totalPlayers,
      totalPointsLive: totalPointsLive._sum.xp || 0,
      distributionByTier,
      expirationSchedule,
      alerts: {
        vipInflation: {
          isAlert: vipPercentage > vipThreshold,
          percentage: Math.round(vipPercentage * 10) / 10,
          threshold: vipThreshold
        },
        massExpiration: [] // Would be populated with real data
      }
    }

    return NextResponse.json({
      data: metrics
    })

  } catch (error) {
    console.error('Error fetching tier metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tier metrics' },
      { status: 500 }
    )
  }
}