import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const from = (location.state as { from?: string } | null)?.from ?? '/'

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
            <h2 className="text-2xl font-display font-extrabold uppercase tracking-tight">
              Welcome back
            </h2>
            <p className="text-xs text-muted">Sign in to sync your library & licenses</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-ink/80 uppercase mb-1">Email</label>
            <input
              className="input"
              type="email"
              required
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-xs text-brand bg-brand/10 border border-brand/30 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <button type="submit" disabled={busy} className="btn-primary w-full py-3.5 text-sm">
            <LogIn className="w-4 h-4" /> {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-xs text-muted text-center mt-5">
          New here?{' '}
          <Link to="/register" className="text-brand hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}