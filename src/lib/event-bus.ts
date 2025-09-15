import { 
  EventBus as IEventBus, 
  MissionEvent, 
  EventType, 
  ProgressUpdate 
} from '@/types/mission-rules'
import { ruleEngine } from './rule-engine'
import { prisma } from './prisma'
import { EventEmitter } from 'events'

/**
 * Event Bus for real-time mission processing
 * Handles event emission, subscription, and processing
 */
export class EventBus extends EventEmitter implements IEventBus {
  private static instance: EventBus
  private eventQueue: MissionEvent[] = []
  private processing = false
  private batchSize = 10
  private processingInterval = 1000 // 1 second

  constructor() {
    super()
    this.setMaxListeners(100) // Allow many subscribers
    this.startProcessing()
  }

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus()
    }
    return EventBus.instance
  }

  /**
   * Emit a mission event for processing
   */
  async emitMissionEvent(event: MissionEvent): Promise<void> {
    try {
      // Validate event
      if (!this.validateEvent(event)) {
        console.error('Invalid event:', event)
        return
      }

      // Store event for persistence (optional)
      await this.storeEvent(event)

      // Add to processing queue
      this.eventQueue.push(event)

      // Emit to subscribers
      super.emit(event.type, event)
      super.emit('*', event) // Wildcard subscription

      console.log(`Event emitted: ${event.type} for user ${event.userId}`)
    } catch (error) {
      console.error('Error emitting event:', error)
    }
  }

  /**
   * Subscribe to specific event type
   */
  subscribe(eventType: EventType, callback: (event: MissionEvent) => Promise<void>): void {
    this.on(eventType, callback)
  }

  /**
   * Subscribe to all events
   */
  subscribeAll(callback: (event: MissionEvent) => Promise<void>): void {
    this.on('*', callback)
  }

  /**
   * Unsubscribe from event type
   */
  unsubscribe(eventType: EventType, callback: Function): void {
    this.off(eventType, callback as (...args: any[]) => void)
  }

  /**
   * Get event history for a user
   */
  async getEventHistory(userId: string, limit: number = 100): Promise<MissionEvent[]> {
    try {
      const events = await prisma.event.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit
      })

      return events.map(event => ({
        id: event.id,
        userId: event.userId,
        type: event.type as EventType,
        timestamp: event.createdAt,
        data: JSON.parse(event.data),
        sessionId: undefined,
        deviceType: undefined,
        source: undefined
      }))
    } catch (error) {
      console.error('Error getting event history:', error)
      return []
    }
  }

  /**
   * Process events in batches
   */
  private async processEventQueue(): Promise<void> {
    if (this.processing || this.eventQueue.length === 0) {
      return
    }

    this.processing = true

    try {
      // Process events in batches
      const batch = this.eventQueue.splice(0, this.batchSize)
      const updates: ProgressUpdate[] = []

      for (const event of batch) {
        try {
          const eventUpdates = await ruleEngine.processEvent(event)
          updates.push(...eventUpdates)
        } catch (error) {
          console.error(`Error processing event ${event.id}:`, error)
        }
      }

      // Handle progress updates
      await this.handleProgressUpdates(updates)

      console.log(`Processed ${batch.length} events, ${updates.length} updates`)
    } catch (error) {
      console.error('Error processing event queue:', error)
    } finally {
      this.processing = false
    }
  }

  /**
   * Handle progress updates from rule engine
   */
  private async handleProgressUpdates(updates: ProgressUpdate[]): Promise<void> {
    for (const update of updates) {
      try {
        // Emit progress update event
        this.emit('progress_updated', {
          id: `progress_${Date.now()}`,
          userId: update.userId,
          type: 'achievement_unlocked',
          timestamp: new Date(),
          data: {
            missionId: update.missionId,
            progress: update.progress,
            completed: update.completed,
            delta: update.delta
          }
        })

        // If mission completed, send notification
        if (update.completed) {
          await this.handleMissionCompletion(update)
        }

        // Update analytics
        await this.updateAnalytics(update)

      } catch (error) {
        console.error('Error handling progress update:', error)
      }
    }
  }

  /**
   * Handle mission completion
   */
  private async handleMissionCompletion(update: ProgressUpdate): Promise<void> {
    try {
      // Get mission details
      const mission = await prisma.mission.findUnique({
        where: { id: update.missionId },
        include: { program: true }
      })

      if (!mission) return

      // Create notification
      await prisma.notification.create({
        data: {
          userId: update.userId,
          type: 'MISSION_COMPLETE',
          title: 'Mission Completed!',
          message: `You completed "${mission.title}" and earned ${mission.reward} coins!`,
          data: JSON.stringify({
            missionId: mission.id,
            reward: mission.reward,
            xpReward: mission.xpReward
          }),
          isRead: false
        }
      })

      // Award rewards
      await this.awardMissionRewards(update.userId, mission)

      console.log(`Mission ${mission.title} completed by user ${update.userId}`)

    } catch (error) {
      console.error('Error handling mission completion:', error)
    }
  }

  /**
   * Award rewards for completed mission
   */
  private async awardMissionRewards(userId: string, mission: any): Promise<void> {
    try {
      // Create transaction for coin reward
      if (mission.reward > 0) {
        await prisma.transaction.create({
          data: {
            userId,
            programId: 'default',
            type: 'EARNED',
            amount: mission.reward,
            balance: mission.reward, // Would need to calculate actual balance
            description: `Mission reward: ${mission.title}`,
            metadata: JSON.stringify({
              missionId: mission.id,
              source: 'mission_completion'
            })
          }
        })
      }

      // Update user XP and coins
      const userProgram = await prisma.userProgram.findFirst({
        where: {
          userId,
          programId: mission.programId
        }
      })

      if (userProgram) {
        await prisma.userProgram.update({
          where: { id: userProgram.id },
          data: {
            // Note: Adjust these fields based on your actual UserProgram schema
            // totalXP: { increment: mission.xpReward },
            // totalCoins: { increment: mission.reward }
          }
        })
      }

    } catch (error) {
      console.error('Error awarding mission rewards:', error)
    }
  }

  /**
   * Update analytics for mission progress
   */
  private async updateAnalytics(update: ProgressUpdate): Promise<void> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Update or create analytics record
      // Note: Analytics tracking disabled due to schema mismatch
      // This would need to be implemented based on the actual Analytics model schema
      console.log(`Analytics update for mission progress: ${update.missionId}, completed: ${update.completed}`)

    } catch (error) {
      console.error('Error updating analytics:', error)
    }
  }

  /**
   * Store event for persistence and history
   */
  private async storeEvent(event: MissionEvent): Promise<void> {
    try {
      await prisma.event.create({
        data: {
          id: event.id,
          userId: event.userId,
          programId: 'default',
          type: event.type,
          data: JSON.stringify(event.data),
          processed: false,
          createdAt: event.timestamp
        }
      })
    } catch (error) {
      console.error('Error storing event:', error)
    }
  }

  /**
   * Validate event structure
   */
  private validateEvent(event: MissionEvent): boolean {
    return !!(
      event.id &&
      event.userId &&
      event.type &&
      event.timestamp &&
      event.data &&
      typeof event.data === 'object'
    )
  }

  /**
   * Start processing queue in intervals
   */
  private startProcessing(): void {
    setInterval(() => {
      this.processEventQueue()
    }, this.processingInterval)
  }

  /**
   * Get queue status for monitoring
   */
  getQueueStatus(): {
    queueLength: number
    processing: boolean
    subscriberCount: number
  } {
    return {
      queueLength: this.eventQueue.length,
      processing: this.processing,
      subscriberCount: this.listenerCount('*')
    }
  }
}

/**
 * Singleton event bus instance
 */
export const eventBus = EventBus.getInstance()

/**
 * Helper functions for common events
 */
export class MissionEventHelpers {
  
  static async userLogin(userId: string, data: {
    device?: string
    source?: string
    sessionId?: string
  } = {}): Promise<void> {
    await eventBus.emitMissionEvent({
      id: `login_${userId}_${Date.now()}`,
      userId,
      type: 'user_login',
      timestamp: new Date(),
      data: {
        device: data.device || 'unknown',
        source: data.source || 'web',
        ...data
      },
      sessionId: data.sessionId,
      deviceType: data.device
    })
  }

  static async betPlaced(userId: string, data: {
    amount: number
    sport?: string
    category?: string
    odds?: number
    market?: string
    sessionId?: string
  }): Promise<void> {
    await eventBus.emitMissionEvent({
      id: `bet_${userId}_${Date.now()}`,
      userId,
      type: 'bet_placed',
      timestamp: new Date(),
      data,
      sessionId: data.sessionId
    })
  }

  static async depositMade(userId: string, data: {
    amount: number
    method: string
    currency?: string
    sessionId?: string
  }): Promise<void> {
    await eventBus.emitMissionEvent({
      id: `deposit_${userId}_${Date.now()}`,
      userId,
      type: 'deposit_made',
      timestamp: new Date(),
      data,
      sessionId: data.sessionId
    })
  }

  static async gamePlayed(userId: string, data: {
    game_id: string
    game_type: string
    bet_amount?: number
    win_amount?: number
    sessionId?: string
  }): Promise<void> {
    await eventBus.emitMissionEvent({
      id: `game_${userId}_${Date.now()}`,
      userId,
      type: 'game_played',
      timestamp: new Date(),
      data,
      sessionId: data.sessionId
    })
  }

  static async profileCompleted(userId: string, data: {
    completion_percentage: number
    fields_completed?: string[]
  }): Promise<void> {
    await eventBus.emitMissionEvent({
      id: `profile_${userId}_${Date.now()}`,
      userId,
      type: 'profile_completed',
      timestamp: new Date(),
      data
    })
  }

  static async kycVerified(userId: string, data: {
    verification_level: string
    documents_provided?: string[]
  }): Promise<void> {
    await eventBus.emitMissionEvent({
      id: `kyc_${userId}_${Date.now()}`,
      userId,
      type: 'kyc_verified',
      timestamp: new Date(),
      data
    })
  }

  static async friendReferred(userId: string, data: {
    referred_user_id: string
    referral_code?: string
  }): Promise<void> {
    await eventBus.emitMissionEvent({
      id: `referral_${userId}_${Date.now()}`,
      userId,
      type: 'friend_referred',
      timestamp: new Date(),
      data
    })
  }

  static async bonusClaimed(userId: string, data: {
    bonus_type: string
    bonus_amount: number
  }): Promise<void> {
    await eventBus.emitMissionEvent({
      id: `bonus_${userId}_${Date.now()}`,
      userId,
      type: 'bonus_claimed',
      timestamp: new Date(),
      data
    })
  }

  static async customEvent(userId: string, eventName: string, data: Record<string, any>): Promise<void> {
    await eventBus.emitMissionEvent({
      id: `custom_${eventName}_${userId}_${Date.now()}`,
      userId,
      type: 'custom_event',
      timestamp: new Date(),
      data: {
        event_name: eventName,
        ...data
      }
    })
  }
}

// Initialize event bus with basic subscribers
eventBus.subscribeAll(async (event) => {
  console.log(`[EventBus] Received: ${event.type} from ${event.userId}`)
})

console.log('Event Bus initialized')