'use client'

import { useState } from 'react'
import { Menu, User, Lock, LogOut, Sun, Moon, Eye } from 'lucide-react'

interface TopnavProps {
  userInitials: string
  userName: string
  userRole: string
  breadcrumb?: string
  dark?: boolean
  onDarkToggle?: (dark: boolean) => void
  onMobileMenuClick?: () => void
  onLogout?: () => void
  onProfile?: () => void
  onChangePassword?: () => void
}

export default function Topnav({
  userInitials, userName, userRole, breadcrumb = 'Dashboard',
  dark = false, onDarkToggle, onMobileMenuClick, onLogout,
  onProfile, onChangePassword,
}: TopnavProps) {
  const [profileOpen, setProfileOpen] = useState(false)
  const isReadOnly = userRole?.toUpperCase() === 'OBSERVER'

  return (
    <>
      {profileOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
      )}
      <header className="h-[var(--topnav-h)] bg-[var(--surface)] border-b border-[var(--border)] flex items-center px-3 md:px-4 gap-2 md:gap-3 sticky top-0 z-50">
        <button onClick={onMobileMenuClick}
          className="md:hidden p-1.5 rounded-lg text-[var(--text-3)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors shrink-0">
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="flex-1 font-bold text-[13px] md:text-[15px] f-display text-[var(--text)] truncate">
          {breadcrumb}
        </h1>

        <div className="flex items-center gap-3">
          {isReadOnly && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide bg-[var(--red-subtle)] text-[var(--red)] border border-[var(--border)]">
              <Eye className="w-3 h-3" /> Read only
            </span>
          )}

          <button type="button" onClick={() => onDarkToggle?.(!dark)} aria-label={dark ? 'Light mode' : 'Dark mode'}
            className="p-2 rounded-lg text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors">
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="relative">
            <button onClick={() => setProfileOpen(!profileOpen)}
              className="w-8 h-8 rounded-full bg-[var(--red)]/10 border border-[var(--border)] flex items-center justify-center font-semibold text-[11px] text-[var(--red)] hover:border-[var(--red)] transition-colors">
              {userInitials}
            </button>

            {profileOpen && (
              <div className="absolute top-10 right-0 w-56 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-[var(--shadow-md)] z-[300] overflow-hidden animate-in">
                <div className="p-3 bg-[var(--bg)] border-b border-[var(--border)]">
                  <p className="font-semibold text-xs text-[var(--text)]">{userName}</p>
                  <p className="text-[10px] text-[var(--text-3)] capitalize">{userRole}</p>
                </div>
                <div className="p-1">
                  {onProfile && (
                    <button onClick={() => { setProfileOpen(false); onProfile(); }}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-[12px] font-medium text-[var(--text-2)] hover:bg-[var(--bg)] rounded-lg transition-colors text-left">
                      <User className="w-3.5 h-3.5" /> Profile
                    </button>
                  )}
                  {onChangePassword && (
                    <button onClick={() => { setProfileOpen(false); onChangePassword(); }}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-[12px] font-medium text-[var(--text-2)] hover:bg-[var(--bg)] rounded-lg transition-colors text-left">
                      <Lock className="w-3.5 h-3.5" /> Change Password
                    </button>
                  )}
                </div>
                <div className="p-1 border-t border-[var(--border)]">
                  <button onClick={() => { setProfileOpen(false); onLogout?.(); }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-[12px] font-semibold text-[var(--red)] hover:bg-[var(--red-pale)] rounded-lg transition-colors">
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  )
}
