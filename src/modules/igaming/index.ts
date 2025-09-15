// iGaming Module Definition
// Combines types, templates, validators, and components for gaming vertical

import { ModuleDefinition, ModuleComponents, ModuleTranslations } from '../../core/types'
import { IGAMING_EVENT_TYPES, IGAMING_VALIDATION_RULES } from './types'
import { IGAMING_TEMPLATES } from './templates'

// Portuguese translations for iGaming module
const IGAMING_TRANSLATIONS: ModuleTranslations = {
  'pt-BR': {
    // Module info
    'module.name': 'iGaming',
    'module.description': 'Sistema de missões para apostas esportivas e cassino',
    
    // General terms
    'field.amount': 'Valor',
    'field.sport': 'Esporte',
    'field.bet_type': 'Tipo de Aposta',
    'field.championship': 'Campeonato',
    'field.market': 'Mercado',
    'field.odds': 'Odds',
    'field.game_provider': 'Provedor do Jogo',
    'field.game_category': 'Categoria do Jogo',
    'field.game_theme': 'Tema do Jogo',
    'field.volatility': 'Volatilidade',
    'field.rtp': 'RTP',
    'field.method': 'Método',
    'field.currency': 'Moeda',
    
    // Event types
    'event.sportsbook_bet_placed': 'Aposta Esportiva Realizada',
    'event.sportsbook_bet_placed.description': 'Disparado quando o usuário faz uma aposta em esportes',
    'event.casino_bet_placed': 'Aposta de Cassino Realizada',
    'event.casino_bet_placed.description': 'Disparado quando o usuário faz uma aposta em jogos de cassino',
    'event.deposit_made': 'Depósito Realizado',
    'event.deposit_made.description': 'Disparado quando o usuário faz um depósito na conta',
    'event.withdrawal_requested': 'Saque Solicitado',
    'event.withdrawal_requested.description': 'Disparado quando o usuário solicita um saque',
    'event.game_round_completed': 'Rodada de Jogo Finalizada',
    'event.game_round_completed.description': 'Disparado quando uma rodada de jogo é finalizada',
    'event.bonus_claimed': 'Bônus Reivindicado',
    'event.bonus_claimed.description': 'Disparado quando o usuário reivindica um bônus',
    'event.tournament_joined': 'Torneio Participado',
    'event.tournament_joined.description': 'Disparado quando o usuário participa de um torneio',
    'event.level_up': 'Subiu de Nível',
    'event.level_up.description': 'Disparado quando o usuário sobe de nível no sistema',
    
    // Bet types
    'bet_type.simples': 'Simples',
    'bet_type.combinada': 'Combinada',
    'bet_type.sistema': 'Sistema',
    'bet_type.betbuilder': 'Bet Builder',
    
    // Sports
    'sport.futebol': 'Futebol',
    'sport.basquete': 'Basquete',
    'sport.tenis': 'Tênis',
    'sport.volei': 'Vôlei',
    'sport.futebol_americano': 'Futebol Americano',
    'sport.formula_1': 'Fórmula 1',
    'sport.mma': 'MMA',
    'sport.boxe': 'Boxe',
    'sport.esports': 'E-Sports',
    'sport.outros': 'Outros',
    
    // Game categories
    'game_category.slots': 'Caça-níqueis',
    'game_category.table_games': 'Jogos de Mesa',
    'game_category.live_casino': 'Cassino Ao Vivo',
    'game_category.video_poker': 'Video Poker',
    'game_category.scratch_cards': 'Raspadinhas',
    
    // Game providers
    'game_provider.pragmatic_play': 'Pragmatic Play',
    'game_provider.evolution': 'Evolution Gaming',
    'game_provider.netent': 'NetEnt',
    'game_provider.microgaming': 'Microgaming',
    'game_provider.playtech': 'Playtech',
    'game_provider.play_n_go': "Play'n GO",
    
    // Validation messages
    'validation.min_amount': 'Valor mínimo é R$ {min}',
    'validation.max_amount': 'Valor máximo é R$ {max}',
    'validation.min_odds': 'Odds mínima é {min}',
    'validation.max_odds': 'Odds máxima é {max}',
    'validation.required_field': 'Este campo é obrigatório',
    
    // Template categories
    'category.onboarding': 'Integração',
    'category.engagement': 'Engajamento',
    'category.spending': 'Gastos',
    'category.social': 'Social',
    'category.achievement': 'Conquistas',
    
    // Common helpers
    'helper.amount': 'Valor em reais (R$)',
    'helper.odds': 'Cotação da aposta (ex: 1.50, 2.25)',
    'helper.bet_type': 'Tipo de aposta: simples (1 evento), combinada (múltiplos eventos), etc.',
    'helper.sport': 'Modalidade esportiva da aposta',
    'helper.championship': 'Competição ou campeonato específico',
    'helper.market': 'Mercado de aposta (resultado final, gols, escanteios, etc.)',
    'helper.game_provider': 'Empresa desenvolvedora do jogo',
    'helper.volatility': 'Frequência e tamanho dos prêmios',
    'helper.rtp': 'Taxa de retorno ao jogador (%)',
  },
  
  'en-US': {
    // Module info
    'module.name': 'iGaming',
    'module.description': 'Mission system for sportsbook and casino',
    
    // General terms
    'field.amount': 'Amount',
    'field.sport': 'Sport',
    'field.bet_type': 'Bet Type',
    'field.championship': 'Championship',
    'field.market': 'Market',
    'field.odds': 'Odds',
    'field.game_provider': 'Game Provider',
    'field.game_category': 'Game Category',
    'field.game_theme': 'Game Theme',
    'field.volatility': 'Volatility',
    'field.rtp': 'RTP',
    'field.method': 'Method',
    'field.currency': 'Currency',
    
    // Event types
    'event.sportsbook_bet_placed': 'Sportsbook Bet Placed',
    'event.sportsbook_bet_placed.description': 'Triggered when user places a sports bet',
    'event.casino_bet_placed': 'Casino Bet Placed',
    'event.casino_bet_placed.description': 'Triggered when user places a casino bet',
    'event.deposit_made': 'Deposit Made',
    'event.deposit_made.description': 'Triggered when user makes a deposit',
    'event.withdrawal_requested': 'Withdrawal Requested',
    'event.withdrawal_requested.description': 'Triggered when user requests a withdrawal',
    'event.game_round_completed': 'Game Round Completed',
    'event.game_round_completed.description': 'Triggered when a game round is completed',
    'event.bonus_claimed': 'Bonus Claimed',
    'event.bonus_claimed.description': 'Triggered when user claims a bonus',
    'event.tournament_joined': 'Tournament Joined',
    'event.tournament_joined.description': 'Triggered when user joins a tournament',
    'event.level_up': 'Level Up',
    'event.level_up.description': 'Triggered when user levels up',
    
    // Bet types
    'bet_type.simples': 'Single',
    'bet_type.combinada': 'Accumulator',
    'bet_type.sistema': 'System',
    'bet_type.betbuilder': 'Bet Builder',
    
    // Sports
    'sport.futebol': 'Football',
    'sport.basquete': 'Basketball',
    'sport.tenis': 'Tennis',
    'sport.volei': 'Volleyball',
    'sport.futebol_americano': 'American Football',
    'sport.formula_1': 'Formula 1',
    'sport.mma': 'MMA',
    'sport.boxe': 'Boxing',
    'sport.esports': 'E-Sports',
    'sport.outros': 'Others',
  }
}

// Module components (placeholder for UI components)
const IGAMING_COMPONENTS: ModuleComponents = {
  // These would be React components specific to iGaming
  // RuleBuilder: iGamingRuleBuilder,
  // TemplateSelector: iGamingTemplateSelector,
  // FieldRenderer: iGamingFieldRenderer,
  // EventPreview: iGamingEventPreview,
  // MissionCard: iGamingMissionCard,
}

// Complete iGaming module definition
export const IGAMING_MODULE: ModuleDefinition = {
  name: 'igaming',
  label: 'iGaming',
  description: 'Módulo completo para apostas esportivas e cassino com suporte a sportsbook, cassino ao vivo, slots e jogos de mesa',
  icon: '🎮',
  version: '1.0.0',
  eventTypes: IGAMING_EVENT_TYPES,
  templates: IGAMING_TEMPLATES,
  validators: [], // IGAMING_VALIDATION_RULES would need to be converted to ModuleValidator[]
  components: IGAMING_COMPONENTS,
  translations: IGAMING_TRANSLATIONS,
  settings: {
    defaultCurrency: 'BRL',
    timezone: 'America/Sao_Paulo',
    dateFormat: 'DD/MM/YYYY',
    features: [
      {
        key: 'sportsbook',
        label: 'Apostas Esportivas',
        enabled: true,
        description: 'Sistema completo de apostas esportivas'
      },
      {
        key: 'casino',
        label: 'Cassino',
        enabled: true,
        description: 'Jogos de cassino e slots'
      },
      {
        key: 'live_casino',
        label: 'Cassino Ao Vivo',
        enabled: true,
        description: 'Jogos com dealers ao vivo'
      },
      {
        key: 'tournaments',
        label: 'Torneios',
        enabled: true,
        description: 'Sistema de torneios e competições'
      }
    ]
  }
}

// Helper function to get translation
export function getTranslation(key: string, locale: string = 'pt-BR', params?: Record<string, any>): string {
  const translations = IGAMING_TRANSLATIONS[locale] || IGAMING_TRANSLATIONS['pt-BR']
  let translation = translations[key] || key
  
  // Replace parameters if provided
  if (params) {
    Object.keys(params).forEach(param => {
      translation = translation.replace(`{${param}}`, params[param])
    })
  }
  
  return translation
}

// Helper function to get field label with fallback
export function getFieldLabel(fieldName: string, locale: string = 'pt-BR'): string {
  return getTranslation(`field.${fieldName}`, locale)
}

// Helper function to get event type info
export function getEventTypeInfo(eventKey: string, locale: string = 'pt-BR') {
  return {
    name: getTranslation(`event.${eventKey}`, locale),
    description: getTranslation(`event.${eventKey}.description`, locale)
  }
}