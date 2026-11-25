import {
  getClientIp,
  issueVerifiedLicense,
  readRawBody,
  sendJson,
  supabaseAdminFetch,
  verifyStripeSignature,
  writeAuditLog,
  type ApiRequest,
  type ApiResponse,
  type PaymentOrderRow,
} from '../_lib/security.js'

export const config = {
  api: {
    bodyParser: false,
  },
}

interface StripeEvent {
  type?: string
  data?: {
    object?: {
      id?: string
      payment_status?: string
      amount_total?: number
      client_reference_id?: string
      metadata?: { tx_ref?: string }
    }
  }
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed.' })
  }

  const ip = getClientIp(req)
  let raw = ''
  try {
    raw = await readRawBody(req, 131072)
  } catch {
    return sendJson(res, 400, { error: 'Invalid webhook payload.' })
  }

  if (!verifyStripeSignature(raw, req)) {
    await writeAuditLog({
      event_type: 'webhook_invalid_signature',
      provider: 'stripe_card',
      ip_address: ip,
    })
    return sendJson(res, 401, { error: 'Invalid Stripe webhook signature.' })
  }

  const event = JSON.parse(raw) as StripeEvent
  if (event.type !== 'checkout.session.completed') {
    return sendJson(res, 200, { received: true })
  }

  const session = event.data?.object
  const txRef = session?.metadata?.tx_ref || session?.client_reference_id || ''
  if (!session || session.payment_status !== 'paid' || !txRef) {
    return sendJson(res, 200, { received: true, ignored: true })
  }

  try {
    const orderRes = await supabaseAdminFetch<PaymentOrderRow[]>(
      `payment_orders?tx_ref=eq.${encodeURIComponent(txRef)}&select=*&limit=1`,
    )
    const order = orderRes.data?.[0]
    if (!orderRes.ok || !order) {
      return sendJson(res, 404, { error: 'Order not found.' })
    }

    if ((session.amount_total ?? 0) < Math.round(Number(order.amount_usd) * 100)) {
      await writeAuditLog({
        event_type: 'webhook_amount_mismatch',
        tx_ref: txRef,
        provider: 'stripe_card',
        ip_address: ip,
      })
      return sendJson(res, 400, { error: 'Amount mismatch.' })
    }

    await issueVerifiedLicense(order, session.id || txRef, ip)
    return sendJson(res, 200, { received: true, verified: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Stripe webhook failure.'
    return sendJson(res, 500, { error: msg })
  }
}
