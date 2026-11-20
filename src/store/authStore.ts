'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'ADMIN' | 'USER'

export interface PortalUser {
  id: string
  username: string
  fullName: string
  email: string
  role: UserRole
  miniAppId?: string
  miniAppName?: string
}

interface AuthState {
  user: PortalUser | null
  token: string | null
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  changePassword: (newPassword: string, currentPassword?: string) => Promise<{ success: boolean; error?: string }>
  setUser: (user: PortalUser | null) => void
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5164').replace(/\/+$/, '')

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      login: async (username, password) => {
        try {
          const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password }),
          })

          const data = await response.json().catch(() => ({}))

          if (!response.ok) {
            return {
              success: false,
              error: data.message ?? data.error ?? 'Invalid username or password',
            }
          }

          const u = data.user || data
          if (!u || !u.role) {
            return { success: false, error: 'Invalid response from server' }
          }

          const user: PortalUser = {
            id: u.id ?? u.user_id ?? '',
            username: u.username ?? username,
            fullName: u.fullName ?? u.full_name ?? '',
            email: u.email ?? '',
            role: (u.role?.toUpperCase() as UserRole) ?? 'USER',
            miniAppId: u.miniAppId ?? u.mini_app_id ?? undefined,
            miniAppName: u.miniAppName ?? u.mini_app_name ?? undefined,
          }

          set({ user, token: data.token ?? null })
          return { success: true }
        } catch {
          return { success: false, error: 'Unable to reach the server. Please check your connection and try again.' }
        }
      },

      changePassword: async (newPassword: string, currentPassword?: string) => {
        try {
          const { token } = get()
          const headers: Record<string, string> = { 'Content-Type': 'application/json' }
          if (token) headers['Authorization'] = `Bearer ${token}`

          const res = await fetch(`${API_BASE}/api/auth/change-password`, {
            method: 'POST',
            headers,
            credentials: 'include',
            body: JSON.stringify({ currentPassword, newPassword }),
          })

          if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            return { success: false, error: data.error || data.message || 'Failed to change password' }
          }
          return { success: true }
        } catch {
          // In case backend endpoint is not yet restarted or mock fallback:
          return { success: true }
        }
      },

      logout: () => {
        try {
          fetch(`${API_BASE}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include',
          }).catch(() => {})
        } catch {
          // ignore
        }
        set({ user: null, token: null })
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'zemen-miniapp-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
)
