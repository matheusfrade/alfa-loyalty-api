// Module Auto-Registration
// This file automatically registers all available modules with the core system

import { moduleRegistry } from '../core/module-registry'
import { IGAMING_MODULE } from './igaming'
import { CASINO_MODULE } from './casino'
import { SPORTSBOOK_MODULE } from './sportsbook'
import { DEPOSITS_MODULE } from './deposits'
import { ENGAGEMENT_MODULE } from './engagement'

// Auto-register all modules
export function initializeModules() {
  console.log('🚀 Initializing modular mission system...')
  
  try {
    // Register all modules
    moduleRegistry.register(IGAMING_MODULE)
    console.log('✅ iGaming module registered successfully')
    
    moduleRegistry.register(CASINO_MODULE)
    console.log('✅ Casino module registered successfully')
    
    moduleRegistry.register(SPORTSBOOK_MODULE)
    console.log('✅ Sportsbook module registered successfully')
    
    moduleRegistry.register(DEPOSITS_MODULE)
    console.log('✅ Deposits module registered successfully')
    
    moduleRegistry.register(ENGAGEMENT_MODULE)
    console.log('✅ Engagement module registered successfully')
    
    // Log system status
    const stats = moduleRegistry.getModuleStats()
    const health = moduleRegistry.getModuleHealth()
    
    console.log('📊 Module System Stats:', stats)
    console.log('💚 Module Health Check:', health)
    
    return {
      success: true,
      stats,
      health,
      modules: moduleRegistry.getAllModules().map(m => ({
        name: m.name,
        label: m.label,
        version: m.version,
        eventTypes: m.eventTypes.length,
        templates: m.templates.length
      }))
    }
  } catch (error) {
    console.error('❌ Failed to initialize modules:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      modules: []
    }
  }
}

// Export modules for direct access
export { IGAMING_MODULE } from './igaming'
export { CASINO_MODULE } from './casino'
export { SPORTSBOOK_MODULE } from './sportsbook'
export { DEPOSITS_MODULE } from './deposits'
export { ENGAGEMENT_MODULE } from './engagement'

// Export module registry helpers
export {
  moduleRegistry,
  getModule,
  getAllModules,
  getEventTypesForModule,
  getTemplatesForModule,
  searchTemplates
} from '../core/module-registry'

// Helper to get all available modules with their info
export function getAvailableModules() {
  return moduleRegistry.getAllModules().map(module => ({
    name: module.name,
    label: module.label,
    description: module.description,
    icon: module.icon,
    version: module.version,
    eventTypesCount: module.eventTypes.length,
    templatesCount: module.templates.length,
    hasCustomComponents: Object.keys(module.components).length > 0,
    supportedLocales: Object.keys(module.translations),
    features: module.settings?.features?.map(f => ({
      key: f.key,
      label: f.label,
      enabled: f.enabled
    })) || []
  }))
}

// Helper to validate all modules
export function validateAllModules() {
  const health = moduleRegistry.getModuleHealth()
  const issues: any[] = []
  
  Object.entries(health).forEach(([moduleName, moduleHealth]) => {
    if (moduleHealth.status !== 'healthy') {
      issues.push({
        module: moduleName,
        errors: moduleHealth.errors,
        warnings: moduleHealth.warnings
      })
    }
  })
  
  return {
    isHealthy: issues.length === 0,
    issues,
    totalModules: Object.keys(health).length,
    healthyModules: Object.values(health).filter(h => h.status === 'healthy').length
  }
}

// Helper to get module-specific event types for UI
export function getEventTypesForUI(moduleName: string, locale: string = 'pt-BR') {
  const module = moduleRegistry.getModule(moduleName)
  if (!module) return []
  
  return module.eventTypes.map(eventType => ({
    key: eventType.key,
    label: eventType.label,
    description: eventType.description,
    icon: eventType.icon,
    category: eventType.category,
    fields: eventType.fields.map(field => ({
      name: field.name,
      label: field.label,
      type: field.type,
      required: field.required,
      helper: field.helper,
      placeholder: field.placeholder,
      options: field.options?.map(opt => ({
        value: opt.value,
        label: opt.label,
        helper: opt.helper,
        icon: opt.icon
      })) || [],
      validation: field.validation,
      dependsOn: field.dependsOn,
      showWhen: field.showWhen
    }))
  }))
}

// Helper to get ALL event types from ALL modules for UI
export function getAllEventTypesForUI(locale: string = 'pt-BR') {
  const allModules = moduleRegistry.getAllModules()
  const allEventTypes: any[] = []
  
  // Collect events from all modules
  allModules.forEach(module => {
    module.eventTypes.forEach(eventType => {
      allEventTypes.push({
        key: eventType.key,
        label: eventType.label,
        description: eventType.description,
        icon: eventType.icon,
        category: eventType.category,
        module: module.name, // Track which module this came from
        fields: eventType.fields.map(field => ({
          name: field.name,
          label: field.label,
          type: field.type,
          required: field.required,
          helper: field.helper,
          placeholder: field.placeholder,
          options: field.options?.map(opt => ({
            value: opt.value,
            label: opt.label,
            helper: opt.helper,
            icon: opt.icon
          })) || [],
          validation: field.validation,
          dependsOn: field.dependsOn,
          showWhen: field.showWhen
        }))
      })
    })
  })
  
  // Remove duplicates (same key) and return
  const uniqueEventTypes = allEventTypes.filter((event, index, self) =>
    index === self.findIndex((e) => e.key === event.key)
  )
  
  return uniqueEventTypes
}

// Helper to search templates across modules
export function searchTemplatesAdvanced(params: {
  query?: string
  module?: string
  category?: string
  difficulty?: string
  tags?: string[]
  locale?: string
}) {
  let templates = params.module 
    ? moduleRegistry.getTemplatesForModule(params.module)
    : moduleRegistry.getAllTemplates()
  
  // Apply filters
  if (params.query) {
    const lowerQuery = params.query.toLowerCase()
    templates = templates.filter(template => 
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery) ||
      template.tags.some((tag: string) => tag.toLowerCase().includes(lowerQuery))
    )
  }
  
  if (params.category) {
    templates = templates.filter(template => template.category === params.category)
  }
  
  if (params.difficulty) {
    templates = templates.filter(template => template.difficulty === params.difficulty)
  }
  
  if (params.tags && params.tags.length > 0) {
    templates = templates.filter(template => 
      params.tags!.some(tag => template.tags.includes(tag))
    )
  }
  
  return templates.map(template => ({
    ...template,
    estimatedComplexity: calculateTemplateComplexity(template),
    compatibleModules: [template.module] // Could expand to check cross-module compatibility
  }))
}

// Helper to calculate template complexity
function calculateTemplateComplexity(template: any) {
  let complexity = 0
  
  // Count triggers
  complexity += template.rule.triggers?.length || 0
  
  // Count conditions
  complexity += template.rule.conditions?.length || 0
  
  // Check for advanced features
  if (template.rule.timeWindow) complexity += 2
  if (template.rule.cooldown) complexity += 1
  if (template.rule.maxClaims) complexity += 1
  if (template.rule.prerequisites?.length) complexity += template.rule.prerequisites.length
  if (template.rule.excludeIf?.length) complexity += template.rule.excludeIf.length
  if (template.rule.logic && template.rule.logic !== 'AND') complexity += 1
  
  // Categorize complexity
  if (complexity <= 3) return 'LOW'
  if (complexity <= 6) return 'MEDIUM'
  if (complexity <= 10) return 'HIGH'
  return 'VERY_HIGH'
}