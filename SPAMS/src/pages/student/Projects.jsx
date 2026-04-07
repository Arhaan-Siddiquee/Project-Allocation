import { useState, useEffect } from 'react'
import { Search, Filter, Send, Check, Clock, X, ChevronDown } from 'lucide-react'
import StudentLayout from '../../components/student/StudentLayout'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'

const DOMAINS = ['All', 'Machine Learning', 'Web Development', 'Data Science', 'IoT', 'Blockchain', 'Computer Vision', 'NLP', 'Cloud Computing', 'Cybersecurity']

export default function StudentProjects() {
  const { user, profile } = useAuth()
  const [projects, setProjects] = useState([])
  const [applications, setApplications] = useState([])
  const [search, setSearch] = useState('')
  const [domain, setDomain] = useState('All')
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(null)
  const [selected, setSelected] = useState(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [hasAllocation, setHasAllocation] = useState(false)

  useEffect(() => { if (user) fetchData() }, [user])

  const fetchData = async () => {
    const [projectsRes, appsRes, allocationRes] = await Promise.all([
      supabase.from('projects').select('*, faculty_profiles(name, department)').eq('status', 'open').order('created_at', { ascending: false }),
      supabase.from('applications').select('project_id, status').eq('student_id', user.id),
      supabase.from('applications').select('id').eq('student_id', user.id).eq('status', 'accepted').limit(1),
    ])
    setProjects(projectsRes.data || [])
    setApplications(appsRes.data || [])
    setHasAllocation((allocationRes.data || []).length > 0)
    setLoading(false)
  }

  const filtered = projects.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      (p.required_skills || []).some(s => s.toLowerCase().includes(search.toLowerCase()))
    const matchDomain = domain === 'All' || p.domain === domain
    return matchSearch && matchDomain
  })

  const getAppStatus = (projectId) => applications.find(a => a.project_id === projectId)?.status

  const handleApply = async (project) => {
    if (hasAllocation) return
    setApplying(project.id)
    await supabase.from('applications').insert({
      student_id: user.id,
      project_id: project.id,
      faculty_id: project.faculty_id,
      cover_letter: coverLetter,
      status: 'pending',
    })
    setCoverLetter('')
    setSelected(null)
    setApplying(null)
    fetchData()
  }

  const matchScore = (project) => {
    if (!profile?.skills?.length) return 0
    const matched = (project.required_skills || []).filter(s => profile.skills.includes(s))
    return project.required_skills?.length ? Math.round((matched.length / project.required_skills.length) * 100) : 0
  }

  return (
    <StudentLayout title="Browse Projects" subtitle="Find projects that match your skills">
      {hasAllocation && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-lg bg-emerald-accent/8 border border-emerald-accent/20 text-emerald-400 text-sm">
          <Check className="w-4 h-4" /> You already have an allocated project. You cannot apply to more.
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input className="input-field pl-9" placeholder="Search projects, skills, keywords..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="relative">
          <select className="input-field pr-8 appearance-none cursor-pointer min-w-[160px]"
            value={domain} onChange={e => setDomain(e.target.value)}>
            {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <p className="font-display font-semibold text-text-primary mb-1">No projects found</p>
          <p className="font-body text-text-secondary text-sm">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(project => {
            const status = getAppStatus(project.id)
            const score = matchScore(project)
            return (
              <div key={project.id} className="card glass-hover">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className="font-display font-semibold text-text-primary">{project.title}</h3>
                      <span className="tag tag-accent">{project.domain}</span>
                      {score > 0 && (
                        <span className={`tag ${score >= 70 ? 'tag-emerald' : score >= 40 ? 'tag-amber' : 'tag-accent'}`}>
                          {score}% match
                        </span>
                      )}
                    </div>
                    <p className="font-body text-text-secondary text-sm mb-3 leading-relaxed">{project.description}</p>
                    <div className="flex items-center gap-4 text-xs text-text-muted font-mono">
                      <span>by {project.faculty_profiles?.name}</span>
                      <span>{project.faculty_profiles?.department}</span>
                      <span>Max: {project.max_students} student(s)</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {status === 'accepted' ? (
                      <span className="tag tag-emerald"><Check className="w-3 h-3" /> Allocated</span>
                    ) : status === 'pending' ? (
                      <span className="tag tag-amber"><Clock className="w-3 h-3" /> Pending</span>
                    ) : status === 'rejected' ? (
                      <span className="tag tag-rose"><X className="w-3 h-3" /> Rejected</span>
                    ) : !hasAllocation ? (
                      <button onClick={() => setSelected(project)} className="btn-primary text-xs px-4 py-2">
                        <Send className="w-3.5 h-3.5" /> Apply
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* Skills */}
                {project.required_skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border">
                    {project.required_skills.map(skill => (
                      <span key={skill} className={`tag ${profile?.skills?.includes(skill) ? 'tag-emerald' : 'bg-border/50 text-text-muted border border-border'}`}>
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Apply modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full animate-slide-up">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-text-primary">Apply for Project</h3>
                <p className="font-body text-text-secondary text-sm mt-1">{selected.title}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-text-secondary text-xs mb-2">Cover Letter (optional)</label>
              <textarea className="input-field resize-none" rows={4}
                placeholder="Describe why you're a good fit, your relevant experience..."
                value={coverLetter} onChange={e => setCoverLetter(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSelected(null)} className="btn-ghost flex-1 justify-center">Cancel</button>
              <button onClick={() => handleApply(selected)} disabled={applying === selected.id} className="btn-primary flex-1 justify-center">
                {applying === selected.id
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Send className="w-4 h-4" /> Submit Application</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  )
}
