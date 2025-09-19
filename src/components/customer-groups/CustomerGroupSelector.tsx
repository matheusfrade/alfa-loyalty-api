'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  CustomerGroupSelection, 
  CustomerGroupSelectorProps,
  CustomerGroup 
} from '@/types/customer-groups'
import { useCustomerGroupSelection, useCustomerGroupsByIds } from './hooks/useCustomerGroups'
import { GroupSearchInput } from './GroupSearchInput'
import { GroupTag } from './GroupTag'
import { GroupSelectionSummary } from './GroupSelectionSummary'
import { Users, UserPlus, UserX, Search, AlertCircle } from 'lucide-react'

export function CustomerGroupSelector({
  value,
  onChange,
  disabled = false,
  maxSelections = 50,
  className = ''
}: CustomerGroupSelectorProps) {
  const [searchResultsInclude, setSearchResultsInclude] = useState<CustomerGroup[]>([])
  const [searchResultsExclude, setSearchResultsExclude] = useState<CustomerGroup[]>([])
  
  // Use our selection hook initialized with the prop value
  const {
    selection,
    setSelection,
    addToInclude,
    addToExclude,
    removeFromInclude,
    removeFromExclude,
    clearAll,
    isSelected,
    getSelectionType,
    totalSelected
  } = useCustomerGroupSelection(value)

  // Fetch names for selected group IDs
  const allSelectedIds = useMemo(() => 
    [...selection.include, ...selection.exclude], 
    [selection]
  )
  
  const { 
    groups: selectedGroups, 
    loading: loadingSelected 
  } = useCustomerGroupsByIds(allSelectedIds)

  // Sync internal state with prop changes (mais seletivo para evitar loops)
  React.useEffect(() => {
    if (JSON.stringify(value) !== JSON.stringify(selection)) {
      setSelection(value)
    }
  }, [value, setSelection]) // Removido selection da dependência para evitar loop

  // Notify parent of changes (com debounce implícito)
  React.useEffect(() => {
    // Só chama onChange se realmente houve mudança
    if (JSON.stringify(selection) !== JSON.stringify(value)) {
      onChange(selection)
    }
  }, [selection]) // Removido onChange da dependência para evitar loops

  const handleIncludeGroup = (group: CustomerGroup) => {
    if (disabled) return
    
    if (totalSelected >= maxSelections && !isSelected(group.id)) {
      alert(`Máximo de ${maxSelections} grupos permitido`)
      return
    }

    addToInclude(group.id)
    // Remove from search results
    setSearchResultsInclude(prev => prev.filter(g => g.id !== group.id))
  }

  const handleExcludeGroup = (group: CustomerGroup) => {
    if (disabled) return
    
    if (totalSelected >= maxSelections && !isSelected(group.id)) {
      alert(`Máximo de ${maxSelections} grupos permitido`)
      return
    }

    addToExclude(group.id)
    // Remove from search results
    setSearchResultsExclude(prev => prev.filter(g => g.id !== group.id))
  }

  const handleGroupRemove = (group: CustomerGroup) => {
    const type = getSelectionType(group.id)
    if (type === 'include') {
      removeFromInclude(group.id)
    } else if (type === 'exclude') {
      removeFromExclude(group.id)
    }
  }

  const includeGroups = selectedGroups.filter(group => 
    selection.include.includes(group.id)
  )
  
  const excludeGroups = selectedGroups.filter(group => 
    selection.exclude.includes(group.id)
  )

  // Filter out already selected groups from search results
  const filteredIncludeResults = searchResultsInclude.filter(group => !isSelected(group.id))
  const filteredExcludeResults = searchResultsExclude.filter(group => !isSelected(group.id))

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium">Grupos de Clientes</h3>
        </div>
        <div className="text-sm text-gray-500">
          {totalSelected}/{maxSelections} grupos selecionados
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Include Groups Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-green-700">
              <UserPlus className="h-4 w-4" />
              Grupos Incluídos
            </CardTitle>
            <p className="text-sm text-gray-600">
              Usuários destes grupos PODEM participar da missão
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search for Include */}
            <GroupSearchInput
              onSearch={setSearchResultsInclude}
              onSelect={handleIncludeGroup}
              disabled={disabled}
              excludeIds={allSelectedIds}
              placeholder="Buscar grupos para incluir..."
            />
            
            {/* Search Results for Include */}
            {filteredIncludeResults.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">
                  Resultados ({filteredIncludeResults.length})
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filteredIncludeResults.map((group) => (
                    <div
                      key={group.id}
                      className="flex items-center justify-between p-2 border rounded hover:bg-green-50"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{group.name}</div>
                        {group.description && (
                          <div className="text-xs text-gray-500 mt-1">
                            {group.description}
                          </div>
                        )}
                        {group.memberCount && (
                          <div className="text-xs text-gray-400 mt-1">
                            {group.memberCount} membros
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleIncludeGroup(group)
                        }}
                        disabled={disabled || totalSelected >= maxSelections}
                        className="text-green-600 hover:bg-green-50"
                      >
                        <UserPlus className="h-3 w-3 mr-1" />
                        Incluir
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Include Groups */}
            {includeGroups.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-green-700">
                  Selecionados ({includeGroups.length})
                </div>
                <div className="space-y-1">
                  {loadingSelected ? (
                    <div className="text-sm text-gray-500">Carregando...</div>
                  ) : (
                    includeGroups.map((group) => (
                      <GroupTag
                        key={group.id}
                        group={group}
                        type="include"
                        onRemove={() => handleGroupRemove(group)}
                        disabled={disabled}
                      />
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Empty state for include */}
            {includeGroups.length === 0 && (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                <UserPlus className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Nenhum grupo incluído</p>
                <p className="text-xs">Use a busca acima para adicionar grupos</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Exclude Groups Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-red-700">
              <UserX className="h-4 w-4" />
              Grupos Excluídos
            </CardTitle>
            <p className="text-sm text-gray-600">
              Usuários destes grupos NÃO PODEM participar da missão
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search for Exclude */}
            <GroupSearchInput
              onSearch={setSearchResultsExclude}
              onSelect={handleExcludeGroup}
              disabled={disabled}
              excludeIds={allSelectedIds}
              placeholder="Buscar grupos para excluir..."
            />
            
            {/* Search Results for Exclude */}
            {filteredExcludeResults.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">
                  Resultados ({filteredExcludeResults.length})
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filteredExcludeResults.map((group) => (
                    <div
                      key={group.id}
                      className="flex items-center justify-between p-2 border rounded hover:bg-red-50"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{group.name}</div>
                        {group.description && (
                          <div className="text-xs text-gray-500 mt-1">
                            {group.description}
                          </div>
                        )}
                        {group.memberCount && (
                          <div className="text-xs text-gray-400 mt-1">
                            {group.memberCount} membros
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleExcludeGroup(group)
                        }}
                        disabled={disabled || totalSelected >= maxSelections}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <UserX className="h-3 w-3 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Exclude Groups */}
            {excludeGroups.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-red-700">
                  Selecionados ({excludeGroups.length})
                </div>
                <div className="space-y-1">
                  {loadingSelected ? (
                    <div className="text-sm text-gray-500">Carregando...</div>
                  ) : (
                    excludeGroups.map((group) => (
                      <GroupTag
                        key={group.id}
                        group={group}
                        type="exclude"
                        onRemove={() => handleGroupRemove(group)}
                        disabled={disabled}
                      />
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Empty state for exclude */}
            {excludeGroups.length === 0 && (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                <UserX className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Nenhum grupo excluído</p>
                <p className="text-xs">Use a busca acima para adicionar grupos</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary and Actions */}
      {totalSelected > 0 && (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <GroupSelectionSummary
            includeCount={selection.include.length}
            excludeCount={selection.exclude.length}
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              clearAll()
              setSearchResultsInclude([])
              setSearchResultsExclude([])
            }}
            disabled={disabled}
          >
            Limpar Tudo
          </Button>
        </div>
      )}

      {/* Validation Messages */}
      {totalSelected >= maxSelections && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">
            Limite de {maxSelections} grupos atingido
          </span>
        </div>
      )}

      {/* Info box */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
        <AlertCircle className="h-4 w-4 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium mb-1">Como funciona:</p>
          <ul className="text-xs space-y-1">
            <li>• <strong>Grupos Incluídos:</strong> Apenas usuários destes grupos podem participar</li>
            <li>• <strong>Grupos Excluídos:</strong> Usuários destes grupos são bloqueados</li>
            <li>• <strong>Prioridade:</strong> Exclusão tem prioridade sobre inclusão</li>
          </ul>
        </div>
      </div>
    </div>
  )
}