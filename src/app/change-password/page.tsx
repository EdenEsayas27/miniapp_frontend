'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Eye, EyeOff, KeyRound, Check, Home } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import Link from 'next/link'

function StrengthBar({ password }: { password: string }) {
  const checks = [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'Uppercase letter',       pass: /[A-Z]/.test(password) },
    { label: 'Lowercase letter',       pass: /[a-z]/.test(password) },
    { label: 'Number',                 pass: /[0-9]/.test(password) },
    { label: 'Special character',      pass: /[^A-Za-z0-9]/.test(password) },
  ]
  const score = checks.filter(c => c.pass).length
  const color = score <= 1 ? 'bg-red-500' : score <= 2 ? 'bg-orange-500' : score <= 3 ? 'bg-yellow-400' : score <= 4 ? 'bg-blue-500' : 'bg-green-500'
  const label = score <= 1 ? 'Very weak' : score <= 2 ? 'Weak' : score <= 3 ? 'Fair' : score <= 4 ? 'Strong' : 'Very strong'

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-300 ${color}`} style={{ width: `${(score / 5) * 100}%` }} />
        </div>
        <span className={`text-[11px] font-bold ${score <= 2 ? 'text-red-500' : score <= 3 ? 'text-yellow-500' : 'text-green-600'}`}>{label}</span>
      </div>
    </div>
  )
}

export default function ChangePasswordPage() {
  const router = useRouter()
  const { user, changePassword, logout } = useAuthStore()

  const [current, setCurrent] = useState('')
  const [next, setNext]       = useState('')
  const [confirm, setConfirm] = useState('')
  const [showCur, setShowCur] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const checks = [next.length >= 8, /[A-Z]/.test(next), /[a-z]/.test(next), /[0-9]/.test(next), /[^A-Za-z0-9]/.test(next)]
  const allChecks = checks.every(Boolean)
  const match = next === confirm && next.length > 0
  const canSubmit = allChecks && match && current.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setMsg(null)
    try {
      const res = await changePassword(next, current)
      if (res.success) {
        setMsg({ type: 'ok', text: 'Password changed successfully.' })
        setTimeout(() => {
          if (user?.role === 'ADMIN') router.push('/admin')
          else router.push('/partner')
        }, 1200)
      } else {
        setMsg({ type: 'err', text: res.error || 'Failed to change password.' })
      }
    } catch {
      setMsg({ type: 'err', text: 'An unexpected error occurred.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[var(--red)]/10 text-[var(--red)] flex items-center justify-center">
            <KeyRound className="w-7 h-7" />
          </div>
          <div className="text-center">
            <h1 className="f-display font-bold text-xl text-[var(--text)]">Change Password</h1>
            <p className="text-xs text-[var(--text-3)] mt-1">Update your Zemen Portal account password</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 shadow-[var(--shadow-md)] space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-[var(--text-2)] uppercase tracking-wide mb-1.5">Current Password</label>
            <div className="relative">
              <input type={showCur ? 'text' : 'password'} value={current} onChange={e => setCurrent(e.target.value)}
                placeholder="••••••••" required
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 pr-10 f-mono text-[14px] focus:border-[var(--red)] focus:outline-none transition-all" />
              <button type="button" onClick={() => setShowCur(!showCur)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-4)] hover:text-[var(--text-2)] transition-colors">
                {showCur ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[var(--text-2)] uppercase tracking-wide mb-1.5">New Password</label>
            <div className="relative">
              <input type={showNext ? 'text' : 'password'} value={next} onChange={e => setNext(e.target.value)}
                placeholder="••••••••" required
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 pr-10 f-mono text-[14px] focus:border-[var(--red)] focus:outline-none transition-all" />
              <button type="button" onClick={() => setShowNext(!showNext)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-4)] hover:text-[var(--text-2)] transition-colors">
                {showNext ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {next.length > 0 && <StrengthBar password={next} />}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[var(--text-2)] uppercase tracking-wide mb-1.5">Confirm New Password</label>
            <div className="relative">
              <input type={showConf ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••" required
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 pr-10 f-mono text-[14px] focus:border-[var(--red)] focus:outline-none transition-all" />
              <button type="button" onClick={() => setShowConf(!showConf)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-4)] hover:text-[var(--text-2)] transition-colors">
                {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirm.length > 0 && (
              <div className={`flex items-center gap-2 mt-1.5 text-[12px] font-semibold ${match ? 'text-green-600' : 'text-red-500'}`}>
                <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${match ? 'bg-green-500' : 'bg-red-500'}`}>
                  {match && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                </div>
                {match ? 'Passwords match' : 'Passwords do not match'}
              </div>
            )}
          </div>

          {msg && (
            <div className={`p-3 rounded-xl text-xs font-medium ${msg.type === 'ok' ? 'bg-[var(--status-success-bg)] text-[var(--status-success-color)]' : 'bg-[var(--status-failed-bg)] text-[var(--status-failed-color)]'}`}>
              {msg.text}
            </div>
          )}

          <button type="submit" disabled={!canSubmit || submitting}
            className="w-full mt-2 bg-[var(--red)] hover:bg-[var(--red-hover)] text-white font-bold rounded-xl py-3 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm">
            {submitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating…</> : 'Change Password'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link href="/" className="text-xs text-[var(--text-3)] hover:text-[var(--red)] transition-colors inline-flex items-center gap-1">
            <Home className="w-3.5 h-3.5" /> Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
