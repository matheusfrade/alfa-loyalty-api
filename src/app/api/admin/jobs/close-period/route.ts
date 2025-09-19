import { NextRequest, NextResponse } from 'next/server'
import { tierJobService } from '@/modules/tiers/jobs'

// POST /api/admin/jobs/close-period - Executar job de fechamento de período
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { programId } = body as { programId: string }

    if (!programId) {
      return NextResponse.json(
        { error: 'programId is required' },
        { status: 400 }
      )
    }

    // Executar job de fechamento de período
    const result = await tierJobService.executeClosePeriodJob(programId)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Error executing close period job:', error)
    return NextResponse.json(
      { error: 'Failed to execute close period job' },
      { status: 500 }
    )
  }
}