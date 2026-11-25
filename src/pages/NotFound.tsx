import { Link } from 'react-router-dom'
import { Disc3 } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
      <Disc3 className="w-20 h-20 text-line animate-pulse-glow rounded-full" />
      <h1 className="text-6xl font-display font-extrabold text-ink">404</h1>
      <p className="text-muted text-sm max-w-sm">
        This track has been taken off the shelf. Let’s get you back to the vault.
      </p>
      <Link to="/" className="btn-primary px-8 py-3.5">
        Back home
      </Link>
    </div>
  )
}