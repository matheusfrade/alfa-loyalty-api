import React, { useState } from 'react'
import { Zap, Target, Trophy, Clock, Gift, DollarSign, Gamepad2, Activity, Wallet, Star } from 'lucide-react'
import type { BaseMissionRule, ConditionGroup } from '../../core/types'

export interface MissionTemplate {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  vertical: 'igaming' | 'engagement' | 'deposits' | 'sportsbook' | 'casino'
  category: 'beginner' | 'intermediate' | 'advanced'
  module: string // Which module to use
  rule: BaseMissionRule
  reward: number
  xp: number
  timeWindow?: string
  cooldown?: number
  maxClaims?: number
}

const templates: MissionTemplate[] = [
  // ========== TEMPLATES ATUALIZADOS ==========
  {
    id: 'sportsbook-beginner',
    name: 'Primeira Aposta Esportiva',
    description: 'Faça sua primeira aposta em esportes de R$ 10',
    icon: <Gamepad2 className="w-5 h-5" />,
    vertical: 'sportsbook',
    category: 'beginner',
    module: 'sportsbook',
    rule: {
      triggers: [
        { event: 'bet_placed', aggregation: 'count' }
      ],
      conditionTree: {
        type: 'AND',
        conditions: [
          { field: 'bet_amount_sportsbook', operator: '>=', value: 10 }
        ]
      },
      conditions: [],
      logic: 'AND'
    },
    reward: 50,
    xp: 100,
    maxClaims: 1
  },
  {
    id: 'casino-or-sportsbook',
    name: 'Apostador Flexível',
    description: 'Aposte R$ 50+ em esportes OU R$ 50+ em casino',
    icon: <Target className="w-5 h-5" />,
    vertical: 'igaming',
    category: 'intermediate',
    module: 'igaming',
    rule: {
      triggers: [
        { event: 'bet_placed' },
        { event: 'spin' }
      ],
      conditionTree: {
        type: 'OR',
        conditions: [
          { field: 'bet_amount_sportsbook', operator: '>=', value: 50 },
          { field: 'bet_amount_casino', operator: '>=', value: 50 }
        ]
      },
      conditions: [],
      logic: 'OR'
    },
    reward: 100,
    xp: 200,
    maxClaims: 1
  },
  {
    id: 'igaming-vip-player',
    name: 'Jogador VIP Multi-Produto',
    description: 'Aposte R$ 250+ em esportes E R$ 250+ em casino na semana',
    icon: <Star className="w-5 h-5" />,
    vertical: 'igaming',
    category: 'advanced',
    module: 'igaming',
    rule: {
      triggers: [
        { 
          event: 'bet_placed', 
          debounce: 10000,
          aggregation: 'sum'
        },
        { 
          event: 'spin', 
          debounce: 10000,
          aggregation: 'sum'
        }
      ],
      conditionTree: {
        type: 'AND',
        conditions: [
          { field: 'bet_amount_sportsbook', operator: '>=', value: 250 },
          { field: 'bet_amount_casino', operator: '>=', value: 250 }
        ]
      },
      conditions: [],
      logic: 'AND',
      timeWindow: { duration: '7d', sliding: false }
    },
    reward: 250,
    xp: 500,
    timeWindow: '7d',
    cooldown: 604800
  },
  
  {
    id: 'first-deposit-bonus',
    name: 'Bônus de Primeiro Depósito',
    description: 'Faça seu primeiro depósito de R$ 50+ e ganhe bônus',
    icon: <Wallet className="w-5 h-5" />,
    vertical: 'deposits',
    category: 'beginner',
    module: 'igaming',
    rule: {
      triggers: [
        { event: 'deposit_made' }
      ],
      conditions: [
        { field: 'amount', operator: '>=', value: 50 },
        { field: 'first_deposit', operator: '==', value: true }
      ],
      logic: 'AND',
      maxClaims: 1
    },
    reward: 100,
    xp: 200,
    maxClaims: 1
  },

  // ========== ENGAGEMENT TEMPLATES (Multi-Vertical) ==========
  {
    id: 'daily-login',
    name: 'Login Diário',
    description: 'Faça login todos os dias para ganhar recompensas',
    icon: <Activity className="w-5 h-5" />,
    vertical: 'engagement',
    category: 'beginner',
    module: 'igaming', // Can use any module
    rule: {
      triggers: [{
        event: 'user_login'
      }],
      conditions: [],
      logic: 'AND',
      timeWindow: { duration: '1d', sliding: false }
    },
    reward: 10,
    xp: 20,
    timeWindow: '1d',
    cooldown: 86400
  },
  {
    id: 'streak-7days',
    name: 'Sequência de 7 Dias',
    description: 'Mantenha atividade por 7 dias consecutivos',
    icon: <Target className="w-5 h-5" />,
    vertical: 'engagement',
    category: 'intermediate',
    module: 'igaming',
    rule: {
      triggers: [{
        event: 'daily_activity'
      }],
      conditions: [
        { field: 'streak_days', operator: '>=', value: 7 }
      ],
      logic: 'AND',
      timeWindow: { duration: '7d', sliding: true }
    },
    reward: 200,
    xp: 400,
    timeWindow: '7d'
  },
  {
    id: 'first-action',
    name: 'Primeira Ação',
    description: 'Complete sua primeira ação na plataforma',
    icon: <Zap className="w-5 h-5" />,
    vertical: 'engagement',
    category: 'beginner',
    module: 'igaming',
    rule: {
      triggers: [{
        event: 'first_action'
      }],
      conditions: [],
      logic: 'AND',
      maxClaims: 1
    },
    reward: 25,
    xp: 50,
    maxClaims: 1
  },

  // ========== DEPOSITS TEMPLATES (Multi-Vertical) ==========
  {
    id: 'first-deposit',
    name: 'Primeiro Depósito',
    description: 'Faça seu primeiro depósito e ganhe bônus',
    icon: <Wallet className="w-5 h-5" />,
    vertical: 'deposits',
    category: 'beginner',
    module: 'igaming',
    rule: {
      triggers: [{
        event: 'deposit_made'
      }],
      conditions: [
        { field: 'deposit_amount', operator: '>=', value: 20 }
      ],
      logic: 'AND',
      maxClaims: 1
    },
    reward: 50,
    xp: 100,
    maxClaims: 1
  },
  {
    id: 'weekly-deposit',
    name: 'Depósito Semanal',
    description: 'Deposite pelo menos R$ 100 por semana',
    icon: <DollarSign className="w-5 h-5" />,
    vertical: 'deposits',
    category: 'intermediate',
    module: 'igaming',
    rule: {
      triggers: [{
        event: 'deposit_made',
        debounce: 3600000 // 1 hour
      }],
      conditions: [
        { field: 'deposit_amount', operator: '>=', value: 100 }
      ],
      logic: 'AND',
      timeWindow: { duration: '7d', sliding: false }
    },
    reward: 75,
    xp: 150,
    timeWindow: '7d',
    cooldown: 604800
  },
  {
    id: 'vip-deposit',
    name: 'Depósito VIP',
    description: 'Deposite R$ 1000+ e ganhe status VIP temporário',
    icon: <Gift className="w-5 h-5" />,
    vertical: 'deposits',
    category: 'advanced',
    module: 'igaming',
    rule: {
      triggers: [{
        event: 'deposit_made'
      }],
      conditions: [
        { field: 'deposit_amount', operator: '>=', value: 1000 }
      ],
      logic: 'AND',
      timeWindow: { duration: '30d', sliding: false }
    },
    reward: 500,
    xp: 1000,
    timeWindow: '30d',
    maxClaims: 3
  },

  // ========== SPORTSBOOK TEMPLATES ==========
  {
    id: 'first-sports-bet',
    name: 'Primeira Aposta Esportiva',
    description: 'Faça sua primeira aposta em esportes',
    icon: <Trophy className="w-5 h-5" />,
    vertical: 'sportsbook',
    category: 'beginner',
    module: 'igaming',
    rule: {
      triggers: [{
        event: 'sportsbook_bet_placed'
      }],
      conditions: [
        { field: 'bet_amount', operator: '>=', value: 10 }
      ],
      logic: 'AND',
      maxClaims: 1
    },
    reward: 30,
    xp: 60,
    maxClaims: 1
  },
  {
    id: 'football-fan',
    name: 'Fã de Futebol',
    description: 'Aposte R$ 50+ em jogos de futebol',
    icon: <Trophy className="w-5 h-5" />,
    vertical: 'sportsbook',
    category: 'intermediate',
    module: 'igaming',
    rule: {
      triggers: [{
        event: 'sportsbook_bet_placed',
        filters: [
          { field: 'sport', operator: '==', value: 'football' }
        ]
      }],
      conditions: [
        { field: 'bet_amount', operator: '>=', value: 50 }
      ],
      logic: 'AND',
      timeWindow: { duration: '7d', sliding: true }
    },
    reward: 75,
    xp: 150,
    timeWindow: '7d'
  },
  {
    id: 'combo-master',
    name: 'Mestre das Combinadas',
    description: 'Faça 5 apostas combinadas com odds 3.0+',
    icon: <Star className="w-5 h-5" />,
    vertical: 'sportsbook',
    category: 'advanced',
    module: 'igaming',
    rule: {
      triggers: [{
        event: 'sportsbook_bet_placed',
        debounce: 5000
      }],
      conditionTree: {
        type: 'AND',
        conditions: [
          { field: 'bet_type', operator: '==', value: 'combined' },
          { field: 'odds', operator: '>=', value: 3.0 },
          { field: 'bet_count', operator: '>=', value: 5, aggregation: 'count' }
        ]
      },
      conditions: [],
      logic: 'AND',
      timeWindow: { duration: '7d', sliding: true }
    },
    reward: 150,
    xp: 300,
    timeWindow: '7d',
    cooldown: 86400
  },

  // ========== CASINO TEMPLATES ==========
  {
    id: 'first-spin',
    name: 'Primeiro Giro',
    description: 'Faça seu primeiro giro em slots',
    icon: <Gamepad2 className="w-5 h-5" />,
    vertical: 'casino',
    category: 'beginner',
    module: 'igaming',
    rule: {
      triggers: [{
        event: 'slot_spin'
      }],
      conditions: [],
      logic: 'AND',
      maxClaims: 1
    },
    reward: 20,
    xp: 40,
    maxClaims: 1
  },
  {
    id: 'daily-slots',
    name: 'Slots Diários',
    description: 'Jogue 50 rodadas de slots por dia',
    icon: <Clock className="w-5 h-5" />,
    vertical: 'casino',
    category: 'intermediate',
    module: 'igaming',
    rule: {
      triggers: [{
        event: 'slot_spin'
      }],
      conditions: [
        { field: 'spin_count', operator: '>=', value: 50, aggregation: 'count' }
      ],
      logic: 'AND',
      timeWindow: { duration: '1d', sliding: false }
    },
    reward: 40,
    xp: 80,
    timeWindow: '1d',
    cooldown: 86400
  },
  {
    id: 'vip-table',
    name: 'Mesa VIP',
    description: 'Aposte R$ 200+ em jogos de mesa ao vivo',
    icon: <Star className="w-5 h-5" />,
    vertical: 'casino',
    category: 'advanced',
    module: 'igaming',
    rule: {
      triggers: [{
        event: 'live_casino_bet_placed'
      }],
      conditions: [
        { field: 'bet_amount', operator: '>=', value: 200 },
        { field: 'game_type', operator: 'in', value: ['blackjack', 'roulette', 'baccarat'] }
      ],
      logic: 'AND',
      timeWindow: { duration: '1d', sliding: true }
    },
    reward: 100,
    xp: 200,
    timeWindow: '1d',
    cooldown: 86400
  }
]

interface QuickTemplatesProps {
  onSelectTemplate: (template: MissionTemplate) => void
  className?: string
}

export function QuickTemplates({ onSelectTemplate, className = '' }: QuickTemplatesProps) {
  const [selectedVertical, setSelectedVertical] = useState<string>('all')
  
  const verticals = [
    { key: 'all', label: 'Todos', icon: '🌐', color: 'bg-gray-50 border-gray-200' },
    { key: 'igaming', label: 'iGaming', icon: '🎮', color: 'bg-purple-50 border-purple-200' },
    { key: 'engagement', label: 'Engajamento', icon: '🎯', color: 'bg-blue-50 border-blue-200' },
    { key: 'deposits', label: 'Depósitos', icon: '💰', color: 'bg-green-50 border-green-200' },
    { key: 'sportsbook', label: 'Sportsbook', icon: '⚽', color: 'bg-orange-50 border-orange-200' },
    { key: 'casino', label: 'Casino', icon: '🎰', color: 'bg-pink-50 border-pink-200' }
  ]

  const categoryLabels = {
    beginner: { label: '🌟 Iniciante', color: 'text-green-600 bg-green-100' },
    intermediate: { label: '💎 Intermediário', color: 'text-blue-600 bg-blue-100' },
    advanced: { label: '🏆 Avançado', color: 'text-purple-600 bg-purple-100' }
  }

  const filteredTemplates = selectedVertical === 'all' 
    ? templates 
    : templates.filter(t => t.vertical === selectedVertical)

  const getVerticalStyle = (vertical: string) => {
    return verticals.find(v => v.key === vertical) || verticals[0]
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          🚀 Templates Rápidos de Missões
        </h3>
        <p className="text-sm text-gray-600">
          Escolha um template pronto por vertical ou crie uma missão personalizada do zero
        </p>
      </div>

      {/* Vertical Filters */}
      <div className="flex flex-wrap gap-2">
        {verticals.map(vertical => (
          <button
            key={vertical.key}
            onClick={() => setSelectedVertical(vertical.key)}
            className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
              selectedVertical === vertical.key
                ? `${vertical.color} border-opacity-100 shadow-md scale-105`
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="mr-2">{vertical.icon}</span>
            <span className="font-medium">{vertical.label}</span>
            {vertical.key !== 'all' && (
              <span className="ml-2 text-xs text-gray-500">
                ({templates.filter(t => t.vertical === vertical.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map(template => {
          const verticalStyle = getVerticalStyle(template.vertical)
          const categoryStyle = categoryLabels[template.category]
          
          return (
            <button
              key={template.id}
              onClick={() => onSelectTemplate(template)}
              className={`${verticalStyle.color} border-2 rounded-lg p-4 text-left hover:shadow-lg transition-all duration-200 group relative overflow-hidden`}
            >
              {/* Vertical Badge */}
              <div className="absolute top-2 right-2">
                <span className="text-xs font-semibold px-2 py-1 bg-white rounded-full opacity-75">
                  {verticalStyle.icon} {verticalStyle.label}
                </span>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-lg group-hover:scale-110 transition-transform">
                  {template.icon}
                </div>
                <div className="flex-1 pr-16">
                  <h5 className="font-semibold text-gray-900 mb-1">
                    {template.name}
                  </h5>
                  <p className="text-xs text-gray-600 mb-2">
                    {template.description}
                  </p>
                  
                  {/* Category Badge */}
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${categoryStyle.color} mb-2`}>
                    {categoryStyle.label}
                  </span>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-2 py-1 bg-white rounded-full text-xs">
                      💰 {template.reward} coins
                    </span>
                    <span className="px-2 py-1 bg-white rounded-full text-xs">
                      ⭐ {template.xp} XP
                    </span>
                    {template.timeWindow && (
                      <span className="px-2 py-1 bg-white rounded-full text-xs">
                        ⏱️ {template.timeWindow}
                      </span>
                    )}
                    {template.maxClaims && (
                      <span className="px-2 py-1 bg-white rounded-full text-xs">
                        🎯 {template.maxClaims}x
                      </span>
                    )}
                  </div>

                  {/* Rule Preview */}
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                      <strong>Regras:</strong> {template.rule.triggers?.length || 0} triggers, 
                      {' '}{template.rule.conditions?.length || 0} condições
                      {template.rule.conditionTree && ' (lógica avançada)'}
                    </div>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Nenhum template encontrado para esta vertical.</p>
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-sm text-yellow-800">
          💡 <strong>Dica:</strong> Após selecionar um template, você verá as regras aplicadas e poderá 
          personalizar todos os valores antes de criar a missão.
        </p>
      </div>
    </div>
  )
}