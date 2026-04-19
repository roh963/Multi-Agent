import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { runPipeline, getMyJobs, getJob } from '../api/pipeline'

/* ═══════════════════════════════════════════════════════════════
   GLOBAL CSS — injected once into <head>
═══════════════════════════════════════════════════════════════ */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg0:   #060608;
  --bg1:   #0c0d12;
  --bg2:   #11121a;
  --line:  rgba(255,255,255,0.06);
  --line2: rgba(255,255,255,0.1);
  --t1:    #ffffff;
  --t2:    rgba(255,255,255,0.55);
  --t3:    rgba(255,255,255,0.26);
  --t4:    rgba(255,255,255,0.12);
  --a:     #7c6aff;
  --a2:    #a78bfa;
  --a3:    #c4b5fd;
  --green: #34d399;
  --amber: #fbbf24;
  --red:   #f87171;
  --blue:  #60a5fa;
  --sw:    260px;
  --sp:    cubic-bezier(0.16,1,0.3,1);
  --tr:    cubic-bezier(0.25,0.46,0.45,0.94);
  --font:  'Syne', sans-serif;
  --mono:  'JetBrains Mono', monospace;
}

html, body, #root { height: 100%; overflow: hidden; }
body { font-family: var(--font); background: var(--bg0); color: var(--t1); -webkit-font-smoothing: antialiased; }

/* scrollbar */
.sc::-webkit-scrollbar { width: 3px; }
.sc::-webkit-scrollbar-track { background: transparent; }
.sc::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 99px; }

/* ── keyframes ── */
@keyframes spin  { to { transform: rotate(360deg); } }
@keyframes spinR { to { transform: rotate(-360deg); } }
@keyframes pulse { 0%,100%{opacity:.45} 50%{opacity:1} }
@keyframes ping  { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(2.4);opacity:0} }
@keyframes ping2 { 0%{transform:scale(1);opacity:.3} 100%{transform:scale(3);opacity:0} }
@keyframes float { 0%,100%{transform:translateY(0) rotate(0deg)} 33%{transform:translateY(-7px) rotate(1.5deg)} 66%{transform:translateY(-3px) rotate(-1deg)} }
@keyframes ripple { from{transform:scale(0);opacity:.4} to{transform:scale(4);opacity:0} }
@keyframes slideUp   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
@keyframes slideLeft { from{opacity:0;transform:translateX(22px)} to{opacity:1;transform:translateX(0)} }
@keyframes fadeIn    { from{opacity:0} to{opacity:1} }
@keyframes scaleIn   { from{opacity:0;transform:scale(0.93)} to{opacity:1;transform:scale(1)} }
@keyframes shimmer   { 0%{background-position:-700px 0} 100%{background-position:700px 0} }
@keyframes gradMove  { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
@keyframes errShake  { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }
@keyframes orb       { from{transform:rotate(0deg) translateX(32px)} to{transform:rotate(360deg) translateX(32px)} }
@keyframes stampIn   { from{opacity:0;transform:scale(1.07) translateY(-5px)} to{opacity:1;transform:scale(1) translateY(0)} }
@keyframes barFill   { from{width:0%} }

/* ── utility ── */
.su  { animation: slideUp   0.38s var(--sp) both; }
.sl  { animation: slideLeft 0.42s var(--sp) both; }
.si  { animation: scaleIn   0.34s var(--sp) both; }
.fi  { animation: fadeIn    0.28s ease both; }
.st  { animation: stampIn   0.48s var(--sp) both; }

.bone {
  background: linear-gradient(90deg,rgba(255,255,255,.03) 25%,rgba(255,255,255,.07) 50%,rgba(255,255,255,.03) 75%);
  background-size: 1400px 100%;
  animation: shimmer 1.7s infinite linear;
  border-radius: 6px;
}

/* ── job item ── */
.ji {
  width:100%; text-align:left; padding:11px 12px; border-radius:12px;
  border:1px solid transparent; background:transparent; cursor:pointer;
  transition: background .18s, border-color .18s, box-shadow .2s;
  display:block; overflow:hidden; position:relative; font-family:var(--font);
}
.ji:hover { background:rgba(255,255,255,.04); border-color:var(--line); }
.ji.active {
  background:linear-gradient(135deg,rgba(124,106,255,.1),rgba(167,139,250,.06));
  border-color:rgba(124,106,255,.28);
  box-shadow:0 0 0 1px rgba(124,106,255,.07) inset, 0 2px 20px rgba(124,106,255,.07);
}

/* ── chip ── */
.chip {
  width:100%; text-align:left; padding:13px 16px; border-radius:12px;
  background:rgba(255,255,255,.02); border:1px solid var(--line);
  cursor:pointer; display:flex; align-items:center; gap:12px;
  transition:background .2s, border-color .2s, transform .2s;
  overflow:hidden; position:relative; font-family:var(--font);
}
.chip:hover { background:rgba(124,106,255,.06); border-color:rgba(124,106,255,.22); transform:translateY(-1px); }

/* ── new btn ── */
.nb {
  width:100%; display:flex; align-items:center; justify-content:center; gap:8px;
  padding:10px 14px; border-radius:12px; font-family:var(--font);
  background:rgba(124,106,255,.09); border:1px solid rgba(124,106,255,.2);
  color:var(--a2); font-size:12px; font-weight:600; cursor:pointer; letter-spacing:-.01em;
  transition:background .2s, border-color .2s, box-shadow .2s, transform .2s;
  overflow:hidden; position:relative;
}
.nb:hover { background:rgba(124,106,255,.16); border-color:rgba(124,106,255,.4); box-shadow:0 0 24px rgba(124,106,255,.16); transform:translateY(-1px); }

/* ── ghost btn ── */
.gb {
  background:transparent; border:1px solid var(--line); color:var(--t3);
  border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:center;
  transition:background .18s, border-color .18s, color .18s;
  overflow:hidden; position:relative; font-family:var(--font);
}
.gb:hover { background:rgba(255,255,255,.05); border-color:var(--line2); color:var(--t2); }

/* ── tab ── */
.tab {
  display:flex; align-items:center; gap:6px;
  padding:10px 14px; font-size:12px; font-weight:500; font-family:var(--font);
  border:none; border-bottom:2px solid transparent;
  border-radius:8px 8px 0 0;
  cursor:pointer; color:var(--t3); background:transparent;
  transition:color .18s, background .18s, border-color .18s;
  position:relative; bottom:-1px; overflow:hidden;
  white-space:nowrap;
}
.tab:hover:not(.ta) { color:var(--t2); background:rgba(255,255,255,.04); }
.tab.ta { color:var(--a2); border-bottom-color:var(--a); background:rgba(124,106,255,.08); }

/* ── input wrap ── */
.iw {
  display:flex; align-items:flex-end; gap:12px;
  background:rgba(255,255,255,.025); border:1px solid rgba(255,255,255,.08);
  border-radius:18px; padding:12px 14px; position:relative; overflow:hidden;
  transition:border-color .25s, box-shadow .25s, background .25s;
}
.iw:focus-within {
  border-color:rgba(124,106,255,.4);
  box-shadow:0 0 0 3px rgba(124,106,255,.08), 0 0 40px rgba(124,106,255,.06);
  background:rgba(255,255,255,.03);
}
.iw textarea { flex:1; background:transparent; color:var(--t1); font-size:13.5px; font-family:var(--font); border:none; outline:none; resize:none; line-height:1.65; min-height:22px; max-height:120px; letter-spacing:-.01em; }
.iw textarea::placeholder { color:var(--t4); }

/* ── send btn ── */
.sb {
  flex-shrink:0; width:36px; height:36px; border-radius:10px; border:none;
  display:flex; align-items:center; justify-content:center;
  transition:transform .2s, box-shadow .2s, background .2s;
  overflow:hidden; position:relative; cursor:pointer;
}
.sb:not(:disabled):hover { transform:scale(1.07); }
.sb:disabled { cursor:not-allowed; }

/* ── ripple ── */
.rr { position:relative; overflow:hidden; }
.rd { position:absolute; border-radius:50%; width:60px; height:60px; margin:-30px 0 0 -30px; background:rgba(124,106,255,.28); animation:ripple .65s ease-out forwards; pointer-events:none; }

/* ── report ── */
.rb h1 { font-size:clamp(18px,3vw,22px); font-weight:800; margin:6px 0 20px; padding-bottom:14px; border-bottom:1px solid var(--line); letter-spacing:-.035em; line-height:1.2; background:linear-gradient(135deg,#fff,rgba(255,255,255,.72)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
.rb h2 { font-size:14px; font-weight:700; color:rgba(255,255,255,.88); margin:28px 0 10px; letter-spacing:-.02em; display:flex; align-items:center; gap:9px; }
.rb h2::before { content:''; width:3px; height:14px; background:linear-gradient(var(--a),var(--a2)); border-radius:2px; display:inline-block; flex-shrink:0; }
.rb h3 { font-size:12px; font-weight:600; color:var(--t2); margin:18px 0 7px; letter-spacing:-.01em; }
.rb p  { font-size:13.5px; color:var(--t2); line-height:1.85; margin:3px 0; }
.rb .bul { display:flex; gap:11px; padding:4px 0; }
.rb .dot { color:rgba(124,106,255,.7); margin-top:7px; font-size:8px; flex-shrink:0; }
.rb .sp  { height:10px; }

/* ── overlay (mobile) ── */
.ov { position:fixed; inset:0; background:rgba(0,0,0,.6); z-index:19; backdrop-filter:blur(4px); animation:fadeIn .22s ease; }

/* ── responsive ── */
@media (max-width:768px) {
  :root { --sw: min(80vw, 280px); }
}
`

function StyleInjector() {
  useEffect(() => {
    const el = document.createElement('style')
    el.textContent = GLOBAL_CSS
    document.head.appendChild(el)
    return () => document.head.removeChild(el)
  }, [])
  return null
}

/* ═══════════════════════════════════════════════════════════════
   ICONS
═══════════════════════════════════════════════════════════════ */
const I = {
  logo: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>,
  send: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>,
  clock: () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  chev: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>,
  logout: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
  file: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
  globe: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>,
  db: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>,
  star: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  plus: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  zap: () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  menu: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>,
  search: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>,
  link: () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>,
  x: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
}

/* ═══════════════════════════════════════════════════════════════
   RIPPLE BUTTON
═══════════════════════════════════════════════════════════════ */
function Btn({ cls = '', style = {}, onClick, children, disabled, title }) {
  const [ripples, setRipples] = useState([])
  const uid = useRef(0)
  const fire = (e) => {
    if (disabled) return
    const r = e.currentTarget.getBoundingClientRect()
    const k = ++uid.current
    setRipples(p => [...p, { k, x: e.clientX - r.left, y: e.clientY - r.top }])
    setTimeout(() => setRipples(p => p.filter(d => d.k !== k)), 700)
    onClick?.(e)
  }
  return (
    <button className={`rr ${cls}`} style={style} onClick={fire} disabled={disabled} title={title}>
      {ripples.map(r => <span key={r.k} className="rd" style={{ left: r.x, top: r.y }} />)}
      {children}
    </button>
  )
}

/* ═══════════════════════════════════════════════════════════════
   STATUS BADGE
═══════════════════════════════════════════════════════════════ */
function Badge({ status }) {
  const m = {
    pending: { c: 'var(--amber)', bg: 'rgba(251,191,36,.1)', bd: 'rgba(251,191,36,.2)', l: 'Pending', p: false },
    running: { c: 'var(--blue)', bg: 'rgba(96,165,250,.1)', bd: 'rgba(96,165,250,.25)', l: 'Running', p: true },
    completed: { c: 'var(--green)', bg: 'rgba(52,211,153,.1)', bd: 'rgba(52,211,153,.2)', l: 'Done', p: false },
    failed: { c: 'var(--red)', bg: 'rgba(248,113,113,.1)', bd: 'rgba(248,113,113,.2)', l: 'Failed', p: false },
  }
  const s = m[status] || m.pending
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, fontFamily: 'var(--mono)', fontWeight: 500, letterSpacing: '.05em', textTransform: 'uppercase', color: s.c, background: s.bg, padding: '3px 9px', borderRadius: 99, border: `1px solid ${s.bd}`, flexShrink: 0 }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.c, flexShrink: 0, boxShadow: `0 0 6px ${s.c}`, animation: s.p ? 'pulse 1.6s ease-in-out infinite' : 'none' }} />
      {s.l}
    </span>
  )
}

/* skeleton */
function Bone() {
  return (
    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
      <div className="bone" style={{ height: 11, width: '76%' }} />
      <div className="bone" style={{ height: 10, width: '50%' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <div className="bone" style={{ height: 8, width: '30%' }} />
        <div className="bone" style={{ height: 8, width: '32%' }} />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   JOB ITEM
═══════════════════════════════════════════════════════════════ */
function JobItem({ job, isActive, onClick, delay = 0 }) {
  const d = new Date(job.created_at)
  const ts = d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' · ' +
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return (
    <Btn cls={`ji su ${isActive ? 'active' : ''}`} style={{ animationDelay: `${delay}s` }} onClick={onClick}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
        <p style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.5, flex: 1, color: isActive ? '#e0e7ff' : 'var(--t3)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', transition: 'color .18s', letterSpacing: '-.01em' }}>
          {job.topic}
        </p>
        <span style={{ color: isActive ? 'rgba(124,106,255,.6)' : 'var(--t4)', flexShrink: 0, marginTop: 2, transition: 'color .18s' }}><I.chev /></span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Badge status={job.status} />
        <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--t4)', letterSpacing: '.02em' }}>{ts}</span>
      </div>
    </Btn>
  )
}

/* ═══════════════════════════════════════════════════════════════
   RUNNING STATE  (cinematic spinner + smooth step transitions)
═══════════════════════════════════════════════════════════════ */
const STEPS = [
  { label: 'Initializing agents', color: '#a78bfa', emoji: '⚡' },
  { label: 'Searching the web', color: '#60a5fa', emoji: '🌐' },
  { label: 'Scraping content', color: '#34d399', emoji: '📥' },
  { label: 'Analyzing data', color: '#fbbf24', emoji: '🔬' },
  { label: 'Generating report', color: '#f472b6', emoji: '📝' },
  { label: 'Reviewing output', color: '#34d399', emoji: '✅' },
]

function RunningState() {
  const [step, setStep] = useState(0)
  const [show, setShow] = useState(true)

  useEffect(() => {
    const t = setInterval(() => {
      setShow(false)
      setTimeout(() => { setStep(s => (s + 1) % STEPS.length); setShow(true) }, 300)
    }, 2800)
    return () => clearInterval(t)
  }, [])

  const pct = ((step + 1) / STEPS.length) * 100
  const cur = STEPS[step]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 'clamp(28px,4vh,42px)', padding: '40px clamp(20px,5vw,48px)', overflow: 'auto' }}>

      {/* ── Cinematic spinner ── */}
      <div style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
        {[0, 1].map(i => (
          <div key={i} style={{ position: 'absolute', inset: -8 - i * 10, borderRadius: '50%', border: `1px solid rgba(124,106,255,${.14 - i * .05})`, animation: `ping${i ? '2' : ''} ${2.4 + i * .7}s ease-in-out infinite`, animationDelay: `${i * .35}s` }} />
        ))}
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px solid transparent', borderTopColor: 'rgba(124,106,255,.9)', borderRightColor: 'rgba(124,106,255,.1)', animation: 'spin 2.2s linear infinite' }} />
        <div style={{ position: 'absolute', inset: 14, borderRadius: '50%', border: '1.5px solid transparent', borderTopColor: 'rgba(167,139,250,.9)', borderLeftColor: 'rgba(167,139,250,.1)', animation: 'spinR 1.55s linear infinite' }} />
        <div style={{ position: 'absolute', inset: 28, borderRadius: '50%', border: '2px solid transparent', borderTopColor: 'rgba(255,255,255,.9)', animation: 'spin .88s linear infinite' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: 6, height: 6, borderRadius: '50%', background: 'var(--a3)', marginTop: -3, marginLeft: -3, boxShadow: '0 0 8px var(--a3)', animation: 'orb 2.2s linear infinite' }} />
        <div style={{ position: 'absolute', inset: 38, borderRadius: '50%', background: 'linear-gradient(135deg,var(--a),var(--a2))', boxShadow: '0 0 20px rgba(124,106,255,.7)', animation: 'pulse 2s ease-in-out infinite' }} />
      </div>

      {/* ── Step label with smooth CSS transition ── */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--t4)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>Pipeline Running</p>
        <div style={{ height: 26, overflow: 'hidden' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontSize: 13, fontFamily: 'var(--mono)', fontWeight: 500,
            color: cur.color, letterSpacing: '.04em',
            transition: 'opacity .26s ease, transform .26s var(--sp)',
            opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(8px)',
          }}>
            <span style={{ fontSize: 16 }}>{cur.emoji}</span>
            {cur.label}
          </div>
        </div>
      </div>

      {/* ── Step dots ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        {STEPS.map((s, i) => (
          <div key={i} style={{
            height: 3, borderRadius: 99,
            width: i === step ? 28 : 7,
            background: i === step ? 'linear-gradient(90deg,var(--a),var(--a2))' : i < step ? 'rgba(124,106,255,.4)' : 'rgba(255,255,255,.07)',
            boxShadow: i === step ? '0 0 10px rgba(124,106,255,.8)' : 'none',
            transition: 'width .5s var(--sp), background .4s, box-shadow .4s',
          }} />
        ))}
      </div>

      {/* ── Progress bar ── */}
      <div style={{ width: '100%', maxWidth: 320 }}>
        <div style={{ height: 2, background: 'rgba(255,255,255,.05)', borderRadius: 99, overflow: 'hidden', position: 'relative' }}>
          <div style={{
            height: '100%', borderRadius: 99,
            width: `${pct}%`,
            background: 'linear-gradient(90deg,var(--a),var(--a2),var(--a3))',
            backgroundSize: '200% 100%',
            animation: 'gradMove 2s ease infinite',
            boxShadow: '0 0 12px rgba(124,106,255,.7)',
            transition: 'width .5s var(--sp)',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7, fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--t4)', letterSpacing: '.04em' }}>
          <span>Step {step + 1} / {STEPS.length}</span>
          <span>{Math.round(pct)}%</span>
        </div>
      </div>

      {/* ── Ghost skeleton preview ── */}
      <div style={{ width: '100%', maxWidth: 480, opacity: .15 }}>
        {[.72, 1, .86, .62, .94, .74].map((w, i) => (
          <div key={i} className="bone" style={{ height: i === 0 ? 14 : 11, width: `${w * 100}%`, marginBottom: i === 0 ? 16 : 8, borderRadius: i === 0 ? 8 : 5 }} />
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   TAB COMPONENTS
═══════════════════════════════════════════════════════════════ */
function EmptyTab({ label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12 }}>
      <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,.03)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t4)' }}>
        <I.search />
      </div>
      <p style={{ fontSize: 12, color: 'var(--t4)', fontFamily: 'var(--mono)' }}>No {label} available</p>
    </div>
  )
}

function ReportTab({ content }) {
  if (!content?.trim() || content === 'None') return <EmptyTab label="report" />
  return (
    <div className="rb" style={{ maxWidth: 740 }}>
      {content.split('\n').map((line, i) => {
        if (line.startsWith('# ')) return <h1 key={i}>{line.slice(2)}</h1>
        if (line.startsWith('## ')) return <h2 key={i}>{line.slice(3)}</h2>
        if (line.startsWith('### ')) return <h3 key={i}>{line.slice(4)}</h3>
        if (line.startsWith('- ') || line.startsWith('* '))
          return <div key={i} className="bul"><span className="dot">◆</span><p>{line.slice(2)}</p></div>
        if (!line.trim()) return <div key={i} className="sp" />
        return <p key={i}>{line}</p>
      })}
    </div>
  )
}

function SearchTab({ content }) {
  if (!content?.trim() || content === 'None') return <EmptyTab label="search results" />
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {content.split(/\n{2,}/).filter(b => b.trim()).map((block, i) => {
        const lines = block.split('\n').filter(l => l.trim())
        if (!lines.length) return null
        const m = lines[0].match(/^\[?\d+\]?\s*(.+?)(?:\s*[—–]\s*"(.+)")?$/)
        const source = m?.[1] || lines[0]
        const title = m?.[2] || ''
        const url = lines[1]?.startsWith('http') ? lines[1] : ''
        const snippet = lines.slice(url ? 2 : 1).join(' ')
        return (
          <div key={i} className="su" style={{ padding: '15px 17px', borderRadius: 14, background: 'rgba(255,255,255,.02)', border: '1px solid var(--line)', animationDelay: `${i * .04}s`, transition: 'border-color .18s, background .18s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,106,255,.22)'; e.currentTarget.style.background = 'rgba(124,106,255,.04)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.background = 'rgba(255,255,255,.02)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                {title && <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,.82)', marginBottom: 3, lineHeight: 1.4 }}>{title}</p>}
                <p style={{ fontSize: 11, color: 'rgba(124,106,255,.75)', fontWeight: 600, fontFamily: 'var(--mono)', letterSpacing: '.02em' }}>{source}</p>
              </div>
              <span style={{ color: 'var(--t4)', flexShrink: 0, marginTop: 2 }}><I.link /></span>
            </div>
            {url && <p style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--t4)', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url}</p>}
            {snippet && <p style={{ fontSize: 12.5, color: 'var(--t3)', lineHeight: 1.65 }}>{snippet}</p>}
          </div>
        )
      })}
    </div>
  )
}

function ScrapedTab({ content }) {
  if (!content?.trim() || content === 'None') return <EmptyTab label="scraped content" />
  const lines = content.split('\n').filter(l => l.trim())
  const hasSummary = lines[0] && !lines[0].includes(':') && lines[0].length < 100
  const summary = hasSummary ? lines[0] : null
  const srcLines = hasSummary ? lines.slice(1) : lines
  const sources = srcLines.map(l => {
    const m = l.match(/^(.+?)\s*[—–-]\s*(.+)$/) || l.match(/^(.+?):\s*(.+)$/)
    return m ? { domain: m[1].trim(), detail: m[2].trim() } : { domain: l.trim(), detail: '' }
  }).filter(s => s.domain)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {summary && <p style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--t4)', paddingBottom: 14, borderBottom: '1px solid var(--line)', letterSpacing: '.03em' }}>{summary}</p>}
      {sources.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 10 }}>
          {sources.map((src, i) => {
            const m = src.detail.match(/([\d,]+)\s*chars?/)
            const chars = m?.[1]; const extra = m ? src.detail.replace(m[0], '').trim() : src.detail
            return (
              <div key={i} className="su" style={{ padding: 16, borderRadius: 14, background: 'rgba(255,255,255,.02)', border: '1px solid var(--line)', animationDelay: `${i * .05}s`, transition: 'border-color .18s, transform .2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,106,255,.22)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.transform = 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--a)', boxShadow: '0 0 8px var(--a)' }} />
                  <p style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'rgba(124,106,255,.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{src.domain}</p>
                </div>
                {chars
                  ? <><p style={{ fontSize: 24, fontWeight: 700, color: 'rgba(255,255,255,.88)', letterSpacing: '-.03em', marginBottom: 2 }}>{chars}</p><p style={{ fontSize: 11, color: 'var(--t4)' }}>chars scraped</p></>
                  : <p style={{ fontSize: 12, color: 'var(--t3)', lineHeight: 1.65 }}>{src.detail || 'Content scraped'}</p>}
                {extra && chars && <p style={{ fontSize: 10, color: 'var(--t4)', marginTop: 4 }}>{extra}</p>}
              </div>
            )
          })}
        </div>
      ) : (
        <pre style={{ fontSize: 12, color: 'var(--t2)', fontFamily: 'var(--mono)', whiteSpace: 'pre-wrap', lineHeight: 1.75 }}>{content}</pre>
      )}
    </div>
  )
}

function FeedbackTab({ content }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t) }, [])
  if (!content?.trim() || content === 'None') return <EmptyTab label="feedback" />
  const sm = content.match(/(\d+\.?\d*)\/(\d+)/)
  const score = sm ? parseFloat(sm[1]) : null
  const max = sm ? parseFloat(sm[2]) : 10
  const pct = score !== null ? (score / max) * 100 : null
  const feedText = content.replace(/Score:\s*[\d.]+\/[\d.]+\n?/, '').trim()
  const c = score >= 8 ? 'var(--green)' : score >= 6 ? 'var(--amber)' : 'var(--red)'
  const bg = score >= 8 ? 'rgba(52,211,153,.07)' : score >= 6 ? 'rgba(251,191,36,.07)' : 'rgba(248,113,113,.07)'
  const bd = score >= 8 ? 'rgba(52,211,153,.15)' : score >= 6 ? 'rgba(251,191,36,.15)' : 'rgba(248,113,113,.15)'
  return (
    <div style={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {score !== null && (
        <div className="st" style={{ padding: '22px', borderRadius: 16, background: bg, border: `1px solid ${bd}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 18 }}>
            <div>
              <span style={{ fontSize: 48, fontWeight: 800, color: c, letterSpacing: '-.04em', lineHeight: 1 }}>{score}</span>
              <span style={{ fontSize: 20, color: 'var(--t4)', fontWeight: 400 }}>/{max}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ height: 6, background: 'rgba(255,255,255,.05)', borderRadius: 99, overflow: 'hidden', marginBottom: 7 }}>
                <div style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg,${c},${c}99)`, boxShadow: `0 0 14px ${c}50`, width: mounted ? `${pct}%` : '0%', transition: 'width 1.2s var(--sp)' }} />
              </div>
              <p style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--t4)', letterSpacing: '.06em', textTransform: 'uppercase' }}>Quality Score</p>
            </div>
          </div>
        </div>
      )}
      {feedText && (
        <div style={{ padding: '20px', borderRadius: 14, background: 'rgba(255,255,255,.02)', border: '1px solid var(--line)' }}>
          <p style={{ fontSize: 13.5, color: 'var(--t2)', lineHeight: 1.85 }}>{feedText}</p>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   JOB DETAIL
═══════════════════════════════════════════════════════════════ */
const TABS = [
  { id: 'report', label: 'Report', Icon: I.file, field: 'report' },
  { id: 'search_results', label: 'Search', Icon: I.globe, field: 'search_results' },
  { id: 'scraped_content', label: 'Scraped', Icon: I.db, field: 'scraped_content' },
  { id: 'feedback', label: 'Feedback', Icon: I.star, field: 'feedback' },
]

function JobDetail({ job }) {
  const [tab, setTab] = useState('report')
  const [cKey, setCKey] = useState(0)
  const isLoading = job.status === 'running' || job.status === 'pending'
  const elapsed = job.completed_at ? Math.round((new Date(job.completed_at) - new Date(job.created_at)) / 1000) : null

  const switchTab = (id) => { if (id === tab) return; setTab(id); setCKey(k => k + 1) }

  const renderContent = () => {
    if (isLoading) return <RunningState />
    if (tab === 'report') return <ReportTab content={job.report} />
    if (tab === 'search_results') return <SearchTab content={job.search_results} />
    if (tab === 'scraped_content') return <ScrapedTab content={job.scraped_content} />
    if (tab === 'feedback') return <FeedbackTab content={job.feedback} />
    return null
  }

  return (
    <div className="sl" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Header */}
      <div style={{ padding: 'clamp(16px,3vw,24px) clamp(18px,4vw,32px) 18px', borderBottom: '1px solid var(--line)', flexShrink: 0, background: 'linear-gradient(180deg,rgba(124,106,255,.04) 0%,transparent 100%)', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent 0%,rgba(124,106,255,.3) 40%,rgba(167,139,250,.3) 60%,transparent 100%)' }} />
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,106,255,.07),transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 12, position: 'relative' }}>
          <h2
            style={{
              fontSize: 'clamp(25px,4.5vw,18px)',
              fontWeight: 700, // bold
              color: 'var(--t1)',
              lineHeight: 1.4,
              flex: 1,
              letterSpacing: '.045em',
              margin: '10px 1px',   // top-bottom 10px, left-right 0
              padding: '8px 12px' // andar ka space
            }}
          >
            {job.topic}
          </h2>
          <Badge status={job.status} />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', position: 'relative' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--t4)', letterSpacing: '.02em' }}>
            <I.clock />{new Date(job.created_at).toLocaleString()}
          </span>
          {elapsed && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--t4)' }}>
              <I.zap />{elapsed}s
            </span>
          )}
          {job.status === 'failed' && job.error_message && (
            <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'rgba(243, 151, 151, 0.65)' }}>{job.error_message}</span>
          )}
        </div>
      </div>

      {/* Tabs — scrollable on mobile */}
      <div style={{ display: 'flex', gap: 1, padding: '0 clamp(18px,4vw,32px)', borderBottom: '1px solid var(--line)', flexShrink: 0, background: 'rgba(255,255,255,.01)', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {TABS.map(t => {
          const hasData = !isLoading && job[t.field] && job[t.field] !== 'None' && job[t.field].trim()
          const active = tab === t.id
          return (
            <Btn key={t.id} cls={`tab${active ? ' ta' : ''}`} onClick={() => switchTab(t.id)}>
              <t.Icon />
              <span>{t.label}</span>
              {hasData && <span style={{ width: 5, height: 5, borderRadius: '50%', background: active ? 'var(--a2)' : 'rgba(255,255,255,.2)', boxShadow: active ? '0 0 6px var(--a2)' : 'none', transition: 'all .2s' }} />}
            </Btn>
          )
        })}
      </div>

      {/* Content */}
      <div key={cKey} className="sc fi" style={{ flex: 1, overflowY: 'auto', padding: 'clamp(18px,3vw,28px) clamp(18px,4vw,32px)' }}>
        {renderContent()}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   EMPTY STATE
═══════════════════════════════════════════════════════════════ */
function EmptyState({ onSuggest }) {
  const chips = [
    { icon: '⚛️', text: 'Latest advancements in quantum computing' },
    { icon: '🤖', text: 'Impact of AI on software engineering jobs' },
    { icon: '🌱', text: 'Climate tech startups in 2025' },
    { icon: '🧠', text: 'State of large language models' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 'clamp(24px,5vw,64px) clamp(16px,5vw,48px)', gap: 'clamp(28px,4vw,44px)', overflow: 'auto' }}>

      {/* Hero */}
      <div className="si" style={{ textAlign: 'center' }}>
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
          {[80, 60, 42].map((s, i) => (
            <div key={i} style={{ position: 'absolute', width: s, height: s, borderRadius: '50%', border: `1px solid rgba(124,106,255,${.12 - i * .04})`, animation: `pulse ${2 + i * .5}s ease-in-out infinite`, animationDelay: `${i * .3}s` }} />
          ))}
          <div style={{ width: 52, height: 52, borderRadius: 18, zIndex: 1, position: 'relative', background: 'linear-gradient(135deg,rgba(124,106,255,.18),rgba(167,139,250,.1))', border: '1px solid rgba(124,106,255,.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--a2)', boxShadow: '0 0 40px rgba(124,106,255,.2),inset 0 1px 0 rgba(255,255,255,.08)', animation: 'float 5s ease-in-out infinite' }}>
            <I.logo />
            <div style={{ position: 'absolute', inset: 0, borderRadius: 18, background: 'linear-gradient(180deg,rgba(255,255,255,.08) 0%,transparent 100%)', pointerEvents: 'none' }} />
          </div>
        </div>
        <h3 style={{ fontSize: 'clamp(16px,3vw,20px)', fontWeight: 800, color: 'var(--t1)', marginBottom: 10, letterSpacing: '-.035em', lineHeight: 1.2 }}>Start a research session</h3>
        <p style={{ fontSize: 'clamp(12px,2vw,13.5px)', color: 'var(--t3)', maxWidth: 360, lineHeight: 1.7, margin: '0 auto' }}>
          Enter any topic. Our multi-agent pipeline will search, scrape, and generate a comprehensive report.
        </p>
      </div>

      {/* Chips */}
      <div className="su" style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--t4)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Try these</span>
          <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {chips.map((c, i) => (
            <Btn key={c.text} cls="chip" style={{ animationDelay: `${i * .07}s` }} onClick={() => onSuggest(c.text)}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{c.icon}</span>
              <span style={{ fontSize: 12.5, color: 'var(--t3)', flex: 1, lineHeight: 1.4, transition: 'color .18s' }}>{c.text}</span>
              <span style={{ color: 'var(--t4)', flexShrink: 0 }}><I.chev /></span>
            </Btn>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR COMPONENT
═══════════════════════════════════════════════════════════════ */
function Sidebar({ open, onClose, jobs, loadingJobs, activeJob, onSelect, onNew, user, onLogout, isMobile }) {
  const [logHov, setLogHov] = useState(false)
  const initials = (user?.name || user?.email || '?')[0].toUpperCase()

  const sidebarStyle = isMobile ? {
    position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 20,
    width: 'var(--sw)',
    transform: open ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform .34s var(--sp)',
  } : {
    position: 'relative', zIndex: 2,
    width: open ? 'var(--sw)' : 0,
    transition: 'width .34s var(--sp)',
    overflow: 'hidden',
  }

  return (
    <>
      {isMobile && open && <div className="ov" onClick={onClose} />}

      <aside style={{
        ...sidebarStyle,
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        borderRight: '1px solid var(--line)',
        background: 'rgba(8,8,14,.97)',
        backdropFilter: 'blur(28px)',
      }}>
        {/* Top accent */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(124,106,255,.38),transparent)' }} />

        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '16px 18px', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, flexShrink: 0, background: 'linear-gradient(135deg,rgba(124,106,255,.2),rgba(167,139,250,.1))', border: '1px solid rgba(124,106,255,.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--a2)', boxShadow: '0 0 20px rgba(124,106,255,.18),inset 0 1px 0 rgba(255,255,255,.08)' }}>
            <I.logo />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,.85)', letterSpacing: '-.02em', whiteSpace: 'nowrap' }}>AI Research</p>
            <p style={{ fontSize: 10, color: 'var(--t4)', fontFamily: 'var(--mono)', letterSpacing: '.04em' }}>Pipeline</p>
          </div>
          {isMobile && (
            <button className="gb" style={{ width: 28, height: 28, flexShrink: 0 }} onClick={onClose}>
              <I.x />
            </button>
          )}
        </div>

        {/* New research */}
        <div style={{ padding: '12px 14px', flexShrink: 0 }}>
          <Btn cls="nb" onClick={onNew}><I.plus />&nbsp;New Research</Btn>
        </div>

        {/* Jobs */}
        <div className="sc" style={{ flex: 1, overflowY: 'auto', padding: '2px 10px 14px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {loadingJobs
            ? [1, 2, 3, 4, 5].map(i => <Bone key={i} />)
            : jobs.length === 0
              ? <div style={{ textAlign: 'center', paddingTop: 48, color: 'var(--t4)', fontSize: 11, fontFamily: 'var(--mono)' }}>
                <div style={{ fontSize: 22, marginBottom: 10, opacity: .4 }}>◈</div>No jobs yet
              </div>
              : jobs.map((job, idx) => (
                <JobItem key={job.id} job={job} isActive={activeJob?.id === job.id}
                  onClick={() => { onSelect(job); if (isMobile) onClose() }}
                  delay={Math.min(idx * .04, .28)} />
              ))
          }
        </div>

        {/* User */}
        <div style={{ borderTop: '1px solid var(--line)', padding: '12px 14px', flexShrink: 0, background: 'rgba(255,255,255,.015)' }}>
          <div className="su" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 12 }}>
            {user?.picture
              ? <img src={user.picture} alt="" style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, boxShadow: '0 0 0 2px rgba(124,106,255,.3)' }} />
              : <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,rgba(124,106,255,.6),rgba(167,139,250,.5))', border: '1px solid rgba(124,106,255,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--a3)', boxShadow: '0 0 12px rgba(124,106,255,.2)' }}>
                {initials}
              </div>
            }
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.68)', letterSpacing: '-.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'User'}</p>
              <p style={{ fontSize: 10, color: 'var(--t4)', fontFamily: 'var(--mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
            </div>
            <button title="Sign out"
              onMouseEnter={() => setLogHov(true)} onMouseLeave={() => setLogHov(false)}
              onClick={onLogout}
              style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: logHov ? 'rgba(248,113,113,.12)' : 'rgba(255,255,255,.04)', border: `1px solid ${logHov ? 'rgba(248,113,113,.28)' : 'var(--line)'}`, color: logHov ? 'var(--red)' : 'var(--t4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all .22s' }}>
              <I.logout />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export default function ChatPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [jobs, setJobs] = useState([])
  const [activeJob, setActiveJob] = useState(null)
  const [topic, setTopic] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [error, setError] = useState('')
  const [errorKey, setErrorKey] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 769)
  const pollRef = useRef(null)
  const textareaRef = useRef(null)

  /* ── Responsive ── */
  useEffect(() => {
    const handler = () => {
      const mob = window.innerWidth < 769
      setIsMobile(mob)
      if (mob) setSidebarOpen(false)
      else setSidebarOpen(true)
    }
    window.addEventListener('resize', handler)
    handler()
    return () => window.removeEventListener('resize', handler)
  }, [])

  /* ── Load jobs ── */
  useEffect(() => {
    getMyJobs().then(setJobs).catch(() => { }).finally(() => setLoadingJobs(false))
  }, [])

  /* ── Poll ── */
  const startPolling = useCallback((jobId) => {
    clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      try {
        const updated = await getJob(jobId)
        setActiveJob(updated)
        setJobs(prev => prev.map(j => j.id === jobId ? updated : j))
        if (updated.status === 'completed' || updated.status === 'failed') clearInterval(pollRef.current)
      } catch { }
    }, 3000)
  }, [])
  useEffect(() => () => clearInterval(pollRef.current), [])

  /* ── Submit ── */
  const handleSubmit = async (forceTopic) => {
    const t = (forceTopic ?? topic).trim()
    if (!t || submitting) return
    setError(''); setSubmitting(true); setTopic('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    try {
      const job = await runPipeline(t)
      setJobs(prev => [job, ...prev])
      setActiveJob(job)
      if (job.status === 'running' || job.status === 'pending') startPolling(job.id)
    } catch (err) {
      setErrorKey(k => k + 1)
      setError(err.response?.data?.detail || 'Failed to start pipeline.')
    } finally { setSubmitting(false) }
  }

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }
  const handleSelect = (job) => { setActiveJob(job); if (job.status === 'running' || job.status === 'pending') startPolling(job.id) }
  const handleLogout = () => { logout(); navigate('/login') }
  const canSend = topic.trim() && !submitting

  return (
    <>
      <StyleInjector />
      <div style={{ display: 'flex', height: '100vh', background: 'var(--bg0)', overflow: 'hidden', fontFamily: 'var(--font)', color: 'var(--t1)', position: 'relative' }}>

        {/* Ambient glows */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', top: -200, left: -150, width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,106,255,.04) 0%,transparent 65%)' }} />
          <div style={{ position: 'absolute', bottom: -200, right: -150, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(167,139,250,.03) 0%,transparent 65%)' }} />
        </div>

        {/* ── Sidebar ── */}
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          jobs={jobs}
          loadingJobs={loadingJobs}
          activeJob={activeJob}
          onSelect={handleSelect}
          onNew={() => { setActiveJob(null); clearInterval(pollRef.current); if (isMobile) setSidebarOpen(false) }}
          user={user}
          onLogout={handleLogout}
          isMobile={isMobile}
        />

        {/* ── Main ── */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden', position: 'relative', zIndex: 1 }}>

          {/* Topbar */}
          <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 'clamp(9px,2vw,12px) clamp(14px,3vw,22px)', borderBottom: '1px solid var(--line)', flexShrink: 0, background: 'rgba(6,6,8,.9)', backdropFilter: 'blur(20px)', position: 'relative', zIndex: 10 }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent 0%,rgba(124,106,255,.22) 40%,rgba(167,139,250,.22) 60%,transparent 100%)' }} />

            <Btn cls="gb" style={{ width: 34, height: 34 }} onClick={() => setSidebarOpen(o => !o)}>
              <I.menu />
            </Btn>

            {/* Mobile: active job title */}
            {isMobile && activeJob && (
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--t2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-.01em' }}>
                {activeJob.topic}
              </p>
            )}

            <div style={{ flex: 1 }} />

            {/* Job count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 99, background: 'rgba(255,255,255,.03)', border: '1px solid var(--line)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--a)', boxShadow: '0 0 6px var(--a)', animation: 'pulse 2s ease-in-out infinite' }} />
              <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--t4)', letterSpacing: '.05em' }}>
                {jobs.length} job{jobs.length !== 1 ? 's' : ''}
              </span>
            </div>
          </header>

          {/* Content */}
          <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            {activeJob
              ? <JobDetail key={activeJob.id} job={activeJob} />
              : <EmptyState onSuggest={handleSubmit} />
            }
          </div>

          {/* Input bar */}
          <div style={{ padding: 'clamp(10px,2vw,14px) clamp(14px,3vw,22px) clamp(12px,2vw,18px)', borderTop: '1px solid var(--line)', flexShrink: 0, background: 'rgba(6,6,8,.88)', backdropFilter: 'blur(20px)' }}>

            {error && (
              <div key={errorKey} style={{ marginBottom: 12, padding: '11px 15px', borderRadius: 12, background: 'rgba(248,113,113,.07)', border: '1px solid rgba(248,113,113,.18)', color: 'var(--red)', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 8, animation: 'errShake .35s ease, fadeIn .25s ease' }}>
                ⚠ {error}
              </div>
            )}

            <div className="iw">
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.05),transparent)', pointerEvents: 'none' }} />
              <div style={{ color: 'var(--t4)', paddingBottom: 2, flexShrink: 0 }}><I.search /></div>
              <textarea
                ref={textareaRef}
                rows={1}
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={handleKeyDown}
                onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px' }}
                placeholder="Enter a research topic… (Enter to run)"
                disabled={submitting}
                style={{ opacity: submitting ? .4 : 1 }}
              />
              <Btn cls="sb" onClick={handleSubmit} disabled={!canSend} style={{
                background: canSend ? 'linear-gradient(135deg,var(--a),var(--a2))' : 'rgba(124,106,255,.1)',
                color: canSend ? '#fff' : 'var(--t4)',
                boxShadow: canSend ? '0 4px 20px rgba(124,106,255,.42),0 0 0 1px rgba(124,106,255,.22)' : 'none',
              }}>
                {submitting
                  ? <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.15)', borderTopColor: 'rgba(255,255,255,.8)', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                  : <I.send />
                }
              </Btn>
            </div>

            <p style={{ textAlign: 'center', fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--t4)', marginTop: 9, letterSpacing: '.04em' }}>
              ↵ Enter to research · ⇧+Enter for new line
            </p>
          </div>
        </main>
      </div>
    </>
  )
}

























// import { useState, useEffect, useRef, useCallback } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useAuth } from '../context/AuthContext'
// import { runPipeline, getMyJobs, getJob } from '../api/pipeline'

// // ─── Injected Keyframes ─────────────────────────────────────────────────────────
// const STYLES = `
//   /* Shimmer for skeletons */
//   @keyframes shimmer {
//     0%   { background-position: -400px 0; }
//     100% { background-position:  400px 0; }
//   }
//   .skeleton {
//     background: linear-gradient(90deg,
//       rgba(255,255,255,0.04) 25%,
//       rgba(255,255,255,0.09) 50%,
//       rgba(255,255,255,0.04) 75%);
//     background-size: 800px 100%;
//     animation: shimmer 1.6s infinite linear;
//     border-radius: 6px;
//   }

//   /* Job detail panel slides in from right */
//   @keyframes panelSlideIn {
//     from { opacity: 0; transform: translateX(28px); }
//     to   { opacity: 1; transform: translateX(0); }
//   }
//   .panel-enter { animation: panelSlideIn 0.38s cubic-bezier(0.16,1,0.3,1) both; }

//   /* Job item entrance stagger */
//   @keyframes itemReveal {
//     from { opacity: 0; transform: translateY(10px); }
//     to   { opacity: 1; transform: translateY(0); }
//   }
//   .item-reveal { animation: itemReveal 0.35s cubic-bezier(0.16,1,0.3,1) both; }

//   /* Running step text slides up (like a ticker) */
//   @keyframes stepIn {
//     from { opacity: 0; transform: translateY(10px); }
//     to   { opacity: 1; transform: translateY(0); }
//   }
//   @keyframes stepOut {
//     from { opacity: 1; transform: translateY(0); }
//     to   { opacity: 0; transform: translateY(-10px); }
//   }
//   .step-in  { animation: stepIn  0.32s cubic-bezier(0.16,1,0.3,1) both; }
//   .step-out { animation: stepOut 0.22s ease-in both; }

//   /* Spinner rings */
//   @keyframes spinCW  { to { transform: rotate(360deg);  } }
//   @keyframes spinCCW { to { transform: rotate(-360deg); } }
//   @keyframes ripplePing {
//     0%   { transform: scale(0.8); opacity: 0.6; }
//     100% { transform: scale(2.2); opacity: 0; }
//   }

//   /* Pulse glow for spinner core */
//   @keyframes coreGlow {
//     0%,100% { box-shadow: 0 0 14px rgba(99,102,241,0.5); }
//     50%      { box-shadow: 0 0 28px rgba(99,102,241,0.9), 0 0 50px rgba(99,102,241,0.3); }
//   }

//   /* Tab underline slide */
//   .tab-bar-line {
//     transition: left 0.25s cubic-bezier(0.16,1,0.3,1), width 0.25s cubic-bezier(0.16,1,0.3,1);
//   }

//   /* Ripple click effect */
//   @keyframes rippleSpread {
//     from { transform: scale(0); opacity: 0.35; }
//     to   { transform: scale(4); opacity: 0; }
//   }
//   .ripple-child {
//     position: absolute; border-radius: 50%;
//     background: rgba(99,102,241,0.35);
//     width: 60px; height: 60px;
//     margin-left: -30px; margin-top: -30px;
//     animation: rippleSpread 0.55s ease-out forwards;
//     pointer-events: none;
//   }

//   /* Content fade for tab switch */
//   @keyframes contentFade {
//     from { opacity: 0; transform: translateY(6px); }
//     to   { opacity: 1; transform: translateY(0); }
//   }
//   .content-fade { animation: contentFade 0.28s ease both; }

//   /* Sidebar user row */
//   @keyframes userReveal {
//     from { opacity: 0; transform: translateX(-10px); }
//     to   { opacity: 1; transform: translateX(0); }
//   }
//   .user-reveal { animation: userReveal 0.4s cubic-bezier(0.16,1,0.3,1) 0.2s both; }

//   /* Empty state float */
//   @keyframes emptyFloat {
//     0%,100% { transform: translateY(0); }
//     50%      { transform: translateY(-6px); }
//   }
//   .empty-float { animation: emptyFloat 4s ease-in-out infinite; }

//   /* Score bar fill */
//   @keyframes barFill {
//     from { width: 0%; }
//   }

//   /* Error shake */
//   @keyframes errShake {
//     0%,100% { transform: translateX(0); }
//     20%     { transform: translateX(-5px); }
//     40%     { transform: translateX(5px); }
//     60%     { transform: translateX(-3px); }
//     80%     { transform: translateX(3px); }
//   }
//   .err-shake { animation: errShake 0.35s ease, contentFade 0.25s ease; }

//   /* Scrollbar */
//   .thin-scroll::-webkit-scrollbar { width: 3px; }
//   .thin-scroll::-webkit-scrollbar-track { background: transparent; }
//   .thin-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 99px; }
//   .thin-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.16); }

//   /* Input glow */
//   .input-wrap {
//     transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;
//   }
//   .input-wrap:focus-within {
//     border-color: rgba(99,102,241,0.4) !important;
//     box-shadow: 0 0 0 3px rgba(99,102,241,0.1), 0 0 24px rgba(99,102,241,0.08);
//     background: rgba(255,255,255,0.04) !important;
//   }

//   /* Logout button */
//   @keyframes logoutWobble {
//     0%,100% { transform: rotate(0deg); }
//     25%     { transform: rotate(-8deg); }
//     75%     { transform: rotate(8deg); }
//   }
//   .logout-btn:hover svg { animation: logoutWobble 0.4s ease; }
// `

// function StyleInjector() {
//   useEffect(() => {
//     const el = document.createElement('style')
//     el.textContent = STYLES
//     document.head.appendChild(el)
//     return () => document.head.removeChild(el)
//   }, [])
//   return null
// }

// // ─── Icons ──────────────────────────────────────────────────────────────────────

// const Logo = () => (
//   <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//     <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
//       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//   </svg>
// )
// const SendIcon = () => (
//   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
//   </svg>
// )
// const ClockIcon = () => (
//   <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
//   </svg>
// )
// const ChevronRightIcon = () => (
//   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <polyline points="9 18 15 12 9 6"/>
//   </svg>
// )
// const LogoutIcon = () => (
//   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
//     <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
//   </svg>
// )
// const FileTextIcon = () => (
//   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
//     <polyline points="14 2 14 8 20 8"/>
//     <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
//   </svg>
// )
// const GlobeIcon = () => (
//   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
//     <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
//   </svg>
// )
// const DatabaseIcon = () => (
//   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <ellipse cx="12" cy="5" rx="9" ry="3"/>
//     <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
//     <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
//   </svg>
// )
// const StarIcon = () => (
//   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
//   </svg>
// )
// const PlusIcon = () => (
//   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
//     <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
//   </svg>
// )
// const ZapIcon = () => (
//   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
//   </svg>
// )
// const MenuIcon = () => (
//   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <line x1="3" y1="6" x2="21" y2="6"/>
//     <line x1="3" y1="12" x2="21" y2="12"/>
//     <line x1="3" y1="18" x2="21" y2="18"/>
//   </svg>
// )
// const SearchIcon = () => (
//   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
//   </svg>
// )
// const LinkIcon = () => (
//   <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
//     <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
//   </svg>
// )

// // ─── Ripple Button ───────────────────────────────────────────────────────────────

// function RippleButton({ className, style, onClick, children, disabled, title }) {
//   const [ripples, setRipples] = useState([])
//   const idRef = useRef(0)

//   const handleClick = (e) => {
//     if (disabled) return
//     const rect = e.currentTarget.getBoundingClientRect()
//     const x = e.clientX - rect.left
//     const y = e.clientY - rect.top
//     const id = ++idRef.current
//     setRipples(r => [...r, { id, x, y }])
//     setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 600)
//     onClick?.(e)
//   }

//   return (
//     <button
//       className={className}
//       style={{ ...style, position: 'relative', overflow: 'hidden' }}
//       onClick={handleClick}
//       disabled={disabled}
//       title={title}
//     >
//       {ripples.map(rp => (
//         <span key={rp.id} className="ripple-child" style={{ left: rp.x, top: rp.y }} />
//       ))}
//       {children}
//     </button>
//   )
// }

// // ─── Status Badge ────────────────────────────────────────────────────────────────

// function StatusBadge({ status }) {
//   const map = {
//     pending:   { col: '#facc15', pulse: false, label: 'Pending'   },
//     running:   { col: '#60a5fa', pulse: true,  label: 'Running'   },
//     completed: { col: '#34d399', pulse: false, label: 'Completed' },
//     failed:    { col: '#f87171', pulse: false, label: 'Failed'    },
//   }
//   const s = map[status] || map.pending
//   return (
//     <span style={{
//       display: 'inline-flex', alignItems: 'center', gap: 5,
//       fontSize: 10, fontFamily: 'monospace', fontWeight: 600, color: s.col,
//       background: `${s.col}14`, padding: '3px 8px', borderRadius: 99,
//       border: `1px solid ${s.col}25`,
//     }}>
//       <span style={{
//         width: 5, height: 5, borderRadius: '50%', background: s.col, flexShrink: 0,
//         boxShadow: `0 0 6px ${s.col}`,
//         animation: s.pulse ? 'coreGlow 1.4s ease-in-out infinite' : 'none',
//       }} />
//       {s.label}
//     </span>
//   )
// }

// // ─── Skeleton ────────────────────────────────────────────────────────────────────

// function SkeletonJobItem() {
//   return (
//     <div style={{ padding: '10px 12px' }}>
//       <div className="skeleton" style={{ height: 11, width: '80%', marginBottom: 7 }} />
//       <div className="skeleton" style={{ height: 11, width: '55%', marginBottom: 10 }} />
//       <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//         <div className="skeleton" style={{ height: 9, width: '28%' }} />
//         <div className="skeleton" style={{ height: 9, width: '35%' }} />
//       </div>
//     </div>
//   )
// }

// // ─── Sidebar Job Item ─────────────────────────────────────────────────────────────

// function JobItem({ job, isActive, onClick, animDelay }) {
//   const d = new Date(job.created_at)
//   const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//   const date = d.toLocaleDateString([], { month: 'short', day: 'numeric' })

//   return (
//     <RippleButton
//       onClick={onClick}
//       className="item-reveal"
//       style={{
//         width: '100%', textAlign: 'left',
//         padding: '10px 12px', borderRadius: 12,
//         border: `1px solid ${isActive ? 'rgba(99,102,241,0.25)' : 'transparent'}`,
//         background: isActive ? 'rgba(99,102,241,0.1)' : 'transparent',
//         cursor: 'pointer',
//         transition: 'background 0.2s, border-color 0.2s, transform 0.15s, box-shadow 0.2s',
//         animationDelay: animDelay,
//         display: 'block',
//         boxShadow: isActive ? '0 0 0 1px rgba(99,102,241,0.1) inset' : 'none',
//       }}
//       onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
//       onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
//     >
//       <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
//         <p style={{
//           fontSize: 12, fontWeight: 500, lineHeight: 1.45, flex: 1,
//           color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
//           overflow: 'hidden', display: '-webkit-box',
//           WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
//           transition: 'color 0.2s',
//           margin: 0,
//         }}>
//           {job.topic}
//         </p>
//         <span style={{ color: 'rgba(255,255,255,0.18)', flexShrink: 0, marginTop: 2 }}>
//           <ChevronRightIcon />
//         </span>
//       </div>
//       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//         <StatusBadge status={job.status} />
//         <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, fontFamily: 'monospace' }}>
//           {date} · {time}
//         </span>
//       </div>
//     </RippleButton>
//   )
// }

// // ─── Running State ────────────────────────────────────────────────────────────────

// const STEPS = [
//   { label: 'Initializing agents',    icon: '⚡' },
//   { label: 'Searching the web',      icon: '🌐' },
//   { label: 'Scraping content',       icon: '📥' },
//   { label: 'Analyzing data',         icon: '🔬' },
//   { label: 'Generating report',      icon: '📝' },
//   { label: 'Reviewing output',       icon: '✅' },
// ]

// function RunningState() {
//   const [step, setStep] = useState(0)
//   const [animClass, setAnimClass] = useState('step-in')

//   useEffect(() => {
//     const t = setInterval(() => {
//       setAnimClass('step-out')
//       setTimeout(() => {
//         setStep(s => (s + 1) % STEPS.length)
//         setAnimClass('step-in')
//       }, 240)
//     }, 2400)
//     return () => clearInterval(t)
//   }, [])

//   const progress = ((step + 1) / STEPS.length) * 100

//   return (
//     <div style={{
//       display: 'flex', flexDirection: 'column', alignItems: 'center',
//       justifyContent: 'center', height: '100%', gap: 32, padding: '48px 24px',
//     }}>

//       {/* Cinematic spinner */}
//       <div style={{ position: 'relative', width: 96, height: 96 }}>
//         {/* Ping ring */}
//         <div style={{
//           position: 'absolute', inset: 0, borderRadius: '50%',
//           border: '1px solid rgba(99,102,241,0.2)',
//           animation: 'ripplePing 2.2s ease-in-out infinite',
//         }} />
//         {/* Outer ring CW */}
//         <div style={{
//           position: 'absolute', inset: 0, borderRadius: '50%',
//           border: '1.5px solid transparent',
//           borderTopColor: 'rgba(99,102,241,0.8)',
//           borderRightColor: 'rgba(99,102,241,0.15)',
//           animation: 'spinCW 2.2s linear infinite',
//         }} />
//         {/* Middle ring CCW */}
//         <div style={{
//           position: 'absolute', inset: 14, borderRadius: '50%',
//           border: '1.5px solid transparent',
//           borderTopColor: 'rgba(139,92,246,0.9)',
//           borderLeftColor: 'rgba(139,92,246,0.15)',
//           animation: 'spinCCW 1.5s linear infinite',
//         }} />
//         {/* Inner ring CW fast */}
//         <div style={{
//           position: 'absolute', inset: 28, borderRadius: '50%',
//           border: '2px solid transparent',
//           borderTopColor: 'rgba(255,255,255,0.9)',
//           animation: 'spinCW 0.85s linear infinite',
//         }} />
//         {/* Core */}
//         <div style={{
//           position: 'absolute', inset: 38, borderRadius: '50%',
//           background: 'linear-gradient(135deg, rgba(99,102,241,0.9), rgba(139,92,246,0.7))',
//           animation: 'coreGlow 2s ease-in-out infinite',
//         }} />
//       </div>

//       {/* Status text — slides in/out */}
//       <div style={{ textAlign: 'center', minHeight: 52 }}>
//         <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
//           Pipeline Running
//         </p>
//         <div style={{ overflow: 'hidden', height: 22 }}>
//           <p key={step} className={animClass} style={{
//             color: 'rgba(99,102,241,0.8)', fontSize: 12,
//             fontFamily: 'monospace', letterSpacing: '0.05em',
//             display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
//             margin: 0,
//           }}>
//             <span>{STEPS[step].icon}</span>
//             {STEPS[step].label}
//             <span style={{ display: 'inline-flex', gap: 3 }}>
//               {[0,1,2].map(i => (
//                 <span key={i} style={{
//                   width: 3, height: 3, borderRadius: '50%',
//                   background: 'rgba(99,102,241,0.7)',
//                   animation: `coreGlow 1.2s ease-in-out ${i*0.2}s infinite`,
//                   display: 'inline-block',
//                 }} />
//               ))}
//             </span>
//           </p>
//         </div>
//       </div>

//       {/* Step progress track */}
//       <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
//         {STEPS.map((s, i) => (
//           <div key={i} style={{
//             height: 3, borderRadius: 99,
//             width: i === step ? 24 : i < step ? 8 : 8,
//             background: i === step
//               ? 'rgba(99,102,241,1)'
//               : i < step
//               ? 'rgba(99,102,241,0.45)'
//               : 'rgba(255,255,255,0.08)',
//             boxShadow: i === step ? '0 0 8px rgba(99,102,241,0.8)' : 'none',
//             transition: 'width 0.5s cubic-bezier(0.16,1,0.3,1), background 0.4s, box-shadow 0.4s',
//           }} />
//         ))}
//       </div>

//       {/* Overall progress bar */}
//       <div style={{ width: '100%', maxWidth: 320 }}>
//         <div style={{
//           height: 2, background: 'rgba(255,255,255,0.06)',
//           borderRadius: 99, overflow: 'hidden',
//         }}>
//           <div style={{
//             height: '100%',
//             width: `${progress}%`,
//             background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
//             borderRadius: 99,
//             boxShadow: '0 0 10px rgba(99,102,241,0.6)',
//             transition: 'width 0.5s cubic-bezier(0.16,1,0.3,1)',
//           }} />
//         </div>
//         <div style={{
//           display: 'flex', justifyContent: 'space-between',
//           marginTop: 6, fontSize: 10, fontFamily: 'monospace',
//           color: 'rgba(255,255,255,0.2)',
//         }}>
//           <span>Step {step + 1}/{STEPS.length}</span>
//           <span>{Math.round(progress)}%</span>
//         </div>
//       </div>

//       {/* Ghost skeleton preview */}
//       <div style={{ width: '100%', maxWidth: 480, opacity: 0.22 }}>
//         {[0.7, 1, 0.85, 0.6, 0.95, 0.75].map((w, i) => (
//           <div key={i} className="skeleton" style={{
//             height: i === 0 ? 14 : 11, width: `${w * 100}%`,
//             marginBottom: i === 0 ? 14 : 8,
//             borderRadius: i === 0 ? 8 : 4,
//           }} />
//         ))}
//       </div>
//     </div>
//   )
// }

// // ─── Report Tab ──────────────────────────────────────────────────────────────────

// function ReportTab({ content }) {
//   if (!content || content.trim() === '' || content === 'None') return <EmptyTabState label="report" />
//   return (
//     <div style={{ maxWidth: 720 }}>
//       {content.split('\n').map((line, i) => {
//         if (line.startsWith('# '))
//           return <h1 key={i} style={{
//             fontSize: 20, fontWeight: 700, color: '#fff', margin: '8px 0 16px',
//             paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.07)',
//           }}>{line.slice(2)}</h1>
//         if (line.startsWith('## '))
//           return <h2 key={i} style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.9)', margin: '24px 0 8px' }}>{line.slice(3)}</h2>
//         if (line.startsWith('### '))
//           return <h3 key={i} style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.75)', margin: '16px 0 6px' }}>{line.slice(4)}</h3>
//         if (line.startsWith('- ') || line.startsWith('* '))
//           return (
//             <div key={i} style={{ display: 'flex', gap: 10, padding: '3px 0' }}>
//               <span style={{ color: 'rgba(99,102,241,0.8)', marginTop: 6, fontSize: 10 }}>◆</span>
//               <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, margin: 0 }}>{line.slice(2)}</p>
//             </div>
//           )
//         if (line.trim() === '') return <div key={i} style={{ height: 8 }} />
//         return <p key={i} style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, margin: '2px 0' }}>{line}</p>
//       })}
//     </div>
//   )
// }

// // ─── Search Tab ──────────────────────────────────────────────────────────────────

// function SearchTab({ content }) {
//   if (!content || content.trim() === '' || content === 'None') return <EmptyTabState label="search results" />
//   const blocks = content.split(/\n{2,}/).filter(b => b.trim())
//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
//       {blocks.map((block, i) => {
//         const lines = block.split('\n').filter(l => l.trim())
//         if (!lines.length) return null
//         const titleMatch = lines[0].match(/^\[?\d+\]?\s*(.+?)(?:\s*[—–]\s*"(.+)")?$/)
//         const source = titleMatch?.[1] || lines[0]
//         const title = titleMatch?.[2] || ''
//         const url = lines[1]?.startsWith('http') ? lines[1] : ''
//         const snippet = lines.slice(url ? 2 : 1).join(' ')

//         return (
//           <div key={i} style={{
//             padding: '14px 16px', borderRadius: 14,
//             background: 'rgba(255,255,255,0.025)',
//             border: '1px solid rgba(255,255,255,0.07)',
//             transition: 'border-color 0.2s, background 0.2s',
//             cursor: 'default',
//           }}
//             onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
//             onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
//           >
//             <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
//               <div style={{ flex: 1, minWidth: 0 }}>
//                 {title && <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.85)', marginBottom: 3 }}>{title}</p>}
//                 <p style={{ fontSize: 11, color: 'rgba(99,102,241,0.7)', fontWeight: 500 }}>{source}</p>
//               </div>
//               <span style={{ color: 'rgba(255,255,255,0.15)', flexShrink: 0 }}><LinkIcon /></span>
//             </div>
//             {url && <p style={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(255,255,255,0.18)', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url}</p>}
//             {snippet && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', lineHeight: 1.6 }}>{snippet}</p>}
//           </div>
//         )
//       })}
//     </div>
//   )
// }

// // ─── Scraped Tab ─────────────────────────────────────────────────────────────────

// function ScrapedTab({ content }) {
//   if (!content || content.trim() === '' || content === 'None') return <EmptyTabState label="scraped content" />
//   const lines = content.split('\n').filter(l => l.trim())
//   const hasSummary = lines[0] && !lines[0].includes(':') && lines[0].length < 100
//   const summary = hasSummary ? lines[0] : null
//   const sourceLines = hasSummary ? lines.slice(1) : lines
//   const sources = sourceLines.map(line => {
//     const m = line.match(/^(.+?)\s*[—–-]\s*(.+)$/) || line.match(/^(.+?):\s*(.+)$/)
//     return m ? { domain: m[1].trim(), detail: m[2].trim() } : { domain: line.trim(), detail: '' }
//   }).filter(s => s.domain)

//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
//       {summary && <p style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.28)', paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{summary}</p>}
//       {sources.length > 0 ? (
//         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
//           {sources.map((src, i) => {
//             const m = src.detail.match(/([\d,]+)\s*chars?/)
//             const chars = m?.[1]
//             const extra = m ? src.detail.replace(m[0], '').trim() : src.detail
//             return (
//               <div key={i} style={{
//                 padding: '16px', borderRadius: 14,
//                 background: 'rgba(255,255,255,0.025)',
//                 border: '1px solid rgba(255,255,255,0.07)',
//               }}>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
//                   <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(99,102,241,0.7)', boxShadow: '0 0 6px rgba(99,102,241,0.5)' }} />
//                   <p style={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(99,102,241,0.65)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{src.domain}</p>
//                 </div>
//                 {chars
//                   ? <><p style={{ fontSize: 24, fontWeight: 700, color: 'rgba(255,255,255,0.9)', margin: '0 0 2px' }}>{chars}</p><p style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)' }}>characters scraped</p></>
//                   : <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', lineHeight: 1.6 }}>{src.detail || 'Content scraped'}</p>
//                 }
//                 {extra && chars && <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.22)', marginTop: 4 }}>{extra}</p>}
//               </div>
//             )
//           })}
//         </div>
//       ) : (
//         <pre style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{content}</pre>
//       )}
//     </div>
//   )
// }

// // ─── Feedback Tab ─────────────────────────────────────────────────────────────────

// function FeedbackTab({ content }) {
//   const [mounted, setMounted] = useState(false)
//   useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t) }, [])
//   if (!content || content.trim() === '' || content === 'None') return <EmptyTabState label="feedback" />

//   const scoreMatch = content.match(/(\d+\.?\d*)\/(\d+)/)
//   const score = scoreMatch ? parseFloat(scoreMatch[1]) : null
//   const maxScore = scoreMatch ? parseFloat(scoreMatch[2]) : 10
//   const pct = score !== null ? (score / maxScore) * 100 : null
//   const feedbackText = content.replace(/Score:\s*[\d.]+\/[\d.]+\n?/, '').trim()
//   const sc = score >= 8 ? '#34d399' : score >= 6 ? '#fbbf24' : '#f87171'

//   return (
//     <div style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 14 }}>
//       {score !== null && (
//         <div style={{ padding: 20, borderRadius: 16, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
//             <div>
//               <span style={{ fontSize: 44, fontWeight: 700, color: sc, letterSpacing: '-0.03em' }}>{score}</span>
//               <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.2)', fontWeight: 400 }}>/{maxScore}</span>
//             </div>
//             <div style={{ flex: 1 }}>
//               <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden', marginBottom: 6 }}>
//                 <div style={{
//                   height: '100%', borderRadius: 99,
//                   background: `linear-gradient(90deg, ${sc}, ${sc}88)`,
//                   boxShadow: `0 0 12px ${sc}60`,
//                   width: mounted ? `${pct}%` : '0%',
//                   transition: 'width 1.2s cubic-bezier(0.16,1,0.3,1)',
//                 }} />
//               </div>
//               <p style={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(255,255,255,0.22)' }}>Quality Score</p>
//             </div>
//           </div>
//         </div>
//       )}
//       {feedbackText && (
//         <div style={{ padding: 20, borderRadius: 16, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
//           <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75 }}>{feedbackText}</p>
//         </div>
//       )}
//     </div>
//   )
// }

// // ─── Empty Tab ────────────────────────────────────────────────────────────────────

// function EmptyTabState({ label }) {
//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 180, gap: 10 }}>
//       <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)' }}>
//         <SearchIcon />
//       </div>
//       <p style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.2)' }}>No {label} available</p>
//     </div>
//   )
// }

// // ─── Job Detail ───────────────────────────────────────────────────────────────────

// const TABS = [
//   { id: 'report',          label: 'Report',   Icon: FileTextIcon, field: 'report'          },
//   { id: 'search_results',  label: 'Search',   Icon: GlobeIcon,    field: 'search_results'  },
//   { id: 'scraped_content', label: 'Scraped',  Icon: DatabaseIcon, field: 'scraped_content' },
//   { id: 'feedback',        label: 'Feedback', Icon: StarIcon,     field: 'feedback'        },
// ]

// function JobDetail({ job }) {
//   const [tab, setTab] = useState('report')
//   const [contentKey, setContentKey] = useState(0)
//   const tabsRef = useRef([])

//   const elapsed = job.completed_at
//     ? Math.round((new Date(job.completed_at) - new Date(job.created_at)) / 1000)
//     : null
//   const isLoading = job.status === 'running' || job.status === 'pending'

//   const handleTabClick = (id) => {
//     if (id === tab) return
//     setTab(id)
//     setContentKey(k => k + 1)
//   }

//   const renderContent = () => {
//     if (isLoading) return <RunningState />
//     if (tab === 'report')          return <ReportTab   content={job.report}          />
//     if (tab === 'search_results')  return <SearchTab   content={job.search_results}  />
//     if (tab === 'scraped_content') return <ScrapedTab  content={job.scraped_content} />
//     if (tab === 'feedback')        return <FeedbackTab content={job.feedback}        />
//     return null
//   }

//   return (
//     <div className="panel-enter" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

//       {/* Header */}
//       <div style={{
//         padding: '20px 24px 16px',
//         borderBottom: '1px solid rgba(255,255,255,0.07)',
//         flexShrink: 0,
//         background: 'linear-gradient(to bottom, rgba(99,102,241,0.04), transparent)',
//       }}>
//         <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 10 }}>
//           <h2 style={{ fontSize: 15, fontWeight: 600, color: '#fff', lineHeight: 1.4, flex: 1, margin: 0 }}>{job.topic}</h2>
//           <StatusBadge status={job.status} />
//         </div>
//         <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
//           <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontFamily: 'monospace', color: 'rgba(255,255,255,0.22)' }}>
//             <ClockIcon />{new Date(job.created_at).toLocaleString()}
//           </span>
//           {elapsed && (
//             <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontFamily: 'monospace', color: 'rgba(255,255,255,0.22)' }}>
//               <ZapIcon />{elapsed}s total
//             </span>
//           )}
//           {job.status === 'failed' && job.error_message && (
//             <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(248,113,113,0.7)' }}>{job.error_message}</span>
//           )}
//         </div>
//       </div>

//       {/* Tabs */}
//       <div style={{
//         display: 'flex', gap: 2, padding: '0 24px',
//         borderBottom: '1px solid rgba(255,255,255,0.07)',
//         flexShrink: 0, position: 'relative',
//       }}>
//         {TABS.map((t, idx) => {
//           const hasData = !isLoading && job[t.field] && job[t.field] !== 'None' && job[t.field].trim() !== ''
//           const active = tab === t.id
//           return (
//             <RippleButton
//               key={t.id}
//               onClick={() => handleTabClick(t.id)}
//               style={{
//                 display: 'flex', alignItems: 'center', gap: 6,
//                 padding: '10px 14px', fontSize: 12, fontWeight: 500,
//                 borderRadius: '10px 10px 0 0',
//                 border: 'none', cursor: 'pointer',
//                 position: 'relative', bottom: -1,
//                 color: active ? '#818cf8' : 'rgba(255,255,255,0.3)',
//                 background: active ? 'rgba(99,102,241,0.07)' : 'transparent',
//                 borderBottom: `2px solid ${active ? '#6366f1' : 'transparent'}`,
//                 transition: 'color 0.2s, background 0.2s, border-color 0.2s',
//               }}
//               onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.55)' }}
//               onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.3)' }}
//             >
//               <t.Icon />
//               {t.label}
//               {hasData && (
//                 <span style={{
//                   width: 5, height: 5, borderRadius: '50%',
//                   background: active ? '#818cf8' : 'rgba(255,255,255,0.2)',
//                   boxShadow: active ? '0 0 6px #818cf8' : 'none',
//                   transition: 'background 0.2s, box-shadow 0.2s',
//                 }} />
//               )}
//             </RippleButton>
//           )
//         })}
//       </div>

//       {/* Content */}
//       <div
//         key={contentKey}
//         className={`thin-scroll content-fade`}
//         style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}
//       >
//         {renderContent()}
//       </div>
//     </div>
//   )
// }

// // ─── Empty State ──────────────────────────────────────────────────────────────────

// function EmptyState({ onSuggest }) {
//   const suggestions = [
//     'Latest advancements in quantum computing',
//     'Impact of AI on software engineering jobs',
//     'Climate tech startups in 2025',
//     'State of large language models',
//   ]
//   return (
//     <div style={{
//       display: 'flex', flexDirection: 'column', alignItems: 'center',
//       justifyContent: 'center', height: '100%', padding: '0 32px', gap: 32,
//     }}>
//       <div style={{ textAlign: 'center' }}>
//         <div className="empty-float" style={{
//           width: 52, height: 52, borderRadius: 16,
//           background: 'rgba(99,102,241,0.1)',
//           border: '1px solid rgba(99,102,241,0.2)',
//           display: 'flex', alignItems: 'center', justifyContent: 'center',
//           margin: '0 auto 20px',
//           color: 'rgba(99,102,241,0.8)',
//           boxShadow: '0 0 30px rgba(99,102,241,0.15)',
//         }}>
//           <Logo />
//         </div>
//         <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Start a research session</h3>
//         <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', maxWidth: 340, lineHeight: 1.6, margin: 0 }}>
//           Enter any topic. Our multi-agent pipeline will search, scrape, and generate a full research report.
//         </p>
//       </div>
//       <div style={{ width: '100%', maxWidth: 360 }}>
//         <p style={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
//           Try these
//         </p>
//         {suggestions.map((s, i) => (
//           <RippleButton
//             key={s}
//             onClick={() => onSuggest(s)}
//             style={{
//               width: '100%', textAlign: 'left',
//               padding: '12px 16px', borderRadius: 12, marginBottom: 8,
//               background: 'rgba(255,255,255,0.025)',
//               border: '1px solid rgba(255,255,255,0.07)',
//               cursor: 'pointer',
//               transition: 'background 0.2s, border-color 0.2s, transform 0.15s',
//               display: 'block',
//               animation: `itemReveal 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 0.07}s both`,
//             }}
//             onMouseEnter={e => {
//               e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
//               e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
//             }}
//             onMouseLeave={e => {
//               e.currentTarget.style.background = 'rgba(255,255,255,0.025)'
//               e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
//             }}
//           >
//             <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', transition: 'color 0.2s' }}>
//               {s}
//             </span>
//           </RippleButton>
//         ))}
//       </div>
//     </div>
//   )
// }

// // ─── Main Page ────────────────────────────────────────────────────────────────────

// export default function ChatPage() {
//   const navigate = useNavigate()
//   const { user, logout } = useAuth()

//   const [jobs, setJobs]               = useState([])
//   const [activeJob, setActiveJob]     = useState(null)
//   const [topic, setTopic]             = useState('')
//   const [submitting, setSubmitting]   = useState(false)
//   const [loadingJobs, setLoadingJobs] = useState(true)
//   const [error, setError]             = useState('')
//   const [errorKey, setErrorKey]       = useState(0)
//   const [sidebarOpen, setSidebarOpen] = useState(true)
//   const [logoutHover, setLogoutHover] = useState(false)
//   const pollRef                       = useRef(null)
//   const textareaRef                   = useRef(null)

//   useEffect(() => {
//     getMyJobs()
//       .then(setJobs)
//       .catch(() => {})
//       .finally(() => setLoadingJobs(false))
//   }, [])

//   const startPolling = useCallback((jobId) => {
//     clearInterval(pollRef.current)
//     pollRef.current = setInterval(async () => {
//       try {
//         const updated = await getJob(jobId)
//         setActiveJob(updated)
//         setJobs(prev => prev.map(j => j.id === jobId ? updated : j))
//         if (updated.status === 'completed' || updated.status === 'failed') {
//           clearInterval(pollRef.current)
//         }
//       } catch { /* ignore */ }
//     }, 3000)
//   }, [])

//   useEffect(() => () => clearInterval(pollRef.current), [])

//   const handleSubmit = async (forceTopic) => {
//     const t = (forceTopic ?? topic).trim()
//     if (!t || submitting) return
//     setError('')
//     setSubmitting(true)
//     setTopic('')
//     if (textareaRef.current) textareaRef.current.style.height = 'auto'
//     try {
//       const job = await runPipeline(t)
//       setJobs(prev => [job, ...prev])
//       setActiveJob(job)
//       if (job.status === 'running' || job.status === 'pending') startPolling(job.id)
//     } catch (err) {
//       setErrorKey(k => k + 1)
//       setError(err.response?.data?.detail || 'Failed to start pipeline.')
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   const handleKeyDown = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
//   }

//   const handleSelectJob = (job) => {
//     setActiveJob(job)
//     if (job.status === 'running' || job.status === 'pending') startPolling(job.id)
//   }

//   return (
//     <>
//       <StyleInjector />
//       <div style={{
//         display: 'flex', height: '100vh',
//         background: '#0b0c14',
//         overflow: 'hidden', fontFamily: 'system-ui, sans-serif',
//       }}>

//         {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
//         <aside style={{
//           display: 'flex', flexDirection: 'column', flexShrink: 0,
//           width: sidebarOpen ? 256 : 0,
//           borderRight: '1px solid rgba(255,255,255,0.06)',
//           background: '#0b0c14',
//           transition: 'width 0.32s cubic-bezier(0.16,1,0.3,1)',
//           overflow: 'hidden',
//         }}>

//           {/* Logo row */}
//           <div style={{
//             display: 'flex', alignItems: 'center', gap: 10,
//             padding: '14px 16px',
//             borderBottom: '1px solid rgba(255,255,255,0.06)',
//             flexShrink: 0,
//           }}>
//             <div style={{
//               width: 30, height: 30, borderRadius: 9,
//               background: 'rgba(99,102,241,0.12)',
//               border: '1px solid rgba(99,102,241,0.22)',
//               display: 'flex', alignItems: 'center', justifyContent: 'center',
//               color: 'rgba(99,102,241,0.85)',
//               boxShadow: '0 0 16px rgba(99,102,241,0.15)',
//             }}>
//               <Logo />
//             </div>
//             <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.8)', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
//               AI Research
//             </span>
//           </div>

//           {/* New Research */}
//           <div style={{ padding: '10px 12px', flexShrink: 0 }}>
//             <RippleButton
//               onClick={() => { setActiveJob(null); clearInterval(pollRef.current) }}
//               style={{
//                 width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
//                 padding: '10px 12px', borderRadius: 12,
//                 background: 'rgba(99,102,241,0.08)',
//                 border: '1px solid rgba(99,102,241,0.18)',
//                 color: 'rgba(99,102,241,0.85)', fontSize: 12, fontWeight: 600,
//                 cursor: 'pointer',
//                 transition: 'background 0.2s, border-color 0.2s, color 0.2s, box-shadow 0.2s',
//               }}
//               onMouseEnter={e => {
//                 e.currentTarget.style.background = 'rgba(99,102,241,0.16)'
//                 e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)'
//                 e.currentTarget.style.color = '#a5b4fc'
//                 e.currentTarget.style.boxShadow = '0 0 20px rgba(99,102,241,0.15)'
//               }}
//               onMouseLeave={e => {
//                 e.currentTarget.style.background = 'rgba(99,102,241,0.08)'
//                 e.currentTarget.style.borderColor = 'rgba(99,102,241,0.18)'
//                 e.currentTarget.style.color = 'rgba(99,102,241,0.85)'
//                 e.currentTarget.style.boxShadow = 'none'
//               }}
//             >
//               <PlusIcon /> New Research
//             </RippleButton>
//           </div>

//           {/* Job list */}
//           <div className="thin-scroll" style={{
//             flex: 1, overflowY: 'auto',
//             padding: '4px 12px 12px',
//             display: 'flex', flexDirection: 'column', gap: 2,
//           }}>
//             {loadingJobs ? (
//               <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 4 }}>
//                 {[1,2,3,4].map(i => <SkeletonJobItem key={i} />)}
//               </div>
//             ) : jobs.length === 0 ? (
//               <div style={{ textAlign: 'center', paddingTop: 40, fontSize: 10, fontFamily: 'monospace', color: 'rgba(255,255,255,0.18)' }}>
//                 No jobs yet
//               </div>
//             ) : (
//               jobs.map((job, idx) => (
//                 <JobItem
//                   key={job.id}
//                   job={job}
//                   isActive={activeJob?.id === job.id}
//                   onClick={() => handleSelectJob(job)}
//                   animDelay={`${Math.min(idx * 0.05, 0.4)}s`}
//                 />
//               ))
//             )}
//           </div>

//           {/* User row */}
//           <div style={{
//             borderTop: '1px solid rgba(255,255,255,0.06)',
//             padding: '10px 12px',
//             flexShrink: 0,
//           }}>
//             <div className="user-reveal" style={{
//               display: 'flex', alignItems: 'center', gap: 10,
//               padding: '8px 8px',
//               borderRadius: 12,
//               transition: 'background 0.2s',
//             }}>
//               {/* Avatar */}
//               {user?.picture
//                 ? <img src={user.picture} alt="" style={{
//                     width: 30, height: 30, borderRadius: '50%',
//                     boxShadow: '0 0 0 2px rgba(255,255,255,0.1)', flexShrink: 0,
//                   }} />
//                 : <div style={{
//                     width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
//                     background: 'linear-gradient(135deg, rgba(99,102,241,0.5), rgba(139,92,246,0.4))',
//                     border: '1px solid rgba(99,102,241,0.3)',
//                     display: 'flex', alignItems: 'center', justifyContent: 'center',
//                     fontSize: 11, fontWeight: 700, color: '#c7d2fe',
//                   }}>
//                     {(user?.name || user?.email || '?')[0].toUpperCase()}
//                   </div>
//               }

//               {/* Name + email */}
//               <div style={{ flex: 1, minWidth: 0 }}>
//                 <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//                   {user?.name || 'User'}
//                 </p>
//                 <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//                   {user?.email}
//                 </p>
//               </div>

//               {/* Logout */}
//               <button
//                 className="logout-btn"
//                 title="Sign out"
//                 onClick={() => { logout(); navigate('/login') }}
//                 onMouseEnter={() => setLogoutHover(true)}
//                 onMouseLeave={() => setLogoutHover(false)}
//                 style={{
//                   width: 30, height: 30, borderRadius: 8, flexShrink: 0,
//                   background: logoutHover ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.04)',
//                   border: `1px solid ${logoutHover ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.06)'}`,
//                   color: logoutHover ? '#f87171' : 'rgba(255,255,255,0.25)',
//                   display: 'flex', alignItems: 'center', justifyContent: 'center',
//                   cursor: 'pointer',
//                   transition: 'background 0.25s, border-color 0.25s, color 0.25s, box-shadow 0.25s',
//                   boxShadow: logoutHover ? '0 0 12px rgba(239,68,68,0.2)' : 'none',
//                 }}
//               >
//                 <LogoutIcon />
//               </button>
//             </div>
//           </div>
//         </aside>

//         {/* ── Main ──────────────────────────────────────────────────────────── */}
//         <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

//           {/* Topbar */}
//           <header style={{
//             display: 'flex', alignItems: 'center', gap: 12,
//             padding: '10px 20px',
//             borderBottom: '1px solid rgba(255,255,255,0.06)',
//             flexShrink: 0,
//             backdropFilter: 'blur(12px)',
//           }}>
//             <RippleButton
//               onClick={() => setSidebarOpen(o => !o)}
//               style={{
//                 width: 32, height: 32, borderRadius: 8,
//                 background: 'rgba(255,255,255,0.04)',
//                 border: '1px solid rgba(255,255,255,0.06)',
//                 display: 'flex', alignItems: 'center', justifyContent: 'center',
//                 color: 'rgba(255,255,255,0.3)', cursor: 'pointer',
//                 transition: 'background 0.2s, color 0.2s',
//               }}
//               onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
//               onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.3)' }}
//             >
//               <MenuIcon />
//             </RippleButton>
//             <div style={{ flex: 1 }} />
//             <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(255,255,255,0.15)' }}>
//               {jobs.length} research job{jobs.length !== 1 ? 's' : ''}
//             </span>
//           </header>

//           {/* Content */}
//           <div style={{ flex: 1, overflow: 'hidden' }}>
//             {activeJob
//               ? <JobDetail key={activeJob.id} job={activeJob} />
//               : <EmptyState onSuggest={handleSubmit} />
//             }
//           </div>

//           {/* Input bar */}
//           <div style={{
//             padding: '12px 20px 16px',
//             borderTop: '1px solid rgba(255,255,255,0.06)',
//             flexShrink: 0,
//           }}>
//             {error && (
//               <div key={errorKey} className="err-shake" style={{
//                 marginBottom: 10, padding: '10px 14px', borderRadius: 12,
//                 background: 'rgba(239,68,68,0.08)',
//                 border: '1px solid rgba(239,68,68,0.18)',
//                 color: '#f87171', fontSize: 12,
//               }}>
//                 {error}
//               </div>
//             )}
//             <div className="input-wrap" style={{
//               display: 'flex', alignItems: 'flex-end', gap: 12,
//               background: 'rgba(255,255,255,0.03)',
//               border: '1px solid rgba(255,255,255,0.08)',
//               borderRadius: 18, padding: '12px 14px',
//             }}>
//               <div style={{ color: 'rgba(255,255,255,0.2)', paddingBottom: 2, flexShrink: 0 }}>
//                 <SearchIcon />
//               </div>
//               <textarea
//                 ref={textareaRef}
//                 rows={1}
//                 value={topic}
//                 onChange={e => setTopic(e.target.value)}
//                 onKeyDown={handleKeyDown}
//                 onInput={e => {
//                   e.target.style.height = 'auto'
//                   e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
//                 }}
//                 placeholder="Enter a research topic… (Enter to run)"
//                 disabled={submitting}
//                 style={{
//                   flex: 1, background: 'transparent',
//                   color: '#fff', fontSize: 13,
//                   border: 'none', outline: 'none',
//                   resize: 'none', lineHeight: 1.6,
//                   minHeight: 22, maxHeight: 120,
//                   placeholderColor: 'rgba(255,255,255,0.2)',
//                   opacity: submitting ? 0.4 : 1,
//                   fontFamily: 'inherit',
//                 }}
//               />
//               <RippleButton
//                 onClick={handleSubmit}
//                 disabled={!topic.trim() || submitting}
//                 style={{
//                   flexShrink: 0, width: 34, height: 34, borderRadius: 12,
//                   background: !topic.trim() || submitting
//                     ? 'rgba(99,102,241,0.15)'
//                     : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
//                   border: 'none', cursor: !topic.trim() || submitting ? 'not-allowed' : 'pointer',
//                   display: 'flex', alignItems: 'center', justifyContent: 'center',
//                   color: !topic.trim() || submitting ? 'rgba(255,255,255,0.2)' : '#fff',
//                   boxShadow: !topic.trim() || submitting ? 'none' : '0 4px 16px rgba(99,102,241,0.4)',
//                   transition: 'background 0.2s, box-shadow 0.2s, transform 0.15s',
//                 }}
//                 onMouseEnter={e => { if (topic.trim() && !submitting) e.currentTarget.style.transform = 'scale(1.05)' }}
//                 onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
//               >
//                 {submitting
//                   ? <div style={{
//                       width: 14, height: 14,
//                       border: '2px solid rgba(255,255,255,0.2)',
//                       borderTopColor: 'rgba(255,255,255,0.6)',
//                       borderRadius: '50%',
//                       animation: 'spinCW 0.7s linear infinite',
//                     }} />
//                   : <SendIcon />
//                 }
//               </RippleButton>
//             </div>
//             <p style={{ textAlign: 'center', fontSize: 10, fontFamily: 'monospace', color: 'rgba(255,255,255,0.1)', marginTop: 8 }}>
//               Enter to research · Shift+Enter for new line
//             </p>
//           </div>
//         </main>
//       </div>
//     </>
//   )
// }









































// // import { useState, useEffect, useRef, useCallback } from 'react'
// // import { useNavigate } from 'react-router-dom'
// // import { useAuth } from '../context/AuthContext'
// // import { runPipeline, getMyJobs, getJob } from '../api/pipeline'

// // // ─── Icons ─────────────────────────────────────────────────────────────────────

// // const Logo = () => (
// //   <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
// //     <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
// //       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
// //   </svg>
// // )
// // const SendIcon = () => (
// //   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //     <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
// //   </svg>
// // )
// // const ClockIcon = () => (
// //   <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //     <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
// //   </svg>
// // )
// // const ChevronRightIcon = () => (
// //   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //     <polyline points="9 18 15 12 9 6"/>
// //   </svg>
// // )
// // const LogoutIcon = () => (
// //   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //     <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
// //     <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
// //   </svg>
// // )
// // const FileTextIcon = () => (
// //   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //     <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
// //     <polyline points="14 2 14 8 20 8"/>
// //     <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
// //   </svg>
// // )
// // const GlobeIcon = () => (
// //   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //     <circle cx="12" cy="12" r="10"/>
// //     <line x1="2" y1="12" x2="22" y2="12"/>
// //     <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
// //   </svg>
// // )
// // const DatabaseIcon = () => (
// //   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //     <ellipse cx="12" cy="5" rx="9" ry="3"/>
// //     <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
// //     <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
// //   </svg>
// // )
// // const StarIcon = () => (
// //   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //     <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
// //   </svg>
// // )
// // const PlusIcon = () => (
// //   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
// //     <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
// //   </svg>
// // )
// // const ZapIcon = () => (
// //   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //     <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
// //   </svg>
// // )
// // const MenuIcon = () => (
// //   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //     <line x1="3" y1="6" x2="21" y2="6"/>
// //     <line x1="3" y1="12" x2="21" y2="12"/>
// //     <line x1="3" y1="18" x2="21" y2="18"/>
// //   </svg>
// // )
// // const SearchIcon = () => (
// //   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //     <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
// //   </svg>
// // )
// // const LinkIcon = () => (
// //   <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //     <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
// //     <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
// //   </svg>
// // )

// // // ─── Status Badge ───────────────────────────────────────────────────────────────

// // function StatusBadge({ status }) {
// //   const map = {
// //     pending:   { color: 'text-yellow-400', dot: 'bg-yellow-400',              label: 'Pending'   },
// //     running:   { color: 'text-blue-400',   dot: 'bg-blue-400 animate-pulse',  label: 'Running'   },
// //     completed: { color: 'text-emerald-400',dot: 'bg-emerald-400',             label: 'Completed' },
// //     failed:    { color: 'text-red-400',    dot: 'bg-red-400',                 label: 'Failed'    },
// //   }
// //   const s = map[status] || map.pending
// //   return (
// //     <span className={`inline-flex items-center gap-1.5 text-xs font-mono font-medium ${s.color}`}>
// //       <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
// //       {s.label}
// //     </span>
// //   )
// // }

// // // ─── Skeleton Loader ────────────────────────────────────────────────────────────

// // function SkeletonJobItem() {
// //   return (
// //     <div className="px-3 py-3 rounded-xl border border-transparent">
// //       <div className="h-3 bg-white/5 rounded-md animate-pulse mb-2 w-4/5" />
// //       <div className="h-3 bg-white/5 rounded-md animate-pulse mb-3 w-3/5" />
// //       <div className="flex justify-between">
// //         <div className="h-2.5 bg-white/5 rounded animate-pulse w-1/4" />
// //         <div className="h-2.5 bg-white/5 rounded animate-pulse w-1/3" />
// //       </div>
// //     </div>
// //   )
// // }

// // // ─── Sidebar Job Item ───────────────────────────────────────────────────────────

// // function JobItem({ job, isActive, onClick }) {
// //   const d = new Date(job.created_at)
// //   const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
// //   const date = d.toLocaleDateString([], { month: 'short', day: 'numeric' })
// //   return (
// //     <button
// //       onClick={onClick}
// //       className={`w-full text-left px-3 py-3 rounded-xl transition-all duration-150 group
// //         ${isActive
// //           ? 'bg-indigo-500/10 border border-indigo-500/20'
// //           : 'hover:bg-white/4 border border-transparent'}`}
// //     >
// //       <div className="flex items-start justify-between gap-2 mb-2">
// //         <p className={`text-xs font-medium leading-snug line-clamp-2 flex-1 transition-colors
// //           ${isActive ? 'text-white' : 'text-white/50 group-hover:text-white/80'}`}>
// //           {job.topic}
// //         </p>
// //         <span className="text-white/15 group-hover:text-white/35 flex-shrink-0 mt-0.5 transition-colors">
// //           <ChevronRightIcon />
// //         </span>
// //       </div>
// //       <div className="flex items-center justify-between">
// //         <StatusBadge status={job.status} />
// //         <span className="text-white/20 text-[10px] font-mono">{date} · {time}</span>
// //       </div>
// //     </button>
// //   )
// // }

// // // ─── Running / Loading State ────────────────────────────────────────────────────

// // const STEPS = [
// //   'Initializing agents...',
// //   'Searching the web...',
// //   'Scraping content...',
// //   'Analyzing data...',
// //   'Generating report...',
// //   'Reviewing output...',
// // ]

// // function RunningState() {
// //   const [step, setStep] = useState(0)
// //   useEffect(() => {
// //     const t = setInterval(() => setStep(s => (s + 1) % STEPS.length), 2200)
// //     return () => clearInterval(t)
// //   }, [])
// //   return (
// //     <div className="flex flex-col items-center justify-center h-full gap-8 py-12">
// //       {/* Spinner */}
// //       <div className="relative w-18 h-18 flex items-center justify-center" style={{ width: 72, height: 72 }}>
// //         <div className="absolute inset-0 rounded-full border border-indigo-500/10"
// //           style={{ animation: 'ping 2.5s ease-in-out infinite' }} />
// //         <div className="absolute inset-2 rounded-full border border-indigo-500/20"
// //           style={{ animation: 'spin 4s linear infinite' }} />
// //         <div className="w-9 h-9 rounded-full bg-indigo-500/10 border border-indigo-500/25
// //           flex items-center justify-center text-indigo-400">
// //           <ZapIcon />
// //         </div>
// //       </div>

// //       {/* Text */}
// //       <div className="text-center space-y-2">
// //         <p className="text-white/60 text-sm font-medium">Pipeline Running</p>
// //         <p className="text-indigo-400/60 text-xs font-mono transition-all duration-300">{STEPS[step]}</p>
// //       </div>

// //       {/* Progress dots */}
// //       <div className="flex items-center gap-1.5">
// //         {STEPS.map((_, i) => (
// //           <div
// //             key={i}
// //             className={`h-1 rounded-full transition-all duration-500
// //               ${i === step ? 'w-6 bg-indigo-400' : i < step ? 'w-1.5 bg-indigo-600/40' : 'w-1.5 bg-white/8'}`}
// //           />
// //         ))}
// //       </div>

// //       {/* Skeleton preview of what's coming */}
// //       <div className="w-full max-w-lg space-y-3 mt-2 opacity-30">
// //         <div className="h-4 bg-white/5 rounded-lg animate-pulse w-2/3" />
// //         <div className="h-3 bg-white/5 rounded animate-pulse w-full" />
// //         <div className="h-3 bg-white/5 rounded animate-pulse w-5/6" />
// //         <div className="h-3 bg-white/5 rounded animate-pulse w-4/6" />
// //         <div className="h-3 bg-white/5 rounded animate-pulse w-full" />
// //         <div className="h-3 bg-white/5 rounded animate-pulse w-3/4" />
// //       </div>
// //     </div>
// //   )
// // }

// // // ─── Report Tab ─────────────────────────────────────────────────────────────────

// // function ReportTab({ content }) {
// //   if (!content || content.trim() === '' || content === 'None') {
// //     return <EmptyTabState label="report" />
// //   }

// //   const lines = content.split('\n')
// //   return (
// //     <div className="space-y-1 max-w-3xl">
// //       {lines.map((line, i) => {
// //         if (line.startsWith('# '))
// //           return <h1 key={i} className="text-xl font-semibold text-white mt-2 mb-4 pb-3 border-b border-white/8">{line.slice(2)}</h1>
// //         if (line.startsWith('## '))
// //           return <h2 key={i} className="text-base font-semibold text-white/90 mt-6 mb-2">{line.slice(3)}</h2>
// //         if (line.startsWith('### '))
// //           return <h3 key={i} className="text-sm font-semibold text-white/80 mt-4 mb-1.5">{line.slice(4)}</h3>
// //         if (line.startsWith('- ') || line.startsWith('* '))
// //           return (
// //             <div key={i} className="flex gap-2.5 py-0.5">
// //               <span className="text-indigo-400 mt-1.5 flex-shrink-0 text-xs">•</span>
// //               <p className="text-sm text-white/60 leading-relaxed">{line.slice(2)}</p>
// //             </div>
// //           )
// //         if (line.trim() === '') return <div key={i} className="h-2" />
// //         return <p key={i} className="text-sm text-white/60 leading-relaxed">{line}</p>
// //       })}
// //     </div>
// //   )
// // }

// // // ─── Search Results Tab ─────────────────────────────────────────────────────────

// // function SearchTab({ content }) {
// //   if (!content || content.trim() === '' || content === 'None') {
// //     return <EmptyTabState label="search results" />
// //   }

// //   // Try to parse structured results (split by double newline blocks)
// //   const blocks = content.split(/\n{2,}/).filter(b => b.trim())

// //   return (
// //     <div className="space-y-3">
// //       {blocks.map((block, i) => {
// //         const lines = block.split('\n').filter(l => l.trim())
// //         if (!lines.length) return null
// //         const titleLine = lines[0] || ''
// //         // Check for [N] Source — "Title" pattern
// //         const titleMatch = titleLine.match(/^\[?\d+\]?\s*(.+?)(?:\s*—\s*"(.+)")?$/)
// //         const source = titleMatch?.[1] || titleLine
// //         const title = titleMatch?.[2] || ''
// //         const url = lines[1]?.startsWith('http') ? lines[1] : ''
// //         const snippet = lines.slice(url ? 2 : 1).join(' ')

// //         return (
// //           <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/8
// //             hover:border-white/12 transition-all duration-150 group">
// //             <div className="flex items-start justify-between gap-3 mb-2">
// //               <div className="flex-1 min-w-0">
// //                 {title && <p className="text-sm font-medium text-white/85 mb-0.5 leading-snug">{title}</p>}
// //                 <p className="text-xs text-indigo-400/70 font-medium">{source}</p>
// //               </div>
// //               <span className="text-white/15 group-hover:text-white/35 flex-shrink-0 mt-0.5 transition-colors">
// //                 <LinkIcon />
// //               </span>
// //             </div>
// //             {url && (
// //               <p className="text-[10px] font-mono text-white/20 mb-2 truncate">{url}</p>
// //             )}
// //             {snippet && (
// //               <p className="text-xs text-white/40 leading-relaxed">{snippet}</p>
// //             )}
// //           </div>
// //         )
// //       })}
// //     </div>
// //   )
// // }

// // // ─── Scraped Content Tab ────────────────────────────────────────────────────────

// // function ScrapedTab({ content }) {
// //   if (!content || content.trim() === '' || content === 'None') {
// //     return <EmptyTabState label="scraped content" />
// //   }

// //   const lines = content.split('\n').filter(l => l.trim())
// //   // First line might be a summary
// //   const hasSummary = lines[0] && !lines[0].includes(':') && lines[0].length < 100
// //   const summary = hasSummary ? lines[0] : null
// //   const sourceLines = hasSummary ? lines.slice(1) : lines

// //   // Parse source lines like "domain.com — 18,400 chars" or "domain.com: content..."
// //   const sources = sourceLines.map(line => {
// //     const dashMatch = line.match(/^(.+?)\s*[—–-]\s*(.+)$/)
// //     if (dashMatch) return { domain: dashMatch[1].trim(), detail: dashMatch[2].trim() }
// //     const colonMatch = line.match(/^(.+?):\s*(.+)$/)
// //     if (colonMatch) return { domain: colonMatch[1].trim(), detail: colonMatch[2].trim() }
// //     return { domain: line.trim(), detail: '' }
// //   }).filter(s => s.domain)

// //   return (
// //     <div className="space-y-4">
// //       {summary && (
// //         <p className="text-xs font-mono text-white/30 pb-3 border-b border-white/6">{summary}</p>
// //       )}
// //       {sources.length > 0 ? (
// //         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
// //           {sources.map((src, i) => {
// //             const charMatch = src.detail.match(/([\d,]+)\s*chars?/)
// //             const charCount = charMatch ? charMatch[1] : null
// //             const extraDetail = charMatch ? src.detail.replace(charMatch[0], '').trim() : src.detail

// //             return (
// //               <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/8">
// //                 <div className="flex items-center gap-1.5 mb-3">
// //                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-400/60" />
// //                   <p className="text-xs font-mono text-indigo-400/70 truncate">{src.domain}</p>
// //                 </div>
// //                 {charCount ? (
// //                   <>
// //                     <p className="text-2xl font-semibold text-white/85 mb-0.5">{charCount}</p>
// //                     <p className="text-xs text-white/30">characters scraped</p>
// //                   </>
// //                 ) : (
// //                   <p className="text-xs text-white/40 leading-relaxed line-clamp-3">{src.detail || 'Content scraped'}</p>
// //                 )}
// //                 {extraDetail && charCount && (
// //                   <p className="text-[10px] text-white/25 mt-1">{extraDetail}</p>
// //                 )}
// //               </div>
// //             )
// //           })}
// //         </div>
// //       ) : (
// //         <pre className="text-xs text-white/50 font-mono whitespace-pre-wrap leading-relaxed">{content}</pre>
// //       )}
// //     </div>
// //   )
// // }

// // // ─── Feedback Tab ───────────────────────────────────────────────────────────────

// // function FeedbackTab({ content }) {
// //   const [animate, setAnimate] = useState(false)

// //   useEffect(() => {
// //     const t = setTimeout(() => setAnimate(true), 100)
// //     return () => clearTimeout(t)
// //   }, [])

// //   if (!content || content.trim() === '' || content === 'None') {
// //     return <EmptyTabState label="feedback" />
// //   }

// //   // Parse score if present e.g. "Score: 9.2/10"
// //   const scoreMatch = content.match(/(\d+\.?\d*)\/(\d+)/)
// //   const score = scoreMatch ? parseFloat(scoreMatch[1]) : null
// //   const maxScore = scoreMatch ? parseFloat(scoreMatch[2]) : 10
// //   const pct = score !== null ? (score / maxScore) * 100 : null
// //   const feedbackText = content.replace(/Score:\s*[\d.]+\/[\d.]+\n?/, '').trim()

// //   const scoreColor = score >= 8 ? 'text-emerald-400' : score >= 6 ? 'text-yellow-400' : 'text-red-400'
// //   const barColor = score >= 8 ? 'bg-emerald-400' : score >= 6 ? 'bg-yellow-400' : 'bg-red-400'

// //   return (
// //     <div className="space-y-5 max-w-2xl">
// //       {score !== null && (
// //         <div className="p-5 rounded-xl bg-white/[0.03] border border-white/8">
// //           <div className="flex items-center gap-4 mb-4">
// //             <div className={`text-4xl font-semibold ${scoreColor}`}>
// //               {score}
// //               <span className="text-lg text-white/25 font-normal">/{maxScore}</span>
// //             </div>
// //             <div className="flex-1">
// //               <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
// //                 <div
// //                   className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`}
// //                   style={{ width: animate ? `${pct}%` : '0%' }}
// //                 />
// //               </div>
// //               <p className="text-[10px] font-mono text-white/25 mt-1.5">Quality Score</p>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //       {feedbackText && (
// //         <div className="p-5 rounded-xl bg-white/[0.03] border border-white/8">
// //           <p className="text-sm text-white/55 leading-relaxed">{feedbackText}</p>
// //         </div>
// //       )}
// //     </div>
// //   )
// // }

// // // ─── Empty Tab ──────────────────────────────────────────────────────────────────

// // function EmptyTabState({ label }) {
// //   return (
// //     <div className="flex flex-col items-center justify-center h-48 gap-2">
// //       <div className="w-8 h-8 rounded-lg bg-white/4 flex items-center justify-center text-white/20">
// //         <SearchIcon />
// //       </div>
// //       <p className="text-white/20 text-xs font-mono">No {label} available</p>
// //     </div>
// //   )
// // }

// // // ─── Job Detail ─────────────────────────────────────────────────────────────────

// // const TABS = [
// //   { id: 'report',          label: 'Report',   Icon: FileTextIcon, field: 'report'          },
// //   { id: 'search_results',  label: 'Search',   Icon: GlobeIcon,    field: 'search_results'  },
// //   { id: 'scraped_content', label: 'Scraped',  Icon: DatabaseIcon, field: 'scraped_content' },
// //   { id: 'feedback',        label: 'Feedback', Icon: StarIcon,     field: 'feedback'        },
// // ]

// // function JobDetail({ job }) {
// //   const [tab, setTab] = useState('report')
// //   const activeTab = TABS.find(t => t.id === tab)
// //   const elapsed = job.completed_at
// //     ? Math.round((new Date(job.completed_at) - new Date(job.created_at)) / 1000)
// //     : null

// //   const isLoading = job.status === 'running' || job.status === 'pending'

// //   const renderContent = () => {
// //     if (isLoading) return <RunningState />
// //     if (tab === 'report')         return <ReportTab   content={job.report}          />
// //     if (tab === 'search_results') return <SearchTab   content={job.search_results}  />
// //     if (tab === 'scraped_content')return <ScrapedTab  content={job.scraped_content} />
// //     if (tab === 'feedback')       return <FeedbackTab content={job.feedback}        />
// //     return null
// //   }

// //   return (
// //     <div className="flex flex-col h-full">
// //       {/* Header */}
// //       <div className="px-6 pt-6 pb-4 border-b border-white/8 flex-shrink-0">
// //         <div className="flex items-start justify-between gap-4 mb-2.5">
// //           <h2 className="text-base font-semibold text-white leading-snug flex-1">{job.topic}</h2>
// //           <StatusBadge status={job.status} />
// //         </div>
// //         <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-mono text-white/25">
// //           <span className="flex items-center gap-1"><ClockIcon />{new Date(job.created_at).toLocaleString()}</span>
// //           {elapsed && <span className="flex items-center gap-1"><ZapIcon />{elapsed}s total</span>}
// //           {job.status === 'failed' && job.error_message && (
// //             <span className="text-red-400/70 truncate max-w-xs">{job.error_message}</span>
// //           )}
// //         </div>
// //       </div>

// //       {/* Tabs */}
// //       <div className="flex gap-0.5 px-6 pt-3 flex-shrink-0 border-b border-white/8">
// //         {TABS.map(t => {
// //           const hasData = !isLoading && job[t.field] && job[t.field] !== 'None' && job[t.field].trim() !== ''
// //           const active = tab === t.id
// //           return (
// //             <button
// //               key={t.id}
// //               onClick={() => setTab(t.id)}
// //               className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium rounded-t-lg
// //                 border-b-2 transition-all duration-150 mb-[-1px]
// //                 ${active
// //                   ? 'text-indigo-400 border-indigo-500 bg-indigo-500/5'
// //                   : 'text-white/30 border-transparent hover:text-white/55 hover:border-white/15'}`}
// //             >
// //               <t.Icon />
// //               {t.label}
// //               {hasData && (
// //                 <span className={`w-1 h-1 rounded-full ${active ? 'bg-indigo-400' : 'bg-white/20'}`} />
// //               )}
// //             </button>
// //           )
// //         })}
// //         <div className="flex-1 border-b-2 border-transparent mb-[-1px]" />
// //       </div>

// //       {/* Content */}
// //       <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
// //         {renderContent()}
// //       </div>
// //     </div>
// //   )
// // }

// // // ─── Empty / Welcome State ──────────────────────────────────────────────────────

// // function EmptyState({ onSuggest }) {
// //   const suggestions = [
// //     'Latest advancements in quantum computing',
// //     'Impact of AI on software engineering jobs',
// //     'Climate tech startups in 2025',
// //     'State of large language models',
// //   ]
// //   return (
// //     <div className="flex flex-col items-center justify-center h-full px-8 gap-8">
// //       <div className="text-center">
// //         <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20
// //           flex items-center justify-center mx-auto mb-5 text-indigo-400">
// //           <Logo />
// //         </div>
// //         <h3 className="text-base font-semibold text-white mb-2">Start a research session</h3>
// //         <p className="text-white/30 text-sm max-w-sm leading-relaxed">
// //           Enter any topic. Our multi-agent pipeline will search, scrape, and generate a full research report.
// //         </p>
// //       </div>
// //       <div className="w-full max-w-sm space-y-2">
// //         <p className="text-white/20 text-[10px] font-mono uppercase tracking-widest mb-3">Try these</p>
// //         {suggestions.map(s => (
// //           <button
// //             key={s}
// //             onClick={() => onSuggest(s)}
// //             className="w-full text-left px-4 py-3 rounded-xl bg-white/[0.025] border border-white/8
// //               hover:bg-white/5 hover:border-white/14 transition-all duration-150 group"
// //           >
// //             <span className="text-xs text-white/35 group-hover:text-white/65 transition-colors">{s}</span>
// //           </button>
// //         ))}
// //       </div>
// //     </div>
// //   )
// // }

// // // ─── Main Page ──────────────────────────────────────────────────────────────────

// // export default function ChatPage() {
// //   const navigate = useNavigate()
// //   const { user, logout } = useAuth()

// //   const [jobs, setJobs]               = useState([])
// //   const [activeJob, setActiveJob]     = useState(null)
// //   const [topic, setTopic]             = useState('')
// //   const [submitting, setSubmitting]   = useState(false)
// //   const [loadingJobs, setLoadingJobs] = useState(true)
// //   const [error, setError]             = useState('')
// //   const [sidebarOpen, setSidebarOpen] = useState(true)
// //   const pollRef                       = useRef(null)
// //   const textareaRef                   = useRef(null)

// //   // Load history
// //   useEffect(() => {
// //     getMyJobs()
// //       .then(setJobs)
// //       .catch(() => {})
// //       .finally(() => setLoadingJobs(false))
// //   }, [])

// //   // Poll running job
// //   const startPolling = useCallback((jobId) => {
// //     clearInterval(pollRef.current)
// //     pollRef.current = setInterval(async () => {
// //       try {
// //         const updated = await getJob(jobId)
// //         setActiveJob(updated)
// //         setJobs(prev => prev.map(j => j.id === jobId ? updated : j))
// //         if (updated.status === 'completed' || updated.status === 'failed') {
// //           clearInterval(pollRef.current)
// //         }
// //       } catch { /* ignore */ }
// //     }, 3000)
// //   }, [])

// //   useEffect(() => () => clearInterval(pollRef.current), [])

// //   // Submit
// //   const handleSubmit = async (forceTopic) => {
// //     const t = (forceTopic ?? topic).trim()
// //     if (!t || submitting) return
// //     setError('')
// //     setSubmitting(true)
// //     setTopic('')
// //     if (textareaRef.current) textareaRef.current.style.height = 'auto'
// //     try {
// //       const job = await runPipeline(t)
// //       setJobs(prev => [job, ...prev])
// //       setActiveJob(job)
// //       if (job.status === 'running' || job.status === 'pending') startPolling(job.id)
// //     } catch (err) {
// //       setError(err.response?.data?.detail || 'Failed to start pipeline.')
// //     } finally {
// //       setSubmitting(false)
// //     }
// //   }

// //   const handleKeyDown = (e) => {
// //     if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
// //   }

// //   const handleSelectJob = (job) => {
// //     setActiveJob(job)
// //     if (job.status === 'running' || job.status === 'pending') startPolling(job.id)
// //   }

// //   return (
// //     <div className="flex h-screen bg-[#0d0d12] overflow-hidden">

// //       {/* ── Sidebar ── */}
// //       <aside
// //         className={`flex flex-col flex-shrink-0 border-r border-white/[0.07] bg-[#0d0d12]
// //           transition-all duration-300 overflow-hidden ${sidebarOpen ? 'w-64' : 'w-0'}`}
// //       >
// //         {/* Logo */}
// //         <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/[0.07] flex-shrink-0">
// //           <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20
// //             flex items-center justify-center text-indigo-400">
// //             <Logo />
// //           </div>
// //           <span className="text-xs font-semibold text-white tracking-tight">AI Research</span>
// //         </div>

// //         {/* New Research btn */}
// //         <div className="px-3 pt-3 flex-shrink-0">
// //           <button
// //             onClick={() => { setActiveJob(null); clearInterval(pollRef.current) }}
// //             className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl
// //               bg-indigo-500/8 border border-indigo-500/15 hover:bg-indigo-500/15
// //               hover:border-indigo-500/30 text-indigo-400 hover:text-indigo-300
// //               text-xs font-medium transition-all duration-150"
// //           >
// //             <PlusIcon /> New Research
// //           </button>
// //         </div>

// //         {/* Job list */}
// //         <div className="flex-1 overflow-y-auto px-3 pt-2 pb-3 space-y-0.5 mt-1
// //           scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/8">
// //           {loadingJobs ? (
// //             <div className="space-y-1.5 pt-1">
// //               {[1, 2, 3, 4].map(i => <SkeletonJobItem key={i} />)}
// //             </div>
// //           ) : jobs.length === 0 ? (
// //             <div className="text-center pt-10 text-white/20 text-[10px] font-mono">No jobs yet</div>
// //           ) : (
// //             jobs.map(job => (
// //               <JobItem
// //                 key={job.id}
// //                 job={job}
// //                 isActive={activeJob?.id === job.id}
// //                 onClick={() => handleSelectJob(job)}
// //               />
// //             ))
// //           )}
// //         </div>

// //         {/* User */}
// //         <div className="border-t border-white/[0.07] px-3 py-3 flex-shrink-0">
// //           <div className="flex items-center gap-2.5 px-1.5">
// //             {user?.picture
// //               ? <img src={user.picture} alt="" className="w-7 h-7 rounded-full ring-1 ring-white/15 flex-shrink-0" />
// //               : <div className="w-7 h-7 rounded-full bg-indigo-500/15 border border-indigo-500/20
// //                   flex items-center justify-center text-[10px] font-semibold text-indigo-300 flex-shrink-0">
// //                   {(user?.name || user?.email || '?')[0].toUpperCase()}
// //                 </div>
// //             }
// //             <div className="flex-1 min-w-0">
// //               <p className="text-white/60 text-[11px] font-medium truncate">{user?.name || 'User'}</p>
// //               <p className="text-white/25 text-[10px] truncate">{user?.email}</p>
// //             </div>
// //             <button
// //               onClick={() => { logout(); navigate('/login') }}
// //               className="text-white/20 hover:text-white/55 transition-colors p-1.5 rounded-lg hover:bg-white/5"
// //               title="Sign out"
// //             >
// //               <LogoutIcon />
// //             </button>
// //           </div>
// //         </div>
// //       </aside>

// //       {/* ── Main ── */}
// //       <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

// //         {/* Topbar */}
// //         <header className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.07] flex-shrink-0">
// //           <button
// //             onClick={() => setSidebarOpen(o => !o)}
// //             className="text-white/25 hover:text-white/55 transition-colors p-1.5 rounded-lg hover:bg-white/5"
// //           >
// //             <MenuIcon />
// //           </button>
// //           <div className="flex-1" />
// //           <span className="text-white/15 text-[10px] font-mono hidden sm:block">
// //             {jobs.length} research job{jobs.length !== 1 ? 's' : ''}
// //           </span>
// //         </header>

// //         {/* Content */}
// //         <div className="flex-1 overflow-hidden">
// //           {activeJob
// //             ? <JobDetail key={activeJob.id} job={activeJob} />
// //             : <EmptyState onSuggest={(s) => handleSubmit(s)} />
// //           }
// //         </div>

// //         {/* Input bar */}
// //         <div className="px-5 py-4 border-t border-white/[0.07] flex-shrink-0">
// //           {error && (
// //             <div className="mb-3 px-4 py-2.5 rounded-xl bg-red-500/8 border border-red-500/15
// //               text-red-400 text-xs">
// //               {error}
// //             </div>
// //           )}
// //           <div className="flex items-end gap-3 bg-white/[0.03] border border-white/[0.09] rounded-2xl
// //             px-4 py-3 focus-within:border-indigo-500/30 transition-all duration-200">
// //             <div className="text-white/20 pb-0.5 flex-shrink-0">
// //               <SearchIcon />
// //             </div>
// //             <textarea
// //               ref={textareaRef}
// //               rows={1}
// //               value={topic}
// //               onChange={e => setTopic(e.target.value)}
// //               onKeyDown={handleKeyDown}
// //               onInput={e => {
// //                 e.target.style.height = 'auto'
// //                 e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
// //               }}
// //               placeholder="Enter a research topic… (Enter to run)"
// //               disabled={submitting}
// //               className="flex-1 bg-transparent text-white text-sm placeholder-white/20
// //                 resize-none focus:outline-none leading-relaxed disabled:opacity-40"
// //               style={{ minHeight: '22px', maxHeight: '120px' }}
// //             />
// //             <button
// //               onClick={() => handleSubmit()}
// //               disabled={!topic.trim() || submitting}
// //               className="flex-shrink-0 w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-500
// //                 disabled:opacity-20 disabled:cursor-not-allowed
// //                 flex items-center justify-center text-white
// //                 transition-all duration-150 active:scale-95"
// //             >
// //               {submitting
// //                 ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
// //                 : <SendIcon />
// //               }
// //             </button>
// //           </div>
// //           <p className="text-center text-white/[0.1] text-[10px] mt-2 font-mono">
// //             Enter to research · Shift+Enter for new line
// //           </p>
// //         </div>
// //       </main>
// //     </div>
// //   )
// // }