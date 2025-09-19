import { NextRequest, NextResponse } from 'next/server'
import { tierService } from '@/modules/tiers/services'
import { TierInput } from '@/modules/tiers/types'

// POST /api/admin/tiers/validate-ranges - Validar ranges de tiers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { programId, tiers } = body as {
      programId: string
      tiers: TierInput[]
    }

    if (!programId || !Array.isArray(tiers)) {
      return NextResponse.json(
        { error: 'programId and tiers array are required' },
        { status: 400 }
      )
    }

    // Validar ranges usando o service
    const validation = await tierService.validateTierRanges(programId, tiers)

    return NextResponse.json({
      success: true,
      data: validation
    })

  } catch (error) {
    console.error('Error validating tier ranges:', error)
    return NextResponse.json(
      { error: 'Failed to validate tier ranges' },
      { status: 500 }
    )
  }
}