'use client'

import React, { useEffect, useState } from 'react'
import examples from '../../example-usage'

export default function DemoPage() {
  const [output, setOutput] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  
  // Prevent MetaMask connection attempts
  useEffect(() => {
    // Disable MetaMask auto-detection for this page
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      (window as any).ethereum.autoRefreshOnNetworkChange = false
    }
  }, [])
  
  // Simulate console.log capture
  const originalLog = console.log
  const capturedLogs: string[] = []
  
  const captureConsole = () => {
    console.log = (...args: any[]) => {
      capturedLogs.push(args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '))
      originalLog(...args)
    }
  }
  
  const restoreConsole = () => {
    console.log = originalLog
  }

  const runExample = async (exampleName: string, exampleFn: Function) => {
    setLoading(true)
    setOutput([])
    capturedLogs.length = 0
    
    try {
      captureConsole()
      await exampleFn()
      setOutput([...capturedLogs])
    } catch (error) {
      setOutput([...capturedLogs, `❌ Error: ${error}`])
    } finally {
      restoreConsole()
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎮 Sistema Modular de Missões - Demo
          </h1>
          <p className="text-gray-600 mb-8">
            Demonstração completa da arquitetura modular implementada para iGaming
          </p>

          {/* MetaMask Warning */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Nota:</strong> Se você vê erros do MetaMask no console, pode ignorá-los. 
                  Esta aplicação não usa blockchain/Web3 - são apenas da extensão do browser.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <button
              onClick={() => runExample('Inicialização', examples.exampleInitialization)}
              className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              disabled={loading}
            >
              🚀 Inicializar Sistema
            </button>
            
            <button
              onClick={() => runExample('Explorar Módulos', examples.exampleModuleExploration)}
              className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              disabled={loading}
            >
              🔍 Explorar Módulos
            </button>
            
            <button
              onClick={() => runExample('iGaming Features', examples.exampleIGamingUsage)}
              className="p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              disabled={loading}
            >
              🎮 Features iGaming
            </button>
            
            <button
              onClick={() => runExample('Templates', examples.exampleTemplateUsage)}
              className="p-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              disabled={loading}
            >
              📋 Buscar Templates
            </button>
            
            <button
              onClick={() => runExample('Regra Customizada', examples.exampleCustomRule)}
              className="p-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              disabled={loading}
            >
              🎯 Criar Regra
            </button>
            
            <button
              onClick={() => runExample('Traduções', examples.exampleTranslations)}
              className="p-4 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
              disabled={loading}
            >
              🌍 Traduções
            </button>
            
            <button
              onClick={() => runExample('Monitoramento', examples.exampleSystemMonitoring)}
              className="p-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              disabled={loading}
            >
              📊 Sistema Health
            </button>
            
            <button
              onClick={() => runExample('Workflow Completo', examples.exampleCompleteWorkflow)}
              className="p-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              disabled={loading}
            >
              🔄 Workflow Completo
            </button>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">Executando exemplo...</p>
            </div>
          )}

          {output.length > 0 && (
            <div className="bg-gray-900 rounded-lg p-6 text-green-400 font-mono text-sm overflow-x-auto max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Console Output</h3>
                <button
                  onClick={() => setOutput([])}
                  className="px-3 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-600"
                >
                  Limpar
                </button>
              </div>
              {output.map((line, index) => (
                <div key={index} className="mb-1 whitespace-pre-wrap">
                  {line}
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              📋 Features Implementadas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">Core System</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>✅ Arquitetura modular agnóstica</li>
                  <li>✅ Sistema de registro de módulos</li>
                  <li>✅ Validação e health check</li>
                  <li>✅ Event types dinâmicos</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">iGaming Module</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>✅ Sportsbook + Casino events</li>
                  <li>✅ 12 templates prontos</li>
                  <li>✅ Campos específicos gaming</li>
                  <li>✅ Validações contextuais</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">Interface Modular</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>✅ Seletor de módulos visual</li>
                  <li>✅ Construtor dinâmico de regras</li>
                  <li>✅ Workflow de criação de missões</li>
                  <li>✅ Templates pré-configurados</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">Localização</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>✅ Traduções PT-BR e EN-US</li>
                  <li>✅ Helpers contextuais</li>
                  <li>✅ Interpolação de parâmetros</li>
                  <li>✅ Labels dinâmicas por módulo</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}