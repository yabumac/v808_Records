import {
  checkRateLimit,
  getClientIp,
  issueVerifiedLicense,
  readJsonBody,
  requireAuthUser,
  sendJson,
  supabaseAdminFetch,
  writeAuditLog,
  type ApiRequest,
  type ApiResponse,
  type PaymentOrderRow,
} from '../_lib/security.js'
import {
  capturePayPalOrder,
  GatewayConfigError,
  verifyChapaPayment,
  verifyStripeSession,
} from '../_lib/providers.js'

interface VerifyBody {
  txRef?: string
  sessionId?: string
  paypalOrderId?: string
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed.' })
  }

  const ip = getClientIp(req)
  if (!checkRateLimit(`verify:${ip}`, 30, 60_000)) {
    return sendJson(res, 429, { error: 'Too many verification requests. Please wait a moment.' })
  }

  const user = await requireAuthUser(req)
  if (!user) {
    return sendJson(res, 401, { error: 'Authentication required to verify payment.' })
  }

  let body: VerifyBody
  try {
    body = await readJsonBody<VerifyBody>(req)
  } catch {
    return sendJson(res, 400, { error: 'Invalid JSON request body.' })
  }

  const txRef = String(body.txRef || '').trim()
  if (!txRef || !/^V808-[A-Z0-9]+$/i.test(txRef)) {
    return sendJson(res, 400, { error: 'Invalid transaction reference.' })
  }

  try {
    // Enforce ownership: buyers can only verify their own payment_orders (IDOR defense)
    const orderRes = await supabaseAdminFetch<PaymentOrderRow[]>(
      `payment_orders?tx_ref=eq.${encodeURIComponent(txRef)}&user_id=eq.${encodeURIComponent(user.id)}&select=*&limit=1`,
    )
    const order = orderRes.data?.[0]
    if (!orderRes.ok || !order) {
      return sendJson(res, 404, { error: 'Payment order not found for your account.' })
    }

    if (order.status === 'paid') {
      const license = await issueVerifiedLicense(order, order.provider_ref || txRef, ip)
      return sendJson(res, 200, { verified: true, license })
    }

    let check: { paid: true; providerRef: string } | { paid: false; reason: string }
    if (order.provider === 'stripe_card') {
      const sid = String(body.sessionId || order.provider_ref || '')
      if (!sid) return sendJson(res, 400, { error: 'Missing Stripe session ID.' })
      check = await verifyStripeSession(sid, order.tx_ref, Number(order.amount_usd))
    } else if (order.provider === 'paypal') {
      const pid = String(body.paypalOrderId || order.provider_ref || '')
      if (!pid) return sendJson(res, 400, { error: 'Missing PayPal order ID.' })
      check = await capturePayPalOrder(pid, order.tx_ref, Number(order.amount_usd))
    } else {
      check = await verifyChapaPayment(order.tx_ref, Number(order.amount_etb))
    }

    if (!check.paid) {
      await writeAuditLog({
        event_type: 'payment_verification_failed',
        user_id: user.id,
        tx_ref: order.tx_ref,
        provider: order.provider,
        ip_address: ip,
        details: { reason: check.reason },
      })
      return sendJson(res, 402, { verified: false, error: check.reason })
    }

    const license = await issueVerifiedLicense(order, check.providerRef, ip)
    return sendJson(res, 200, { verified: true, license })
  } catch (err) {
    if (err instanceof GatewayConfigError) {
      return sendJson(res, 503, { error: err.message, missingEnv: err.missingEnv })
    }
    const msg = err instanceof Error ? err.message : 'Unable to verify payment.'
    return sendJson(res, 502, { error: msg })
  }
}
