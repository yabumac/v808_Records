import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import PlayerBar from './PlayerBar'

const tickerItems = [
  'YouTube',
  'TikTok',
  'Streaming',
  'Instagram',
  'Commercials',
  'Sync Licensing',
  'DJ Sets',
  'Film Scores',
]

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-40">
        <Outlet />
      </main>

      <footer className="border-t border-line/60 overflow-hidden">
        <div className="py-4 border-b border-line/50 bg-card/40">
          <div className="flex whitespace-nowrap animate-marquee font-mono text-xs uppercase tracking-[0.3em] text-muted">
            {[0, 1].map((dup) => (
              <span key={dup} className="flex shrink-0">
                {tickerItems.map((item) => (
                  <span key={`${dup}-${item}`} className="flex items-center gap-4 px-6">
                    <span className="text-copper">✦</span>
                    {item}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row justify-between gap-4 text-sm text-muted">
          <p>© {new Date().getFullYear()} V808 Records. All rights reserved.</p>
          <p className="font-mono text-xs">Mastered to -14 LUFS · Instant license delivery</p>
        </div>
      </footer>

      <PlayerBar />
    </div>
  )
}