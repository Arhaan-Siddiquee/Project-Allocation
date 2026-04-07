import { useState, useEffect } from 'react'
import { Save, Plus, X, Check, AlertCircle, FolderOpen } from 'lucide-react'
import FacultyLayout from '../../components/faculty/FacultyLayout'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'

const RESEARCH_AREAS = ['Machine Learning', 'Computer Vision', 'NLP', 'Data Science', 'IoT', 'Blockchain', 'Cloud Computing', 'Cybersecurity', 'Embedded Systems', 'Robotics', 'Web Technology', 'Bioinformatics']

export default function FacultyProfile() {
  const { user, profile, refreshProfile } = useAuth()
  const [form, setForm] = useState({ name: '', department: '', designation: '', bio: '', email: '', research_areas: [] })
  const [areaInput, setAreaInput] = useState('')
  const [pastProjects, setPastProjects] = useState([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (profile) {
      setForm({ name: profile.name || '', department: profile.department || '', designation: profile.designation || '', bio: profile.bio || '', email: profile.email || '', research_areas: profile.research_areas || [] })
    }
    if (user) fetchPastProjects()
  }, [profile, user])

  const fetchPastProjects = async () => {
    const { data } = await supabase.from('projects').select('*, applications(count)').eq('faculty_id', user.id).order('created_at', { ascending: false })
    setPastProjects(data || [])
  }

  const addArea = (area) => {
    const a = area.trim()
    if (a && !form.research_areas.includes(a)) setForm(p => ({ ...p, research_areas: [...p.research_areas, a] }))
    setAreaInput('')
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    const { error } = await supabase.from('faculty_profiles').upsert({ id: user.id, ...form })
    if (error) setError(error.message)
    else { setSaved(true); await refreshProfile(); setTimeout(() => setSaved(false), 2000) }
    setSaving(false)
  }

  return (
    <FacultyLayout title="My Profile" subtitle="Manage your faculty information">
      <div className="grid grid-cols-3 gap-6">
        {/* Left */}
        <div className="col-span-1 flex flex-col gap-4">
          <div className="card flex flex-col items-center py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-accent/10 border-2 border-emerald-accent/30 flex items-center justify-center text-emerald-400 font-display font-bold text-2xl mb-3">
              {form.name?.[0]?.toUpperCase() || '?'}
            </div>
            <p className="font-display font-semibold text-text-primary">{form.name || 'Your Name'}</p>
            <p className="font-mono text-text-muted text-xs mt-1">{form.designation || 'Designation'}</p>
            <span className="tag tag-emerald mt-2">{form.department || 'Department'}</span>
          </div>

          {/* Research areas */}
          <div className="card">
            <h3 className="font-display font-semibold text-text-primary text-sm mb-1">Research Areas</h3>
            <p className="font-body text-text-muted text-xs mb-3">Your domains of expertise</p>
            <div className="flex flex-wrap gap-1.5 mb-3 min-h-[32px]">
              {form.research_areas.map(a => (
                <span key={a} className="tag tag-emerald">
                  {a}
                  <button onClick={() => setForm(p => ({ ...p, research_areas: p.research_areas.filter(x => x !== a) }))}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 mb-2">
              <input className="input-field text-xs py-2" placeholder="Add area..." value={areaInput}
                onChange={e => setAreaInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addArea(areaInput))} />
              <button onClick={() => addArea(areaInput)} className="btn-primary px-3 py-2 text-xs"><Plus className="w-3.5 h-3.5" /></button>
            </div>
            <div className="flex flex-wrap gap-1">
              {RESEARCH_AREAS.filter(a => !form.research_areas.includes(a)).slice(0, 6).map(a => (
                <button key={a} onClick={() => addArea(a)}
                  className="px-2 py-1 rounded text-xs font-mono text-text-muted border border-border hover:border-emerald-accent/30 hover:text-emerald-400 transition-all">
                  + {a}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="card">
            <h3 className="font-display font-semibold text-text-primary text-sm mb-3">Stats</h3>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-body text-text-muted text-xs">Total Projects</span>
                <span className="font-mono text-text-primary font-bold">{pastProjects.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-body text-text-muted text-xs">Open Projects</span>
                <span className="font-mono text-emerald-400 font-bold">{pastProjects.filter(p => p.status === 'open').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-body text-text-muted text-xs">Completed</span>
                <span className="font-mono text-accent-glow font-bold">{pastProjects.filter(p => p.progress === 100).length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="col-span-2 flex flex-col gap-4">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-rose-accent/10 border border-rose-accent/20 text-rose-400 text-sm">
              <AlertCircle className="w-4 h-4" />{error}
            </div>
          )}

          <div className="card">
            <h3 className="font-display font-semibold text-text-primary text-sm mb-4">Basic Info</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-text-secondary text-xs mb-2">Full Name</label>
                <input className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-text-secondary text-xs mb-2">Designation</label>
                <input className="input-field" placeholder="e.g. Associate Professor" value={form.designation} onChange={e => setForm(p => ({ ...p, designation: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className="block text-text-secondary text-xs mb-2">Department</label>
                <input className="input-field" value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className="block text-text-secondary text-xs mb-2">Bio / About</label>
                <textarea className="input-field resize-none" rows={3} placeholder="Brief academic biography and research interests..."
                  value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Project history */}
          <div className="card">
            <h3 className="font-display font-semibold text-text-primary text-sm mb-4 flex items-center gap-2">
              <FolderOpen className="w-4 h-4" /> Project History
            </h3>
            {pastProjects.length === 0 ? (
              <p className="font-body text-text-muted text-sm text-center py-4">No projects created yet</p>
            ) : (
              <div className="flex flex-col gap-2">
                {pastProjects.map(p => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-medium text-text-primary text-sm truncate">{p.title}</p>
                      <p className="font-mono text-text-muted text-xs">{p.domain}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <div className="text-right">
                        <p className="font-mono text-text-muted text-xs">{p.progress || 0}%</p>
                        <div className="w-16 h-1 bg-border rounded-full mt-0.5 overflow-hidden">
                          <div className="h-full bg-accent rounded-full" style={{ width: `${p.progress || 0}%` }} />
                        </div>
                      </div>
                      <span className={`tag ${p.status === 'open' ? 'tag-emerald' : 'bg-border/50 text-text-muted border border-border'}`}>{p.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={handleSave} disabled={saving} className="btn-primary self-end">
            {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Profile</>}
          </button>
        </div>
      </div>
    </FacultyLayout>
  )
}
