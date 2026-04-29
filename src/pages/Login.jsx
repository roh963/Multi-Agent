import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login, getGoogleLoginUrl } from '../api/auth.js'
import { useAuth } from '../context/AuthContext.jsx'
import "../styles/auth-animations.css"

// ─── Icons ────────────────────────────────────────────────────────────────────

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

const EyeIcon = ({ show }) => show ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

// ─── Animated Background ──────────────────────────────────────────────────────

function AuthBackground() {
  const bgRef = useRef(null)

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!bgRef.current) return
      const { clientX: x, clientY: y } = e
      const { innerWidth: w, innerHeight: h } = window
      const nx = (x / w - 0.5) * 30
      const ny = (y / h - 0.5) * 30
      bgRef.current.style.setProperty('--mx', `${nx}px`)
      bgRef.current.style.setProperty('--my', `${ny}px`)
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Generate particles once
  const particles = useRef(
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 12,
      duration: Math.random() * 10 + 12,
      drift: (Math.random() - 0.5) * 80,
      opacity: Math.random() * 0.4 + 0.1,
    }))
  ).current

  return (
    <div ref={bgRef} style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden' }}>
      {/* Deep bg */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(91,110,245,0.15) 0%, transparent 60%), #05060f',
      }} />

      {/* Orb 1 — brand blue */}
      <div className="auth-orb" style={{
        width: 560, height: 560,
        top: '-15%', left: '-12%',
        background: 'radial-gradient(circle, rgba(91,110,245,0.45) 0%, rgba(91,110,245,0.1) 50%, transparent 70%)',
        animation: 'orb-drift-1 18s ease-in-out infinite',
        transform: 'translate(calc(var(--mx,0px)*0.4), calc(var(--my,0px)*0.4))',
        zIndex: 0,
      }} />

      {/* Orb 2 — violet */}
      <div className="auth-orb" style={{
        width: 420, height: 420,
        bottom: '-10%', right: '-8%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.4) 0%, rgba(124,58,237,0.1) 50%, transparent 70%)',
        animation: 'orb-drift-2 22s ease-in-out infinite',
        transform: 'translate(calc(var(--mx,0px)*-0.3), calc(var(--my,0px)*-0.3))',
        zIndex: 0,
      }} />

      {/* Orb 3 — teal accent */}
      <div className="auth-orb" style={{
        width: 280, height: 280,
        top: '55%', left: '65%',
        background: 'radial-gradient(circle, rgba(34,211,238,0.2) 0%, transparent 70%)',
        animation: 'orb-drift-3 14s ease-in-out infinite',
        zIndex: 0,
      }} />

      {/* Orb 4 — pink */}
      <div className="auth-orb" style={{
        width: 200, height: 200,
        top: '20%', right: '10%',
        background: 'radial-gradient(circle, rgba(236,72,153,0.18) 0%, transparent 70%)',
        animation: 'orb-drift-4 16s ease-in-out infinite',
        zIndex: 0,
      }} />

      {/* Rotating rings */}
      <div className="auth-ring" style={{
        width: 700, height: 700,
        marginLeft: -350, marginTop: -350,
        animation: 'ring-rotate 40s linear infinite',
        top: '50%', left: '50%',
        borderColor: 'rgba(91,110,245,0.08)',
        zIndex: 0,
      }} />
      <div className="auth-ring" style={{
        width: 500, height: 500,
        marginLeft: -250, marginTop: -250,
        animation: 'ring-rotate-reverse 28s linear infinite',
        top: '50%', left: '50%',
        borderColor: 'rgba(124,58,237,0.06)',
        zIndex: 0,
      }} />
      <div className="auth-ring" style={{
        width: 300, height: 300,
        marginLeft: -150, marginTop: -150,
        animation: 'ring-rotate 18s linear infinite',
        top: '50%', left: '50%',
        borderColor: 'rgba(91,110,245,0.1)',
        zIndex: 0,
      }} />

      {/* Dot grid overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(120,137,251,0.15) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 0%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 0%, transparent 100%)',
        zIndex: 1,
      }} />

      {/* Particles */}
      {particles.map(p => (
        <div key={p.id} className="auth-particle" style={{
          width: p.size, height: p.size,
          left: `${p.x}%`,
          bottom: '-10px',
          background: p.id % 3 === 0
            ? 'rgba(91,110,245,0.8)'
            : p.id % 3 === 1
            ? 'rgba(124,58,237,0.7)'
            : 'rgba(34,211,238,0.6)',
          boxShadow: `0 0 ${p.size * 2}px currentColor`,
          '--drift': `${p.drift}px`,
          animationName: 'particle-rise',
          animationDuration: `${p.duration}s`,
          animationDelay: `${p.delay}s`,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
          zIndex: 2,
        }} />
      ))}
    </div>
  )
}

// ─── Login Page ───────────────────────────────────────────────────────────────

export default function LoginPage() {
  const navigate = useNavigate()
  const { saveSession } = useAuth()

  const [form, setForm]         = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [errorKey, setErrorKey] = useState(0)

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login(form)
      saveSession(res)
      navigate('/chat')
    } catch (err) {
      setErrorKey(k => k + 1)
      setError(err.response?.data?.detail || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = () => {
    window.location.href = getGoogleLoginUrl()
  }

  return (
    <div className="auth-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px 16px' }}>
      <AuthBackground />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 440 }} className="auth-card-wrap">

        {/* Logo */}
        <div className="stagger-1" style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="auth-logo-icon" style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 56, height: 56, borderRadius: 16,
            background: 'rgba(91,110,245,0.15)',
            border: '1px solid rgba(91,110,245,0.3)',
            marginBottom: 16,
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="#7889fb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
            Welcome back
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, marginTop: 6 }}>
            Sign in to continue to AI Agent
          </p>
        </div>

        {/* Card */}
        <div className="auth-card stagger-2" style={{ borderRadius: 24, padding: 32 }} >

          {/* Google */}
          <button onClick={handleGoogle} className="auth-btn-google stagger-3" style={{ marginBottom: 24 }}>
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="stagger-3" style={{ position: 'relative', marginBottom: 24 }}>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', position: 'absolute', inset: '0 0 0 0', top: '50%' }} />
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <span style={{
                background: 'rgba(10,11,20,0.9)', padding: '0 14px',
                color: 'rgba(255,255,255,0.25)', fontSize: 11,
                fontFamily: 'monospace', letterSpacing: '0.15em', textTransform: 'uppercase',
              }}>or</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div key={errorKey} className="auth-error" style={{
              marginBottom: 16, padding: '12px 16px', borderRadius: 12,
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#f87171', fontSize: 13,
            }}>
              {error}
            </div>
          )}

          {/* Form fields */}
          <div className="stagger-4" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{
                display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: 11,
                fontWeight: 600, marginBottom: 8, letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="auth-input"
              />
            </div>

            <div>
              <label style={{
                display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: 11,
                fontWeight: 600, marginBottom: 8, letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="auth-input"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.3)', padding: 4, display: 'flex', alignItems: 'center',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
                >
                  <EyeIcon show={showPass} />
                </button>
              </div>
            </div>
          </div>

          <div className="stagger-5" style={{ marginTop: 20 }}>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="auth-btn-primary"
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{
                    width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff', borderRadius: '50%',
                    display: 'inline-block', animation: 'spin-cw 0.7s linear infinite',
                  }} />
                  Signing in...
                </span>
              ) : 'Sign in'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="stagger-5" style={{
          textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 13, marginTop: 24,
        }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{
            color: '#7889fb', fontWeight: 600, textDecoration: 'none',
            transition: 'color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = '#a5b4fc'}
            onMouseLeave={e => e.currentTarget.style.color = '#7889fb'}
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}















































// import { useState } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { login, getGoogleLoginUrl } from '../api/auth'
// import { useAuth } from '../context/AuthContext'

// // ─── Tiny Icon Components ──────────────────────────────────────────────────────

// const GoogleIcon = () => (
//   <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//     <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
//     <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
//     <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
//     <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
//   </svg>
// )

// const EyeIcon = ({ show }) => show ? (
//   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
//     <line x1="1" y1="1" x2="23" y2="23"/>
//   </svg>
// ) : (
//   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
//     <circle cx="12" cy="12" r="3"/>
//   </svg>
// )

// // ─── Login Page ────────────────────────────────────────────────────────────────

// export default function LoginPage() {
//   const navigate = useNavigate()
//   const { saveSession } = useAuth()

//   const [form, setForm]         = useState({ email: '', password: '' })
//   const [showPass, setShowPass] = useState(false)
//   const [loading, setLoading]   = useState(false)
//   const [error, setError]       = useState('')

//   const handleChange = (e) =>
//     setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setError('')
//     setLoading(true)
//     try {
//       const res = await login(form)
//       saveSession(res)
//       navigate('/chat')
//     } catch (err) {
//       setError(err.response?.data?.detail || 'Login failed. Please try again.')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleGoogle = () => {
//     window.location.href = getGoogleLoginUrl()
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-surface-950 bg-grid-pattern bg-grid">

//       {/* Ambient orbs */}
//       <div className="orb w-96 h-96 bg-brand-600 -top-32 -left-32 animate-pulse-slow" />
//       <div className="orb w-64 h-64 bg-purple-600 bottom-0 right-0 animate-float" style={{ animationDelay: '2s' }} />

//       {/* Card */}
//       <div className="relative z-10 w-full max-w-md animate-slide-up">

//         {/* Logo / Brand */}
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-600/20 border border-brand-500/30 mb-4">
//             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//               <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#7889fb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//             </svg>
//           </div>
//           <h1 className="text-2xl font-semibold text-white tracking-tight">Welcome back</h1>
//           <p className="text-white/40 text-sm mt-1">Sign in to continue to AI Agent</p>
//         </div>

//         {/* Form card */}
//         <div className="glass-card rounded-2xl p-8">

//           {/* Google button */}
//           <button onClick={handleGoogle} className="btn-google mb-6">
//             <GoogleIcon />
//             <span className="text-sm">Continue with Google</span>
//           </button>

//           {/* Divider */}
//           <div className="relative mb-6">
//             <div className="absolute inset-0 flex items-center">
//               <div className="w-full border-t border-white/8" />
//             </div>
//             <div className="relative flex justify-center">
//               <span className="bg-surface-950 px-3 text-white/30 text-xs font-mono uppercase tracking-widest">
//                 or
//               </span>
//             </div>
//           </div>

//           {/* Error */}
//           {error && (
//             <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in">
//               {error}
//             </div>
//           )}

//           {/* Form */}
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="block text-white/50 text-xs font-medium mb-1.5 uppercase tracking-wider">
//                 Email
//               </label>
//               <input
//                 type="email"
//                 name="email"
//                 value={form.email}
//                 onChange={handleChange}
//                 placeholder="you@example.com"
//                 required
//                 className="input-field"
//               />
//             </div>

//             <div>
//               <label className="block text-white/50 text-xs font-medium mb-1.5 uppercase tracking-wider">
//                 Password
//               </label>
//               <div className="relative">
//                 <input
//                   type={showPass ? 'text' : 'password'}
//                   name="password"
//                   value={form.password}
//                   onChange={handleChange}
//                   placeholder="••••••••"
//                   required
//                   className="input-field pr-11"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPass(!showPass)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
//                 >
//                   <EyeIcon show={showPass} />
//                 </button>
//               </div>
//             </div>

//             <button type="submit" disabled={loading} className="btn-primary mt-2">
//               {loading ? (
//                 <span className="flex items-center justify-center gap-2">
//                   <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
//                   Signing in...
//                 </span>
//               ) : 'Sign in'}
//             </button>
//           </form>
//         </div>

//         {/* Sign up link */}
//         <p className="text-center text-white/30 text-sm mt-6">
//           Don't have an account?{' '}
//           <Link to="/signup" className="text-brand-400 hover:text-brand-300 transition-colors font-medium">
//             Create one
//           </Link>
//         </p>
//       </div>
//     </div>
//   )
// }
