'use client'

import React from 'react'
import { MissionBuilder } from '@/components/mission-builder'

export default function TestMissionBuilder() {
  const handleMissionCreate = (mission: any) => {
    console.log('Mission created:', mission)
    alert('Mission created successfully! Check console for details.')
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🧪 Mission Builder Test
          </h1>
          
          <MissionBuilder 
            onMissionCreate={handleMissionCreate}
            locale="pt-BR"
          />
        </div>
      </div>
    </div>
  )
}