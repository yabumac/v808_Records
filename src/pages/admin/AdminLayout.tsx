import { NavLink, Outlet } from 'react-router-dom'
import { BarChart3, Disc3, ShoppingBag, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const tabs = [
  { to: '/admin', label: 'Dashboard', icon: BarChart3, end: true },
  { to: '/admin/beats', label: 'Manage beats', icon: Disc3 },
  { to: '/admin/orders', label: 'License orders', icon: ShoppingBag },
]

export default function AdminLayout() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="font-mono text-xs text-brand uppercase font-bold tracking-wider">
            Producer portal
          </span>
          <h1 className="text-3xl font-display font-extrabold uppercase tracking-tight">
            Admin <span className="text-brand">panel</span>
          </h1>
        </div>
        <Link to="/" className="text-sm text-muted hover:text-brand flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Back to store
        </Link>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `chip whitespace-nowrap flex items-center gap-1.5 ${
                isActive
                  ? 'bg-brand text-white'
                  : 'bg-card hover:bg-line text-muted'
              }`
            }
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  )
}