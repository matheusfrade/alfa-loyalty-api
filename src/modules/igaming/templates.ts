// iGaming specific mission templates
// Pre-built templates for common gambling scenarios

import { MissionTemplate, COMMON_CATEGORIES } from '@/core/types'

// Sportsbook Templates
export const SPORTSBOOK_TEMPLATES: MissionTemplate[] = [
  {
    id: 'apostador_futebol_semanal',
    name: 'Apostador de Futebol',
    description: 'Aposte R$500 em futebol nesta semana',
    category: 'SPENDING',
    module: 'igaming',
    vertical: 'GAMING',
    rule: {
      triggers: [{
        event: 'sportsbook_bet_placed',
        filters: [
          { field: 'sport', operator: '==', value: 'futebol' }
        ]
      }],
      conditions: [{
        field: 'amount',
        operator: '>=',
        value: 500,
        aggregation: 'sum'
      }],
      timeWindow: {
        duration: '7d',
        sliding: true
      },
      logic: 'AND'
    },
    defaultReward: 150,
    defaultXP: 75,
    tags: ['sportsbook', 'futebol', 'semanal', 'valor'],
    difficulty: 'medium',
    estimatedTime: '1 semana',
    popularity: 95,
    examples: [
      {
        title: 'Cenário Típico',
        scenario: 'Usuário faz 5 apostas de R$100 cada no Brasileirão',
        expectedOutcome: 'Mission completa, usuário ganha 150 moedas'
      }
    ]
  },

  {
    id: 'fã_brasileirao',
    name: 'Fã do Brasileirão',
    description: 'Faça 10 apostas no Campeonato Brasileiro',
    category: 'ENGAGEMENT',
    module: 'igaming',
    vertical: 'GAMING',
    rule: {
      triggers: [{
        event: 'sportsbook_bet_placed',
        filters: [
          { field: 'sport', operator: '==', value: 'futebol' },
          { field: 'championship', operator: '==', value: 'brasileirao_a' }
        ]
      }],
      conditions: [{
        field: 'count',
        operator: '>=',
        value: 10,
        aggregation: 'count'
      }],
      timeWindow: {
        duration: '30d',
        sliding: true
      },
      logic: 'AND'
    },
    defaultReward: 200,
    defaultXP: 100,
    tags: ['brasileirao', 'futebol', 'engajamento'],
    difficulty: 'easy',
    estimatedTime: '2-3 semanas',
    popularity: 88
  },

  {
    id: 'mestre_combinadas',
    name: 'Mestre das Combinadas',
    description: 'Acerte 3 apostas combinadas com pelo menos 3 seleções',
    category: 'ACHIEVEMENT',
    module: 'igaming',
    vertical: 'GAMING',
    rule: {
      triggers: [{
        event: 'sportsbook_bet_placed',
        filters: [
          { field: 'bet_type', operator: '==', value: 'combinada' },
          { field: 'selections_count', operator: '>=', value: 3 },
          { field: 'win_amount', operator: '>', value: 0 } // Só conta se ganhar
        ]
      }],
      conditions: [{
        field: 'count',
        operator: '>=',
        value: 3,
        aggregation: 'count'
      }],
      timeWindow: {
        duration: '30d',
        sliding: true
      },
      logic: 'AND'
    },
    defaultReward: 500,
    defaultXP: 250,
    tags: ['combinada', 'skill', 'vitória'],
    difficulty: 'hard',
    estimatedTime: '1-2 meses',
    popularity: 65
  },

  {
    id: 'sistema_expert',
    name: 'Expert em Sistema',
    description: 'Aposte R$1000 em apostas sistema neste mês',
    category: 'SPENDING',
    module: 'igaming',
    vertical: 'GAMING',
    rule: {
      triggers: [{
        event: 'sportsbook_bet_placed',
        filters: [
          { field: 'bet_type', operator: '==', value: 'sistema' }
        ]
      }],
      conditions: [{
        field: 'amount',
        operator: '>=',
        value: 1000,
        aggregation: 'sum'
      }],
      timeWindow: {
        duration: '30d',
        sliding: false,
        resetTime: '00:00'
      },
      logic: 'AND'
    },
    defaultReward: 300,
    defaultXP: 150,
    tags: ['sistema', 'avançado', 'mensal'],
    difficulty: 'expert',
    estimatedTime: '1 mês',
    popularity: 45
  },

  {
    id: 'betbuilder_pro',
    name: 'Bet Builder Pro',
    description: 'Crie 15 Bet Builders no futebol',
    category: 'ENGAGEMENT',
    module: 'igaming',
    vertical: 'GAMING',
    rule: {
      triggers: [{
        event: 'sportsbook_bet_placed',
        filters: [
          { field: 'bet_type', operator: '==', value: 'betbuilder' },
          { field: 'sport', operator: '==', value: 'futebol' }
        ]
      }],
      conditions: [{
        field: 'count',
        operator: '>=',
        value: 15,
        aggregation: 'count'
      }],
      timeWindow: {
        duration: '30d',
        sliding: true
      },
      logic: 'AND'
    },
    defaultReward: 250,
    defaultXP: 125,
    tags: ['betbuilder', 'futebol', 'criativo'],
    difficulty: 'medium',
    estimatedTime: '2-3 semanas',
    popularity: 72
  },

  {
    id: 'multi_esporte',
    name: 'Multi-Esporte',
    description: 'Aposte em 5 esportes diferentes',
    category: 'ENGAGEMENT',
    module: 'igaming',
    vertical: 'GAMING',
    rule: {
      triggers: [{
        event: 'sportsbook_bet_placed'
      }],
      conditions: [{
        field: 'sport',
        operator: 'unique_count',
        value: 5,
        aggregation: 'unique_count'
      }],
      timeWindow: {
        duration: '30d',
        sliding: true
      },
      logic: 'AND'
    },
    defaultReward: 180,
    defaultXP: 90,
    tags: ['variedade', 'esportes', 'exploração'],
    difficulty: 'medium',
    estimatedTime: '2-4 semanas',
    popularity: 78
  }
]

// Casino Templates
export const CASINO_TEMPLATES: MissionTemplate[] = [
  {
    id: 'slot_master',
    name: 'Mestre dos Slots',
    description: 'Faça 200 rodadas em caça-níqueis',
    category: 'ENGAGEMENT',
    module: 'igaming',
    vertical: 'GAMING',
    rule: {
      triggers: [{
        event: 'casino_bet_placed',
        filters: [
          { field: 'game_category', operator: '==', value: 'slots' }
        ]
      }],
      conditions: [{
        field: 'count',
        operator: '>=',
        value: 200,
        aggregation: 'count'
      }],
      timeWindow: {
        duration: '7d',
        sliding: true
      },
      logic: 'AND'
    },
    defaultReward: 120,
    defaultXP: 60,
    tags: ['slots', 'casino', 'rodadas'],
    difficulty: 'easy',
    estimatedTime: '3-7 dias',
    popularity: 92
  },

  {
    id: 'pragmatic_fan',
    name: 'Fã da Pragmatic Play',
    description: 'Jogue 10 slots diferentes da Pragmatic Play',
    category: 'ENGAGEMENT',
    module: 'igaming',
    vertical: 'GAMING',
    rule: {
      triggers: [{
        event: 'casino_bet_placed',
        filters: [
          { field: 'provider', operator: '==', value: 'pragmatic_play' },
          { field: 'game_category', operator: '==', value: 'slots' }
        ]
      }],
      conditions: [{
        field: 'game_id',
        operator: 'unique_count',
        value: 10,
        aggregation: 'unique_count'
      }],
      timeWindow: {
        duration: '30d',
        sliding: true
      },
      logic: 'AND'
    },
    defaultReward: 200,
    defaultXP: 100,
    tags: ['pragmatic', 'variedade', 'provedor'],
    difficulty: 'medium',
    estimatedTime: '1-2 semanas',
    popularity: 85
  },

  {
    id: 'gates_of_olympus_champion',
    name: 'Campeão Gates of Olympus',
    description: 'Ganhe 5x o valor apostado no Gates of Olympus',
    category: 'ACHIEVEMENT',
    module: 'igaming',
    vertical: 'GAMING',
    rule: {
      triggers: [{
        event: 'casino_bet_placed',
        filters: [
          { field: 'game_id', operator: '==', value: 'gates-of-olympus' },
          { field: 'multiplier', operator: '>=', value: 5 }
        ]
      }],
      conditions: [{
        field: 'count',
        operator: '>=',
        value: 1
      }],
      maxClaims: 1,
      logic: 'AND'
    },
    defaultReward: 400,
    defaultXP: 200,
    tags: ['gates-olympus', 'multiplicador', 'conquista'],
    difficulty: 'hard',
    estimatedTime: 'Baseado na sorte',
    popularity: 76
  },

  {
    id: 'high_roller_casino',
    name: 'High Roller Casino',
    description: 'Aposte R$2000 em jogos de casino',
    category: 'SPENDING',
    module: 'igaming',
    vertical: 'GAMING',
    rule: {
      triggers: [{
        event: 'casino_bet_placed'
      }],
      conditions: [{
        field: 'amount',
        operator: '>=',
        value: 2000,
        aggregation: 'sum'
      }],
      timeWindow: {
        duration: '7d',
        sliding: true
      },
      logic: 'AND'
    },
    defaultReward: 350,
    defaultXP: 175,
    tags: ['high-roller', 'volume', 'semanal'],
    difficulty: 'expert',
    estimatedTime: '1 semana',
    popularity: 55
  },

  {
    id: 'blackjack_strategist',
    name: 'Estrategista do Blackjack',
    description: 'Jogue 50 mãos de Blackjack',
    category: 'ENGAGEMENT',
    module: 'igaming',
    vertical: 'GAMING',
    rule: {
      triggers: [{
        event: 'casino_bet_placed',
        filters: [
          { field: 'game_category', operator: '==', value: 'blackjack' }
        ]
      }],
      conditions: [{
        field: 'count',
        operator: '>=',
        value: 50,
        aggregation: 'count'
      }],
      timeWindow: {
        duration: '7d',
        sliding: true
      },
      logic: 'AND'
    },
    defaultReward: 160,
    defaultXP: 80,
    tags: ['blackjack', 'estratégia', 'cartas'],
    difficulty: 'medium',
    estimatedTime: '3-7 dias',
    popularity: 68
  }
]

// Live Casino Templates
export const LIVE_CASINO_TEMPLATES: MissionTemplate[] = [
  {
    id: 'live_casino_explorer',
    name: 'Explorador Casino Ao Vivo',
    description: 'Jogue em 3 mesas diferentes ao vivo',
    category: 'ENGAGEMENT',
    module: 'igaming',
    vertical: 'GAMING',
    rule: {
      triggers: [{
        event: 'live_casino_bet_placed'
      }],
      conditions: [{
        field: 'table_id',
        operator: 'unique_count',
        value: 3,
        aggregation: 'unique_count'
      }],
      timeWindow: {
        duration: '7d',
        sliding: true
      },
      logic: 'AND'
    },
    defaultReward: 100,
    defaultXP: 50,
    tags: ['live', 'variedade', 'mesas'],
    difficulty: 'easy',
    estimatedTime: '2-5 dias',
    popularity: 71
  },

  {
    id: 'evolution_vip',
    name: 'VIP Evolution',
    description: 'Aposte R$500 em mesas Evolution',
    category: 'SPENDING',
    module: 'igaming',
    vertical: 'GAMING',
    rule: {
      triggers: [{
        event: 'live_casino_bet_placed',
        filters: [
          { field: 'provider', operator: '==', value: 'evolution' }
        ]
      }],
      conditions: [{
        field: 'amount',
        operator: '>=',
        value: 500,
        aggregation: 'sum'
      }],
      timeWindow: {
        duration: '7d',
        sliding: true
      },
      logic: 'AND'
    },
    defaultReward: 140,
    defaultXP: 70,
    tags: ['evolution', 'live', 'valor'],
    difficulty: 'medium',
    estimatedTime: '1 semana',
    popularity: 63
  }
]

// Specialized Templates
export const SPECIALIZED_TEMPLATES: MissionTemplate[] = [
  {
    id: 'onboarding_gamer',
    name: 'Novo Jogador',
    description: 'Complete sua jornada inicial: faça KYC, deposite e aposte',
    category: 'ONBOARDING',
    module: 'igaming',
    vertical: 'GAMING',
    rule: {
      triggers: [
        { event: 'kyc_verified' },
        { event: 'deposit_made' },
        { event: 'sportsbook_bet_placed' }
      ],
      conditions: [
        { field: 'kyc_completed', operator: '==', value: true },
        { field: 'first_deposit', operator: '>=', value: 20 },
        { field: 'first_bet', operator: '>=', value: 10 }
      ],
      logic: 'AND'
    },
    defaultReward: 300,
    defaultXP: 150,
    tags: ['onboarding', 'primeiro', 'completo'],
    difficulty: 'easy',
    estimatedTime: '1-3 dias',
    popularity: 98,
    examples: [
      {
        title: 'Jornada Completa',
        scenario: 'Usuário faz KYC, deposita R$50 e faz primeira aposta de R$20',
        expectedOutcome: 'Bônus de boas-vindas + 300 moedas'
      }
    ]
  },

  {
    id: 'weekend_warrior',
    name: 'Guerreiro do Fim de Semana',
    description: 'Seja ativo nos fins de semana: 5 apostas sábado/domingo',
    category: 'ENGAGEMENT',
    module: 'igaming',
    vertical: 'GAMING',
    rule: {
      triggers: [{
        event: 'sportsbook_bet_placed',
        filters: [
          { field: 'day_of_week', operator: 'in', value: ['saturday', 'sunday'] }
        ]
      }],
      conditions: [{
        field: 'count',
        operator: '>=',
        value: 5,
        aggregation: 'count'
      }],
      timeWindow: {
        duration: '7d',
        sliding: true
      },
      cooldown: 604800, // 1 semana
      logic: 'AND'
    },
    defaultReward: 100,
    defaultXP: 50,
    tags: ['weekend', 'engajamento', 'semanal'],
    difficulty: 'easy',
    estimatedTime: 'Fins de semana',
    popularity: 84
  }
]

// All iGaming templates combined
export const IGAMING_TEMPLATES: MissionTemplate[] = [
  ...SPORTSBOOK_TEMPLATES,
  ...CASINO_TEMPLATES,
  ...LIVE_CASINO_TEMPLATES,
  ...SPECIALIZED_TEMPLATES
]

// Template categories specific to iGaming
export const IGAMING_CATEGORIES = {
  ...COMMON_CATEGORIES,
  SPORTSBOOK: {
    key: 'SPORTSBOOK',
    name: { 'pt-BR': 'Apostas Esportivas', 'en-US': 'Sportsbook' },
    description: { 'pt-BR': 'Missões focadas em apostas esportivas', 'en-US': 'Sports betting focused missions' },
    icon: '⚽',
    color: '#059669',
    order: 6
  },
  CASINO: {
    key: 'CASINO',
    name: { 'pt-BR': 'Casino', 'en-US': 'Casino' },
    description: { 'pt-BR': 'Missões de jogos de casino', 'en-US': 'Casino games missions' },
    icon: '🎰',
    color: '#dc2626',
    order: 7
  },
  LIVE_CASINO: {
    key: 'LIVE_CASINO',
    name: { 'pt-BR': 'Casino Ao Vivo', 'en-US': 'Live Casino' },
    description: { 'pt-BR': 'Missões de mesas ao vivo', 'en-US': 'Live dealer games missions' },
    icon: '🎲',
    color: '#7c2d12',
    order: 8
  },
  HIGH_ROLLER: {
    key: 'HIGH_ROLLER',
    name: { 'pt-BR': 'High Roller', 'en-US': 'High Roller' },
    description: { 'pt-BR': 'Para jogadores de alto valor', 'en-US': 'For high-value players' },
    icon: '💎',
    color: '#6b21a8',
    order: 9
  }
}

// Helper functions for template management
export function getTemplatesByCategory(category: string): MissionTemplate[] {
  return IGAMING_TEMPLATES.filter(template => template.category === category)
}

export function getTemplatesByDifficulty(difficulty: string): MissionTemplate[] {
  return IGAMING_TEMPLATES.filter(template => template.difficulty === difficulty)
}

export function getTemplatesByTag(tag: string): MissionTemplate[] {
  return IGAMING_TEMPLATES.filter(template => template.tags.includes(tag))
}

export function getPopularTemplates(limit: number = 10): MissionTemplate[] {
  return IGAMING_TEMPLATES
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, limit)
}

export function getTemplateById(id: string): MissionTemplate | undefined {
  return IGAMING_TEMPLATES.find(template => template.id === id)
}