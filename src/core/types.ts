// Core types for modular mission system
// These are agnostic base types that can be extended by modules

import React from 'react'

// Base mission rule structure (unified architecture)
export interface BaseMissionRule {
  triggers: BaseTrigger[]  // EVENT FILTERS: amount, sport, method, etc. - MOST IMPORTANT
  logic: 'AND' | 'OR'      // Logic between multiple triggers
  timeWindow?: TimeWindow  // When mission can be completed
  cooldown?: number        // Time between completions
  maxClaims?: number       // Max times can be completed
  businessRules?: BaseCondition[]  // BUSINESS RULES: user_tier, account_age, kyc_verified - RARELY USED
  metadata?: Record<string, any>

  // Deprecated - keeping for backward compatibility only
  conditions?: BaseCondition[]
  conditionTree?: ConditionGroup
  prerequisites?: string[]
  excludeIf?: BaseCondition[]
}

// Advanced condition grouping for complex logic
export interface ConditionGroup {
  type: 'AND' | 'OR'
  conditions: (BaseCondition | ConditionGroup)[]
  label?: string  // Optional label for UI display
}

// Base trigger - THIS IS WHERE MOST FILTERING HAPPENS
export interface BaseTrigger {
  event: string  // Which event to monitor (e.g., 'sportsbook_bet_placed')
  filters?: EventFilter[]  // EVENT CONDITIONS: amount >= 100, sport in ['futebol', 'basquete'], etc.
  debounce?: number        // Anti-spam delay in milliseconds
  label?: string           // Display name for UI
  aggregation?: AggregationType  // How to aggregate: sum, count, max, etc.
  required?: boolean       // For multi-trigger missions: is this trigger mandatory?

  // Deprecated - use filters instead
  conditions?: BaseCondition[]
}

// Base condition (can be extended by modules)
export interface BaseCondition {
  field: string
  operator: Operator
  value: any
  aggregation?: AggregationType
  timeWindow?: TimeWindow
  weight?: number
}

// Time window configuration
export interface TimeWindow {
  duration: string
  sliding?: boolean
  timezone?: string
  resetTime?: string
}

// Event filtering
export interface EventFilter {
  field: string
  operator: Operator
  value: any
  caseSensitive?: boolean
}

// Core operators (can be extended by modules)
export type Operator = 
  | '==' | '!=' | '>' | '>=' | '<' | '<='
  | 'in' | 'not_in' | 'contains' | 'not_contains'
  | 'between' | 'exists' | 'not_exists'
  | 'regex' | 'unique_count' | 'streak_count'

// Core aggregation types (can be extended by modules)
export type AggregationType = 
  | 'sum' | 'count' | 'max' | 'min' | 'avg'
  | 'unique_count' | 'streak_count' | 'first' | 'last'

// Field definition for UI building
export interface FieldDefinition {
  name: string
  label: string
  type: FieldType
  required: boolean
  options?: FieldOption[]
  validation?: FieldValidation
  helper?: string
  placeholder?: string
  dependsOn?: string  // Field dependency
  showWhen?: Record<string, any>  // Conditional display
}

export interface FieldOption {
  value: string | number
  label: string
  helper?: string
  icon?: string
}

export interface FieldValidation {
  min?: number
  max?: number
  pattern?: string
  custom?: (value: any) => boolean | string
}

export type FieldType = 
  | 'string' | 'number' | 'boolean' | 'array' | 'date' 
  | 'enum' | 'multi_select' | 'range' | 'currency'

// Event type definition for modules
export interface EventTypeDefinition {
  key: string
  label: string
  description: string
  icon: string
  category: string
  fields: FieldDefinition[]
  examples?: EventExample[]
  tags?: string[]
}

export interface EventExample {
  title: string
  description: string
  data: Record<string, any>
}

// Mission template (module-specific)
export interface MissionTemplate {
  id: string
  name: string
  description: string
  category: string
  module: string  // Which module this belongs to
  vertical: string
  rule: BaseMissionRule
  defaultReward: number
  defaultXP: number
  tags: string[]
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  estimatedTime?: string
  popularity?: number
  examples?: MissionExample[]
}

export interface MissionExample {
  title: string
  scenario: string
  expectedOutcome: string
}

// Module definition (each vertical implements this)
export interface ModuleDefinition {
  name: string
  label: string
  description: string
  icon: string
  version: string
  eventTypes: EventTypeDefinition[]
  templates: MissionTemplate[]
  validators: ModuleValidator[]
  components: ModuleComponents
  translations: ModuleTranslations
  settings?: ModuleSettings
}

// Module-specific validators
export interface ModuleValidator {
  name: string
  validate: (rule: BaseMissionRule) => ValidationResult
  description: string
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions?: string[]
}

// Module-specific React components
export interface ModuleComponents {
  RuleBuilder?: React.ComponentType<any>
  TemplateSelector?: React.ComponentType<any>
  FieldRenderer?: React.ComponentType<any>
  EventPreview?: React.ComponentType<any>
  MissionCard?: React.ComponentType<any>
}

// Module translations
export interface ModuleTranslations {
  [locale: string]: {
    [key: string]: string
  }
}

// Module settings/configuration
export interface ModuleSettings {
  defaultCurrency?: string
  timezone?: string
  dateFormat?: string
  customFields?: FieldDefinition[]
  features?: ModuleFeature[]
}

export interface ModuleFeature {
  key: string
  label: string
  enabled: boolean
  description?: string
}

// Event data structure for processing
export interface MissionEvent {
  id: string
  userId: string
  type: string  // Module-specific event type
  timestamp: Date
  data: Record<string, any>
  sessionId?: string
  deviceType?: string
  source?: string
  module: string  // Which module generated this event
}

// Progress tracking
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
  module: string
}

// Progress update result
export interface ProgressUpdate {
  missionId: string
  userId: string
  previousValue: number
  newValue: number
  progress: number  // 0-1
  completed: boolean
  delta: number
  event: MissionEvent
  module: string
}

// Module registry interface
export interface ModuleRegistry {
  register(module: ModuleDefinition): void
  unregister(moduleName: string): void
  getModule(name: string): ModuleDefinition | null
  getAllModules(): ModuleDefinition[]
  getModulesByCategory(category: string): ModuleDefinition[]
  isModuleRegistered(name: string): boolean
}

// Core rule engine interface (agnostic)
export interface CoreRuleEngine {
  validateRule(rule: BaseMissionRule, module?: string): Promise<ValidationResult>
  processEvent(event: MissionEvent): Promise<ProgressUpdate[]>
  checkMissionCompletion(missionId: string, userId: string): Promise<boolean>
  getMissionProgress(missionId: string, userId: string): Promise<MissionProgress | null>
  resetMissionProgress(missionId: string, userId: string): Promise<void>
}

// Core event bus interface (agnostic)
export interface CoreEventBus {
  emit(event: MissionEvent): Promise<void>
  subscribe(eventType: string, callback: (event: MissionEvent) => Promise<void>, module?: string): void
  unsubscribe(eventType: string, callback: Function, module?: string): void
  getEventHistory(userId: string, module?: string, limit?: number): Promise<MissionEvent[]>
  getQueueStatus(module?: string): QueueStatus
}

export interface QueueStatus {
  queueLength: number
  processing: boolean
  subscriberCount: number
  module?: string
}

// Localization support
export type Locale = 'pt-BR' | 'en-US' | 'es-ES'

export interface LocalizedString {
  [locale: string]: string
}

// Category definitions (can be extended by modules)
export interface Category {
  key: string
  name: LocalizedString
  description: LocalizedString
  icon: string
  color: string
  order: number
}

// Common categories that modules can use
export const COMMON_CATEGORIES: Record<string, Category> = {
  ONBOARDING: {
    key: 'ONBOARDING',
    name: { 'pt-BR': 'Integração', 'en-US': 'Onboarding' },
    description: { 'pt-BR': 'Ajudar novos usuários', 'en-US': 'Help new users' },
    icon: '🚀',
    color: '#10b981',
    order: 1
  },
  ENGAGEMENT: {
    key: 'ENGAGEMENT',
    name: { 'pt-BR': 'Engajamento', 'en-US': 'Engagement' },
    description: { 'pt-BR': 'Manter usuários ativos', 'en-US': 'Keep users active' },
    icon: '💚',
    color: '#3b82f6',
    order: 2
  },
  SPENDING: {
    key: 'SPENDING',
    name: { 'pt-BR': 'Gastos', 'en-US': 'Spending' },
    description: { 'pt-BR': 'Incentivar gastos', 'en-US': 'Encourage spending' },
    icon: '💰',
    color: '#f59e0b',
    order: 3
  },
  SOCIAL: {
    key: 'SOCIAL',
    name: { 'pt-BR': 'Social', 'en-US': 'Social' },
    description: { 'pt-BR': 'Construir comunidade', 'en-US': 'Build community' },
    icon: '👥',
    color: '#ef4444',
    order: 4
  },
  ACHIEVEMENT: {
    key: 'ACHIEVEMENT',
    name: { 'pt-BR': 'Conquistas', 'en-US': 'Achievement' },
    description: { 'pt-BR': 'Recompensar realizações', 'en-US': 'Reward accomplishments' },
    icon: '🏆',
    color: '#f97316',
    order: 5
  }
}

// Error types for better error handling
export class ModuleError extends Error {
  constructor(
    message: string,
    public module: string,
    public code?: string
  ) {
    super(message)
    this.name = 'ModuleError'
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value: any
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}