'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CustomerGroupSelector } from '../customer-groups/CustomerGroupSelector'
import { CustomerGroupSelection, MissionCustomerGroupMetadata } from '@/types/customer-groups'
import { Users, ArrowLeft, ArrowRight, Info } from 'lucide-react'

interface CustomerGroupsStepProps {
  value: CustomerGroupSelection
  onChange: (selection: CustomerGroupSelection) => void
  onNext: () => void
  onBack: () => void
  disabled?: boolean
  className?: string
}

export function CustomerGroupsStep({
  value,
  onChange,
  onNext,
  onBack,
  disabled = false,
  className = ''
}: CustomerGroupsStepProps) {
  const hasSelection = value?.include?.length > 0 || value?.exclude?.length > 0

  const handleContinue = () => {
    // Allow proceeding even without selection (optional step)
    onNext()
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Users className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Segmentação de Clientes</h2>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Configure quais grupos de clientes podem ou não participar desta missão.
          Esta etapa é opcional - deixe vazio para incluir todos os clientes.
        </p>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2 text-sm text-blue-800">
              <p><strong>Como funciona a segmentação:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li><strong>Grupos Incluídos:</strong> Apenas clientes destes grupos podem ver a missão</li>
                <li><strong>Grupos Excluídos:</strong> Clientes destes grupos nunca verão a missão</li>
                <li><strong>Prioridade:</strong> Exclusão sempre tem prioridade sobre inclusão</li>
                <li><strong>Sem seleção:</strong> Todos os clientes ativos podem participar</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Group Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Selecionar Grupos</CardTitle>
          <CardDescription>
            Busque e selecione os grupos de clientes para incluir ou excluir desta missão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerGroupSelector
            value={value}
            onChange={onChange}
            disabled={disabled}
            maxSelections={20}
          />
        </CardContent>
      </Card>

      {/* Selection Summary */}
      {hasSelection && (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="pt-4">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Resumo da Segmentação</h4>
              
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                {value?.include?.length > 0 && (
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <div className="font-medium text-green-800 mb-1">
                      ✅ {value?.include?.length || 0} grupo{(value?.include?.length || 0) !== 1 ? 's' : ''} incluído{(value?.include?.length || 0) !== 1 ? 's' : ''}
                    </div>
                    <div className="text-green-700">
                      Apenas clientes destes grupos verão a missão
                    </div>
                  </div>
                )}

                {value?.exclude?.length > 0 && (
                  <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                    <div className="font-medium text-red-800 mb-1">
                      ❌ {value?.exclude?.length || 0} grupo{(value?.exclude?.length || 0) !== 1 ? 's' : ''} excluído{(value?.exclude?.length || 0) !== 1 ? 's' : ''}
                    </div>
                    <div className="text-red-700">
                      Clientes destes grupos nunca verão a missão
                    </div>
                  </div>
                )}
              </div>

              {value?.include?.length > 0 && value?.exclude?.length > 0 && (
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <Info className="h-4 w-4" />
                    <span className="font-medium">Atenção:</span>
                  </div>
                  <div className="text-yellow-700 text-sm mt-1">
                    Se um cliente estiver em ambos os grupos (incluído e excluído), 
                    a exclusão terá prioridade e ele não verá a missão.
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Selection State */}
      {!hasSelection && (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 mb-2">Nenhum grupo selecionado</h4>
            <p className="text-gray-600 text-sm mb-4">
              Esta missão estará disponível para <strong>todos os clientes ativos</strong>
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
              <Info className="h-3 w-3" />
              Configuração padrão - recomendada para missões gerais
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={disabled}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleContinue}
            disabled={disabled}
            className="flex items-center gap-2"
          >
            Pular Etapa
            <ArrowRight className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            onClick={handleContinue}
            disabled={disabled}
            className="flex items-center gap-2"
          >
            Continuar
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}