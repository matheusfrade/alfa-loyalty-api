import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(
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

    const targetUserId = params.id
    const requestingUserId = payload.userId

    // Users can only view their own data, unless they're admin
    if (targetUserId !== requestingUserId && !payload.isAdmin) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        programs: {
          select: {
            id: true,
            coins: true,
            xp: true,
            joinedAt: true,
            tier: {
              select: {
                id: true,
                name: true,
                level: true,
                color: true,
                multiplier: true,
                benefits: true,
                requiredXP: true,
              },
            },
            program: {
              select: {
                id: true,
                name: true,
                slug: true,
                type: true,
                tiers: {
                  where: {
                    level: {
                      gt: 0, // Get next tiers
                    },
                  },
                  orderBy: {
                    level: 'asc',
                  },
                  take: 1, // Next tier only
                  select: {
                    id: true,
                    name: true,
                    level: true,
                    requiredXP: true,
                  },
                },
              },
            },
          },
        },
        missions: {
          where: {
            status: {
              in: ['ACTIVE', 'COMPLETED'],
            },
          },
          select: {
            id: true,
            status: true,
            progress: true,
            startedAt: true,
            completedAt: true,
            mission: {
              select: {
                id: true,
                title: true,
                category: true,
                reward: true,
                xpReward: true,
              },
            },
          },
          orderBy: {
            startedAt: 'desc',
          },
          take: 10,
        },
        redemptions: {
          select: {
            id: true,
            status: true,
            redeemedAt: true,
            deliveredAt: true,
            product: {
              select: {
                id: true,
                name: true,
                category: true,
                price: true,
              },
            },
          },
          orderBy: {
            redeemedAt: 'desc',
          },
          take: 10,
        },
        transactions: {
          select: {
            id: true,
            type: true,
            amount: true,
            balance: true,
            description: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 20,
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Format user programs with progress calculations
    const formattedPrograms = user.programs.map(userProgram => {
      const currentTier = userProgram.tier
      const nextTier = userProgram.program.tiers[0]
      
      let progress = 100 // Default to 100% if already at max tier
      
      if (nextTier && currentTier) {
        const progressXP = userProgram.xp - currentTier.requiredXP
        const requiredXP = nextTier.requiredXP - currentTier.requiredXP
        progress = Math.min(Math.round((progressXP / requiredXP) * 100), 100)
      }

      return {
        ...userProgram,
        tier: currentTier ? {
          ...currentTier,
          benefits: JSON.parse(currentTier.benefits),
        } : null,
        nextTier,
        tierProgress: progress,
        program: {
          ...userProgram.program,
          tiers: undefined, // Remove from response
        },
      }
    })

    const formattedUser = {
      ...user,
      programs: formattedPrograms,
    }

    return NextResponse.json({ user: formattedUser })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}