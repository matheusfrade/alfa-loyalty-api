// Customer Groups Types - External API Integration
// These groups come from an external API and are used for mission targeting

export interface CustomerGroup {
  id: string
  name: string
  description?: string
  isActive: boolean
  memberCount?: number
  createdAt?: string
  updatedAt?: string
  tags?: string[]
}

export interface CustomerGroupsResponse {
  groups: CustomerGroup[]
  total: number
  page?: number
  limit?: number
}

export interface CustomerGroupSearchParams {
  query?: string
  isActive?: boolean
  page?: number
  limit?: number
}

export interface CustomerGroupSelection {
  include: string[] // Group IDs to include
  exclude: string[] // Group IDs to exclude
}

export interface CustomerGroupSelectionWithNames {
  include: Array<{ id: string; name: string }>
  exclude: Array<{ id: string; name: string }>
}

// Mission metadata extension for customer groups
export interface MissionCustomerGroupMetadata {
  customerGroups?: CustomerGroupSelection
}

// API Response types
export interface CustomerGroupsApiResponse {
  success: boolean
  data: CustomerGroup[]
  total?: number
  message?: string
}

export interface CustomerGroupsSearchApiResponse {
  success: boolean
  data: CustomerGroup[]
  message?: string
}


// Hook return types
export interface UseCustomerGroupsResult {
  groups: CustomerGroup[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export interface UseCustomerGroupSearchResult {
  searchGroups: (query: string) => Promise<CustomerGroup[]>
  loading: boolean
  error: Error | null
}

// Component prop types
export interface CustomerGroupSelectorProps {
  value: CustomerGroupSelection
  onChange: (selection: CustomerGroupSelection) => void
  disabled?: boolean
  maxSelections?: number
  className?: string
}

export interface GroupTagProps {
  group: CustomerGroup
  type: 'include' | 'exclude'
  onRemove: () => void
  disabled?: boolean
}

export interface GroupSearchInputProps {
  onSearch: (groups: CustomerGroup[]) => void
  onSelect: (group: CustomerGroup) => void
  placeholder?: string
  disabled?: boolean
  excludeIds?: string[]
}