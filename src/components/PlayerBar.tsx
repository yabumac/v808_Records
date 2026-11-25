import { Pause, Play, SkipBack, SkipForward, Volume2 } from 'lucide-react'
import { usePlayer } from '../context/PlayerContext'
import { useNavigate } from 'react-router-dom'

function fmt(s: number) {
  if (!isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec < 10 ? '0' : ''}${sec}`
}

export default function PlayerBar() {
  const {
    current,
    queue,
    isPlaying,
    currentTime,
    duration,
    volume,
    toggle,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
  } = usePlayer()
  const navigate = useNavigate()

  const progress = duration ? currentTime / duration : 0
  const bars = 48

  if (!current) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 glass border-t border-line/70 px-4 sm:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3 w-full md:w-1/4">
        <img
          src={current.cover_url}
          alt={current.title}
          className="w-12 h-12 rounded-xl object-cover border border-line shrink-0"
        />
        <div className="overflow-hidden">
          <h4 className="text-sm font-bold text-ink truncate">{current.title}</h4>
          <div className="flex items-center gap-2 text-xs text-muted">
            <span>{current.bpm} BPM</span> • <span>{current.key_root}</span>
            <span className="bg-copper/15 text-copper-ink border border-copper/30 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">
              {current.showcaseOnly ? 'LISTENING PARTY' : 'PREVIEW'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full max-w-xl flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-3">
          {queue.length > 1 && (
            <button
              onClick={prevTrack}
              className="p-1.5 rounded-lg text-muted hover:text-ink transition-colors"
              aria-label="Previous track"
            >
              <SkipBack className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={toggle}
            className="w-10 h-10 rounded-full bg-brand text-btn flex items-center justify-center shadow-lg shadow-brand/30 hover:scale-105 transition-transform"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
          </button>
          {queue.length > 1 && (
            <button
              onClick={nextTrack}
              className="p-1.5 rounded-lg text-muted hover:text-ink transition-colors"
              aria-label="Next track"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          )}
        </div>

        <div
          className="w-full flex items-center gap-1 h-8 cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            seek((e.clientX - rect.left) / rect.width)
          }}
        >
          {Array.from({ length: bars }).map((_, i) => {
            const active = i / bars <= progress
            const h = 25 + ((i * 37) % 65)
            return (
              <div
                key={i}
                className={`flex-1 rounded-full transition-colors ${active ? 'bg-brand' : 'bg-line'}`}
                style={{ height: `${h}%` }}
              />
            )
          })}
        </div>

        <div className="flex justify-between w-full text-[10px] font-mono text-muted">
          <span>{fmt(currentTime)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>

      <div className="hidden md:flex items-center justify-end gap-4 w-1/4">
        <Volume2 className="w-4 h-4 text-muted" />
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-20 accent-brand"
        />
        {current.showcaseOnly ? (
          <button
            onClick={() => navigate('/services?service=custom_production&ref=reminisce-ep')}
            className="px-4 py-2 rounded-xl bg-brand hover:bg-brand-hover text-btn text-xs font-bold shadow-lg transition-all whitespace-nowrap"
          >
            Inquire for Score
          </button>
        ) : (
          <button
            onClick={() => navigate(`/beat/${current.id}`)}
            className="px-4 py-2 rounded-xl bg-brand hover:bg-brand-hover text-btn text-xs font-bold shadow-lg transition-all whitespace-nowrap"
          >
            Buy License (${current.price})
          </button>
        )}
      </div>
    </div>
  )
}
