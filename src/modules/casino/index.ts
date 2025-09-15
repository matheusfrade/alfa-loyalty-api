import { ModuleDefinition, ModuleComponents, ModuleTranslations, EventTypeDefinition } from '../../core/types'

// Casino event types
const CASINO_EVENT_TYPES: EventTypeDefinition[] = [
  {
    key: 'spin',
    label: 'Spin/Jogada',
    description: 'Disparado a cada jogada em slots, roletas ou outros jogos',
    icon: '🎰',
    category: 'gameplay',
    fields: [
      { name: 'game_type', label: 'Tipo do Jogo', type: 'enum', required: true, 
        options: [
          { value: 'slot', label: 'Caça-níquel' },
          { value: 'roulette', label: 'Roleta' },
          { value: 'blackjack', label: 'Blackjack' },
          { value: 'poker', label: 'Poker' }
        ],
        helper: 'Tipo do jogo de cassino' },
      { name: 'game_id', label: 'ID do Jogo', type: 'string', required: true, helper: 'Identificador único do jogo' },
      { name: 'bet_amount', label: 'Valor Apostado', type: 'currency', required: true, 
        validation: { min: 0.1, max: 10000 }, helper: 'Valor apostado na jogada' },
      { name: 'win_amount', label: 'Valor Ganho', type: 'currency', required: true, 
        validation: { min: 0 }, helper: 'Valor ganho (0 se perdeu)' },
      { name: 'multiplier', label: 'Multiplicador', type: 'number', required: false,
        validation: { min: 0 }, helper: 'Multiplicador da jogada (se aplicável)' },
      { name: 'provider', label: 'Provedor', type: 'string', required: false, helper: 'Provedor do jogo' }
    ]
  },
  {
    key: 'big_win',
    label: 'Grande Vitória',
    description: 'Disparado quando jogador tem uma vitória significativa',
    icon: '💰',
    category: 'achievement',
    fields: [
      { name: 'game_type', label: 'Tipo do Jogo', type: 'string', required: true, helper: 'Tipo do jogo onde ocorreu a vitória' },
      { name: 'win_amount', label: 'Valor Ganho', type: 'currency', required: true, helper: 'Valor ganho' },
      { name: 'bet_amount', label: 'Valor Apostado', type: 'currency', required: true, helper: 'Valor apostado' },
      { name: 'multiplier', label: 'Multiplicador', type: 'number', required: true, helper: 'Multiplicador alcançado' },
      { name: 'win_type', label: 'Tipo da Vitória', type: 'string', required: false, helper: 'Tipo da vitória' }
    ]
  }
]

// Casino translations
const CASINO_TRANSLATIONS: ModuleTranslations = {
  'pt-BR': {
    'module.name': 'Cassino',
    'module.description': 'Sistema de missões para jogos de cassino',
    'field.game_type': 'Tipo do Jogo',
    'field.bet_amount': 'Valor Apostado',
    'field.win_amount': 'Valor Ganho',
    'field.multiplier': 'Multiplicador'
  }
}

// Casino module definition
export const CASINO_MODULE: ModuleDefinition = {
  name: 'casino',
  label: 'Cassino',
  description: 'Módulo para jogos de cassino, slots e jogos de mesa',
  icon: '🎰',
  version: '1.0.0',
  eventTypes: CASINO_EVENT_TYPES,
  templates: [], // Will be populated as needed
  validators: [],
  components: {} as ModuleComponents,
  translations: CASINO_TRANSLATIONS,
  settings: {
    defaultCurrency: 'BRL',
    timezone: 'America/Sao_Paulo',
    features: [
      { key: 'slots', label: 'Caça-níqueis', enabled: true },
      { key: 'table_games', label: 'Jogos de Mesa', enabled: true }
    ]
  }
}

export default CASINO_MODULE