import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { generateCode } from '@/lib/utils'
import { z } from 'zod'

const redeemSchema = z.object({
  quantity: z.number().min(1).default(1),
  deliveryInfo: z.record(z.any()).optional(),
  notes: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const productId = params.id
    const userId = payload.userId
    
    const body = await request.json()
    const { quantity, deliveryInfo, notes } = redeemSchema.parse(body)

    // Get product with program and tier info
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        program: true,
        tier: true,
      },
    })

    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if product is still valid
    const now = new Date()
    if (product.validFrom && product.validFrom > now) {
      return NextResponse.json(
        { error: 'Product not yet available' },
        { status: 400 }
      )
    }

    if (product.validUntil && product.validUntil < now) {
      return NextResponse.json(
        { error: 'Product no longer available' },
        { status: 400 }
      )
    }

    // Check stock
    if (product.stock !== null && product.stock < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      )
    }

    // Get user program data
    const userProgram = await prisma.userProgram.findUnique({
      where: {
        userId_programId: {
          userId,
          programId: product.programId,
        },
      },
      include: {
        tier: true,
      },
    })

    if (!userProgram) {
      return NextResponse.json(
        { error: 'User not in program' },
        { status: 400 }
      )
    }

    // Check tier requirement
    if (product.tierRequired && (!userProgram.tier || userProgram.tier.level < (product.tier?.level || 0))) {
      return NextResponse.json(
        { error: 'Insufficient tier level' },
        { status: 400 }
      )
    }

    const totalCost = product.price * quantity

    // Check if user has enough coins
    if (userProgram.coins < totalCost) {
      return NextResponse.json(
        { error: 'Insufficient coins' },
        { status: 400 }
      )
    }

    // Generate redemption code if needed
    let code: string | null = null
    if (product.deliveryType === 'CODE') {
      code = generateCode(product.category)
    }

    // Start transaction
    const redemption = await prisma.$transaction(async (tx) => {
      // Create redemption
      const redemption = await tx.redemption.create({
        data: {
          userId,
          productId,
          status: product.deliveryType === 'AUTOMATIC' ? 'COMPLETED' : 'PENDING',
          code,
          deliveryInfo: deliveryInfo ? JSON.stringify(deliveryInfo) : null,
          notes,
          deliveredAt: product.deliveryType === 'AUTOMATIC' ? new Date() : null,
        },
      })

      // Update user coins
      const newBalance = userProgram.coins - totalCost
      await tx.userProgram.update({
        where: { id: userProgram.id },
        data: { coins: newBalance },
      })

      // Update product stock
      if (product.stock !== null) {
        await tx.product.update({
          where: { id: productId },
          data: { stock: { decrement: quantity } },
        })
      }

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId,
          programId: product.programId,
          type: 'SPENT',
          amount: -totalCost,
          balance: newBalance,
          reference: redemption.id,
          description: `Redeemed: ${product.name}`,
          metadata: JSON.stringify({
            productId,
            redemptionId: redemption.id,
            quantity,
            unitPrice: product.price,
            deliveryType: product.deliveryType,
          }),
        },
      })

      // Create notification
      await tx.notification.create({
        data: {
          userId,
          type: 'PRODUCT_REDEEMED',
          title: 'Product Redeemed!',
          message: `You successfully redeemed "${product.name}"${code ? ` with code: ${code}` : ''}`,
          data: JSON.stringify({
            productId,
            redemptionId: redemption.id,
            productName: product.name,
            code,
            totalCost,
            deliveryType: product.deliveryType,
          }),
        },
      })

      return redemption
    })

    // Format response based on delivery type
    const response: any = {
      success: true,
      redemption: {
        id: redemption.id,
        status: redemption.status,
        redeemedAt: redemption.redeemedAt,
      },
      product: {
        id: product.id,
        name: product.name,
        category: product.category,
        deliveryType: product.deliveryType,
      },
      cost: {
        total: totalCost,
        quantity,
        unitPrice: product.price,
      },
    }

    if (code) {
      response.code = code
    }

    if (product.deliveryType === 'AUTOMATIC') {
      response.message = 'Product activated automatically!'
    } else if (product.deliveryType === 'CODE') {
      response.message = `Use code: ${code}`
    } else if (product.deliveryType === 'PHYSICAL') {
      response.message = 'Your order is being processed for shipping'
    } else {
      response.message = 'Your request is being processed manually'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Redeem product error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}