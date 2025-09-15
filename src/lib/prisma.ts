import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Get database URL with fallbacks for Railway deployment
function getDatabaseUrl() {
  // Check standard DATABASE_URL
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL
  }
  
  // Check Railway-specific variables
  if (process.env.PGHOST && process.env.PGDATABASE) {
    const host = process.env.PGHOST
    const port = process.env.PGPORT || '5432'
    const database = process.env.PGDATABASE
    const username = process.env.PGUSER
    const password = process.env.PGPASSWORD
    
    if (username && password) {
      return `postgresql://${username}:${password}@${host}:${port}/${database}`
    }
  }
  
  // Fallback for development
  return "file:./dev.db"
}

const databaseUrl = getDatabaseUrl()

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma