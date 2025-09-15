import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'

const getMissionsSchema = z.object({
  programId: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'CLAIMED', 'EXPIRED']).optional(),
  limit: z.union([z.string(), z.number()]).transform(Number).default(50),
  offset: z.union([z.string(), z.number()]).transform(Number).default(0),
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
    const { programId, category, status, limit, offset } = getMissionsSchema.parse(searchParams)

    // Build where clause
    const where: any = {
      isActive: true,
    }

    if (programId) {
      where.programId = programId
    }
    
    if (category) {
      where.category = category
    }

    // Get missions with user progress
    const missions = await prisma.mission.findMany({
      where,
      include: {
        program: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tier: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
        userMissions: {
          where: {
            userId: payload.userId,
          },
          select: {
            id: true,
            status: true,
            progress: true,
            claimCount: true,
            startedAt: true,
            completedAt: true,
            claimedAt: true,
          },
        },
        productRewards: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                category: true,
                price: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
      take: limit,
      skip: offset,
    })

    // Format response
    const formattedMissions = missions.map(mission => ({
      ...mission,
      requirement: JSON.parse(mission.requirement),
      userProgress: mission.userMissions[0] || null,
      userMissions: undefined,
    }))

    return NextResponse.json({
      missions: formattedMissions,
      total: missions.length,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Get missions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Create mission (admin only)
const createMissionSchema = z.object({
  programId: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  type: z.enum(['SINGLE', 'RECURRING', 'STREAK', 'MILESTONE']).default('SINGLE'),
  icon: z.string().optional(),
  reward: z.number().min(0).default(0),
  xpReward: z.number().min(0).default(0),
  requirement: z.record(z.any()).default({}),
  maxClaims: z.number().optional(),
  startDate: z.string().optional().transform(val => {
    if (!val || val === '') return undefined
    // Try to parse various date formats
    const date = new Date(val)
    return isNaN(date.getTime()) ? undefined : date.toISOString()
  }),
  endDate: z.string().optional().transform(val => {
    if (!val || val === '') return undefined
    // Try to parse various date formats  
    const date = new Date(val)
    return isNaN(date.getTime()) ? undefined : date.toISOString()
  }),
  tierRequired: z.string().optional(),
  order: z.number().default(0),
  productRewards: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1).default(1)
  })).optional(),
})

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
    const data = createMissionSchema.parse(body)

    const mission = await prisma.mission.create({
      data: {
        programId: data.programId,
        title: data.title,
        description: data.description,
        category: data.category,
        type: data.type,
        icon: data.icon,
        reward: data.reward,
        xpReward: data.xpReward,
        requirement: JSON.stringify(data.requirement),
        maxClaims: data.maxClaims,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        tierRequired: data.tierRequired,
        order: data.order,
        productRewards: data.productRewards ? {
          create: data.productRewards.map(reward => ({
            productId: reward.productId,
            quantity: reward.quantity,
          }))
        } : undefined,
      },
      include: {
        program: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tier: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
        productRewards: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                category: true,
                price: true,
                image: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({
      ...mission,
      requirement: JSON.parse(mission.requirement),
    })
  } catch (error) {
    console.error('Create mission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}