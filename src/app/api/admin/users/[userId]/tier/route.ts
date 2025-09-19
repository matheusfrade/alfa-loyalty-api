import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { updateUserTier } from '@/lib/tier-rewards'
import { z } from 'zod'

const updateTierSchema = z.object({
  programId: z.string(),
  tierId: z.string(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
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

    const { userId } = params
    const body = await request.json()
    const { programId, tierId } = updateTierSchema.parse(body)

    // Update user tier and deliver rewards
    const result = await updateUserTier(userId, programId, tierId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: result.message,
      tierRewards: result.tierRewards,
    })
  } catch (error) {
    console.error('Update user tier error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}