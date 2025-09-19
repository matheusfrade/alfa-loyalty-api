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

    // Get all programs (both active and inactive) with user counts
    const programs = await prisma.program.findMany({
      include: {
        _count: {
          select: {
            users: true,
            missions: true,
            products: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Parse JSON fields and format the response
    const formattedPrograms = programs.map(program => ({
      ...program,
      config: JSON.parse(program.config),
      branding: JSON.parse(program.branding),
    }))

    return NextResponse.json({
      programs: formattedPrograms,
      total: programs.length,
    })
  } catch (error) {
    console.error('Get admin programs error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}