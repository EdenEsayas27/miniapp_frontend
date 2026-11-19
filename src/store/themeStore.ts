'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  dark: boolean
  sidebarCollapsed: boolean
  setDark: (dark: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      dark: false,
      sidebarCollapsed: false,

      setDark: (dark) => {
        set({ dark })
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
        }
      },

      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
    }),
    {
      name: 'zemen-theme',
    }
  )
)
