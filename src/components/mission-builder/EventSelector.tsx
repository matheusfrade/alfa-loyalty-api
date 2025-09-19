'use client'

import React, { useState, useRef, useEffect } from 'react'
import { EventTypeUI } from '@/types/mission-types'
import { Search, ChevronDown, X } from 'lucide-react'

export interface EventSelectorProps {
  value?: string
  onChange: (eventKey: string) => void
  availableEvents: EventTypeUI[]
  disabled?: boolean
  placeholder?: string
  excludeEvents?: string[]
  className?: string
}

export function EventSelector({
  value,
  onChange,
  availableEvents,
  disabled = false,
  placeholder = "Selecionar evento...",
  excludeEvents = [],
  className = ''
}: EventSelectorProps) {
  // Use available events directly
  const eventsToUse = availableEvents || []
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filter and group events
  const filteredEvents = eventsToUse.filter(event => {
    if (excludeEvents.includes(event.key)) return false

    if (!searchQuery || searchQuery.trim() === '') {
      return true
    }

    const searchTerm = searchQuery.toLowerCase().trim()
    return (
      event.label.toLowerCase().includes(searchTerm) ||
      event.description.toLowerCase().includes(searchTerm) ||
      event.key.toLowerCase().includes(searchTerm) ||
      event.category?.toLowerCase().includes(searchTerm)
    )
  })

  // Group events by category
  const groupedEvents: Record<string, EventTypeUI[]> = {}
  const categoryInfo: Record<string, { icon: string; label: string }> = {
    // Primary categories (matching module names)
    'sportsbook': { icon: '⚽', label: 'SPORTSBOOK' },
    'casino': { icon: '🎰', label: 'CASSINO' },
    'live_casino': { icon: '🎲', label: 'CASINO AO VIVO' },
    'igaming': { icon: '🎮', label: 'iGAMING' },

    // Secondary categories
    'general': { icon: '💰', label: 'GERAL' },
    'financial': { icon: '💳', label: 'FINANCEIRO' },
    'deposits': { icon: '💳', label: 'DEPÓSITOS' },
    'engagement': { icon: '👥', label: 'ENGAJAMENTO' },
    'onboarding': { icon: '🎯', label: 'ONBOARDING' },
    'social': { icon: '🤝', label: 'SOCIAL' },

    // Game-specific categories
    'gameplay': { icon: '🎮', label: 'JOGABILIDADE' },
    'achievement': { icon: '🏆', label: 'CONQUISTAS' },
    'betting': { icon: '💰', label: 'APOSTAS' },

    // Tier categories
    'TIER_POINTS': { icon: '⭐', label: 'PONTOS DE TIER' },
    'TIER_CHANGE': { icon: '📈', label: 'MUDANÇA DE TIER' },
    'TIER_MANAGEMENT': { icon: '🏆', label: 'GESTÃO DE TIER' }
  }

  filteredEvents.forEach(event => {
    const category = event.category || 'general'
    if (!groupedEvents[category]) {
      groupedEvents[category] = []
    }
    groupedEvents[category].push(event)
  })

  // Get all events in a flat list for keyboard navigation
  const flatEventList = Object.values(groupedEvents).flat()

  const selectedEvent = eventsToUse.find(event => event.key === value)

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setIsOpen(true)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev < flatEventList.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : flatEventList.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && flatEventList[highlightedIndex]) {
          onChange(flatEventList[highlightedIndex].key)
          setIsOpen(false)
          setSearchQuery('')
          setHighlightedIndex(-1)
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSearchQuery('')
        setHighlightedIndex(-1)
        break
    }
  }

  const handleEventSelect = (eventKey: string) => {
    onChange(eventKey)
    setIsOpen(false)
    setSearchQuery('')
    setHighlightedIndex(-1)
  }

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
  }

  // Auto-open when component mounts (useful for modals)
  useEffect(() => {
    if (!value) {
      setIsOpen(true)
    }
  }, [])

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Event List - Always show when no value is selected */}
      {!value ? (
        <div className="w-full">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setHighlightedIndex(-1)
                }}
                onKeyDown={handleKeyDown}
                placeholder="Buscar eventos..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
            </div>
          </div>

          {/* Events List */}
          <div className="max-h-80 overflow-y-auto">
            {Object.keys(groupedEvents).length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-medium">Nenhum evento encontrado</p>
                <p className="text-xs">Tente buscar por outro termo</p>
              </div>
            ) : (
              // Sort categories by priority (primary gaming categories first)
              Object.entries(groupedEvents)
                .sort(([categoryA], [categoryB]) => {
                  const order = ['sportsbook', 'casino', 'live_casino', 'igaming', 'general', 'financial', 'achievement', 'engagement', 'TIER_POINTS', 'TIER_CHANGE']
                  const indexA = order.indexOf(categoryA)
                  const indexB = order.indexOf(categoryB)
                  if (indexA === -1 && indexB === -1) return categoryA.localeCompare(categoryB)
                  if (indexA === -1) return 1
                  if (indexB === -1) return -1
                  return indexA - indexB
                })
                .map(([category, events]) => (
                <div key={category} className="mb-4">
                  {/* Enhanced Category Header */}
                  <div className="flex items-center gap-3 mb-3 px-3 py-2 bg-gray-50 rounded-lg border">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-lg border shadow-sm">
                      {categoryInfo[category]?.icon || '📌'}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-800 tracking-wide">
                        {categoryInfo[category]?.label || category.toUpperCase()}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {events.length} evento{events.length !== 1 ? 's' : ''} disponível{events.length !== 1 ? 'is' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Category Events */}
                  <div className="space-y-2 px-3">
                    {events.map((event, eventIndex) => {
                      const flatIndex = flatEventList.findIndex(e => e.key === event.key)
                      const isHighlighted = flatIndex === highlightedIndex

                      return (
                        <button
                          key={event.key}
                          onClick={() => handleEventSelect(event.key)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 border ${
                            isHighlighted
                              ? 'bg-blue-50 border-blue-200 text-blue-900 shadow-sm'
                              : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                            isHighlighted
                              ? 'bg-blue-100'
                              : 'bg-gray-100'
                          }`}>
                            {event.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">
                              {event.label}
                            </div>
                            <div className="text-xs text-gray-500 truncate leading-relaxed">
                              {event.description}
                            </div>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${
                            isHighlighted ? 'bg-blue-500' : 'bg-transparent'
                          }`}></div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Selected Event Display */
        <div className="w-full min-h-[40px] px-3 py-2 border rounded-lg bg-gray-50 border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{selectedEvent?.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {selectedEvent?.label}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {selectedEvent?.description}
                </div>
              </div>
            </div>
            <button
              onClick={clearSelection}
              className="p-1 hover:bg-gray-100 rounded"
              title="Limpar seleção"
            >
              <X className="h-3 w-3 text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}