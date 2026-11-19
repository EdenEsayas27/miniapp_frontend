import type { NavEntry } from './types'

export const PARTNER_NAV: NavEntry[] = [
  { id: 'partner-overview',     label: 'My Mini-App',        href: '/partner',              icon: 'LayoutDashboard' },
  { id: 'partner-sandbox',      label: 'API Sandbox',        href: '/partner/sandbox',      icon: 'Terminal' },
  { id: 'partner-golive',       label: 'Profile & Go-Live',  href: '/partner/golive',       icon: 'Rocket' },
  { id: 'partner-transactions', label: 'Transactions & Logs', href: '/partner/transactions', icon: 'Receipt' },
]
