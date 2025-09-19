import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { tierService } from '@/modules/tiers/services'
import { PointsEntryInput, PointsSource } from '@/modules/tiers/types'

// POST /api/players/[id]/points - Lançar pontos para um jogador
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: playerId } = params
    const body = await request.json()

    const {
      programId,
      source,
      amount,
      reference,
      description,
      meta
    } = body as {
      programId: string
      source: PointsSource
      amount: number
      reference?: string
      description: string
      meta?: Record<string, any>
    }

    // Validações básicas
    if (!programId || !source || !amount || !description) {
      return NextResponse.json(
        { error: 'programId, source, amount and description are required' },
        { status: 400 }
      )
    }

    if (amount === 0) {
      return NextResponse.json(
        { error: 'Amount cannot be zero' },
        { status: 400 }
      )
    }

    // Verificar se jogador existe
    const user = await prisma.user.findUnique({
      where: { id: playerId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      )
    }

    // Verificar se programa existe
    const program = await prisma.program.findUnique({
      where: { id: programId }
    })

    if (!program) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      )
    }

    // Lançar pontos usando o service
    const pointsEntry: PointsEntryInput = {
      playerId,
      programId,
      source,
      amount,
      reference,
      description,
      meta
    }

    const ledgerEntry = await tierService.addPoints(pointsEntry)

    // Buscar status atualizado do tier
    const tierStatus = await tierService.getPlayerTierStatus(playerId, programId)

    return NextResponse.json({
      success: true,
      data: {
        ledgerEntry: {
          ...ledgerEntry,
          meta: JSON.parse(ledgerEntry.meta)
        },
        tierStatus
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error adding points:', error)

    if (error instanceof Error) {
      if (error.message.includes('Period policy not found')) {
        return NextResponse.json(
          { error: 'Period policy not configured for this program' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to add points' },
      { status: 500 }
    )
  }
}

// GET /api/players/[id]/points - Obter histórico de pontos do jogador
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: playerId } = params
    const { searchParams } = new URL(request.url)
    const programId = searchParams.get('programId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const includeExpired = searchParams.get('includeExpired') === 'true'

    if (!programId) {
      return NextResponse.json(
        { error: 'programId is required' },
        { status: 400 }
      )
    }

    // Buscar histórico de pontos
    const pointsHistory = await prisma.playerPointsLedger.findMany({
      where: {
        playerId,
        programId,
        ...(includeExpired ? {} : { isExpired: false })
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    // Contar total
    const total = await prisma.playerPointsLedger.count({
      where: {
        playerId,
        programId,
        ...(includeExpired ? {} : { isExpired: false })
      }
    })

    // Estatísticas
    const stats = {
      pointsLive: await tierService.getPlayerLivePoints(playerId, programId),
      totalEarned: await prisma.playerPointsLedger.aggregate({
        where: {
          playerId,
          programId,
          amount: { gt: 0 }
        },
        _sum: { amount: true }
      }).then(r => r._sum.amount || 0),
      totalSpent: await prisma.playerPointsLedger.aggregate({
        where: {
          playerId,
          programId,
          amount: { lt: 0 }
        },
        _sum: { amount: true }
      }).then(r => Math.abs(r._sum.amount || 0)),
      totalExpired: await prisma.playerPointsLedger.aggregate({
        where: {
          playerId,
          programId,
          isExpired: true
        },
        _sum: { amount: true }
      }).then(r => r._sum.amount || 0)
    }

    return NextResponse.json({
      success: true,
      data: {
        history: pointsHistory.map(entry => ({
          ...entry,
          meta: JSON.parse(entry.meta)
        })),
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        },
        stats
      }
    })

  } catch (error) {
    console.error('Error fetching points history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch points history' },
      { status: 500 }
    )
  }
}