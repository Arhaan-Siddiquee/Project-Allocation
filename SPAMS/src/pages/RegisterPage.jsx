import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Layers, Eye, EyeOff, AlertCircle, GraduationCap, BookOpen } from 'lucide-react'
import { signUp, supabase } from '../lib/supabase'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [role, setRole] = useState(searchParams.get('role') || 'student')
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', rollNumber: '', designation: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: signUpError } = await signUp(form.email, form.password, {
      role,
      name: form.name,
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    const userId = data.user?.id
    if (!userId) { setError('Signup failed'); setLoading(false); return }

    if (role === 'student') {
      await supabase.from('student_profiles').insert({
        id: userId,
        name: form.name,
        email: form.email,
        department: form.department,
        roll_number: form.rollNumber,
        skills: [],
        bio: '',
        github: '',
        linkedin: '',
      })
    } else {
      await supabase.from('faculty_profiles').insert({
        id: userId,
        name: form.name,
        email: form.email,
        department: form.department,
        designation: form.designation,
        bio: '',
        research_areas: [],
      })
    }

    navigate(role === 'faculty' ? '/faculty' : '/student')
  }

  return (
    <div className="min-h-screen bg-void bg-grid-pattern bg-grid flex items-center justify-center px-4 py-10">
      <div className="fixed top-[-10%] left-[30%] w-[400px] h-[400px] bg-emerald-accent/6 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-sm animate-slide-up">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-text-primary">ProjectHub</span>
          </Link>
          <h1 className="font-display font-bold text-2xl text-text-primary mb-1">Create account</h1>
          <p className="font-body text-text-secondary text-sm">Join the platform</p>
        </div>

        <div className="card border-border/80">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2 mb-5 p-1 bg-surface rounded-lg">
            {[
              { value: 'student', label: 'Student', Icon: GraduationCap },
              { value: 'faculty', label: 'Faculty', Icon: BookOpen },
            ].map(({ value, label, Icon }) => (
              <button key={value} type="button" onClick={() => setRole(value)}
                className={`flex items-center justify-center gap-2 py-2 rounded-md text-sm font-display font-medium transition-all ${
                  role === value ? 'bg-accent text-white shadow-glow-sm' : 'text-text-secondary hover:text-text-primary'
                }`}>
                <Icon className="w-4 h-4" />{label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-rose-accent/10 border border-rose-accent/20 text-rose-400 text-sm font-body">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}
            <div>
              <label className="block font-body text-text-secondary text-xs mb-2">Full Name</label>
              <input type="text" className="input-field" placeholder="Your name"
                value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div>
              <label className="block font-body text-text-secondary text-xs mb-2">Email</label>
              <input type="email" className="input-field" placeholder="you@university.edu"
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div>
              <label className="block font-body text-text-secondary text-xs mb-2">Department</label>
              <input type="text" className="input-field" placeholder="e.g. Computer Science"
                value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} required />
            </div>
            {role === 'student' && (
              <div>
                <label className="block font-body text-text-secondary text-xs mb-2">Roll Number</label>
                <input type="text" className="input-field" placeholder="e.g. CS21B001"
                  value={form.rollNumber} onChange={e => setForm(p => ({ ...p, rollNumber: e.target.value }))} required />
              </div>
            )}
            {role === 'faculty' && (
              <div>
                <label className="block font-body text-text-secondary text-xs mb-2">Designation</label>
                <input type="text" className="input-field" placeholder="e.g. Associate Professor"
                  value={form.designation} onChange={e => setForm(p => ({ ...p, designation: e.target.value }))} required />
              </div>
            )}
            <div>
              <label className="block font-body text-text-secondary text-xs mb-2">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} className="input-field pr-10" placeholder="Min 6 characters"
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required minLength={6} />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary justify-center mt-1">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : `Create ${role === 'faculty' ? 'Faculty' : 'Student'} Account`}
            </button>
          </form>

          <p className="font-body text-text-muted text-sm text-center mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-accent-glow hover:text-accent transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
