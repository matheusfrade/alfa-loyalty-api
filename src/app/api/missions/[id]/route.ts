import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'

const updateMissionSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  type: z.string().optional(),
  reward: z.number().min(0).optional(),
  xpReward: z.number().min(0).optional(),
  requirement: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  maxClaims: z.number().optional(),
  isActive: z.boolean().optional(),
  order: z.number().optional(),
})

// GET single mission
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

    const mission = await prisma.mission.findUnique({
      where: { id: params.id },
      include: {
        program: true,
        tier: true,
        _count: {
          select: {
            userMissions: true,
          },
        },
      },
    })

    if (!mission) {
      return NextResponse.json(
        { error: 'Mission not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...mission,
      requirement: JSON.parse(mission.requirement),
    })
  } catch (error) {
    console.error('Get mission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// UPDATE mission (admin only)
export async function PUT(
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
    
    if (!payload || typeof payload.userId !== 'string' || !payload.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const data = updateMissionSchema.parse(body)

    const updateData: any = { ...data }
    if (data.requirement) {
      updateData.requirement = JSON.stringify(data.requirement)
    }

    const mission = await prisma.mission.update({
      where: { id: params.id },
      data: updateData,
      include: {
        program: true,
        tier: true,
      },
    })

    return NextResponse.json({
      ...mission,
      requirement: JSON.parse(mission.requirement),
    })
  } catch (error) {
    console.error('Update mission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE mission (admin only)
export async function DELETE(
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
    
    if (!payload || typeof payload.userId !== 'string' || !payload.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Check if mission has any user progress
    const userMissionsCount = await prisma.userMission.count({
      where: { missionId: params.id },
    })

    if (userMissionsCount > 0) {
      // Instead of deleting, deactivate it
      const mission = await prisma.mission.update({
        where: { id: params.id },
        data: { isActive: false },
      })

      return NextResponse.json({
        message: 'Mission deactivated (has user progress)',
        mission,
      })
    }

    // Safe to delete if no user progress
    await prisma.mission.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: 'Mission deleted successfully',
    })
  } catch (error) {
    console.error('Delete mission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}