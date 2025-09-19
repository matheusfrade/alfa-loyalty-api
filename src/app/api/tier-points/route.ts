import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'

const getPointsSchema = z.object({
  programId: z.string().optional(),
  limit: z.union([z.string(), z.number()]).transform(Number).default(50),
  offset: z.union([z.string(), z.number()]).transform(Number).default(0),
  source: z.string().optional(),
})

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

    if (!payload || typeof payload.userId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const searchParams = Object.fromEntries(url.searchParams.entries())
    const { programId, limit, offset, source } = getPointsSchema.parse(searchParams)

    // Build where clause
    const where: any = {
      playerId: payload.userId,
    }

    if (programId) {
      where.programId = programId
    }

    if (source) {
      where.source = source
    }

    // Get tier points history
    const pointsHistory = await prisma.playerPointsLedger.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset,
      include: {
        program: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      }
    })

    // Get current player tier status for each program
    const playerPrograms = await prisma.userProgram.findMany({
      where: {
        userId: payload.userId,
        ...(programId ? { programId } : {})
      },
      include: {
        program: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        },
        tier: {
          select: {
            id: true,
            name: true,
            level: true,
            benefits: true,
          }
        }
      }
    })

    // Get total points balance per program
    const pointsBalance = await prisma.playerPointsLedger.groupBy({
      by: ['programId'],
      where: {
        playerId: payload.userId,
        ...(programId ? { programId } : {})
      },
      _sum: {
        amount: true
      }
    })

    // Calculate live points (points that haven't expired)
    const livePointsBalance = await prisma.playerPointsLedger.groupBy({
      by: ['programId'],
      where: {
        playerId: payload.userId,
        ...(programId ? { programId } : {}),
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      _sum: {
        amount: true
      }
    })

    return NextResponse.json({
      pointsHistory,
      playerPrograms,
      summary: {
        totalPoints: pointsBalance.reduce((sum, p) => sum + (p._sum.amount || 0), 0),
        livePoints: livePointsBalance.reduce((sum, p) => sum + (p._sum.amount || 0), 0),
        expiredPoints: pointsBalance.reduce((sum, p) => sum + (p._sum.amount || 0), 0) -
                       livePointsBalance.reduce((sum, p) => sum + (p._sum.amount || 0), 0)
      },
      pagination: {
        limit,
        offset,
        total: pointsHistory.length
      }
    })
  } catch (error) {
    console.error('Get tier points error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}