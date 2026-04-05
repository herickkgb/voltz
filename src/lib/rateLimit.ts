interface RateLimitEntry {
  attempts: number
  lastAttempt: number
  lockedUntil?: number
}

const KEY_PREFIX = 'buscar_rl_'
const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 15 * 60 * 1000 // 15 minutos
const RESET_AFTER_MS = 60 * 60 * 1000 // 1 hora

function getKey(identifier: string): string {
  if (typeof window === 'undefined') return ''
  try {
    return KEY_PREFIX + btoa(identifier).replace(/[^a-zA-Z0-9]/g, '')
  } catch {
    return KEY_PREFIX + identifier.replace(/[^a-zA-Z0-9]/g, '')
  }
}

export function checkRateLimit(identifier: string): { allowed: boolean; waitSeconds?: number } {
  if (typeof window === 'undefined') return { allowed: true }

  const key = getKey(identifier)
  const raw = localStorage.getItem(key)
  if (!raw) return { allowed: true }

  const entry: RateLimitEntry = JSON.parse(raw)
  const now = Date.now()

  if (entry.lockedUntil && entry.lockedUntil > now) {
    return { allowed: false, waitSeconds: Math.ceil((entry.lockedUntil - now) / 1000) }
  }

  if (now - entry.lastAttempt > RESET_AFTER_MS) {
    localStorage.removeItem(key)
    return { allowed: true }
  }

  return { allowed: true }
}

export function recordFailedAttempt(identifier: string): { locked: boolean; attemptsLeft: number } {
  if (typeof window === 'undefined') return { locked: false, attemptsLeft: MAX_ATTEMPTS }

  const key = getKey(identifier)
  const raw = localStorage.getItem(key)
  const entry: RateLimitEntry = raw ? JSON.parse(raw) : { attempts: 0, lastAttempt: 0 }

  const now = Date.now()
  entry.attempts = (entry.attempts || 0) + 1
  entry.lastAttempt = now

  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_MS
    localStorage.setItem(key, JSON.stringify(entry))
    return { locked: true, attemptsLeft: 0 }
  }

  localStorage.setItem(key, JSON.stringify(entry))
  return { locked: false, attemptsLeft: MAX_ATTEMPTS - entry.attempts }
}

export function clearRateLimit(identifier: string): void {
  if (typeof window === 'undefined') return
  const key = getKey(identifier)
  localStorage.removeItem(key)
}

export function formatWaitTime(seconds: number): string {
  if (seconds >= 60) {
    const mins = Math.ceil(seconds / 60)
    return `${mins} minuto${mins !== 1 ? 's' : ''}`
  }
  return `${seconds} segundo${seconds !== 1 ? 's' : ''}`
}
