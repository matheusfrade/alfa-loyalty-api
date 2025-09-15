import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret-key-12345-change-in-production'
)

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export async function comparePasswords(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export async function signToken(payload: any) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret)
  
  return token
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch (error) {
    return null
  }
}

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