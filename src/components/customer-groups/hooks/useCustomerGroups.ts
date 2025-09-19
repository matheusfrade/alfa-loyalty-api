import { useState, useEffect, useCallback } from 'react'
import { 
  CustomerGroup, 
  UseCustomerGroupsResult,
  UseCustomerGroupSearchResult
} from '@/types/customer-groups'

// Hook for loading all customer groups
export function useCustomerGroups(): UseCustomerGroupsResult {
  const [groups, setGroups] = useState<CustomerGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/customer-groups')
      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch customer groups')
      }
      
      setGroups(data.data || [])
    } catch (err: any) {
      console.error('Error fetching customer groups:', err)
      setError({
        code: 'FETCH_ERROR',
        message: err.message || 'Failed to fetch customer groups',
        details: err
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const refetch = useCallback(async () => {
    await fetchGroups()
  }, [fetchGroups])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  return {
    groups,
    loading,
    error,
    refetch
  }
}

// Hook for searching customer groups with debounce
export function useCustomerGroupSearch(): UseCustomerGroupSearchResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  const searchGroups = useCallback(async (query: string): Promise<CustomerGroup[]> => {
    return new Promise((resolve) => {
      // Clear previous timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }

      // If query is too short, return empty results
      if (!query || query.length < 2) {
        setLoading(false)
        resolve([])
        return
      }

      // Debounce the search
      const timeout = setTimeout(async () => {
        try {
          setLoading(true)
          setError(null)

          const params = new URLSearchParams({ q: query.trim() })
          const response = await fetch(`/api/customer-groups/search?${params}`)
          const data = await response.json()

          if (!response.ok || !data.success) {
            throw new Error(data.message || 'Search failed')
          }

          resolve(data.data || [])
        } catch (err: any) {
          console.error('Error searching customer groups:', err)
          // Em caso de erro, retornar array vazio ao invés de rejeitar
          const searchError = {
            code: 'SEARCH_ERROR',
            message: err.message || 'Failed to search customer groups',
            details: err
          }
          setError(searchError)
          resolve([]) // Resolver com array vazio para evitar loops
        } finally {
          setLoading(false)
        }
      }, 300) // 300ms debounce

      setSearchTimeout(timeout)
    })
  }, [searchTimeout])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [searchTimeout])

  return {
    searchGroups,
    loading,
    error
  }
}

// Hook for fetching groups by IDs
export function useCustomerGroupsByIds(ids: string[]) {
  const [groups, setGroups] = useState<CustomerGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchGroupsByIds = useCallback(async (groupIds: string[]) => {
    if (!groupIds || groupIds.length === 0) {
      setGroups([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/customer-groups/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids: groupIds })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch groups')
      }

      setGroups(data.data || [])
    } catch (err: any) {
      console.error('Error fetching groups by IDs:', err)
      // Para erros de API, use dados mock para evitar loops infinitos
      setGroups([])
      setError({
        code: 'BATCH_ERROR',
        message: err.message || 'Failed to fetch groups',
        details: err
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Evitar execuções desnecessárias
    if (ids.length > 0) {
      fetchGroupsByIds(ids)
    } else {
      setGroups([])
      setLoading(false)
      setError(null)
    }
  }, [JSON.stringify(ids), fetchGroupsByIds]) // Use JSON.stringify para comparação profunda

  return {
    groups,
    loading,
    error,
    refetch: () => fetchGroupsByIds(ids)
  }
}

// Hook for managing customer group selection state
export function useCustomerGroupSelection(initialValue = { include: [], exclude: [] }) {
  const [selection, setSelection] = useState(() => initialValue)

  const addToInclude = useCallback((groupId: string) => {
    setSelection(prev => ({
      include: [...prev.include.filter(id => id !== groupId), groupId],
      exclude: prev.exclude.filter(id => id !== groupId) // Remove from exclude if exists
    }))
  }, [])

  const addToExclude = useCallback((groupId: string) => {
    setSelection(prev => ({
      include: prev.include.filter(id => id !== groupId), // Remove from include if exists
      exclude: [...prev.exclude.filter(id => id !== groupId), groupId]
    }))
  }, [])

  const removeFromInclude = useCallback((groupId: string) => {
    setSelection(prev => ({
      ...prev,
      include: prev.include.filter(id => id !== groupId)
    }))
  }, [])

  const removeFromExclude = useCallback((groupId: string) => {
    setSelection(prev => ({
      ...prev,
      exclude: prev.exclude.filter(id => id !== groupId)
    }))
  }, [])

  const clearAll = useCallback(() => {
    setSelection({ include: [], exclude: [] })
  }, [])

  const isSelected = useCallback((groupId: string) => {
    return selection.include.includes(groupId) || selection.exclude.includes(groupId)
  }, [selection])

  const getSelectionType = useCallback((groupId: string): 'include' | 'exclude' | null => {
    if (selection.include.includes(groupId)) return 'include'
    if (selection.exclude.includes(groupId)) return 'exclude'
    return null
  }, [selection])

  return {
    selection,
    setSelection,
    addToInclude,
    addToExclude,
    removeFromInclude,
    removeFromExclude,
    clearAll,
    isSelected,
    getSelectionType,
    totalSelected: selection.include.length + selection.exclude.length
  }
}