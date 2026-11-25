import {
  LogIn,
  LogOut,
  Menu,
  Moon,
  Music2,
  ShieldCheck,
  ShoppingBag,
  Sun,
  User,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useCatalog } from '../context/CatalogContext'

const links = [
  { to: '/catalog', label: 'Catalog' },
  { to: '/services', label: 'Services' },
  { to: '/licensing', label: 'Licensing' },
  { to: '/about', label: 'About Me' },
]

export default function Navbar() {
  const { theme, toggle } = useTheme()
  const { user, profile, isAdmin, signOut } = useAuth()
  const { purchased } = useCatalog()
  const [open, setOpen] = useState(false)

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap transition-colors hover:text-copper-ink ${
      isActive ? 'text-copper-ink font-semibold' : 'text-ink/80'
    }`

  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-line/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <img
            src="/logo.jpg"
            alt="V808 Records logo"
            className="w-11 h-11 rounded-xl object-cover shadow-md border border-line/60 group-hover:scale-105 transition-transform shrink-0"
          />
          <div>
            <span className="font-display font-extrabold text-2xl tracking-wide text-ink">
              V808<span className="text-copper">RECORDS</span>
            </span>
            <span className="text-[10px] tracking-widest text-muted block font-mono -mt-1">
              SOUNDS BY PRODUCER
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 lg:gap-8 font-medium text-sm">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={navClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="p-2.5 rounded-xl bg-card hover:bg-line border border-line text-ink transition-all"
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <Link
            to="/library"
            className="relative p-2.5 rounded-xl bg-card hover:bg-line border border-line text-ink transition-all"
            aria-label="My library"
          >
            <ShoppingBag className="w-5 h-5" />
            {purchased.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-copper text-white text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-bg">
                {purchased.length}
              </span>
            )}
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card hover:bg-line border border-line text-sm font-semibold text-ink transition-all hover:border-brand/50"
            >
              <ShieldCheck className="w-4 h-4 text-brand" />
              Admin
            </Link>
          )}

          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <span className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-line text-sm text-ink max-w-[160px]">
                <User className="w-4 h-4 text-brand shrink-0" />
                <span className="truncate">{profile?.full_name || user.email}</span>
              </span>
              <button
                onClick={signOut}
                className="p-2.5 rounded-xl bg-card hover:bg-line border border-line text-ink"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-line bg-card text-sm font-semibold text-ink hover:border-brand/60 whitespace-nowrap shrink-0"
            >
              <LogIn className="w-4 h-4" />
              Sign in
            </Link>
          )}

          <Link to="/catalog" className="hidden md:inline-flex btn-primary px-5 py-2.5 text-sm whitespace-nowrap shrink-0">
            <Music2 className="w-4 h-4" /> Browse beats
          </Link>

          <button
            className="md:hidden p-2.5 rounded-xl bg-card border border-line"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-line/60 px-4 py-4 space-y-3 bg-surface">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block text-ink/90 hover:text-brand"
            >
              {l.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink to="/admin" onClick={() => setOpen(false)} className="block text-brand">
              Admin Dashboard
            </NavLink>
          )}
          <NavLink
            to={user ? '/library' : '/login'}
            onClick={() => setOpen(false)}
            className="block text-ink/90"
          >
            {user ? 'My Library' : 'Sign in / Sign up'}
          </NavLink>
        </div>
      )}
    </header>
  )
}