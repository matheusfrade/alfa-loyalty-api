import { NextRequest, NextResponse } from 'next/server'
import { customerGroupsService } from '@/services/customerGroups'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || searchParams.get('query')
    
    if (!query) {
      return NextResponse.json({
        success: false,
        error: 'MISSING_QUERY',
        message: 'Query parameter "q" is required'
      }, { status: 400 })
    }

    if (query.length < 2) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Query too short, minimum 2 characters required'
      })
    }

    const groups = await customerGroupsService.searchGroups(query)
    
    return NextResponse.json({
      success: true,
      data: groups,
      query: query,
      count: groups.length
    })
  } catch (error: any) {
    console.error('Customer Groups Search API Error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.code || 'SEARCH_ERROR',
        message: error.message || 'Failed to search customer groups',
        details: process.env.NODE_ENV === 'development' ? error.details : undefined
      },
      { status: error.code === 'NETWORK_ERROR' ? 503 : 500 }
    )
  }
}