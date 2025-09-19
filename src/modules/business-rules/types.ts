// Business Rules module types - ONLY for user/system validations
// This module provides ONLY fields that validate USER or SYSTEM state
// NO EVENT-SPECIFIC fields should be here (those go in trigger filters)

import {
  EventTypeDefinition,
  FieldDefinition,
  FieldOption
} from '@/core/types'

// User tier options for loyalty program
export const USER_TIER_OPTIONS: FieldOption[] = [
  { value: 'bronze', label: 'Bronze 🥉', helper: 'Nível inicial' },
  { value: 'silver', label: 'Prata 🥈', helper: 'Nível intermediário' },
  { value: 'gold', label: 'Ouro 🥇', helper: 'Nível alto' },
  { value: 'platinum', label: 'Platina 💎', helper: 'Nível premium' },
  { value: 'vip', label: 'VIP ⭐', helper: 'Nível máximo' }
]

// Account status options
export const ACCOUNT_STATUS_OPTIONS: FieldOption[] = [
  { value: 'active', label: 'Ativo ✅', helper: 'Conta funcionando normalmente' },
  { value: 'suspended', label: 'Suspenso ⏸️', helper: 'Conta temporariamente bloqueada' },
  { value: 'restricted', label: 'Restrito 🚫', helper: 'Conta com limitações' },
  { value: 'pending_verification', label: 'Aguardando Verificação 📋', helper: 'KYC em andamento' },
  { value: 'closed', label: 'Encerrada ❌', helper: 'Conta fechada' }
]

// Region options for geo-restrictions
export const REGION_OPTIONS: FieldOption[] = [
  { value: 'BR', label: 'Brasil 🇧🇷', helper: 'Usuários brasileiros' },
  { value: 'AR', label: 'Argentina 🇦🇷', helper: 'Usuários argentinos' },
  { value: 'CL', label: 'Chile 🇨🇱', helper: 'Usuários chilenos' },
  { value: 'CO', label: 'Colômbia 🇨🇴', helper: 'Usuários colombianos' },
  { value: 'MX', label: 'México 🇲🇽', helper: 'Usuários mexicanos' },
  { value: 'PE', label: 'Peru 🇵🇪', helper: 'Usuários peruanos' },
  { value: 'UY', label: 'Uruguai 🇺🇾', helper: 'Usuários uruguaios' }
]

// VIP level options (more granular than user_tier)
export const VIP_LEVEL_OPTIONS: FieldOption[] = [
  { value: '0', label: 'Nível 0 (Regular)', helper: 'Usuário padrão' },
  { value: '1', label: 'Nível 1 (Bronze VIP)', helper: 'VIP iniciante' },
  { value: '2', label: 'Nível 2 (Silver VIP)', helper: 'VIP intermediário' },
  { value: '3', label: 'Nível 3 (Gold VIP)', helper: 'VIP avançado' },
  { value: '4', label: 'Nível 4 (Platinum VIP)', helper: 'VIP premium' },
  { value: '5', label: 'Nível 5 (Diamond VIP)', helper: 'VIP máximo' }
]

// Device type options for cross-platform validation
export const DEVICE_TYPE_OPTIONS: FieldOption[] = [
  { value: 'mobile', label: 'Mobile 📱', helper: 'Smartphone ou tablet' },
  { value: 'desktop', label: 'Desktop 🖥️', helper: 'Computador' },
  { value: 'tablet', label: 'Tablet 📱', helper: 'Tablet específico' }
]

// BUSINESS RULES EVENT TYPES - These are NOT real events, just field containers
export const BUSINESS_RULES_FIELD_DEFINITIONS: FieldDefinition[] = [
  // USER PROFILE FIELDS
  {
    name: 'user_tier',
    label: 'Nível no Programa',
    type: 'enum',
    required: false,
    options: USER_TIER_OPTIONS,
    helper: 'Nível do usuário no programa de fidelidade'
  },
  {
    name: 'vip_level',
    label: 'Nível VIP',
    type: 'enum',
    required: false,
    options: VIP_LEVEL_OPTIONS,
    helper: 'Nível VIP específico (mais granular que tier)'
  },
  {
    name: 'account_age',
    label: 'Idade da Conta (dias)',
    type: 'number',
    required: false,
    helper: 'Quantos dias desde o cadastro',
    validation: { min: 0, max: 3650 },
    placeholder: '30'
  },
  {
    name: 'account_status',
    label: 'Status da Conta',
    type: 'enum',
    required: false,
    options: ACCOUNT_STATUS_OPTIONS,
    helper: 'Status atual da conta do usuário'
  },

  // VERIFICATION FIELDS
  {
    name: 'kyc_verified',
    label: 'KYC Verificado',
    type: 'boolean',
    required: false,
    helper: 'Se o usuário passou pela verificação de identidade'
  },
  {
    name: 'phone_verified',
    label: 'Telefone Verificado',
    type: 'boolean',
    required: false,
    helper: 'Se o telefone foi verificado'
  },
  {
    name: 'email_verified',
    label: 'Email Verificado',
    type: 'boolean',
    required: false,
    helper: 'Se o email foi verificado'
  },

  // GEOGRAPHIC FIELDS
  {
    name: 'region',
    label: 'Região',
    type: 'enum',
    required: false,
    options: REGION_OPTIONS,
    helper: 'País/região do usuário'
  },
  {
    name: 'timezone',
    label: 'Fuso Horário',
    type: 'string',
    required: false,
    helper: 'Fuso horário do usuário',
    placeholder: 'America/Sao_Paulo'
  },

  // BEHAVIORAL LIMITS
  {
    name: 'daily_bet_limit',
    label: 'Limite de Aposta Diária',
    type: 'currency',
    required: false,
    helper: 'Limite máximo de apostas por dia',
    validation: { min: 0, max: 100000 },
    placeholder: '1000'
  },
  {
    name: 'monthly_deposit_limit',
    label: 'Limite de Depósito Mensal',
    type: 'currency',
    required: false,
    helper: 'Limite máximo de depósitos por mês',
    validation: { min: 0, max: 1000000 },
    placeholder: '5000'
  },
  {
    name: 'withdrawal_limit_daily',
    label: 'Limite de Saque Diário',
    type: 'currency',
    required: false,
    helper: 'Limite máximo de saques por dia',
    validation: { min: 0, max: 100000 },
    placeholder: '2000'
  },

  // HISTORICAL DATA
  {
    name: 'total_deposits',
    label: 'Total de Depósitos',
    type: 'currency',
    required: false,
    helper: 'Soma de todos os depósitos do usuário',
    validation: { min: 0 }
  },
  {
    name: 'total_withdrawals',
    label: 'Total de Saques',
    type: 'currency',
    required: false,
    helper: 'Soma de todos os saques do usuário',
    validation: { min: 0 }
  },
  {
    name: 'total_bets_amount',
    label: 'Volume Total Apostado',
    type: 'currency',
    required: false,
    helper: 'Volume total já apostado pelo usuário',
    validation: { min: 0 }
  },
  {
    name: 'total_wins_amount',
    label: 'Total Ganho',
    type: 'currency',
    required: false,
    helper: 'Total ganho pelo usuário',
    validation: { min: 0 }
  },

  // TIME-BASED FIELDS
  {
    name: 'registration_date',
    label: 'Data de Cadastro',
    type: 'date',
    required: false,
    helper: 'Quando o usuário se cadastrou'
  },
  {
    name: 'last_login',
    label: 'Último Login',
    type: 'date',
    required: false,
    helper: 'Data do último login'
  },
  {
    name: 'last_deposit_date',
    label: 'Data do Último Depósito',
    type: 'date',
    required: false,
    helper: 'Quando foi o último depósito'
  },
  {
    name: 'last_bet_date',
    label: 'Data da Última Aposta',
    type: 'date',
    required: false,
    helper: 'Quando foi a última aposta'
  },

  // DEVICE & TECHNICAL
  {
    name: 'preferred_device',
    label: 'Dispositivo Preferido',
    type: 'enum',
    required: false,
    options: DEVICE_TYPE_OPTIONS,
    helper: 'Tipo de dispositivo mais usado'
  },
  {
    name: 'login_count_7d',
    label: 'Logins em 7 dias',
    type: 'number',
    required: false,
    helper: 'Quantos logins nos últimos 7 dias',
    validation: { min: 0, max: 100 }
  },
  {
    name: 'bet_count_30d',
    label: 'Apostas em 30 dias',
    type: 'number',
    required: false,
    helper: 'Quantas apostas nos últimos 30 dias',
    validation: { min: 0, max: 10000 }
  }
]

// Event type definition (virtual - just for organizing fields)
export const BUSINESS_RULES_EVENT_TYPE: EventTypeDefinition = {
  key: 'business_rules',
  label: 'Regras de Negócio',
  description: 'Validações específicas de usuário e sistema (uso raramente - 5% dos casos)',
  icon: '🏢',
  category: 'system',
  fields: BUSINESS_RULES_FIELD_DEFINITIONS,
  examples: [
    {
      title: 'Usuário VIP apenas',
      description: 'Missão disponível apenas para usuários VIP',
      data: { user_tier: 'vip' }
    },
    {
      title: 'Conta verificada e antiga',
      description: 'Missão para usuários com conta verificada e mais de 30 dias',
      data: { kyc_verified: true, account_age: 30 }
    },
    {
      title: 'Região específica',
      description: 'Missão apenas para usuários brasileiros',
      data: { region: 'BR' }
    }
  ],
  tags: ['business', 'validation', 'user', 'system']
}

export default BUSINESS_RULES_FIELD_DEFINITIONS