import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Layers, LogOut } from 'lucide-react'
import { signOut } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

export default function Sidebar({ navItems, role }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { profile } = useAuth()

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col bg-panel border-r border-border">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
        <div className="w-7 h-7 bg-accent rounded-md flex items-center justify-center">
          <Layers className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="font-display font-bold text-text-primary">ProjectHub</span>
      </div>

      {/* Role badge */}
      <div className="px-5 py-3 border-b border-border">
        <span className={`tag ${role === 'faculty' ? 'tag-emerald' : 'tag-accent'}`}>
          {role === 'faculty' ? '⚡ Faculty' : '🎓 Student'}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to || (to !== '/student' && to !== '/faculty' && location.pathname.startsWith(to))
          return (
            <Link key={to} to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-all duration-150 ${
                active
                  ? 'bg-accent/15 text-accent-glow border border-accent/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              }`}>
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Profile + Logout */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent-glow font-display font-bold text-sm">
            {profile?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body text-text-primary text-sm font-medium truncate">{profile?.name || 'User'}</p>
            <p className="font-mono text-text-muted text-xs truncate">{profile?.department || ''}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-text-muted hover:text-rose-400 hover:bg-rose-accent/5 transition-all text-sm font-body">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  )
}
