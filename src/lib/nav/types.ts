export interface NavItem {
  id: string
  label: string
  href: string
  icon: string
  children?: NavItem[]
}

export interface NavSection {
  section: string
}

export type NavEntry = NavItem | NavSection

export function isNavItem(e: NavEntry): e is NavItem {
  return 'href' in e
}

export function isNavSection(e: NavEntry): e is NavSection {
  return 'section' in e
}
