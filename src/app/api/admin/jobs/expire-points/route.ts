import { NextRequest, NextResponse } from 'next/server'
import { tierJobService } from '@/modules/tiers/jobs'

// POST /api/admin/jobs/expire-points - Executar job de expiração de pontos
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const programId = searchParams.get('programId') || undefined

    // Executar job de expiração
    const result = await tierJobService.executeExpirePointsJob(programId)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Error executing expire points job:', error)
    return NextResponse.json(
      { error: 'Failed to execute expire points job' },
      { status: 500 }
    )
  }
}