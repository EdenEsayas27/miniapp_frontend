'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight, Menu, X, Check, Zap, Shield, Globe, Code,
  CheckCircle2, Moon, Sun, Terminal, Smartphone, Key,
  type LucideIcon,
} from 'lucide-react'
import { useThemeStore } from '@/store/themeStore'

/* ── Status chip types ── */
type Status = 'accepted' | 'success' | 'failed' | 'cancelled' | 'expired'
type ScenarioKey = 'success' | 'failed' | 'cancelled' | 'expired'

const SCENARIOS: Record<ScenarioKey, Status[]> = {
  success:   ['accepted', 'success'],
  failed:    ['accepted', 'failed'],
  cancelled: ['accepted', 'cancelled'],
  expired:   ['accepted', 'expired'],
}
const SCENARIO_ORDER: ScenarioKey[] = ['success', 'failed', 'cancelled', 'expired']
const SCENARIO_COPY: Record<ScenarioKey, { title: string; blurb: string }> = {
  success:   { title: 'Customer approves',  blurb: 'Happy path. PIN accepted, funds confirmed.' },
  failed:    { title: 'Issuer declines',    blurb: 'The bank rejects the payment. See failure_code.' },
  cancelled: { title: 'Customer cancels',   blurb: 'The customer cancels the payment on their phone.' },
  expired:   { title: 'Customer walks away',blurb: 'The prompt expires before the customer completes it.' },
}
const STATUS_LABEL: Record<Status, string> = {
  accepted: 'Accepted', success: 'Success', failed: 'Failed', cancelled: 'Cancelled', expired: 'Expired',
}
const STATUS_HINT: Record<Status, string> = {
  accepted: 'In progress. Wait for the callback.',
  success:  'Paid.',
  failed:   'Not paid. See failure_code.',
  cancelled:'The customer cancelled.',
  expired:  'The customer did not complete the payment in time.',
}
const TERMINAL: Status[] = ['success', 'failed', 'cancelled', 'expired']

const FLOATING_REFS = [
  { key: 1, t: 'Zemen Bank', l: '4%',  top: '62%', d: '0s'   },
  { key: 2, t: 'Zemen Bank', l: '14%', top: '82%', d: '2.2s' },
  { key: 3, t: 'Zemen Bank', l: '46%', top: '88%', d: '4.1s' },
  { key: 4, t: 'Zemen Bank', l: '58%', top: '70%', d: '1.1s' },
  { key: 5, t: 'Zemen Bank', l: '78%', top: '84%', d: '3.3s' },
  { key: 6, t: 'Zemen Bank', l: '90%', top: '66%', d: '5.4s' },
]

/* ── Hooks ── */
function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(m.matches)
    const h = () => setReduced(m.matches)
    m.addEventListener('change', h)
    return () => m.removeEventListener('change', h)
  }, [])
  return reduced
}

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } }, { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return { ref, seen }
}

/* ── Components ── */
function StatusChip({ status, pulse = false }: { status: Status; pulse?: boolean }) {
  return (
    <span
      className="f-mono inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap"
      style={{ background: `var(--status-${status}-bg)`, color: `var(--status-${status}-color)` }}
    >
      <span className={`w-1.5 h-1.5 rounded-full bg-current ${pulse ? 'pg-pulse' : ''}`} />
      {STATUS_LABEL[status]}
    </span>
  )
}

function Ring({ pct, color, shake }: { pct: number; color: string; shake: boolean }) {
  return (
    <svg viewBox="0 0 120 120" className={`w-full h-full ${shake ? 'pg-shake' : ''}`} aria-hidden="true">
      <g transform="rotate(-90 60 60)">
        <circle cx="60" cy="60" r="52" pathLength={100} fill="none" stroke="var(--border-strong)" strokeWidth="1.5" strokeDasharray="22 3" />
        <circle cx="60" cy="60" r="52" pathLength={100} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={`${pct} 100`} style={{ transition: 'stroke-dasharray .9s cubic-bezier(.16,1,.3,1), stroke .4s' }} />
      </g>
    </svg>
  )
}

function ringState(status: Status, idx: number) {
  switch (status) {
    case 'success':   return { pct: 100, color: 'var(--status-success-color)',   shake: false }
    case 'failed':    return { pct: 72,  color: 'var(--status-failed-color)',    shake: true  }
    case 'cancelled': return { pct: 90,  color: 'var(--status-failed-color)',    shake: false }
    case 'expired':   return { pct: 54,  color: 'var(--status-timeout-color)',   shake: false }
    default:          return { pct: (idx + 1) * 18, color: 'var(--red)',         shake: false }
  }
}

function PaymentConsole({ scenario, runId, reduced, autoplay = false, onNext }:
  { scenario: ScenarioKey; runId: number; reduced: boolean; autoplay?: boolean; onNext?: () => void }) {
  const steps = SCENARIOS[scenario]
  const [idx, setIdx] = useState(0)
  const nextRef = useRef(onNext)
  nextRef.current = onNext

  useEffect(() => {
    if (reduced) { setIdx(steps.length - 1); return }
    setIdx(0)
    const timers: ReturnType<typeof setTimeout>[] = []
    steps.forEach((_, i) => { if (i > 0) timers.push(setTimeout(() => setIdx(i), i * 1100)) })
    if (autoplay) timers.push(setTimeout(() => nextRef.current?.(), (steps.length - 1) * 1100 + 2800))
    return () => timers.forEach(clearTimeout)
  }, [scenario, runId, autoplay, reduced, steps])

  const current = steps[idx]
  const ring = ringState(current, idx)
  const isTerminal = TERMINAL.includes(current)
  const failureCode: Record<Status, string | null> = {
    accepted: null, success: null, failed: 'INSUFFICIENT_FUNDS', cancelled: 'CUSTOMER_CANCELLED', expired: 'CUSTOMER_TIMEOUT',
  }

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-[var(--shadow-md)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-2)]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--red)]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--gray-5)]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--gray-5)]" />
        </div>
        <span className="f-mono text-[10px] text-[var(--text-4)]">payment-lifecycle.ts</span>
      </div>
      <div className="grid sm:grid-cols-[200px_1fr] gap-6 p-6 items-center">
        <div className="relative w-[180px] h-[180px] sm:w-[200px] sm:h-[200px] mx-auto">
          <Ring {...ring} />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <span className="f-mono text-[11px] text-[var(--text-3)]">ETB</span>
            <span className="f-mono text-2xl font-medium text-[var(--text)] -mt-1.5">1,250.00</span>
            <StatusChip status={current} pulse={!isTerminal} />
          </div>
        </div>
        <ol className="space-y-2.5">
          {steps.map((s, i) => {
            const state = i < idx ? 'done' : i === idx ? 'active' : 'pending'
            return (
              <li key={s} className={`flex items-start gap-3 transition-opacity duration-500 ${state === 'pending' ? 'opacity-35' : 'opacity-100'}`}>
                <span className={`mt-0.5 w-5 h-5 shrink-0 rounded-full flex items-center justify-center border transition-colors ${
                  state === 'done' ? 'bg-[var(--text)] border-[var(--text)] text-[var(--surface)]'
                  : state === 'active' ? 'border-[var(--red)] text-[var(--red)]'
                  : 'border-[var(--border-strong)]'}`}>
                  {state === 'done' ? <Check className="w-3 h-3" strokeWidth={3} />
                    : state === 'active' ? <span className={`w-2 h-2 rounded-full bg-current ${isTerminal ? '' : 'pg-pulse'}`} />
                    : null}
                </span>
                <div className="min-w-0">
                  <div className="f-mono text-sm text-[var(--text)]">{s}</div>
                  <div className="text-xs text-[var(--text-3)]">{STATUS_HINT[s]}</div>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
      <div className="border-t border-[var(--border)] bg-[var(--surface-2)] px-6 py-4">
        <pre className="f-mono text-xs leading-relaxed text-[var(--text-2)] overflow-x-auto">
          {`{\n  "payment_ref": "PAY-20261005-000123",\n  "status": "`}
          <span style={{ color: `var(--status-${current}-color)`, fontWeight: 500 }}>{current.toUpperCase()}</span>
          {`",\n  "amount": 1250.00,\n  "currency": "ETB",\n  "failure_code": ${failureCode[current] ? `"${failureCode[current]}"` : 'null'}\n}`}
        </pre>
      </div>
    </div>
  )
}

/* ── Navbar ── */
const navLinks = [
  { href: '/developer', label: 'API Docs' },
  { href: '/login',     label: 'Login', variant: 'primary' as const },
]

function Nav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { dark, setDark } = useThemeStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled || open ? 'bg-[var(--surface)]/95 backdrop-blur-md border-b border-[var(--border)] shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3" aria-label="Zemen Bank Dev Portal">
            <div className="h-9 w-auto flex items-center justify-center overflow-hidden">
              <img src="/zemen-logo.png" alt="Zemen Bank" className="h-full w-auto" />
            </div>
            <span className="f-display font-bold text-xl text-[var(--text)] hidden sm:block">Dev Portal</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-6">
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((l) => (
                <Link key={l.href} href={l.href} className={
                  l.variant === 'primary'
                    ? 'bg-[var(--red)] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[var(--red-hover)] transition-colors'
                    : 'text-[var(--text-2)] hover:text-[var(--text)] text-sm font-medium transition-colors'
                }>{l.label}</Link>
              ))}
            </div>
            <button type="button" onClick={() => setDark(!dark)} aria-label="Toggle theme"
              className="p-2 rounded-lg text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors">
              {!mounted ? <span className="w-5 h-5" /> : dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button className="md:hidden p-2 rounded-lg text-[var(--text)] hover:bg-[var(--surface)]"
              onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle menu">
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {open && (
          <div className="md:hidden py-4 border-t border-[var(--border)] animate-in">
            <div className="flex flex-col gap-2">
              {navLinks.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                  className={l.variant === 'primary'
                    ? 'bg-[var(--red)] text-white px-4 py-3 rounded-md text-base font-medium text-center'
                    : 'text-[var(--text-2)] px-4 py-3 rounded-lg text-base font-medium hover:bg-[var(--surface)]'}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

/* ── Hero ── */
function Hero({ reduced }: { reduced: boolean }) {
  const [scenario, setScenario] = useState<ScenarioKey>('success')
  const [runId, setRunId] = useState(0)

  const next = () => {
    setScenario((s) => SCENARIO_ORDER[(SCENARIO_ORDER.indexOf(s) + 1) % SCENARIO_ORDER.length])
    setRunId((r) => r + 1)
  }

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  return (
    <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-20 overflow-hidden" onMouseMove={onMove}>
      <div className="pg-grid absolute inset-0" aria-hidden="true" />
      <div className="pg-glow absolute inset-0" aria-hidden="true" />
      {!reduced && FLOATING_REFS.map((f) => (
        <span key={f.key} aria-hidden="true"
          className="pg-float f-mono absolute text-[11px] text-[var(--text-4)] select-none hidden md:block"
          style={{ left: f.l, top: f.top, animationDelay: f.d }}>{f.t}</span>
      ))}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_1.05fr] gap-12 lg:gap-10 items-center">
        <div className="animate-in">
          <div className="f-mono inline-flex items-center gap-2 text-xs text-[var(--text-2)] border border-[var(--border)] bg-[var(--surface)] rounded-md px-3 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--red)] pg-pulse" />
            ZEMEN BANK · MINI-APP PLATFORM
          </div>
          <h1 className="f-display text-4xl sm:text-5xl lg:text-[3.6rem] font-bold tracking-tight text-[var(--text)] leading-[1.05] mb-6">
            Every payment,<br />
            from <span className="text-[var(--red)]">request</span> to{' '}
            <span className="text-[var(--red)]">receipt.</span>
          </h1>
          <p className="text-[var(--text-2)] text-lg mb-8 max-w-lg leading-relaxed">
            Integrate your Mini-App with Zemen Bank's payment infrastructure. Test in sandbox, go live in days.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/developer"
              className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[var(--red)] text-white font-semibold rounded-xl hover:bg-[var(--red-hover)] transition-all shadow-lg">
              View API Docs
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/login"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[var(--surface)] text-[var(--text)] font-semibold rounded-xl border border-[var(--border)] hover:border-[var(--border-strong)] transition-all">
              Partner Login
            </Link>
          </div>
        </div>
        <div className="animate-in animate-in-d2">
          <PaymentConsole scenario={scenario} runId={runId} reduced={reduced} autoplay onNext={next} />
        </div>
      </div>
    </section>
  )
}

/* ── Features ── */
const FEATURES = [
  { icon: Zap,       title: 'Instant Integration',  desc: 'Two API calls to initiate a payment. Sandbox ready in minutes with pre-seeded test credentials.' },
  { icon: Shield,    title: 'Bank-Grade Security',   desc: 'HMAC-SHA256 request signing, AES-GCM encrypted keys, and JWT session tokens.' },
  { icon: Globe,     title: 'Super App Ecosystem',   desc: 'Your Mini-App lives inside Zemen Bank Super App — 1M+ customers, zero acquisition cost.' },
  { icon: Terminal,  title: 'Interactive Sandbox',   desc: 'Test all endpoints live in the browser. No account needed. Real callback simulation.' },
  { icon: Smartphone,title: 'Developer Test APK',   desc: 'Test your mini-app directly on real Android devices using our official sandbox APK.' },
  { icon: Code,      title: 'Full API Reference',    desc: 'Complete endpoint docs, error codes, HMAC playground, and callback spec in one place.' },
]

function Features({ reduced }: { reduced: boolean }) {
  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="f-mono text-xs text-[var(--red)] mb-3">DEVELOPER TOOLS</p>
          <h2 className="f-display text-3xl sm:text-4xl font-bold text-[var(--text)] mb-4">Everything you need to integrate</h2>
          <p className="text-[var(--text-2)] max-w-2xl mx-auto">From your first API call to production launch — all tools in one developer portal.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div key={f.title} className={`p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-[var(--border-strong)] transition-all ${!reduced ? 'animate-in' : ''}`}
              style={!reduced ? { animationDelay: `${i * 60}ms` } : {}}>
              <div className="w-10 h-10 rounded-xl bg-[var(--red)]/10 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-[var(--red)]" />
              </div>
              <h3 className="f-display font-bold text-[var(--text)] mb-2">{f.title}</h3>
              <p className="text-sm text-[var(--text-3)] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── How it works ── */
const STEPS = [
  { step: '01', title: 'Get Credentials',  desc: 'Register your Mini-App with Zemen Bank. Receive a sandbox API key instantly.' },
  { step: '02', title: 'Initiate Payment', desc: 'Call POST /Payment with your Mini-App ID, customer phone, and amount. Get a payment token back.' },
  { step: '03', title: 'Customer Approves',desc: 'Customer approves on the Super App USSD prompt. Accepted status is not final — wait for callback.' },
  { step: '04', title: 'Get Confirmation', desc: 'Bank sends a signed callback: SUCCESS, FAILED, CANCELLED, or EXPIRED. Done.' },
]

function HowItWorks() {
  const { ref, seen } = useInView<HTMLElement>()
  return (
    <section ref={ref} className="py-20 lg:py-28 bg-[var(--surface)]/40 border-y border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="f-mono text-xs text-[var(--red)] mb-3">HOW IT WORKS</p>
          <h2 className="f-display text-3xl sm:text-4xl font-bold text-[var(--text)] mb-4">Four steps to launch</h2>
          <p className="text-[var(--text-2)]">From zero to live payments in a single sprint.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s, i) => (
            <div key={s.step} className={`relative p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl transition-all duration-700 ${seen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ transitionDelay: `${i * 120}ms` }}>
              <div className="f-mono text-3xl font-bold text-[var(--red)]/20 mb-4">{s.step}</div>
              <h3 className="f-display font-bold text-[var(--text)] mb-2">{s.title}</h3>
              <p className="text-sm text-[var(--text-3)] leading-relaxed">{s.desc}</p>
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-[var(--border-strong)]" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── CTA ── */
function CTA() {
  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-10 sm:p-16 shadow-[var(--shadow-md)]">
          <div className="f-mono inline-flex items-center gap-2 text-xs text-[var(--text-2)] border border-[var(--border)] rounded-md px-3 py-1.5 mb-6">
            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--red)]" /> No account needed to explore
          </div>
          <h2 className="f-display text-3xl sm:text-4xl font-bold text-[var(--text)] mb-4">Ready to integrate?</h2>
          <p className="text-[var(--text-2)] mb-8 max-w-xl mx-auto">Open the API Docs to explore endpoints, run live tests in the sandbox, and simulate the full payment lifecycle — no sign-up required.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/developer"
              className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[var(--red)] text-white font-semibold rounded-xl hover:bg-[var(--red-hover)] transition-all shadow-lg">
              Open API Docs <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/login"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[var(--surface-2)] text-[var(--text)] font-semibold rounded-xl border border-[var(--border)] hover:border-[var(--border-strong)] transition-all">
              <Key className="w-4 h-4" /> Partner Login
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Footer ── */
function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src="/zemen-logo.png" alt="Zemen Bank" className="h-7 w-auto" />
          <span className="text-sm text-[var(--text-3)]">© 2026 Zemen Bank S.C.</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-[var(--text-3)]">
          <Link href="/developer" className="hover:text-[var(--text)] transition-colors">API Docs</Link>
          <Link href="/login"     className="hover:text-[var(--text)] transition-colors">Login</Link>
        </div>
      </div>
    </footer>
  )
}

/* ── Page ── */
export default function LandingPage() {
  const reduced = useReducedMotion()
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Nav />
      <Hero reduced={reduced} />
      <Features reduced={reduced} />
      <HowItWorks />
      <CTA />
      <Footer />
    </div>
  )
}
