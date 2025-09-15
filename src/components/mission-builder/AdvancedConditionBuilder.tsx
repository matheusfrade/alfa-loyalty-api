import React, { useState, useCallback, useMemo } from 'react'
import { BaseCondition, ConditionGroup, FieldDefinition, Operator } from '../../core/types'
import { Plus, Trash2, Move } from 'lucide-react'

interface AdvancedConditionBuilderProps {
  initialConditionTree?: ConditionGroup
  availableFields: FieldDefinition[]
  availableFieldsGrouped?: Record<string, { field: FieldDefinition; displayLabel: string }[]>
  onChange: (conditionTree: ConditionGroup) => void
  className?: string
}

interface ConditionItemProps {
  item: BaseCondition | ConditionGroup
  availableFields: FieldDefinition[]
  availableFieldsGrouped?: Record<string, { field: FieldDefinition; displayLabel: string }[]>
  onUpdate: (item: BaseCondition | ConditionGroup) => void
  onDelete: () => void
  onAddRelatedCondition?: (type: 'AND' | 'OR') => void
  onGroupWith?: (type: 'AND' | 'OR') => void
  level: number
}

export function AdvancedConditionBuilder({
  initialConditionTree,
  availableFields,
  availableFieldsGrouped,
  onChange,
  className = ''
}: AdvancedConditionBuilderProps) {
  const [conditionTree, setConditionTree] = useState<ConditionGroup>(
    initialConditionTree || {
      type: 'AND',
      conditions: [{
        field: '',
        operator: '==' as Operator,
        value: ''
      }]
    }
  )

  const updateConditionTree = (newTree: ConditionGroup) => {
    setConditionTree(newTree)
    onChange(newTree)
  }

  const addCondition = (parentGroup: ConditionGroup, index?: number) => {
    const newCondition: BaseCondition = {
      field: '',
      operator: '==' as Operator,
      value: ''
    }
    
    const newConditions = [...parentGroup.conditions]
    if (index !== undefined) {
      newConditions.splice(index + 1, 0, newCondition)
    } else {
      newConditions.push(newCondition)
    }
    
    const newTree = {
      ...parentGroup,
      conditions: newConditions
    }
    
    updateConditionTree(newTree)
  }

  const addGroup = (parentGroup: ConditionGroup, type: 'AND' | 'OR') => {
    const newGroup: ConditionGroup = {
      type,
      conditions: [{
        field: '',
        operator: '==' as Operator,
        value: ''
      }]
    }
    
    const newTree = {
      ...parentGroup,
      conditions: [...parentGroup.conditions, newGroup]
    }
    
    updateConditionTree(newTree)
  }

  const renderFieldInput = (field: FieldDefinition, value: any, onChange: (value: any) => void) => {
    switch (field.type) {
      case 'string':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        )
        
      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value))}
            placeholder={field.placeholder}
            min={field.validation?.min}
            max={field.validation?.max}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        )
        
      case 'enum':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          >
            <option value="">Selecione...</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.icon && `${option.icon} `}{option.label}
              </option>
            ))}
          </select>
        )
        
      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        )
    }
  }

  const ConditionItem: React.FC<ConditionItemProps> = React.memo(({ item, availableFields, availableFieldsGrouped, onUpdate, onDelete, onAddRelatedCondition, onGroupWith, level }) => {
    const isGroup = 'type' in item
    const indentClass = level > 0 ? (level === 1 ? 'ml-4' : level === 2 ? 'ml-8' : 'ml-12') : ''

    if (isGroup) {
      const group = item as ConditionGroup
      const borderColor = group.type === 'AND' ? 'border-blue-400' : 'border-green-400'
      const bgColor = group.type === 'AND' ? 'bg-blue-50' : 'bg-green-50'
      
      return (
        <div className={`border-l-4 ${borderColor} ${bgColor} rounded-r-lg p-3 ${indentClass} transition-all duration-200 hover:shadow-md group`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium text-gray-700">Grupo:</span>
              <select
                value={group.type}
                onChange={(e) => onUpdate({ ...group, type: e.target.value as 'AND' | 'OR' })}
                className={`px-2 py-1 border border-gray-300 rounded text-sm bg-white ${
                  group.type === 'AND' ? 'text-blue-700' : 'text-green-700'
                }`}
              >
                <option value="AND">🔗 AND (todos devem ser verdadeiros)</option>
                <option value="OR">🔀 OR (pelo menos um deve ser verdadeiro)</option>
              </select>
            </div>
            
            <button
              onClick={onDelete}
              className="ml-auto p-1 text-red-600 hover:bg-red-100 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              title="Remover grupo"
            >
              <Trash2 size={14} />
            </button>
          </div>
          
          <div className="space-y-2">
            {group.conditions.map((condition, index) => (
              <ConditionItem
                key={index}
                item={condition}
                availableFields={availableFields}
                availableFieldsGrouped={availableFieldsGrouped}
                onUpdate={(updatedItem) => {
                  const newConditions = [...group.conditions]
                  newConditions[index] = updatedItem
                  onUpdate({ ...group, conditions: newConditions })
                }}
                onDelete={() => {
                  const newConditions = group.conditions.filter((_, i) => i !== index)
                  onUpdate({ ...group, conditions: newConditions })
                }}
                onAddRelatedCondition={!('type' in condition) ? (type: 'AND' | 'OR') => {
                  // Convert current condition into a group with the new related condition
                  const currentCondition = condition as BaseCondition
                  const newCondition: BaseCondition = { field: '', operator: '==', value: '' }
                  
                  const newGroup: ConditionGroup = {
                    type: type,
                    conditions: [currentCondition, newCondition]
                  }
                  
                  const newConditions = [...group.conditions]
                  newConditions[index] = newGroup
                  onUpdate({ ...group, conditions: newConditions })
                } : undefined}
                level={level + 1}
              />
            ))}
          </div>
          
          <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-gray-200">
            <button
              onClick={() => {
                const newCondition: BaseCondition = { field: '', operator: '==', value: '' }
                onUpdate({ ...group, conditions: [...group.conditions, newCondition] })
              }}
              className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              <Plus size={12} />
              Adicionar Condição
            </button>
            <button
              onClick={() => {
                const newGroup: ConditionGroup = { type: 'AND', conditions: [{ field: '', operator: '==', value: '' }] }
                onUpdate({ ...group, conditions: [...group.conditions, newGroup] })
              }}
              className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
              title="Todas as condições deste grupo devem ser verdadeiras"
            >
              🔗 Grupo AND
            </button>
            <button
              onClick={() => {
                const newGroup: ConditionGroup = { type: 'OR', conditions: [{ field: '', operator: '==', value: '' }] }
                onUpdate({ ...group, conditions: [...group.conditions, newGroup] })
              }}
              className="flex items-center gap-1 px-3 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors"
              title="Pelo menos uma condição deste grupo deve ser verdadeira"
            >
              🔀 Grupo OR
            </button>
          </div>
        </div>
      )
    } else {
      const condition = item as BaseCondition
      const selectedField = availableFields.find(f => f.name === condition.field)
      
      return (
        <div className={`bg-white border-l-4 border-l-gray-300 border border-gray-200 rounded-r p-3 ${indentClass} transition-all duration-200 hover:border-blue-300 hover:border-l-blue-400 hover:shadow-sm group relative`}>
          <div className="absolute left-0 top-3 bottom-3 w-1 bg-gray-300 group-hover:bg-blue-400 transition-colors rounded-r"></div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-500 w-16 font-medium">🎯 Se</span>
            <button
              onClick={onDelete}
              className="ml-auto p-1 text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              title="Remover condição"
            >
              <Trash2 size={12} />
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {/* Field Selection */}
            <div>
              <select
                value={condition.field || ''}
                onChange={(e) => onUpdate({ ...condition, field: e.target.value })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Selecione o campo...</option>
                {availableFieldsGrouped ? (
                  // Use grouped fields if available
                  Object.entries(availableFieldsGrouped).map(([category, items]) => (
                    <optgroup key={category} label={category}>
                      {items.map(item => (
                        <option key={item.field.name} value={item.field.name}>
                          {item.displayLabel}
                        </option>
                      ))}
                    </optgroup>
                  ))
                ) : (
                  // Fallback to simple list
                  availableFields.map(field => (
                    <option key={field.name} value={field.name}>
                      {field.label}
                    </option>
                  ))
                )}
              </select>
            </div>
            
            {/* Operator Selection */}
            <div>
              <select
                value={condition.operator || '=='}
                onChange={(e) => onUpdate({ ...condition, operator: e.target.value as Operator })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="==">=</option>
                <option value="!=">≠</option>
                <option value=">">&gt;</option>
                <option value=">=">&gt;=</option>
                <option value="<">&lt;</option>
                <option value="<=">&lt;=</option>
                <option value="in">está em</option>
                <option value="contains">contém</option>
              </select>
            </div>
            
            {/* Value Input */}
            <div>
              {condition.field && selectedField ? (
                renderFieldInput(
                  selectedField,
                  condition.value,
                  (value) => onUpdate({ ...condition, value })
                )
              ) : (
                <input
                  type="text"
                  value={condition.value || ''}
                  onChange={(e) => onUpdate({ ...condition, value: e.target.value })}
                  placeholder="Valor..."
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              )}
            </div>
          </div>
          
          {selectedField?.helper && (
            <div className="text-xs text-gray-500 mt-1">{selectedField.helper}</div>
          )}
          
          {/* Contextual Actions for Individual Conditions */}
          <div className="mt-3 pt-2 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="text-xs text-gray-500 mb-2">Ações para esta condição:</div>
            <div className="flex flex-wrap gap-1">
              {onAddRelatedCondition && (
                <button
                  onClick={() => onAddRelatedCondition('AND')}
                  className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors flex items-center gap-1"
                  title="Adicionar condição que deve ser verdadeira JUNTO com esta"
                >
                  🔗 + E também
                </button>
              )}
              {onAddRelatedCondition && (
                <button
                  onClick={() => onAddRelatedCondition('OR')}
                  className="px-2 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors flex items-center gap-1"
                  title="Adicionar alternativa que pode ser verdadeira AO INVÉS desta"
                >
                  🔀 + Ou então
                </button>
              )}
            </div>
            <div className="text-xs text-gray-400 mt-1 italic">
              💡 Use "E também" para adicionar uma condição que deve acontecer junto com esta
            </div>
            
            {/* Preview hint - only show when condition is filled */}
            {condition.field && condition.operator && condition.value && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                <div className="text-blue-700 font-medium">Prévia desta condição:</div>
                <div className="text-blue-600 font-mono mt-1">
                  {(() => {
                    let fieldName = condition.field || '?'
                    if (availableFieldsGrouped) {
                      Object.values(availableFieldsGrouped).forEach(categoryFields => {
                        const foundField = categoryFields.find(item => item.field.name === condition.field)
                        if (foundField) {
                          fieldName = foundField.displayLabel
                        }
                      })
                    }
                    const operator = condition.operator === '==' ? '=' : condition.operator
                    return `${fieldName} ${operator} ${condition.value}`
                  })()}
                </div>
                {onAddRelatedCondition && (
                  <div className="text-blue-600 mt-1">
                    ➕ Clique em "E também" para adicionar mais condições para este item
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )
    }
  })

  const generateLogicExpression = (tree: ConditionGroup, level: number = 0): JSX.Element => {
    const renderConditionGroup = (group: ConditionGroup, isRoot: boolean = false) => {
      const parts: JSX.Element[] = []
      
      group.conditions.forEach((condition, index) => {
        const isLast = index === group.conditions.length - 1
        
        if ('type' in condition) {
          // Nested group - render as a separate block with proper spacing
          parts.push(
            <div key={index} className="bg-white border-l-4 border-l-blue-400 border border-gray-200 rounded-lg p-4 shadow-sm">
              {renderConditionGroup(condition as ConditionGroup, false)}
            </div>
          )
        } else {
          // Simple condition with better styling
          let fieldName = condition.field || '?'
          
          if (availableFieldsGrouped) {
            Object.values(availableFieldsGrouped).forEach(categoryFields => {
              const foundField = categoryFields.find(item => item.field.name === condition.field)
              if (foundField) {
                fieldName = foundField.displayLabel
              }
            })
          } else {
            const field = availableFields.find(f => f.name === condition.field)
            fieldName = field?.label || condition.field || '?'
          }
          
          const operator = condition.operator === '==' ? '=' : condition.operator
          const value = condition.value || '?'
          
          parts.push(
            <div key={index} className="bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-base font-semibold text-gray-900">
                {fieldName} <span className="text-blue-600">{operator}</span> <span className="text-green-600">{value}</span>
              </div>
            </div>
          )
        }
        
        // Add operator between conditions with better styling
        if (!isLast) {
          const operatorBg = group.type === 'AND' ? 'bg-blue-100' : 'bg-green-100'
          const operatorText = group.type === 'AND' ? 'text-blue-700' : 'text-green-700'
          const operatorBorder = group.type === 'AND' ? 'border-blue-300' : 'border-green-300'
          
          parts.push(
            <div key={`op-${index}`} className="flex justify-center my-3">
              <div className={`px-4 py-2 ${operatorBg} ${operatorText} ${operatorBorder} border rounded-full font-bold text-sm shadow-sm`}>
                {group.type}
              </div>
            </div>
          )
        }
      })
      
      return <div className="space-y-3">{parts}</div>
    }
    
    return (
      <div className="p-4">
        <div className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="bg-gray-800 text-white px-3 py-1 rounded-lg text-sm">SE</span>
          <span className="text-gray-500">a missão será completada quando:</span>
        </div>
        
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 shadow-inner">
          {renderConditionGroup(tree, level === 0)}
        </div>
      </div>
    )
  }

  const detectImpossibleLogic = (tree: ConditionGroup): string[] => {
    const warnings: string[] = []
    const fieldValues: Record<string, any[]> = {}
    
    // Collect all field=value pairs in AND groups
    const collectFieldValues = (group: ConditionGroup, isAndGroup: boolean) => {
      if (isAndGroup) {
        group.conditions.forEach(condition => {
          if (!('type' in condition) && condition.field && condition.operator === '==' && condition.value) {
            if (!fieldValues[condition.field]) fieldValues[condition.field] = []
            fieldValues[condition.field].push(condition.value)
          }
        })
      }
      
      group.conditions.forEach(condition => {
        if ('type' in condition) {
          collectFieldValues(condition, condition.type === 'AND')
        }
      })
    }
    
    collectFieldValues(tree, tree.type === 'AND')
    
    // Check for impossible conditions
    Object.entries(fieldValues).forEach(([field, values]) => {
      if (values.length > 1) {
        const fieldName = availableFields.find(f => f.name === field)?.label || field
        warnings.push(`⚠️ Campo "${fieldName}" não pode ser ${values.join(' E ')} ao mesmo tempo`)
      }
    })
    
    return warnings
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-gray-900">Condições Avançadas</h4>
        <div className="text-xs text-gray-500">
          Use grupos AND/OR para criar lógica complexa
        </div>
      </div>
      
      <ConditionItem
        item={conditionTree}
        availableFields={availableFields}
        availableFieldsGrouped={availableFieldsGrouped}
        onUpdate={(item) => {
          if ('type' in item && 'conditions' in item) {
            updateConditionTree(item as ConditionGroup)
          }
        }}
        onDelete={() => {
          // Reset to simple condition
          const newTree: ConditionGroup = {
            type: 'AND',
            conditions: [{
              field: '',
              operator: '==' as Operator,
              value: ''
            }]
          }
          updateConditionTree(newTree)
        }}
        onAddRelatedCondition={(type: 'AND' | 'OR') => {
          // For root level, we add a new condition to the main group
          const newCondition: BaseCondition = { field: '', operator: '==', value: '' }
          const newTree = { ...conditionTree, conditions: [...conditionTree.conditions, newCondition] }
          updateConditionTree(newTree)
        }}
        level={0}
      />
      
      {/* Warnings */}
      {(() => {
        const warnings = detectImpossibleLogic(conditionTree)
        return warnings.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="text-sm font-medium text-red-900 mb-2">
              ⚠️ Problemas Detectados:
            </div>
            {warnings.map((warning, index) => (
              <div key={index} className="text-sm text-red-800 mb-1">
                {warning}
              </div>
            ))}
            <div className="text-xs text-red-600 mt-2">
              <strong>Sugestão:</strong> Use grupos OR para alternativas do mesmo campo
            </div>
          </div>
        )
      })()}

      {/* Logic Preview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-blue-900">
            💡 Lógica Final:
          </div>
          <div className="text-xs text-blue-600">
            {(() => {
              const conditionCount = JSON.stringify(conditionTree).split('"field":').length - 1
              return `${conditionCount} condição${conditionCount !== 1 ? 'ões' : ''}`
            })()}
          </div>
        </div>
        <div className="bg-white rounded border shadow-sm">
          {generateLogicExpression(conditionTree)}
        </div>
        <div className="text-xs text-blue-600 mt-2">
          ✨ Esta é a lógica que será aplicada para validar se uma missão foi completada
        </div>
      </div>
      
    </div>
  )
}