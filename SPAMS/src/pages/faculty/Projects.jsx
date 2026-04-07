import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, X, ArrowRight, FolderOpen, Users, ChevronDown, Trash2, Edit, Check } from 'lucide-react'
import FacultyLayout from '../../components/faculty/FacultyLayout'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'

const DOMAINS = ['Machine Learning', 'Web Development', 'Data Science', 'IoT', 'Blockchain', 'Computer Vision', 'NLP', 'Cloud Computing', 'Cybersecurity', 'Embedded Systems', 'Robotics', 'Other']
const SKILL_SUGGESTIONS = ['React', 'Node.js', 'Python', 'Machine Learning', 'Data Analysis', 'Java', 'C++', 'SQL', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision', 'Blockchain', 'IoT', 'Cloud Computing', 'Docker']

const emptyForm = { title: '', description: '', detailed_description: '', domain: DOMAINS[0], required_skills: [], max_students: 1, status: 'open', start_date: '', end_date: '' }

export default function FacultyProjects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [skillInput, setSkillInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [appCounts, setAppCounts] = useState({})

  useEffect(() => { if (user) fetchData() }, [user])

  const fetchData = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('faculty_id', user.id)
      .order('created_at', { ascending: false })
    setProjects(data || [])

    if (data?.length) {
      const ids = data.map(p => p.id)
      const { data: apps } = await supabase
        .from('applications')
        .select('project_id, status')
        .in('project_id', ids)
      const counts = {}
      apps?.forEach(a => {
        if (!counts[a.project_id]) counts[a.project_id] = { pending: 0, accepted: 0 }
        counts[a.project_id][a.status] = (counts[a.project_id][a.status] || 0) + 1
      })
      setAppCounts(counts)
    }
    setLoading(false)
  }

  const addSkill = (skill) => {
    const s = skill.trim()
    if (s && !form.required_skills.includes(s)) setForm(p => ({ ...p, required_skills: [...p.required_skills, s] }))
    setSkillInput('')
  }

  const handleSave = async () => {
    if (!form.title || !form.description) return
    setSaving(true)
    const payload = { ...form, faculty_id: user.id, progress: 0 }
    const { error } = await supabase.from('projects').insert(payload)
    if (!error) { setShowForm(false); setForm(emptyForm); fetchData() }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return
    await supabase.from('projects').delete().eq('id', id)
    fetchData()
  }

  const toggleStatus = async (project) => {
    const newStatus = project.status === 'open' ? 'closed' : 'open'
    await supabase.from('projects').update({ status: newStatus }).eq('id', project.id)
    fetchData()
  }

  return (
    <FacultyLayout title="My Projects" subtitle="Create and manage your research projects">
      <div className="flex justify-end mb-6">
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="card text-center py-20 border-dashed flex flex-col items-center">
          <div className="w-14 h-14 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center mb-4">
            <FolderOpen className="w-6 h-6 text-accent-glow" />
          </div>
          <h2 className="font-display font-bold text-text-primary mb-2">No projects yet</h2>
          <p className="font-body text-text-secondary text-sm mb-5">Create your first project to start receiving student applications</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Create Project
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map(project => {
            const counts = appCounts[project.id] || {}
            return (
              <div key={project.id} className="card glass-hover">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className="font-display font-semibold text-text-primary">{project.title}</h3>
                      <span className="tag tag-accent">{project.domain}</span>
                      <span className={`tag ${project.status === 'open' ? 'tag-emerald' : 'bg-border/50 text-text-muted border border-border'}`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="font-body text-text-secondary text-sm mb-3 leading-relaxed line-clamp-2">{project.description}</p>
                    <div className="flex items-center gap-4 text-xs font-mono text-text-muted">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Max: {project.max_students}</span>
                      {counts.pending > 0 && <span className="text-amber-400">{counts.pending} pending</span>}
                      {counts.accepted > 0 && <span className="text-emerald-400">{counts.accepted} allocated</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => toggleStatus(project)}
                      className={`btn-ghost text-xs px-3 py-2 ${project.status === 'open' ? 'hover:text-rose-400' : 'hover:text-emerald-400'}`}>
                      {project.status === 'open' ? 'Close' : 'Reopen'}
                    </button>
                    <Link to={`/faculty/projects/${project.id}`} className="btn-primary text-xs px-3 py-2">
                      Manage <ArrowRight className="w-3 h-3" />
                    </Link>
                    <button onClick={() => handleDelete(project.id)} className="p-2 text-text-muted hover:text-rose-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {project.required_skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border">
                    {project.required_skills.map(s => <span key={s} className="tag tag-accent">{s}</span>)}
                  </div>
                )}

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs font-mono text-text-muted mb-1">
                    <span>Progress</span><span>{project.progress || 0}%</span>
                  </div>
                  <div className="h-1 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${project.progress || 0}%` }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create project modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="card max-w-2xl w-full my-8 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-text-primary text-lg">Create New Project</h3>
              <button onClick={() => { setShowForm(false); setForm(emptyForm) }} className="text-text-muted hover:text-text-primary"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-text-secondary text-xs mb-2">Project Title *</label>
                <input className="input-field" placeholder="e.g. AI-based Plant Disease Detection"
                  value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-secondary text-xs mb-2">Domain *</label>
                  <div className="relative">
                    <select className="input-field appearance-none pr-8 cursor-pointer"
                      value={form.domain} onChange={e => setForm(p => ({ ...p, domain: e.target.value }))}>
                      {DOMAINS.map(d => <option key={d}>{d}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-text-secondary text-xs mb-2">Max Students</label>
                  <input type="number" min={1} max={10} className="input-field"
                    value={form.max_students} onChange={e => setForm(p => ({ ...p, max_students: parseInt(e.target.value) }))} />
                </div>
              </div>
              <div>
                <label className="block text-text-secondary text-xs mb-2">Short Description *</label>
                <textarea className="input-field resize-none" rows={2} placeholder="Brief overview of the project..."
                  value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div>
                <label className="block text-text-secondary text-xs mb-2">Detailed Description</label>
                <textarea className="input-field resize-none" rows={4} placeholder="Full project scope, objectives, methodology..."
                  value={form.detailed_description} onChange={e => setForm(p => ({ ...p, detailed_description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-secondary text-xs mb-2">Start Date</label>
                  <input type="date" className="input-field" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-text-secondary text-xs mb-2">End Date</label>
                  <input type="date" className="input-field" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-text-secondary text-xs mb-2">Required Skills</label>
                <div className="flex flex-wrap gap-1.5 mb-2 min-h-[32px]">
                  {form.required_skills.map(s => (
                    <span key={s} className="tag tag-accent">
                      {s}<button onClick={() => setForm(p => ({ ...p, required_skills: p.required_skills.filter(x => x !== s) }))}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 mb-2">
                  <input className="input-field text-xs py-2" placeholder="Add skill..."
                    value={skillInput} onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill(skillInput))} />
                  <button onClick={() => addSkill(skillInput)} className="btn-primary px-3 py-2 text-xs"><Plus className="w-3.5 h-3.5" /></button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SKILL_SUGGESTIONS.filter(s => !form.required_skills.includes(s)).slice(0, 8).map(s => (
                    <button key={s} onClick={() => addSkill(s)}
                      className="px-2 py-1 rounded text-xs font-mono text-text-muted border border-border hover:border-accent/30 hover:text-accent-glow transition-all">
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setShowForm(false); setForm(emptyForm) }} className="btn-ghost flex-1 justify-center">Cancel</button>
                <button onClick={handleSave} disabled={saving || !form.title || !form.description} className="btn-primary flex-1 justify-center">
                  {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check className="w-4 h-4" /> Create Project</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </FacultyLayout>
  )
}
