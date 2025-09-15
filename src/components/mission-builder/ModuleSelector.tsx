// Module Selector Component
// Allows users to choose which vertical/module to create missions for

import React, { useState, useEffect } from 'react'
import { getAvailableModules, validateAllModules } from '../../modules'
import type { ModuleDefinition } from '../../core/types'

interface ModuleSelectorProps {
  selectedModule?: string
  onModuleChange: (moduleName: string) => void
  showHealth?: boolean
  className?: string
}

interface ModuleInfo {
  name: string
  label: string
  description: string
  icon: string
  version: string
  eventTypesCount: number
  templatesCount: number
  hasCustomComponents: boolean
  supportedLocales: string[]
  features: Array<{
    key: string
    label: string
    enabled: boolean
  }>
}

export function ModuleSelector({ 
  selectedModule, 
  onModuleChange, 
  showHealth = false,
  className = '' 
}: ModuleSelectorProps) {
  const [modules, setModules] = useState<ModuleInfo[]>([])
  const [systemHealth, setSystemHealth] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadModules()
  }, [])

  const loadModules = async () => {
    try {
      const availableModules = getAvailableModules()
      setModules(availableModules)
      
      if (showHealth) {
        const health = validateAllModules()
        setSystemHealth(health)
      }
    } catch (error) {
      console.error('Failed to load modules:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleModuleSelect = (moduleName: string) => {
    onModuleChange(moduleName)
  }

  if (loading) {
    return (
      <div className={`flex justify-center items-center min-h-[200px] ${className}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-3 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="text-gray-600">Carregando módulos...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full max-w-6xl mx-auto space-y-6 ${className}`}>
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-2xl font-semibold text-gray-900">
          <span>🎯</span>
          Escolha o Módulo
        </h3>
        <p className="text-gray-600">
          Selecione o vertical para o qual deseja criar missões
        </p>
        
        {showHealth && systemHealth && (
          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
            systemHealth.isHealthy 
              ? 'bg-green-50 text-green-800' 
              : 'bg-yellow-50 text-yellow-800'
          }`}>
            <span>
              {systemHealth.isHealthy ? '✅' : '⚠️'}
            </span>
            <span>
              {systemHealth.healthyModules}/{systemHealth.totalModules} módulos saudáveis
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map(module => (
          <div
            key={module.name}
            className={`relative bg-white border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
              selectedModule === module.name 
                ? 'border-blue-500 bg-blue-50 shadow-lg' 
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => handleModuleSelect(module.name)}
          >
            {module.hasCustomComponents && (
              <div className="absolute top-4 right-4 text-lg opacity-70">🧩</div>
            )}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                {module.icon}
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 m-0">{module.label}</h4>
                <span className="text-xs text-gray-500 font-medium">v{module.version}</span>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm leading-relaxed mb-4">{module.description}</p>
            
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span className="text-sm">⚡</span>
                <span>{module.eventTypesCount} eventos</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span className="text-sm">📋</span>
                <span>{module.templatesCount} templates</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span className="text-sm">🌍</span>
                <span>{module.supportedLocales.join(', ')}</span>
              </div>
            </div>
            
            {module.features.length > 0 && (
              <div className="mb-4">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Recursos:</div>
                <div className="flex flex-wrap gap-1">
                  {module.features.filter(f => f.enabled).map(feature => (
                    <span key={feature.key} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                      {feature.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-auto">
              <button
                className={`w-full px-4 py-2 border-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  selectedModule === module.name
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-transparent text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white'
                }`}
                onClick={(e) => {
                  e.stopPropagation()
                  handleModuleSelect(module.name)
                }}
              >
                {selectedModule === module.name ? (
                  <>
                    <span className="font-bold">✓</span>
                    Selecionado
                  </>
                ) : (
                  'Selecionar'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {modules.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <div className="text-5xl mb-4">📦</div>
          <h4 className="text-lg font-medium text-gray-700 mb-2">Nenhum módulo disponível</h4>
          <p className="text-sm">Não há módulos registrados no sistema.</p>
        </div>
      )}
    </div>
  )
}

