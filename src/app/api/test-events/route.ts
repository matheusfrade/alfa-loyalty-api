import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { MissionEventHelpers } from '@/lib/event-bus'

/**
 * Test endpoint for simulating mission events
 * Useful for testing the rule engine without real user actions
 */

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
    
    if (!payload || typeof payload.userId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { scenario, userId } = body

    const targetUserId = userId || payload.userId
    const results: string[] = []

    switch (scenario) {
      case 'daily_login_streak':
        // Simulate 7 consecutive daily logins
        for (let i = 0; i < 7; i++) {
          await MissionEventHelpers.userLogin(targetUserId, {
            device: 'desktop',
            source: 'test',
            sessionId: `test_session_${i}`
          })
          results.push(`Day ${i + 1}: Login event emitted`)
        }
        break

      case 'high_roller_week':
        // Simulate high-value sports bets throughout the week
        const betAmounts = [200, 150, 300, 100, 250]
        for (let i = 0; i < betAmounts.length; i++) {
          await MissionEventHelpers.betPlaced(targetUserId, {
            amount: betAmounts[i],
            sport: 'futebol',
            category: 'sports',
            odds: Math.random() * 5 + 1,
            market: 'match_winner',
            sessionId: `bet_session_${i}`
          })
          results.push(`Bet ${i + 1}: R$${betAmounts[i]} on sports`)
        }
        break

      case 'multi_sport_explorer':
        // Simulate bets on different sports
        const sports = ['futebol', 'basquete', 'tenis', 'volei']
        for (const sport of sports) {
          await MissionEventHelpers.betPlaced(targetUserId, {
            amount: 50,
            sport,
            category: 'sports',
            odds: Math.random() * 3 + 1,
            market: 'match_winner'
          })
          results.push(`Bet placed on ${sport}`)
        }
        break

      case 'first_deposit':
        // Simulate first deposit
        await MissionEventHelpers.depositMade(targetUserId, {
          amount: 100,
          method: 'pix',
          currency: 'BRL'
        })
        results.push('First deposit of R$100 via PIX')
        break

      case 'slot_machine_spins':
        // Simulate 10 slot machine games
        for (let i = 0; i < 10; i++) {
          await MissionEventHelpers.gamePlayed(targetUserId, {
            game_id: `slot_${Math.floor(Math.random() * 5) + 1}`,
            game_type: 'slot',
            bet_amount: 2,
            win_amount: Math.random() > 0.7 ? Math.random() * 50 : 0
          })
        }
        results.push('10 slot machine spins completed')
        break

      case 'profile_completion':
        // Simulate profile completion
        await MissionEventHelpers.profileCompleted(targetUserId, {
          completion_percentage: 100,
          fields_completed: ['name', 'email', 'phone', 'address', 'preferences']
        })
        results.push('Profile 100% completed')
        break

      case 'kyc_verification':
        // Simulate KYC verification
        await MissionEventHelpers.kycVerified(targetUserId, {
          verification_level: 'full',
          documents_provided: ['cpf', 'rg', 'address_proof']
        })
        results.push('KYC verification completed')
        break

      case 'friend_referral':
        // Simulate referring 3 friends
        for (let i = 0; i < 3; i++) {
          await MissionEventHelpers.friendReferred(targetUserId, {
            referred_user_id: `friend_${i + 1}`,
            referral_code: `REF${Math.random().toString(36).substr(2, 6).toUpperCase()}`
          })
          results.push(`Friend ${i + 1} referred`)
        }
        break

      case 'bonus_claims':
        // Simulate claiming different bonuses
        const bonusTypes = ['welcome', 'deposit', 'free_spins', 'cashback']
        const bonusAmounts = [100, 50, 25, 75]
        
        for (let i = 0; i < bonusTypes.length; i++) {
          await MissionEventHelpers.bonusClaimed(targetUserId, {
            bonus_type: bonusTypes[i],
            bonus_amount: bonusAmounts[i]
          })
          results.push(`${bonusTypes[i]} bonus claimed: ${bonusAmounts[i]}`)
        }
        break

      case 'big_win':
        // Simulate a big win with high odds
        await MissionEventHelpers.betPlaced(targetUserId, {
          amount: 10,
          sport: 'futebol',
          category: 'sports',
          odds: 15.5,
          market: 'exact_score',
          sessionId: 'big_win_session'
        })
        
        // Simulate the win result with custom event
        await MissionEventHelpers.customEvent(targetUserId, 'big_win_achieved', {
          original_bet: 10,
          win_amount: 155,
          multiplier: 15.5,
          sport: 'futebol'
        })
        results.push('Big win achieved with 15.5x multiplier!')
        break

      case 'complete_onboarding':
        // Simulate complete onboarding flow
        await MissionEventHelpers.profileCompleted(targetUserId, {
          completion_percentage: 100,
          fields_completed: ['name', 'email', 'phone']
        })
        
        await MissionEventHelpers.kycVerified(targetUserId, {
          verification_level: 'basic',
          documents_provided: ['cpf']
        })
        
        await MissionEventHelpers.depositMade(targetUserId, {
          amount: 50,
          method: 'pix',
          currency: 'BRL'
        })
        
        await MissionEventHelpers.betPlaced(targetUserId, {
          amount: 10,
          sport: 'futebol',
          category: 'sports',
          odds: 2.5,
          market: 'match_winner'
        })
        
        results.push('Complete onboarding flow simulated')
        break

      case 'random_activity':
        // Simulate random user activity
        const activities = [
          () => MissionEventHelpers.userLogin(targetUserId, { device: 'mobile' }),
          () => MissionEventHelpers.betPlaced(targetUserId, { amount: Math.random() * 100, sport: 'futebol', category: 'sports', odds: Math.random() * 5 + 1 }),
          () => MissionEventHelpers.gamePlayed(targetUserId, { game_id: `game_${Math.floor(Math.random() * 10)}`, game_type: 'slot', bet_amount: 5 }),
          () => MissionEventHelpers.bonusClaimed(targetUserId, { bonus_type: 'daily', bonus_amount: 25 })
        ]
        
        for (let i = 0; i < 5; i++) {
          const randomActivity = activities[Math.floor(Math.random() * activities.length)]
          await randomActivity()
          results.push(`Random activity ${i + 1} triggered`)
        }
        break

      default:
        return NextResponse.json(
          { error: 'Unknown scenario' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      scenario,
      userId: targetUserId,
      results,
      message: `Test scenario "${scenario}" completed successfully`
    })

  } catch (error) {
    console.error('Test events error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to list available test scenarios
export async function GET(request: NextRequest) {
  const scenarios = {
    daily_login_streak: {
      name: 'Daily Login Streak',
      description: 'Simulates 7 consecutive daily logins',
      events: ['user_login x7']
    },
    high_roller_week: {
      name: 'High Roller Week',
      description: 'Simulates high-value sports bets totaling R$1000+',
      events: ['bet_placed x5 (sports, high amounts)']
    },
    multi_sport_explorer: {
      name: 'Multi-Sport Explorer',
      description: 'Simulates bets on 4 different sports',
      events: ['bet_placed x4 (different sports)']
    },
    first_deposit: {
      name: 'First Deposit',
      description: 'Simulates user making their first deposit',
      events: ['deposit_made (R$100)']
    },
    slot_machine_spins: {
      name: 'Slot Machine Spins',
      description: 'Simulates 10 slot machine games',
      events: ['game_played x10 (slot type)']
    },
    profile_completion: {
      name: 'Profile Completion',
      description: 'Simulates completing user profile 100%',
      events: ['profile_completed (100%)']
    },
    kyc_verification: {
      name: 'KYC Verification',
      description: 'Simulates successful KYC verification',
      events: ['kyc_verified (full level)']
    },
    friend_referral: {
      name: 'Friend Referral',
      description: 'Simulates referring 3 friends',
      events: ['friend_referred x3']
    },
    bonus_claims: {
      name: 'Bonus Claims',
      description: 'Simulates claiming various bonus types',
      events: ['bonus_claimed x4 (different types)']
    },
    big_win: {
      name: 'Big Win',
      description: 'Simulates achieving a big win with 15x+ multiplier',
      events: ['bet_placed (high odds)', 'custom_event (big_win)']
    },
    complete_onboarding: {
      name: 'Complete Onboarding',
      description: 'Simulates full user onboarding journey',
      events: ['profile_completed', 'kyc_verified', 'deposit_made', 'bet_placed']
    },
    random_activity: {
      name: 'Random Activity',
      description: 'Simulates 5 random user activities',
      events: ['mixed random events x5']
    }
  }

  return NextResponse.json({
    scenarios,
    usage: {
      endpoint: '/api/test-events',
      method: 'POST',
      body: {
        scenario: 'scenario_key',
        userId: 'optional_user_id (defaults to current user)'
      }
    }
  })
}