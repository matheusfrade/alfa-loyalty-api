import { EventTypeDefinition, FieldDefinition } from '@/core/types'

export interface EventTypeUI extends EventTypeDefinition {
  module: string
  fields: FieldDefinition[]
}