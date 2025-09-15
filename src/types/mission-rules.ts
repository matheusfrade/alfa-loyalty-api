// Advanced Mission Rules System
// Supports complex triggers, conditions, and validation logic

// Core rule types
export type EventType = 
  | 'user_login'
  | 'bet_placed' 
  | 'deposit_made'
  | 'game_played'
  | 'withdrawal_requested'
  | 'profile_completed'
  | 'kyc_verified'
  | 'friend_referred'
  | 'bonus_claimed'
  | 'tournament_joined'
  | 'achievement_unlocked'
  | 'streak_broken'
  | 'level_up'
  | 'custom_event'

export type Operator = 
  | '==' | '!=' | '>' | '>=' | '<' | '<='
  | 'in' | 'not_in' | 'contains' | 'not_contains'
  | 'between' | 'exists' | 'not_exists'
  | 'regex' | 'unique_count' | 'streak_count'

export type AggregationType = 
  | 'sum' | 'count' | 'max' | 'min' | 'avg'
  | 'unique_count' | 'streak_count' | 'first' | 'last'

export type LogicOperator = 'AND' | 'OR' | 'NOT'

// Time window configuration
export interface TimeWindow {
  duration: string  // '1h', '1d', '7d', '30d', '1y'
  sliding?: boolean  // true = sliding window, false = fixed period
  timezone?: string  // 'UTC', 'America/Sao_Paulo', etc
  resetTime?: string // '00:00' for daily reset time
}

// Event filtering
export interface EventFilter {
  field: string     // 'category', 'amount', 'sport', 'game_id', etc
  operator: Operator
  value: any
  caseSensitive?: boolean
}

// Mission trigger definition
export interface MissionTrigger {
  event: EventType
  filters?: EventFilter[]
  debounce?: number  // milliseconds to prevent rapid-fire events
}

// Mission condition that must be met
export interface MissionCondition {
  field: string           // Field to evaluate from event data
  operator: Operator      // How to compare
  value: any             // Target value
  aggregation?: AggregationType  // How to aggregate multiple events
  timeWindow?: TimeWindow        // Time window for aggregation
  weight?: number                // Weight for scoring systems
}

// Main mission rule structure
export interface MissionRule {
  id?: string
  triggers: MissionTrigger[]
  conditions: MissionCondition[]
  logic?: LogicOperator          // How to combine conditions (default: AND)
  timeWindow?: TimeWindow        // Global time window
  cooldown?: number             // Seconds between completions
  maxClaims?: number            // Max times this can be completed
  prerequisites?: string[]       // Mission IDs that must be completed first
  excludeIf?: MissionCondition[] // Conditions that prevent completion
  metadata?: Record<string, any> // Additional rule data
}

// Progress tracking for a user
export interface MissionProgress {
  missionId: string
  userId: string
  currentValue: number
  targetValue: number
  completedAt?: Date
  claimCount: number
  streakCount?: number
  lastEventAt?: Date
  metadata?: Record<string, any>
}

// Event data structure for processing
export interface MissionEvent {
  id: string
  userId: string
  type: EventType
  timestamp: Date
  data: Record<string, any>
  sessionId?: string
  deviceType?: string
  source?: string
}

// Pre-built rule templates
export interface MissionTemplate {
  id: string
  name: string
  description: string
  category: string
  vertical: 'GAMING' | 'ECOMMERCE' | 'RETAIL' | 'SAAS' | 'EDUCATION'
  rule: Omit<MissionRule, 'id'>
  defaultReward: number
  defaultXP: number
  tags: string[]
}

// Validation result for rules
export interface RuleValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  estimatedComplexity: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH'
}

// Real-time progress update
export interface ProgressUpdate {
  missionId: string
  userId: string
  previousValue: number
  newValue: number
  progress: number  // 0-1
  completed: boolean
  delta: number
  event: MissionEvent
}

// Common rule builders (factory functions)
export interface RuleBuilder {
  // Simple rules
  dailyLogin(streak?: number): MissionRule
  firstDeposit(minAmount?: number): MissionRule
  betAmount(amount: number, timeWindow?: string): MissionRule
  
  // Complex rules
  multiSport(sports: string[], timeWindow?: string): MissionRule
  highMultiplier(multiplier: number): MissionRule
  socialChallenge(friendCount: number): MissionRule
  
  // Composite rules
  combine(rules: MissionRule[], logic: LogicOperator): MissionRule
  withCooldown(rule: MissionRule, seconds: number): MissionRule
  withTimeWindow(rule: MissionRule, window: TimeWindow): MissionRule
}

// Runtime engine interfaces
export interface RuleEngine {
  validateRule(rule: MissionRule): Promise<RuleValidationResult>
  processEvent(event: MissionEvent): Promise<ProgressUpdate[]>
  checkMissionCompletion(missionId: string, userId: string): Promise<boolean>
  getMissionProgress(missionId: string, userId: string): Promise<MissionProgress | null>
  resetMissionProgress(missionId: string, userId: string): Promise<void>
}

// Event bus for real-time processing
export interface EventBus {
  emitMissionEvent(event: MissionEvent): Promise<void>
  subscribe(eventType: EventType, callback: (event: MissionEvent) => Promise<void>): void
  unsubscribe(eventType: EventType, callback: Function): void
  getEventHistory(userId: string, limit?: number): Promise<MissionEvent[]>
}

// Pre-defined rule templates
export const RULE_TEMPLATES: Record<string, MissionTemplate> = {
  DAILY_LOGIN_STREAK: {
    id: 'daily_login_streak',
    name: 'Daily Login Streak',
    description: 'Login consecutively for X days',
    category: 'ENGAGEMENT',
    vertical: 'GAMING',
    rule: {
      triggers: [{
        event: 'user_login'
      }],
      conditions: [{
        field: 'consecutive_days',
        operator: 'streak_count',
        value: 7
      }],
      timeWindow: {
        duration: '1d',
        sliding: false,
        resetTime: '00:00'
      }
    },
    defaultReward: 50,
    defaultXP: 25,
    tags: ['daily', 'engagement', 'streak']
  },
  
  HIGH_ROLLER_WEEKLY: {
    id: 'high_roller_weekly',
    name: 'High Roller Weekly',
    description: 'Bet over $X in a week',
    category: 'SPENDING',
    vertical: 'GAMING',
    rule: {
      triggers: [{
        event: 'bet_placed',
        filters: [{
          field: 'category',
          operator: '==',
          value: 'sports'
        }]
      }],
      conditions: [{
        field: 'amount',
        operator: '>=',
        value: 1000,
        aggregation: 'sum'
      }],
      timeWindow: {
        duration: '7d',
        sliding: true
      }
    },
    defaultReward: 200,
    defaultXP: 100,
    tags: ['weekly', 'high-value', 'sports']
  },

  MULTI_SPORT_EXPLORER: {
    id: 'multi_sport_explorer', 
    name: 'Multi-Sport Explorer',
    description: 'Bet on X different sports',
    category: 'VARIETY',
    vertical: 'GAMING',
    rule: {
      triggers: [{
        event: 'bet_placed',
        filters: [{
          field: 'sport',
          operator: 'in',
          value: ['futebol', 'basquete', 'tenis', 'volei', 'futebol_americano']
        }]
      }],
      conditions: [{
        field: 'sport',
        operator: 'unique_count',
        value: 3
      }],
      timeWindow: {
        duration: '30d',
        sliding: true
      }
    },
    defaultReward: 150,
    defaultXP: 75,
    tags: ['variety', 'sports', 'exploration']
  }
}

// Helper types for frontend
export type RuleFieldType = 'string' | 'number' | 'boolean' | 'array' | 'date' | 'enum'

export interface RuleFieldDefinition {
  name: string
  type: RuleFieldType
  required: boolean
  options?: any[]  // For enum types
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
}

// Available fields per event type for UI building
export const EVENT_FIELDS: Record<EventType, RuleFieldDefinition[]> = {
  bet_placed: [
    { name: 'amount', type: 'number', required: true },
    { name: 'sport', type: 'enum', required: true, options: ['futebol', 'basquete', 'tenis', 'volei'] },
    { name: 'category', type: 'enum', required: true, options: ['sports', 'casino', 'live'] },
    { name: 'odds', type: 'number', required: false },
    { name: 'market', type: 'string', required: false },
  ],
  deposit_made: [
    { name: 'amount', type: 'number', required: true },
    { name: 'method', type: 'enum', required: true, options: ['pix', 'card', 'bank_transfer'] },
    { name: 'currency', type: 'string', required: false },
  ],
  user_login: [
    { name: 'device', type: 'enum', required: false, options: ['mobile', 'desktop', 'tablet'] },
    { name: 'source', type: 'string', required: false },
    { name: 'consecutive_days', type: 'number', required: false },
  ],
  game_played: [
    { name: 'game_id', type: 'string', required: true },
    { name: 'game_type', type: 'enum', required: true, options: ['slot', 'table', 'live'] },
    { name: 'bet_amount', type: 'number', required: false },
    { name: 'win_amount', type: 'number', required: false },
  ],
  profile_completed: [
    { name: 'completion_percentage', type: 'number', required: true },
    { name: 'fields_completed', type: 'array', required: false },
  ],
  kyc_verified: [
    { name: 'verification_level', type: 'enum', required: true, options: ['basic', 'enhanced', 'full'] },
    { name: 'documents_provided', type: 'array', required: false },
  ],
  friend_referred: [
    { name: 'referred_user_id', type: 'string', required: true },
    { name: 'referral_code', type: 'string', required: false },
  ],
  bonus_claimed: [
    { name: 'bonus_type', type: 'enum', required: true, options: ['welcome', 'deposit', 'free_spins', 'cashback'] },
    { name: 'bonus_amount', type: 'number', required: true },
  ],
  withdrawal_requested: [
    { name: 'amount', type: 'number', required: true },
    { name: 'method', type: 'enum', required: true, options: ['pix', 'bank_transfer'] },
  ],
  tournament_joined: [
    { name: 'tournament_id', type: 'string', required: true },
    { name: 'entry_fee', type: 'number', required: false },
  ],
  achievement_unlocked: [
    { name: 'achievement_id', type: 'string', required: true },
    { name: 'points_earned', type: 'number', required: false },
  ],
  streak_broken: [
    { name: 'streak_type', type: 'string', required: true },
    { name: 'streak_length', type: 'number', required: true },
  ],
  level_up: [
    { name: 'old_level', type: 'number', required: true },
    { name: 'new_level', type: 'number', required: true },
    { name: 'xp_earned', type: 'number', required: false },
  ],
  custom_event: [
    { name: 'event_name', type: 'string', required: true },
    { name: 'event_data', type: 'string', required: false },
  ]
}