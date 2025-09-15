import { 
  MissionRule, 
  MissionEvent, 
  MissionProgress, 
  ProgressUpdate,
  RuleValidationResult,
  MissionCondition,
  Operator,
  AggregationType,
  TimeWindow,
  RuleEngine as IRuleEngine
} from '@/types/mission-rules'
import { prisma } from './prisma'

export class RuleEngine implements IRuleEngine {
  
  /**
   * Validates a mission rule for correctness and performance
   */
  async validateRule(rule: MissionRule): Promise<RuleValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []
    let complexity: RuleValidationResult['estimatedComplexity'] = 'LOW'

    // Basic structure validation
    if (!rule.triggers || rule.triggers.length === 0) {
      errors.push('At least one trigger is required')
    }

    if (!rule.conditions || rule.conditions.length === 0) {
      errors.push('At least one condition is required')
    }

    // Validate triggers
    for (const trigger of rule.triggers || []) {
      if (!trigger.event) {
        errors.push('Trigger event type is required')
      }

      // Validate filters
      for (const filter of trigger.filters || []) {
        if (!filter.field || !filter.operator || filter.value === undefined) {
          errors.push('Filter must have field, operator, and value')
        }
      }
    }

    // Validate conditions
    for (const condition of rule.conditions || []) {
      if (!condition.field || !condition.operator || condition.value === undefined) {
        errors.push('Condition must have field, operator, and value')
      }

      // Check for performance concerns
      if (condition.aggregation && !condition.timeWindow) {
        warnings.push(`Condition "${condition.field}" uses aggregation without time window - may impact performance`)
        complexity = 'MEDIUM'
      }

      if (condition.aggregation === 'unique_count' || condition.aggregation === 'streak_count') {
        complexity = 'HIGH'
      }
    }

    // Time window validation
    if (rule.timeWindow && !this.isValidTimeWindow(rule.timeWindow)) {
      errors.push('Invalid time window format')
    }

    // Complexity assessment
    if (rule.conditions.length > 5 || rule.triggers.length > 3) {
      complexity = 'HIGH'
    }

    if (rule.conditions.some(c => c.aggregation === 'streak_count') && rule.conditions.length > 2) {
      complexity = 'VERY_HIGH'
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      estimatedComplexity: complexity
    }
  }

  /**
   * Process an incoming event and update mission progress
   */
  async processEvent(event: MissionEvent): Promise<ProgressUpdate[]> {
    const updates: ProgressUpdate[] = []

    try {
      // Find all active missions that could be triggered by this event
      const potentialMissions = await this.findTriggeredMissions(event)

      for (const mission of potentialMissions) {
        const progress = await this.checkAndUpdateProgress(mission, event)
        if (progress) {
          updates.push(progress)
        }
      }

      return updates
    } catch (error) {
      console.error('Error processing event:', error)
      return []
    }
  }

  /**
   * Check if a mission is completed for a user
   */
  async checkMissionCompletion(missionId: string, userId: string): Promise<boolean> {
    try {
      const mission = await prisma.mission.findUnique({
        where: { id: missionId }
      })

      if (!mission || !mission.isActive) {
        return false
      }

      const rule: MissionRule = JSON.parse(mission.requirement)
      const progress = await this.getMissionProgress(missionId, userId)

      if (!progress) {
        return false
      }

      return this.evaluateCompletion(rule, progress)
    } catch (error) {
      console.error('Error checking mission completion:', error)
      return false
    }
  }

  /**
   * Get current progress for a mission/user combination
   */
  async getMissionProgress(missionId: string, userId: string): Promise<MissionProgress | null> {
    try {
      const userMission = await prisma.userMission.findUnique({
        where: {
          userId_missionId: {
            userId,
            missionId
          }
        }
      })

      if (!userMission) {
        return null
      }

      return {
        missionId,
        userId,
        currentValue: userMission.progress,
        targetValue: 100, // Default target value, would come from mission definition
        completedAt: userMission.completedAt || undefined,
        claimCount: userMission.claimCount,
        streakCount: 0, // Streak count would be calculated separately
        lastEventAt: undefined, // Would track last relevant event timestamp
        metadata: userMission.metadata ? JSON.parse(userMission.metadata) : undefined
      }
    } catch (error) {
      console.error('Error getting mission progress:', error)
      return null
    }
  }

  /**
   * Reset mission progress for a user
   */
  async resetMissionProgress(missionId: string, userId: string): Promise<void> {
    try {
      await prisma.userMission.deleteMany({
        where: {
          userId,
          missionId
        }
      })
    } catch (error) {
      console.error('Error resetting mission progress:', error)
    }
  }

  // Private helper methods

  private async findTriggeredMissions(event: MissionEvent) {
    // Find missions that have triggers matching this event
    const missions = await prisma.mission.findMany({
      where: {
        isActive: true
      }
    })

    return missions.filter(mission => {
      try {
        const rule: MissionRule = JSON.parse(mission.requirement)
        return this.isEventTriggered(rule, event)
      } catch {
        return false
      }
    })
  }

  private isEventTriggered(rule: MissionRule, event: MissionEvent): boolean {
    return rule.triggers.some(trigger => {
      if (trigger.event !== event.type) {
        return false
      }

      // Check filters
      if (trigger.filters) {
        return trigger.filters.every(filter => 
          this.evaluateCondition(filter.field, filter.operator, filter.value, event.data)
        )
      }

      return true
    })
  }

  private async checkAndUpdateProgress(
    mission: any, 
    event: MissionEvent
  ): Promise<ProgressUpdate | null> {
    try {
      const rule: MissionRule = JSON.parse(mission.requirement)
      
      // Get or create user mission progress
      let userMission = await prisma.userMission.findUnique({
        where: {
          userId_missionId: {
            userId: event.userId,
            missionId: mission.id
          }
        }
      })

      if (!userMission) {
        // Create initial progress
        userMission = await prisma.userMission.create({
          data: {
            userId: event.userId,
            missionId: mission.id,
            status: 'ACTIVE',
            progress: 0,
            // targetValue field removed - not in UserMission schema
            claimCount: 0,
            startedAt: new Date(),
            metadata: JSON.stringify({})
          }
        })
      }

      const previousValue = userMission.progress
      const newValue = await this.calculateNewProgress(rule, userMission, event)

      if (newValue !== previousValue) {
        // Update progress
        await prisma.userMission.update({
          where: { id: userMission.id },
          data: {
            progress: newValue,
            // lastEventAt field removed - not in UserMission schema
            ...(newValue >= 100 && { // Hardcoded target for now
              status: 'COMPLETED',
              completedAt: new Date()
            })
          }
        })

        const progress = newValue / 100 // Hardcoded target for now
        const completed = progress >= 1

        return {
          missionId: mission.id,
          userId: event.userId,
          previousValue,
          newValue,
          progress: Math.min(progress, 1),
          completed,
          delta: newValue - previousValue,
          event
        }
      }

      return null
    } catch (error) {
      console.error('Error updating progress:', error)
      return null
    }
  }

  private calculateTargetValue(rule: MissionRule): number {
    // For simple cases, get the target from the first condition
    const primaryCondition = rule.conditions[0]
    if (primaryCondition && typeof primaryCondition.value === 'number') {
      return primaryCondition.value
    }
    return 1 // Default target
  }

  private async calculateNewProgress(
    rule: MissionRule, 
    userMission: any, 
    event: MissionEvent
  ): Promise<number> {
    let newProgress = userMission.progress

    for (const condition of rule.conditions) {
      const conditionValue = await this.evaluateConditionProgress(
        condition, 
        userMission, 
        event
      )

      // For now, use simple addition - can be enhanced for complex logic
      if (condition.aggregation === 'sum') {
        const eventValue = this.extractFieldValue(condition.field, event.data) || 0
        newProgress += Number(eventValue)
      } else if (condition.aggregation === 'count') {
        newProgress += 1
      } else if (condition.aggregation === 'unique_count') {
        // This would need more complex tracking - simplified for now
        newProgress = await this.calculateUniqueCount(condition, userMission.userId, event)
      } else if (condition.aggregation === 'streak_count') {
        newProgress = await this.calculateStreakCount(condition, userMission.userId, event)
      } else {
        // Direct value assignment
        const eventValue = this.extractFieldValue(condition.field, event.data) || 0
        newProgress = Math.max(newProgress, Number(eventValue))
      }
    }

    return newProgress
  }

  private async evaluateConditionProgress(
    condition: MissionCondition,
    userMission: any,
    event: MissionEvent
  ): Promise<number> {
    // This is a simplified version - real implementation would be more complex
    const eventValue = this.extractFieldValue(condition.field, event.data)
    return Number(eventValue) || 0
  }

  private async calculateUniqueCount(
    condition: MissionCondition,
    userId: string,
    event: MissionEvent
  ): Promise<number> {
    // Simplified - would need to track unique values in metadata or separate table
    const eventValue = this.extractFieldValue(condition.field, event.data)
    
    // For now, just increment if we have a value
    return eventValue ? 1 : 0
  }

  private async calculateStreakCount(
    condition: MissionCondition,
    userId: string,
    event: MissionEvent
  ): Promise<number> {
    // Simplified streak calculation
    // Real implementation would track consecutive occurrences
    return 1
  }

  private evaluateCompletion(rule: MissionRule, progress: MissionProgress): boolean {
    return progress.currentValue >= progress.targetValue
  }

  private evaluateCondition(
    field: string, 
    operator: Operator, 
    targetValue: any, 
    eventData: Record<string, any>
  ): boolean {
    const actualValue = this.extractFieldValue(field, eventData)

    switch (operator) {
      case '==':
        return actualValue == targetValue
      case '!=':
        return actualValue != targetValue
      case '>':
        return Number(actualValue) > Number(targetValue)
      case '>=':
        return Number(actualValue) >= Number(targetValue)
      case '<':
        return Number(actualValue) < Number(targetValue)
      case '<=':
        return Number(actualValue) <= Number(targetValue)
      case 'in':
        return Array.isArray(targetValue) && targetValue.includes(actualValue)
      case 'not_in':
        return Array.isArray(targetValue) && !targetValue.includes(actualValue)
      case 'contains':
        return String(actualValue).includes(String(targetValue))
      case 'not_contains':
        return !String(actualValue).includes(String(targetValue))
      case 'between':
        if (Array.isArray(targetValue) && targetValue.length === 2) {
          const num = Number(actualValue)
          return num >= Number(targetValue[0]) && num <= Number(targetValue[1])
        }
        return false
      case 'exists':
        return actualValue !== undefined && actualValue !== null
      case 'not_exists':
        return actualValue === undefined || actualValue === null
      case 'regex':
        try {
          const regex = new RegExp(String(targetValue))
          return regex.test(String(actualValue))
        } catch {
          return false
        }
      default:
        return false
    }
  }

  private extractFieldValue(field: string, data: Record<string, any>): any {
    // Support nested field access with dot notation
    const fields = field.split('.')
    let value = data

    for (const f of fields) {
      if (value && typeof value === 'object' && f in value) {
        value = value[f]
      } else {
        return undefined
      }
    }

    return value
  }

  private isValidTimeWindow(timeWindow: TimeWindow): boolean {
    // Basic validation of time window format
    const durationRegex = /^(\d+)(h|d|w|m|y)$/
    return durationRegex.test(timeWindow.duration)
  }

  /**
   * Get events within a time window for aggregation
   */
  private async getEventsInWindow(
    userId: string, 
    eventType: string, 
    timeWindow: TimeWindow
  ): Promise<MissionEvent[]> {
    // This would query a separate events table
    // For now, return empty array - would need to implement event storage
    return []
  }
}

// Singleton instance
export const ruleEngine = new RuleEngine()

// Rule builder helper functions
export class RuleBuilder {
  static dailyLogin(streak: number = 7): MissionRule {
    return {
      triggers: [{
        event: 'user_login'
      }],
      conditions: [{
        field: 'consecutive_days',
        operator: 'streak_count',
        value: streak
      }],
      timeWindow: {
        duration: '1d',
        sliding: false,
        resetTime: '00:00'
      }
    }
  }

  static firstDeposit(minAmount: number = 50): MissionRule {
    return {
      triggers: [{
        event: 'deposit_made'
      }],
      conditions: [{
        field: 'amount',
        operator: '>=',
        value: minAmount
      }, {
        field: 'count',
        operator: '==',
        value: 1,
        aggregation: 'count'
      }],
      maxClaims: 1
    }
  }

  static betAmount(amount: number, timeWindow: string = '7d'): MissionRule {
    return {
      triggers: [{
        event: 'bet_placed'
      }],
      conditions: [{
        field: 'amount',
        operator: '>=',
        value: amount,
        aggregation: 'sum'
      }],
      timeWindow: {
        duration: timeWindow,
        sliding: true
      }
    }
  }

  static multiSport(sports: string[], timeWindow: string = '30d'): MissionRule {
    return {
      triggers: [{
        event: 'bet_placed',
        filters: [{
          field: 'sport',
          operator: 'in',
          value: sports
        }]
      }],
      conditions: [{
        field: 'sport',
        operator: 'unique_count',
        value: sports.length,
        aggregation: 'unique_count'
      }],
      timeWindow: {
        duration: timeWindow,
        sliding: true
      }
    }
  }

  static highMultiplier(multiplier: number): MissionRule {
    return {
      triggers: [{
        event: 'bet_placed',
        filters: [{
          field: 'odds',
          operator: '>=',
          value: multiplier
        }]
      }],
      conditions: [{
        field: 'win_amount',
        operator: '>',
        value: 0
      }],
      maxClaims: 1
    }
  }

  static socialChallenge(friendCount: number): MissionRule {
    return {
      triggers: [{
        event: 'friend_referred'
      }],
      conditions: [{
        field: 'referred_user_id',
        operator: 'unique_count',
        value: friendCount,
        aggregation: 'unique_count'
      }],
      timeWindow: {
        duration: '30d',
        sliding: true
      }
    }
  }

  static combine(rules: MissionRule[], logic: 'AND' | 'OR' | 'NOT'): MissionRule {
    const combinedTriggers = rules.flatMap(r => r.triggers)
    const combinedConditions = rules.flatMap(r => r.conditions)

    return {
      triggers: combinedTriggers,
      conditions: combinedConditions,
      logic
    }
  }

  static withCooldown(rule: MissionRule, seconds: number): MissionRule {
    return {
      ...rule,
      cooldown: seconds
    }
  }

  static withTimeWindow(rule: MissionRule, window: TimeWindow): MissionRule {
    return {
      ...rule,
      timeWindow: window
    }
  }
}