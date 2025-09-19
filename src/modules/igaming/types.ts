// iGaming module types - Specific for Sportsbook + Casino
// This module provides specialized event types, fields, and templates for gambling platforms

import { 
  EventTypeDefinition,
  FieldDefinition,
  FieldOption 
} from '@/core/types'

// iGaming specific event types
export type iGamingEventType = 
  | 'sportsbook_bet_placed'    // Aposta esportiva
  | 'casino_bet_placed'        // Aposta casino
  | 'live_casino_bet_placed'   // Casino ao vivo
  | 'slot_spin'                // Giro de slot específico
  | 'table_game_played'        // Jogo de mesa
  | 'jackpot_won'              // Jackpot ganho
  | 'bonus_activated'          // Bônus ativado
  | 'cashout_performed'        // Cash out realizado
  | 'tournament_joined'        // Torneio participado
  | 'vip_level_upgraded'       // Upgrade de VIP

// Sportsbook specific options
export const SPORTS_OPTIONS: FieldOption[] = [
  { value: 'futebol', label: 'Futebol ⚽', helper: 'Modalidade mais popular no Brasil' },
  { value: 'basquete', label: 'Basquete 🏀', helper: 'NBA, NBB e competições internacionais' },
  { value: 'tenis', label: 'Tênis 🎾', helper: 'ATP, WTA, Grand Slams' },
  { value: 'volei', label: 'Vôlei 🏐', helper: 'Superliga, seleções nacionais' },
  { value: 'mma', label: 'MMA 🥊', helper: 'UFC, Bellator, ONE Championship' },
  { value: 'formula1', label: 'Fórmula 1 🏎️', helper: 'Grande Prêmios, campeonatos' },
  { value: 'esports', label: 'E-Sports 🎮', helper: 'CS:GO, Dota 2, LoL, Valorant' }
]

export const BET_TYPE_OPTIONS: FieldOption[] = [
  { 
    value: 'simples', 
    label: 'Simples', 
    helper: 'Aposta em um único evento. Mais fácil de acertar.',
    icon: '🎯'
  },
  { 
    value: 'combinada', 
    label: 'Combinada', 
    helper: 'Múltiplas seleções, todas devem acertar. Odds multiplicadas.',
    icon: '🔗'
  },
  { 
    value: 'sistema', 
    label: 'Sistema', 
    helper: 'Permite erros parciais. Exemplo: 3/5 acertos ainda paga.',
    icon: '🔢'
  },
  { 
    value: 'betbuilder', 
    label: 'Bet Builder', 
    helper: 'Múltiplas apostas do mesmo jogo. Ex: Resultado + Gols.',
    icon: '🏗️'
  }
]

export const CHAMPIONSHIP_OPTIONS: FieldOption[] = [
  { value: 'brasileirao_a', label: 'Brasileirão Série A', icon: '🇧🇷' },
  { value: 'brasileirao_b', label: 'Brasileirão Série B', icon: '🇧🇷' },
  { value: 'copa_do_brasil', label: 'Copa do Brasil', icon: '🏆' },
  { value: 'champions_league', label: 'Champions League', icon: '⭐' },
  { value: 'europa_league', label: 'Europa League', icon: '🌍' },
  { value: 'premier_league', label: 'Premier League', icon: '🇬🇧' },
  { value: 'la_liga', label: 'La Liga', icon: '🇪🇸' },
  { value: 'bundesliga', label: 'Bundesliga', icon: '🇩🇪' },
  { value: 'serie_a', label: 'Serie A (Itália)', icon: '🇮🇹' },
  { value: 'ligue1', label: 'Ligue 1', icon: '🇫🇷' },
  { value: 'copa_america', label: 'Copa América', icon: '🌎' },
  { value: 'copa_mundo', label: 'Copa do Mundo', icon: '🌏' }
]

export const MARKET_TYPE_OPTIONS: FieldOption[] = [
  { value: 'resultado_final', label: 'Resultado Final', helper: '1, X ou 2' },
  { value: 'over_under', label: 'Over/Under', helper: 'Total de gols acima/abaixo' },
  { value: 'handicap', label: 'Handicap', helper: 'Vantagem/desvantagem virtual' },
  { value: 'ambas_marcam', label: 'Ambas Marcam', helper: 'Os dois times fazem gol' },
  { value: 'dupla_chance', label: 'Dupla Chance', helper: 'Duas possibilidades em uma' },
  { value: 'primeiro_gol', label: 'Primeiro Gol', helper: 'Qual time marca primeiro' },
  { value: 'total_gols', label: 'Total de Gols', helper: 'Número exato de gols' },
  { value: 'intervalo_final', label: 'Intervalo/Final', helper: 'Resultado no intervalo e final' }
]

// Casino specific options
export const GAME_PROVIDER_OPTIONS: FieldOption[] = [
  { value: 'pragmatic_play', label: 'Pragmatic Play', icon: '🎰', helper: 'Gates of Olympus, Sweet Bonanza' },
  { value: 'evolution', label: 'Evolution Gaming', icon: '🎲', helper: 'Líder em jogos ao vivo' },
  { value: 'netent', label: 'NetEnt', icon: '🎮', helper: 'Starburst, Gonzo\'s Quest' },
  { value: 'microgaming', label: 'Microgaming', icon: '🃏', helper: 'Mega Moolah, Immortal Romance' },
  { value: 'playtech', label: 'Playtech', icon: '♠️', helper: 'Age of the Gods series' },
  { value: 'quickspin', label: 'Quickspin', icon: '💫', helper: 'Big Bad Wolf, Sakura Fortune' },
  { value: 'yggdrasil', label: 'Yggdrasil', icon: '🌳', helper: 'Vikings, Valley of the Gods' }
]

export const GAME_CATEGORY_OPTIONS: FieldOption[] = [
  { value: 'slots', label: 'Slots/Caça-Níqueis', icon: '🎰', helper: 'Jogos de bobinas e linhas' },
  { value: 'blackjack', label: 'Blackjack', icon: '🃏', helper: 'Clássico jogo de cartas 21' },
  { value: 'roleta', label: 'Roleta', icon: '🎡', helper: 'Europeia, americana, francesa' },
  { value: 'baccarat', label: 'Baccarat', icon: '🎭', helper: 'Jogo preferido dos high-rollers' },
  { value: 'poker', label: 'Poker', icon: '♠️', helper: 'Texas Hold\'em, Omaha' },
  { value: 'crash_games', label: 'Crash Games', icon: '📈', helper: 'Aviator, JetX, Spaceman' },
  { value: 'game_shows', label: 'Game Shows', icon: '🎪', helper: 'Crazy Time, Monopoly Live' },
  { value: 'instant_win', label: 'Instant Win', icon: '⚡', helper: 'Scratch cards, keno' }
]

export const GAME_THEME_OPTIONS: FieldOption[] = [
  { value: 'frutas', label: 'Frutas 🍒', helper: 'Clássicos com frutas' },
  { value: 'aventura', label: 'Aventura 🗺️', helper: 'Explorações e tesouros' },
  { value: 'mitologia', label: 'Mitologia ⚡', helper: 'Deuses gregos, nórdicos' },
  { value: 'egito', label: 'Egito Antigo 🏺', helper: 'Pirâmides, faraós' },
  { value: 'animais', label: 'Animais 🐺', helper: 'Vida selvagem' },
  { value: 'fantasy', label: 'Fantasia 🐉', helper: 'Dragões, magia' },
  { value: 'horror', label: 'Horror 👻', helper: 'Vampiros, zumbis' },
  { value: 'space', label: 'Espacial 🚀', helper: 'Ficção científica' },
  { value: 'irish', label: 'Irlandês 🍀', helper: 'Leprechauns, trevo' },
  { value: 'asian', label: 'Asiático 🐉', helper: 'Cultura oriental' }
]

export const VOLATILITY_OPTIONS: FieldOption[] = [
  { 
    value: 'baixa', 
    label: 'Baixa 📊', 
    helper: 'Pagamentos frequentes, valores menores. Menos risco.' 
  },
  { 
    value: 'media', 
    label: 'Média ⚖️', 
    helper: 'Equilíbrio entre frequência e valores. Risco moderado.' 
  },
  { 
    value: 'alta', 
    label: 'Alta 🚀', 
    helper: 'Pagamentos raros, valores maiores. Mais risco.' 
  }
]

// Event type definitions for iGaming
export const IGAMING_EVENT_TYPES: EventTypeDefinition[] = [
  {
    key: 'sportsbook_bet_placed',
    label: 'Aposta Esportiva',
    description: 'Aposta realizada no sportsbook',
    icon: '⚽',
    category: 'sportsbook',
    fields: [
      {
        name: 'amount',
        label: 'Valor da Aposta',
        type: 'currency',
        required: true,
        helper: 'Valor em reais apostado',
        placeholder: 'R$ 10,00',
        validation: { min: 1, max: 50000 }
      },
      {
        name: 'bet_type',
        label: 'Tipo de Aposta',
        type: 'enum',
        required: true,
        options: BET_TYPE_OPTIONS,
        helper: 'Modalidade da aposta realizada'
      },
      {
        name: 'sport',
        label: 'Esporte',
        type: 'enum',
        required: true,
        options: SPORTS_OPTIONS,
        helper: 'Modalidade esportiva'
      },
      {
        name: 'championship',
        label: 'Campeonato',
        type: 'enum',
        required: false,
        options: CHAMPIONSHIP_OPTIONS,
        helper: 'Competição específica',
        dependsOn: 'sport',
        showWhen: { sport: 'futebol' }
      },
      {
        name: 'market_type',
        label: 'Tipo de Mercado',
        type: 'enum',
        required: false,
        options: MARKET_TYPE_OPTIONS,
        helper: 'Tipo de aposta realizada'
      },
      {
        name: 'selections_count',
        label: 'Número de Seleções',
        type: 'number',
        required: false,
        helper: 'Quantas seleções na aposta',
        validation: { min: 1, max: 20 },
        showWhen: { bet_type: ['combinada', 'sistema', 'betbuilder'] }
      },
      {
        name: 'odds_total',
        label: 'Odd Total',
        type: 'number',
        required: false,
        helper: 'Odd final da aposta',
        placeholder: '2.50',
        validation: { min: 1.01, max: 1000 }
      },
      {
        name: 'bet_timing',
        label: 'Timing da Aposta',
        type: 'enum',
        required: false,
        options: [
          { value: 'pre_game', label: 'Pré-jogo 📋', helper: 'Aposta antes do jogo começar' },
          { value: 'live', label: 'Ao Vivo 🔴', helper: 'Aposta durante o jogo' }
        ],
        helper: 'Quando a aposta foi realizada'
      },
      {
        name: 'team_home',
        label: 'Time Casa',
        type: 'string',
        required: false,
        helper: 'Nome do time que joga em casa',
        placeholder: 'Flamengo'
      },
      {
        name: 'team_away',
        label: 'Time Visitante',
        type: 'string',
        required: false,
        helper: 'Nome do time visitante',
        placeholder: 'Palmeiras'
      }
    ],
    examples: [
      {
        title: 'Aposta Simples',
        description: 'Aposta de R$20 no Flamengo para vencer',
        data: {
          amount: 20,
          bet_type: 'simples',
          sport: 'futebol',
          championship: 'brasileirao_a',
          market_type: 'resultado_final',
          odds_total: 2.1,
          bet_timing: 'pre_game',
          team_home: 'Flamengo',
          team_away: 'Palmeiras'
        }
      }
    ],
    tags: ['sportsbook', 'aposta', 'esporte']
  },

  {
    key: 'casino_bet_placed',
    label: 'Aposta Casino',
    description: 'Aposta realizada em jogos de casino',
    icon: '🎰',
    category: 'casino',
    fields: [
      {
        name: 'amount',
        label: 'Valor da Aposta',
        type: 'currency',
        required: true,
        helper: 'Valor em reais apostado',
        validation: { min: 0.5, max: 10000 }
      },
      {
        name: 'game_id',
        label: 'ID do Jogo',
        type: 'string',
        required: true,
        helper: 'Identificador único do jogo',
        placeholder: 'gates-of-olympus'
      },
      {
        name: 'game_name',
        label: 'Nome do Jogo',
        type: 'string',
        required: false,
        helper: 'Nome comercial do jogo',
        placeholder: 'Gates of Olympus'
      },
      {
        name: 'game_category',
        label: 'Categoria do Jogo',
        type: 'enum',
        required: true,
        options: GAME_CATEGORY_OPTIONS,
        helper: 'Tipo de jogo de casino'
      },
      {
        name: 'provider',
        label: 'Provedor',
        type: 'enum',
        required: true,
        options: GAME_PROVIDER_OPTIONS,
        helper: 'Empresa desenvolvedora do jogo'
      },
      {
        name: 'game_theme',
        label: 'Tema do Jogo',
        type: 'enum',
        required: false,
        options: GAME_THEME_OPTIONS,
        helper: 'Temática visual do jogo',
        showWhen: { game_category: 'slots' }
      },
      {
        name: 'volatility',
        label: 'Volatilidade',
        type: 'enum',
        required: false,
        options: VOLATILITY_OPTIONS,
        helper: 'Nível de risco/recompensa',
        showWhen: { game_category: 'slots' }
      },
      {
        name: 'rtp',
        label: 'RTP (%)',
        type: 'number',
        required: false,
        helper: 'Return to Player - percentual de retorno',
        placeholder: '96.5',
        validation: { min: 80, max: 99.9 },
        showWhen: { game_category: 'slots' }
      },
      {
        name: 'win_amount',
        label: 'Valor Ganho',
        type: 'currency',
        required: false,
        helper: 'Valor ganho nesta rodada',
        validation: { min: 0 }
      },
      {
        name: 'multiplier',
        label: 'Multiplicador',
        type: 'number',
        required: false,
        helper: 'Multiplicador obtido (se aplicável)',
        placeholder: '5.5x',
        validation: { min: 0 }
      }
    ],
    examples: [
      {
        title: 'Slot Win',
        description: 'Vitória de R$50 no Gates of Olympus',
        data: {
          amount: 2,
          game_id: 'gates-of-olympus',
          game_name: 'Gates of Olympus',
          game_category: 'slots',
          provider: 'pragmatic_play',
          game_theme: 'mitologia',
          win_amount: 50,
          multiplier: 25
        }
      }
    ],
    tags: ['casino', 'slot', 'jogo']
  },

  {
    key: 'live_casino_bet_placed',
    label: 'Casino Ao Vivo',
    description: 'Aposta em mesa de casino ao vivo',
    icon: '🎲',
    category: 'live_casino',
    fields: [
      {
        name: 'amount',
        label: 'Valor da Aposta',
        type: 'currency',
        required: true,
        helper: 'Valor apostado na mesa'
      },
      {
        name: 'game_type',
        label: 'Tipo de Jogo',
        type: 'enum',
        required: true,
        options: [
          { value: 'blackjack', label: 'Blackjack 🃏' },
          { value: 'roleta', label: 'Roleta 🎡' },
          { value: 'baccarat', label: 'Baccarat 🎭' },
          { value: 'game_show', label: 'Game Show 🎪' }
        ],
        helper: 'Tipo de mesa ao vivo'
      },
      {
        name: 'table_id',
        label: 'ID da Mesa',
        type: 'string',
        required: true,
        helper: 'Identificador da mesa',
        placeholder: 'blackjack-vip-1'
      },
      {
        name: 'dealer_name',
        label: 'Nome do Dealer',
        type: 'string',
        required: false,
        helper: 'Nome do crupiê',
        placeholder: 'Maria'
      },
      {
        name: 'bet_position',
        label: 'Posição da Aposta',
        type: 'string',
        required: false,
        helper: 'Onde a aposta foi colocada',
        placeholder: 'Vermelho, Par, 1-18'
      }
    ],
    tags: ['live', 'casino', 'dealer']
  },

  // ========== GENERAL EVENTS ==========
  {
    key: 'deposit_made',
    label: 'Depósito Realizado',
    description: 'Usuário fez um depósito na conta',
    icon: '💰',
    category: 'general',
    fields: [
      {
        name: 'amount',
        label: 'Valor do Depósito',
        type: 'currency',
        required: true,
        helper: 'Valor depositado em reais',
        validation: { min: 10, max: 100000 }
      },
      {
        name: 'method',
        label: 'Método de Pagamento',
        type: 'enum',
        required: true,
        options: [
          { value: 'pix', label: 'PIX 📱' },
          { value: 'credit_card', label: 'Cartão de Crédito 💳' },
          { value: 'debit_card', label: 'Cartão de Débito 💳' },
          { value: 'bank_transfer', label: 'Transferência Bancária 🏦' },
          { value: 'crypto', label: 'Criptomoeda 🪙' }
        ],
        helper: 'Forma de pagamento utilizada'
      },
      {
        name: 'first_deposit',
        label: 'Primeiro Depósito (iGaming)',
        type: 'boolean',
        required: false,
        helper: 'É o primeiro depósito do usuário?'
      }
    ],
    tags: ['deposit', 'payment', 'financial']
  },

  {
    key: 'withdrawal_requested',
    label: 'Saque Solicitado',
    description: 'Usuário solicitou um saque',
    icon: '💸',
    category: 'general',
    fields: [
      {
        name: 'amount',
        label: 'Valor do Saque',
        type: 'currency',
        required: true,
        helper: 'Valor solicitado para saque'
      },
      {
        name: 'method',
        label: 'Método de Saque',
        type: 'enum',
        required: true,
        options: [
          { value: 'pix', label: 'PIX 📱' },
          { value: 'bank_transfer', label: 'Transferência Bancária 🏦' }
        ],
        helper: 'Forma de recebimento'
      }
    ],
    tags: ['withdrawal', 'payment', 'financial']
  },

  {
    key: 'user_login',
    label: 'Login Realizado',
    description: 'Usuário fez login na plataforma',
    icon: '🔐',
    category: 'general',
    fields: [
      {
        name: 'login_method',
        label: 'Método de Login',
        type: 'enum',
        required: false,
        options: [
          { value: 'email', label: 'Email 📧' },
          { value: 'phone', label: 'Telefone 📱' },
          { value: 'social', label: 'Login Social 🌐' }
        ],
        helper: 'Como o usuário fez login'
      },
      {
        name: 'consecutive_days',
        label: 'Dias Consecutivos',
        type: 'number',
        required: false,
        helper: 'Quantos dias consecutivos de login',
        validation: { min: 1 }
      }
    ],
    tags: ['login', 'engagement', 'access']
  },

  {
    key: 'bonus_claimed',
    label: 'Bônus Reivindicado',
    description: 'Usuário reivindicou um bônus',
    icon: '🎁',
    category: 'general',
    fields: [
      {
        name: 'bonus_type',
        label: 'Tipo de Bônus',
        type: 'enum',
        required: true,
        options: [
          { value: 'deposit', label: 'Bônus de Depósito 💰' },
          { value: 'cashback', label: 'Cashback 💵' },
          { value: 'free_spins', label: 'Giros Grátis 🎰' },
          { value: 'free_bet', label: 'Aposta Grátis ⚽' }
        ],
        helper: 'Tipo de bônus reivindicado'
      },
      {
        name: 'bonus_value',
        label: 'Valor do Bônus',
        type: 'currency',
        required: true,
        helper: 'Valor do bônus em reais'
      }
    ],
    tags: ['bonus', 'reward', 'promotion']
  },

  {
    key: 'daily_activity',
    label: 'Atividade Diária',
    description: 'Usuário realizou atividade no dia',
    icon: '📅',
    category: 'general',
    fields: [
      {
        name: 'streak_days',
        label: 'Dias em Sequência',
        type: 'number',
        required: false,
        helper: 'Número de dias consecutivos com atividade',
        validation: { min: 1, max: 365 }
      },
      {
        name: 'activity_type',
        label: 'Tipo de Atividade',
        type: 'enum',
        required: false,
        options: [
          { value: 'login', label: 'Login 🔐' },
          { value: 'bet', label: 'Aposta 🎲' },
          { value: 'deposit', label: 'Depósito 💰' },
          { value: 'game', label: 'Jogo 🎮' }
        ],
        helper: 'Tipo de atividade realizada'
      },
      {
        name: 'activity_count',
        label: 'Quantidade de Atividades',
        type: 'number',
        required: false,
        helper: 'Número de atividades no dia',
        validation: { min: 1, max: 1000 }
      }
    ],
    tags: ['engagement', 'daily', 'activity']
  },

  {
    key: 'first_action',
    label: 'Primeira Ação',
    description: 'Primeira ação do usuário na plataforma',
    icon: '🎯',
    category: 'general',
    fields: [
      {
        name: 'action_type',
        label: 'Tipo de Ação',
        type: 'enum',
        required: true,
        options: [
          { value: 'registration', label: 'Cadastro 📝' },
          { value: 'deposit', label: 'Depósito 💰' },
          { value: 'bet', label: 'Aposta 🎲' },
          { value: 'game', label: 'Jogo 🎮' }
        ],
        helper: 'Primeira ação realizada'
      },
      {
        name: 'timestamp',
        label: 'Data/Hora',
        type: 'string',
        required: false,
        helper: 'Quando a ação ocorreu'
      }
    ],
    tags: ['onboarding', 'first', 'engagement']
  }
]

// Validation rules specific for iGaming
export const IGAMING_VALIDATION_RULES = {
  // Sportsbook validations
  validateSportsbookBet: (data: any) => {
    const errors: string[] = []
    
    if (data.bet_type === 'combinada' && (!data.selections_count || data.selections_count < 2)) {
      errors.push('Apostas combinadas devem ter pelo menos 2 seleções')
    }
    
    if (data.bet_type === 'simples' && data.selections_count > 1) {
      errors.push('Apostas simples só podem ter 1 seleção')
    }
    
    if (data.odds_total && data.odds_total < 1.01) {
      errors.push('Odd deve ser maior que 1.01')
    }
    
    return errors
  },
  
  // Casino validations
  validateCasinoBet: (data: any) => {
    const errors: string[] = []
    
    if (data.rtp && (data.rtp < 80 || data.rtp > 99.9)) {
      errors.push('RTP deve estar entre 80% e 99.9%')
    }
    
    if (data.win_amount && data.win_amount < 0) {
      errors.push('Valor ganho não pode ser negativo')
    }
    
    if (data.multiplier && data.multiplier < 0) {
      errors.push('Multiplicador não pode ser negativo')
    }
    
    return errors
  }
}

export default IGAMING_EVENT_TYPES