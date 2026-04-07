import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Briefcase, Search, Star, Clock, CheckCircle, Circle, AlertCircle } from 'lucide-react'
import StudentLayout from '../../components/student/StudentLayout'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'

export default function StudentDashboard() {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState({ applied: 0, allocated: null, available: 0 })
  const [recentProjects, setRecentProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchData()
  }, [user])

  const fetchData = async () => {
    const [applicationsRes, allocatedRes, projectsRes] = await Promise.all([
      supabase.from('applications').select('id', { count: 'exact' }).eq('student_id', user.id),
      supabase.from('applications').select('*, projects(*)').eq('student_id', user.id).eq('status', 'accepted').single(),
      supabase.from('projects').select('*').eq('status', 'open').order('created_at', { ascending: false }).limit(4),
    ])
    setStats({
      applied: applicationsRes.count || 0,
      allocated: allocatedRes.data,
      available: projectsRes.data?.length || 0,
    })
    setRecentProjects(projectsRes.data || [])
    setLoading(false)
  }

  const progressColor = (p) => p >= 75 ? 'bg-emerald-accent' : p >= 40 ? 'bg-amber-accent' : 'bg-accent'

  return (
    <StudentLayout
      title={`Hello, ${profile?.name?.split(' ')[0] || 'Student'} 👋`}
      subtitle="Here's your project overview"
    >
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Applications Sent', value: stats.applied, icon: Star, color: 'text-accent-glow', bg: 'bg-accent/10', border: 'border-accent/20' },
          { label: 'Allocated Project', value: stats.allocated ? '1 Active' : 'None yet', icon: Briefcase, color: 'text-emerald-400', bg: 'bg-emerald-accent/10', border: 'border-emerald-accent/20' },
          { label: 'Open Projects', value: stats.available + '+', icon: Search, color: 'text-amber-400', bg: 'bg-amber-accent/10', border: 'border-amber-accent/20' },
        ].map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label} className="card">
            <div className={`w-9 h-9 ${bg} border ${border} rounded-lg flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="font-display font-bold text-2xl text-text-primary">{value}</p>
            <p className="font-body text-text-secondary text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Allocated project */}
      {stats.allocated && (
        <div className="card border-accent/20 mb-6" style={{ background: 'rgba(99,102,241,0.04)' }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="tag tag-accent mb-2">Active Project</div>
              <h3 className="font-display font-semibold text-text-primary">{stats.allocated.projects?.title}</h3>
              <p className="font-body text-text-secondary text-sm mt-1">{stats.allocated.projects?.domain}</p>
            </div>
            <Link to="/student/my-project" className="btn-ghost text-xs px-3 py-2">
              View <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div>
            <div className="flex justify-between text-xs font-mono text-text-muted mb-2">
              <span>Progress</span>
              <span>{stats.allocated.projects?.progress || 0}%</span>
            </div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${progressColor(stats.allocated.projects?.progress || 0)}`}
                style={{ width: `${stats.allocated.projects?.progress || 0}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Quicklinks if no project */}
      {!stats.allocated && (
        <div className="card border-dashed border-border mb-6 flex flex-col items-center py-8 text-center">
          <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center mb-3">
            <Briefcase className="w-5 h-5 text-accent-glow" />
          </div>
          <p className="font-display font-semibold text-text-primary mb-1">No project allocated yet</p>
          <p className="font-body text-text-secondary text-sm mb-4">Browse open projects and apply with your skills</p>
          <Link to="/student/projects" className="btn-primary text-sm">
            Browse Projects <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Recent projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-text-primary">Open Projects</h2>
          <Link to="/student/projects" className="text-accent-glow text-sm font-body hover:text-accent transition-colors flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid gap-3">
          {recentProjects.map(project => (
            <div key={project.id} className="card glass-hover flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-body font-medium text-text-primary text-sm truncate">{project.title}</h3>
                  <span className="tag tag-emerald shrink-0">{project.domain}</span>
                </div>
                <p className="font-body text-text-muted text-xs truncate">{project.description}</p>
              </div>
              <Link to="/student/projects" className="btn-ghost text-xs px-3 py-2 ml-3 shrink-0">Apply</Link>
            </div>
          ))}
        </div>
      </div>

      {/* Profile reminder */}
      {!profile?.skills?.length && (
        <div className="mt-6 flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-accent/5 border border-amber-accent/20">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="font-body text-amber-400/80 text-sm flex-1">Complete your profile to get better project recommendations.</p>
          <Link to="/student/profile" className="text-amber-400 text-sm font-medium hover:text-amber-300 transition-colors shrink-0">Update →</Link>
        </div>
      )}
    </StudentLayout>
  )
}
