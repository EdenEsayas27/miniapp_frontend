'use client'

import { useState } from 'react'
import { Eye, EyeOff, KeyRound, Check, X } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

interface Props { open: boolean; onClose: () => void }

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

export default function ChangePasswordModal({ open, onClose }: Props) {
  const [current, setCurrent] = useState('')
  const [next, setNext]       = useState('')
  const [confirm, setConfirm] = useState('')
  const [showCur, setShowCur] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const { changePassword } = useAuthStore()

  const checks = [next.length >= 8, /[A-Z]/.test(next), /[a-z]/.test(next), /[0-9]/.test(next), /[^A-Za-z0-9]/.test(next)]
  const allChecks = checks.every(Boolean)
  const match = next === confirm && next.length > 0
  const canSubmit = allChecks && match && current.length > 0

  if (!open) return null

  const reset = () => { setCurrent(''); setNext(''); setConfirm(''); setMsg(null); }
  const close = () => { reset(); onClose(); }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setMsg(null)
    try {
      await changePassword(next, current)
      setMsg({ type: 'ok', text: 'Password changed successfully.' })
      setTimeout(close, 1500)
    } catch {
      setMsg({ type: 'err', text: 'Failed to change password. Check your current password.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl shadow-[var(--shadow-lg)] w-full max-w-md animate-scale">
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--red)]/10 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-[var(--red)]" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-[var(--text)]">Change Password</h2>
              <p className="text-[11px] text-[var(--text-3)]">Update your account password</p>
            </div>
          </div>
          <button onClick={close} className="text-[var(--text-3)] hover:text-[var(--text)] transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {[
            { id: 'cur', label: 'Current Password', value: current, onChange: setCurrent, show: showCur, onToggle: () => setShowCur(s => !s) },
            { id: 'new', label: 'New Password',      value: next,    onChange: setNext,    show: showNext, onToggle: () => setShowNext(s => !s) },
            { id: 'con', label: 'Confirm Password',  value: confirm, onChange: setConfirm, show: showConf, onToggle: () => setShowConf(s => !s) },
          ].map(f => (
            <div key={f.id}>
              <label className="block text-[11px] font-bold text-[var(--text-2)] uppercase tracking-wide mb-1.5">{f.label}</label>
              <div className="relative">
                <input type={f.show ? 'text' : 'password'} value={f.value} onChange={e => f.onChange(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 pr-10 f-mono text-[14px] focus:border-[var(--red)] focus:outline-none transition-all" />
                <button type="button" onClick={f.onToggle}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-4)] hover:text-[var(--text-2)] transition-colors">
                  {f.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {f.id === 'new' && next.length > 0 && <StrengthBar password={next} />}
              {f.id === 'con' && confirm.length > 0 && (
                <div className={`flex items-center gap-2 mt-1.5 text-[12px] font-semibold ${match ? 'text-green-600' : 'text-red-500'}`}>
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${match ? 'bg-green-500' : 'bg-red-500'}`}>
                    {match && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                  </div>
                  {match ? 'Passwords match' : 'Passwords do not match'}
                </div>
              )}
            </div>
          ))}

          {msg && (
            <div className={`p-3 rounded-xl text-xs font-medium ${msg.type === 'ok' ? 'bg-[var(--status-success-bg)] text-[var(--status-success-color)]' : 'bg-[var(--status-failed-bg)] text-[var(--status-failed-color)]'}`}>
              {msg.text}
            </div>
          )}

          <button type="submit" disabled={!canSubmit || submitting}
            className="w-full mt-2 bg-[var(--red)] hover:bg-[var(--red-hover)] text-white font-bold rounded-xl py-3 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm">
            {submitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Changing…</> : 'Set New Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
