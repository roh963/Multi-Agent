import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axiosInstance'
import '../styles/auth-animations.css'

// ─── Cinematic Loading Rings ──────────────────────────────────────────────────

function SpinnerRings() {
  return (
    <div style={{ position: 'relative', width: 120, height: 120 }}>
      {/* Outer ring — slow CW */}
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: '50%',
        border: '1.5px solid transparent',
        borderTopColor: 'rgba(91,110,245,0.8)',
        borderRightColor: 'rgba(91,110,245,0.2)',
        animation: 'spin-cw 2.4s linear infinite',
      }} />

      {/* Middle ring — medium CCW */}
      <div style={{
        position: 'absolute', inset: 14,
        borderRadius: '50%',
        border: '1.5px solid transparent',
        borderTopColor: 'rgba(124,58,237,0.9)',
        borderLeftColor: 'rgba(124,58,237,0.2)',
        animation: 'spin-ccw 1.6s linear infinite',
      }} />

      {/* Inner ring — fast CW */}
      <div style={{
        position: 'absolute', inset: 28,
        borderRadius: '50%',
        border: '2px solid transparent',
        borderTopColor: '#fff',
        borderRightColor: 'rgba(255,255,255,0.15)',
        animation: 'spin-cw 0.9s linear infinite',
      }} />

      {/* Core dot */}
      <div style={{
        position: 'absolute', inset: 44,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(91,110,245,0.8), rgba(124,58,237,0.4))',
        boxShadow: '0 0 20px rgba(91,110,245,0.6)',
        animation: 'logo-glow 2s ease-in-out infinite',
      }} />
    </div>
  )
}

// ─── Animated Dots ────────────────────────────────────────────────────────────

function AnimatedDots() {
  return (
    <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center', marginLeft: 4 }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          display: 'inline-block',
          width: 4, height: 4,
          borderRadius: '50%',
          background: 'rgba(120,137,251,0.7)',
          animation: 'dot-pulse 1.4s ease-in-out infinite',
          animationDelay: `${i * 0.2}s`,
        }} />
      ))}
    </span>
  )
}

// ─── Background ───────────────────────────────────────────────────────────────

function CallbackBackground() {
  const particles = useRef(
    Array.from({ length: 14 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 2.5 + 0.8,
      delay: Math.random() * 10,
      duration: Math.random() * 10 + 14,
      drift: (Math.random() - 0.5) * 60,
    }))
  ).current

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden' }}>
      {/* Background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(91,110,245,0.12) 0%, transparent 70%), #05060f',
      }} />

      {/* Center orb */}
      <div className="auth-orb" style={{
        width: 600, height: 600,
        top: '50%', left: '50%',
        marginLeft: -300, marginTop: -300,
        background: 'radial-gradient(circle, rgba(91,110,245,0.2) 0%, rgba(124,58,237,0.1) 40%, transparent 70%)',
        animation: 'orb-drift-3 20s ease-in-out infinite',
        zIndex: 0,
      }} />

      {/* Outer ring (decorative) */}
      <div className="auth-ring" style={{
        width: 800, height: 800,
        marginLeft: -400, marginTop: -400,
        animation: 'ring-rotate 60s linear infinite',
        top: '50%', left: '50%',
        borderColor: 'rgba(91,110,245,0.04)',
        zIndex: 0,
      }} />
      <div className="auth-ring" style={{
        width: 550, height: 550,
        marginLeft: -275, marginTop: -275,
        animation: 'ring-rotate-reverse 40s linear infinite',
        top: '50%', left: '50%',
        borderColor: 'rgba(124,58,237,0.06)',
        zIndex: 0,
      }} />

      {/* Dot grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(120,137,251,0.1) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, black 0%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, black 0%, transparent 100%)',
        zIndex: 1,
      }} />

      {/* Particles */}
      {particles.map(p => (
        <div key={p.id} className="auth-particle" style={{
          width: p.size, height: p.size,
          left: `${p.x}%`,
          bottom: '-10px',
          background: p.id % 2 === 0
            ? 'rgba(91,110,245,0.7)'
            : 'rgba(124,58,237,0.6)',
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

// ─── Google Callback ──────────────────────────────────────────────────────────

export default function GoogleCallback() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { saveSession } = useAuth()
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    const token = params.get('token')

    if (!token) {
      navigate('/login?error=no_token', { replace: true })
      return
    }

    // ✅ Save to localStorage first so Axios interceptor can attach token
    localStorage.setItem('access_token', token)

    api.get('/users/me')
      .then((res) => {
        saveSession({ access_token: token, user: res.data })
        navigate('/chat', { replace: true })
      })
      .catch(() => {
        localStorage.removeItem('access_token')
        navigate('/login?error=google_failed', { replace: true })
      })
  }, [])

  return (
    <div className="auth-bg" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh',
    }}>
      <CallbackBackground />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36,
        padding: '0 24px',
        animation: 'slide-up-fade 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s both',
      }}>

        {/* Logo above spinner */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          animation: 'fade-in 0.6s ease 0.2s both',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, borderRadius: 9,
            background: 'rgba(91,110,245,0.15)',
            border: '1px solid rgba(91,110,245,0.3)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="#7889fb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 500, letterSpacing: '0.02em' }}>
            AI Agent
          </span>
        </div>

        {/* Spinner rings */}
        <SpinnerRings />

        {/* Status text */}
        <div style={{ textAlign: 'center' }}>
          <p style={{
            color: 'rgba(255,255,255,0.75)', fontSize: 16, fontWeight: 500,
            letterSpacing: '0.01em', margin: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            Completing sign-in
            <AnimatedDots />
          </p>
          <p style={{
            color: 'rgba(255,255,255,0.25)', fontSize: 12,
            fontFamily: 'monospace', letterSpacing: '0.08em',
            marginTop: 8,
            animation: 'fade-in 0.6s ease 0.6s both',
          }}>
            Verifying with Google
          </p>
        </div>

        {/* Progress bar */}
        <div style={{
          width: 200, height: 2,
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 99, overflow: 'hidden',
          animation: 'fade-in 0.4s ease 0.4s both',
        }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #5b6ef5, #7c3aed)',
            borderRadius: 99,
            boxShadow: '0 0 10px rgba(91,110,245,0.6)',
            animation: 'progress-fill 4s cubic-bezier(0.4,0,0.2,1) forwards',
          }} />
        </div>
      </div>
    </div>
  )
}






// src/pages/GoogleCallback.jsx
// import { useEffect, useRef } from 'react'
// import { useNavigate, useSearchParams } from 'react-router-dom'
// import { useAuth } from '../context/AuthContext'
// import api from '../api/axiosInstance'

// export default function GoogleCallback() {
//   const navigate = useNavigate()
//   const [params] = useSearchParams()
//   const { saveSession } = useAuth()
//   const called = useRef(false)

//   useEffect(() => {
//     if (called.current) return
//     called.current = true

//     const token = params.get('token')

//     if (!token) {
//       navigate('/login?error=no_token', { replace: true })
//       return
//     }

//     // ✅ PEHLE localStorage mein save karo
//     // Tabhi Axios interceptor token attach kar payega /users/me pe
//     localStorage.setItem('access_token', token)

//     api.get('/users/me')
//       .then((res) => {
//         saveSession({ access_token: token, user: res.data })
//         navigate('/chat', { replace: true })
//       })
//       .catch(() => {
//         // Token invalid tha — clean up
//         localStorage.removeItem('access_token')
//         navigate('/login?error=google_failed', { replace: true })
//       })
//   }, [])

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-surface-950">
//       <div className="flex flex-col items-center gap-4">
//         <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
//         <p className="text-white/40 text-sm font-mono">Completing Google sign-in...</p>
//       </div>
//     </div>
//   )
// }