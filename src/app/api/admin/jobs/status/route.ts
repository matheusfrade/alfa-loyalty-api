import { NextRequest, NextResponse } from 'next/server'
import { tierJobService } from '@/modules/tiers/jobs'

// GET /api/admin/jobs/status - Obter status dos jobs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    // Buscar status dos jobs
    const jobs = await tierJobService.getJobStatus(limit)

    return NextResponse.json({
      success: true,
      data: jobs.map(job => ({
        ...job,
        result: job.result ? JSON.parse(job.result) : null,
        metadata: job.metadata ? JSON.parse(job.metadata) : null
      }))
    })

  } catch (error) {
    console.error('Error fetching job status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job status' },
      { status: 500 }
    )
  }
}