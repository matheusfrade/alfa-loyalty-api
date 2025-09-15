// Example Usage of the Modular Mission System
// This demonstrates how to use the new modular architecture

import { 
  initializeModules, 
  getAvailableModules, 
  searchTemplatesAdvanced,
  getEventTypesForUI,
  moduleRegistry
} from './modules'
import { IGAMING_MODULE, getTranslation } from './modules/igaming'

// 1. Initialize the modular system
export async function exampleInitialization() {
  console.log('🚀 Initializing modular mission system...')
  
  const result = initializeModules()
  
  if (result.success) {
    console.log('✅ System initialized successfully!')
    console.log('📊 Available modules:', result.modules)
    console.log('💚 System health:', result.health)
  } else {
    console.error('❌ System initialization failed:', result.error)
  }
  
  return result
}

// 2. Explore available modules
export function exampleModuleExploration() {
  console.log('\n🔍 Exploring available modules...')
  
  const modules = getAvailableModules()
  
  modules.forEach(module => {
    console.log(`\n📦 Module: ${module.label} (${module.name})`)
    console.log(`   Description: ${module.description}`)
    console.log(`   Version: ${module.version}`)
    console.log(`   Event Types: ${module.eventTypesCount}`)
    console.log(`   Templates: ${module.templatesCount}`)
    console.log(`   Features: ${module.features.map(f => f.label).join(', ')}`)
    console.log(`   Locales: ${module.supportedLocales.join(', ')}`)
  })
}

// 3. Work with iGaming specific features
export function exampleIGamingUsage() {
  console.log('\n🎮 Working with iGaming module...')
  
  // Get event types for UI building
  const eventTypes = getEventTypesForUI('igaming', 'pt-BR')
  
  console.log('⚡ Available event types:')
  eventTypes.forEach(eventType => {
    console.log(`   ${eventType.icon} ${eventType.label}`)
    console.log(`      Fields: ${eventType.fields.length}`)
    console.log(`      Category: ${eventType.category}`)
    
    // Show some field examples
    eventType.fields.slice(0, 3).forEach(field => {
      console.log(`        - ${field.label} (${field.type})${field.required ? ' *' : ''}`)
      if (field.helper) console.log(`          💡 ${field.helper}`)
    })
  })
}

// 4. Search and use templates
export function exampleTemplateUsage() {
  console.log('\n📋 Working with templates...')
  
  // Search for football-related templates
  const footballTemplates = searchTemplatesAdvanced({
    query: 'futebol',
    module: 'igaming',
    locale: 'pt-BR'
  })
  
  console.log(`🔍 Found ${footballTemplates.length} football templates:`)
  footballTemplates.forEach(template => {
    console.log(`   📝 ${template.name}`)
    console.log(`      ${template.description}`)
    console.log(`      Difficulty: ${template.difficulty}`)
    console.log(`      Tags: ${template.tags.join(', ')}`)
    console.log(`      Triggers: ${template.rule.triggers.length}`)
    console.log(`      Conditions: ${template.rule.conditions.length}`)
  })
  
  // Search by category
  const spendingTemplates = searchTemplatesAdvanced({
    category: 'SPENDING',
    module: 'igaming'
  })
  
  console.log(`\n💰 Found ${spendingTemplates.length} spending templates:`)
  spendingTemplates.forEach(template => {
    console.log(`   ${template.name} - R$${template.defaultReward}`)
  })
}

// 5. Create a custom mission rule using the system
export function exampleCustomRule() {
  console.log('\n🎯 Creating custom mission rule...')
  
  // Get the iGaming module
  const igamingModule = moduleRegistry.getModule('igaming')
  if (!igamingModule) {
    console.error('iGaming module not found!')
    return
  }
  
  // Create a custom rule for "High Roller Weekend"
  const customRule = {
    triggers: [{
      event: 'sportsbook_bet_placed',
      filters: [{
        field: 'bet_type',
        operator: 'in' as const,
        value: ['simples', 'combinada']
      }]
    }],
    conditions: [{
      field: 'amount',
      operator: '>=' as const,
      value: 200,
      aggregation: 'sum' as const,
      timeWindow: {
        duration: '2d',
        sliding: false,
        resetTime: '00:00'
      }
    }],
    logic: 'AND' as const,
    timeWindow: {
      duration: '2d',
      sliding: false
    },
    cooldown: 86400 // 24 hours
  }
  
  console.log('🏗️ Custom rule created:')
  console.log('   Event: Sportsbook bet placed')
  console.log('   Filters: Bet type must be simples or combinada')
  console.log('   Condition: Total amount >= R$200 over 2 days')
  console.log('   Cooldown: 24 hours between completions')
  
  // Validate the rule
  const validation = igamingModule.validators[0]?.validate(customRule)
  if (validation) {
    console.log(`✅ Rule validation: ${validation.isValid ? 'VALID' : 'INVALID'}`)
    if (validation.errors.length > 0) {
      console.log('❌ Errors:', validation.errors)
    }
    if (validation.warnings.length > 0) {
      console.log('⚠️ Warnings:', validation.warnings)
    }
  }
}

// 6. Translation system example
export function exampleTranslations() {
  console.log('\n🌍 Translation system examples...')
  
  // Portuguese translations
  console.log('Portuguese (pt-BR):')
  console.log(`   Field 'amount': ${getTranslation('field.amount', 'pt-BR')}`)
  console.log(`   Field 'sport': ${getTranslation('field.sport', 'pt-BR')}`)
  console.log(`   Event 'sportsbook_bet_placed': ${getTranslation('event.sportsbook_bet_placed', 'pt-BR')}`)
  
  // English translations  
  console.log('\nEnglish (en-US):')
  console.log(`   Field 'amount': ${getTranslation('field.amount', 'en-US')}`)
  console.log(`   Field 'sport': ${getTranslation('field.sport', 'en-US')}`)
  console.log(`   Event 'sportsbook_bet_placed': ${getTranslation('event.sportsbook_bet_placed', 'en-US')}`)
  
  // With parameters
  console.log('\nWith parameters:')
  console.log(`   Min amount validation: ${getTranslation('validation.min_amount', 'pt-BR', { min: 50 })}`)
}

// 7. System health and statistics
export function exampleSystemMonitoring() {
  console.log('\n📊 System monitoring...')
  
  const stats = moduleRegistry.getModuleStats()
  const health = moduleRegistry.getModuleHealth()
  
  console.log('Statistics:')
  Object.entries(stats).forEach(([moduleName, moduleStats]) => {
    console.log(`   ${moduleName}:`)
    console.log(`     Event Types: ${moduleStats.eventTypes}`)
    console.log(`     Templates: ${moduleStats.templates}`)
    console.log(`     Validators: ${moduleStats.validators}`)
    console.log(`     Has Components: ${moduleStats.hasComponents}`)
    console.log(`     Has Translations: ${moduleStats.hasTranslations}`)
  })
  
  console.log('\nHealth Status:')
  Object.entries(health).forEach(([moduleName, moduleHealth]) => {
    console.log(`   ${moduleName}: ${moduleHealth.status}`)
    if (moduleHealth.errors.length > 0) {
      console.log(`     Errors: ${moduleHealth.errors.join(', ')}`)
    }
    if (moduleHealth.warnings.length > 0) {
      console.log(`     Warnings: ${moduleHealth.warnings.join(', ')}`)
    }
  })
}

// 8. Complete example workflow
export async function exampleCompleteWorkflow() {
  console.log('\n🔄 Complete workflow example...')
  
  // 1. Initialize
  await exampleInitialization()
  
  // 2. Explore modules
  exampleModuleExploration()
  
  // 3. Work with iGaming
  exampleIGamingUsage()
  
  // 4. Search templates
  exampleTemplateUsage()
  
  // 5. Create custom rule
  exampleCustomRule()
  
  // 6. Test translations
  exampleTranslations()
  
  // 7. Monitor system
  exampleSystemMonitoring()
  
  console.log('\n✅ Complete workflow finished!')
}

// Export all examples
export default {
  exampleInitialization,
  exampleModuleExploration,
  exampleIGamingUsage,
  exampleTemplateUsage,
  exampleCustomRule,
  exampleTranslations,
  exampleSystemMonitoring,
  exampleCompleteWorkflow
}

// Usage in a real application:
// import examples from './example-usage'
// examples.exampleCompleteWorkflow()

/*
Expected Console Output:

🚀 Initializing modular mission system...
✅ iGaming module registered successfully
📊 Module System Stats: { igaming: { eventTypes: 8, templates: 12, validators: 1, version: '1.0.0', hasComponents: false, hasTranslations: true } }
💚 Module Health Check: { igaming: { status: 'healthy', errors: [], warnings: [], lastChecked: '2024-...' } }
✅ System initialized successfully!

🔍 Exploring available modules...
📦 Module: iGaming (igaming)
   Description: Módulo completo para apostas esportivas e cassino com suporte a sportsbook, cassino ao vivo, slots e jogos de mesa
   Version: 1.0.0
   Event Types: 8
   Templates: 12
   Features: Apostas Esportivas, Cassino, Cassino Ao Vivo, Torneios
   Locales: pt-BR, en-US

🎮 Working with iGaming module...
⚡ Available event types:
   🏈 Aposta Esportiva Realizada
      Fields: 6
      Category: SPORTSBOOK
        - Valor (number) *
        💡 Valor da aposta em reais (R$)
        - Tipo de Aposta (enum) *  
        💡 Tipo de aposta: simples (1 evento), combinada (múltiplos eventos), etc.
        - Esporte (enum) *
        💡 Modalidade esportiva da aposta
   ...

📋 Working with templates...
🔍 Found 3 football templates:
   📝 Apostador de Futebol
      Aposte R$500 em futebol nesta semana
      Difficulty: medium
      Tags: futebol, semanal, apostas
      Triggers: 1
      Conditions: 1
   ...

💰 Found 4 spending templates:
   Apostador de Futebol - R$100
   High Roller Semanal - R$500
   ...

🎯 Creating custom mission rule...
🏗️ Custom rule created:
   Event: Sportsbook bet placed
   Filters: Bet type must be simples or combinada
   Condition: Total amount >= R$200 over 2 days
   Cooldown: 24 hours between completions
✅ Rule validation: VALID

🌍 Translation system examples...
Portuguese (pt-BR):
   Field 'amount': Valor
   Field 'sport': Esporte
   Event 'sportsbook_bet_placed': Aposta Esportiva Realizada

English (en-US):
   Field 'amount': Amount
   Field 'sport': Sport
   Event 'sportsbook_bet_placed': Sportsbook Bet Placed

With parameters:
   Min amount validation: Valor mínimo é R$ 50

📊 System monitoring...
Statistics:
   igaming:
     Event Types: 8
     Templates: 12
     Validators: 1
     Has Components: false
     Has Translations: true

Health Status:
   igaming: healthy

✅ Complete workflow finished!
*/