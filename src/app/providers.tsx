'use client'

import { useThemeStore } from '@/store/themeStore'
import { useEffect, useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const { dark } = useThemeStore()

  useEffect(() => {
    setMounted(true)
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  }, [dark])

  if (!mounted) return <>{children}</>

  return <>{children}</>
}
