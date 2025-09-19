import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { tierService } from '@/modules/tiers/services'

// GET /api/players/[id]/tier-status - Obter status completo do tier do jogador
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: playerId } = params
    const { searchParams } = new URL(request.url)
    const programId = searchParams.get('programId')

    if (!programId) {
      return NextResponse.json(
        { error: 'programId is required' },
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

    // Obter status completo do tier usando o service
    const tierStatus = await tierService.getPlayerTierStatus(playerId, programId)

    return NextResponse.json({
      success: true,
      data: tierStatus
    })

  } catch (error) {
    console.error('Error fetching player tier status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tier status' },
      { status: 500 }
    )
  }
}