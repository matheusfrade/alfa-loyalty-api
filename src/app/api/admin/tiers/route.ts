import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { TierInput } from '@/modules/tiers/types'

// GET /api/admin/tiers - Listar tiers
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
          success: true,
          data: []
        })
      }
      targetProgramId = firstProgram.id
    }

    const tiers = await prisma.tier.findMany({
      where: {
        programId: targetProgramId,
        isActive: true
      },
      orderBy: { level: 'asc' },
      include: {
        _count: {
          select: {
            users: true,
            missions: true,
            products: true
          }
        }
      }
    })

    // Enriquecer com dados calculados
    const enrichedTiers = await Promise.all(
      tiers.map(async (tier) => {
        // Contar jogadores no tier
        const playerCount = await prisma.userProgram.count({
          where: {
            programId: targetProgramId,
            tierId: tier.id
          }
        })

        // Calcular pontos vivos médios para o tier
        const avgPoints = await prisma.$queryRaw<[{ avg: number }]>`
          SELECT AVG(pointsSum) as avg FROM (
            SELECT SUM(amount) as pointsSum
            FROM PlayerPointsLedger ppl
            JOIN UserProgram up ON ppl.playerId = up.userId
            WHERE up.tierId = ${tier.id}
              AND up.programId = ${targetProgramId}
              AND ppl.programId = ${targetProgramId}
              AND ppl.isExpired = 0
              AND ppl.expiresAt >= datetime('now')
            GROUP BY ppl.playerId
          )
        `

        return {
          ...tier,
          benefits: JSON.parse(tier.benefits),
          playerCount,
          avgPointsLive: avgPoints[0]?.avg || 0,
          usage: {
            missions: tier._count.missions,
            products: tier._count.products
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: enrichedTiers
    })

  } catch (error) {
    console.error('Error fetching tiers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tiers' },
      { status: 500 }
    )
  }
}

// POST /api/admin/tiers - Criar novo tier
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { programId, ...tierData } = body as { programId: string } & TierInput

    if (!programId) {
      return NextResponse.json(
        { error: 'programId is required' },
        { status: 400 }
      )
    }

    // Validar dados básicos
    if (!tierData.name || typeof tierData.level !== 'number') {
      return NextResponse.json(
        { error: 'name and level are required' },
        { status: 400 }
      )
    }

    // Verificar se level já existe
    const existingTier = await prisma.tier.findFirst({
      where: {
        programId,
        level: tierData.level,
        isActive: true
      }
    })

    if (existingTier) {
      return NextResponse.json(
        { error: `Tier with level ${tierData.level} already exists` },
        { status: 400 }
      )
    }

    // Criar tier diretamente
    const tier = await prisma.tier.create({
      data: {
        programId,
        name: tierData.name,
        level: tierData.level,
        requiredXP: tierData.minPoints || 0, // For compatibility
        minPoints: tierData.minPoints,
        maxPoints: tierData.maxPoints,
        maintenancePoints: tierData.maintenancePoints,
        color: tierData.color || '#6366f1',
        icon: tierData.icon,
        multiplier: tierData.multiplier || 1.0,
        benefits: JSON.stringify(tierData.benefits || []),
        isInviteOnly: tierData.isInviteOnly || false,
        isActive: tierData.isActive !== false,
      },
      include: {
        _count: {
          select: {
            users: true,
            missions: true,
            products: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        ...tier,
        benefits: JSON.parse(tier.benefits),
        playerCount: 0,
        avgPointsLive: 0,
        usage: {
          missions: tier._count.missions,
          products: tier._count.products,
        },
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating tier:', error)

    if (error instanceof Error && error.message.includes('ranges conflict')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create tier' },
      { status: 500 }
    )
  }
}