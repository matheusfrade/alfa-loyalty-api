import React, { useState } from 'react'
import { HelpCircle, Info } from 'lucide-react'

interface InfoTooltipProps {
  title: string
  content: string
  examples?: string[]
  variant?: 'help' | 'info'
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export function InfoTooltip({ 
  title, 
  content, 
  examples, 
  variant = 'help',
  position = 'top' 
}: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  
  const Icon = variant === 'help' ? HelpCircle : Info
  
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  }
  
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={(e) => {
          e.preventDefault()
          setIsVisible(!isVisible)
        }}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <Icon size={16} />
      </button>
      
      {isVisible && (
        <div className={`absolute z-50 ${positionClasses[position]} w-80 pointer-events-none`}>
          <div className="bg-gray-900 text-white rounded-lg shadow-xl p-4 text-sm">
            <div className="font-semibold mb-2">{title}</div>
            <div className="mb-2">{content}</div>
            {examples && examples.length > 0 && (
              <div className="border-t border-gray-700 pt-2 mt-2">
                <div className="text-xs font-semibold mb-1">Exemplos:</div>
                <ul className="text-xs space-y-1">
                  {examples.map((example, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="text-green-400">•</span>
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className={`absolute ${position === 'top' ? 'bottom-[-6px]' : 'top-[-6px]'} left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45`}></div>
          </div>
        </div>
      )}
    </div>
  )
}