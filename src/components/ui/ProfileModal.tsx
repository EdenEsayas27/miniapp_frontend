'use client'

import { X, User, Mail, Shield } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

interface Props { open: boolean; onClose: () => void }

export default function ProfileModal({ open, onClose }: Props) {
  const { user } = useAuthStore()
  if (!open || !user) return null

  const initials = (user.fullName || user.username).substring(0, 2).toUpperCase()

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl shadow-[var(--shadow-lg)] w-full max-w-sm animate-scale">
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--red)]/10 flex items-center justify-center">
              <User className="w-5 h-5 text-[var(--red)]" />
            </div>
            <h2 className="font-bold text-sm text-[var(--text)]">Profile</h2>
          </div>
          <button onClick={onClose} className="text-[var(--text-3)] hover:text-[var(--text)] transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[var(--red)]/10 flex items-center justify-center font-bold text-2xl text-[var(--red)]">
              {initials}
            </div>
            <div>
              <p className="font-bold text-base text-[var(--text)]">{user.fullName || user.username}</p>
              <p className="text-xs text-[var(--text-3)] capitalize">{user.role?.toLowerCase()}</p>
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-[var(--bg)] border border-[var(--border)] rounded-xl">
              <User className="w-4 h-4 text-[var(--text-3)] shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-3)]">Username</p>
                <p className="text-sm font-semibold text-[var(--text)] truncate">{user.username}</p>
              </div>
            </div>
            {user.email && (
              <div className="flex items-center gap-3 p-3 bg-[var(--bg)] border border-[var(--border)] rounded-xl">
                <Mail className="w-4 h-4 text-[var(--text-3)] shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-3)]">Email</p>
                  <p className="text-sm font-semibold text-[var(--text)] truncate">{user.email}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 p-3 bg-[var(--bg)] border border-[var(--border)] rounded-xl">
              <Shield className="w-4 h-4 text-[var(--text-3)] shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-3)]">Role</p>
                <p className="text-sm font-semibold text-[var(--text)] capitalize">{user.role?.toLowerCase()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
