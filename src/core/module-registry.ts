// Module registry for managing different verticals (iGaming, E-commerce, SaaS, etc.)
// This is the core system that allows plug-and-play modules

import { 
  ModuleDefinition, 
  ModuleRegistry as IModuleRegistry,
  ModuleError,
  ValidationResult
} from './types'

class ModuleRegistry implements IModuleRegistry {
  private modules: Map<string, ModuleDefinition> = new Map()
  private static instance: ModuleRegistry

  static getInstance(): ModuleRegistry {
    if (!ModuleRegistry.instance) {
      ModuleRegistry.instance = new ModuleRegistry()
    }
    return ModuleRegistry.instance
  }

  /**
   * Register a new module
   */
  register(module: ModuleDefinition): void {
    // Validate module structure
    const validation = this.validateModule(module)
    if (!validation.isValid) {
      throw new ModuleError(
        `Invalid module "${module.name}": ${validation.errors.join(', ')}`,
        module.name
      )
    }

    // Check for conflicts
    if (this.modules.has(module.name)) {
      console.warn(`Module "${module.name}" is being overwritten`)
    }

    // Register module
    this.modules.set(module.name, module)
    console.log(`✅ Module "${module.name}" registered successfully`)
  }

  /**
   * Unregister a module
   */
  unregister(moduleName: string): void {
    if (this.modules.delete(moduleName)) {
      console.log(`🗑️ Module "${moduleName}" unregistered`)
    } else {
      console.warn(`Module "${moduleName}" was not registered`)
    }
  }

  /**
   * Get a specific module
   */
  getModule(name: string): ModuleDefinition | null {
    return this.modules.get(name) || null
  }

  /**
   * Get all registered modules
   */
  getAllModules(): ModuleDefinition[] {
    return Array.from(this.modules.values())
  }

  /**
   * Get modules by category/vertical
   */
  getModulesByCategory(category: string): ModuleDefinition[] {
    return Array.from(this.modules.values()).filter(module => {
      // Check if any event types match the category
      return module.eventTypes.some(eventType => eventType.category === category)
    })
  }

  /**
   * Check if module is registered
   */
  isModuleRegistered(name: string): boolean {
    return this.modules.has(name)
  }

  /**
   * Get available event types across all modules
   */
  getAllEventTypes() {
    const eventTypes: Record<string, any> = {}
    
    this.modules.forEach((module, moduleName) => {
      module.eventTypes.forEach(eventType => {
        eventTypes[eventType.key] = {
          ...eventType,
          module: moduleName
        }
      })
    })

    return eventTypes
  }

  /**
   * Get event types for specific module
   */
  getEventTypesForModule(moduleName: string) {
    const module = this.getModule(moduleName)
    if (!module) {
      throw new ModuleError(`Module "${moduleName}" not found`, moduleName)
    }
    
    return module.eventTypes.reduce((acc, eventType) => {
      acc[eventType.key] = eventType
      return acc
    }, {} as Record<string, any>)
  }

  /**
   * Get templates for specific module
   */
  getTemplatesForModule(moduleName: string) {
    const module = this.getModule(moduleName)
    if (!module) {
      throw new ModuleError(`Module "${moduleName}" not found`, moduleName)
    }
    
    return module.templates
  }

  /**
   * Get all templates across modules
   */
  getAllTemplates() {
    const templates: any[] = []
    
    this.modules.forEach((module) => {
      templates.push(...module.templates)
    })

    return templates
  }

  /**
   * Search templates across modules
   */
  searchTemplates(query: string, moduleName?: string) {
    const lowerQuery = query.toLowerCase()
    let templates = moduleName 
      ? this.getTemplatesForModule(moduleName)
      : this.getAllTemplates()

    return templates.filter(template => 
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery) ||
      template.tags.some((tag: string) => tag.toLowerCase().includes(lowerQuery))
    )
  }

  /**
   * Get module statistics
   */
  getModuleStats() {
    const stats: Record<string, any> = {}

    this.modules.forEach((module, name) => {
      stats[name] = {
        eventTypes: module.eventTypes?.length || 0,
        templates: module.templates?.length || 0,
        validators: module.validators?.length || 0,
        version: module.version,
        hasComponents: Object.keys(module.components || {}).length > 0,
        hasTranslations: Object.keys(module.translations || {}).length > 0
      }
    })

    return stats
  }

  /**
   * Validate module structure
   */
  private validateModule(module: ModuleDefinition): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Required fields
    if (!module.name) errors.push('Module name is required')
    if (!module.label) errors.push('Module label is required')
    if (!module.version) errors.push('Module version is required')
    if (!module.eventTypes || module.eventTypes.length === 0) {
      errors.push('Module must have at least one event type')
    }

    // Validate event types
    module.eventTypes?.forEach((eventType, index) => {
      if (!eventType.key) errors.push(`Event type ${index} missing key`)
      if (!eventType.label) errors.push(`Event type ${index} missing label`)
      if (!eventType.fields || eventType.fields.length === 0) {
        warnings.push(`Event type ${eventType.key} has no fields`)
      }

      // Validate fields
      eventType.fields?.forEach((field, fieldIndex) => {
        if (!field.name) errors.push(`Field ${fieldIndex} in ${eventType.key} missing name`)
        if (!field.label) errors.push(`Field ${fieldIndex} in ${eventType.key} missing label`)
        if (!field.type) errors.push(`Field ${fieldIndex} in ${eventType.key} missing type`)
      })
    })

    // Validate templates
    module.templates?.forEach((template, index) => {
      if (!template.id) errors.push(`Template ${index} missing id`)
      if (!template.name) errors.push(`Template ${index} missing name`)
      if (!template.rule) errors.push(`Template ${index} missing rule`)
      if (template.module !== module.name) {
        warnings.push(`Template ${template.id} module mismatch`)
      }
    })

    // Validate validators
    if (Array.isArray(module.validators)) {
      module.validators.forEach((validator, index) => {
        if (!validator.name) errors.push(`Validator ${index} missing name`)
        if (!validator.validate || typeof validator.validate !== 'function') {
          errors.push(`Validator ${index} missing validate function`)
        }
      })
    }

    // Check for reasonable limits
    if (module.eventTypes.length > 50) {
      warnings.push('Module has many event types (>50), consider splitting')
    }
    if (module.templates.length > 100) {
      warnings.push('Module has many templates (>100), consider categorizing')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Export module registry state (for debugging/monitoring)
   */
  exportState() {
    return {
      modules: Array.from(this.modules.keys()),
      totalEventTypes: this.getAllEventTypes(),
      totalTemplates: this.getAllTemplates().length,
      stats: this.getModuleStats()
    }
  }

  /**
   * Import module registry state (for testing/initialization)
   */
  importState(modules: ModuleDefinition[]) {
    this.modules.clear()
    modules.forEach(module => {
      try {
        this.register(module)
      } catch (error) {
        console.error(`Failed to import module ${module.name}:`, error)
      }
    })
  }

  /**
   * Clear all modules (for testing)
   */
  clear() {
    this.modules.clear()
  }

  /**
   * Get module health status
   */
  getModuleHealth() {
    const health: Record<string, any> = {}

    this.modules.forEach((module, name) => {
      const validation = this.validateModule(module)
      health[name] = {
        status: validation.isValid ? 'healthy' : 'error',
        errors: validation.errors,
        warnings: validation.warnings,
        lastChecked: new Date().toISOString()
      }
    })

    return health
  }
}

// Singleton instance
export const moduleRegistry = ModuleRegistry.getInstance()

// Helper functions for easier access
export function getModule(name: string) {
  return moduleRegistry.getModule(name)
}

export function getAllModules() {
  return moduleRegistry.getAllModules()
}

export function getEventTypesForModule(moduleName: string) {
  return moduleRegistry.getEventTypesForModule(moduleName)
}

export function getTemplatesForModule(moduleName: string) {
  return moduleRegistry.getTemplatesForModule(moduleName)
}

export function searchTemplates(query: string, moduleName?: string) {
  return moduleRegistry.searchTemplates(query, moduleName)
}

// Auto-discovery and registration helpers
export function registerModulesFromDirectory(modules: ModuleDefinition[]) {
  modules.forEach(module => {
    try {
      moduleRegistry.register(module)
    } catch (error) {
      console.error(`Failed to auto-register module ${module.name}:`, error)
    }
  })
}