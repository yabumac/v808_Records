import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Award, Check, Download, Loader2, ShieldAlert } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCatalog } from '../context/CatalogContext'
import type { License } from '../types'

export default function PaymentCallback() {
  const [params] = useSearchParams()
  const { user, session, loading: authLoading } = useAuth()
  const { beats, recordVerifiedLicense, refreshLicenses } = useCatalog()

  const [status, setStatus] = useState<'verifying' | 'verified' | 'error'>('verifying')
  const [error, setError] = useState<string | null>(null)
  const [license, setLicense] = useState<License | null>(null)

  const txRef = params.get('tx_ref') || ''
  const sessionId = params.get('session_id') || ''
  const paypalOrderId = params.get('token') || ''

  useEffect(() => {
    if (authLoading) return
    if (!user || !session?.access_token) {
      setStatus('error')
      setError('Please sign in to verify your payment receipt and unlock your license.')
      return
    }
    if (!txRef) {
      setStatus('error')
      setError('Missing transaction reference in callback URL.')
      return
    }

    let cancelled = false
    fetch('/api/payments/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ txRef, sessionId: sessionId || undefined, paypalOrderId: paypalOrderId || undefined }),
    })
      .then(async (res) => {
        const data = (await res.json()) as { verified?: boolean; license?: License; error?: string }
        if (!res.ok || !data.verified || !data.license) {
          throw new Error(data.error || 'Payment verification failed.')
        }
        if (cancelled) return
        const enriched: License = {
          ...data.license,
          beat: data.license.beat ?? beats.find((b) => b.id === data.license?.beat_id),
        }
        setLicense(enriched)
        recordVerifiedLicense(enriched)
        refreshLicenses()
        setStatus('verified')
      })
      .catch((err) => {
        if (cancelled) return
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Unable to verify payment.')
      })

    return () => {
      cancelled = true
    }
  }, [authLoading, user, session?.access_token, txRef, sessionId, paypalOrderId, beats, recordVerifiedLicense, refreshLicenses])

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
      {status === 'verifying' && (
        <div className="glass rounded-3xl border border-line p-10 text-center space-y-4">
          <Loader2 className="w-10 h-10 text-brand animate-spin mx-auto" />
          <h2 className="text-2xl font-display font-extrabold uppercase text-ink">
            Verifying payment…
          </h2>
          <p className="text-sm text-muted font-mono">
            Confirming cryptographic receipt with gateway for ref {txRef}
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="glass rounded-3xl border border-rose-500/30 p-8 text-center space-y-4">
          <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-2xl font-display font-extrabold uppercase text-ink">
            Verification Pending / Failed
          </h2>
          <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {!user && (
              <Link to="/login" className="btn-primary px-6 py-3 text-xs">
                Sign in
              </Link>
            )}
            <Link to="/catalog" className="btn-ghost px-6 py-3 text-xs">
              Back to catalog
            </Link>
          </div>
        </div>
      )}

      {status === 'verified' && license && (
        <div className="glass rounded-3xl border border-line p-8">
          <div className="text-center border-b border-line pb-6 mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-brand/10 border border-brand/30 text-brand mb-3">
              <Award className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-display font-extrabold uppercase text-ink">
              Verified Beat License Certificate
            </h2>
            <p className="text-xs font-mono text-muted mt-1">
              Cryptographically signed by V808 Records
            </p>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-line font-mono text-xs space-y-4 text-ink leading-relaxed">
            <div className="grid grid-cols-2 gap-4 border-b border-line/60 pb-4 text-[11px]">
              <div>
                <span className="text-muted block">License ID</span>
                <span className="text-ink font-bold">{license.license_code}</span>
              </div>
              <div>
                <span className="text-muted block">Date of issue</span>
                <span className="text-ink font-bold">
                  {new Date(license.issued_at).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-muted block">Producer / Grantor</span>
                <span className="text-ink font-bold">V808 RECORDS (YABUONTHEBEAT)</span>
              </div>
              <div>
                <span className="text-muted block">Licensee / Artist</span>
                <span className="text-brand font-bold">{license.buyer_name}</span>
              </div>
            </div>

            <div>
              <span className="text-muted block">Track title</span>
              <span className="text-ink text-sm font-bold">
                {license.beat?.title ?? license.beat_id}
              </span>
            </div>

            <div>
              <span className="text-muted block">Grant of rights</span>
              <p className="mt-1 text-muted">
                This license grants the Licensee commercial recording rights for the audio work
                titled above under the {license.tier.toUpperCase()} tier.
              </p>
            </div>

            <div className="pt-2 border-t border-line/40 flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted">
              <span>
                STATUS: <strong className="text-emerald-500">VERIFIED &amp; ACTIVE</strong>
              </span>
              <span className="truncate max-w-xs">
                SIG: {license.signature_hash?.slice(0, 24) || 'VERIFIED'}
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-4 items-center justify-between">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-6 py-3 rounded-xl bg-card hover:bg-line text-ink text-xs font-bold border border-line flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-brand" /> Print / Save PDF contract
            </button>
            <Link
              to="/library"
              className="px-6 py-3 rounded-xl bg-brand hover:bg-brand-hover text-btn text-xs font-bold shadow-lg flex items-center gap-2"
            >
              <Check className="w-4 h-4" /> Go to my library
            </Link>
          </div>
        </div>
      )}
    </section>
  )
}
