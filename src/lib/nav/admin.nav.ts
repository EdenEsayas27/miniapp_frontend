import type { NavEntry } from './types'

export const ADMIN_NAV: NavEntry[] = [
  { id: 'admin-miniapps',  label: 'Mini-Apps',       href: '/admin',          icon: 'Smartphone' },
  { id: 'admin-payments',  label: 'Transactions',    href: '/admin/payments', icon: 'ArrowLeftRight' },
  { id: 'admin-users',     label: 'User Management', href: '/admin/users',    icon: 'Users' },
]
