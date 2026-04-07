import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Check, X, Clock, Plus, Trash2, ChevronUp, ChevronDown, Save } from 'lucide-react'
import FacultyLayout from '../../components/faculty/FacultyLayout'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'

export default function FacultyProjectDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [project, setProject] = useState(null)
  const [applications, setApplications] = useState([])
  const [milestones, setMilestones] = useState([])
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [savingProgress, setSavingProgress] = useState(false)
  const [newMilestone, setNewMilestone] = useState({ title: '', description: '', due_date: '' })
  const [addingMilestone, setAddingMilestone] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [tab, setTab] = useState('applications')

  useEffect(() => { fetchData() }, [id])

  const fetchData = async () => {
    const [projRes, appsRes, msRes] = await Promise.all([
      supabase.from('projects').select('*').eq('id', id).single(),
      supabase.from('applications').select('*, student_profiles(*)').eq('project_id', id).order('created_at', { ascending: false }),
      supabase.from('milestones').select('*').eq('project_id', id).order('order_index'),
    ])
    setProject(projRes.data)
    setProgress(projRes.data?.progress || 0)
    setApplications(appsRes.data || [])
    setMilestones(msRes.data || [])
    setLoading(false)
  }

  const handleApplicationAction = async (appId, status, studentId) => {
    // If accepting, reject all others for this project (if max_students reached)
    const acceptedCount = applications.filter(a => a.status === 'accepted').length
    if (status === 'accepted' && acceptedCount >= project.max_students) {
      alert(`Max ${project.max_students} student(s) already allocated`)
      return
    }
    await supabase.from('applications').update({ status }).eq('id', appId)
    fetchData()
  }

  const saveProgress = async () => {
    setSavingProgress(true)
    await supabase.from('projects').update({ progress }).eq('id', id)
    setSavingProgress(false)
  }

  const addMilestone = async () => {
    if (!newMilestone.title) return
    setAddingMilestone(true)
    await supabase.from('milestones').insert({
      project_id: id,
      title: newMilestone.title,
      description: newMilestone.description,
      due_date: newMilestone.due_date || null,
      completed: false,
      order_index: milestones.length,
    })
    setNewMilestone({ title: '', description: '', due_date: '' })
    setAddingMilestone(false)
    fetchData()
  }

  const toggleMilestone = async (msId, completed) => {
    await supabase.from('milestones').update({ completed: !completed }).eq('id', msId)
    fetchData()
  }

  const deleteMilestone = async (msId) => {
    await supabase.from('milestones').delete().eq('id', msId)
    fetchData()
  }

  if (loading) return (
    <FacultyLayout>
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    </FacultyLayout>
  )

  if (!project) return (
    <FacultyLayout><div className="card text-center py-20"><p className="text-text-muted">Project not found</p></div></FacultyLayout>
  )

  const pending = applications.filter(a => a.status === 'pending')
  const accepted = applications.filter(a => a.status === 'accepted')
  const rejected = applications.filter(a => a.status === 'rejected')

  return (
    <FacultyLayout>
      {/* Back */}
      <Link to="/faculty/projects" className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary text-sm font-body mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </Link>

      {/* Project header */}
      <div className="card border-accent/20 mb-6" style={{ background: 'rgba(99,102,241,0.04)' }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="font-display font-bold text-xl text-text-primary">{project.title}</h1>
              <span className="tag tag-accent">{project.domain}</span>
              <span className={`tag ${project.status === 'open' ? 'tag-emerald' : 'bg-border/50 text-text-muted border border-border'}`}>{project.status}</span>
            </div>
            <p className="font-body text-text-secondary text-sm leading-relaxed max-w-2xl">{project.description}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-mono text-text-muted text-xs mb-1">Slots</p>
            <p className="font-display font-bold text-text-primary">{accepted.length}/{project.max_students}</p>
          </div>
        </div>
        {project.required_skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-border">
            {project.required_skills.map(s => <span key={s} className="tag tag-accent">{s}</span>)}
          </div>
        )}
      </div>

      {/* Progress editor */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-text-primary">Project Progress</h2>
          <button onClick={saveProgress} disabled={savingProgress} className="btn-primary text-xs px-3 py-2">
            {savingProgress ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-3.5 h-3.5" /> Save</>}
          </button>
        </div>
        <div className="flex items-center gap-4">
          <input type="range" min={0} max={100} value={progress} onChange={e => setProgress(parseInt(e.target.value))}
            className="flex-1 h-2 bg-border rounded-full appearance-none cursor-pointer accent-accent" />
          <span className="font-mono font-bold text-accent-glow w-12 text-right">{progress}%</span>
        </div>
        <div className="h-2 bg-border rounded-full mt-2 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: progress >= 75 ? '#10b981' : progress >= 40 ? '#f59e0b' : '#6366f1' }} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 bg-surface rounded-lg w-fit">
        {[
          { key: 'applications', label: `Applications (${applications.length})` },
          { key: 'milestones', label: `Milestones (${milestones.length})` },
          { key: 'team', label: `Team (${accepted.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-md text-sm font-body transition-all ${tab === t.key ? 'bg-accent text-white font-medium' : 'text-text-secondary hover:text-text-primary'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Applications tab */}
      {tab === 'applications' && (
        <div className="flex flex-col gap-4">
          {pending.length > 0 && (
            <div>
              <h3 className="font-display font-semibold text-amber-400 text-sm mb-3 flex items-center gap-2"><Clock className="w-4 h-4" /> Pending ({pending.length})</h3>
              <div className="flex flex-col gap-3">
                {pending.map(app => (
                  <div key={app.id} className="card glass-hover border-amber-accent/10">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent-glow font-display font-bold shrink-0">
                        {app.student_profiles?.name?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-body font-semibold text-text-primary">{app.student_profiles?.name}</p>
                          <span className="font-mono text-text-muted text-xs">{app.student_profiles?.roll_number}</span>
                        </div>
                        <p className="font-mono text-text-muted text-xs mb-2">{app.student_profiles?.department}</p>
                        {app.student_profiles?.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {app.student_profiles.skills.slice(0, 5).map(s => (
                              <span key={s} className={`tag text-xs ${project.required_skills?.includes(s) ? 'tag-emerald' : 'bg-border/40 text-text-muted border border-border/50'}`}>{s}</span>
                            ))}
                          </div>
                        )}
                        {app.cover_letter && (
                          <p className="font-body text-text-secondary text-xs leading-relaxed italic bg-surface/50 px-3 py-2 rounded-lg border border-border/50">
                            "{app.cover_letter}"
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <button onClick={() => handleApplicationAction(app.id, 'accepted', app.student_id)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-accent/10 border border-emerald-accent/20 text-emerald-400 hover:bg-emerald-accent/20 transition-all text-xs font-body">
                          <Check className="w-3.5 h-3.5" /> Accept
                        </button>
                        <button onClick={() => handleApplicationAction(app.id, 'rejected', app.student_id)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-accent/10 border border-rose-accent/20 text-rose-400 hover:bg-rose-accent/20 transition-all text-xs font-body">
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {rejected.length > 0 && (
            <div>
              <h3 className="font-display font-semibold text-rose-400 text-sm mb-3 flex items-center gap-2"><X className="w-4 h-4" /> Rejected ({rejected.length})</h3>
              <div className="flex flex-col gap-2">
                {rejected.map(app => (
                  <div key={app.id} className="card opacity-60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center text-text-muted font-bold text-sm">{app.student_profiles?.name?.[0]}</div>
                      <div>
                        <p className="font-body text-text-secondary text-sm">{app.student_profiles?.name}</p>
                        <p className="font-mono text-text-muted text-xs">{app.student_profiles?.department}</p>
                      </div>
                    </div>
                    <button onClick={() => handleApplicationAction(app.id, 'pending', app.student_id)} className="btn-ghost text-xs px-3 py-2">Reconsider</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {applications.length === 0 && (
            <div className="card text-center py-16">
              <p className="font-display font-semibold text-text-primary mb-1">No applications yet</p>
              <p className="font-body text-text-secondary text-sm">Students will appear here once they apply</p>
            </div>
          )}
        </div>
      )}

      {/* Milestones tab */}
      {tab === 'milestones' && (
        <div>
          {/* Add milestone */}
          <div className="card mb-4">
            <h3 className="font-display font-semibold text-text-primary text-sm mb-4">Add Milestone</h3>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="col-span-2">
                <input className="input-field" placeholder="Milestone title..." value={newMilestone.title} onChange={e => setNewMilestone(p => ({ ...p, title: e.target.value }))} />
              </div>
              <input type="date" className="input-field" value={newMilestone.due_date} onChange={e => setNewMilestone(p => ({ ...p, due_date: e.target.value }))} />
            </div>
            <div className="flex gap-3">
              <input className="input-field flex-1" placeholder="Description (optional)..." value={newMilestone.description} onChange={e => setNewMilestone(p => ({ ...p, description: e.target.value }))} />
              <button onClick={addMilestone} disabled={addingMilestone || !newMilestone.title} className="btn-primary px-4">
                {addingMilestone ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Plus className="w-4 h-4" /> Add</>}
              </button>
            </div>
          </div>

          {milestones.length === 0 ? (
            <div className="card text-center py-12">
              <p className="font-body text-text-muted text-sm">No milestones yet. Add some above to track progress.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {milestones.map((m, i) => (
                <div key={m.id} className={`card flex items-center gap-3 ${m.completed ? 'opacity-70' : ''}`}>
                  <button onClick={() => toggleMilestone(m.id, m.completed)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      m.completed ? 'bg-emerald-accent border-emerald-accent text-void' : 'border-border hover:border-accent/50'
                    }`}>
                    {m.completed && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-body font-medium text-sm ${m.completed ? 'line-through text-text-muted' : 'text-text-primary'}`}>{m.title}</p>
                    {m.description && <p className="font-body text-text-muted text-xs">{m.description}</p>}
                  </div>
                  {m.due_date && <span className="font-mono text-text-muted text-xs shrink-0">{new Date(m.due_date).toLocaleDateString()}</span>}
                  <button onClick={() => deleteMilestone(m.id)} className="text-text-muted hover:text-rose-400 transition-colors shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Team tab */}
      {tab === 'team' && (
        <div>
          {accepted.length === 0 ? (
            <div className="card text-center py-12">
              <p className="font-body text-text-muted text-sm">No students allocated yet. Accept applications to build your team.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {accepted.map(app => (
                <div key={app.id} className="card glass-hover">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-accent/10 border border-emerald-accent/20 flex items-center justify-center text-emerald-400 font-display font-bold text-lg shrink-0">
                      {app.student_profiles?.name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-display font-semibold text-text-primary">{app.student_profiles?.name}</p>
                        <span className="tag tag-emerald"><Check className="w-3 h-3" /> Allocated</span>
                      </div>
                      <p className="font-mono text-text-muted text-xs mb-2">{app.student_profiles?.roll_number} · {app.student_profiles?.department}</p>
                      {app.student_profiles?.bio && <p className="font-body text-text-secondary text-sm mb-2">{app.student_profiles.bio}</p>}
                      {app.student_profiles?.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {app.student_profiles.skills.map(s => <span key={s} className="tag tag-accent">{s}</span>)}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 text-xs font-mono text-text-muted shrink-0">
                      {app.student_profiles?.github && <a href={`https://${app.student_profiles.github}`} target="_blank" rel="noopener noreferrer" className="text-accent-glow hover:underline">GitHub ↗</a>}
                      {app.student_profiles?.linkedin && <a href={`https://${app.student_profiles.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-accent-glow hover:underline">LinkedIn ↗</a>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </FacultyLayout>
  )
}
