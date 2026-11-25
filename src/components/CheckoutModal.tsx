import { useState } from 'react'
import { Award, Check, Download, Lock } from 'lucide-react'
import Modal from './Modal'
import { tiers } from '../lib/seed'
import { useCatalog } from '../context/CatalogContext'
import { useAuth } from '../context/AuthContext'
import type { Beat, License, LicenseTier } from '../types'

interface CheckoutModalProps {
  beat: Beat | null
  onClose: () => void
}

export default function CheckoutModal({ beat, onClose }: CheckoutModalProps) {
  const { purchase } = useCatalog()
  const { user } = useAuth()
  const [tierId, setTierId] = useState<LicenseTier>('basic')
  const [buyerName, setBuyerName] = useState(user?.user_metadata?.full_name ?? '')
  const [buyerEmail, setBuyerEmail] = useState(user?.email ?? '')
  const [license, setLicense] = useState<License | null>(null)
  const [busy, setBusy] = useState(false)
  const [size, setSize] = useState<'base' | 'license'>('base')

  if (!beat) return null
  const tier = tiers.find((t) => t.id === tierId)!

  const handlePurchase = async () => {
    setBusy(true)
    try {
      const lic = await purchase({
        beat,
        tier: tier.id,
        price: tier.price,
        buyerName: buyerName || 'Valued Artist',
        buyerEmail: buyerEmail || 'artist@music.com',
      })
      setLicense(lic)
      setSize('license')
    } finally {
      setBusy(false)
    }
  }

  const reset = () => {
    setLicense(null)
    setSize('base')
    setTierId('basic')
    onClose()
  }

  return (
    <Modal
      open={Boolean(beat)}
      onClose={reset}
      maxWidth={size === 'license' ? 'max-w-3xl' : 'max-w-2xl'}
    >
      {size === 'base' ? (
        <>
          <div className="flex items-center gap-4 mb-6">
            <img
              src={beat.cover_url}
              alt={beat.title}
              className="w-16 h-16 rounded-xl object-cover border border-line"
            />
            <div>
              <span className="text-xs font-mono text-brand uppercase font-bold">
                Select license tier
              </span>
              <h3 className="text-2xl font-bold text-ink">{beat.title}</h3>
              <p className="text-xs text-muted">
                {beat.genre} • {beat.bpm} BPM • {beat.key_root}
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {tiers.map((t) => {
              const selected = t.id === tierId
              return (
                <button
                  key={t.id}
                  onClick={() => setTierId(t.id)}
                  className={`w-full text-left glass-card p-4 rounded-xl border transition-all ${
                    selected
                      ? 'border-brand bg-brand/5'
                      : 'border-line hover:border-brand/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selected ? 'border-brand' : 'border-muted'
                        }`}
                      >
                        {selected && <span className="w-2 h-2 rounded-full bg-brand" />}
                      </span>
                      <div>
                        <h4 className="font-bold text-ink text-sm">
                          {t.name}
                          {t.id === 'premium' && (
                            <span className="ml-2 bg-brand text-white text-[9px] px-2 py-0.5 rounded font-extrabold">
                              RECOMMENDED
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-muted">{t.tagline}</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-ink text-lg">${t.price}</span>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="space-y-4 mb-2">
            <div>
              <label className="block text-xs font-bold text-ink/80 uppercase mb-1">
                Artist / Licensee name
              </label>
              <input
                className="input"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="e.g. Young Producer / Stage Name"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-ink/80 uppercase mb-1">
                Email address
              </label>
              <input
                className="input"
                type="email"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                placeholder="artist@recordlabel.com"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-line/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-muted block">Total due</span>
              <span className="text-2xl font-extrabold text-ink">${tier.price.toFixed(2)}</span>
            </div>
            <button
              onClick={handlePurchase}
              disabled={busy}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold text-sm shadow-xl shadow-brand/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Lock className="w-4 h-4" />
              {busy ? 'Processing…' : 'Complete checkout & generate license'}
            </button>
          </div>
        </>
      ) : (
        license && (
          <LicenseCertificate license={license} onDone={reset} />
        )
      )}
    </Modal>
  )
}

function LicenseCertificate({ license, onDone }: { license: License; onDone: () => void }) {
  return (
    <div>
      <div className="text-center border-b border-line pb-6 mb-6">
        <div className="inline-flex p-3 rounded-2xl bg-brand/10 border border-brand/30 text-brand mb-3">
          <Award className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-display font-extrabold uppercase">
          Automated beat license certificate
        </h3>
        <p className="text-xs font-mono text-muted mt-1">Issued by V808 Records engine</p>
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
            <span className="text-ink font-bold">V808 RECORDS PRODUCTIONS</span>
          </div>
          <div>
            <span className="text-muted block">Licensee / Artist</span>
            <span className="text-brand font-bold">{license.buyer_name}</span>
          </div>
        </div>

        <div>
          <span className="text-muted block">Track title</span>
          <span className="text-ink text-sm font-bold">{license.beat?.title}</span>
        </div>

        <div>
          <span className="text-muted block">Grant of rights</span>
          <p className="mt-1 text-muted">
            This license grants the Licensee commercial recording rights to broadcast, perform and
            distribute the audio work titled above. The Producer retains original publishing master
            rights unless Exclusive ownership was acquired.
          </p>
        </div>

        <div className="pt-2 border-t border-line/40 flex items-center justify-between text-[10px] text-muted">
          <span>
            STATUS: <strong className="text-emerald-500">VERIFIED & ACTIVE</strong>
          </span>
          <span>DIGITAL SIGNATURE: 0x{Math.floor(Math.random() * 1e8).toString(16)}</span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 items-center justify-between">
        <button className="px-6 py-3 rounded-xl bg-card hover:bg-line text-ink text-xs font-bold border border-line flex items-center gap-2">
          <Download className="w-4 h-4 text-brand" /> Download printable contract
        </button>
        <button
          onClick={onDone}
          className="px-6 py-3 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-lg flex items-center gap-2"
        >
          <Check className="w-4 h-4" /> Go to my downloads
        </button>
      </div>
    </div>
  )
}