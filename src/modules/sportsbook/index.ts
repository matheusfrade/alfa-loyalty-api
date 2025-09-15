import { ModuleDefinition, ModuleComponents, ModuleTranslations, EventTypeDefinition } from '../../core/types'

// Sportsbook event types
const SPORTSBOOK_EVENT_TYPES: EventTypeDefinition[] = [
  {
    key: 'bet_placed',
    label: 'Aposta Realizada',
    description: 'Disparado quando uma aposta é confirmada',
    icon: '⚽',
    category: 'betting',
    fields: [
      { name: 'bet_type', label: 'Tipo da Aposta', type: 'enum', required: true,
        options: [
          { value: 'simple', label: 'Simples' },
          { value: 'combined', label: 'Combinada' },
          { value: 'system', label: 'Sistema' }
        ],
        helper: 'Tipo da aposta realizada' },
      { name: 'bet_amount', label: 'Valor Apostado', type: 'currency', required: true,
        validation: { min: 1, max: 50000 }, helper: 'Valor apostado' },
      { name: 'potential_win', label: 'Ganho Potencial', type: 'currency', required: true,
        helper: 'Ganho potencial da aposta' },
      { name: 'total_odds', label: 'Odd Total', type: 'number', required: true,
        validation: { min: 1.01 }, helper: 'Odd total da aposta' },
      { name: 'sport_type', label: 'Esporte', type: 'enum', required: true,
        options: [
          { value: 'football', label: 'Futebol' },
          { value: 'basketball', label: 'Basquete' },
          { value: 'tennis', label: 'Tênis' }
        ],
        helper: 'Modalidade esportiva' },
      { name: 'live_bet', label: 'Aposta ao Vivo', type: 'boolean', required: false, helper: 'Se é aposta ao vivo' }
    ]
  },
  {
    key: 'bet_won',
    label: 'Aposta Ganha',
    description: 'Disparado quando uma aposta é ganha',
    icon: '🏆',
    category: 'achievement',
    fields: [
      { name: 'bet_type', label: 'Tipo da Aposta', type: 'string', required: true, helper: 'Tipo da aposta ganha' },
      { name: 'bet_amount', label: 'Valor Apostado', type: 'currency', required: true, helper: 'Valor apostado' },
      { name: 'win_amount', label: 'Valor Ganho', type: 'currency', required: true, helper: 'Valor ganho' },
      { name: 'final_odds', label: 'Odd Final', type: 'number', required: true, helper: 'Odd final da aposta' }
    ]
  }
]

// Sportsbook translations
const SPORTSBOOK_TRANSLATIONS: ModuleTranslations = {
  'pt-BR': {
    'module.name': 'Apostas Esportivas',
    'module.description': 'Sistema de missões para apostas esportivas',
    'field.bet_type': 'Tipo da Aposta',
    'field.bet_amount': 'Valor Apostado',
    'field.sport_type': 'Esporte',
    'field.total_odds': 'Odd Total'
  }
}

// Sportsbook module definition
export const SPORTSBOOK_MODULE: ModuleDefinition = {
  name: 'sportsbook',
  label: 'Apostas Esportivas',
  description: 'Módulo específico para apostas esportivas',
  icon: '⚽',
  version: '1.0.0',
  eventTypes: SPORTSBOOK_EVENT_TYPES,
  templates: [],
  validators: [],
  components: {} as ModuleComponents,
  translations: SPORTSBOOK_TRANSLATIONS,
  settings: {
    defaultCurrency: 'BRL',
    timezone: 'America/Sao_Paulo',
    features: [
      { key: 'pre_match', label: 'Apostas Pré-jogo', enabled: true },
      { key: 'live_betting', label: 'Apostas ao Vivo', enabled: true }
    ]
  }
}

export default SPORTSBOOK_MODULE