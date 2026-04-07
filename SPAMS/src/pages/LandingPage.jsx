import { Link } from 'react-router-dom'
import { ArrowRight, Layers, Users, Zap, Shield, ChevronRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-void bg-grid-pattern bg-grid overflow-hidden">
      {/* Glow orbs */}
      <div className="fixed top-[-20%] left-[10%] w-[600px] h-[600px] bg-accent/8 rounded-full blur-[120px] pointer-events-none animate-glow-pulse" />
      <div className="fixed bottom-[-20%] right-[10%] w-[500px] h-[500px] bg-emerald-accent/6 rounded-full blur-[100px] pointer-events-none animate-glow-pulse" style={{animationDelay:'1.5s'}} />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-text-primary">ProjectHub</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost">Sign In</Link>
          <Link to="/register" className="btn-primary">Get Started <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-24 pb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent-glow text-xs font-mono font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-glow animate-pulse" />
          Academic Project Allocation Platform
        </div>
        <h1 className="font-display font-extrabold text-6xl md:text-7xl text-text-primary leading-[1.05] max-w-4xl mb-6">
          Connect Students<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-glow via-accent to-emerald-accent">
            with Purpose
          </span>
        </h1>
        <p className="font-body text-text-secondary text-lg max-w-xl mb-10 leading-relaxed">
          A smart platform bridging students and faculty for seamless project allocation, skill-matching, and academic collaboration.
        </p>
        <div className="flex items-center gap-4">
          <Link to="/register" className="btn-primary text-base px-7 py-3">
            Start as Student <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/register?role=faculty" className="btn-ghost text-base px-7 py-3">
            Faculty Portal <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Zap, title: 'Skill-Based Matching', desc: 'Projects intelligently matched to students based on skills and expertise', color: 'text-accent-glow', bg: 'bg-accent/10', border: 'border-accent/20' },
          { icon: Users, title: 'Faculty Control', desc: 'Faculty list projects, review applications, and manage student progress', color: 'text-emerald-400', bg: 'bg-emerald-accent/10', border: 'border-emerald-accent/20' },
          { icon: Shield, title: 'Progress Tracking', desc: 'Real-time project progress monitoring and milestone management', color: 'text-amber-400', bg: 'bg-amber-accent/10', border: 'border-amber-accent/20' },
        ].map(({ icon: Icon, title, desc, color, bg, border }) => (
          <div key={title} className="card">
            <div className={`w-10 h-10 ${bg} border ${border} rounded-lg flex items-center justify-center mb-4`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <h3 className="font-display font-semibold text-text-primary mb-2">{title}</h3>
            <p className="font-body text-text-secondary text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
