import { Disc3, Headphones, Radio, Star } from 'lucide-react'

const stats = [
  { label: 'Tracks mastered', value: '500+' },
  { label: 'Licenses delivered', value: '2,300+' },
  { label: 'Streams supported', value: '5M+' },
  { label: 'Avg. turnaround', value: '24h' },
]

export default function About() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="font-mono text-xs text-brand uppercase font-bold tracking-wider">
            Producer bio
          </span>
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold uppercase tracking-tight leading-tight">
            V808.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-accent">
              Sound that moves.
            </span>
          </h2>
          <p className="text-muted leading-relaxed">
            V808 Records is an independent production house delivering direct-from-producer
            instrumentals. Every track is mixed and mastered to -14 LUFS, ready for streaming
            platforms, sync licensing and independent releases.
          </p>
          <p className="text-muted leading-relaxed">
            We handle licensing the way it should be — instant, transparent and legally binding.
            Pick a tier, get your contract, pull your stems, release.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <div className="flex text-brand">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
            <span className="text-sm text-muted">Trusted by independent artists worldwide.</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: Disc3, t: 'Mastered in-house', s: 'Analog chain + -14 LUFS' },
            { icon: Headphones, t: 'Stem-ready', s: 'Tracked-out session exports' },
            { icon: Radio, t: 'Stream-safe', s: 'Plays clean on every platform' },
            { icon: Star, t: 'Clean contracts', s: 'PDF license on every purchase' },
          ].map(({ icon: Icon, t, s }) => (
            <div key={t} className="glass p-5 rounded-2xl border border-line card-hover">
              <Icon className="w-6 h-6 text-brand mb-2" />
              <h4 className="text-sm font-bold">{t}</h4>
              <p className="text-xs text-muted">{s}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
        {stats.map((s) => (
          <div key={s.label} className="glass p-6 rounded-2xl border border-line text-center">
            <div className="text-3xl font-extrabold font-display text-brand">{s.value}</div>
            <p className="text-xs text-muted uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}