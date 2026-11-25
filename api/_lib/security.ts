import crypto from 'node:crypto'
import type { IncomingMessage, ServerResponse } from 'node:http'

export type PaymentProvider = 'chapa' | 'telebirr' | 'cbe' | 'stripe_card' | 'paypal'
export type LicenseTier = 'basic' | 'premium' | 'exclusive'

export interface ApiRequest extends IncomingMessage {
  body?: unknown
  query?: Record<string, string | string[] | undefined>
}

export type ApiResponse = ServerResponse

export interface AuthUser {
  id: string
  email: string
  fullName: string
}

export interface AuthoritativeBeat {
  id: string
  title: string
  price: number
  has_stems: boolean
  has_midi: boolean
  is_published: boolean
}

export const TIER_CONFIG: Record<
  LicenseTier,
  { name: string; priceUsd: number; requiresStems: boolean; requiresMidi: boolean }
> = {
  basic: { name: 'Basic MP3 Lease', priceUsd: 29.99, requiresStems: false, requiresMidi: false },
  premium: { name: 'Premium WAV + Stems', priceUsd: 79.99, requiresStems: true, requiresMidi: false },
  exclusive: { name: 'Exclusive Unlimited', priceUsd: 299.99, requiresStems: true, requiresMidi: true },
}

// Authoritative fallback catalog matching src/lib/seed.ts so server validation never trusts client prices.
const FALLBACK_BEATS: Record<string, AuthoritativeBeat> = {
  'fallen-city': { id: 'fallen-city', title: 'FALLEN CITY', price: 29.99, has_stems: false, has_midi: false, is_published: true },
  relic: { id: 'relic', title: 'RELIC', price: 34.99, has_stems: false, has_midi: false, is_published: true },
  k9: { id: 'k9', title: 'K9', price: 29.99, has_stems: false, has_midi: false, is_published: true },
  'cold-night': { id: 'cold-night', title: 'COLD NIGHT', price: 29.99, has_stems: false, has_midi: false, is_published: true },
  tenet: { id: 'tenet', title: 'TENET', price: 34.99, has_stems: false, has_midi: false, is_published: true },
  tier: { id: 'tier', title: 'TIER', price: 29.99, has_stems: false, has_midi: false, is_published: true },
  'hope-spanish-drill': { id: 'hope-spanish-drill', title: 'HOPE', price: 34.99, has_stems: false, has_midi: false, is_published: true },
  'glock-drill': { id: 'glock-drill', title: 'GLOCK', price: 29.99, has_stems: false, has_midi: false, is_published: true },
  'dark-trap-2023': { id: 'dark-trap-2023', title: 'DARK TRAP', price: 29.99, has_stems: false, has_midi: false, is_published: true },
}

const rateBucket = new Map<string, number[]>()

export function getEnv(name: string): string {
  return (process.env[name] || '').trim()
}

export function getSupabaseConfig() {
  const url = getEnv('SUPABASE_URL') || getEnv('VITE_SUPABASE_URL')
  const anonKey = getEnv('SUPABASE_ANON_KEY') || getEnv('VITE_SUPABASE_ANON_KEY')
  const serviceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY')
  return { url: url.replace(/\/+$/, ''), anonKey, serviceKey }
}

export function getEtbRate(): number {
  const raw = Number(getEnv('ETB_EXCHANGE_RATE') || '125')
  return Number.isFinite(raw) && raw > 1 ? raw : 125
}

export function getGatewayStatus() {
  const hasChapa = Boolean(getEnv('CHAPA_SECRET_KEY'))
  const hasDirectTelebirr = Boolean(
    getEnv('TELEBIRR_APP_ID') && getEnv('TELEBIRR_APP_KEY') && getEnv('TELEBIRR_SHORT_CODE'),
  )
  const hasStripe = Boolean(getEnv('STRIPE_SECRET_KEY'))
  const hasPayPal = Boolean(getEnv('PAYPAL_CLIENT_ID') && getEnv('PAYPAL_CLIENT_SECRET'))
  const sb = getSupabaseConfig()

  return {
    providers: {
      chapa: hasChapa,
      telebirr: hasDirectTelebirr || hasChapa,
      cbe: hasChapa,
      stripe_card: hasStripe,
      paypal: hasPayPal,
    },
    supabaseConfigured: Boolean(sb.url && sb.anonKey),
    supabaseAdmin: Boolean(sb.url && sb.serviceKey),
    etbRate: getEtbRate(),
  }
}

export function sendJson(res: ApiResponse, status: number, data: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.end(JSON.stringify(data))
}

export async function readRawBody(req: ApiRequest, maxBytes = 65536): Promise<string> {
  if (typeof req.body === 'string') return req.body
  if (Buffer.isBuffer(req.body)) return req.body.toString('utf8')
  if (req.body && typeof req.body === 'object') return JSON.stringify(req.body)

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    let total = 0
    req.on('data', (chunk: Buffer) => {
      total += chunk.length
      if (total > maxBytes) {
        req.destroy()
        reject(new Error('Request payload exceeds maximum allowed size.'))
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

export async function readJsonBody<T>(req: ApiRequest): Promise<T> {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body as T
  }
  const raw = await readRawBody(req)
  if (!raw) return {} as T
  return JSON.parse(raw) as T
}

export function safeCompare(a: string, b: string): boolean {
  const ha = crypto.createHash('sha256').update(a).digest()
  const hb = crypto.createHash('sha256').update(b).digest()
  return crypto.timingSafeEqual(ha, hb)
}

export function getClientIp(req: ApiRequest): string {
  const xff = req.headers['x-forwarded-for']
  if (typeof xff === 'string' && xff.length > 0) {
    return xff.split(',')[0].trim()
  }
  return req.socket?.remoteAddress || 'unknown'
}

export function checkRateLimit(key: string, maxRequests = 20, windowMs = 60_000): boolean {
  const now = Date.now()
  const history = (rateBucket.get(key) ?? []).filter((ts) => now - ts < windowMs)
  if (history.length >= maxRequests) {
    rateBucket.set(key, history)
    return false
  }
  history.push(now)
  rateBucket.set(key, history)
  return true
}

export function resolveAppUrl(req: ApiRequest): string {
  const configured = getEnv('APP_URL')
  if (configured && /^https?:\/\//i.test(configured)) {
    return configured.replace(/\/+$/, '')
  }
  const vercelUrl = getEnv('VERCEL_URL')
  if (vercelUrl) {
    return `https://${vercelUrl.replace(/^https?:\/\//i, '').replace(/\/+$/, '')}`
  }
  const origin = typeof req.headers.origin === 'string' ? req.headers.origin : ''
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) {
    return origin
  }
  return 'http://localhost:5173'
}

export async function requireAuthUser(req: ApiRequest): Promise<AuthUser | null> {
  const authHeader = req.headers.authorization || ''
  const match = /^Bearer\s+(.+)$/i.exec(authHeader)
  if (!match) return null
  const token = match[1].trim()
  if (!token || token.length > 4096) return null

  const { url, anonKey } = getSupabaseConfig()
  if (!url || !anonKey) return null

  const r = await fetch(`${url}/auth/v1/user`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token}`,
    },
  })
  if (!r.ok) return null
  const u = (await r.json()) as {
    id?: string
    email?: string
    user_metadata?: { full_name?: string; name?: string }
  }
  if (!u.id || !u.email) return null
  return {
    id: u.id,
    email: u.email,
    fullName: u.user_metadata?.full_name || u.user_metadata?.name || u.email.split('@')[0],
  }
}

export async function supabaseAdminFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<{ ok: boolean; status: number; data: T | null; text: string }> {
  const { url, serviceKey } = getSupabaseConfig()
  if (!url || !serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured on the server.')
  }
  const headers = new Headers(init.headers)
  headers.set('apikey', serviceKey)
  headers.set('Authorization', `Bearer ${serviceKey}`)
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(`${url}/rest/v1/${path}`, { ...init, headers })
  const text = await res.text()
  let data: T | null = null
  try {
    data = text ? (JSON.parse(text) as T) : null
  } catch {
    data = null
  }
  return { ok: res.ok, status: res.status, data, text }
}

export async function resolveAuthoritativeBeat(beatId: string): Promise<AuthoritativeBeat | null> {
  const cleanId = beatId.trim()
  if (!cleanId || cleanId.length > 100 || !/^[a-zA-Z0-9_-]+$/.test(cleanId)) return null

  const { url, serviceKey } = getSupabaseConfig()
  if (url && serviceKey) {
    const res = await supabaseAdminFetch<AuthoritativeBeat[]>(
      `beats?id=eq.${encodeURIComponent(cleanId)}&select=id,title,price,has_stems,has_midi,is_published&limit=1`,
    )
    if (res.ok && Array.isArray(res.data) && res.data.length > 0) {
      return res.data[0]
    }
  }
  return FALLBACK_BEATS[cleanId] ?? null
}

export function validateTierForBeat(
  tier: LicenseTier,
  beat: AuthoritativeBeat,
): { ok: true; priceUsd: number; priceEtb: number } | { ok: false; error: string } {
  const cfg = TIER_CONFIG[tier]
  if (!cfg) return { ok: false, error: 'Unsupported license tier.' }
  if (!beat.is_published) return { ok: false, error: 'This track is currently unavailable.' }
  if (cfg.requiresStems && !beat.has_stems) {
    return {
      ok: false,
      error: `${cfg.name} is not available for "${beat.title}" yet because stems are not uploaded for this release.`,
    }
  }
  if (cfg.requiresMidi && !beat.has_midi) {
    return {
      ok: false,
      error: `${cfg.name} is not available for "${beat.title}" yet because MIDI files are not uploaded for this release.`,
    }
  }
  const priceUsd = tier === 'basic' && beat.price > 0 ? Number(beat.price) : cfg.priceUsd
  const priceEtb = Math.round(priceUsd * getEtbRate() * 100) / 100
  return { ok: true, priceUsd, priceEtb }
}

export function sanitizeEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase()
  if (!email || email.length > 254) return null
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null
  return email
}

export function sanitizePhone(raw?: string): string | null {
  if (!raw) return null
  const digits = raw.replace(/[\s()-]/g, '')
  if (!/^(\+?251|0)?(9|7)\d{8}$/.test(digits)) return null
  if (digits.startsWith('+251')) return digits
  if (digits.startsWith('251')) return `+${digits}`
  if (digits.startsWith('0')) return `+251${digits.slice(1)}`
  return `+251${digits}`
}

export function verifyChapaSignature(rawBody: string, req: ApiRequest): boolean {
  const secret = getEnv('CHAPA_WEBHOOK_SECRET')
  if (!secret) return false
  const sig =
    (typeof req.headers['x-chapa-signature'] === 'string' && req.headers['x-chapa-signature']) ||
    (typeof req.headers['chapa-signature'] === 'string' && req.headers['chapa-signature']) ||
    ''
  if (!sig) return false
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  return safeCompare(sig.toLowerCase(), expected.toLowerCase())
}

export function verifyStripeSignature(rawBody: string, req: ApiRequest): boolean {
  const secret = getEnv('STRIPE_WEBHOOK_SECRET')
  const header = typeof req.headers['stripe-signature'] === 'string' ? req.headers['stripe-signature'] : ''
  if (!secret || !header) return false

  const parts = Object.fromEntries(
    header.split(',').map((kv) => {
      const idx = kv.indexOf('=')
      return idx > 0 ? [kv.slice(0, idx).trim(), kv.slice(idx + 1).trim()] : ['', '']
    }),
  )
  const timestamp = Number(parts.t)
  const v1 = parts.v1
  if (!Number.isFinite(timestamp) || !v1) return false

  // Reject webhooks older/newer than 5 minutes to block replay attacks
  const ageSec = Math.abs(Math.floor(Date.now() / 1000) - timestamp)
  if (ageSec > 300) return false

  const signedPayload = `${timestamp}.${rawBody}`
  const expected = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex')
  return safeCompare(v1.toLowerCase(), expected.toLowerCase())
}

export function computeLicenseSignature(params: {
  txRef: string
  beatId: string
  buyerId: string
  tier: string
  licenseCode: string
}): string {
  const secret = getEnv('LICENSE_SIGNING_SECRET') || getEnv('SUPABASE_SERVICE_ROLE_KEY') || 'v808-fallback'
  return crypto
    .createHmac('sha256', secret)
    .update(`${params.txRef}:${params.beatId}:${params.buyerId}:${params.tier}:${params.licenseCode}`)
    .digest('hex')
}

export async function writeAuditLog(entry: {
  event_type: string
  user_id?: string | null
  tx_ref?: string | null
  provider?: string | null
  ip_address?: string | null
  details?: Record<string, unknown>
}) {
  try {
    await supabaseAdminFetch('audit_logs', {
      method: 'POST',
      body: JSON.stringify({
        event_type: entry.event_type,
        user_id: entry.user_id ?? null,
        tx_ref: entry.tx_ref ?? null,
        provider: entry.provider ?? null,
        ip_address: entry.ip_address ?? null,
        details: entry.details ?? {},
      }),
    })
  } catch {
    // Audit logging never blocks payment confirmation if table isn't migrated yet
  }
}

export interface PaymentOrderRow {
  id: string
  tx_ref: string
  user_id: string
  beat_id: string
  beat_title: string
  tier: LicenseTier
  provider: PaymentProvider
  currency: 'USD' | 'ETB'
  amount_usd: number
  amount_etb: number
  buyer_name: string
  buyer_email: string
  buyer_phone: string | null
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  provider_ref: string | null
}

export async function issueVerifiedLicense(
  order: PaymentOrderRow,
  providerRef: string,
  ipAddress: string,
) {
  // Idempotency: return existing license if this order was already fulfilled
  const existing = await supabaseAdminFetch<Record<string, unknown>[]>(
    `licenses?payment_order_id=eq.${encodeURIComponent(order.id)}&select=*&limit=1`,
  )
  if (existing.ok && Array.isArray(existing.data) && existing.data.length > 0) {
    return existing.data[0]
  }

  // Atomically mark order as paid
  await supabaseAdminFetch(`payment_orders?id=eq.${encodeURIComponent(order.id)}`, {
    method: 'PATCH',
    body: JSON.stringify({
      status: 'paid',
      provider_ref: providerRef,
      verified_at: new Date().toISOString(),
    }),
  })

  const licenseCode = `V808-${crypto.randomBytes(4).toString('hex').toUpperCase()}`
  const signatureHash = computeLicenseSignature({
    txRef: order.tx_ref,
    beatId: order.beat_id,
    buyerId: order.user_id,
    tier: order.tier,
    licenseCode,
  })

  const insertRes = await supabaseAdminFetch<Record<string, unknown>[]>('licenses', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      beat_id: order.beat_id,
      buyer_id: order.user_id,
      payment_order_id: order.id,
      tier: order.tier,
      price: order.amount_usd,
      currency: order.currency,
      amount_paid: order.currency === 'ETB' ? order.amount_etb : order.amount_usd,
      payment_provider: order.provider,
      payment_ref: providerRef,
      signature_hash: signatureHash,
      license_code: licenseCode,
      buyer_name: order.buyer_name,
      buyer_email: order.buyer_email,
    }),
  })

  if (!insertRes.ok || !Array.isArray(insertRes.data) || insertRes.data.length === 0) {
    throw new Error(`Failed to persist verified license: ${insertRes.text}`)
  }

  await writeAuditLog({
    event_type: 'license_issued',
    user_id: order.user_id,
    tx_ref: order.tx_ref,
    provider: order.provider,
    ip_address: ipAddress,
    details: { license_code: licenseCode, beat_id: order.beat_id, tier: order.tier },
  })

  return insertRes.data[0]
}
