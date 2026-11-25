import crypto from 'node:crypto'
import { getEnv, type PaymentProvider } from './security.js'

export interface InitGatewayInput {
  provider: PaymentProvider
  txRef: string
  amountUsd: number
  amountEtb: number
  beatTitle: string
  tierName: string
  buyerName: string
  buyerEmail: string
  buyerPhone: string | null
  appUrl: string
}

export interface InitGatewayResult {
  checkoutUrl: string
  providerRef: string
  currency: 'USD' | 'ETB'
  amount: number
}

export class GatewayConfigError extends Error {
  missingEnv: string[]
  constructor(message: string, missingEnv: string[]) {
    super(message)
    this.name = 'GatewayConfigError'
    this.missingEnv = missingEnv
  }
}

/* -------------------------------------------------------------------------- */
/* Chapa (covers Chapa Checkout, Telebirr rail, and CBE Birr rail)            */
/* -------------------------------------------------------------------------- */
async function initChapa(input: InitGatewayInput): Promise<InitGatewayResult> {
  const secretKey = getEnv('CHAPA_SECRET_KEY')
  if (!secretKey) {
    throw new GatewayConfigError(
      'Chapa payment gateway is not configured on the server yet.',
      ['CHAPA_SECRET_KEY', 'CHAPA_WEBHOOK_SECRET'],
    )
  }

  const nameParts = input.buyerName.trim().split(/\s+/)
  const firstName = nameParts[0] || 'V808'
  const lastName = nameParts.slice(1).join(' ') || 'Artist'

  const payload: Record<string, unknown> = {
    amount: input.amountEtb.toFixed(2),
    currency: 'ETB',
    email: input.buyerEmail,
    first_name: firstName,
    last_name: lastName,
    tx_ref: input.txRef,
    callback_url: `${input.appUrl}/api/payments/webhook-chapa`,
    return_url: `${input.appUrl}/payment/callback?provider=${encodeURIComponent(input.provider)}&tx_ref=${encodeURIComponent(input.txRef)}`,
    customization: {
      title: 'V808 Records License',
      description: `${input.beatTitle} (${input.tierName})`,
    },
  }
  if (input.buyerPhone) {
    payload.phone_number = input.buyerPhone
  }

  const res = await fetch('https://api.chapa.co/v1/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const json = (await res.json()) as {
    status?: string
    message?: string
    data?: { checkout_url?: string }
  }

  if (!res.ok || json.status !== 'success' || !json.data?.checkout_url) {
    throw new Error(json.message || 'Chapa failed to initialize transaction.')
  }

  return {
    checkoutUrl: json.data.checkout_url,
    providerRef: input.txRef,
    currency: 'ETB',
    amount: input.amountEtb,
  }
}

export async function verifyChapaPayment(txRef: string, expectedEtb: number) {
  const secretKey = getEnv('CHAPA_SECRET_KEY')
  if (!secretKey) {
    throw new GatewayConfigError('CHAPA_SECRET_KEY is not configured.', ['CHAPA_SECRET_KEY'])
  }

  const res = await fetch(`https://api.chapa.co/v1/transaction/verify/${encodeURIComponent(txRef)}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  })
  const json = (await res.json()) as {
    status?: string
    message?: string
    data?: {
      status?: string
      tx_ref?: string
      reference?: string
      currency?: string
      amount?: number | string
    }
  }

  if (!res.ok || json.status !== 'success' || json.data?.status !== 'success') {
    return { paid: false as const, reason: json.message || 'Chapa transaction not completed.' }
  }
  if (json.data.currency !== 'ETB' || Number(json.data.amount) + 0.01 < expectedEtb) {
    return { paid: false as const, reason: 'Verified amount or currency does not match order.' }
  }
  return {
    paid: true as const,
    providerRef: json.data.reference || json.data.tx_ref || txRef,
  }
}

/* -------------------------------------------------------------------------- */
/* Direct Telebirr H5 WebPay (falls back to Chapa Telebirr rail if unset)     */
/* -------------------------------------------------------------------------- */
async function initDirectTelebirr(input: InitGatewayInput): Promise<InitGatewayResult> {
  const appId = getEnv('TELEBIRR_APP_ID')
  const appKey = getEnv('TELEBIRR_APP_KEY')
  const shortCode = getEnv('TELEBIRR_SHORT_CODE')
  const publicKey = getEnv('TELEBIRR_PUBLIC_KEY')

  if (!appId || !appKey || !shortCode || !publicKey) {
    return initChapa(input)
  }

  // Ethio Telecom Telebirr H5 WebPay signed order creation
  const timestamp = String(Date.now())
  const nonce = crypto.randomBytes(16).toString('hex')
  const ussd = {
    appId,
    nonce,
    notifyUrl: `${input.appUrl}/api/payments/webhook-chapa`,
    outTradeNo: input.txRef,
    receiveName: 'V808 Records',
    returnUrl: `${input.appUrl}/payment/callback?provider=telebirr&tx_ref=${encodeURIComponent(input.txRef)}`,
    shortCode,
    subject: `${input.beatTitle} - ${input.tierName}`,
    timeoutExpress: '30',
    timestamp,
    totalAmount: input.amountEtb.toFixed(2),
  }

  const signStr = Object.keys(ussd)
    .sort()
    .map((k) => `${k}=${ussd[k as keyof typeof ussd]}`)
    .join('&') + `&appKey=${appKey}`
  const sign = crypto.createHash('sha256').update(signStr).digest('hex').toUpperCase()

  const ussdJson = Buffer.from(JSON.stringify(ussd), 'utf8')
  const encrypted = crypto.publicEncrypt(
    { key: publicKey.replace(/\\n/g, '\n'), padding: crypto.constants.RSA_PKCS1_PADDING },
    ussdJson,
  )

  const res = await fetch('https://app.ethiomobilemoney.et:2121/ammapi/payment/service-openup/toTradeWebPay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appid: appId, sign, ussd: encrypted.toString('base64') }),
  })

  const json = (await res.json()) as {
    code?: number | string
    msg?: string
    data?: { toPayUrl?: string }
  }
  if (!res.ok || !json.data?.toPayUrl) {
    throw new Error(json.msg || 'Telebirr H5 gateway rejected payment initialization.')
  }
  return {
    checkoutUrl: json.data.toPayUrl,
    providerRef: input.txRef,
    currency: 'ETB',
    amount: input.amountEtb,
  }
}

/* -------------------------------------------------------------------------- */
/* Stripe Checkout (Credit/Debit Cards: Visa, Mastercard, Amex, Apple/GPay)   */
/* -------------------------------------------------------------------------- */
async function initStripe(input: InitGatewayInput): Promise<InitGatewayResult> {
  const secretKey = getEnv('STRIPE_SECRET_KEY')
  if (!secretKey) {
    throw new GatewayConfigError(
      'Stripe international card gateway is not configured on the server yet.',
      ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'],
    )
  }

  const form = new URLSearchParams({
    mode: 'payment',
    'payment_method_types[0]': 'card',
    customer_email: input.buyerEmail,
    client_reference_id: input.txRef,
    'line_items[0][quantity]': '1',
    'line_items[0][price_data][currency]': 'usd',
    'line_items[0][price_data][unit_amount]': String(Math.round(input.amountUsd * 100)),
    'line_items[0][price_data][product_data][name]': `${input.beatTitle} — ${input.tierName}`,
    'line_items[0][price_data][product_data][description]': 'V808 Records Instant Audio License',
    'metadata[tx_ref]': input.txRef,
    success_url: `${input.appUrl}/payment/callback?provider=stripe_card&tx_ref=${encodeURIComponent(input.txRef)}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${input.appUrl}/catalog?canceled=1`,
  })

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  })

  const json = (await res.json()) as {
    id?: string
    url?: string
    error?: { message?: string }
  }
  if (!res.ok || !json.url || !json.id) {
    throw new Error(json.error?.message || 'Stripe failed to initialize checkout session.')
  }
  return {
    checkoutUrl: json.url,
    providerRef: json.id,
    currency: 'USD',
    amount: input.amountUsd,
  }
}

export async function verifyStripeSession(sessionId: string, expectedTxRef: string, expectedUsd: number) {
  const secretKey = getEnv('STRIPE_SECRET_KEY')
  if (!secretKey) {
    throw new GatewayConfigError('STRIPE_SECRET_KEY is not configured.', ['STRIPE_SECRET_KEY'])
  }

  const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  })
  const json = (await res.json()) as {
    id?: string
    payment_status?: string
    amount_total?: number
    currency?: string
    metadata?: { tx_ref?: string }
    client_reference_id?: string
    error?: { message?: string }
  }

  if (!res.ok || json.payment_status !== 'paid') {
    return { paid: false as const, reason: json.error?.message || 'Stripe payment not completed.' }
  }
  const ref = json.metadata?.tx_ref || json.client_reference_id
  if (ref !== expectedTxRef || (json.amount_total ?? 0) < Math.round(expectedUsd * 100)) {
    return { paid: false as const, reason: 'Stripe session amount or reference mismatch.' }
  }
  return { paid: true as const, providerRef: json.id || sessionId }
}

/* -------------------------------------------------------------------------- */
/* PayPal Orders API v2                                                       */
/* -------------------------------------------------------------------------- */
function getPayPalBaseUrl(): string {
  return getEnv('PAYPAL_ENV').toLowerCase() === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'
}

async function getPayPalAccessToken(): Promise<string> {
  const clientId = getEnv('PAYPAL_CLIENT_ID')
  const clientSecret = getEnv('PAYPAL_CLIENT_SECRET')
  if (!clientId || !clientSecret) {
    throw new GatewayConfigError(
      'PayPal international gateway is not configured on the server yet.',
      ['PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET'],
    )
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`, 'utf8').toString('base64')
  const res = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  const json = (await res.json()) as { access_token?: string; error_description?: string }
  if (!res.ok || !json.access_token) {
    throw new Error(json.error_description || 'PayPal authentication failed.')
  }
  return json.access_token
}

async function initPayPal(input: InitGatewayInput): Promise<InitGatewayResult> {
  const token = await getPayPalAccessToken()
  const res = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: input.txRef,
          custom_id: input.txRef,
          description: `${input.beatTitle} — ${input.tierName}`,
          amount: {
            currency_code: 'USD',
            value: input.amountUsd.toFixed(2),
          },
        },
      ],
      application_context: {
        brand_name: 'V808 Records',
        user_action: 'PAY_NOW',
        return_url: `${input.appUrl}/payment/callback?provider=paypal&tx_ref=${encodeURIComponent(input.txRef)}`,
        cancel_url: `${input.appUrl}/catalog?canceled=1`,
      },
    }),
  })

  const json = (await res.json()) as {
    id?: string
    links?: Array<{ rel?: string; href?: string }>
    message?: string
  }
  const approve = json.links?.find((l) => l.rel === 'approve')?.href
  if (!res.ok || !json.id || !approve) {
    throw new Error(json.message || 'PayPal failed to create order.')
  }
  return {
    checkoutUrl: approve,
    providerRef: json.id,
    currency: 'USD',
    amount: input.amountUsd,
  }
}

export async function capturePayPalOrder(paypalOrderId: string, expectedTxRef: string, expectedUsd: number) {
  const token = await getPayPalAccessToken()
  const base = getPayPalBaseUrl()

  // Capture (or fetch if already captured)
  let res = await fetch(`${base}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
  if (res.status === 422) {
    res = await fetch(`${base}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  }

  const json = (await res.json()) as {
    id?: string
    status?: string
    purchase_units?: Array<{
      custom_id?: string
      payments?: { captures?: Array<{ amount?: { value?: string; currency_code?: string } }> }
    }>
    message?: string
  }
  if (!res.ok || json.status !== 'COMPLETED') {
    return { paid: false as const, reason: json.message || 'PayPal order is not completed.' }
  }
  const unit = json.purchase_units?.[0]
  const cap = unit?.payments?.captures?.[0]?.amount
  if (unit?.custom_id !== expectedTxRef || (cap && Number(cap.value) + 0.01 < expectedUsd)) {
    return { paid: false as const, reason: 'PayPal capture amount or reference mismatch.' }
  }
  return { paid: true as const, providerRef: json.id || paypalOrderId }
}

export async function initializeProviderCheckout(input: InitGatewayInput): Promise<InitGatewayResult> {
  switch (input.provider) {
    case 'chapa':
    case 'cbe':
      return initChapa(input)
    case 'telebirr':
      return initDirectTelebirr(input)
    case 'stripe_card':
      return initStripe(input)
    case 'paypal':
      return initPayPal(input)
    default:
      throw new Error('Unsupported payment provider.')
  }
}
