import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Music2, Pause, Play, Quote, Share2 } from 'lucide-react'
import { useCatalog } from '../context/CatalogContext'
import { usePlayer } from '../context/PlayerContext'
import BeatCard from '../components/BeatCard'
import CheckoutModal from '../components/CheckoutModal'
import type { Beat } from '../types'

export default function Home() {
  const { beats } = useCatalog()
  const [checkoutBeat, setCheckoutBeat] = useState<Beat | null>(null)

  const published = useMemo(() => beats.filter((b) => b.is_published), [beats])
  const featured = published[0]
  const recent = published.slice(0, 9)

  return (
    <div className="animate-fade-in">
      {/* ============ Hero (light & dark) ============ */}
      <section className="relative grid lg:grid-cols-2 min-h-[80vh] border-b border-line/40">
        {/* Left content */}
        <div className="flex items-center justify-center lg:justify-end px-6 sm:px-12 lg:pl-16 lg:pr-8 xl:pl-24 xl:pr-10 2xl:pr-14 py-16">
          <div className="w-full max-w-xl animate-fade-in">
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-copper-ink font-semibold mb-6">
              V808 Records · Audio licensing platform
            </p>
            <h1 className="font-serif2 text-5xl sm:text-6xl leading-[1.02] text-ink font-medium">
              Infuse your tracks with life:{' '}
              <em className="italic text-copper">simply add sound.</em>
            </h1>
            <p className="text-muted text-lg mt-6 leading-relaxed">
              Access the studio's hand-curated catalog of mix-ready beats, premium stems and
              instant, legally binding licenses.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-8">
              <Link to="/catalog" className="btn-primary px-8 py-4 text-sm">
                <Music2 className="w-5 h-5" /> Browse catalog free
              </Link>
              <Link to="/licensing" className="text-sm font-semibold text-ink hover:text-copper-ink transition-colors">
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
        <div className="relative min-h-[460px] lg:min-h-0 overflow-hidden neon-gradient">
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
            SHOWING <span className="text-copper-ink font-bold">{published.length}</span> PRODUCER TRACKS
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
/* Reviews                                                             */
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
      className="flex items-start gap-4 bg-card text-ink rounded-2xl border border-line/80 shadow-[0_1px_4px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)] p-4 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <img src={img} alt={name} className="w-10 h-10 rounded-full object-cover shrink-0" loading="lazy" />
      <div>
        <Quote className="w-4 h-4 text-copper/70 mb-1" />
        <blockquote className="text-sm leading-relaxed text-ink/90">{quote}</blockquote>
        <figcaption className="text-xs mt-1.5 text-muted">
          <span className="font-bold text-ink">{name}</span> · {role}
        </figcaption>
      </div>
    </figure>
  )
}

/* ------------------------------------------------------------------ */
/* Phone mockup                                                        */
/* ------------------------------------------------------------------ */
function PhoneMockup({ featured }: { featured?: Beat }) {
  const { current, isPlaying, play } = usePlayer()
  const nowPlaying = current ?? featured

  return (
    <div className="absolute inset-0 flex items-center justify-center px-6 pointer-events-none">
      <div className="pointer-events-auto w-72 bg-surface text-ink rounded-[2rem] shadow-2xl shadow-black/30 p-5 border border-line/70 dark:border-white/10">
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
              <span key={tag} className="text-[10px] font-semibold bg-ink/5 text-ink/80 rounded-full px-2 py-1">
                {tag}
              </span>
            ))}
          </div>
          <button
            onClick={() => nowPlaying && play(nowPlaying)}
            className="w-10 h-10 rounded-full bg-[#12121A] text-copper border border-copper/30 flex items-center justify-center shrink-0 hover:scale-105 transition-transform"
            aria-label="Play"
          >
            {current && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>
        </div>
      </div>
    </div>
  )
}