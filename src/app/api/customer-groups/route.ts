import { NextRequest, NextResponse } from 'next/server'
import { customerGroupsService } from '@/services/customerGroups'
import { CustomerGroupSearchParams } from '@/types/customer-groups'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Parse query parameters
    const params: CustomerGroupSearchParams = {
      query: searchParams.get('query') || undefined,
      isActive: searchParams.get('active') ? searchParams.get('active') === 'true' : undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    }

    const groups = await customerGroupsService.getAllGroups(params)
    
    return NextResponse.json({
      success: true,
      data: groups,
      total: groups.length,
      cached: true // Indicate this might be cached data
    })
  } catch (error: any) {
    console.error('Customer Groups API Error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'Failed to fetch customer groups',
        details: process.env.NODE_ENV === 'development' ? error.details : undefined
      },
      { status: error.code === 'NETWORK_ERROR' ? 503 : 500 }
    )
  }
}

// Health check endpoint
export async function HEAD(request: NextRequest) {
  try {
    const isHealthy = await customerGroupsService.checkHealth()
    return new NextResponse(null, { 
      status: isHealthy ? 200 : 503,
      headers: {
        'X-Service-Health': isHealthy ? 'healthy' : 'unhealthy'
      }
    })
  } catch {
    return new NextResponse(null, { status: 503 })
  }
}