import Sidebar from '../shared/Sidebar'
import { LayoutDashboard, FolderOpen, Search, User, Briefcase } from 'lucide-react'

const navItems = [
  { to: '/student', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/student/projects', icon: Search, label: 'Browse Projects' },
  { to: '/student/my-project', icon: Briefcase, label: 'My Project' },
  { to: '/student/profile', icon: User, label: 'My Profile' },
]

export default function StudentLayout({ children, title, subtitle }) {
  return (
    <div className="flex min-h-screen bg-void bg-grid-pattern bg-grid">
      <Sidebar navItems={navItems} role="student" />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">
          {(title || subtitle) && (
            <div className="mb-8">
              {title && <h1 className="font-display font-bold text-2xl text-text-primary">{title}</h1>}
              {subtitle && <p className="font-body text-text-secondary text-sm mt-1">{subtitle}</p>}
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  )
}
