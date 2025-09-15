import { ModuleDefinition, ModuleComponents, ModuleTranslations, EventTypeDefinition } from '../../core/types'

// Engagement event types
const ENGAGEMENT_EVENT_TYPES: EventTypeDefinition[] = [
  {
    key: 'user_login',
    label: 'Login do Usuário',
    description: 'Disparado sempre que um usuário faz login na plataforma',
    icon: '🔐',
    category: 'activity',
    fields: [
      { name: 'login_method', label: 'Método de Login', type: 'enum', required: true,
        options: [
          { value: 'email', label: 'E-mail' },
          { value: 'social', label: 'Redes Sociais' },
          { value: 'phone', label: 'Telefone' }
        ],
        helper: 'Método utilizado para fazer login' },
      { name: 'device_type', label: 'Tipo do Dispositivo', type: 'enum', required: false,
        options: [
          { value: 'mobile', label: 'Mobile' },
          { value: 'desktop', label: 'Desktop' },
          { value: 'tablet', label: 'Tablet' }
        ],
        helper: 'Tipo do dispositivo usado' },
      { name: 'is_consecutive_day', label: 'Dia Consecutivo', type: 'boolean', required: false,
        helper: 'Se é dia consecutivo de login' },
      { name: 'days_streak', label: 'Sequência de Dias', type: 'number', required: false,
        validation: { min: 0 }, helper: 'Sequência atual de dias seguidos' }
    ]
  },
  {
    key: 'profile_completed',
    label: 'Perfil Completado',
    description: 'Disparado quando usuário completa seu perfil',
    icon: '👤',
    category: 'onboarding',
    fields: [
      { name: 'completion_percentage', label: 'Percentual Completude', type: 'number', required: true,
        validation: { min: 0, max: 100 }, helper: 'Percentual de completude do perfil' },
      { name: 'verification_level', label: 'Nível de Verificação', type: 'enum', required: false,
        options: [
          { value: 'basic', label: 'Básico' },
          { value: 'advanced', label: 'Avançado' },
          { value: 'complete', label: 'Completo' }
        ],
        helper: 'Nível de verificação do perfil' }
    ]
  },
  {
    key: 'referral_made',
    label: 'Indicação Realizada',
    description: 'Disparado quando usuário indica alguém com sucesso',
    icon: '👥',
    category: 'social',
    fields: [
      { name: 'referral_method', label: 'Método de Indicação', type: 'enum', required: true,
        options: [
          { value: 'link', label: 'Link de Indicação' },
          { value: 'code', label: 'Código de Indicação' },
          { value: 'social', label: 'Redes Sociais' }
        ],
        helper: 'Método usado para indicar' },
      { name: 'total_referrals', label: 'Total de Indicações', type: 'number', required: false,
        validation: { min: 0 }, helper: 'Total de indicações feitas pelo usuário' },
      { name: 'referral_bonus', label: 'Bônus da Indicação', type: 'currency', required: false,
        helper: 'Valor do bônus por indicação' }
    ]
  }
]

// Engagement translations
const ENGAGEMENT_TRANSLATIONS: ModuleTranslations = {
  'pt-BR': {
    'module.name': 'Engajamento',
    'module.description': 'Sistema de missões para engajamento de usuários',
    'field.login_method': 'Método de Login',
    'field.device_type': 'Tipo do Dispositivo',
    'field.days_streak': 'Sequência de Dias',
    'field.completion_percentage': 'Percentual Completude'
  }
}

// Engagement module definition
export const ENGAGEMENT_MODULE: ModuleDefinition = {
  name: 'engagement',
  label: 'Engajamento',
  description: 'Módulo para engajamento e retenção de usuários',
  icon: '💚',
  version: '1.0.0',
  eventTypes: ENGAGEMENT_EVENT_TYPES,
  templates: [],
  validators: [],
  components: {} as ModuleComponents,
  translations: ENGAGEMENT_TRANSLATIONS,
  settings: {
    defaultCurrency: 'BRL',
    timezone: 'America/Sao_Paulo',
    features: [
      { key: 'daily_login', label: 'Login Diário', enabled: true },
      { key: 'referral_system', label: 'Sistema de Indicações', enabled: true }
    ]
  }
}

export default ENGAGEMENT_MODULE