import crypto from 'node:crypto'
import {
  checkRateLimit,
  getClientIp,
  readJsonBody,
  requireAuthUser,
  resolveAppUrl,
  resolveAuthoritativeBeat,
  sanitizeEmail,
  sanitizePhone,
  sendJson,
  supabaseAdminFetch,
  TIER_CONFIG,
  validateTierForBeat,
  writeAuditLog,
  type ApiRequest,
  type ApiResponse,
  type LicenseTier,
  type PaymentProvider,
} from '../_lib/security.js'
import { GatewayConfigError, initializeProviderCheckout } from '../_lib/providers.js'

interface InitializeBody {
  beatId?: string
  tier?: LicenseTier
  provider?: PaymentProvider
  buyerName?: string
  buyerEmail?: string
  buyerPhone?: string
}

const ALLOWED_PROVIDERS: PaymentProvider[] = ['chapa', 'telebirr', 'cbe', 'stripe_card', 'paypal']

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed.' })
  }

  const ip = getClientIp(req)
  if (!checkRateLimit(`init:${ip}`, 20, 60_000)) {
    await writeAuditLog({ event_type: 'rate_limit_exceeded', ip_address: ip })
    return sendJson(res, 429, { error: 'Too many checkout attempts. Please wait a minute and try again.' })
  }

  // Require authenticated user
  const user = await requireAuthUser(req)
  if (!user) {
    return sendJson(res, 401, { error: 'Authentication required. Please sign in to purchase a license.' })
  }

  let body: InitializeBody
  try {
    body = await readJsonBody<InitializeBody>(req)
  } catch {
    return sendJson(res, 400, { error: 'Invalid JSON request body.' })
  }

  const beatId = String(body.beatId || '').trim()
  const tier = body.tier as LicenseTier
  const provider = body.provider as PaymentProvider

  if (!beatId || !TIER_CONFIG[tier] || !ALLOWED_PROVIDERS.includes(provider)) {
    return sendJson(res, 400, { error: 'Invalid beat, license tier, or payment method.' })
  }

  const beat = await resolveAuthoritativeBeat(beatId)
  if (!beat) {
    return sendJson(res, 404, { error: 'Track not found.' })
  }

  const check = validateTierForBeat(tier, beat)
  if (!check.ok) {
    return sendJson(res, 400, { error: check.error })
  }

  const buyerEmail = sanitizeEmail(String(body.buyerEmail || user.email))
  if (!buyerEmail) {
    return sendJson(res, 400, { error: 'A valid email address is required for license delivery.' })
  }

  const buyerName = String(body.buyerName || user.fullName).trim().slice(0, 120) || user.fullName
  const phoneRequired = provider === 'telebirr' || provider === 'cbe'
  const buyerPhone = body.buyerPhone ? sanitizePhone(body.buyerPhone) : null
  if (phoneRequired && !buyerPhone) {
    return sendJson(res, 400, {
      error: 'Enter a valid Ethiopian phone number (e.g. 0912345678 or +251912345678) for Telebirr / CBE.',
    })
  }

  const txRef = `V808-${crypto.randomUUID().replace(/-/g, '').slice(0, 18).toUpperCase()}`
  const currency: 'USD' | 'ETB' =
    provider === 'stripe_card' || provider === 'paypal' ? 'USD' : 'ETB'
  const appUrl = resolveAppUrl(req)

  try {
    // 1. Initialize payment with chosen provider FIRST (or fail cleanly with 503 if keys unset)
    const gateway = await initializeProviderCheckout({
      provider,
      txRef,
      amountUsd: check.priceUsd,
      amountEtb: check.priceEtb,
      beatTitle: beat.title,
      tierName: TIER_CONFIG[tier].name,
      buyerName,
      buyerEmail,
      buyerPhone,
      appUrl,
    })

    // 2. Persist authoritative pending order in Supabase
    const orderRes = await supabaseAdminFetch('payment_orders', {
      method: 'POST',
      body: JSON.stringify({
        tx_ref: txRef,
        user_id: user.id,
        beat_id: beat.id,
        beat_title: beat.title,
        tier,
        provider,
        currency,
        amount_usd: check.priceUsd,
        amount_etb: check.priceEtb,
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        buyer_phone: buyerPhone,
        status: 'pending',
        provider_ref: gateway.providerRef,
      }),
    })

    if (!orderRes.ok) {
      throw new Error(`Failed to create server payment order: ${orderRes.text}`)
    }

    await writeAuditLog({
      event_type: 'payment_initialized',
      user_id: user.id,
      tx_ref: txRef,
      provider,
      ip_address: ip,
      details: { beat_id: beat.id, tier, currency, amount: gateway.amount },
    })

    return sendJson(res, 200, {
      checkoutUrl: gateway.checkoutUrl,
      txRef,
      provider,
      currency: gateway.currency,
      amount: gateway.amount,
    })
  } catch (err) {
    if (err instanceof GatewayConfigError) {
      return sendJson(res, 503, {
        error: err.message,
        missingEnv: err.missingEnv,
      })
    }
    const msg = err instanceof Error ? err.message : 'Unable to initialize checkout.'
    return sendJson(res, 502, { error: msg })
  }
}
