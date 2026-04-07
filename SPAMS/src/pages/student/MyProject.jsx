import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Clock, CheckCircle, ArrowRight, Calendar, User, Target, BookOpen } from 'lucide-react'
import StudentLayout from '../../components/student/StudentLayout'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'

export default function StudentMyProject() {
  const { user } = useAuth()
  const [allocation, setAllocation] = useState(null)
  const [milestones, setMilestones] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) fetchData() }, [user])

  const fetchData = async () => {
    const { data } = await supabase
      .from('applications')
      .select('*, projects(*, faculty_profiles(name, department, designation))')
      .eq('student_id', user.id)
      .eq('status', 'accepted')
      .single()

    setAllocation(data)
    if (data?.projects?.id) {
      const { data: ms } = await supabase
        .from('milestones')
        .select('*')
        .eq('project_id', data.projects.id)
        .order('order_index')
      setMilestones(ms || [])
    }
    setLoading(false)
  }

  const progress = allocation?.projects?.progress || 0
  const progressColor = progress >= 75 ? '#10b981' : progress >= 40 ? '#f59e0b' : '#6366f1'

  if (loading) return (
    <StudentLayout title="My Project">
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    </StudentLayout>
  )

  if (!allocation) return (
    <StudentLayout title="My Project" subtitle="Your allocated project will appear here">
      <div className="card text-center py-20 flex flex-col items-center">
        <div className="w-16 h-16 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center mb-4">
          <Briefcase className="w-7 h-7 text-accent-glow" />
        </div>
        <h2 className="font-display font-bold text-text-primary mb-2">No Project Yet</h2>
        <p className="font-body text-text-secondary text-sm mb-6 max-w-xs">Browse open projects, apply and wait for faculty approval to get started</p>
        <Link to="/student/projects" className="btn-primary">
          Browse Projects <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </StudentLayout>
  )

  const project = allocation.projects

  return (
    <StudentLayout title="My Project" subtitle="Track your project progress">
      <div className="grid grid-cols-3 gap-6">
        {/* Main */}
        <div className="col-span-2 flex flex-col gap-5">
          {/* Header card */}
          <div className="card border-accent/20" style={{ background: 'rgba(99,102,241,0.04)' }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-accent/20 border border-accent/30 rounded-xl flex items-center justify-center shrink-0">
                <Target className="w-6 h-6 text-accent-glow" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-display font-bold text-xl text-text-primary">{project.title}</h2>
                  <span className="tag tag-accent">{project.domain}</span>
                </div>
                <p className="font-body text-text-secondary text-sm leading-relaxed">{project.description}</p>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-text-primary">Overall Progress</h3>
              <span className="font-mono text-2xl font-bold" style={{ color: progressColor }}>{progress}%</span>
            </div>
            <div className="h-3 bg-border rounded-full overflow-hidden mb-4">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: progressColor }} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Status', value: progress >= 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Not Started', color: progress >= 100 ? 'text-emerald-400' : progress > 0 ? 'text-amber-400' : 'text-text-muted' },
                { label: 'Domain', value: project.domain, color: 'text-accent-glow' },
                { label: 'Max Team', value: `${project.max_students} student(s)`, color: 'text-text-secondary' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-surface/50 rounded-lg p-3 border border-border/50">
                  <p className="font-mono text-text-muted text-xs mb-1">{label}</p>
                  <p className={`font-body font-medium text-sm ${color}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Milestones */}
          <div className="card">
            <h3 className="font-display font-semibold text-text-primary mb-4">Milestones</h3>
            {milestones.length === 0 ? (
              <p className="font-body text-text-muted text-sm text-center py-6">No milestones set by faculty yet</p>
            ) : (
              <div className="flex flex-col gap-3">
                {milestones.map((m, i) => (
                  <div key={m.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                    m.completed ? 'bg-emerald-accent/5 border-emerald-accent/20' : 'bg-surface/30 border-border/50'
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-mono ${
                      m.completed ? 'bg-emerald-accent text-void' : 'bg-border text-text-muted'
                    }`}>
                      {m.completed ? <CheckCircle className="w-4 h-4" /> : i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-body font-medium text-sm ${m.completed ? 'text-emerald-400' : 'text-text-primary'}`}>{m.title}</p>
                      {m.description && <p className="font-body text-text-muted text-xs mt-0.5">{m.description}</p>}
                    </div>
                    {m.due_date && (
                      <span className="font-mono text-text-muted text-xs flex items-center gap-1 shrink-0">
                        <Calendar className="w-3 h-3" />{new Date(m.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Project description */}
          {project.detailed_description && (
            <div className="card">
              <h3 className="font-display font-semibold text-text-primary mb-3 flex items-center gap-2"><BookOpen className="w-4 h-4" /> Project Details</h3>
              <p className="font-body text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">{project.detailed_description}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="col-span-1 flex flex-col gap-4">
          {/* Faculty card */}
          <div className="card">
            <h3 className="font-display font-semibold text-text-primary text-sm mb-3">Faculty Guide</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-accent/10 border border-emerald-accent/20 flex items-center justify-center text-emerald-400 font-display font-bold">
                {project.faculty_profiles?.name?.[0]}
              </div>
              <div>
                <p className="font-body font-medium text-text-primary text-sm">{project.faculty_profiles?.name}</p>
                <p className="font-mono text-text-muted text-xs">{project.faculty_profiles?.designation}</p>
              </div>
            </div>
            <p className="font-mono text-text-muted text-xs">{project.faculty_profiles?.department}</p>
          </div>

          {/* Skills required */}
          {project.required_skills?.length > 0 && (
            <div className="card">
              <h3 className="font-display font-semibold text-text-primary text-sm mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {project.required_skills.map(s => (
                  <span key={s} className="tag tag-accent">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="card">
            <h3 className="font-display font-semibold text-text-primary text-sm mb-3 flex items-center gap-2"><Clock className="w-4 h-4" /> Timeline</h3>
            <div className="flex flex-col gap-2 text-sm">
              {project.start_date && (
                <div className="flex justify-between">
                  <span className="font-body text-text-muted text-xs">Start</span>
                  <span className="font-mono text-text-secondary text-xs">{new Date(project.start_date).toLocaleDateString()}</span>
                </div>
              )}
              {project.end_date && (
                <div className="flex justify-between">
                  <span className="font-body text-text-muted text-xs">End</span>
                  <span className="font-mono text-text-secondary text-xs">{new Date(project.end_date).toLocaleDateString()}</span>
                </div>
              )}
              {!project.start_date && !project.end_date && (
                <p className="font-body text-text-muted text-xs">No timeline set</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}
