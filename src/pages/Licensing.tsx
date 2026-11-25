import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { tiers } from '../lib/seed'

const highlights = ['Basic', 'Premium', 'Exclusive']

export default function Licensing() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-3xl sm:text-4xl font-display font-extrabold uppercase tracking-tight">
          Transparent <span className="text-brand">licensing tiers</span>
        </h2>
        <p className="text-muted text-sm mt-2">
          Get instant access to untagged audio files and legally binding license PDF contracts
          immediately after purchase.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tiers.map((tier) => {
          const featured = tier.id === 'premium'
          const IconColor = tier.id === 'exclusive' ? 'text-accent' : 'text-brand'
          return (
            <div
              key={tier.id}
              className={`glass p-6 rounded-2xl flex flex-col justify-between card-hover relative ${
                featured ? 'border-2 border-brand shadow-xl shadow-brand/10 scale-105' : 'border border-line'
              }`}
            >
              {featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider">
                  Most popular for artists
                </div>
              )}
              <div>
                <div className={`font-mono text-xs font-bold uppercase mb-2 ${IconColor}`}>
                  {tier.tagline}
                </div>
                <h3 className="text-2xl font-bold mb-1">{tier.name}</h3>
                <div className="text-3xl font-extrabold my-4">
                  ${tier.price} <span className="text-xs font-normal text-muted">/ per beat</span>
                </div>
                <ul className="space-y-3 text-xs text-muted mb-6">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className={`w-4 h-4 ${IconColor}`} /> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to="/catalog"
                className={`w-full py-3 rounded-xl text-xs font-bold text-center transition-all ${
                  featured
                    ? 'bg-brand hover:bg-brand-hover text-white shadow-lg'
                    : 'bg-card hover:bg-brand hover:text-white border border-line'
                }`}
              >
                Select beat
              </Link>
            </div>
          )
        })}
      </div>

      <p className="text-center text-muted font-mono text-xs mt-10">
        LICENSE TIERS AVAILABLE: {highlights.join(' • ')} — NON-EXCLUSIVE UNLESS STATED
      </p>
    </section>
  )
}