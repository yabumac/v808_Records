import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Profile } from '../types'

interface AuthContextValue {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (
    email: string,
    password: string,
    fullName?: string,
  ) => Promise<{ error: string | null }>
  signInWithGoogle: (redirectPath?: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setLoading(false)
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!supabase || !session?.user) {
      setProfile(null)
      return
    }
    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => setProfile((data as Profile) ?? null))
  }, [session?.user])

  const signIn: AuthContextValue['signIn'] = async (email, password) => {
    if (!supabase) {
      return {
        error:
          'Authentication requires Supabase keys (VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY).',
      }
    }
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || !password) return { error: 'Email and password are required.' }
    const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password })
    return { error: error?.message ?? null }
  }

  const signUp: AuthContextValue['signUp'] = async (email, password, fullName) => {
    if (!supabase) {
      return {
        error:
          'Registration requires Supabase keys (VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY).',
      }
    }
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || password.length < 8) {
      return { error: 'Use a valid email and a password of at least 8 characters.' }
    }
    const { error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { full_name: fullName?.trim() || '' },
        emailRedirectTo: `${window.location.origin}/catalog`,
      },
    })
    return { error: error?.message ?? null }
  }

  const signInWithGoogle: AuthContextValue['signInWithGoogle'] = async (redirectPath) => {
    if (!supabase) {
      return {
        error:
          'Google sign-in requires Supabase configuration (VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY).',
      }
    }
    const safePath =
      redirectPath && redirectPath.startsWith('/') && !redirectPath.startsWith('//')
        ? redirectPath
        : '/catalog'
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${safePath}`,
        queryParams: { access_type: 'offline', prompt: 'select_account' },
      },
    })
    return { error: error?.message ?? null }
  }

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut()
    setProfile(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        session,
        profile,
        loading,
        isAdmin: profile?.role === 'admin',
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
