import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FolderOpen, Users, Clock, CheckCircle, ArrowRight, Plus, TrendingUp } from 'lucide-react'
import FacultyLayout from '../../components/faculty/FacultyLayout'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'

export default function FacultyDashboard() {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState({ projects: 0, applications: 0, allocated: 0, students: 0 })
  const [recentApps, setRecentApps] = useState([])
  const [myProjects, setMyProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) fetchData() }, [user])

  const fetchData = async () => {
    const [projectsRes, appsRes, allocatedRes] = await Promise.all([
      supabase.from('projects').select('*').eq('faculty_id', user.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('applications').select('*, student_profiles(name, department), projects(title)').eq('faculty_id', user.id).eq('status', 'pending').order('created_at', { ascending: false }).limit(5),
      supabase.from('applications').select('id', { count: 'exact' }).eq('faculty_id', user.id).eq('status', 'accepted'),
    ])
    setMyProjects(projectsRes.data || [])
    setRecentApps(appsRes.data || [])
    setStats({
      projects: projectsRes.data?.length || 0,
      applications: appsRes.data?.length || 0,
      allocated: allocatedRes.count || 0,
    })
    setLoading(false)
  }

  return (
    <FacultyLayout
      title={`Hello, ${profile?.name?.split(' ')[0] || 'Professor'} 👋`}
      subtitle="Manage your projects and student allocations"
    >
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'My Projects', value: stats.projects, icon: FolderOpen, color: 'text-accent-glow', bg: 'bg-accent/10', border: 'border-accent/20', to: '/faculty/projects' },
          { label: 'Pending Applications', value: stats.applications, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-accent/10', border: 'border-amber-accent/20', to: '/faculty/projects' },
          { label: 'Students Allocated', value: stats.allocated, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-accent/10', border: 'border-emerald-accent/20', to: '/faculty/students' },
        ].map(({ label, value, icon: Icon, color, bg, border, to }) => (
          <Link key={label} to={to} className="card glass-hover">
            <div className={`w-9 h-9 ${bg} border ${border} rounded-lg flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="font-display font-bold text-2xl text-text-primary">{value}</p>
            <p className="font-body text-text-secondary text-xs mt-1">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent pending applications */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-text-primary">Pending Applications</h2>
            <Link to="/faculty/projects" className="text-accent-glow text-sm font-body hover:text-accent flex items-center gap-1">
              Review all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {recentApps.length === 0 ? (
            <div className="card text-center py-8">
              <p className="font-body text-text-muted text-sm">No pending applications</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recentApps.map(app => (
                <div key={app.id} className="card glass-hover flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent-glow font-display font-bold text-sm shrink-0">
                      {app.student_profiles?.name?.[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-body font-medium text-text-primary text-sm truncate">{app.student_profiles?.name}</p>
                      <p className="font-mono text-text-muted text-xs truncate">{app.projects?.title}</p>
                    </div>
                  </div>
                  <span className="tag tag-amber shrink-0"><Clock className="w-3 h-3" /> Pending</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My projects */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-text-primary">My Projects</h2>
            <Link to="/faculty/projects" className="btn-primary text-xs px-3 py-2">
              <Plus className="w-3.5 h-3.5" /> New Project
            </Link>
          </div>
          {myProjects.length === 0 ? (
            <div className="card text-center py-8 border-dashed">
              <p className="font-body text-text-muted text-sm mb-3">No projects yet</p>
              <Link to="/faculty/projects" className="btn-primary text-xs justify-center">
                <Plus className="w-3.5 h-3.5" /> Create First Project
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {myProjects.map(project => (
                <Link key={project.id} to={`/faculty/projects/${project.id}`} className="card glass-hover">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-body font-medium text-text-primary text-sm truncate">{project.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="tag tag-accent">{project.domain}</span>
                        <span className={`tag ${project.status === 'open' ? 'tag-emerald' : 'bg-border/50 text-text-muted border border-border'}`}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono text-text-muted text-xs">{project.progress || 0}%</p>
                      <div className="w-16 h-1 bg-border rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: `${project.progress || 0}%` }} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </FacultyLayout>
  )
}
