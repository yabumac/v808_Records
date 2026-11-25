import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Music2, Pause, Play } from 'lucide-react'
import { useCatalog } from '../context/CatalogContext'
import { usePlayer } from '../context/PlayerContext'
import CheckoutModal from '../components/CheckoutModal'
import type { Beat } from '../types'

export default function BeatDetail() {
  const { id } = useParams()
  const { beats } = useCatalog()
  const { current, isPlaying, play } = usePlayer()
  const [checkout, setCheckout] = useState<Beat | null>(null)

  const beat = beats.find((b) => b.id === id)

  if (!beat) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold mb-2">Beat not found</h2>
        <Link to="/catalog" className="text-brand hover:underline text-sm">
          Back to catalog
        </Link>
      </div>
    )
  }

  const isCurrent = current?.id === beat.id && isPlaying

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <Link
        to="/catalog"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-brand mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Back to catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        <div className="relative aspect-square rounded-3xl overflow-hidden border border-line shadow-2xl shadow-brand/10">
          <img src={beat.cover_url} alt={beat.title} className="w-full h-full object-cover" />
          <span className="absolute top-4 left-4 bg-black/70 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-mono font-bold text-brand">
            {beat.genre}
          </span>
        </div>

        <div className="space-y-5">
          <div>
            <span className="font-mono text-xs text-brand uppercase font-bold tracking-wider">
              Track detail
            </span>
            <h1 className="text-3xl sm:text-5xl font-display font-extrabold uppercase tracking-tight mt-1">
              {beat.title}
            </h1>
            <p className="font-mono text-sm text-muted mt-2">
              {beat.bpm} BPM • {beat.key_root} • $ {beat.price}
            </p>
          </div>

          <p className="text-muted leading-relaxed">
            {beat.description || 'Studio-grade catalog instrumental. Mix & mastered to -14 LUFS.'}
          </p>

          <div className="flex flex-wrap gap-2">
            {(beat.tags ?? []).map((t) => (
              <span key={t} className="chip bg-card border border-line text-muted">
                #{t}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <button onClick={() => play(beat)} className="btn-primary px-8 py-4">
              {isCurrent ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              {isCurrent ? 'Pause preview' : 'Preview beat'}
            </button>
            <button onClick={() => setCheckout(beat)} className="btn-ghost px-8 py-4">
              <Music2 className="w-5 h-5 text-brand" /> Buy license
            </button>
          </div>
        </div>
      </div>

      <CheckoutModal beat={checkout} onClose={() => setCheckout(null)} />
    </div>
  )
}