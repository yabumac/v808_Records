import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Eye,
  Music2,
  Pause,
  Play,
  Quote,
  Share2,
} from 'lucide-react'
import { useCatalog } from '../context/CatalogContext'
import { usePlayer } from '../context/PlayerContext'
import BeatCard from '../components/BeatCard'
import CheckoutModal from '../components/CheckoutModal'
import type { Beat } from '../types'

export default function Home() {
  const { beats } = useCatalog()
  const { current, isPlaying, play } = usePlayer()
  const [checkoutBeat, setCheckoutBeat] = useState<Beat | null>(null)

  const published = useMemo(() => beats.filter((b) => b.is_published), [beats])
  const featured = published[0]
  const recent = published.slice(0, 6)

  return (
    <div className="animate-fade-in">
      {/* ============ DARK: SYNTH ERA techwear hero ============ */}
      <section className="hidden dark:block relative overflow-hidden min-h-[88vh] py-12 px-4 sm:px-6 lg:px-8 border-b border-line/40">
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-brand/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-neon-pink/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22/></filter><rect width=%22100%22 height=%22100%22 filter=%22url(%23n)%22 opacity=%220.035%22/></svg>')] pointer-events-none" />

        {/* Giant ghost type */}
        <span className="absolute inset-x-0 top-6 flex justify-center text-[22vw] leading-none font-display font-extrabold uppercase text-stroke select-none pointer-events-none">
          V808
        </span>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10 py-10">
          {/* Left content */}
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand/10 border border-brand/40 text-brand text-xs font-semibold tracking-[0.2em] uppercase">
              <span className="w-2 h-2 rounded-full bg-brand animate-ping" />
              Producer series · Drop 001
            </div>
            <h2 className="font-hand text-5xl sm:text-6xl text-brand -rotate-2">MODERN ARMOR</h2>
            <p className="font-hand text-3xl text-white italic">Created for your sound.</p>
            <p className="text-muted text-base max-w-xl leading-relaxed">
              The next generation of producer instrumentals — engineered for comfort, contrast and
              bold individuality. Mix-ready, stem-tracked, instantly licensable.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/catalog" className="btn-outline px-8 py-4">
                <Music2 className="w-5 h-5" /> Explore the collection
              </Link>
              <Link to="/licensing" className="text-sm text-muted hover:text-brand underline underline-offset-4">
                View license pricing
              </Link>
            </div>
          </div>

          {/* Center vinyl */}
          <div className="lg:col-span-4 flex items-center justify-center relative py-10">
            <div className="absolute w-96 h-96 bg-brand/25 rounded-full blur-3xl -z-10 animate-pulse-glow" />
            <VinylRecord spinning={current?.audio_url ? isPlaying : false} />
          </div>

          {/* Right rail: exclusive widgets */}
          <div className="lg:col-span-3 space-y-5">
            <div className="glass p-5 rounded-2xl border border-line card-hover space-y-1.5">
              <span className="font-mono text-[10px] tracking-[0.25em] text-brand font-bold uppercase">
                Limited pre-orders
              </span>
              <h4 className="font-bold text-lg leading-tight">CUTTING-EDGE SOUND, RELEASED IN DROPS</h4>
              <p className="text-xs text-muted leading-relaxed">
                Pre-order the catalog drop now and unlock exclusive pricing this month.
              </p>
            </div>

            {featured && (
              <button
                onClick={() => play(featured)}
                className="w-full glass p-5 rounded-2xl border border-brand/40 card-hover text-left group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={featured.cover_url}
                    alt={featured.title}
                    className="w-14 h-14 rounded-xl object-cover border border-line shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand font-mono">
                      This month's exclusive
                    </span>
                    <h4 className="font-bold truncate">{featured.title}</h4>
                    <p className="text-[11px] text-muted">
                      {featured.bpm} BPM • {featured.key_root}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted mb-3">
                  Pre-order now and unlock exclusive pricing this month.
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand group-hover:gap-2.5 transition-all">
                  <Eye className="w-3.5 h-3.5" /> See more info
                </span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ============ LIGHT: Resynth_lab SaaS hero ============ */}
      <section className="dark:hidden relative grid lg:grid-cols-2 min-h-[80vh] border-b border-line/40">
        {/* Left content */}
        <div className="flex items-center px-6 sm:px-12 lg:px-16 py-16">
          <div className="max-w-xl animate-fade-in">
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-brand mb-6">
              V808 Records · Audio licensing platform
            </p>
            <h1 className="font-serif2 text-5xl sm:text-6xl leading-[1.02] text-ink font-medium">
              Infuse your tracks with life:{' '}
              <em className="italic text-brand">simply add sound.</em>
            </h1>
            <p className="text-muted text-lg mt-6 leading-relaxed">
              Access the studio's hand-curated catalog of mix-ready beats, premium stems and
              instant, legally binding licenses.
            </p>
            <div className="flex items-center gap-4 mt-8">
              <Link to="/catalog" className="btn-primary px-8 py-4 text-sm">
                <Music2 className="w-5 h-5" /> Browse catalog free
              </Link>
              <Link to="/licensing" className="text-sm font-semibold text-ink hover:text-brand">
                How licensing works
              </Link>
            </div>

            {/* Reviews */}
            <div className="mt-12 space-y-4">
              {reviews.map((r, i) => (
                <Testimonial key={r.name} {...r} delay={i * 80} />
              ))}
            </div>
          </div>
        </div>

        {/* Right neon visual */}
        <div className="relative overflow-hidden neon-gradient">
          <div className="absolute inset-0 flex items-end justify-center gap-1 px-10 pb-10">
            {Array.from({ length: 36 }).map((_, i) => (
              <div
                key={i}
                className="w-2.5 bg-white/20 rounded-full animate-neon-wave"
                style={{
                  height: `${28 + ((i * 53) % 70)}%`,
                  animationDelay: `${(i * 0.07).toFixed(2)}s`,
                  animationDuration: `${1.2 + (i % 5) * 0.2}s`,
                }}
              />
            ))}
          </div>

          <PhoneMockup featured={featured} />

          <div className="absolute bottom-5 left-6 right-6 flex items-center justify-between text-white/90 text-xs font-mono uppercase tracking-[0.25em]">
            <span>Made for modern storytellers</span>
            <Share2 className="w-4 h-4" />
          </div>
        </div>
      </section>

      {/* ============ Catalog grid ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold uppercase tracking-tight">
              Explore the <span className="text-brand">vault</span>
            </h2>
            <p className="text-muted text-sm mt-1">
              Tap preview to stream in high fidelity. Every track licenses instantly.
            </p>
          </div>
          <p className="text-xs text-muted font-mono">
            SHOWING <span className="text-brand font-bold">{published.length}</span> PRODUCER TRACKS
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recent.map((beat) => (
            <BeatCard key={beat.id} beat={beat} onBuy={setCheckoutBeat} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/catalog" className="btn-ghost px-8 py-3.5">
            Browse full catalog
          </Link>
        </div>
      </section>

      <CheckoutModal beat={checkoutBeat} onClose={() => setCheckoutBeat(null)} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Dark — spinning vinyl centerpiece                                    */
/* ------------------------------------------------------------------ */
function VinylRecord({ spinning }: { spinning: boolean }) {
  return (
    <div className="relative animate-float group cursor-pointer" title="Press play">
      <svg
        viewBox="0 0 220 220"
        className={`w-72 sm:w-80 h-auto drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)] ${spinning ? 'animate-[spin_6s_linear_infinite]' : ''}`}
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
        <text x="110" y="122" textAnchor="middle" fontSize="5" fill="rgba(255,255,255,0.6)" fontFamily="monospace">
          RECORDS · DROP 001
        </text>
        <circle cx="110" cy="110" r="6" fill="#06060a" />
      </svg>
      {spinning && (
        <span className="absolute inset-0 rounded-full bg-brand/20 blur-2xl pointer-events-none animate-pulse" />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Light — reviews                                                      */
/* ------------------------------------------------------------------ */
const reviews = [
  {
    name: 'Martin Westervelt',
    role: 'R&B artist producer',
    quote:
      'This is just a fantastic platform. It saves a lot of my personal time — stems arrive instantly! Thank you!',
    img: 'https://i.pravatar.cc/80?img=12',
  },
  {
    name: 'Keisha Rawlins',
    role: 'Indie filmmaker',
    quote:
      'The auto-license PDF is a game changer. Every sync placement is now documented and signed.',
    img: 'https://i.pravatar.cc/80?img=47',
  },
  {
    name: 'Dara Osei',
    role: 'A&R, independent label',
    quote:
      'Consistently mix-ready beats. The exclusive tier gives us clean masters and full ownership.',
    img: 'https://i.pravatar.cc/80?img=68',
  },
] as const

function Testimonial({
  name,
  role,
  quote,
  img,
  delay,
}: {
  name: string
  role: string
  quote: string
  img: string
  delay: number
}) {
  return (
    <figure
      className="flex items-start gap-4 bg-white text-ink rounded-2xl border border-black/5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-4 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <img src={img} alt={name} className="w-10 h-10 rounded-full object-cover shrink-0" loading="lazy" />
      <div>
        <Quote className="w-4 h-4 text-brand/40 mb-1" />
        <blockquote className="text-sm leading-relaxed text-ink/90">{quote}</blockquote>
        <figcaption className="text-xs mt-1.5 text-muted">
          <span className="font-bold text-ink">{name}</span> · {role}
        </figcaption>
      </div>
    </figure>
  )
}

/* ------------------------------------------------------------------ */
/* Light — phone mockup                                                */
/* ------------------------------------------------------------------ */
function PhoneMockup({ featured }: { featured?: Beat }) {
  const { current, isPlaying, play } = usePlayer()
  const active = featured
  const nowPlaying = current ?? active

  return (
    <div className="absolute inset-0 flex items-center justify-center px-6 pointer-events-none">
      <div className="pointer-events-auto w-72 bg-white rounded-[2rem] shadow-2xl shadow-black/30 p-5 border border-black/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
          </div>
          <span className="text-[10px] font-mono text-muted">V808 PLAYER</span>
        </div>

        <div className="aspect-square rounded-xl overflow-hidden mb-4 relative">
          <img
            src={nowPlaying?.cover_url}
            alt={nowPlaying?.title ?? 'Cover'}
            className="w-full h-full object-cover"
          />
          <span className="absolute top-2 left-2 bg-black/70 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-full font-mono">
            {nowPlaying?.genre}
          </span>
        </div>

        <h4 className="font-bold text-ink truncate">{nowPlaying?.title ?? 'Select a track'}</h4>
        <p className="text-[11px] text-muted font-mono">
          {nowPlaying?.bpm} BPM • {nowPlaying?.key_root}
        </p>

        <div className="flex items-center gap-1 h-10 my-3">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-full bg-gradient-to-t from-neon-blue via-neon-pink to-neon-orange"
              style={{ height: `${25 + ((i * 41) % 65)}%`, opacity: 0.85 }}
            />
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {['Dark 808s', 'Melodic', 'Cinematic'].map((tag) => (
              <span key={tag} className="text-[10px] font-semibold bg-black/5 text-ink/80 rounded-full px-2 py-1">
                {tag}
              </span>
            ))}
          </div>
          <button
            onClick={() => featured && play(featured)}
            className="w-10 h-10 rounded-full bg-ink text-white flex items-center justify-center shrink-0"
            aria-label="Play"
          >
            {current && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>
        </div>
      </div>
    </div>
  )
}