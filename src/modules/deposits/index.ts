import { ModuleDefinition, ModuleComponents, ModuleTranslations, EventTypeDefinition } from '../../core/types'

// Deposits event types
const DEPOSITS_EVENT_TYPES: EventTypeDefinition[] = [
  {
    key: 'deposit_completed',
    label: 'Depósito Realizado',
    description: 'Disparado quando um depósito é confirmado com sucesso',
    icon: '💳',
    category: 'financial',
    fields: [
      { name: 'amount', label: 'Valor', type: 'currency', required: true,
        validation: { min: 10, max: 100000 }, helper: 'Valor do depósito' },
      { name: 'payment_method', label: 'Método de Pagamento', type: 'enum', required: true,
        options: [
          { value: 'pix', label: 'PIX' },
          { value: 'credit_card', label: 'Cartão de Crédito' },
          { value: 'bank_transfer', label: 'Transferência Bancária' }
        ],
        helper: 'Método de pagamento utilizado' },
      { name: 'is_first_deposit', label: 'É Primeiro Depósito', type: 'boolean', required: false,
        helper: 'Se é o primeiro depósito do usuário' },
      { name: 'bonus_applied', label: 'Bônus Aplicado', type: 'boolean', required: false,
        helper: 'Se algum bônus foi aplicado' },
      { name: 'bonus_amount', label: 'Valor do Bônus', type: 'currency', required: false,
        helper: 'Valor do bônus recebido (se aplicável)' }
    ]
  },
  {
    key: 'large_deposit',
    label: 'Grande Depósito',
    description: 'Disparado quando um depósito acima de um valor específico é realizado',
    icon: '💰',
    category: 'financial',
    fields: [
      { name: 'amount', label: 'Valor', type: 'currency', required: true, helper: 'Valor do grande depósito' },
      { name: 'payment_method', label: 'Método de Pagamento', type: 'string', required: true, 
        helper: 'Método de pagamento utilizado' },
      { name: 'user_tier', label: 'Nível do Usuário', type: 'enum', required: false,
        options: [
          { value: 'bronze', label: 'Bronze' },
          { value: 'silver', label: 'Prata' },
          { value: 'gold', label: 'Ouro' },
          { value: 'vip', label: 'VIP' }
        ],
        helper: 'Nível do usuário no programa de fidelidade' }
    ]
  }
]

// Deposits translations
const DEPOSITS_TRANSLATIONS: ModuleTranslations = {
  'pt-BR': {
    'module.name': 'Depósitos',
    'module.description': 'Sistema de missões para depósitos e pagamentos',
    'field.amount': 'Valor',
    'field.payment_method': 'Método de Pagamento',
    'field.is_first_deposit': 'É Primeiro Depósito',
    'field.bonus_applied': 'Bônus Aplicado'
  }
}

// Deposits module definition
export const DEPOSITS_MODULE: ModuleDefinition = {
  name: 'deposits',
  label: 'Depósitos',
  description: 'Módulo para depósitos e transações financeiras',
  icon: '💳',
  version: '1.0.0',
  eventTypes: DEPOSITS_EVENT_TYPES,
  templates: [],
  validators: [],
  components: {} as ModuleComponents,
  translations: DEPOSITS_TRANSLATIONS,
  settings: {
    defaultCurrency: 'BRL',
    timezone: 'America/Sao_Paulo',
    features: [
      { key: 'instant_deposits', label: 'Depósitos Instantâneos', enabled: true },
      { key: 'deposit_bonuses', label: 'Bônus de Depósito', enabled: true }
    ]
  }
}

export default DEPOSITS_MODULE