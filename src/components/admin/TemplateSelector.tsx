'use client'

import { useState } from 'react'
import { MissionTemplate } from '@/types/mission-rules'
import { 
  ALL_TEMPLATES, 
  TEMPLATE_CATEGORIES, 
  getTemplatesByCategory,
  getTemplatesByVertical,
  searchTemplates,
  customizeTemplate
} from '@/lib/mission-templates'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface TemplateSelectorProps {
  onSelect: (template: MissionTemplate) => void
  onClose: () => void
  vertical?: string
}

export function TemplateSelector({ onSelect, onClose, vertical = 'GAMING' }: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<MissionTemplate | null>(null)
  const [showCustomizer, setShowCustomizer] = useState(false)

  const getFilteredTemplates = () => {
    let templates = Object.values(ALL_TEMPLATES)

    // Filter by vertical
    templates = templates.filter(t => t.vertical === vertical)

    // Filter by category
    if (selectedCategory !== 'all') {
      templates = getTemplatesByCategory(selectedCategory)
    }

    // Filter by search
    if (searchQuery) {
      templates = searchTemplates(searchQuery).filter(t => 
        selectedCategory === 'all' || t.category === selectedCategory
      )
    }

    return templates
  }

  const handleTemplateSelect = (template: MissionTemplate) => {
    setSelectedTemplate(template)
    setShowCustomizer(true)
  }

  const handleUseTemplate = (template: MissionTemplate, customizations?: any) => {
    const finalTemplate = customizations 
      ? customizeTemplate(template, customizations)
      : template
    
    onSelect(finalTemplate)
    onClose()
  }

  const templates = getFilteredTemplates()

  return (
    <div className="space-y-6">
      {!showCustomizer ? (
        <>
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Mission Templates</h2>
              <p className="text-gray-600">Choose a pre-built template to get started quickly</p>
            </div>
            <Button variant="outline" onClick={onClose}>✖️ Close</Button>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {Object.entries(TEMPLATE_CATEGORIES).map(([key, category]) => (
                <option key={key} value={key}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedCategory === 'all'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Templates ({Object.keys(ALL_TEMPLATES).length})
            </button>
            {Object.entries(TEMPLATE_CATEGORIES).map(([key, category]) => {
              const count = getTemplatesByCategory(key).filter(t => t.vertical === vertical).length
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedCategory === key
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category.icon} {category.name} ({count})
                </button>
              )
            })}
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => {
              const category = TEMPLATE_CATEGORIES[template.category as keyof typeof TEMPLATE_CATEGORIES]
              return (
                <Card 
                  key={template.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow border-l-4"
                  style={{ borderLeftColor: category?.color }}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{category?.icon}</span>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                      </div>
                      <div className="flex gap-1">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                          🪙{template.defaultReward}
                        </span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                          ✨{template.defaultXP}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.tags.slice(0, 3).map(tag => (
                        <span 
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                      {template.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          +{template.tags.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Rule Preview */}
                    <div className="text-xs text-gray-500">
                      <div className="font-medium">Triggers: {template.rule.triggers.length}</div>
                      <div>Conditions: {template.rule.conditions.length}</div>
                      {template.rule.timeWindow && (
                        <div>Time Window: {template.rule.timeWindow.duration}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Empty State */}
          {templates.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  <span className="text-4xl">🔍</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
                <p className="text-gray-600">
                  {searchQuery 
                    ? `No templates match "${searchQuery}"`
                    : selectedCategory !== 'all' 
                      ? `No templates in ${TEMPLATE_CATEGORIES[selectedCategory as keyof typeof TEMPLATE_CATEGORIES]?.name}`
                      : 'No templates available'
                  }
                </p>
                <Button 
                  className="mt-4" 
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        /* Template Customizer */
        selectedTemplate && (
          <TemplateCustomizer
            template={selectedTemplate}
            onUse={handleUseTemplate}
            onBack={() => setShowCustomizer(false)}
            onClose={onClose}
          />
        )
      )}
    </div>
  )
}

// Template Customizer Component
function TemplateCustomizer({
  template,
  onUse,
  onBack,
  onClose
}: {
  template: MissionTemplate
  onUse: (template: MissionTemplate, customizations?: any) => void
  onBack: () => void
  onClose: () => void
}) {
  const [customizations, setCustomizations] = useState({
    reward: template.defaultReward,
    xpReward: template.defaultXP,
    timeWindowDuration: template.rule.timeWindow?.duration || '',
    maxClaims: template.rule.maxClaims || 0,
    conditionValues: template.rule.conditions.map(c => ({
      field: c.field,
      value: c.value
    }))
  })

  const category = TEMPLATE_CATEGORIES[template.category as keyof typeof TEMPLATE_CATEGORIES]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>← Back</Button>
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              {category?.icon} {template.name}
            </h2>
            <p className="text-gray-600">{template.description}</p>
          </div>
        </div>
        <Button variant="outline" onClick={onClose}>✖️ Close</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customization Form */}
        <Card>
          <CardHeader>
            <CardTitle>Customize Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Rewards */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Coin Reward</label>
                <input
                  type="number"
                  value={customizations.reward}
                  onChange={(e) => setCustomizations({
                    ...customizations,
                    reward: parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">XP Reward</label>
                <input
                  type="number"
                  value={customizations.xpReward}
                  onChange={(e) => setCustomizations({
                    ...customizations,
                    xpReward: parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="0"
                />
              </div>
            </div>

            {/* Time Window */}
            <div>
              <label className="block text-sm font-medium mb-2">Time Window</label>
              <select
                value={customizations.timeWindowDuration}
                onChange={(e) => setCustomizations({
                  ...customizations,
                  timeWindowDuration: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">No time limit</option>
                <option value="1h">1 Hour</option>
                <option value="1d">1 Day</option>
                <option value="7d">1 Week</option>
                <option value="30d">1 Month</option>
                <option value="365d">1 Year</option>
              </select>
            </div>

            {/* Max Claims */}
            <div>
              <label className="block text-sm font-medium mb-2">Max Completions</label>
              <input
                type="number"
                value={customizations.maxClaims}
                onChange={(e) => setCustomizations({
                  ...customizations,
                  maxClaims: parseInt(e.target.value) || 0
                })}
                placeholder="0 = Unlimited"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
              />
            </div>

            {/* Condition Values */}
            <div>
              <label className="block text-sm font-medium mb-2">Condition Values</label>
              {customizations.conditionValues.map((condition, index) => (
                <div key={condition.field} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={condition.field}
                    disabled
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    value={condition.value}
                    onChange={(e) => {
                      const newValues = [...customizations.conditionValues]
                      const val = e.target.value
                      newValues[index] = {
                        ...newValues[index],
                        value: !isNaN(Number(val)) && val !== '' ? Number(val) : val
                      }
                      setCustomizations({
                        ...customizations,
                        conditionValues: newValues
                      })
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Template Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Template Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Mission Details</h4>
                <div className="text-sm space-y-1">
                  <div><strong>Category:</strong> {category?.name}</div>
                  <div><strong>Vertical:</strong> {template.vertical}</div>
                  <div><strong>Rewards:</strong> {customizations.reward} coins, {customizations.xpReward} XP</div>
                  {customizations.maxClaims > 0 && (
                    <div><strong>Max Completions:</strong> {customizations.maxClaims}</div>
                  )}
                  {customizations.timeWindowDuration && (
                    <div><strong>Time Window:</strong> {customizations.timeWindowDuration}</div>
                  )}
                </div>
              </div>

              {/* Triggers */}
              <div>
                <h4 className="font-medium mb-2">Triggers ({template.rule.triggers.length})</h4>
                {template.rule.triggers.map((trigger, index) => (
                  <div key={index} className="text-sm p-2 bg-blue-50 rounded mb-2">
                    <div><strong>Event:</strong> {trigger.event}</div>
                    {trigger.filters && trigger.filters.length > 0 && (
                      <div><strong>Filters:</strong> {trigger.filters.length} conditions</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Conditions */}
              <div>
                <h4 className="font-medium mb-2">Conditions ({template.rule.conditions.length})</h4>
                {customizations.conditionValues.map((condition, index) => (
                  <div key={condition.field} className="text-sm p-2 bg-green-50 rounded mb-2">
                    <div><strong>{condition.field}</strong> {template.rule.conditions[index].operator} {condition.value}</div>
                    {template.rule.conditions[index].aggregation && (
                      <div className="text-xs text-gray-600">
                        Aggregation: {template.rule.conditions[index].aggregation}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div>
                <h4 className="font-medium mb-2">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {template.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onBack}>
          Cancel
        </Button>
        <Button 
          onClick={() => onUse(template, {
            reward: customizations.reward,
            xpReward: customizations.xpReward,
            conditions: customizations.conditionValues,
            timeWindow: customizations.timeWindowDuration ? {
              duration: customizations.timeWindowDuration,
              sliding: true
            } : undefined,
            maxClaims: customizations.maxClaims || undefined
          })}
        >
          Use This Template
        </Button>
      </div>
    </div>
  )
}