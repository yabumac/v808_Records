import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Disc3, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error } = await signUp(email, password, fullName)
    setBusy(false)
    if (error) setError(error)
    else navigate('/', { replace: true })
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md glass rounded-3xl border border-line p-8 animate-scale-in">
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand to-accent flex items-center justify-center shadow-lg">
            <Disc3 className="w-7 h-7 text-white" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-display font-extrabold uppercase tracking-tight">
              Create account
            </h2>
            <p className="text-xs text-muted">Track purchases and licenses in one place</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-ink/80 uppercase mb-1">
              Full name (stage name)
            </label>
            <input
              className="input"
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </div>

          {error && (
            <p className="text-xs text-brand bg-brand/10 border border-brand/30 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <button type="submit" disabled={busy} className="btn-primary w-full py-3.5 text-sm">
            <UserPlus className="w-4 h-4" /> {busy ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <p className="text-xs text-muted text-center mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-brand hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}