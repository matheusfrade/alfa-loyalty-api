import { NextRequest, NextResponse } from 'next/server'
import { customerGroupsService } from '@/services/customerGroups'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const idsParam = searchParams.get('ids')
    
    if (!idsParam) {
      return NextResponse.json({
        success: false,
        error: 'MISSING_IDS',
        message: 'Query parameter "ids" is required'
      }, { status: 400 })
    }

    const ids = idsParam.split(',').map(id => id.trim()).filter(Boolean)
    
    if (ids.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No valid IDs provided'
      })
    }

    if (ids.length > 100) {
      return NextResponse.json({
        success: false,
        error: 'TOO_MANY_IDS',
        message: 'Maximum 100 IDs allowed per request'
      }, { status: 400 })
    }

    const groups = await customerGroupsService.getGroupsByIds(ids)
    
    return NextResponse.json({
      success: true,
      data: groups,
      requested: ids.length,
      found: groups.length
    })
  } catch (error: any) {
    console.error('Customer Groups Batch API Error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.code || 'BATCH_ERROR',
        message: error.message || 'Failed to fetch customer groups',
        details: process.env.NODE_ENV === 'development' ? error.details : undefined
      },
      { status: error.code === 'NETWORK_ERROR' ? 503 : 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ids } = body

    if (!Array.isArray(ids)) {
      return NextResponse.json({
        success: false,
        error: 'INVALID_BODY',
        message: 'Body must contain an "ids" array'
      }, { status: 400 })
    }

    if (ids.length > 100) {
      return NextResponse.json({
        success: false,
        error: 'TOO_MANY_IDS',
        message: 'Maximum 100 IDs allowed per request'
      }, { status: 400 })
    }

    const groups = await customerGroupsService.getGroupsByIds(ids)
    
    return NextResponse.json({
      success: true,
      data: groups,
      requested: ids.length,
      found: groups.length
    })
  } catch (error: any) {
    console.error('Customer Groups Batch POST API Error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.code || 'BATCH_ERROR',
        message: error.message || 'Failed to fetch customer groups',
        details: process.env.NODE_ENV === 'development' ? error.details : undefined
      },
      { status: 500 }
    )
  }
}