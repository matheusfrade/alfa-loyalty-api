# 🎯 Mission Ideas & Templates

Esta documentação contém ideias e templates para missões que podem ser criadas no sistema de loyalty. Use como referência para criar missões personalizadas usando o Mission Builder.

## 🗂️ Categorias de Missões

### 📅 Daily Missions (DAILY)

#### Login Diário
- **Descrição**: Faça login consecutivo por vários dias
- **Tipo**: STREAK
- **Recompensas**: 50 coins + 10 XP
- **Trigger**: `user_login`
- **Condições**: Streak de 7 dias
- **Icon**: 🎯

#### Primeira Aposta do Dia
- **Descrição**: Faça sua primeira aposta do dia
- **Tipo**: RECURRING 
- **Recompensas**: 20 coins + 5 XP
- **Trigger**: `sportsbook_bet_placed`
- **Condições**: Valor mínimo R$ 10, primeira do dia
- **Icon**: ⚽

### 🎓 Tutorial Missions (TUTORIAL)

#### Complete seu Perfil
- **Descrição**: Adicione todas as informações do seu perfil
- **Tipo**: SINGLE
- **Recompensas**: 100 coins + 50 XP
- **Trigger**: `profile_updated`
- **Condições**: 100% de preenchimento
- **Max Claims**: 1
- **Icon**: 👤

#### Verificação KYC
- **Descrição**: Complete sua verificação de identidade
- **Tipo**: SINGLE
- **Recompensas**: 200 coins + 100 XP
- **Trigger**: `kyc_completed`
- **Max Claims**: 1
- **Icon**: ✅

### 🎰 Betting Missions (BETTING)

#### Apostador Bronze
- **Descrição**: Faça 10 apostas em esportes
- **Tipo**: MILESTONE
- **Recompensas**: 150 coins + 75 XP
- **Trigger**: `sportsbook_bet_placed`
- **Condições**: Contador de 10 apostas
- **Icon**: 🏆

#### Multiplicador Alto
- **Descrição**: Ganhe uma aposta com odd acima de 10x
- **Tipo**: SINGLE
- **Recompensas**: 500 coins + 200 XP
- **Trigger**: `bet_won`
- **Condições**: Odd >= 10.0
- **Icon**: 🚀

#### Multi-Esportivo
- **Descrição**: Aposte em 3 esportes diferentes
- **Tipo**: MILESTONE
- **Recompensas**: 300 coins + 150 XP
- **Trigger**: `sportsbook_bet_placed`
- **Condições**: 3 esportes diferentes
- **Tier**: Silver+
- **Icon**: 🏅

### 💰 Deposit Missions (DEPOSIT)

#### Primeiro Depósito
- **Descrição**: Faça seu primeiro depósito
- **Tipo**: SINGLE
- **Recompensas**: 500 coins + 200 XP
- **Trigger**: `deposit_completed`
- **Max Claims**: 1
- **Icon**: 💰

#### Deposite e Ganhe
- **Descrição**: Deposite R$ 100 ou mais
- **Tipo**: RECURRING
- **Recompensas**: 100 coins + 50 XP
- **Trigger**: `deposit_completed`
- **Condições**: Valor >= R$ 100
- **Icon**: 💳

### ⭐ Special Missions (SPECIAL)

#### Explorador de Jogos
- **Descrição**: Jogue 5 slots diferentes
- **Tipo**: MILESTONE
- **Recompensas**: 200 coins + 100 XP
- **Trigger**: `casino_game_played`
- **Condições**: 5 jogos diferentes, categoria slots
- **Icon**: 🎰

#### Fim de Semana Especial
- **Descrição**: Faça apostas no final de semana
- **Tipo**: RECURRING
- **Recompensas**: 150 coins + 25 XP
- **Trigger**: `sportsbook_bet_placed`
- **Condições**: Sábado ou Domingo
- **Icon**: 🎉

#### Acumulada Premiada
- **Descrição**: Acerte uma aposta múltipla com 5+ seleções
- **Tipo**: SINGLE
- **Recompensas**: 1000 coins + 300 XP
- **Trigger**: `bet_won`
- **Condições**: Múltipla com >= 5 seleções
- **Icon**: 💎

## 🏗️ Templates de Regras

### Trigger Types Comuns

```typescript
// Aposta em esportes
{
  triggers: [{
    event: "sportsbook_bet_placed",
    filters: []
  }]
}

// Login do usuário
{
  triggers: [{
    event: "user_login", 
    filters: []
  }]
}

// Depósito
{
  triggers: [{
    event: "deposit_completed",
    filters: []
  }]
}

// Jogo de casino
{
  triggers: [{
    event: "casino_game_played",
    filters: []
  }]
}
```

### Condition Types Comuns

```typescript
// Valor mínimo
{
  field: "amount",
  operator: ">=", 
  value: "100"
}

// Categoria específica
{
  field: "category",
  operator: "==",
  value: "football"
}

// Contador
{
  field: "count",
  operator: ">=",
  value: "10"
}

// Data/horário
{
  field: "day_of_week",
  operator: "in",
  value: ["saturday", "sunday"]
}

// Odd mínima
{
  field: "odds",
  operator: ">=",
  value: "2.0"
}
```

## 🎁 Ideias de Recompensas

### Coins + XP
- **Básica**: 20 coins + 5 XP
- **Média**: 100 coins + 25 XP  
- **Alta**: 500 coins + 100 XP
- **Premium**: 1000 coins + 200 XP

### Product Rewards
- **Free Spins**: 50-100 rodadas grátis
- **Free Bets**: Apostas grátis R$ 25-100
- **Cashback**: 5-15% por período limitado
- **Produtos Físicos**: Camisetas, bonés, ingressos
- **Créditos**: Saldo adicional para apostas

## 📊 Métricas e Balanceamento

### Frequência Sugerida
- **SINGLE**: Apenas uma vez por usuário
- **RECURRING**: Diária, semanal ou mensal
- **STREAK**: Consecutiva (3, 7, 14, 30 dias)
- **MILESTONE**: Baseada em contador acumulado

### Progressão por Tier
- **Iniciante**: 10-50 coins, missões básicas
- **Bronze**: 25-100 coins, introdução de apostas
- **Prata**: 50-200 coins, missões mais complexas
- **Ouro**: 100-500 coins, multiplicadores
- **Diamante**: 200-1000 coins, eventos especiais
- **VIP**: 500-2000 coins, experiências únicas

## 🔄 Eventos Sazonais

### Eventos Esportivos
- **Copa do Mundo**: Apostas em jogos da copa
- **Brasileirão**: Apostas no campeonato nacional
- **Champions League**: Apostas em jogos europeus

### Datas Especiais
- **Black Friday**: Missões de depósito com bônus
- **Natal**: Missões temáticas com recompensas especiais
- **Ano Novo**: Missões de recomeço e metas

### Promoções
- **Semana do Cliente**: Multiplicador 2x em todas as missões
- **Mês do Gamer**: Foco em jogos de casino
- **Festival de Apostas**: Odds especiais e missões premium

---

💡 **Dica**: Use essas ideias como base e personalize conforme seu público-alvo e objetivos de negócio. O Mission Builder permite criar variações complexas combinando diferentes triggers e condições.