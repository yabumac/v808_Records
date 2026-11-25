import { Pause, Play, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Beat } from '../types'
import { usePlayer } from '../context/PlayerContext'

interface BeatCardProps {
  beat: Beat
  onBuy: (beat: Beat) => void
}

export default function BeatCard({ beat, onBuy }: BeatCardProps) {
  const { current, isPlaying, play } = usePlayer()
  const isCurrent = current?.id === beat.id && isPlaying

  return (
    <div className="glass rounded-2xl p-4 flex flex-col justify-between card-hover animate-fade-in">
      <div>
        <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-4 group">
          <img
            src={beat.cover_url}
            alt={beat.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={() => play(beat)}
              className="w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
              aria-label={isCurrent ? 'Pause' : 'Play'}
            >
              {isCurrent ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            </button>
          </div>
          <span className="absolute top-3 left-3 bg-black/70 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold text-brand">
            {beat.genre}
          </span>
        </div>

        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <Link
              to={`/beat/${beat.id}`}
              className="font-bold text-ink text-base truncate block hover:text-brand transition-colors"
            >
              {beat.title}
            </Link>
            <p className="text-xs text-muted font-mono">
              {beat.bpm} BPM • {beat.key_root}
            </p>
          </div>
          <span className="text-lg font-extrabold text-ink">${beat.price}</span>
        </div>
      </div>

      <div className="pt-4 border-t border-line/50 flex items-center justify-between gap-3 mt-3">
        <button
          onClick={() => play(beat)}
          className="px-3.5 py-2 rounded-xl bg-card hover:bg-line text-xs text-ink font-semibold flex items-center gap-1.5 transition-all"
        >
          {isCurrent ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          {isCurrent ? 'Pause' : 'Preview'}
        </button>
        <button
          onClick={() => onBuy(beat)}
          className="flex-1 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-lg shadow-brand/20 transition-all flex items-center justify-center gap-1.5"
        >
          <ShoppingCart className="w-3.5 h-3.5" /> Buy / License
        </button>
      </div>
    </div>
  )
}
