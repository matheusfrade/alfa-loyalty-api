import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { tierService } from '@/modules/tiers/services'
import { TierInput } from '@/modules/tiers/types'

// GET /api/admin/tiers/[id] - Obter tier específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const tier = await prisma.tier.findUnique({
      where: { id },
      include: {
        program: {
          select: { name: true, slug: true }
        },
        _count: {
          select: {
            users: true,
            missions: true,
            products: true
          }
        }
      }
    })

    if (!tier) {
      return NextResponse.json(
        { error: 'Tier not found' },
        { status: 404 }
      )
    }

    // Estatísticas do tier
    const stats = await prisma.$queryRaw<[{
      playerCount: number
      avgPointsLive: number
      totalPointsLive: number
    }]>`
      SELECT
        COUNT(DISTINCT up.userId) as playerCount,
        AVG(COALESCE(pointsSum, 0)) as avgPointsLive,
        SUM(COALESCE(pointsSum, 0)) as totalPointsLive
      FROM UserProgram up
      LEFT JOIN (
        SELECT
          playerId,
          SUM(amount) as pointsSum
        FROM PlayerPointsLedger
        WHERE programId = ${tier.programId}
          AND isExpired = 0
          AND expiresAt >= datetime('now')
        GROUP BY playerId
      ) points ON up.userId = points.playerId
      WHERE up.tierId = ${id}
        AND up.programId = ${tier.programId}
    `

    return NextResponse.json({
      success: true,
      data: {
        ...tier,
        benefits: JSON.parse(tier.benefits),
        stats: stats[0] || {
          playerCount: 0,
          avgPointsLive: 0,
          totalPointsLive: 0
        }
      }
    })

  } catch (error) {
    console.error('Error fetching tier:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tier' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/tiers/[id] - Atualizar tier
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const tierData = await request.json() as Partial<TierInput>

    // Atualizar tier usando o service
    const tier = await tierService.updateTier(id, tierData)

    return NextResponse.json({
      success: true,
      data: {
        ...tier,
        benefits: JSON.parse(tier.benefits)
      }
    })

  } catch (error) {
    console.error('Error updating tier:', error)

    if (error instanceof Error) {
      if (error.message === 'Tier not found') {
        return NextResponse.json(
          { error: 'Tier not found' },
          { status: 404 }
        )
      }

      if (error.message.includes('ranges conflict')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to update tier' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/tiers/[id] - Desativar tier
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Verificar se tier existe
    const tier = await prisma.tier.findUnique({
      where: { id }
    })

    if (!tier) {
      return NextResponse.json(
        { error: 'Tier not found' },
        { status: 404 }
      )
    }

    // Verificar se tier tem jogadores associados
    const playerCount = await prisma.userProgram.count({
      where: { tierId: id }
    })

    if (playerCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete tier with ${playerCount} associated players. Deactivate instead.` },
        { status: 400 }
      )
    }

    // Desativar tier
    const updatedTier = await prisma.tier.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...updatedTier,
        benefits: JSON.parse(updatedTier.benefits)
      }
    })

  } catch (error) {
    console.error('Error deleting tier:', error)
    return NextResponse.json(
      { error: 'Failed to delete tier' },
      { status: 500 }
    )
  }
}