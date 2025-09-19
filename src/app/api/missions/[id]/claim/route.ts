import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { tierService } from '@/modules/tiers/services'
import { checkAndUpgradeTiers } from '@/lib/tier-rewards'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)
    
    if (!payload || typeof payload.userId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const missionId = params.id
    const userId = payload.userId

    // Get mission and user progress
    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
      include: {
        program: true,
        userMissions: {
          where: { userId },
        },
      },
    })

    if (!mission || !mission.isActive) {
      return NextResponse.json(
        { error: 'Mission not found' },
        { status: 404 }
      )
    }

    const userMission = mission.userMissions[0]

    if (!userMission || userMission.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Mission not completed' },
        { status: 400 }
      )
    }

    if (userMission.claimedAt) {
      return NextResponse.json(
        { error: 'Mission already claimed' },
        { status: 400 }
      )
    }

    // Check max claims
    if (mission.maxClaims && userMission.claimCount >= mission.maxClaims) {
      return NextResponse.json(
        { error: 'Maximum claims reached' },
        { status: 400 }
      )
    }

    // Get user program data
    const userProgram = await prisma.userProgram.findUnique({
      where: {
        userId_programId: {
          userId,
          programId: mission.programId,
        },
      },
      include: {
        tier: true,
      },
    })

    if (!userProgram) {
      return NextResponse.json(
        { error: 'User not in program' },
        { status: 400 }
      )
    }

    const multiplier = userProgram.tier?.multiplier || 1
    const coinsReward = Math.floor(mission.reward * multiplier)
    
    // Start transaction
    await prisma.$transaction(async (tx) => {
      // Update user mission
      await tx.userMission.update({
        where: { id: userMission.id },
        data: {
          status: 'CLAIMED',
          claimedAt: new Date(),
          claimCount: { increment: 1 },
        },
      })

      // Update user program
      const newCoins = userProgram.coins + coinsReward
      const newXP = userProgram.xp + mission.xpReward

      await tx.userProgram.update({
        where: { id: userProgram.id },
        data: {
          coins: newCoins,
          xp: newXP,
        },
      })

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId,
          programId: mission.programId,
          type: 'EARNED',
          amount: coinsReward,
          balance: newCoins,
          reference: missionId,
          description: `Mission completed: ${mission.title}`,
          metadata: JSON.stringify({
            missionId,
            originalReward: mission.reward,
            multiplier,
            xpReward: mission.xpReward,
          }),
        },
      })

      // Create notification
      await tx.notification.create({
        data: {
          userId,
          type: 'MISSION_COMPLETE',
          title: 'Mission Completed!',
          message: `You completed "${mission.title}" and earned ${coinsReward} coins${mission.xpReward > 0 ? `, ${mission.xpReward} XP` : ''}${mission.tierPointsReward > 0 ? `, and ${mission.tierPointsReward} tier points` : ''}!`,
          data: JSON.stringify({
            missionId,
            coinsReward,
            xpReward: mission.xpReward,
            tierPointsReward: mission.tierPointsReward,
          }),
        },
      })

      // No tier check here - will be done outside transaction

      // Award tier points if mission has tierPointsReward
      if (mission.tierPointsReward > 0) {
        await tierService.addPoints({
          playerId: userId,
          programId: mission.programId,
          amount: mission.tierPointsReward,
          source: 'MISSION',
          reference: missionId,
          description: `Mission completed: ${mission.title}`
        })
      }
    })

    // Check for tier upgrades and deliver rewards after transaction
    await checkAndUpgradeTiers(userId, mission.programId)

    return NextResponse.json({
      success: true,
      rewards: {
        coins: coinsReward,
        xp: mission.xpReward,
        tierPoints: mission.tierPointsReward
      },
      message: `Mission completed! You earned ${coinsReward} coins, ${mission.xpReward} XP${mission.tierPointsReward > 0 ? `, and ${mission.tierPointsReward} tier points` : ''}.`,
    })
  } catch (error) {
    console.error('Claim mission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}