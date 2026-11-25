import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Disc3,
  Headphones,
  Music2,
  Pause,
  Play,
  Radio,
  Star,
} from 'lucide-react'
import { useCatalog } from '../context/CatalogContext'
import { usePlayer } from '../context/PlayerContext'

const stats = [
  { label: 'Tracks mastered', value: '500+' },
  { label: 'Licenses delivered', value: '2,300+' },
  { label: 'Streams supported', value: '5M+' },
  { label: 'Avg. turnaround', value: '24h' },
]

const pillars = [
  { icon: Disc3, t: 'Mastered in-house', s: 'Analog chain + -14 LUFS' },
  { icon: Headphones, t: 'Stem-ready', s: 'Tracked-out session exports' },
  { icon: Radio, t: 'Stream-safe', s: 'Plays clean on every platform' },
  { icon: Star, t: 'Clean contracts', s: 'PDF license on every purchase' },
]

export default function About() {
  const { beats } = useCatalog()
  const { current, isPlaying, play } = usePlayer()

  const featured = useMemo(() => beats.find((b) => b.is_published) ?? beats[0], [beats])
  const isFeaturedPlaying = Boolean(featured && current?.id === featured.id && isPlaying)

  return (
    <div className="animate-fade-in">
      {/* ============ About Me Hero (light & dark techwear showcase) ============ */}
      <section className="relative overflow-hidden py-12 lg:py-16 px-4 sm:px-6 lg:px-8 border-b border-line/40">
        {/* Atmospheric glows */}
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-purple-500/15 dark:bg-brand/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-copper/15 dark:bg-copper/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22/></filter><rect width=%22100%22 height=%22100%22 filter=%22url(%23n)%22 opacity=%220.035%22/></svg>')] opacity-50 dark:opacity-100 pointer-events-none" />

        {/* Giant ghost type */}
        <span className="absolute inset-x-0 top-6 flex justify-center text-[22vw] leading-none font-display font-extrabold uppercase text-stroke select-none pointer-events-none">
          V808
        </span>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10 py-6 lg:py-10">
          {/* Left bio content */}
          <div className="lg:col-span-5 space-y-4">
            <h1 className="font-hand text-5xl sm:text-6xl text-purple-600 dark:text-brand -rotate-2">
              BEHIND THE 808
            </h1>
            <p className="font-hand text-3xl text-ink italic">Sound that moves.</p>

            <p className="text-muted text-base max-w-xl leading-relaxed">
              V808 Records is my independent production house delivering direct-from-producer
              instrumentals. Every beat is engineered from scratch, mixed, and mastered in-house to
              -14 LUFS — ready for streaming platforms, sync licensing, and independent releases.
            </p>
            <p className="text-muted text-sm max-w-xl leading-relaxed">
              I built licensing the way it should be — instant, transparent, and legally binding.
              Pick a tier, pull your tracked-out stems, and release without friction.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <div className="flex text-copper">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-xs sm:text-sm text-muted">
                Trusted by independent artists worldwide.
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-3">
              <Link
                to="/catalog"
                className="btn border-2 border-purple-600 text-purple-700 hover:bg-purple-600 hover:text-white dark:border-brand dark:text-brand dark:hover:bg-brand dark:hover:text-white px-8 py-3.5"
              >
                <Music2 className="w-5 h-5" /> Explore my catalog
              </Link>
              <Link
                to="/licensing"
                className="text-sm text-muted hover:text-copper-ink underline underline-offset-4"
              >
                View license pricing
              </Link>
            </div>
          </div>

          {/* Center spinning vinyl */}
          <div className="lg:col-span-4 flex items-center justify-center relative py-6 lg:py-10">
            <div className="absolute w-80 sm:w-96 h-80 sm:h-96 bg-purple-500/20 dark:bg-brand/25 rounded-full blur-3xl -z-10 animate-pulse-glow" />
            <VinylRecord
              spinning={Boolean(current?.audio_url && isPlaying)}
              onToggle={() => featured && play(featured)}
              title={featured ? `Play ${featured.title}` : 'V808 Studio Vinyl'}
            />
          </div>

          {/* Right rail: studio philosophy & signature sound */}
          <div className="lg:col-span-3 space-y-5">
            <div className="glass p-5 rounded-2xl border border-line card-hover space-y-1.5 shadow-sm dark:shadow-none">
              <span className="font-mono text-[10px] tracking-[0.25em] text-copper-ink font-bold uppercase">
                Studio Craft
              </span>
              <h2 className="font-bold text-lg leading-tight text-ink">
                DIRECT FROM THE PRODUCER&apos;S DESK
              </h2>
              <p className="text-xs text-muted leading-relaxed">
                No middlemen, no generic loops — analog warmth, punchy drums, and clean headroom
                crafted for vocalists and storytellers.
              </p>
            </div>

            {featured && (
              <button
                onClick={() => play(featured)}
                className="w-full glass p-5 rounded-2xl border border-copper/35 dark:border-copper/40 card-hover text-left group shadow-sm dark:shadow-none"
              >
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={featured.cover_url}
                    alt={featured.title}
                    className="w-14 h-14 rounded-xl object-cover border border-line shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-copper-ink font-mono">
                      Signature studio spin
                    </span>
                    <h3 className="font-bold text-ink truncate">{featured.title}</h3>
                    <p className="text-[11px] text-muted">
                      {featured.bpm} BPM • {featured.key_root}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted mb-3">
                  Tap to audition my current flagship instrumental straight from the studio rack.
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-copper-ink group-hover:gap-2.5 transition-all">
                  {isFeaturedPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" /> Pause studio preview
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" /> Play studio preview
                    </>
                  )}
                </span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ============ Producer Pillars & Career Stats ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="font-mono text-xs text-copper-ink uppercase font-bold tracking-wider">
              How I work
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold uppercase tracking-tight mt-1">
              Studio{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-copper dark:from-brand dark:to-copper">
                standards
              </span>
            </h2>
          </div>
          <p className="text-sm text-muted max-w-md">
            Every beat in the V808 vault follows the same mastering, stem export, and licensing
            workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pillars.map(({ icon: Icon, t, s }) => (
            <div
              key={t}
              className="glass p-5 rounded-2xl border border-line card-hover shadow-sm dark:shadow-none"
            >
              <Icon className="w-6 h-6 text-purple-600 dark:text-brand mb-3" />
              <h3 className="text-sm font-bold text-ink">{t}</h3>
              <p className="text-xs text-muted mt-1">{s}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, idx) => (
            <div
              key={s.label}
              className="glass p-6 rounded-2xl border border-line text-center shadow-sm dark:shadow-none"
            >
              <div
                className={`text-3xl font-extrabold font-display ${
                  idx % 2 === 1 ? 'text-copper' : 'text-purple-600 dark:text-brand'
                }`}
              >
                {s.value}
              </div>
              <p className="text-xs text-muted uppercase tracking-wider mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function VinylRecord({
  spinning,
  onToggle,
  title,
}: {
  spinning: boolean
  onToggle: () => void
  title: string
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="relative animate-float group cursor-pointer focus:outline-none"
      title={title}
      aria-label={title}
    >
      <svg
        viewBox="0 0 220 220"
        className={`w-72 sm:w-80 h-auto drop-shadow-[0_24px_48px_rgba(15,15,25,0.22)] dark:drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)] ${
          spinning ? 'animate-[spin_6s_linear_infinite]' : ''
        }`}
      >
        <defs>
          <radialGradient id="vinyl-shine" cx="0.35" cy="0.3" r="0.9">
            <stop offset="0%" stopColor="#26263a" />
            <stop offset="55%" stopColor="#0d0d15" />
            <stop offset="100%" stopColor="#08080c" />
          </radialGradient>
          <linearGradient id="label-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#A855F7" />
            <stop offset="1" stopColor="#ff1a78" />
          </linearGradient>
        </defs>
        <circle cx="110" cy="110" r="105" fill="url(#vinyl-shine)" stroke="#33334a" strokeWidth="1.5" />
        {[88, 76, 64, 52, 40, 28].map((r) => (
          <circle key={r} cx="110" cy="110" r={r} fill="none" stroke="#1d1d2b" strokeWidth="1.5" />
        ))}
        <circle cx="110" cy="110" r="36" fill="url(#label-grad)" />
        <circle cx="110" cy="110" r="36" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <text
          x="110"
          y="106"
          textAnchor="middle"
          fontSize="9"
          fontFamily="Syne, sans-serif"
          fontWeight="800"
          fill="white"
          letterSpacing="2"
        >
          V808
        </text>
        <text
          x="110"
          y="122"
          textAnchor="middle"
          fontSize="5"
          fill="rgba(255,255,255,0.72)"
          fontFamily="monospace"
        >
          STUDIO · PRODUCER
        </text>
        <circle cx="110" cy="110" r="6" fill="#06060a" />
      </svg>
      {spinning && (
        <span className="absolute inset-0 rounded-full bg-purple-500/20 dark:bg-brand/20 blur-2xl pointer-events-none animate-pulse" />
      )}
    </button>
  )
}
