import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  AlertCircle,
  CreditCard,
  Globe,
  Lock,
  LogIn,
  ShieldCheck,
  Smartphone,
  Wallet,
} from 'lucide-react'
import Modal from './Modal'
import GoogleButton from './GoogleButton'
import {
  DEFAULT_ETB_RATE,
  isTierAvailableForBeat,
  PAYMENT_METHODS,
  tiers,
} from '../lib/seed'
import { useAuth } from '../context/AuthContext'
import type { Beat, LicenseTier, PaymentProvider } from '../types'

interface CheckoutModalProps {
  beat: Beat | null
  onClose: () => void
}

interface GatewayStatusResponse {
  providers?: Record<PaymentProvider, boolean>
  supabaseConfigured?: boolean
  supabaseAdmin?: boolean
  etbRate?: number
}

export default function CheckoutModal({ beat, onClose }: CheckoutModalProps) {
  const { user, session, profile } = useAuth()
  const location = useLocation()

  const [tierId, setTierId] = useState<LicenseTier>('basic')
  const [provider, setProvider] = useState<PaymentProvider>('chapa')
  const [buyerName, setBuyerName] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [missingEnv, setMissingEnv] = useState<string[]>([])
  const [gatewayStatus, setGatewayStatus] = useState<GatewayStatusResponse | null>(null)

  useEffect(() => {
    if (!beat) return
    setBuyerName((prev) => prev || profile?.full_name || user?.user_metadata?.full_name || '')
    setBuyerEmail((prev) => prev || user?.email || '')
    setError(null)
    setMissingEnv([])
  }, [beat, user, profile])

  useEffect(() => {
    if (!beat || !user) return
    let active = true
    fetch('/api/payments/status')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: GatewayStatusResponse | null) => {
        if (active && data) setGatewayStatus(data)
      })
      .catch(() => {
        // Local Vite dev server does not run Vercel /api functions
      })
    return () => {
      active = false
    }
  }, [beat, user])

  const selectedMethod = useMemo(
    () => PAYMENT_METHODS.find((m) => m.id === provider) ?? PAYMENT_METHODS[0],
    [provider],
  )

  if (!beat) return null

  const tier = tiers.find((t) => t.id === tierId) ?? tiers[0]
  const unitPriceUsd = tier.id === 'basic' && beat.price > 0 ? Number(beat.price) : tier.price
  const etbRate = gatewayStatus?.etbRate ?? DEFAULT_ETB_RATE
  const totalEtb = Math.round(unitPriceUsd * etbRate)

  const ethiopianMethods = PAYMENT_METHODS.filter((m) => m.region === 'ethiopia')
  const intlMethods = PAYMENT_METHODS.filter((m) => m.region === 'international')

  const handleCheckout = async () => {
    if (!user || !session?.access_token) {
      setError('You must be signed in to complete checkout.')
      return
    }

    const tierCheck = isTierAvailableForBeat(tier.id, beat)
    if (!tierCheck.available) {
      setError(tierCheck.reason || 'This license tier is currently unavailable.')
      return
    }

    if (selectedMethod.needsPhone && !buyerPhone.trim()) {
      setError('Enter your Ethiopian phone number (e.g. 0912345678) for Telebirr / CBE.')
      return
    }

    setBusy(true)
    setError(null)
    setMissingEnv([])

    try {
      const res = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          beatId: beat.id,
          tier: tier.id,
          provider,
          buyerName: buyerName.trim(),
          buyerEmail: buyerEmail.trim(),
          buyerPhone: buyerPhone.trim() || undefined,
        }),
      })

      const ct = res.headers.get('content-type') || ''
      if (!ct.includes('application/json')) {
        throw new Error(
          'Payment server endpoint (/api/payments/initialize) is only active when deployed on Vercel or running with `vercel dev`.',
        )
      }

      const data = (await res.json()) as {
        checkoutUrl?: string
        error?: string
        missingEnv?: string[]
      }

      if (!res.ok || !data.checkoutUrl) {
        if (Array.isArray(data.missingEnv)) setMissingEnv(data.missingEnv)
        throw new Error(data.error || 'Unable to initialize payment.')
      }

      window.location.assign(data.checkoutUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout initialization failed.')
    } finally {
      setBusy(false)
    }
  }

  const reset = () => {
    setError(null)
    setMissingEnv([])
    setTierId('basic')
    onClose()
  }

  return (
    <Modal open={Boolean(beat)} onClose={reset} maxWidth="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <img
          src={beat.cover_url}
          alt={beat.title}
          className="w-16 h-16 rounded-xl object-cover border border-line shrink-0"
        />
        <div className="min-w-0">
          <span className="text-xs font-mono text-copper-ink uppercase font-bold">
            Secure Beat Checkout
          </span>
          <h3 className="text-2xl font-bold text-ink truncate">{beat.title}</h3>
          <p className="text-xs text-muted">
            {beat.genre} • {beat.bpm} BPM • {beat.key_root}
          </p>
        </div>
      </div>

      {/* Step 0: Strict Auth Gate */}
      {!user ? (
        <div className="bg-card rounded-2xl border border-line p-6 space-y-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h4 className="font-bold text-ink text-base">Sign in required to buy</h4>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                For payment security and fraud protection, you must sign in before paying via
                Telebirr, CBE, Chapa, Card, or PayPal. Your verified license &amp; download will
                automatically lock to your account.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <GoogleButton redirectPath={location.pathname} onError={setError} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                to="/login"
                state={{ from: location.pathname }}
                onClick={reset}
                className="btn-primary py-3 text-xs"
              >
                <LogIn className="w-4 h-4" /> Sign in with Email
              </Link>
              <Link
                to="/register"
                state={{ from: location.pathname }}
                onClick={reset}
                className="btn-ghost py-3 text-xs"
              >
                Create free account
              </Link>
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Step 1: License Tiers (Premium & Exclusive visible, gated until stems/MIDI exist) */}
          <div className="mb-6">
            <p className="text-xs font-mono uppercase tracking-wider text-muted font-bold mb-2.5">
              1. Select License Tier
            </p>
            <div className="space-y-2.5">
              {tiers.map((t) => {
                const avail = isTierAvailableForBeat(t.id, beat)
                const selected = t.id === tierId
                const displayPrice = t.id === 'basic' && beat.price > 0 ? beat.price : t.price

                return (
                  <button
                    key={t.id}
                    type="button"
                    disabled={!avail.available}
                    onClick={() => avail.available && setTierId(t.id)}
                    className={`w-full text-left bg-card p-4 rounded-xl border transition-all ${
                      !avail.available
                        ? 'border-line/60 opacity-70 cursor-not-allowed'
                        : selected
                          ? 'border-brand ring-2 ring-brand/20'
                          : 'border-line hover:border-brand/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            selected && avail.available ? 'border-brand' : 'border-muted'
                          }`}
                        >
                          {selected && avail.available && (
                            <span className="w-2 h-2 rounded-full bg-brand" />
                          )}
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-ink text-sm">{t.name}</h4>
                            {avail.available ? (
                              <span className="bg-emerald-600 text-white text-[9px] px-2 py-0.5 rounded font-extrabold uppercase">
                                Available
                              </span>
                            ) : (
                              <span className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[9px] px-2 py-0.5 rounded font-extrabold uppercase">
                                Unavailable · No Stems/MIDI
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted mt-0.5">
                            {avail.available ? t.tagline : avail.reason}
                          </p>
                        </div>
                      </div>
                      <span className="font-extrabold text-ink text-lg shrink-0">
                        ${displayPrice}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Step 2: Payment Method (Ethiopia Local + International) */}
          <div className="mb-6 space-y-4">
            <p className="text-xs font-mono uppercase tracking-wider text-muted font-bold">
              2. Choose Payment Method
            </p>

            <div>
              <span className="text-[11px] font-bold text-ink/80 flex items-center gap-1.5 mb-2">
                <Smartphone className="w-3.5 h-3.5 text-brand" />
                Ethiopia Local Payments (ETB · ≈ {totalEtb.toLocaleString()} ETB)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {ethiopianMethods.map((m) => {
                  const active = provider === m.id
                  const live = gatewayStatus?.providers?.[m.id]
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setProvider(m.id)}
                      className={`text-left bg-card p-3 rounded-xl border transition-all ${
                        active ? 'border-brand ring-2 ring-brand/20' : 'border-line hover:border-brand/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-xs text-ink">{m.label}</span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                            live === true
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                              : 'bg-line/70 text-muted'
                          }`}
                        >
                          {m.currency}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted leading-snug">{m.subtitle}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-ink/80 flex items-center gap-1.5 mb-2">
                <Globe className="w-3.5 h-3.5 text-brand" />
                International Payments (USD · ${unitPriceUsd.toFixed(2)})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {intlMethods.map((m) => {
                  const active = provider === m.id
                  const live = gatewayStatus?.providers?.[m.id]
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setProvider(m.id)}
                      className={`text-left bg-card p-3 rounded-xl border transition-all ${
                        active ? 'border-brand ring-2 ring-brand/20' : 'border-line hover:border-brand/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-xs text-ink flex items-center gap-1.5">
                          {m.id === 'stripe_card' ? (
                            <CreditCard className="w-3.5 h-3.5 text-brand" />
                          ) : (
                            <Wallet className="w-3.5 h-3.5 text-brand" />
                          )}
                          {m.label}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                            live === true
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                              : 'bg-line/70 text-muted'
                          }`}
                        >
                          {m.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted leading-snug">{m.subtitle}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Step 3: Licensee Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-bold text-ink/80 uppercase mb-1">
                Artist / Licensee Name
              </label>
              <input
                className="input"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="Stage or legal name"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-ink/80 uppercase mb-1">
                Receipt &amp; License Email
              </label>
              <input
                className="input"
                type="email"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                placeholder="artist@recordlabel.com"
              />
            </div>
            {selectedMethod.needsPhone && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-ink/80 uppercase mb-1">
                  Ethiopian Mobile Number ({selectedMethod.label})
                </label>
                <input
                  className="input"
                  type="tel"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="09XXXXXXXX or +2519XXXXXXXX"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 space-y-1">
              <p className="flex items-start gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </p>
              {missingEnv.length > 0 && (
                <p className="text-[11px] text-muted pl-6 font-mono">
                  Required server env keys: {missingEnv.join(', ')}
                </p>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-line/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-muted block">
                Total due ({selectedMethod.currency})
              </span>
              <span className="text-2xl font-extrabold text-ink">
                {selectedMethod.currency === 'ETB'
                  ? `${totalEtb.toLocaleString()} ETB`
                  : `$${unitPriceUsd.toFixed(2)} USD`}
              </span>
              <span className="text-[11px] text-muted block font-mono">
                {selectedMethod.currency === 'ETB'
                  ? `≈ $${unitPriceUsd.toFixed(2)} USD`
                  : `≈ ${totalEtb.toLocaleString()} ETB`}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCheckout}
              disabled={busy}
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-brand hover:bg-brand-hover text-btn font-bold text-sm shadow-xl shadow-brand/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Lock className="w-4 h-4" />
              {busy ? 'Connecting securely…' : `Pay with ${selectedMethod.label}`}
            </button>
          </div>

          <p className="mt-3 text-[10px] font-mono text-muted flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            JWT authenticated · Server-side price &amp; webhook verification · Zero card data stored
          </p>
        </>
      )}
    </Modal>
  )
}
