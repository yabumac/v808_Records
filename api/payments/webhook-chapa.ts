import {
  getClientIp,
  issueVerifiedLicense,
  readRawBody,
  sendJson,
  supabaseAdminFetch,
  verifyChapaSignature,
  writeAuditLog,
  type ApiRequest,
  type ApiResponse,
  type PaymentOrderRow,
} from '../_lib/security.js'
import { verifyChapaPayment } from '../_lib/providers.js'

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method not allowed.' })
  }

  const ip = getClientIp(req)
  let raw = ''
  try {
    raw = await readRawBody(req)
  } catch {
    return sendJson(res, 400, { error: 'Invalid webhook payload.' })
  }

  if (req.method === 'POST' && !verifyChapaSignature(raw, req)) {
    await writeAuditLog({
      event_type: 'webhook_invalid_signature',
      provider: 'chapa',
      ip_address: ip,
    })
    return sendJson(res, 401, { error: 'Invalid Chapa webhook signature.' })
  }

  let txRef = ''
  try {
    const parsed = raw ? (JSON.parse(raw) as { tx_ref?: string; trx_ref?: string }) : {}
    const qRef = req.query?.trx_ref || req.query?.tx_ref
    txRef = String(parsed.tx_ref || parsed.trx_ref || (Array.isArray(qRef) ? qRef[0] : qRef) || '').trim()
  } catch {
    return sendJson(res, 400, { error: 'Malformed JSON body.' })
  }

  if (!txRef || !/^V808-[A-Z0-9]+$/i.test(txRef)) {
    return sendJson(res, 400, { error: 'Missing or invalid tx_ref.' })
  }

  try {
    const orderRes = await supabaseAdminFetch<PaymentOrderRow[]>(
      `payment_orders?tx_ref=eq.${encodeURIComponent(txRef)}&select=*&limit=1`,
    )
    const order = orderRes.data?.[0]
    if (!orderRes.ok || !order) {
      return sendJson(res, 404, { error: 'Order not found.' })
    }

    // Re-verify directly with Chapa API before issuing any license
    const check = await verifyChapaPayment(order.tx_ref, Number(order.amount_etb))
    if (!check.paid) {
      return sendJson(res, 200, { received: true, verified: false })
    }

    await issueVerifiedLicense(order, check.providerRef, ip)
    return sendJson(res, 200, { received: true, verified: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Webhook processing failed.'
    return sendJson(res, 500, { error: msg })
  }
}
