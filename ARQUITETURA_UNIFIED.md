# 🏗️ Arquitetura Unificada - Sistema de Missões

## ✅ **REGRA DE OURO: 95% vai nos FILTROS do TRIGGER**

### 🎯 **FILTROS DO TRIGGER** (95% dos casos)
**Onde colocar:** Seção "Filtros do Trigger" em cada trigger

**O que vai aqui:**
- ✅ `amount >= 100` - Valor da aposta/depósito
- ✅ `sport in ['futebol', 'basquete']` - Esporte da aposta (**SUA DÚVIDA RESOLVIDA**)
- ✅ `payment_method == 'pix'` - Método de pagamento
- ✅ `game_type == 'slots'` - Tipo de jogo
- ✅ `bet_type == 'combinada'` - Tipo de aposta
- ✅ `odds >= 2.5` - Odds mínimas
- ✅ `is_first_deposit == true` - Se é primeiro depósito
- ✅ `bonus_applied == false` - Se tem bônus aplicado

**Por que aqui?** Porque são **condições específicas do evento** que está sendo capturado.

---

### 🏢 **REGRAS DE NEGÓCIO EXTERNAS** (5% dos casos)
**Onde colocar:** Seção "Regras de Negócio Externas" (oculta por padrão)

**O que vai aqui:**
- ✅ `user_tier == 'vip'` - Nível no programa de fidelidade
- ✅ `account_age >= 30` - Idade da conta (dias)
- ✅ `kyc_verified == true` - Verificação de identidade
- ✅ `region == 'BR'` - Restrições geográficas
- ✅ `daily_bet_limit <= 500` - Limites impostos pela empresa
- ✅ `account_status == 'active'` - Status da conta

**Por que aqui?** Porque são **validações do usuário/sistema**, não do evento.

---

## 🤝 **EXEMPLOS PRÁTICOS**

### Exemplo 1: "Aposte em futebol OU basquete"
```typescript
// ✅ CORRETO - No filtro do trigger
trigger: {
  event: 'sportsbook_bet_placed',
  filters: [
    { field: 'sport', operator: 'in', value: ['futebol', 'basquete'] }
  ]
}
```

### Exemplo 2: "Depósito PIX de R$ 100+ apenas para usuários VIP"
```typescript
// ✅ CORRETO - Separação clara
trigger: {
  event: 'deposit_completed',
  filters: [
    { field: 'amount', operator: '>=', value: 100 },
    { field: 'payment_method', operator: '==', value: 'pix' }
  ]
}

businessRules: [
  { field: 'user_tier', operator: '==', value: 'vip' }
]
```

---

## 🚫 **O QUE NÃO DUPLICAR**

### ❌ Erro Comum: Duplicar filtros
```typescript
// ❌ ERRADO - Duplicação desnecessária
trigger.filters: [
  { field: 'amount', operator: '>=', value: 100 }
]

businessRules: [
  { field: 'amount', operator: '>=', value: 100 }  // DUPLICADO!
]
```

### ✅ Correto: Usar cada lugar para sua função
```typescript
// ✅ CORRETO - Separação clara
trigger.filters: [
  { field: 'amount', operator: '>=', value: 100 }  // Filtro do evento
]

businessRules: [
  { field: 'user_tier', operator: '==', value: 'vip' }  // Validação do usuário
]
```

---

## 🎛️ **INTERFACE ATUALIZADA**

### 1. **Filtros do Trigger** - Sempre visível
- Interface visual com operadores `in` para múltiplos valores
- Exemplos contextuais
- Suporte a checkboxes para seleção múltipla

### 2. **Regras de Negócio** - Oculta por padrão
- Badge "Raramente Usado"
- Botão "Mostrar/Ocultar Regras Avançadas"
- Exemplos claros de quando usar

---

## 🧠 **MENTAL MODEL**

### Pergunta-se:
**"Esta condição é sobre o EVENTO ou sobre o USUÁRIO?"**

- **📊 EVENTO**: `amount`, `sport`, `payment_method`, `game_type`
  - **→ Vai nos FILTROS DO TRIGGER**

- **👤 USUÁRIO**: `user_tier`, `account_age`, `kyc_verified`
  - **→ Vai nas REGRAS DE NEGÓCIO**

---

## 🎯 **RESUMO EXECUTIVO**

1. **95% dos casos**: Use apenas filtros do trigger
2. **5% dos casos**: Use regras de negócio para validações de usuário
3. **0% duplicação**: Cada condição tem um lugar específico
4. **Futebol OU basquete**: `sport in ['futebol', 'basquete']` no filtro
5. **Interface clara**: Regras de negócio ficam ocultas por padrão

---

*Esta arquitetura elimina confusão e duplicação, mantendo 95% das missões simples e 5% com validações complexas quando necessário.*