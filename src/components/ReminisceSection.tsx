import { ArrowRight, Disc3, Film, Headphones, Pause, Play, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { REMINISCE_EP, REMINISCE_TRACKS } from '../lib/seed'
import { usePlayer } from '../context/PlayerContext'

export default function ReminisceSection({
  showFullRoomLink = false,
}: {
  showFullRoomLink?: boolean
}) {
  const { current, isPlaying, playQueue } = usePlayer()

  const activeEpTrack = REMINISCE_TRACKS.find((t) => t.id === current?.id)
  const isEpPlaying = Boolean(activeEpTrack && isPlaying)
  const playableTracks = REMINISCE_TRACKS.filter((t) => Boolean(t.audio_url))

  const handleToggleEp = () => {
    if (activeEpTrack) {
      const idx = REMINISCE_TRACKS.findIndex((t) => t.id === activeEpTrack.id)
      playQueue(REMINISCE_TRACKS, idx >= 0 ? idx : 0)
    } else {
      playQueue(REMINISCE_TRACKS, 0)
    }
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="relative overflow-hidden rounded-3xl border border-line bg-surface/90 dark:bg-card/85 shadow-xl p-6 sm:p-10">
        {/* Subtle ambient glow matching the Reminisce cover palette */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-copper/15 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-neon-blue/15 rounded-full blur-[110px] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left column: Cover art + EP metadata + Play EP CTA */}
          <div className="lg:col-span-5 space-y-5">
            <div className="relative aspect-square rounded-2xl overflow-hidden border border-line shadow-2xl group">
              <img
                src={REMINISCE_EP.coverUrl}
                alt={`${REMINISCE_EP.title} EP cover`}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 bg-black/80 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-mono font-bold text-copper border border-copper/30 uppercase tracking-wider">
                Not for sale · Listening party
              </span>
              {isEpPlaying && (
                <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur rounded-xl px-3 py-2 flex items-center justify-between border border-white/10">
                  <span className="text-[11px] font-mono text-white truncate">
                    Now spinning: <strong className="text-copper">{activeEpTrack?.title}</strong>
                  </span>
                  <span className="flex items-end gap-0.5 h-3.5 shrink-0">
                    {[60, 100, 75, 90].map((h, i) => (
                      <span
                        key={i}
                        className="w-1 bg-copper rounded-full animate-pulse"
                        style={{ height: `${h}%`, animationDelay: `${i * 120}ms` }}
                      />
                    ))}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 bg-card rounded-2xl border border-line p-4 text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase text-muted block">Artist</span>
                <span className="font-bold text-ink">{REMINISCE_EP.artist}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-muted block">Album</span>
                <span className="font-bold text-ink">{REMINISCE_EP.title} ({REMINISCE_EP.released})</span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-muted block">Genre</span>
                <span className="font-bold text-ink">{REMINISCE_EP.genre} 🇪🇹</span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-muted block">Channel</span>
                <span className="font-mono font-bold text-copper-ink">{REMINISCE_EP.channel}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleToggleEp}
                className="btn-primary flex-1 py-3.5 px-6 text-sm"
              >
                {isEpPlaying ? (
                  <>
                    <Pause className="w-4 h-4" /> Pause Listening Party
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" /> Play Reminisce EP ({playableTracks.length} tracks)
                  </>
                )}
              </button>
              {showFullRoomLink && (
                <Link
                  to="/listening-party"
                  className="btn-ghost px-5 py-3.5 text-xs whitespace-nowrap"
                >
                  <Headphones className="w-4 h-4 text-copper-ink" /> Listening room
                </Link>
              )}
            </div>
          </div>

          {/* Right column: Tracklist + Score inquiry banner */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="font-mono text-xs uppercase tracking-[0.22em] text-copper-ink font-bold flex items-center gap-1.5">
                  <Disc3 className="w-4 h-4" /> Cultural EP Showcase · Archive
                </span>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-card border border-line text-muted">
                  Stream Only · Not For Sale
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-display font-extrabold uppercase tracking-tight text-ink">
                Reminisce <span className="text-copper">EP</span>
              </h2>
              <p className="text-sm text-muted mt-2 leading-relaxed max-w-2xl">
                {REMINISCE_EP.subtitle}
              </p>
            </div>

            {/* 7-track EP list */}
            <div className="space-y-2">
              {REMINISCE_TRACKS.map((track, idx) => {
                const isSelected = current?.id === track.id
                const isTrackPlaying = isSelected && isPlaying
                const playable = Boolean(track.audio_url)

                return (
                  <button
                    key={track.id}
                    type="button"
                    disabled={!playable}
                    onClick={() => playable && playQueue(REMINISCE_TRACKS, idx)}
                    className={`w-full flex items-center justify-between gap-4 rounded-xl px-4 py-3 border text-left transition-all ${
                      !playable
                        ? 'bg-card/40 border-line/50 opacity-60 cursor-not-allowed'
                        : isSelected
                          ? 'bg-copper/10 border-copper shadow-sm'
                          : 'bg-card hover:border-copper/50 border-line'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                          isSelected
                            ? 'bg-brand text-btn'
                            : 'bg-surface border border-line text-muted'
                        }`}
                      >
                        {isTrackPlaying ? (
                          <Pause className="w-3.5 h-3.5" />
                        ) : playable ? (
                          <Play className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          String(track.trackNumber ?? idx + 1).padStart(2, '0')
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-ink truncate">
                          <span className="font-mono text-xs text-muted mr-2">
                            {String(track.trackNumber ?? idx + 1).padStart(2, '0')}
                          </span>
                          {track.artist} – {track.title}
                        </p>
                        <p className="text-[11px] text-muted truncate">{track.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="hidden sm:inline text-[11px] font-mono text-muted">
                        {track.bpm} BPM
                      </span>
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                          playable
                            ? 'bg-copper/15 text-copper-ink'
                            : 'bg-line/70 text-muted'
                        }`}
                      >
                        {playable ? 'Listen' : 'Pending'}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Score & Custom Project Inquiry Callout */}
            <div className="rounded-2xl bg-card border border-copper/35 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-copper-ink font-bold flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5" /> Film, Documentary &amp; Cultural Score Inquiries
                </span>
                <p className="text-xs text-muted leading-relaxed">
                  Want original Ethiopian cultural fusion, cinematic scoring, or custom EP
                  production like <strong className="text-ink">Reminisce</strong> for your project?
                </p>
              </div>
              <Link
                to="/services?service=custom_production&ref=reminisce-ep"
                className="btn-primary px-5 py-3 text-xs whitespace-nowrap shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" /> Inquire for Scores <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
