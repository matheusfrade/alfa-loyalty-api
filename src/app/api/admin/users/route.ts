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

    // Get all users (excluding admins) with their program details
    const users = await prisma.user.findMany({
      where: {
        isAdmin: false
      },
      include: {
        programs: {
          include: {
            program: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            },
            tier: {
              select: {
                id: true,
                name: true,
                level: true,
                color: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Format the response to match the expected interface
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : undefined,
      programs: user.programs.map(userProgram => ({
        id: userProgram.id,
        coins: userProgram.coins,
        xp: userProgram.xp,
        tier: userProgram.tier ? {
          name: userProgram.tier.name,
          level: userProgram.tier.level,
          color: userProgram.tier.color
        } : undefined,
        program: {
          name: userProgram.program.name
        }
      }))
    }))

    return NextResponse.json({
      users: formattedUsers,
      total: users.length,
    })
  } catch (error) {
    console.error('Get admin users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}