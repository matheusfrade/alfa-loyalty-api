import { MissionTemplate, MissionRule, RuleBuilder } from '@/types/mission-rules'

/**
 * Pre-built mission templates for different verticals and use cases
 * These provide starting points for common gamification scenarios
 */

// Gaming vertical templates
export const GAMING_TEMPLATES: Record<string, MissionTemplate> = {
  DAILY_LOGIN_STREAK: {
    id: 'daily_login_streak',
    name: 'Daily Login Streak',
    description: 'Login consecutively for 7 days to earn rewards',
    category: 'ENGAGEMENT',
    vertical: 'GAMING',
    rule: {
      triggers: [{
        event: 'user_login'
      }],
      conditions: [{
        field: 'consecutive_days',
        operator: 'streak_count',
        value: 7,
        aggregation: 'streak_count'
      }],
      timeWindow: {
        duration: '1d',
        sliding: false,
        resetTime: '00:00'
      },
      cooldown: 86400 // 24 hours
    },
    defaultReward: 100,
    defaultXP: 50,
    tags: ['daily', 'engagement', 'streak', 'login']
  },

  FIRST_DEPOSIT_BONUS: {
    id: 'first_deposit_bonus',
    name: 'First Deposit Welcome',
    description: 'Make your first deposit of R$50 or more',
    category: 'ONBOARDING',
    vertical: 'GAMING',
    rule: {
      triggers: [{
        event: 'deposit_made'
      }],
      conditions: [{
        field: 'amount',
        operator: '>=',
        value: 50
      }, {
        field: 'deposit_count',
        operator: '==',
        value: 1,
        aggregation: 'count'
      }],
      maxClaims: 1
    },
    defaultReward: 500,
    defaultXP: 200,
    tags: ['onboarding', 'deposit', 'first-time', 'welcome']
  },

  HIGH_ROLLER_WEEKLY: {
    id: 'high_roller_weekly',
    name: 'High Roller Challenge',
    description: 'Bet R$1000+ in sports this week',
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
      },
      cooldown: 604800 // 7 days
    },
    defaultReward: 200,
    defaultXP: 100,
    tags: ['weekly', 'high-value', 'sports', 'challenge']
  },

  MULTI_SPORT_EXPLORER: {
    id: 'multi_sport_explorer',
    name: 'Multi-Sport Explorer',
    description: 'Place bets on 3 different sports in 30 days',
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
        value: 3,
        aggregation: 'unique_count'
      }],
      timeWindow: {
        duration: '30d',
        sliding: true
      }
    },
    defaultReward: 150,
    defaultXP: 75,
    tags: ['variety', 'sports', 'exploration', 'monthly']
  },

  SLOT_MACHINE_SPINS: {
    id: 'slot_machine_spins',
    name: '100 Slot Spins Challenge',
    description: 'Play 100 spins on slot machines',
    category: 'GAMING',
    vertical: 'GAMING',
    rule: {
      triggers: [{
        event: 'game_played',
        filters: [{
          field: 'game_type',
          operator: '==',
          value: 'slot'
        }]
      }],
      conditions: [{
        field: 'spin_count',
        operator: '>=',
        value: 100,
        aggregation: 'count'
      }],
      timeWindow: {
        duration: '7d',
        sliding: true
      }
    },
    defaultReward: 80,
    defaultXP: 40,
    tags: ['casino', 'slots', 'gaming', 'weekly']
  },

  BIG_WIN_ACHIEVEMENT: {
    id: 'big_win_achievement',
    name: 'Lucky Winner',
    description: 'Win with odds higher than 10x',
    category: 'ACHIEVEMENT',
    vertical: 'GAMING',
    rule: {
      triggers: [{
        event: 'bet_placed',
        filters: [{
          field: 'odds',
          operator: '>=',
          value: 10
        }, {
          field: 'win_amount',
          operator: '>',
          value: 0
        }]
      }],
      conditions: [{
        field: 'win_amount',
        operator: '>',
        value: 0
      }],
      maxClaims: 1
    },
    defaultReward: 300,
    defaultXP: 150,
    tags: ['achievement', 'lucky', 'high-odds', 'rare']
  },

  SOCIAL_REFERRAL: {
    id: 'social_referral',
    name: 'Bring a Friend',
    description: 'Refer 3 friends who make their first deposit',
    category: 'SOCIAL',
    vertical: 'GAMING',
    rule: {
      triggers: [{
        event: 'friend_referred'
      }],
      conditions: [{
        field: 'referred_user_id',
        operator: 'unique_count',
        value: 3,
        aggregation: 'unique_count'
      }],
      timeWindow: {
        duration: '60d',
        sliding: true
      }
    },
    defaultReward: 400,
    defaultXP: 200,
    tags: ['social', 'referral', 'friends', 'viral']
  },

  TOURNAMENT_PARTICIPANT: {
    id: 'tournament_participant',
    name: 'Tournament Fighter',
    description: 'Join 5 tournaments this month',
    category: 'COMPETITIVE',
    vertical: 'GAMING',
    rule: {
      triggers: [{
        event: 'tournament_joined'
      }],
      conditions: [{
        field: 'tournament_count',
        operator: '>=',
        value: 5,
        aggregation: 'count'
      }],
      timeWindow: {
        duration: '30d',
        sliding: false,
        resetTime: '00:00'
      }
    },
    defaultReward: 250,
    defaultXP: 125,
    tags: ['competitive', 'tournament', 'monthly', 'challenge']
  }
}

// E-commerce vertical templates
export const ECOMMERCE_TEMPLATES: Record<string, MissionTemplate> = {
  FIRST_PURCHASE: {
    id: 'first_purchase',
    name: 'First Purchase Bonus',
    description: 'Make your first purchase to unlock rewards',
    category: 'ONBOARDING',
    vertical: 'ECOMMERCE',
    rule: {
      triggers: [{
        event: 'bet_placed' // Using bet_placed as purchase equivalent
      }],
      conditions: [{
        field: 'purchase_count',
        operator: '==',
        value: 1,
        aggregation: 'count'
      }],
      maxClaims: 1
    },
    defaultReward: 100,
    defaultXP: 50,
    tags: ['onboarding', 'first-time', 'purchase']
  },

  MONTHLY_SPENDER: {
    id: 'monthly_spender',
    name: 'Big Spender',
    description: 'Spend R$500+ this month',
    category: 'SPENDING',
    vertical: 'ECOMMERCE',
    rule: {
      triggers: [{
        event: 'bet_placed'
      }],
      conditions: [{
        field: 'amount',
        operator: '>=',
        value: 500,
        aggregation: 'sum'
      }],
      timeWindow: {
        duration: '30d',
        sliding: false,
        resetTime: '00:00'
      }
    },
    defaultReward: 150,
    defaultXP: 75,
    tags: ['monthly', 'spending', 'high-value']
  },

  CATEGORY_EXPLORER: {
    id: 'category_explorer',
    name: 'Category Explorer',
    description: 'Shop in 5 different categories',
    category: 'VARIETY',
    vertical: 'ECOMMERCE',
    rule: {
      triggers: [{
        event: 'bet_placed'
      }],
      conditions: [{
        field: 'category',
        operator: 'unique_count',
        value: 5,
        aggregation: 'unique_count'
      }],
      timeWindow: {
        duration: '30d',
        sliding: true
      }
    },
    defaultReward: 120,
    defaultXP: 60,
    tags: ['variety', 'exploration', 'categories']
  }
}

// SaaS vertical templates
export const SAAS_TEMPLATES: Record<string, MissionTemplate> = {
  PROFILE_COMPLETION: {
    id: 'profile_completion',
    name: 'Complete Your Profile',
    description: 'Fill out 100% of your profile information',
    category: 'ONBOARDING',
    vertical: 'SAAS',
    rule: {
      triggers: [{
        event: 'profile_completed'
      }],
      conditions: [{
        field: 'completion_percentage',
        operator: '>=',
        value: 100
      }],
      maxClaims: 1
    },
    defaultReward: 50,
    defaultXP: 25,
    tags: ['onboarding', 'profile', 'completion']
  },

  FEATURE_EXPLORER: {
    id: 'feature_explorer',
    name: 'Feature Explorer',
    description: 'Try 10 different features',
    category: 'ENGAGEMENT',
    vertical: 'SAAS',
    rule: {
      triggers: [{
        event: 'custom_event',
        filters: [{
          field: 'event_name',
          operator: '==',
          value: 'feature_used'
        }]
      }],
      conditions: [{
        field: 'feature_name',
        operator: 'unique_count',
        value: 10,
        aggregation: 'unique_count'
      }],
      timeWindow: {
        duration: '30d',
        sliding: true
      }
    },
    defaultReward: 100,
    defaultXP: 50,
    tags: ['engagement', 'features', 'exploration']
  },

  DAILY_ACTIVE: {
    id: 'daily_active',
    name: 'Daily User',
    description: 'Be active 20 days this month',
    category: 'ENGAGEMENT',
    vertical: 'SAAS',
    rule: {
      triggers: [{
        event: 'user_login'
      }],
      conditions: [{
        field: 'active_days',
        operator: '>=',
        value: 20,
        aggregation: 'unique_count'
      }],
      timeWindow: {
        duration: '30d',
        sliding: false
      }
    },
    defaultReward: 80,
    defaultXP: 40,
    tags: ['engagement', 'daily', 'activity']
  }
}

// Template categories for UI organization
export const TEMPLATE_CATEGORIES = {
  ONBOARDING: {
    name: 'Onboarding',
    description: 'Help new users get started',
    icon: '🚀',
    color: '#10b981'
  },
  ENGAGEMENT: {
    name: 'Engagement',
    description: 'Keep users active and engaged',
    icon: '💚',
    color: '#3b82f6'
  },
  SPENDING: {
    name: 'Spending',
    description: 'Encourage purchases and deposits',
    icon: '💰',
    color: '#f59e0b'
  },
  VARIETY: {
    name: 'Variety',
    description: 'Promote exploration and diversity',
    icon: '🎯',
    color: '#8b5cf6'
  },
  SOCIAL: {
    name: 'Social',
    description: 'Build community and referrals',
    icon: '👥',
    color: '#ef4444'
  },
  ACHIEVEMENT: {
    name: 'Achievement',
    description: 'Reward special accomplishments',
    icon: '🏆',
    color: '#f97316'
  },
  COMPETITIVE: {
    name: 'Competitive',
    description: 'Foster competition and tournaments',
    icon: '⚡',
    color: '#06b6d4'
  },
  GAMING: {
    name: 'Gaming',
    description: 'Game-specific challenges',
    icon: '🎮',
    color: '#ec4899'
  }
}

// Combine all templates
export const ALL_TEMPLATES: Record<string, MissionTemplate> = {
  ...GAMING_TEMPLATES,
  ...ECOMMERCE_TEMPLATES,
  ...SAAS_TEMPLATES
}

// Helper functions
export function getTemplatesByVertical(vertical: string): MissionTemplate[] {
  return Object.values(ALL_TEMPLATES).filter(template => template.vertical === vertical)
}

export function getTemplatesByCategory(category: string): MissionTemplate[] {
  return Object.values(ALL_TEMPLATES).filter(template => template.category === category)
}

export function searchTemplates(query: string): MissionTemplate[] {
  const lowerQuery = query.toLowerCase()
  return Object.values(ALL_TEMPLATES).filter(template => 
    template.name.toLowerCase().includes(lowerQuery) ||
    template.description.toLowerCase().includes(lowerQuery) ||
    template.tags.some(tag => tag.includes(lowerQuery))
  )
}

export function getTemplateById(id: string): MissionTemplate | null {
  return ALL_TEMPLATES[id] || null
}

// Template validation and customization
export function customizeTemplate(
  template: MissionTemplate,
  customizations: {
    reward?: number
    xpReward?: number
    conditions?: Array<{ field: string; value: any }>
    timeWindow?: { duration: string; sliding?: boolean }
    maxClaims?: number
  }
): MissionTemplate {
  const customized = { ...template }

  if (customizations.reward !== undefined) {
    customized.defaultReward = customizations.reward
  }

  if (customizations.xpReward !== undefined) {
    customized.defaultXP = customizations.xpReward
  }

  if (customizations.conditions) {
    customizations.conditions.forEach(custom => {
      const condition = customized.rule.conditions.find(c => c.field === custom.field)
      if (condition) {
        condition.value = custom.value
      }
    })
  }

  if (customizations.timeWindow) {
    customized.rule.timeWindow = {
      ...customized.rule.timeWindow,
      ...customizations.timeWindow
    }
  }

  if (customizations.maxClaims !== undefined) {
    customized.rule.maxClaims = customizations.maxClaims
  }

  return customized
}

// Rule builders for common patterns
export const TemplateBuilders = {
  createStreakMission(eventType: string, days: number, reward: number): MissionTemplate {
    return {
      id: `${eventType}_streak_${days}`,
      name: `${eventType} ${days}-Day Streak`,
      description: `Perform ${eventType} for ${days} consecutive days`,
      category: 'ENGAGEMENT',
      vertical: 'GAMING',
      rule: {
        triggers: [{ event: eventType as any }],
        conditions: [{
          field: 'consecutive_days',
          operator: 'streak_count',
          value: days,
          aggregation: 'streak_count'
        }],
        timeWindow: {
          duration: '1d',
          sliding: false
        }
      },
      defaultReward: reward,
      defaultXP: Math.floor(reward / 2),
      tags: ['streak', 'daily', eventType]
    }
  },

  createSpendingMission(amount: number, timeWindow: string, reward: number): MissionTemplate {
    return {
      id: `spend_${amount}_${timeWindow}`,
      name: `Spend R$${amount} in ${timeWindow}`,
      description: `Spend R$${amount} or more within ${timeWindow}`,
      category: 'SPENDING',
      vertical: 'GAMING',
      rule: {
        triggers: [{ event: 'bet_placed' }],
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
      },
      defaultReward: reward,
      defaultXP: Math.floor(reward / 2),
      tags: ['spending', 'challenge', timeWindow]
    }
  },

  createVarietyMission(field: string, count: number, reward: number): MissionTemplate {
    return {
      id: `variety_${field}_${count}`,
      name: `Try ${count} Different ${field}s`,
      description: `Experience ${count} different ${field}s`,
      category: 'VARIETY',
      vertical: 'GAMING',
      rule: {
        triggers: [{ event: 'bet_placed' }],
        conditions: [{
          field,
          operator: 'unique_count',
          value: count,
          aggregation: 'unique_count'
        }],
        timeWindow: {
          duration: '30d',
          sliding: true
        }
      },
      defaultReward: reward,
      defaultXP: Math.floor(reward / 2),
      tags: ['variety', 'exploration', field]
    }
  }
}