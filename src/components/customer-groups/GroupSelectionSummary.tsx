'use client'

import React from 'react'
import { UserPlus, UserX, Users, Info } from 'lucide-react'

interface GroupSelectionSummaryProps {
  includeCount: number
  excludeCount: number
  className?: string
}

export function GroupSelectionSummary({
  includeCount,
  excludeCount,
  className = ''
}: GroupSelectionSummaryProps) {
  const totalSelected = includeCount + excludeCount

  if (totalSelected === 0) {
    return null
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Total Count */}
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Users className="h-4 w-4" />
        <span>{totalSelected} grupos selecionados</span>
      </div>

      {/* Include Count */}
      {includeCount > 0 && (
        <div className="flex items-center gap-1.5 text-sm text-green-700">
          <UserPlus className="h-3 w-3" />
          <span className="font-medium">{includeCount}</span>
          <span className="text-green-600">incluídos</span>
        </div>
      )}

      {/* Exclude Count */}
      {excludeCount > 0 && (
        <div className="flex items-center gap-1.5 text-sm text-red-700">
          <UserX className="h-3 w-3" />
          <span className="font-medium">{excludeCount}</span>
          <span className="text-red-600">excluídos</span>
        </div>
      )}

      {/* Logic Explanation */}
      {includeCount > 0 && excludeCount > 0 && (
        <div className="flex items-center gap-1 text-xs text-gray-500 ml-2">
          <Info className="h-3 w-3" />
          <span>Exclusão tem prioridade</span>
        </div>
      )}
    </div>
  )
}