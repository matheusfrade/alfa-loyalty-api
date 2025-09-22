import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { signToken, verifyToken } from './auth-edge'

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export async function comparePasswords(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

// Re-export JWT functions for compatibility
export { signToken, verifyToken } from './auth-edge'

export async function getSession() {
  const cookieStore = cookies()
  const token = cookieStore.get('auth-token')
  
  if (!token) return null
  
  const payload = await verifyToken(token.value)
  return payload
}

export async function setSession(userId: string, isAdmin: boolean = false) {
  const token = await signToken({ userId, isAdmin })
  const cookieStore = cookies()
  
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/'
  })
  
  return token
}

export async function clearSession() {
  const cookieStore = cookies()
  cookieStore.delete('auth-token')
}