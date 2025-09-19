'use client'

import React from 'react'
import { X, Users, UserPlus, UserX, Info } from 'lucide-react'
import { GroupTagProps } from '@/types/customer-groups'

export function GroupTag({
  group,
  type,
  onRemove,
  disabled = false
}: GroupTagProps) {
  const isInclude = type === 'include'
  
  const baseClasses = "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
  const typeClasses = isInclude 
    ? "bg-green-50 text-green-700 border border-green-200" 
    : "bg-red-50 text-red-700 border border-red-200"
  
  const hoverClasses = disabled 
    ? "opacity-50 cursor-not-allowed" 
    : "hover:shadow-sm"

  return (
    <div className={`${baseClasses} ${typeClasses} ${hoverClasses}`}>
      {/* Icon */}
      <div className="flex-shrink-0">
        {isInclude ? (
          <UserPlus className="h-3 w-3" />
        ) : (
          <UserX className="h-3 w-3" />
        )}
      </div>
      
      {/* Group Info */}
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">
          {group.name}
        </div>
        {group.memberCount !== undefined && (
          <div className={`text-xs mt-0.5 ${
            isInclude ? 'text-green-600' : 'text-red-600'
          }`}>
            {group.memberCount.toLocaleString()} membros
          </div>
        )}
      </div>

      {/* Description tooltip trigger */}
      {group.description && (
        <div className="flex-shrink-0">
          <div 
            className={`p-1 rounded hover:bg-opacity-20 ${
              isInclude ? 'hover:bg-green-200' : 'hover:bg-red-200'
            }`}
            title={group.description}
          >
            <Info className="h-3 w-3" />
          </div>
        </div>
      )}

      {/* Remove Button */}
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className={`flex-shrink-0 p-1 rounded-full transition-colors ${
          disabled 
            ? 'cursor-not-allowed' 
            : `hover:bg-opacity-20 ${
                isInclude 
                  ? 'hover:bg-green-200' 
                  : 'hover:bg-red-200'
              }`
        }`}
        title="Remover grupo"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}