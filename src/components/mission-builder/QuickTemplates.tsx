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

// Simplified 5 flexible templates with unified filter system
const templates: MissionTemplate[] = [
  // 1. CASINO BASE TEMPLATE
  {
    id: 'casino-base',
    name: 'Missão de Casino',
    description: 'Template base para missões de jogos de casino (slots, mesa, live)',
    icon: <Gamepad2 className="w-5 h-5" />,
    vertical: 'casino',
    category: 'beginner',
    module: 'igaming',
    rule: {
      triggers: [
        {
          event: 'spin',
          label: 'Giros em Slots',
          aggregation: 'count',
          filters: [
            { field: 'amount', operator: '>=', value: 1 }
          ]
        }
      ],
      logic: 'AND',
      timeWindow: { duration: '1d', sliding: false },
      maxClaims: 1
    },
    reward: 50,
    xp: 100,
    timeWindow: '1d',
    maxClaims: 1
  },

  // 2. SPORTSBOOK BASE TEMPLATE
  {
    id: 'sportsbook-base',
    name: 'Missão de Apostas Esportivas',
    description: 'Template base para missões de apostas esportivas com filtros customizáveis',
    icon: <Trophy className="w-5 h-5" />,
    vertical: 'sportsbook',
    category: 'beginner',
    module: 'igaming',
    rule: {
      triggers: [
        {
          event: 'sportsbook_bet_placed',
          label: 'Apostas Esportivas',
          aggregation: 'count',
          filters: [
            { field: 'amount', operator: '>=', value: 10 }
          ]
        }
      ],
      logic: 'AND',
      timeWindow: { duration: '1d', sliding: false },
      maxClaims: 1
    },
    reward: 50,
    xp: 100,
    timeWindow: '1d',
    maxClaims: 1
  },

  // 2.5. SPORTSBOOK MULTI-SPORT EXAMPLE
  {
    id: 'sportsbook-multi-sport',
    name: 'Fã de Esportes Populares',
    description: 'Aposte em futebol OU basquete (exemplo de filtros múltiplos)',
    icon: <Trophy className="w-5 h-5" />,
    vertical: 'sportsbook',
    category: 'intermediate',
    module: 'igaming',
    rule: {
      triggers: [
        {
          event: 'sportsbook_bet_placed',
          label: 'Apostas em Esportes Populares',
          aggregation: 'count',
          filters: [
            { field: 'sport', operator: 'in', value: ['futebol', 'basquete'] },
            { field: 'amount', operator: '>=', value: 25 }
          ]
        }
      ],
      logic: 'AND',
      timeWindow: { duration: '7d', sliding: false },
      maxClaims: 3
    },
    reward: 75,
    xp: 150,
    timeWindow: '7d',
    maxClaims: 3
  },

  // 3. DEPOSIT BASE TEMPLATE
  {
    id: 'deposit-base',
    name: 'Missão de Depósitos',
    description: 'Template base para missões de depósitos com filtros de valor e método',
    icon: <Wallet className="w-5 h-5" />,
    vertical: 'deposits',
    category: 'beginner',
    module: 'deposits',
    rule: {
      triggers: [
        {
          event: 'deposit_completed',
          label: 'Depósitos Realizados',
          aggregation: 'count',
          filters: [
            { field: 'amount', operator: '>=', value: 20 }
          ]
        }
      ],
      logic: 'AND',
      maxClaims: 1
    },
    reward: 75,
    xp: 150,
    maxClaims: 1
  },

  // 4. LOGIN/ACTIVITY BASE TEMPLATE
  {
    id: 'activity-base',
    name: 'Missão de Atividade',
    description: 'Template base para missões de login, atividade diária e engajamento',
    icon: <Activity className="w-5 h-5" />,
    vertical: 'engagement',
    category: 'beginner',
    module: 'igaming',
    rule: {
      triggers: [
        {
          event: 'user_login',
          label: 'Logins Diários',
          aggregation: 'count'
        }
      ],
      logic: 'AND',
      timeWindow: { duration: '1d', sliding: false },
      cooldown: 86400
    },
    reward: 25,
    xp: 50,
    timeWindow: '1d',
    cooldown: 86400
  },

  // 5. MULTI-TRIGGER SEQUENCE TEMPLATE
  {
    id: 'sequence-base',
    name: 'Missão Multi-Produto',
    description: 'Template para missões complexas com múltiplos triggers (AND/OR)',
    icon: <Star className="w-5 h-5" />,
    vertical: 'igaming',
    category: 'advanced',
    module: 'igaming',
    rule: {
      triggers: [
        {
          event: 'sportsbook_bet_placed',
          label: 'Apostas Esportivas',
          required: true,
          aggregation: 'sum',
          filters: [
            { field: 'amount', operator: '>=', value: 100 }
          ]
        },
        {
          event: 'spin',
          label: 'Giros em Casino',
          required: false,
          aggregation: 'sum',
          filters: [
            { field: 'amount', operator: '>=', value: 50 }
          ]
        }
      ],
      logic: 'OR',
      timeWindow: { duration: '7d', sliding: false }
    },
    reward: 200,
    xp: 400,
    timeWindow: '7d'
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
    { key: 'casino', label: 'Casino', icon: '🎰', color: 'bg-pink-50 border-pink-200' },
    { key: 'sportsbook', label: 'Sportsbook', icon: '⚽', color: 'bg-orange-50 border-orange-200' },
    { key: 'deposits', label: 'Depósitos', icon: '💰', color: 'bg-green-50 border-green-200' },
    { key: 'engagement', label: 'Engajamento', icon: '🎯', color: 'bg-blue-50 border-blue-200' },
    { key: 'igaming', label: 'Multi-Produto', icon: '🎮', color: 'bg-purple-50 border-purple-200' }
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
          🚀 Templates Flexíveis de Missões
        </h3>
        <p className="text-sm text-gray-600">
          5 templates base com filtros unificados. Para condições como "futebol OU basquete", use o operador "está em" com múltiplos valores nos filtros do trigger.
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
                      <strong>Triggers:</strong> {template.rule.triggers?.length || 0} evento(s)
                      <br />
                      <strong>Lógica:</strong> {template.rule.logic}
                      {template.rule.triggers?.some(t => t.filters?.length) && (
                        <span> • {template.rule.triggers.reduce((total, t) => total + (t.filters?.length || 0), 0)} filtro(s)</span>
                      )}
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

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-900 font-medium mb-2">
          ✅ <strong>Solução para sua dúvida:</strong> Como fazer "futebol OU basquete"?
        </p>
        <div className="text-sm text-green-800 space-y-2">
          <div className="flex items-start gap-2">
            <span className="font-medium">1.</span>
            <span>No trigger, adicione um filtro: <strong>Campo</strong> = "sport"</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium">2.</span>
            <span>Escolha operador: <strong>"está em"</strong> (permite múltiplos valores)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium">3.</span>
            <span>Selecione valores: <strong>futebol E basquete</strong> (isso é OU automático)</span>
          </div>
          <div className="mt-2 p-2 bg-green-100 rounded">
            <p className="text-xs text-green-700">
              <strong>💡 Dica:</strong> O template "Fã de Esportes Populares" já mostra esse exemplo funcionando!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}