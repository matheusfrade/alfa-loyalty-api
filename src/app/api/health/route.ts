import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count()
    const programCount = await prisma.program.count()
    
    // Check if admin user exists
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@loyalty.com' }
    })

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      users: userCount,
      programs: programCount,
      adminUserExists: !!adminUser,
      env: {
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV,
      }
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      { 
        status: 'error',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}