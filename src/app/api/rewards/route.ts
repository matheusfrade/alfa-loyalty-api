import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'

const getRewardsSchema = z.object({
  programId: z.string().optional(),
  category: z.string().optional(),
  tierLevel: z.union([z.string(), z.number()]).transform(Number).optional(),
  minPrice: z.union([z.string(), z.number()]).transform(Number).optional(),
  maxPrice: z.union([z.string(), z.number()]).transform(Number).optional(),
  inStock: z.union([z.string(), z.boolean()]).transform(value => value === 'true' || value === true).optional(),
  sortBy: z.enum(['price', 'name', 'createdAt', 'order']).default('order'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  limit: z.union([z.string(), z.number()]).transform(Number).default(20),
  offset: z.union([z.string(), z.number()]).transform(Number).default(0),
})

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)
    
    if (!payload || typeof payload.userId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const searchParams = Object.fromEntries(url.searchParams.entries())
    const { 
      programId, 
      category, 
      tierLevel,
      minPrice, 
      maxPrice, 
      inStock, 
      sortBy, 
      sortOrder, 
      limit, 
      offset 
    } = getRewardsSchema.parse(searchParams)

    // Get user's tier level for filtering
    let userTierLevel = 0
    if (programId) {
      const userProgram = await prisma.userProgram.findUnique({
        where: {
          userId_programId: {
            userId: payload.userId,
            programId,
          },
        },
        include: {
          tier: true,
        },
      })
      userTierLevel = userProgram?.tier?.level || 0
    }

    // Build where clause
    const where: any = {
      isActive: true,
    }

    if (programId) {
      where.programId = programId
    }

    if (category) {
      where.category = category
    }

    if (minPrice !== undefined) {
      where.price = { gte: minPrice }
    }

    if (maxPrice !== undefined) {
      where.price = { ...where.price, lte: maxPrice }
    }

    if (inStock) {
      where.OR = [
        { stock: null }, // unlimited
        { stock: { gt: 0 } }
      ]
    }

    // Filter by tier requirement (user can only see products they can access)
    where.OR = [
      { tierRequired: null },
      {
        tier: {
          level: { lte: userTierLevel }
        }
      }
    ]

    // Get total count
    const total = await prisma.product.count({ where })

    // Get products
    const products = await prisma.product.findMany({
      where,
      include: {
        program: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tier: {
          select: {
            id: true,
            name: true,
            level: true,
            color: true,
          },
        },
        redemptions: {
          where: {
            userId: payload.userId,
          },
          select: {
            id: true,
            status: true,
            redeemedAt: true,
          },
          orderBy: {
            redeemedAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      take: limit,
      skip: offset,
    })

    // Format response
    const formattedProducts = products.map(product => ({
      ...product,
      metadata: JSON.parse(product.metadata),
      lastRedemption: product.redemptions[0] || null,
      redemptions: undefined,
      canRedeem: !product.tierRequired || (product.tier && product.tier.level <= userTierLevel),
      isInStock: !product.stock || product.stock > 0,
    }))

    return NextResponse.json({
      products: formattedProducts,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    })
  } catch (error) {
    console.error('Get rewards error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Create product (admin only)
const createProductSchema = z.object({
  programId: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  price: z.number().min(0),
  image: z.string().url().optional(),
  stock: z.number().min(0).optional(),
  tierRequired: z.string().optional(),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
  deliveryType: z.enum(['AUTOMATIC', 'CODE', 'PHYSICAL', 'MANUAL']).default('AUTOMATIC'),
  metadata: z.record(z.any()).default({}),
  order: z.number().default(0),
})

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)
    
    if (!payload || typeof payload.userId !== 'string' || !payload.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const data = createProductSchema.parse(body)

    const product = await prisma.product.create({
      data: {
        ...data,
        metadata: JSON.stringify(data.metadata),
        validFrom: data.validFrom ? new Date(data.validFrom) : null,
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
      },
      include: {
        program: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tier: {
          select: {
            id: true,
            name: true,
            level: true,
            color: true,
          },
        },
      },
    })

    return NextResponse.json({
      ...product,
      metadata: JSON.parse(product.metadata),
    })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}