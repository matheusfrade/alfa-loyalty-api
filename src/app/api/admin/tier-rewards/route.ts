import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'

const getTierRewardsSchema = z.object({
  tierId: z.string().optional(),
  programId: z.string().optional(),
})

const createTierRewardSchema = z.object({
  tierId: z.string(),
  productId: z.string(),
  rewardType: z.enum(['WELCOME', 'RECURRING', 'MILESTONE', 'EXCLUSIVE']),
  quotaType: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'PER_TIER', 'UNLIMITED']),
  quotaLimit: z.number().min(0).optional(),
  quotaPeriod: z.string().optional(),
  autoDeliver: z.boolean().default(true),
  description: z.string().optional(),
  metadata: z.record(z.any()).default({}),
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

    if (!payload || typeof payload.userId !== 'string' || !payload.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const url = new URL(request.url)
    const searchParams = Object.fromEntries(url.searchParams.entries())
    const { tierId, programId } = getTierRewardsSchema.parse(searchParams)

    // Build where clause
    const where: any = {
      isActive: true,
    }

    if (tierId) {
      where.tierId = tierId
    }

    if (programId) {
      where.tier = {
        programId: programId,
      }
    }

    // Get tier rewards with related data
    const tierRewards = await prisma.tierReward.findMany({
      where,
      include: {
        tier: {
          select: {
            id: true,
            name: true,
            level: true,
            color: true,
            programId: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            price: true,
            image: true,
            deliveryType: true,
          },
        },
        _count: {
          select: {
            usages: true,
          },
        },
      },
      orderBy: [
        { tier: { level: 'asc' } },
        { rewardType: 'asc' },
        { createdAt: 'desc' },
      ],
    })

    // Format response
    const formattedTierRewards = tierRewards.map(tierReward => ({
      id: tierReward.id,
      tierId: tierReward.tierId,
      productId: tierReward.productId,
      rewardType: tierReward.rewardType,
      quotaType: tierReward.quotaType,
      quotaLimit: tierReward.quotaLimit,
      quotaPeriod: tierReward.quotaPeriod,
      autoDeliver: tierReward.autoDeliver,
      description: tierReward.description,
      metadata: JSON.parse(tierReward.metadata || '{}'),
      isActive: tierReward.isActive,
      usageCount: tierReward._count.usages,
      tier: tierReward.tier,
      product: tierReward.product,
      createdAt: tierReward.createdAt.toISOString(),
      updatedAt: tierReward.updatedAt.toISOString(),
    }))

    return NextResponse.json({
      data: formattedTierRewards,
      total: tierRewards.length,
    })
  } catch (error) {
    console.error('Get tier rewards error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
    const data = createTierRewardSchema.parse(body)

    // Check if tier exists
    const tier = await prisma.tier.findUnique({
      where: { id: data.tierId },
      select: { id: true, name: true, programId: true },
    })

    if (!tier) {
      return NextResponse.json(
        { error: 'Tier not found' },
        { status: 404 }
      )
    }

    // Check if product exists and belongs to the same program
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      select: { id: true, name: true, programId: true },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    if (product.programId !== tier.programId) {
      return NextResponse.json(
        { error: 'Product and tier must belong to the same program' },
        { status: 400 }
      )
    }

    // Check for existing tier reward with same tier, product, and type
    const existingTierReward = await prisma.tierReward.findFirst({
      where: {
        tierId: data.tierId,
        productId: data.productId,
        rewardType: data.rewardType,
        isActive: true,
      },
    })

    if (existingTierReward) {
      return NextResponse.json(
        { error: `A ${data.rewardType.toLowerCase()} reward for this product already exists for this tier` },
        { status: 400 }
      )
    }

    // Create the tier reward
    const tierReward = await prisma.tierReward.create({
      data: {
        tierId: data.tierId,
        productId: data.productId,
        rewardType: data.rewardType,
        quotaType: data.quotaType,
        quotaLimit: data.quotaLimit,
        quotaPeriod: data.quotaPeriod,
        autoDeliver: data.autoDeliver,
        description: data.description,
        metadata: JSON.stringify(data.metadata),
        isActive: true,
      },
      include: {
        tier: {
          select: {
            id: true,
            name: true,
            level: true,
            color: true,
            programId: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            price: true,
            image: true,
            deliveryType: true,
          },
        },
        _count: {
          select: {
            usages: true,
          },
        },
      },
    })

    // Format response
    const formattedTierReward = {
      id: tierReward.id,
      tierId: tierReward.tierId,
      productId: tierReward.productId,
      rewardType: tierReward.rewardType,
      quotaType: tierReward.quotaType,
      quotaLimit: tierReward.quotaLimit,
      quotaPeriod: tierReward.quotaPeriod,
      autoDeliver: tierReward.autoDeliver,
      description: tierReward.description,
      metadata: JSON.parse(tierReward.metadata || '{}'),
      isActive: tierReward.isActive,
      usageCount: tierReward._count.usages,
      tier: tierReward.tier,
      product: tierReward.product,
      createdAt: tierReward.createdAt.toISOString(),
      updatedAt: tierReward.updatedAt.toISOString(),
    }

    return NextResponse.json(formattedTierReward, { status: 201 })
  } catch (error) {
    console.error('Create tier reward error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}