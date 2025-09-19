import { NextRequest, NextResponse } from 'next/server'
import { tierService } from '@/modules/tiers/services'
import { TierInput } from '@/modules/tiers/types'

// POST /api/admin/tiers/simulate - Simular impacto de mudanças nos tiers
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

    // Simular mudanças usando o service
    const simulation = await tierService.simulateTierRanges(programId, tiers)

    return NextResponse.json({
      success: true,
      data: simulation
    })

  } catch (error) {
    console.error('Error simulating tier changes:', error)
    return NextResponse.json(
      { error: 'Failed to simulate tier changes' },
      { status: 500 }
    )
  }
}