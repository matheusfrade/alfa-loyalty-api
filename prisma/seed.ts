import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@loyalty.com' }
  })

  if (existingAdmin) {
    console.log('✅ Admin user already exists, skipping seed.')
    return
  }

  console.log('📝 Creating initial data...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@loyalty.com',
      password: adminPassword,
      name: 'Admin User',
      isAdmin: true,
      avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff',
    }
  })

  // Create Alfa Gaming program
  const alfaProgram = await prisma.program.create({
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

  // Create tiers for Alfa Gaming with advanced points system
  const tiers = await Promise.all([
    prisma.tier.create({
      data: {
        programId: alfaProgram.id,
        name: 'Bronze',
        level: 0,
        requiredXP: 0, // Mantido para compatibilidade
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
        requiredXP: 1000, // Mantido para compatibilidade
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
        requiredXP: 5000, // Mantido para compatibilidade
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
        requiredXP: 15000, // Mantido para compatibilidade
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
        requiredXP: 50000, // Mantido para compatibilidade
        minPoints: 50000,
        maxPoints: null, // Sem limite superior
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

  // No preset missions - use Mission Builder to create custom missions
  const missions = []

  // Create products/rewards
  const products = await Promise.all([
    // Bonus products
    prisma.product.create({
      data: {
        programId: alfaProgram.id,
        name: 'Free Bet R$ 50',
        description: 'Aposta grátis de R$ 50 para usar em qualquer esporte',
        category: 'BONUS',
        price: 150,
        image: 'https://images.unsplash.com/photo-1518611507436-f9221403cca2?w=400',
        deliveryType: 'CODE',
        metadata: JSON.stringify({
          value: 50,
          currency: 'BRL',
          expiresIn: 7,
        }),
      }
    }),
    prisma.product.create({
      data: {
        programId: alfaProgram.id,
        name: 'Multiplicador 2x',
        description: 'Dobre seus ganhos na próxima aposta vencedora',
        category: 'BONUS',
        price: 250,
        image: 'https://images.unsplash.com/photo-1626266061368-1a95baa3b81d?w=400',
        deliveryType: 'AUTOMATIC',
        metadata: JSON.stringify({
          multiplier: 2,
          maxWin: 500,
          expiresIn: 24,
        }),
      }
    }),
    // Free spins
    prisma.product.create({
      data: {
        programId: alfaProgram.id,
        name: '100 Free Spins - Gates of Olympus',
        description: '100 rodadas grátis no slot Gates of Olympus',
        category: 'FREESPINS',
        price: 200,
        image: 'https://images.unsplash.com/photo-1517232115160-ff93364542dd?w=400',
        deliveryType: 'AUTOMATIC',
        metadata: JSON.stringify({
          spins: 100,
          game: 'gates_of_olympus',
          value: 0.20,
        }),
      }
    }),
    prisma.product.create({
      data: {
        programId: alfaProgram.id,
        name: '50 Free Spins - Sweet Bonanza',
        description: '50 rodadas grátis no slot Sweet Bonanza',
        category: 'FREESPINS',
        price: 100,
        image: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=400',
        deliveryType: 'AUTOMATIC',
        metadata: JSON.stringify({
          spins: 50,
          game: 'sweet_bonanza',
          value: 0.20,
        }),
      }
    }),
    // Cashback
    prisma.product.create({
      data: {
        programId: alfaProgram.id,
        name: 'Cashback 10% - 24 horas',
        description: '10% de cashback em todas as perdas nas próximas 24 horas',
        category: 'CASHBACK',
        price: 300,
        image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400',
        deliveryType: 'AUTOMATIC',
        metadata: JSON.stringify({
          percentage: 10,
          duration: 24,
          maxCashback: 1000,
        }),
      }
    }),
    prisma.product.create({
      data: {
        programId: alfaProgram.id,
        name: 'Cashback 5% - 7 dias',
        description: '5% de cashback em todas as perdas por 7 dias',
        category: 'CASHBACK',
        price: 500,
        image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400',
        deliveryType: 'AUTOMATIC',
        tierRequired: tiers[2].id, // Silver+
        metadata: JSON.stringify({
          percentage: 5,
          duration: 168,
          maxCashback: 2000,
        }),
      }
    }),
    // Physical products
    prisma.product.create({
      data: {
        programId: alfaProgram.id,
        name: 'Camiseta Alfa Gaming',
        description: 'Camiseta oficial Alfa Gaming - Edição Limitada',
        category: 'PHYSICAL',
        price: 500,
        stock: 100,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
        deliveryType: 'PHYSICAL',
        tierRequired: tiers[3].id, // Gold+
        metadata: JSON.stringify({
          sizes: ['P', 'M', 'G', 'GG'],
          colors: ['Preto', 'Branco'],
        }),
      }
    }),
    prisma.product.create({
      data: {
        programId: alfaProgram.id,
        name: 'Boné Alfa VIP',
        description: 'Boné exclusivo para membros VIP',
        category: 'PHYSICAL',
        price: 800,
        stock: 50,
        image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400',
        deliveryType: 'PHYSICAL',
        tierRequired: tiers[4].id, // Diamond+
        metadata: JSON.stringify({
          material: 'Premium',
          adjustable: true,
        }),
      }
    }),
    // Experience products
    prisma.product.create({
      data: {
        programId: alfaProgram.id,
        name: 'Ingresso Final Brasileirão',
        description: 'Par de ingressos para a final do Campeonato Brasileiro',
        category: 'EXPERIENCE',
        price: 2000,
        stock: 10,
        image: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=400',
        deliveryType: 'MANUAL',
        tierRequired: tiers[4].id, // Diamond+
        validUntil: new Date('2025-12-31'),
        metadata: JSON.stringify({
          event: 'Final Brasileirão 2025',
          quantity: 2,
          sector: 'Premium',
        }),
      }
    }),
    prisma.product.create({
      data: {
        programId: alfaProgram.id,
        name: 'Acesso VIP Chat',
        description: 'Acesso ao chat exclusivo VIP com suporte prioritário',
        category: 'PREMIUM',
        price: 1000,
        image: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=400',
        deliveryType: 'AUTOMATIC',
        tierRequired: tiers[4].id, // Diamond+
        metadata: JSON.stringify({
          duration: 30,
          features: ['Suporte 24/7', 'Gerente dedicado', 'Ofertas exclusivas'],
        }),
      }
    }),
    // Credits
    prisma.product.create({
      data: {
        programId: alfaProgram.id,
        name: 'Crédito R$ 100',
        description: 'R$ 100 em créditos para apostas',
        category: 'CREDITS',
        price: 800,
        image: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=400',
        deliveryType: 'AUTOMATIC',
        metadata: JSON.stringify({
          value: 100,
          currency: 'BRL',
          wagering: 1,
        }),
      }
    }),
    prisma.product.create({
      data: {
        programId: alfaProgram.id,
        name: 'Crédito R$ 250',
        description: 'R$ 250 em créditos para apostas',
        category: 'CREDITS',
        price: 1800,
        image: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=400',
        deliveryType: 'AUTOMATIC',
        tierRequired: tiers[2].id, // Silver+
        metadata: JSON.stringify({
          value: 250,
          currency: 'BRL',
          wagering: 1,
        }),
      }
    }),
  ])

  // Create test users with advanced tier system
  const testUsers = []
  for (let i = 1; i <= 20; i++) { // Increased to 20 users for better distribution
    const userPassword = await bcrypt.hash(`user${i}123`, 10)
    const user = await prisma.user.create({
      data: {
        email: `user${i}@test.com`,
        password: userPassword,
        name: `Test User ${i}`,
        avatar: `https://ui-avatars.com/api/?name=User+${i}&background=random`,
        externalId: `external_${i}`,
      }
    })
    testUsers.push(user)

    // Distribute users across tiers with realistic distribution
    let tierIndex = 0
    let pointsLive = 0

    if (i <= 10) { // 50% Bronze
      tierIndex = 0
      pointsLive = Math.floor(Math.random() * 900) + 100 // 100-999 points
    } else if (i <= 15) { // 25% Prata
      tierIndex = 1
      pointsLive = Math.floor(Math.random() * 3000) + 1500 // 1500-4500 points
    } else if (i <= 18) { // 15% Ouro
      tierIndex = 2
      pointsLive = Math.floor(Math.random() * 8000) + 7000 // 7000-15000 points
    } else if (i <= 19) { // 5% Platina
      tierIndex = 3
      pointsLive = Math.floor(Math.random() * 20000) + 20000 // 20000-40000 points
    } else { // 5% VIP (alerta de inflação)
      tierIndex = 4
      pointsLive = Math.floor(Math.random() * 50000) + 70000 // 70000-120000 points
    }

    const userProgram = await prisma.userProgram.create({
      data: {
        userId: user.id,
        programId: alfaProgram.id,
        coins: 1000 * i,
        xp: tiers[tierIndex].requiredXP + 10,
        tierId: tiers[tierIndex].id,
      }
    })

    // Create points ledger entries for this user
    const pointsEntries = []
    let runningBalance = 0
    const now = new Date()

    // Add initial points (distributed over the last 6 months)
    for (let j = 0; j < Math.floor(Math.random() * 8) + 3; j++) {
      const pointsAmount = Math.floor(Math.random() * (pointsLive / 3)) + 100
      const daysAgo = Math.floor(Math.random() * 180) // Last 6 months
      const occurredAt = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000))
      const expiresAt = new Date(occurredAt.getTime() + (365 * 24 * 60 * 60 * 1000)) // 1 year expiry

      runningBalance += pointsAmount

      pointsEntries.push({
        playerId: user.id,
        programId: alfaProgram.id,
        source: ['MISSION', 'BONUS', 'PURCHASE', 'REFERRAL'][Math.floor(Math.random() * 4)],
        amount: pointsAmount,
        balance: runningBalance,
        reference: null,
        description: `Points earned via ${['mission completion', 'bonus reward', 'purchase activity', 'referral'][j % 4]}`,
        occurredAt,
        expiresAt,
        isExpired: false,
        meta: JSON.stringify({
          source: 'seed',
          userTier: tiers[tierIndex].name
        })
      })
    }

    // Add some expired points (to show expiration functionality)
    if (Math.random() > 0.7) { // 30% of users have expired points
      const expiredAmount = Math.floor(Math.random() * 500) + 100
      const expiredDate = new Date(now.getTime() - (400 * 24 * 60 * 60 * 1000)) // 400 days ago

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
        meta: JSON.stringify({
          source: 'seed',
          expired: true
        })
      })
    }

    // Add points expiring soon (to show upcoming expirations)
    if (Math.random() > 0.6) { // 40% of users have points expiring soon
      const soonExpireAmount = Math.floor(Math.random() * 800) + 200
      const soonExpireDate = new Date(now.getTime() - (330 * 24 * 60 * 60 * 1000)) // 330 days ago
      const soonExpiresAt = new Date(soonExpireDate.getTime() + (365 * 24 * 60 * 60 * 1000)) // Expires in ~35 days

      runningBalance += soonExpireAmount

      pointsEntries.push({
        playerId: user.id,
        programId: alfaProgram.id,
        source: 'MISSION',
        amount: soonExpireAmount,
        balance: runningBalance,
        reference: null,
        description: 'Mission rewards (expiring soon)',
        occurredAt: soonExpireDate,
        expiresAt: soonExpiresAt,
        isExpired: false,
        meta: JSON.stringify({
          source: 'seed',
          expiringSoon: true
        })
      })
    }

    // Create ledger entries
    for (const entry of pointsEntries) {
      await prisma.playerPointsLedger.create({
        data: entry
      })
    }

    // Create current period progress
    const currentPeriodStart = new Date(now.getFullYear(), 0, 1) // Start of current year
    const currentPeriodEnd = new Date(now.getFullYear(), 11, 31) // End of current year

    await prisma.playerTierProgress.create({
      data: {
        playerId: user.id,
        programId: alfaProgram.id,
        tierId: tiers[tierIndex].id,
        periodStart: currentPeriodStart,
        periodEnd: currentPeriodEnd,
        pointsEarned: Math.floor(pointsLive * 0.7), // 70% earned in current period
        pointsCarry: Math.floor(pointsLive * 0.3), // 30% carried from previous
        isCurrent: true
      }
    })

    // Add some transactions
    await prisma.transaction.create({
      data: {
        userId: user.id,
        programId: alfaProgram.id,
        type: 'EARNED',
        amount: 100,
        balance: 1000 * i,
        description: 'Bônus de boas-vindas',
        metadata: JSON.stringify({
          type: 'welcome_bonus',
        }),
      }
    })

    // Add redemptions for first 2 users
    if (i <= 2) {
      await prisma.redemption.create({
        data: {
          userId: user.id,
          productId: products[i].id,
          status: 'COMPLETED',
          code: `CODE${Date.now()}${i}`,
          redeemedAt: new Date(Date.now() - 86400000 * i),
          deliveredAt: new Date(),
        }
      })

      await prisma.transaction.create({
        data: {
          userId: user.id,
          programId: alfaProgram.id,
          type: 'SPENT',
          amount: -products[i].price,
          balance: (1000 * i) - products[i].price,
          description: `Resgate: ${products[i].name}`,
          metadata: JSON.stringify({
            productId: products[i].id,
          }),
        }
      })
    }

    // Add notifications
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'MISSION_COMPLETE',
        title: 'Bem-vindo!',
        message: 'Seja bem-vindo ao programa de fidelidade! Use o Mission Builder para criar missões personalizadas.',
        data: JSON.stringify({
          type: 'welcome',
        }),
      }
    })
  }

  // Add some analytics
  const metrics = ['active_users', 'missions_completed', 'coins_earned', 'products_redeemed']
  for (let i = 0; i < 30; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    for (const metric of metrics) {
      await prisma.analytics.create({
        data: {
          programId: alfaProgram.id,
          date,
          metric,
          value: Math.floor(Math.random() * 100) + 10,
          dimensions: JSON.stringify({
            period: 'daily',
          }),
        }
      })
    }
  }

  console.log('✅ Seed completed successfully!')
  console.log('')
  console.log('📝 Test accounts created:')
  console.log('Admin: admin@loyalty.com / admin123')
  testUsers.forEach((_, i) => {
    console.log(`User ${i + 1}: user${i + 1}@test.com / user${i + 1}123`)
  })
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