import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Basic environment check first
    const envCheck = {
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }

    // Try to import and use Prisma
    const { prisma } = await import('@/lib/prisma')
    
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
      env: envCheck
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      { 
        status: 'error',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        env: {
          hasJwtSecret: !!process.env.JWT_SECRET,
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          nodeEnv: process.env.NODE_ENV,
        }
      },
      { status: 500 }
    )
  }
}