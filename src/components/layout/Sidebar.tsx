'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  PanelLeftClose, PanelLeftOpen, ChevronRight,
  LayoutDashboard, ArrowLeftRight, Smartphone,
  Receipt, Rocket, Terminal, Users, LucideProps,
} from 'lucide-react'
import { NavEntry, NavItem, isNavItem } from '@/lib/nav/types'

type IconName = 'LayoutDashboard' | 'ArrowLeftRight' | 'Smartphone' | 'Receipt' | 'Rocket' | 'Terminal' | 'Users'

const ICON_MAP: Record<IconName, React.FC<LucideProps>> = {
  LayoutDashboard,
  ArrowLeftRight,
  Smartphone,
  Receipt,
  Rocket,
  Terminal,
  Users,
}

function NavIcon({ name, className }: { name: string; className?: string }) {
  const Comp = ICON_MAP[name as IconName]
  if (!Comp) return null
  return <Comp className={className ?? 'w-[17px] h-[17px]'} strokeWidth={1.8} />
}

interface SidebarUser { name: string; role: string; initials: string }

interface SidebarProps {
  nav: NavEntry[]
  user: SidebarUser
  brandName?: string
  mobileOpen?: boolean
  onMobileClose?: () => void
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative group/tip flex">
      {children}
      <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-[200] whitespace-nowrap rounded-lg bg-[var(--black)] border border-[var(--border-strong)] px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-xl opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150">
        {label}
        <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[var(--black)]" />
      </div>
    </div>
  )
}

function NavItemRow({ item, pathname, collapsed }: { item: NavItem; pathname: string; collapsed: boolean }) {
  const isRoot = item.href === '/admin' || item.href === '/partner' || item.href === '/'
  const isActive = isRoot
    ? pathname === item.href
    : pathname === item.href || (item.href.length > 1 && pathname.startsWith(item.href + '/'))

  const activeClasses   = 'text-[var(--sidebar-text-active)] bg-[var(--sidebar-active-bg)] border-l-2 border-l-[var(--red)]'
  const inactiveClasses = 'text-[var(--sidebar-text)] border-l-2 border-l-transparent hover:text-[var(--sidebar-text-active)] hover:bg-[var(--sidebar-hover)]'

  if (collapsed) {
    return (
      <Tooltip label={item.label}>
        <Link href={item.href} prefetch={false}
          className={['flex items-center justify-center w-9 h-9 mx-auto rounded-lg transition-all duration-200 my-1',
            isActive ? 'bg-[var(--sidebar-active-bg)] text-[var(--red)]' : 'text-[var(--sidebar-text)] hover:text-[var(--sidebar-text-active)] hover:bg-[var(--sidebar-hover)]'].join(' ')}>
          <NavIcon name={item.icon} className="w-[17px] h-[17px]" />
        </Link>
      </Tooltip>
    )
  }

  return (
    <Link href={item.href} prefetch={false}
      className={['flex items-center gap-3 py-2.5 pl-4 pr-3 text-[13px] font-medium transition-all duration-150 my-0.5 w-full',
        isActive ? activeClasses : inactiveClasses].join(' ')}>
      <span className={['flex items-center justify-center w-5 h-5 shrink-0', isActive ? 'text-[var(--red)]' : ''].join(' ')}>
        <NavIcon name={item.icon} className="w-[16px] h-[16px]" />
      </span>
      <span className="flex-1 truncate">{item.label}</span>
    </Link>
  )
}

export default function Sidebar({
  nav, user, brandName = 'Zemen Dev Portal',
  mobileOpen = false, onMobileClose, collapsed = false, onCollapsedChange,
}: SidebarProps) {
  const pathname = usePathname()
  const width = collapsed ? 'w-[var(--sidebar-w-collapsed)]' : 'w-[var(--sidebar-w)]'

  return (
    <aside className={[
      'bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] flex flex-col h-[100dvh]',
      'fixed left-0 top-0 z-[100]',
      'transition-all duration-300 ease-in-out',
      width,
      'md:translate-x-0',
      mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0',
    ].join(' ')}>

      {/* Header */}
      <div className={['flex items-center h-[var(--topnav-h)] shrink-0 px-4 border-b border-[var(--sidebar-border)]', collapsed ? 'justify-center' : 'gap-3'].join(' ')}>
        <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
          <img src="/zBank-icon.png" alt={brandName} className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).src = '/zemen-logo.png' }} />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <span className="block font-bold text-sm text-[var(--text)] f-display truncate">{brandName}</span>
          </div>
        )}
        {!collapsed && (
          <button onClick={() => onCollapsedChange?.(true)}
            className="text-[var(--text-3)] hover:text-[var(--text)] transition-colors p-1 rounded-md hover:bg-[var(--sidebar-hover)] shrink-0 md:flex hidden">
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <button onClick={() => onCollapsedChange?.(false)}
          className="mx-auto mt-3 flex items-center justify-center w-8 h-8 rounded-lg text-[var(--text-3)] hover:text-[var(--text)] hover:bg-[var(--sidebar-hover)] transition-colors md:flex hidden">
          <PanelLeftOpen className="w-4 h-4" />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 py-5 overflow-y-auto flex flex-col overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden gap-2">
        {nav.map((entry) => {
          if (isNavItem(entry)) {
            return <NavItemRow key={entry.id} item={entry} pathname={pathname} collapsed={collapsed} />
          }
          return null
        })}
      </nav>

      {/* Footer */}
      <div className={['border-t border-[var(--sidebar-border)] w-full shrink-0 mt-auto', collapsed ? 'p-2' : 'p-3'].join(' ')}>
        {collapsed ? (
          <Tooltip label={`${user.name} · ${user.role}`}>
            <div className="w-9 h-9 mx-auto bg-[var(--bg)] border border-[var(--border)] rounded-lg flex items-center justify-center font-bold text-[11px] text-[var(--text)]">
              {user.initials}
            </div>
          </Tooltip>
        ) : (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] w-full overflow-hidden">
            <div className="w-8 h-8 bg-[var(--red)]/10 border border-[var(--border)] rounded-lg flex items-center justify-center font-bold text-[12px] text-[var(--red)] shadow-sm shrink-0">
              {user.initials}
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <span className="block text-[13px] font-semibold text-[var(--text)] truncate">{user.name}</span>
              <span className="block text-[11px] text-[var(--text-3)] capitalize truncate">{user.role}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
