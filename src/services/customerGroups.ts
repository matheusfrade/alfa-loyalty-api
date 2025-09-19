import { 
  CustomerGroup, 
  CustomerGroupsResponse, 
  CustomerGroupSearchParams, 
  CustomerGroupsApiResponse 
} from '@/types/customer-groups'

class CustomerGroupsService {
  private cache = new Map<string, { data: CustomerGroup[]; timestamp: number }>()
  private readonly CACHE_TTL = 10 * 60 * 1000 // 10 minutes
  private readonly SEARCH_CACHE_TTL = 2 * 60 * 1000 // 2 minutes
  private readonly EXTERNAL_API_URL = process.env.CUSTOMER_GROUPS_API_URL || null
  private readonly API_KEY = process.env.CUSTOMER_GROUPS_API_KEY || ''

  private buildCacheKey(params: CustomerGroupSearchParams = {}): string {
    return `groups_${JSON.stringify(params)}`
  }

  private isCacheValid(timestamp: number, ttl: number = this.CACHE_TTL): boolean {
    return Date.now() - timestamp < ttl
  }

  private buildApiUrl(endpoint: string, params: Record<string, any> = {}): string {
    // Se não há URL externa configurada, lançar erro imediatamente
    if (!this.EXTERNAL_API_URL) {
      throw new Error('External API not configured')
    }

    const url = new URL(endpoint, this.EXTERNAL_API_URL)
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString())
      }
    })
    return url.toString()
  }

  private async makeApiRequest<T>(url: string): Promise<T> {
    // Se não temos uma URL de API externa configurada, vamos direto para o fallback
    if (!this.EXTERNAL_API_URL) {
      throw new Error('External API not configured - using fallback data')
    }

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Loyalty-API/1.0'
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout (reduzido)
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }

      throw new Error('Failed to connect to customer groups API')
    }
  }

  async getAllGroups(params: CustomerGroupSearchParams = {}): Promise<CustomerGroup[]> {
    const cacheKey = this.buildCacheKey(params)
    const cached = this.cache.get(cacheKey)

    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data
    }

    try {
      const url = this.buildApiUrl('/groups', {
        active: params.isActive,
        page: params.page || 1,
        limit: params.limit || 100
      })

      const response = await this.makeApiRequest<CustomerGroupsApiResponse>(url)
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch customer groups')
      }

      const groups = response.data || []

      this.cache.set(cacheKey, {
        data: groups,
        timestamp: Date.now()
      })

      return groups
    } catch (error) {
      console.error('Error fetching customer groups:', error)
      
      if (cached) {
        console.warn('Returning expired cache due to API error')
        return cached.data
      }

      // Fallback para grupos mock para demonstração
      const mockGroups = this.getMockGroups()
      let filteredGroups = mockGroups

      // Aplica filtros se fornecidos
      if (params.isActive !== undefined) {
        filteredGroups = filteredGroups.filter(group => group.isActive === params.isActive)
      }

      // Cache os grupos mock
      this.cache.set(cacheKey, {
        data: filteredGroups,
        timestamp: Date.now()
      })

      return filteredGroups
    }
  }

  private getMockGroups(): CustomerGroup[] {
    return [
      {
        id: 'vip-1',
        name: 'VIP Clientes',
        description: 'Clientes VIP com alto valor de aposta',
        isActive: true,
        memberCount: 1250,
        tags: ['vip', 'alto-valor']
      },
      {
        id: 'novos-2',
        name: 'Novos Usuários',
        description: 'Usuários cadastrados nos últimos 30 dias',
        isActive: true,
        memberCount: 3420,
        tags: ['novos', 'onboarding']
      },
      {
        id: 'inativos-3',
        name: 'Usuários Inativos',
        description: 'Usuários sem atividade nos últimos 90 dias',
        isActive: true,
        memberCount: 892,
        tags: ['inativos', 'reativacao']
      },
      {
        id: 'esports-4',
        name: 'Fãs de E-sports',
        description: 'Usuários que apostam frequentemente em e-sports',
        isActive: true,
        memberCount: 2156,
        tags: ['esports', 'gaming']
      },
      {
        id: 'futebol-5',
        name: 'Amantes do Futebol',
        description: 'Usuários focados em apostas de futebol',
        isActive: true,
        memberCount: 8934,
        tags: ['futebol', 'brasil']
      },
      {
        id: 'casino-6',
        name: 'Jogadores de Casino',
        description: 'Usuários ativos nos jogos de casino',
        isActive: true,
        memberCount: 4521,
        tags: ['casino', 'slots']
      },
      {
        id: 'high-roller-7',
        name: 'High Rollers',
        description: 'Usuários com apostas acima de R$ 1000',
        isActive: true,
        memberCount: 156,
        tags: ['high-roller', 'premium']
      },
      {
        id: 'mobile-8',
        name: 'Usuários Mobile',
        description: 'Usuários que apostam principalmente pelo celular',
        isActive: true,
        memberCount: 12450,
        tags: ['mobile', 'app']
      },
      {
        id: 'sp-9',
        name: 'São Paulo',
        description: 'Usuários da região de São Paulo',
        isActive: true,
        memberCount: 5678,
        tags: ['geografia', 'sp']
      },
      {
        id: 'rj-10',
        name: 'Rio de Janeiro',
        description: 'Usuários da região do Rio de Janeiro',
        isActive: true,
        memberCount: 4321,
        tags: ['geografia', 'rj']
      },
      {
        id: 'jovens-11',
        name: 'Jovens (18-25)',
        description: 'Usuários entre 18 e 25 anos',
        isActive: true,
        memberCount: 6789,
        tags: ['idade', 'jovens']
      },
      {
        id: 'veteranos-12',
        name: 'Veteranos (45+)',
        description: 'Usuários acima de 45 anos',
        isActive: true,
        memberCount: 2345,
        tags: ['idade', 'veteranos']
      }
    ]
  }

  async searchGroups(query: string): Promise<CustomerGroup[]> {
    if (!query || query.length < 2) {
      return []
    }

    const cacheKey = `search_${query.toLowerCase().trim()}`
    const cached = this.cache.get(cacheKey)

    if (cached && this.isCacheValid(cached.timestamp, this.SEARCH_CACHE_TTL)) {
      return cached.data
    }

    try {
      const url = this.buildApiUrl('/groups/search', {
        q: query.trim(),
        limit: 50
      })

      const response = await this.makeApiRequest<CustomerGroupsApiResponse>(url)
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to search customer groups')
      }

      const groups = response.data || []

      this.cache.set(cacheKey, {
        data: groups,
        timestamp: Date.now()
      })

      return groups
    } catch (error) {
      console.error('Error searching customer groups:', error)
      
      if (cached) {
        console.warn('Returning expired search cache due to API error')
        return cached.data
      }

      // Fallback para grupos mock para demonstração
      const mockGroups = this.getMockGroups()
      const filtered = mockGroups.filter(group => 
        group.name.toLowerCase().includes(query.toLowerCase()) ||
        group.description?.toLowerCase().includes(query.toLowerCase()) ||
        group.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      )
      
      // Cache os resultados mock
      this.cache.set(cacheKey, {
        data: filtered,
        timestamp: Date.now()
      })

      return filtered.slice(0, 50)
    }
  }

  async getGroupsByIds(ids: string[]): Promise<CustomerGroup[]> {
    if (!ids || ids.length === 0) {
      return []
    }

    try {
      const url = this.buildApiUrl('/groups/batch', {
        ids: ids.join(',')
      })

      const response = await this.makeApiRequest<CustomerGroupsApiResponse>(url)
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch groups by IDs')
      }

      return response.data || []
    } catch (error) {
      console.error('Error fetching groups by IDs:', error)
      
      try {
        const allGroups = await this.getAllGroups()
        return allGroups.filter(group => ids.includes(group.id))
      } catch {
        return []
      }
    }
  }

  clearCache(): void {
    this.cache.clear()
  }

  cleanupCache(): void {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (!this.isCacheValid(value.timestamp)) {
        this.cache.delete(key)
      }
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const url = this.buildApiUrl('/health')
      const response = await this.makeApiRequest<{ status: string }>(url)
      return response.status === 'ok'
    } catch {
      return false
    }
  }
}

export const customerGroupsService = new CustomerGroupsService()