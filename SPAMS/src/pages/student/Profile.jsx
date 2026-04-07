import { useState, useEffect } from 'react'
import { Plus, X, Save, Github, Linkedin, User, Check, AlertCircle } from 'lucide-react'
import StudentLayout from '../../components/student/StudentLayout'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'

const SKILL_SUGGESTIONS = ['React', 'Node.js', 'Python', 'Machine Learning', 'Data Analysis', 'Java', 'C++', 'SQL', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision', 'Blockchain', 'IoT', 'Cloud Computing', 'Docker', 'Kubernetes', 'TypeScript', 'Go', 'Rust']

export default function StudentProfile() {
  const { user, profile, refreshProfile } = useAuth()
  const [form, setForm] = useState({ name: '', department: '', roll_number: '', bio: '', github: '', linkedin: '', skills: [], strongholds: [] })
  const [skillInput, setSkillInput] = useState('')
  const [strongholdInput, setStrongholdInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (profile) setForm({ name: profile.name || '', department: profile.department || '', roll_number: profile.roll_number || '', bio: profile.bio || '', github: profile.github || '', linkedin: profile.linkedin || '', skills: profile.skills || [], strongholds: profile.strongholds || [] })
  }, [profile])

  const addSkill = (skill) => {
    const s = skill.trim()
    if (s && !form.skills.includes(s)) setForm(p => ({ ...p, skills: [...p.skills, s] }))
    setSkillInput('')
  }

  const addStronghold = () => {
    const s = strongholdInput.trim()
    if (s && !form.strongholds.includes(s)) setForm(p => ({ ...p, strongholds: [...p.strongholds, s] }))
    setStrongholdInput('')
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    const { error } = await supabase.from('student_profiles').upsert({
      id: user.id, ...form
    })
    if (error) setError(error.message)
    else { setSaved(true); await refreshProfile(); setTimeout(() => setSaved(false), 2000) }
    setSaving(false)
  }

  return (
    <StudentLayout title="My Profile" subtitle="Build your academic resume">
      <div className="grid grid-cols-3 gap-6">
        {/* Left column - avatar + info */}
        <div className="col-span-1 flex flex-col gap-4">
          <div className="card flex flex-col items-center py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-accent/20 border-2 border-accent/40 flex items-center justify-center text-accent-glow font-display font-bold text-2xl mb-3">
              {form.name?.[0]?.toUpperCase() || '?'}
            </div>
            <p className="font-display font-semibold text-text-primary">{form.name || 'Your Name'}</p>
            <p className="font-mono text-text-muted text-xs mt-1">{form.roll_number}</p>
            <span className="tag tag-accent mt-2">{form.department || 'Department'}</span>
          </div>

          {/* Strongholds */}
          <div className="card">
            <h3 className="font-display font-semibold text-text-primary text-sm mb-3">⚡ Strongholds</h3>
            <p className="font-body text-text-muted text-xs mb-3">Your core expertise areas</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {form.strongholds.map(s => (
                <span key={s} className="tag tag-emerald">
                  {s}
                  <button onClick={() => setForm(p => ({ ...p, strongholds: p.strongholds.filter(x => x !== s) }))}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input className="input-field text-xs py-2" placeholder="Add stronghold..." value={strongholdInput}
                onChange={e => setStrongholdInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addStronghold())} />
              <button onClick={addStronghold} className="btn-primary px-3 py-2 text-xs"><Plus className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </div>

        {/* Right - form */}
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
                <label className="block text-text-secondary text-xs mb-2">Roll Number</label>
                <input className="input-field" value={form.roll_number} onChange={e => setForm(p => ({ ...p, roll_number: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className="block text-text-secondary text-xs mb-2">Department</label>
                <input className="input-field" value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className="block text-text-secondary text-xs mb-2">Bio</label>
                <textarea className="input-field resize-none" rows={3} placeholder="Tell faculty about yourself..."
                  value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="card">
            <h3 className="font-display font-semibold text-text-primary text-sm mb-4">Links</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-text-secondary text-xs mb-2"><Github className="w-3 h-3" /> GitHub</label>
                <input className="input-field" placeholder="github.com/username" value={form.github} onChange={e => setForm(p => ({ ...p, github: e.target.value }))} />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-text-secondary text-xs mb-2"><Linkedin className="w-3 h-3" /> LinkedIn</label>
                <input className="input-field" placeholder="linkedin.com/in/username" value={form.linkedin} onChange={e => setForm(p => ({ ...p, linkedin: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="card">
            <h3 className="font-display font-semibold text-text-primary text-sm mb-1">Skills</h3>
            <p className="font-body text-text-muted text-xs mb-4">Add all your technical skills for matching</p>
            <div className="flex flex-wrap gap-1.5 mb-3 min-h-[36px]">
              {form.skills.map(s => (
                <span key={s} className="tag tag-accent">
                  {s}
                  <button onClick={() => setForm(p => ({ ...p, skills: p.skills.filter(x => x !== s) }))}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 mb-3">
              <input className="input-field text-xs py-2" placeholder="Add skill..." value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill(skillInput))} />
              <button onClick={() => addSkill(skillInput)} className="btn-primary px-3 py-2 text-xs"><Plus className="w-3.5 h-3.5" /></button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SKILL_SUGGESTIONS.filter(s => !form.skills.includes(s)).slice(0, 8).map(s => (
                <button key={s} onClick={() => addSkill(s)}
                  className="px-2 py-1 rounded text-xs font-mono text-text-muted border border-border hover:border-accent/30 hover:text-accent-glow transition-all">
                  + {s}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} className="btn-primary self-end">
            {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Profile</>}
          </button>
        </div>
      </div>
    </StudentLayout>
  )
}
