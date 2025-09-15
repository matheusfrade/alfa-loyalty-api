import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'BRL') {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatNumber(num: number) {
  return new Intl.NumberFormat('pt-BR').format(num)
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function generateCode(prefix: string = 'CODE') {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

export function calculateTierProgress(currentXP: number, currentTierXP: number, nextTierXP: number) {
  const progress = currentXP - currentTierXP
  const total = nextTierXP - currentTierXP
  return Math.min(Math.round((progress / total) * 100), 100)
}

export function getTierColor(tierName: string) {
  const colors: Record<string, string> = {
    'Iniciante': 'bg-gray-500',
    'Bronze': 'bg-orange-600',
    'Prata': 'bg-gray-400',
    'Ouro': 'bg-yellow-500',
    'Diamante': 'bg-cyan-400',
    'VIP': 'bg-purple-600',
  }
  return colors[tierName] || 'bg-gray-500'
}

export function getTierGradient(tierName: string) {
  const gradients: Record<string, string> = {
    'Iniciante': 'from-gray-500 to-gray-600',
    'Bronze': 'from-orange-500 to-orange-700',
    'Prata': 'from-gray-300 to-gray-500',
    'Ouro': 'from-yellow-400 to-yellow-600',
    'Diamante': 'from-cyan-300 to-cyan-500',
    'VIP': 'from-purple-500 to-purple-700',
  }
  return gradients[tierName] || 'from-gray-500 to-gray-600'
}