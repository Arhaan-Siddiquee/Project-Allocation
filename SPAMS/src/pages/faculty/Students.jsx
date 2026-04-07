import { useState, useEffect } from 'react'
import { Search, Github, Linkedin, X, ChevronDown } from 'lucide-react'
import FacultyLayout from '../../components/faculty/FacultyLayout'
import { supabase } from '../../lib/supabase'

const ALL_SKILLS = ['React', 'Node.js', 'Python', 'Machine Learning', 'Data Analysis', 'Java', 'C++', 'SQL', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision', 'Blockchain', 'IoT', 'Cloud Computing', 'Docker', 'Kubernetes', 'TypeScript']

export default function FacultyStudents() {
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [skillFilter, setSkillFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => { fetchStudents() }, [])

  const fetchStudents = async () => {
    const { data } = await supabase
      .from('student_profiles')
      .select('*')
      .order('name')
    setStudents(data || [])
    setLoading(false)
  }

  const filtered = students.filter(s => {
    const matchSearch = s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.department?.toLowerCase().includes(search.toLowerCase()) ||
      s.roll_number?.toLowerCase().includes(search.toLowerCase())
    const matchSkill = !skillFilter || s.skills?.includes(skillFilter)
    return matchSearch && matchSkill
  })

  return (
    <FacultyLayout title="Student Directory" subtitle="Browse and search students by skills">
      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input className="input-field pl-9" placeholder="Search by name, department, roll number..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="relative">
          <select className="input-field appearance-none pr-8 cursor-pointer min-w-[180px]"
            value={skillFilter} onChange={e => setSkillFilter(e.target.value)}>
            <option value="">All Skills</option>
            {ALL_SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        </div>
        {(search || skillFilter) && (
          <button onClick={() => { setSearch(''); setSkillFilter('') }} className="btn-ghost px-3">
            <X className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <p className="font-mono text-text-muted text-sm">{filtered.length} student{filtered.length !== 1 ? 's' : ''} found</p>
        {skillFilter && <span className="tag tag-accent">{skillFilter}</span>}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <p className="font-display font-semibold text-text-primary mb-1">No students found</p>
          <p className="font-body text-text-secondary text-sm">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map(student => (
            <div key={student.id} className="card glass-hover cursor-pointer" onClick={() => setSelected(student)}>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent-glow font-display font-bold shrink-0">
                  {student.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-text-primary truncate">{student.name}</p>
                  <p className="font-mono text-text-muted text-xs">{student.roll_number}</p>
                </div>
              </div>
              <p className="font-body text-text-secondary text-xs mb-3">{student.department}</p>
              {student.bio && <p className="font-body text-text-muted text-xs mb-3 line-clamp-2">{student.bio}</p>}
              {student.strongholds?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {student.strongholds.slice(0, 2).map(s => <span key={s} className="tag tag-emerald">{s}</span>)}
                </div>
              )}
              {student.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {student.skills.slice(0, 4).map(s => (
                    <span key={s} className={`tag ${skillFilter === s ? 'tag-accent' : 'bg-border/40 text-text-muted border border-border/50 text-xs'}`}>{s}</span>
                  ))}
                  {student.skills.length > 4 && <span className="tag bg-border/40 text-text-muted border border-border/50">+{student.skills.length - 4}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Student detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-lg w-full max-h-[80vh] overflow-y-auto animate-slide-up">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-accent/20 border-2 border-accent/40 flex items-center justify-center text-accent-glow font-display font-bold text-xl">
                  {selected.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h2 className="font-display font-bold text-text-primary text-lg">{selected.name}</h2>
                  <p className="font-mono text-text-muted text-xs">{selected.roll_number}</p>
                  <span className="tag tag-accent mt-1 inline-flex">{selected.department}</span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            {selected.bio && (
              <div className="mb-4">
                <p className="font-body text-text-secondary text-xs mb-1 uppercase tracking-wider">Bio</p>
                <p className="font-body text-text-secondary text-sm leading-relaxed">{selected.bio}</p>
              </div>
            )}

            {selected.strongholds?.length > 0 && (
              <div className="mb-4">
                <p className="font-body text-text-muted text-xs mb-2 uppercase tracking-wider">⚡ Strongholds</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.strongholds.map(s => <span key={s} className="tag tag-emerald">{s}</span>)}
                </div>
              </div>
            )}

            {selected.skills?.length > 0 && (
              <div className="mb-4">
                <p className="font-body text-text-muted text-xs mb-2 uppercase tracking-wider">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.skills.map(s => <span key={s} className="tag tag-accent">{s}</span>)}
                </div>
              </div>
            )}

            {(selected.github || selected.linkedin) && (
              <div className="flex gap-3 pt-4 border-t border-border">
                {selected.github && (
                  <a href={`https://${selected.github}`} target="_blank" rel="noopener noreferrer"
                    className="btn-ghost text-xs flex-1 justify-center">
                    <Github className="w-4 h-4" /> GitHub
                  </a>
                )}
                {selected.linkedin && (
                  <a href={`https://${selected.linkedin}`} target="_blank" rel="noopener noreferrer"
                    className="btn-ghost text-xs flex-1 justify-center">
                    <Linkedin className="w-4 h-4" /> LinkedIn
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </FacultyLayout>
  )
}
