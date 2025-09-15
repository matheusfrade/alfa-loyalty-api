'use client'

import { useState } from 'react'
import { MissionRule, MissionTrigger, MissionCondition, EventType, Operator } from '@/types/mission-rules'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface RuleBuilderProps {
  rule: MissionRule
  onChange: (rule: MissionRule) => void
  className?: string
}

export function RuleBuilder({ rule, onChange, className = '' }: RuleBuilderProps) {
  const [activeTab, setActiveTab] = useState<'triggers' | 'conditions' | 'settings'>('triggers')

  const addTrigger = () => {
    const newTrigger: MissionTrigger = {
      event: 'user_login',
      filters: []
    }
    onChange({
      ...rule,
      triggers: [...(rule.triggers || []), newTrigger]
    })
  }

  const updateTrigger = (index: number, trigger: MissionTrigger) => {
    const newTriggers = [...(rule.triggers || [])]
    newTriggers[index] = trigger
    onChange({
      ...rule,
      triggers: newTriggers
    })
  }

  const removeTrigger = (index: number) => {
    const newTriggers = rule.triggers?.filter((_, i) => i !== index) || []
    onChange({
      ...rule,
      triggers: newTriggers
    })
  }

  const addCondition = () => {
    const newCondition: MissionCondition = {
      field: 'amount',
      operator: '>=',
      value: 1
    }
    onChange({
      ...rule,
      conditions: [...(rule.conditions || []), newCondition]
    })
  }

  const updateCondition = (index: number, condition: MissionCondition) => {
    const newConditions = [...(rule.conditions || [])]
    newConditions[index] = condition
    onChange({
      ...rule,
      conditions: newConditions
    })
  }

  const removeCondition = (index: number) => {
    const newConditions = rule.conditions?.filter((_, i) => i !== index) || []
    onChange({
      ...rule,
      conditions: newConditions
    })
  }

  const eventTypes: EventType[] = [
    'user_login', 'bet_placed', 'deposit_made', 'game_played', 
    'profile_completed', 'kyc_verified', 'friend_referred', 
    'bonus_claimed', 'custom_event'
  ]

  const operators: Operator[] = [
    '==', '!=', '>', '>=', '<', '<=', 'in', 'not_in', 
    'contains', 'between', 'exists', 'unique_count', 'streak_count'
  ]

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'triggers', label: 'Triggers', icon: '⚡' },
          { key: 'conditions', label: 'Conditions', icon: '🎯' },
          { key: 'settings', label: 'Settings', icon: '⚙️' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Triggers Tab */}
      {activeTab === 'triggers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Event Triggers</h3>
            <Button onClick={addTrigger} size="sm">
              ➕ Add Trigger
            </Button>
          </div>
          
          {rule.triggers?.map((trigger, index) => (
            <TriggerEditor
              key={index}
              trigger={trigger}
              eventTypes={eventTypes}
              operators={operators}
              onChange={(newTrigger) => updateTrigger(index, newTrigger)}
              onRemove={() => removeTrigger(index)}
            />
          )) || (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No triggers configured</p>
                <Button onClick={addTrigger} className="mt-2">
                  Add First Trigger
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Conditions Tab */}
      {activeTab === 'conditions' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Completion Conditions</h3>
            <Button onClick={addCondition} size="sm">
              ➕ Add Condition
            </Button>
          </div>
          
          {rule.conditions?.map((condition, index) => (
            <ConditionEditor
              key={index}
              condition={condition}
              operators={operators}
              onChange={(newCondition) => updateCondition(index, newCondition)}
              onRemove={() => removeCondition(index)}
            />
          )) || (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No conditions configured</p>
                <Button onClick={addCondition} className="mt-2">
                  Add First Condition
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Logic Operator */}
          {(rule.conditions?.length || 0) > 1 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <label className="text-sm font-medium text-blue-900">Condition Logic</label>
              <select
                value={rule.logic || 'AND'}
                onChange={(e) => onChange({ ...rule, logic: e.target.value as any })}
                className="mt-1 block w-full px-3 py-2 bg-white border border-blue-200 rounded-md"
              >
                <option value="AND">ALL conditions must be met (AND)</option>
                <option value="OR">ANY condition can be met (OR)</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Mission Settings</h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Time Window */}
            <div>
              <label className="block text-sm font-medium mb-2">Time Window</label>
              <select
                value={rule.timeWindow?.duration || ''}
                onChange={(e) => onChange({
                  ...rule,
                  timeWindow: e.target.value ? {
                    duration: e.target.value,
                    sliding: rule.timeWindow?.sliding || true
                  } : undefined
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">No time limit</option>
                <option value="1h">1 Hour</option>
                <option value="1d">1 Day</option>
                <option value="7d">1 Week</option>
                <option value="30d">1 Month</option>
                <option value="365d">1 Year</option>
              </select>
            </div>

            {/* Max Claims */}
            <div>
              <label className="block text-sm font-medium mb-2">Max Completions</label>
              <input
                type="number"
                value={rule.maxClaims || ''}
                onChange={(e) => onChange({
                  ...rule,
                  maxClaims: e.target.value ? parseInt(e.target.value) : undefined
                })}
                placeholder="Unlimited"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="1"
              />
            </div>

            {/* Cooldown */}
            <div>
              <label className="block text-sm font-medium mb-2">Cooldown (seconds)</label>
              <input
                type="number"
                value={rule.cooldown || ''}
                onChange={(e) => onChange({
                  ...rule,
                  cooldown: e.target.value ? parseInt(e.target.value) : undefined
                })}
                placeholder="No cooldown"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
              />
            </div>

            {/* Sliding Window Toggle */}
            {rule.timeWindow && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sliding"
                  checked={rule.timeWindow.sliding || false}
                  onChange={(e) => onChange({
                    ...rule,
                    timeWindow: {
                      ...rule.timeWindow!,
                      sliding: e.target.checked
                    }
                  })}
                />
                <label htmlFor="sliding" className="text-sm font-medium">
                  Sliding Time Window
                </label>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Trigger Editor Component
function TriggerEditor({ 
  trigger, 
  eventTypes, 
  operators, 
  onChange, 
  onRemove 
}: {
  trigger: MissionTrigger
  eventTypes: EventType[]
  operators: Operator[]
  onChange: (trigger: MissionTrigger) => void
  onRemove: () => void
}) {
  const addFilter = () => {
    onChange({
      ...trigger,
      filters: [...(trigger.filters || []), {
        field: 'category',
        operator: '==',
        value: ''
      }]
    })
  }

  const updateFilter = (index: number, field: string, operator: Operator, value: any) => {
    const newFilters = [...(trigger.filters || [])]
    newFilters[index] = { field, operator, value }
    onChange({
      ...trigger,
      filters: newFilters
    })
  }

  const removeFilter = (index: number) => {
    const newFilters = trigger.filters?.filter((_, i) => i !== index) || []
    onChange({
      ...trigger,
      filters: newFilters
    })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">Event Trigger</CardTitle>
          <Button onClick={onRemove} variant="outline" size="sm" className="text-red-600">
            🗑️
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Event Type */}
        <div>
          <label className="block text-sm font-medium mb-2">Event Type</label>
          <select
            value={trigger.event}
            onChange={(e) => onChange({ ...trigger, event: e.target.value as EventType })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {eventTypes.map(type => (
              <option key={type} value={type}>
                {type.replace('_', ' ').toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Filters */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium">Event Filters</label>
            <Button onClick={addFilter} size="sm" variant="outline">
              ➕ Add Filter
            </Button>
          </div>

          {trigger.filters?.map((filter, index) => (
            <div key={index} className="flex gap-2 items-center mb-2 p-3 bg-gray-50 rounded">
              <input
                type="text"
                placeholder="Field name"
                value={filter.field}
                onChange={(e) => updateFilter(index, e.target.value, filter.operator, filter.value)}
                className="flex-1 px-2 py-1 text-sm border rounded"
              />
              <select
                value={filter.operator}
                onChange={(e) => updateFilter(index, filter.field, e.target.value as Operator, filter.value)}
                className="px-2 py-1 text-sm border rounded"
              >
                {operators.map(op => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Value"
                value={filter.value}
                onChange={(e) => updateFilter(index, filter.field, filter.operator, e.target.value)}
                className="flex-1 px-2 py-1 text-sm border rounded"
              />
              <Button 
                onClick={() => removeFilter(index)} 
                size="sm" 
                variant="outline"
                className="text-red-600"
              >
                ✖️
              </Button>
            </div>
          )) || (
            <p className="text-sm text-gray-500 italic">No filters - trigger on any {trigger.event} event</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Condition Editor Component
function ConditionEditor({
  condition,
  operators,
  onChange,
  onRemove
}: {
  condition: MissionCondition
  operators: Operator[]
  onChange: (condition: MissionCondition) => void
  onRemove: () => void
}) {
  const aggregationTypes = ['sum', 'count', 'max', 'min', 'avg', 'unique_count', 'streak_count']

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">Completion Condition</CardTitle>
          <Button onClick={onRemove} variant="outline" size="sm" className="text-red-600">
            🗑️
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Field</label>
            <input
              type="text"
              value={condition.field}
              onChange={(e) => onChange({ ...condition, field: e.target.value })}
              placeholder="amount, count, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Operator</label>
            <select
              value={condition.operator}
              onChange={(e) => onChange({ ...condition, operator: e.target.value as Operator })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {operators.map(op => (
                <option key={op} value={op}>{op}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Target Value</label>
            <input
              type="text"
              value={condition.value}
              onChange={(e) => {
                // Try to parse as number if it looks like one
                const val = e.target.value
                const parsed = !isNaN(Number(val)) && val !== '' ? Number(val) : val
                onChange({ ...condition, value: parsed })
              }}
              placeholder="100, 'category', etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Aggregation</label>
            <select
              value={condition.aggregation || ''}
              onChange={(e) => onChange({ 
                ...condition, 
                aggregation: e.target.value ? e.target.value as any : undefined 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">No aggregation</option>
              {aggregationTypes.map(type => (
                <option key={type} value={type}>{type.replace('_', ' ').toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}