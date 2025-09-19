'use client'

import React, { useState, useCallback, useRef } from 'react'
import { Search, Loader2, AlertCircle, X } from 'lucide-react'
import { useCustomerGroupSearch } from './hooks/useCustomerGroups'
import { CustomerGroup, GroupSearchInputProps } from '@/types/customer-groups'

export function GroupSearchInput({
  onSearch,
  onSelect,
  placeholder = "Digite para buscar grupos...",
  disabled = false,
  excludeIds = []
}: GroupSearchInputProps) {
  const [query, setQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<CustomerGroup[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  
  const { searchGroups, loading, error } = useCustomerGroupSearch()

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([])
      setShowResults(false)
      onSearch([])
      return
    }

    try {
      const groups = await searchGroups(searchQuery)
      // Filter out already selected groups
      const filteredGroups = groups.filter(group => !excludeIds.includes(group.id))

      setResults(filteredGroups)
      setShowResults(filteredGroups.length > 0)
      onSearch(filteredGroups)
    } catch (err) {
      console.error('Search error:', err)
      // Em caso de erro, limpar resultados mas não propagar erro
      setResults([])
      setShowResults(false)
      onSearch([])
    }
  }, [searchGroups, onSearch, JSON.stringify(excludeIds)]) // Use JSON.stringify para array

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    handleSearch(value)
  }, [handleSearch])

  const handleSelectGroup = useCallback((group: CustomerGroup) => {
    onSelect(group)
    setQuery('')
    setResults([])
    setShowResults(false)
    inputRef.current?.focus()
  }, [onSelect])

  const handleClear = useCallback(() => {
    setQuery('')
    setResults([])
    setShowResults(false)
    onSearch([])
    inputRef.current?.focus()
  }, [onSearch])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowResults(false)
      inputRef.current?.blur()
    }
  }, [])

  const handleClickOutside = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (!target.closest('.group-search-container')) {
      setShowResults(false)
    }
  }, [])

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [handleClickOutside])

  return (
    <div className="group-search-container relative">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {loading ? (
            <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
          ) : (
            <Search className="h-4 w-4 text-gray-400" />
          )}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && results.length > 0 && setShowResults(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
        />
        
        {query && (
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 disabled:hover:text-gray-400"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>{error.message}</span>
        </div>
      )}

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-y-auto">
          <div className="py-1">
            {results.map((group, index) => (
              <button
                key={group.id}
                type="button"
                onClick={() => handleSelectGroup(group)}
                disabled={disabled}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 truncate">
                      {group.name}
                    </div>
                    {group.description && (
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {group.description}
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-1">
                      {group.memberCount !== undefined && (
                        <span className="text-xs text-gray-400">
                          {group.memberCount.toLocaleString()} membros
                        </span>
                      )}
                      {group.tags && group.tags.length > 0 && (
                        <div className="flex gap-1">
                          {group.tags.slice(0, 2).map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="inline-block px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {group.tags.length > 2 && (
                            <span className="text-xs text-gray-400">
                              +{group.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center ml-3">
                    <div className={`w-2 h-2 rounded-full ${
                      group.isActive ? 'bg-green-400' : 'bg-gray-300'
                    }`} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No Results State */}
      {showResults && results.length === 0 && query.length >= 2 && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="py-3 px-4 text-sm text-gray-500 text-center">
            Nenhum grupo encontrado para "{query}"
          </div>
        </div>
      )}

      {/* Minimum Characters Hint */}
      {query.length > 0 && query.length < 2 && (
        <div className="mt-1 text-xs text-gray-500">
          Digite pelo menos 2 caracteres para buscar
        </div>
      )}
    </div>
  )
}