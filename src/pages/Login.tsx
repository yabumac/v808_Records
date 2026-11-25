import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogIn, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'
import GoogleButton from '../components/GoogleButton'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const from = (location.state as { from?: string } | null)?.from ?? '/catalog'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error } = await signIn(email, password)
    setBusy(false)
    if (error) setError(error)
    else navigate(from, { replace: true })
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md glass rounded-3xl border border-line p-8 animate-scale-in">
        <div className="flex flex-col items-center gap-3 mb-6">
          <img
            src="/logo.jpg"
            alt="V808 Records"
            className="w-16 h-16 rounded-2xl object-cover shadow-lg border border-line/60"
          />
          <div className="text-center">
            <h2 className="text-2xl font-display font-extrabold uppercase tracking-tight text-ink">
              Welcome back
            </h2>
            <p className="text-xs text-muted">
              Sign in to buy beats, verify receipts & sync your licenses
            </p>
          </div>
        </div>

        <GoogleButton redirectPath={from} onError={setError} />

        <div className="relative my-5 flex items-center">
          <div className="flex-1 border-t border-line" />
          <span className="px-3 text-[11px] font-mono uppercase text-muted">or sign in with email</span>
          <div className="flex-1 border-t border-line" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-ink/80 uppercase mb-1">Email</label>
            <input
              className="input"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-ink/80 uppercase mb-1">Password</label>
            <input
              className="input"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          {!isSupabaseConfigured && (
            <p className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Live authentication requires <code>VITE_SUPABASE_URL</code> and{' '}
                <code>VITE_SUPABASE_ANON_KEY</code> in your environment.
              </span>
            </p>
          )}

          <button type="submit" disabled={busy} className="btn-primary w-full py-3.5 text-sm">
            <LogIn className="w-4 h-4" /> {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-xs text-muted text-center mt-5">
          New here?{' '}
          <Link to="/register" state={{ from }} className="text-brand font-semibold hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
