import { ModuleDefinition } from '../../core/types'
import { TIER_EVENT_TYPES } from './types'

export const TIERS_MODULE: ModuleDefinition = {
  name: 'tiers',
  label: 'Sistema de Tiers/Níveis',
  description: 'Sistema avançado de tiers com pontos expiráveis e períodos de manutenção',
  version: '1.0.0',
  icon: '🏆',

  // Event types específicos do módulo de tiers
  eventTypes: [
    {
      key: TIER_EVENT_TYPES.POINTS_EARNED,
      label: 'Pontos Ganhos',
      description: 'Jogador ganhou pontos para tier',
      icon: '⭐',
      category: 'TIER_POINTS',
      fields: [
        {
          name: 'amount',
          label: 'Quantidade de Pontos',
          type: 'number',
          required: true,
          helper: 'Pontos ganhos pelo jogador',
          validation: { min: 1 }
        },
        {
          name: 'source',
          label: 'Origem dos Pontos',
          type: 'enum',
          required: true,
          options: [
            { value: 'MISSION', label: '🎯 Missão' },
            { value: 'BONUS', label: '🎁 Bônus' },
            { value: 'PURCHASE', label: '🛒 Compra' },
            { value: 'REFERRAL', label: '👥 Indicação' },
            { value: 'PROMOTION', label: '📢 Promoção' },
            { value: 'MANUAL', label: '✋ Manual' }
          ]
        },
        {
          name: 'reference',
          label: 'Referência',
          type: 'string',
          required: false,
          helper: 'ID da missão, transação, etc.'
        },
        {
          name: 'description',
          label: 'Descrição',
          type: 'string',
          required: true,
          helper: 'Descrição do motivo dos pontos'
        }
      ]
    },
    {
      key: TIER_EVENT_TYPES.POINTS_EXPIRED,
      label: 'Pontos Expirados',
      description: 'Pontos do jogador expiraram',
      icon: '⏰',
      category: 'TIER_POINTS',
      fields: [
        {
          name: 'amount',
          label: 'Quantidade Expirada',
          type: 'number',
          required: true,
          validation: { min: 1 }
        },
        {
          name: 'originalSource',
          label: 'Origem Original',
          type: 'string',
          required: false
        }
      ]
    },
    {
      key: TIER_EVENT_TYPES.TIER_UPGRADED,
      label: 'Tier Atualizado',
      description: 'Jogador subiu de tier',
      icon: '📈',
      category: 'TIER_CHANGE',
      fields: [
        {
          name: 'fromTierId',
          label: 'Tier Anterior',
          type: 'string',
          required: true
        },
        {
          name: 'toTierId',
          label: 'Novo Tier',
          type: 'string',
          required: true
        },
        {
          name: 'pointsLive',
          label: 'Pontos Vivos',
          type: 'number',
          required: true
        }
      ]
    },
    {
      key: TIER_EVENT_TYPES.TIER_DOWNGRADED,
      label: 'Tier Rebaixado',
      description: 'Jogador desceu de tier',
      icon: '📉',
      category: 'TIER_CHANGE',
      fields: [
        {
          name: 'fromTierId',
          label: 'Tier Anterior',
          type: 'string',
          required: true
        },
        {
          name: 'toTierId',
          label: 'Novo Tier',
          type: 'string',
          required: true
        },
        {
          name: 'reason',
          label: 'Motivo',
          type: 'enum',
          required: true,
          options: [
            { value: 'MAINTENANCE', label: '🔧 Manutenção' },
            { value: 'EXPIRATION', label: '⏰ Expiração' },
            { value: 'MANUAL', label: '✋ Manual' }
          ]
        }
      ]
    },
    {
      key: TIER_EVENT_TYPES.PERIOD_CLOSED,
      label: 'Período Fechado',
      description: 'Período de tier foi fechado',
      icon: '📅',
      category: 'TIER_MANAGEMENT',
      fields: [
        {
          name: 'periodStart',
          label: 'Início do Período',
          type: 'string',
          required: true
        },
        {
          name: 'periodEnd',
          label: 'Fim do Período',
          type: 'string',
          required: true
        },
        {
          name: 'playersAffected',
          label: 'Jogadores Afetados',
          type: 'number',
          required: true
        }
      ]
    }
  ],

  // Templates pré-definidos para missões relacionadas a tiers
  templates: [
    {
      id: 'tiers_earn_points',
      name: 'Ganhar Pontos de Tier',
      description: 'Missão simples para ganhar pontos de tier',
      category: 'TIER_POINTS',
      difficulty: 'easy',
      tags: ['tier', 'pontos', 'simples'],
      module: 'tiers',
      vertical: 'GENERAL',
      defaultReward: 50,
      defaultXP: 25,
      rule: {
        triggers: [{ event: TIER_EVENT_TYPES.POINTS_EARNED }],
        conditions: [
          {
            field: 'amount',
            operator: '>=',
            value: 100
          }
        ],
        logic: 'AND'
      }
    },
    {
      id: 'tiers_level_up',
      name: 'Subir de Tier',
      description: 'Recompensa por subir de tier',
      category: 'TIER_ACHIEVEMENT',
      difficulty: 'medium',
      tags: ['tier', 'upgrade', 'conquista'],
      module: 'tiers',
      vertical: 'GENERAL',
      defaultReward: 500,
      defaultXP: 250,
      rule: {
        triggers: [{ event: TIER_EVENT_TYPES.TIER_UPGRADED }],
        conditions: [],
        logic: 'AND'
      }
    },
    {
      id: 'tiers_maintain_premium',
      name: 'Manter Tier Premium',
      description: 'Recompensa por manter tier alto',
      category: 'TIER_MAINTENANCE',
      difficulty: 'expert',
      tags: ['tier', 'manutenção', 'vip'],
      module: 'tiers',
      vertical: 'GENERAL',
      defaultReward: 1000,
      defaultXP: 500,
      rule: {
        triggers: [{ event: TIER_EVENT_TYPES.PERIOD_CLOSED }],
        conditions: [
          {
            field: 'finalTierLevel',
            operator: '>=',
            value: 3
          }
        ],
        logic: 'AND'
      }
    }
  ],

  // Componentes específicos do módulo (comentado temporariamente)
  // components: {
  //   TierStatusWidget: {
  //     name: 'Widget de Status do Tier',
  //     description: 'Mostra status atual do tier do jogador',
  //     props: ['playerId', 'programId', 'showDetails']
  //   },
  //   TierProgressBar: {
  //     name: 'Barra de Progresso do Tier',
  //     description: 'Mostra progresso para próximo tier',
  //     props: ['playerId', 'programId', 'showPoints']
  //   },
  //   TierExpirationAlert: {
  //     name: 'Alerta de Expiração',
  //     description: 'Alerta sobre pontos que vão expirar',
  //     props: ['playerId', 'programId', 'daysAhead']
  //   }
  // },

  // Traduções
  translations: {
    'pt-BR': {
      points: 'pontos',
      tier: 'nível',
      expires: 'expira',
      maintenance: 'manutenção',
      upgraded: 'promovido',
      downgraded: 'rebaixado'
    },
    'en': {
      points: 'points',
      tier: 'tier',
      expires: 'expires',
      maintenance: 'maintenance',
      upgraded: 'upgraded',
      downgraded: 'downgraded'
    }
  },

  // Configurações do módulo
  settings: {
    features: [
      {
        key: 'enableAutoExpiration',
        label: 'Expiração Automática',
        description: 'Executar job diário de expiração de pontos',
        enabled: true
      },
      {
        key: 'enablePeriodClose',
        label: 'Fechamento de Período',
        description: 'Executar fechamento automático de períodos',
        enabled: true
      },
      {
        key: 'enableVipInflationAlert',
        label: 'Alerta de Inflação VIP',
        description: 'Alertar quando >12% dos usuários estão no tier máximo',
        enabled: true
      },
      {
        key: 'enableSoftReset',
        label: 'Soft Reset',
        description: 'Aplicar soft reset de pontos no fechamento',
        enabled: true
      }
    ]
    // Comentado temporariamente até interface ser fixada
    // defaultValues: {
    //   pointsExpireAfterM: 12,
    //   softResetFactor: 0.5,
    //   vipInflationThreshold: 12,
    //   defaultPeriodType: 'SEMESTRE'
    // }
  },

  // Validações específicas (comentado temporariamente)
  // validators: [
  //   {
  //     name: 'tierRanges',
  //     validate: (tiers: any[]) => {
  //       // Implementar validação de ranges
  //       return { isValid: true, errors: [] }
  //     }
  //   },
  //   {
  //     name: 'periodPolicy',
  //     validate: (policy: any) => {
  //       // Validar política de período
  //       return { isValid: true, errors: [] }
  //     }
  //   }
  // ],

  // Hooks do ciclo de vida (comentado temporariamente)
  // hooks: {
  //   onInstall: async (programId: string) => {
  //     console.log(`Installing Tiers module for program ${programId}`)
  //     // Criar tiers padrão e política se não existirem
  //   },
  //   onUninstall: async (programId: string) => {
  //     console.log(`Uninstalling Tiers module for program ${programId}`)
  //     // Limpar dados específicos se necessário
  //   },
  //   onConfigChange: async (programId: string, config: any) => {
  //     console.log(`Tiers module config changed for program ${programId}`)
  //     // Reagir a mudanças de configuração
  //   }
  // },

  // Required empty arrays for build
  validators: [],
  components: {}
}

// Export services para uso externo
export { tierService } from './services'
export { tierJobService } from './jobs'
export * from './types'