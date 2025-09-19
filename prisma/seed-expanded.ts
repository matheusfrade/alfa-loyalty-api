import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting comprehensive seed...')

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@loyalty.com' }
  })

  if (existingAdmin) {
    console.log('✅ Admin user already exists, clearing existing data and reseeding...')

    // Clear dependent data first
    await prisma.notification.deleteMany()
    await prisma.transaction.deleteMany()
    await prisma.redemption.deleteMany()
    await prisma.playerPointsLedger.deleteMany()
    await prisma.playerTierProgress.deleteMany()
    await prisma.analytics.deleteMany()
    await prisma.mission.deleteMany()
    await prisma.product.deleteMany()
    await prisma.userProgram.deleteMany()
    await prisma.tier.deleteMany()
    await prisma.periodPolicy.deleteMany()

    // Delete non-admin users
    await prisma.user.deleteMany({
      where: { isAdmin: false }
    })
  }

  console.log('📝 Creating comprehensive dataset...')

  // Get or create admin user
  let admin
  if (existingAdmin) {
    admin = existingAdmin
  } else {
    const adminPassword = await bcrypt.hash('admin123', 10)
    admin = await prisma.user.create({
      data: {
        email: 'admin@loyalty.com',
        password: adminPassword,
        name: 'Admin User',
        isAdmin: true,
        avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff',
      }
    })
  }

  // Get or create Alfa Gaming program
  let alfaProgram = await prisma.program.findUnique({
    where: { slug: 'alfa-gaming' }
  })

  if (!alfaProgram) {
    alfaProgram = await prisma.program.create({
      data: {
        name: 'Alfa Gaming Loyalty',
        slug: 'alfa-gaming',
        description: 'Programa de fidelidade para Sportsbook e Casino',
        type: 'GAMING',
        config: JSON.stringify({
          features: {
            missions: true,
            rewards: true,
            tiers: true,
            leaderboard: true,
          },
          colors: {
            primary: '#6366f1',
            secondary: '#8b5cf6',
          }
        }),
        branding: JSON.stringify({
          logo: '/logo.png',
          colors: {
            primary: '#6366f1',
            secondary: '#8b5cf6',
            accent: '#fbbf24',
          }
        }),
      }
    })
  }

  // Create period policy for advanced tier system
  const periodPolicy = await prisma.periodPolicy.create({
    data: {
      programId: alfaProgram.id,
      periodType: 'SEMESTRE',
      pointsExpireAfterM: 12,
      softResetFactor: 0.5,
      reviewCron: '0 0 1 1,7 *', // 1st of January and July
      isActive: true,
    }
  })

  // Create tiers with realistic distribution
  const tiers = await Promise.all([
    prisma.tier.create({
      data: {
        programId: alfaProgram.id,
        name: 'Bronze',
        level: 0,
        requiredXP: 0,
        minPoints: 0,
        maxPoints: 999,
        maintenancePoints: 500,
        color: '#CD7F32',
        icon: '🥉',
        multiplier: 1.0,
        benefits: JSON.stringify([
          'Acesso básico ao programa',
          'Missões diárias',
          'Loja de recompensas',
        ]),
        isInviteOnly: false,
        isActive: true,
      }
    }),
    prisma.tier.create({
      data: {
        programId: alfaProgram.id,
        name: 'Prata',
        level: 1,
        requiredXP: 1000,
        minPoints: 1000,
        maxPoints: 4999,
        maintenancePoints: 2000,
        color: '#C0C0C0',
        icon: '🥈',
        multiplier: 1.2,
        benefits: JSON.stringify([
          'Multiplicador 1.2x em coins',
          'Missões exclusivas Prata',
          'Suporte prioritário',
        ]),
        isInviteOnly: false,
        isActive: true,
      }
    }),
    prisma.tier.create({
      data: {
        programId: alfaProgram.id,
        name: 'Ouro',
        level: 2,
        requiredXP: 5000,
        minPoints: 5000,
        maxPoints: 14999,
        maintenancePoints: 7000,
        color: '#FFD700',
        icon: '🥇',
        multiplier: 1.5,
        benefits: JSON.stringify([
          'Multiplicador 1.5x em coins',
          'Missões exclusivas Ouro',
          'Cashback semanal 2%',
        ]),
        isInviteOnly: false,
        isActive: true,
      }
    }),
    prisma.tier.create({
      data: {
        programId: alfaProgram.id,
        name: 'Platina',
        level: 3,
        requiredXP: 15000,
        minPoints: 15000,
        maxPoints: 49999,
        maintenancePoints: 20000,
        color: '#E5E4E2',
        icon: '💎',
        multiplier: 2.0,
        benefits: JSON.stringify([
          'Multiplicador 2x em coins',
          'Missões exclusivas Platina',
          'Cashback semanal 5%',
          'Produtos exclusivos na loja',
        ]),
        isInviteOnly: false,
        isActive: true,
      }
    }),
    prisma.tier.create({
      data: {
        programId: alfaProgram.id,
        name: 'VIP',
        level: 4,
        requiredXP: 50000,
        minPoints: 50000,
        maxPoints: null,
        maintenancePoints: 60000,
        color: '#9333EA',
        icon: '👑',
        multiplier: 2.5,
        benefits: JSON.stringify([
          'Multiplicador 2.5x em coins',
          'Todas as missões disponíveis',
          'Cashback semanal 10%',
          'Gerente de conta dedicado',
          'Convites para eventos presenciais',
        ]),
        isInviteOnly: false,
        isActive: true,
      }
    }),
  ])

  // Create diverse mission templates using Mission Builder
  const missions = await Promise.all([
    // Active missions
    prisma.mission.create({
      data: {
        programId: alfaProgram.id,
        title: 'Login Diário',
        description: 'Faça login todos os dias para ganhar coins',
        category: 'ENGAGEMENT',
        type: 'DAILY',
        icon: '🎯',
        reward: 50,
        xpReward: 10,
        requirement: JSON.stringify({
          triggers: [{
            event: 'user_login',
            aggregation: 'COUNT',
            target: 1,
            timeWindow: { duration: '1 day' }
          }]
        }),
        maxClaims: null,
        isActive: true,
        order: 1,
      }
    }),
    prisma.mission.create({
      data: {
        programId: alfaProgram.id,
        title: 'Primeira Aposta',
        description: 'Faça sua primeira aposta e ganhe bônus',
        category: 'ONBOARDING',
        type: 'ONCE',
        icon: '🎲',
        reward: 200,
        xpReward: 50,
        requirement: JSON.stringify({
          triggers: [{
            event: 'sports_bet',
            aggregation: 'COUNT',
            target: 1
          }]
        }),
        maxClaims: 1,
        isActive: true,
        order: 2,
      }
    }),
    prisma.mission.create({
      data: {
        programId: alfaProgram.id,
        title: 'Apostador Frequente',
        description: 'Faça 10 apostas esta semana',
        category: 'BETTING',
        type: 'WEEKLY',
        icon: '🏆',
        reward: 300,
        xpReward: 75,
        requirement: JSON.stringify({
          triggers: [{
            event: 'sports_bet',
            aggregation: 'COUNT',
            target: 10,
            timeWindow: { duration: '1 week' }
          }]
        }),
        maxClaims: null,
        isActive: true,
        order: 3,
      }
    }),
    prisma.mission.create({
      data: {
        programId: alfaProgram.id,
        title: 'High Roller',
        description: 'Aposte mais de R$ 1000 em uma única aposta',
        category: 'ACHIEVEMENT',
        type: 'REPEATABLE',
        icon: '💰',
        reward: 500,
        xpReward: 100,
        requirement: JSON.stringify({
          triggers: [{
            event: 'sports_bet',
            aggregation: 'SUM',
            target: 1000,
            field: 'amount'
          }]
        }),
        maxClaims: null,
        isActive: true,
        tierRequired: tiers[2].id, // Gold+
        order: 4,
      }
    }),
    // Inactive/completed missions for metrics
    prisma.mission.create({
      data: {
        programId: alfaProgram.id,
        title: 'Evento Copa do Mundo',
        description: 'Missão especial durante a Copa',
        category: 'EVENT',
        type: 'LIMITED',
        icon: '⚽',
        reward: 1000,
        xpReward: 200,
        requirement: JSON.stringify({
          triggers: [{
            event: 'sports_bet',
            aggregation: 'COUNT',
            target: 5,
            filters: [{ field: 'sport', operator: '==', value: 'football' }]
          }]
        }),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        maxClaims: 1,
        isActive: false,
        order: 5,
      }
    }),
  ])

  // Create comprehensive product catalog
  const products = await Promise.all([
    // Bonus products - different tiers
    prisma.product.create({
      data: {
        programId: alfaProgram.id,
        name: 'Free Bet R$ 25',
        description: 'Aposta grátis de R$ 25 para iniciantes',
        category: 'BONUS',
        price: 100,
        image: 'https://images.unsplash.com/photo-1518611507436-f9221403cca2?w=400',
        deliveryType: 'CODE',
        metadata: JSON.stringify({ value: 25, currency: 'BRL', expiresIn: 7 }),
      }
    }),
    prisma.product.create({
      data: {
        programId: alfaProgram.id,
        name: 'Free Bet R$ 50',
        description: 'Aposta grátis de R$ 50 para membros ativos',
        category: 'BONUS',
        price: 180,
        image: 'https://images.unsplash.com/photo-1518611507436-f9221403cca2?w=400',
        deliveryType: 'CODE',
        tierRequired: tiers[1].id, // Silver+
        metadata: JSON.stringify({ value: 50, currency: 'BRL', expiresIn: 7 }),
      }
    }),
    prisma.product.create({
      data: {
        programId: alfaProgram.id,
        name: 'Free Bet R$ 100',
        description: 'Aposta grátis de R$ 100 para VIPs',
        category: 'BONUS',
        price: 320,
        image: 'https://images.unsplash.com/photo-1518611507436-f9221403cca2?w=400',
        deliveryType: 'CODE',
        tierRequired: tiers[3].id, // Platinum+
        metadata: JSON.stringify({ value: 100, currency: 'BRL', expiresIn: 14 }),
      }
    }),
    // Casino products
    prisma.product.create({
      data: {
        programId: alfaProgram.id,
        name: '50 Free Spins - Gates of Olympus',
        description: '50 rodadas grátis no slot mais popular',
        category: 'FREESPINS',
        price: 120,
        image: 'https://images.unsplash.com/photo-1517232115160-ff93364542dd?w=400',
        deliveryType: 'AUTOMATIC',
        metadata: JSON.stringify({ spins: 50, game: 'gates_of_olympus', value: 0.20 }),
      }
    }),
    prisma.product.create({
      data: {
        programId: alfaProgram.id,
        name: '100 Free Spins - Sweet Bonanza',
        description: '100 rodadas grátis para membros Silver+',
        category: 'FREESPINS',
        price: 200,
        image: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=400',
        deliveryType: 'AUTOMATIC',
        tierRequired: tiers[1].id, // Silver+
        metadata: JSON.stringify({ spins: 100, game: 'sweet_bonanza', value: 0.20 }),
      }
    }),
    // Cashback options
    prisma.product.create({
      data: {
        programId: alfaProgram.id,
        name: 'Cashback 5% - 24h',
        description: '5% de cashback em perdas nas próximas 24 horas',
        category: 'CASHBACK',
        price: 250,
        image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400',
        deliveryType: 'AUTOMATIC',
        metadata: JSON.stringify({ percentage: 5, duration: 24, maxCashback: 500 }),
      }
    }),
    prisma.product.create({
      data: {
        programId: alfaProgram.id,
        name: 'Cashback 10% - Semanal',
        description: '10% de cashback por 7 dias para Gold+',
        category: 'CASHBACK',
        price: 500,
        image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400',
        deliveryType: 'AUTOMATIC',
        tierRequired: tiers[2].id, // Gold+
        metadata: JSON.stringify({ percentage: 10, duration: 168, maxCashback: 2000 }),
      }
    }),
    // Physical products
    prisma.product.create({
      data: {
        programId: alfaProgram.id,
        name: 'Camiseta Alfa Gaming',
        description: 'Camiseta oficial - Edição Limitada',
        category: 'PHYSICAL',
        price: 400,
        stock: 250,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
        deliveryType: 'PHYSICAL',
        tierRequired: tiers[2].id, // Gold+
        metadata: JSON.stringify({ sizes: ['P', 'M', 'G', 'GG'], colors: ['Preto', 'Branco'] }),
      }
    }),
    prisma.product.create({
      data: {
        programId: alfaProgram.id,
        name: 'Kit Gaming VIP',
        description: 'Mouse pad + Caneca + Boné exclusivos',
        category: 'PHYSICAL',
        price: 800,
        stock: 100,
        image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400',
        deliveryType: 'PHYSICAL',
        tierRequired: tiers[4].id, // VIP only
        metadata: JSON.stringify({ items: 3, exclusive: true }),
      }
    }),
    // Experience products
    prisma.product.create({
      data: {
        programId: alfaProgram.id,
        name: 'Ingresso Final Copa do Brasil',
        description: 'Par de ingressos setor premium',
        category: 'EXPERIENCE',
        price: 2500,
        stock: 20,
        image: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=400',
        deliveryType: 'MANUAL',
        tierRequired: tiers[4].id, // VIP only
        validUntil: new Date('2025-12-31'),
        metadata: JSON.stringify({ event: 'Copa do Brasil 2025', quantity: 2, sector: 'Premium' }),
      }
    }),
  ])

  // Create realistic user base with proper distribution
  const testUsers = []
  const now = new Date()

  // Create 150 users for better dashboard metrics
  for (let i = 1; i <= 150; i++) {
    const userPassword = await bcrypt.hash(`user${i}123`, 10)

    // Vary creation dates over the last 6 months for realistic signup trends
    const daysAgo = Math.floor(Math.random() * 180)
    const createdAt = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000))

    const user = await prisma.user.create({
      data: {
        email: `user${i}@test.com`,
        password: userPassword,
        name: `Test User ${i}`,
        avatar: `https://ui-avatars.com/api/?name=User+${i}&background=random`,
        externalId: `external_${i}`,
        createdAt,
        lastLoginAt: i <= 10 ? new Date() : undefined, // Recent logins for some users
      }
    })
    testUsers.push(user)

    // Realistic tier distribution
    let tierIndex = 0
    let pointsLive = 0
    let coinsBase = 0

    if (i <= 75) { // 50% Bronze
      tierIndex = 0
      pointsLive = Math.floor(Math.random() * 800) + 100
      coinsBase = Math.floor(Math.random() * 500) + 100
    } else if (i <= 105) { // 20% Prata
      tierIndex = 1
      pointsLive = Math.floor(Math.random() * 3000) + 1500
      coinsBase = Math.floor(Math.random() * 1200) + 600
    } else if (i <= 130) { // 17% Ouro
      tierIndex = 2
      pointsLive = Math.floor(Math.random() * 8000) + 7000
      coinsBase = Math.floor(Math.random() * 2500) + 1200
    } else if (i <= 145) { // 10% Platina
      tierIndex = 3
      pointsLive = Math.floor(Math.random() * 20000) + 20000
      coinsBase = Math.floor(Math.random() * 5000) + 2500
    } else { // 3% VIP (healthy distribution)
      tierIndex = 4
      pointsLive = Math.floor(Math.random() * 30000) + 60000
      coinsBase = Math.floor(Math.random() * 10000) + 5000
    }

    const userProgram = await prisma.userProgram.create({
      data: {
        userId: user.id,
        programId: alfaProgram.id,
        coins: coinsBase + (i * 50), // Varied coin amounts
        xp: tiers[tierIndex].requiredXP + Math.floor(Math.random() * 200),
        tierId: tiers[tierIndex].id,
      }
    })

    // Create comprehensive points ledger
    const pointsEntries = []
    let runningBalance = 0

    // Generate realistic points history over time
    const entriesCount = Math.floor(Math.random() * 12) + 5 // 5-16 entries per user
    for (let j = 0; j < entriesCount; j++) {
      const pointsAmount = Math.floor(Math.random() * (pointsLive / entriesCount)) + 50
      const daysAgo = Math.floor(Math.random() * 180)
      const occurredAt = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000))
      const expiresAt = new Date(occurredAt.getTime() + (365 * 24 * 60 * 60 * 1000))

      const sources = ['MISSION', 'BONUS', 'PURCHASE', 'REFERRAL', 'EVENT']
      const source = sources[Math.floor(Math.random() * sources.length)]

      runningBalance += pointsAmount

      pointsEntries.push({
        playerId: user.id,
        programId: alfaProgram.id,
        source,
        amount: pointsAmount,
        balance: runningBalance,
        reference: null,
        description: `Points earned via ${source.toLowerCase()}`,
        occurredAt,
        expiresAt,
        isExpired: false,
        meta: JSON.stringify({
          source: 'seed',
          userTier: tiers[tierIndex].name,
          generatedAt: now.toISOString()
        })
      })
    }

    // Add expired points for some users (realistic expiration data)
    if (Math.random() > 0.6) { // 40% of users have expired points
      const expiredAmount = Math.floor(Math.random() * 800) + 200
      const expiredDate = new Date(now.getTime() - (400 * 24 * 60 * 60 * 1000))

      pointsEntries.push({
        playerId: user.id,
        programId: alfaProgram.id,
        source: 'BONUS',
        amount: expiredAmount,
        balance: runningBalance + expiredAmount,
        reference: null,
        description: 'Expired promotional points',
        occurredAt: expiredDate,
        expiresAt: new Date(expiredDate.getTime() + (365 * 24 * 60 * 60 * 1000)),
        isExpired: true,
        meta: JSON.stringify({ source: 'seed', expired: true })
      })
    }

    // Add points expiring soon (critical for dashboard metrics)
    if (Math.random() > 0.5) { // 50% of users have points expiring soon
      const soonExpireAmount = Math.floor(Math.random() * 1200) + 300
      const soonExpireDate = new Date(now.getTime() - (335 * 24 * 60 * 60 * 1000))
      const soonExpiresAt = new Date(soonExpireDate.getTime() + (365 * 24 * 60 * 60 * 1000))

      runningBalance += soonExpireAmount

      pointsEntries.push({
        playerId: user.id,
        programId: alfaProgram.id,
        source: 'MISSION',
        amount: soonExpireAmount,
        balance: runningBalance,
        reference: null,
        description: 'Mission rewards (expiring in 30 days)',
        occurredAt: soonExpireDate,
        expiresAt: soonExpiresAt,
        isExpired: false,
        meta: JSON.stringify({
          source: 'seed',
          expiringSoon: true,
          daysUntilExpiry: Math.floor((soonExpiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
        })
      })
    }

    // Create all ledger entries
    for (const entry of pointsEntries) {
      await prisma.playerPointsLedger.create({ data: entry })
    }

    // Create tier progress
    const currentPeriodStart = new Date(now.getFullYear(), 0, 1)
    const currentPeriodEnd = new Date(now.getFullYear(), 11, 31)

    await prisma.playerTierProgress.create({
      data: {
        playerId: user.id,
        programId: alfaProgram.id,
        tierId: tiers[tierIndex].id,
        periodStart: currentPeriodStart,
        periodEnd: currentPeriodEnd,
        pointsEarned: Math.floor(pointsLive * 0.8), // 80% earned in current period
        pointsCarry: Math.floor(pointsLive * 0.2), // 20% carried over
        isCurrent: true
      }
    })

    // Create realistic transaction history
    const transactionTypes = ['EARNED', 'SPENT', 'BONUS', 'REFUND']
    const transactionsCount = Math.floor(Math.random() * 8) + 2 // 2-9 transactions per user

    let currentBalance = coinsBase + (i * 50)

    for (let t = 0; t < transactionsCount; t++) {
      const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)]
      let amount = 0
      let description = ''

      switch (type) {
        case 'EARNED':
          amount = Math.floor(Math.random() * 200) + 50
          description = 'Missão completada'
          currentBalance += amount
          break
        case 'SPENT':
          amount = -(Math.floor(Math.random() * 300) + 100)
          description = 'Resgate de produto'
          currentBalance += amount // amount is already negative
          break
        case 'BONUS':
          amount = Math.floor(Math.random() * 500) + 100
          description = 'Bônus promocional'
          currentBalance += amount
          break
        case 'REFUND':
          amount = Math.floor(Math.random() * 150) + 50
          description = 'Estorno de compra'
          currentBalance += amount
          break
      }

      const transactionDate = new Date(now.getTime() - (Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000))

      await prisma.transaction.create({
        data: {
          userId: user.id,
          programId: alfaProgram.id,
          type: type as any,
          amount,
          balance: Math.max(0, currentBalance), // Ensure balance doesn't go negative
          description,
          createdAt: transactionDate,
          metadata: JSON.stringify({
            source: 'seed',
            tier: tiers[tierIndex].name,
            generated: true
          }),
        }
      })
    }

    // Create redemptions for realistic conversion rates (30% of users)
    if (Math.random() > 0.7) {
      const productIndex = Math.floor(Math.random() * Math.min(products.length, 5)) // Prefer cheaper products
      const redemptionDate = new Date(now.getTime() - (Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000))

      await prisma.redemption.create({
        data: {
          userId: user.id,
          productId: products[productIndex].id,
          status: Math.random() > 0.1 ? 'COMPLETED' : 'PENDING', // 90% completion rate
          code: `CODE${Date.now()}${i}${productIndex}`,
          redeemedAt: redemptionDate,
          deliveredAt: Math.random() > 0.2 ? redemptionDate : null, // 80% delivered
        }
      })
    }

    // Create notifications for user engagement
    const notificationTypes = ['MISSION_COMPLETE', 'TIER_UPGRADE', 'REWARD_EARNED', 'POINTS_EXPIRING']
    const notificationsCount = Math.floor(Math.random() * 4) + 1

    for (let n = 0; n < notificationsCount; n++) {
      const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)]
      let title = ''
      let message = ''

      switch (type) {
        case 'MISSION_COMPLETE':
          title = 'Missão Completada!'
          message = 'Você completou uma missão e ganhou coins'
          break
        case 'TIER_UPGRADE':
          title = 'Parabéns! Upgrade de Tier'
          message = `Você foi promovido para ${tiers[tierIndex].name}!`
          break
        case 'REWARD_EARNED':
          title = 'Nova Recompensa'
          message = 'Você ganhou uma nova recompensa'
          break
        case 'POINTS_EXPIRING':
          title = 'Pontos Expirando'
          message = 'Alguns dos seus pontos expiram em breve'
          break
      }

      await prisma.notification.create({
        data: {
          userId: user.id,
          type: type as any,
          title,
          message,
          isRead: Math.random() > 0.3, // 70% read rate
          createdAt: new Date(now.getTime() - (Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000)),
          data: JSON.stringify({
            source: 'seed',
            tier: tiers[tierIndex].name
          }),
        }
      })
    }

    // Progress indicator
    if (i % 25 === 0) {
      console.log(`Created ${i}/150 users...`)
    }
  }

  // Create comprehensive analytics data for dashboards
  console.log('📊 Creating analytics data...')

  const metrics = [
    'active_users',
    'new_signups',
    'missions_completed',
    'coins_earned',
    'coins_spent',
    'products_redeemed',
    'tier_upgrades',
    'points_earned',
    'points_expired',
    'user_engagement'
  ]

  // Create 90 days of historical data
  for (let i = 0; i < 90; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    for (const metric of metrics) {
      let value = 0
      let dailyDimensions: any = { period: 'daily' }

      switch (metric) {
        case 'active_users':
          value = Math.floor(Math.random() * 50) + 30 + (i < 30 ? 20 : 0) // Recent spike
          break
        case 'new_signups':
          value = Math.floor(Math.random() * 8) + (i === 0 ? 15 : 2) // Today's signups higher
          dailyDimensions.todaySignups = i === 0 ? value : undefined
          break
        case 'missions_completed':
          value = Math.floor(Math.random() * 120) + 50
          break
        case 'coins_earned':
          value = Math.floor(Math.random() * 15000) + 5000
          break
        case 'coins_spent':
          value = Math.floor(Math.random() * 8000) + 2000
          break
        case 'products_redeemed':
          value = Math.floor(Math.random() * 25) + (i === 0 ? 15 : 5) // Today's redemptions
          dailyDimensions.todayRedemptions = i === 0 ? value : undefined
          break
        case 'tier_upgrades':
          value = Math.floor(Math.random() * 5) + 1
          break
        case 'points_earned':
          value = Math.floor(Math.random() * 25000) + 10000
          break
        case 'points_expired':
          value = Math.floor(Math.random() * 3000) + 500
          break
        case 'user_engagement':
          value = Math.floor(Math.random() * 75) + 60 // 60-95% engagement
          break
      }

      await prisma.analytics.create({
        data: {
          programId: alfaProgram.id,
          date,
          metric,
          value,
          dimensions: JSON.stringify(dailyDimensions),
        }
      })
    }
  }

  console.log('✅ Comprehensive seed completed successfully!')
  console.log('')
  console.log('📈 Dashboard Data Created:')
  console.log(`- ${testUsers.length} users with realistic tier distribution`)
  console.log(`- ${missions.length} missions (${missions.filter(m => m.isActive).length} active)`)
  console.log(`- ${products.length} products across all categories`)
  console.log('- Comprehensive points ledger with expiration tracking')
  console.log('- 90 days of analytics data for all metrics')
  console.log('- Realistic transaction and redemption history')
  console.log('')
  console.log('🔑 Login credentials:')
  console.log('Admin: admin@loyalty.com / admin123')
  console.log('Users: user1@test.com to user150@test.com / user[N]123')
  console.log('')
  console.log('🎯 All dashboards should now show realistic data!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })