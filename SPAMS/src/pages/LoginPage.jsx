import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Layers, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { signIn } from '../lib/supabase'

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error } = await signIn(form.email, form.password)
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    const role = data.user?.user_metadata?.role
    navigate(role === 'faculty' ? '/faculty' : '/student')
  }

  return (
    <div className="min-h-screen bg-void bg-grid-pattern bg-grid flex items-center justify-center px-4">
      <div className="fixed top-[-20%] right-[20%] w-[400px] h-[400px] bg-accent/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-sm animate-slide-up">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-text-primary">ProjectHub</span>
          </Link>
          <h1 className="font-display font-bold text-2xl text-text-primary mb-1">Welcome back</h1>
          <p className="font-body text-text-secondary text-sm">Sign in to your account</p>
        </div>

        <div className="card border-border/80">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-rose-accent/10 border border-rose-accent/20 text-rose-400 text-sm font-body">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            <div>
              <label className="block font-body text-text-secondary text-xs mb-2">Email address</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@university.edu"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block font-body text-text-secondary text-xs mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary justify-center mt-1">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Sign In'}
            </button>
          </form>

          <p className="font-body text-text-muted text-sm text-center mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent-glow hover:text-accent transition-colors">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
