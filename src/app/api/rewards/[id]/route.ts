import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'

const updateProductSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  price: z.number().min(0).optional(),
  image: z.string().url().optional().nullable(),
  stock: z.number().min(0).optional().nullable(),
  deliveryType: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  isActive: z.boolean().optional(),
  order: z.number().optional(),
})

// GET single product
export async function GET(
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

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        program: true,
        tier: true,
        _count: {
          select: {
            redemptions: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...product,
      metadata: JSON.parse(product.metadata),
    })
  } catch (error) {
    console.error('Get product error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// UPDATE product (admin only)
export async function PUT(
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
    
    if (!payload || typeof payload.userId !== 'string' || !payload.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const data = updateProductSchema.parse(body)

    const updateData: any = { ...data }
    if (data.metadata) {
      updateData.metadata = JSON.stringify(data.metadata)
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: updateData,
      include: {
        program: true,
        tier: true,
      },
    })

    return NextResponse.json({
      ...product,
      metadata: JSON.parse(product.metadata),
    })
  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE product (admin only)
export async function DELETE(
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
    
    if (!payload || typeof payload.userId !== 'string' || !payload.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Check if product has any redemptions
    const redemptionsCount = await prisma.redemption.count({
      where: { productId: params.id },
    })

    if (redemptionsCount > 0) {
      // Instead of deleting, deactivate it
      const product = await prisma.product.update({
        where: { id: params.id },
        data: { isActive: false },
      })

      return NextResponse.json({
        message: 'Product deactivated (has redemption history)',
        product,
      })
    }

    // Safe to delete if no redemptions
    await prisma.product.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: 'Product deleted successfully',
    })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}