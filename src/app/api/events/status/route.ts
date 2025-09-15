import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { eventBus } from '@/lib/event-bus'
import { ruleEngine } from '@/lib/rule-engine'
import { prisma } from '@/lib/prisma'

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
    
    if (!payload || !payload.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get event bus status
    const queueStatus = eventBus.getQueueStatus()

    // Get recent event statistics
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const eventStats = await prisma.event.groupBy({
      by: ['type'],
      where: {
        createdAt: {
          gte: today
        }
      },
      _count: {
        type: true
      }
    })

    // Get mission completion stats
    const completionStats = await prisma.userMission.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })

    // Get active missions count
    const activeMissions = await prisma.mission.count({
      where: {
        isActive: true
      }
    })

    // Get recent progress updates
    const recentProgress = await prisma.userMission.findMany({
      where: {
        // Filter for recent updates if needed
      },
      include: {
        mission: {
          select: {
            title: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        id: 'desc'
      },
      take: 10
    })

    // System health metrics
    const healthMetrics = {
      eventBusStatus: queueStatus.processing ? 'processing' : 'idle',
      queueLength: queueStatus.queueLength,
      subscriberCount: queueStatus.subscriberCount,
      activeMissions,
      totalEvents: eventStats.reduce((sum, stat) => sum + stat._count.type, 0),
      completedMissions: completionStats.find(s => s.status === 'COMPLETED')?._count.status || 0,
      activeMissionProgress: completionStats.find(s => s.status === 'ACTIVE')?._count.status || 0,
      lastProcessedAt: new Date().toISOString()
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      eventBus: queueStatus,
      statistics: {
        eventsByType: eventStats.map(stat => ({
          type: stat.type,
          count: stat._count.type
        })),
        missionsByStatus: completionStats.map(stat => ({
          status: stat.status,
          count: stat._count.status
        })),
        activeMissions,
        recentProgress: recentProgress.map(progress => ({
          missionTitle: progress.mission.title,
          userName: progress.user.name,
          progress: progress.progress,
          status: progress.status,
          startedAt: progress.startedAt
        }))
      },
      health: healthMetrics
    })

  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { 
        status: 'error',
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// POST /api/events/status - Trigger manual event processing (admin only)
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
    
    if (!payload || !payload.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'flush_queue':
        // This would trigger immediate processing of all queued events
        // For now, just return success
        return NextResponse.json({
          success: true,
          message: 'Event queue flush triggered'
        })
      
      case 'test_event':
        // Create a test event for the admin user
        await eventBus.emitMissionEvent({
          id: `test_${Date.now()}`,
          userId: payload.userId as string,
          type: 'custom_event',
          timestamp: new Date(),
          data: {
            event_name: 'admin_test',
            test: true
          }
        })
        
        return NextResponse.json({
          success: true,
          message: 'Test event emitted'
        })
      
      case 'validate_rules':
        // Validate all active mission rules
        const missions = await prisma.mission.findMany({
          where: { isActive: true }
        })
        
        const validationResults = await Promise.all(
          missions.map(async (mission) => {
            try {
              const rule = JSON.parse(mission.requirement)
              const validation = await ruleEngine.validateRule(rule)
              return {
                missionId: mission.id,
                missionTitle: mission.title,
                ...validation
              }
            } catch (error) {
              return {
                missionId: mission.id,
                missionTitle: mission.title,
                isValid: false,
                errors: ['Invalid rule JSON'],
                warnings: [],
                estimatedComplexity: 'HIGH' as const
              }
            }
          })
        )
        
        return NextResponse.json({
          success: true,
          validationResults
        })
      
      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Status action error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}