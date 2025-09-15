import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'
import { MissionEventHelpers, eventBus } from '@/lib/event-bus'
import { EventType } from '@/types/mission-rules'

// Schema for incoming events
const eventSchema = z.object({
  userId: z.string(),
  type: z.enum([
    'user_login',
    'bet_placed', 
    'deposit_made',
    'game_played',
    'withdrawal_requested',
    'profile_completed',
    'kyc_verified',
    'friend_referred',
    'bonus_claimed',
    'tournament_joined',
    'achievement_unlocked',
    'streak_broken',
    'level_up',
    'custom_event'
  ] as const),
  data: z.record(z.any()),
  sessionId: z.string().optional(),
  deviceType: z.string().optional(),
  source: z.string().optional()
})

// POST /api/events - Emit new event
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const eventData = eventSchema.parse(body)

    // Generate unique event ID
    const eventId = `${eventData.type}_${eventData.userId}_${Date.now()}`

    // Emit event through event bus
    await eventBus.emitMissionEvent({
      id: eventId,
      userId: eventData.userId,
      type: eventData.type as EventType,
      timestamp: new Date(),
      data: eventData.data,
      sessionId: eventData.sessionId,
      deviceType: eventData.deviceType,
      source: eventData.source
    })

    return NextResponse.json({
      success: true,
      eventId,
      message: 'Event processed successfully'
    })

  } catch (error) {
    console.error('Event processing error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid event data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/events - Get event history
export async function GET(request: NextRequest) {
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

    const url = new URL(request.url)
    const userId = url.searchParams.get('userId') || payload.userId
    const limit = parseInt(url.searchParams.get('limit') || '50')

    // Only admins can see other users' events
    if (userId !== payload.userId && !payload.isAdmin) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const events = await eventBus.getEventHistory(userId, limit)

    return NextResponse.json({
      events,
      total: events.length
    })

  } catch (error) {
    console.error('Get events error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper endpoint for common events
export async function PUT(request: NextRequest) {
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

    const body = await request.json()
    const { action, data } = body

    const userId = payload.userId

    switch (action) {
      case 'login':
        await MissionEventHelpers.userLogin(userId, data)
        break
      
      case 'bet_placed':
        await MissionEventHelpers.betPlaced(userId, data)
        break
      
      case 'deposit':
        await MissionEventHelpers.depositMade(userId, data)
        break
      
      case 'game_played':
        await MissionEventHelpers.gamePlayed(userId, data)
        break
      
      case 'profile_completed':
        await MissionEventHelpers.profileCompleted(userId, data)
        break
      
      case 'kyc_verified':
        await MissionEventHelpers.kycVerified(userId, data)
        break
      
      case 'friend_referred':
        await MissionEventHelpers.friendReferred(userId, data)
        break
      
      case 'bonus_claimed':
        await MissionEventHelpers.bonusClaimed(userId, data)
        break
      
      case 'custom':
        await MissionEventHelpers.customEvent(userId, data.eventName, data.eventData)
        break
      
      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: `${action} event processed`
    })

  } catch (error) {
    console.error('Event helper error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}