import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShieldCheck, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'
import GoogleButton from '../components/GoogleButton'

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const from = (location.state as { from?: string } | null)?.from ?? '/catalog'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setNotice(null)
    const { error } = await signUp(email, password, fullName)
    setBusy(false)
    if (error) {
      setError(error)
    } else {
      setNotice('Account created! Check your inbox to verify your email, or continue if auto-confirmed.')
      setTimeout(() => navigate(from, { replace: true }), 1200)
    }
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
              Create account
            </h2>
            <p className="text-xs text-muted">
              Required to buy licenses, sync downloads & protect receipts
            </p>
          </div>
        </div>

        <GoogleButton redirectPath={from} onError={setError} />

        <div className="relative my-5 flex items-center">
          <div className="flex-1 border-t border-line" />
          <span className="px-3 text-[11px] font-mono uppercase text-muted">or sign up with email</span>
          <div className="flex-1 border-t border-line" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-ink/80 uppercase mb-1">
              Full name (stage name)
            </label>
            <input
              className="input"
              required
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Young Producer"
            />
          </div>
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
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          {notice && (
            <p className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2">
              {notice}
            </p>
          )}

          {!isSupabaseConfigured && (
            <p className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Live account creation requires <code>VITE_SUPABASE_URL</code> and{' '}
                <code>VITE_SUPABASE_ANON_KEY</code>.
              </span>
            </p>
          )}

          <button type="submit" disabled={busy} className="btn-primary w-full py-3.5 text-sm">
            <UserPlus className="w-4 h-4" /> {busy ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <p className="text-xs text-muted text-center mt-5">
          Already have an account?{' '}
          <Link to="/login" state={{ from }} className="text-brand font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
