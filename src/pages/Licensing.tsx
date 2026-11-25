import { Check, Clock, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { isTierAvailableForBeat, tiers } from '../lib/seed'

const highlights = ['Basic (Available Now)', 'Premium (Future Uploads)', 'Exclusive (Future Uploads)']

export default function Licensing() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-3xl sm:text-4xl font-display font-extrabold uppercase tracking-tight text-ink">
          Transparent <span className="text-brand">licensing tiers</span>
        </h2>
        <p className="text-muted text-sm mt-2">
          Get instant access to untagged audio files and legally binding license contracts
          after payment verification.
        </p>
        <p className="mt-4 inline-flex items-center gap-2 text-xs font-mono text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2">
          <Clock className="w-4 h-4 shrink-0" />
          <span>
            Current tracks include Basic MP3 Lease only. Premium &amp; Exclusive tiers will unlock
            on upcoming uploads that include tracked-out stems and MIDI files.
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {tiers.map((tier) => {
          const availability = isTierAvailableForBeat(tier.id)
          const available = availability.available
          const IconColor = tier.id === 'exclusive' ? 'text-accent' : 'text-brand'

          return (
            <div
              key={tier.id}
              className={`glass p-6 rounded-2xl flex flex-col justify-between relative transition-all ${
                available
                  ? 'border-2 border-brand shadow-xl shadow-brand/10 card-hover'
                  : 'border border-line/80 opacity-85'
              }`}
            >
              <div
                className={`absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider whitespace-nowrap ${
                  available
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-card border border-line text-muted'
                }`}
              >
                {available ? 'Available now' : 'Future uploads · Stems & MIDI pending'}
              </div>

              <div>
                <div className={`font-mono text-xs font-bold uppercase mb-2 mt-2 ${IconColor}`}>
                  {tier.tagline}
                </div>
                <h3 className="text-2xl font-bold text-ink mb-1">{tier.name}</h3>
                <div className="text-3xl font-extrabold text-ink my-4">
                  ${tier.price} <span className="text-xs font-normal text-muted">/ per beat</span>
                </div>
                <ul className="space-y-3 text-xs text-muted mb-6">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className={`w-4 h-4 shrink-0 ${IconColor}`} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {!available && availability.reason && (
                  <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/25 rounded-xl p-3 mb-5">
                    {availability.reason}
                  </p>
                )}
              </div>

              {available ? (
                <Link
                  to="/catalog"
                  className="w-full py-3 rounded-xl text-xs font-bold text-center transition-all bg-brand hover:bg-brand-hover text-white shadow-lg"
                >
                  Select beat
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full py-3 rounded-xl text-xs font-bold text-center bg-card text-muted border border-line cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5" /> Unavailable until stems &amp; MIDI upload
                </button>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-center text-muted font-mono text-xs mt-10">
        LICENSE TIERS: {highlights.join(' • ')} — SIGN IN REQUIRED AT CHECKOUT
      </p>
    </section>
  )
}
