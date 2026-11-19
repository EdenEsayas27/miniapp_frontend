'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Topnav from '@/components/layout/Topnav';
import { ADMIN_NAV } from '@/lib/nav/admin.nav';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import ChangePasswordModal from '@/components/ui/ChangePasswordModal';
import ProfileModal from '@/components/ui/ProfileModal';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { dark, sidebarCollapsed, setDark, setSidebarCollapsed } = useThemeStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setMobileOpen(false); }, [pathname]);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted) {
      if (!user || user.role !== 'ADMIN') {
        router.push('/login');
      }
    }
  }, [mounted, user, router]);

  if (!mounted || !user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="flex flex-col items-center gap-3 text-[var(--text-3)]">
          <div className="w-8 h-8 border-2 border-[var(--red)]/30 border-t-[var(--red)] rounded-full animate-spin" />
          <span className="text-sm">Verifying access...</span>
        </div>
      </div>
    );
  }

  const activeUser = {
    name: user.fullName || user.username,
    role: 'Admin',
    initials: (user.fullName || user.username).substring(0, 2).toUpperCase(),
  };

  const breadcrumb =
    pathname === '/admin' ? 'Mini-App Management'
    : pathname.startsWith('/admin/payments') ? 'Transactions'
    : pathname.startsWith('/admin/users') ? 'User Management'
    : 'Admin Console';

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[var(--bg)] text-[var(--text)] text-[14px]">
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-[90] md:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)} />
      )}

      <Sidebar
        nav={ADMIN_NAV}
        user={activeUser}
        brandName="Admin Console"
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      <div
        className="flex-1 flex flex-col h-[100dvh] overflow-hidden transition-all duration-300 relative w-full md:pl-[var(--sidebar-w-offset)]"
        style={{ '--sidebar-w-offset': sidebarCollapsed ? 'var(--sidebar-w-collapsed)' : 'var(--sidebar-w)' } as React.CSSProperties}
      >
        <Topnav
          userInitials={activeUser.initials}
          userName={activeUser.name}
          userRole="Admin"
          breadcrumb={breadcrumb}
          dark={dark}
          onDarkToggle={setDark}
          onMobileMenuClick={() => setMobileOpen(!mobileOpen)}
          onLogout={() => { logout(); router.push('/login'); }}
          onProfile={() => setProfileOpen(true)}
          onChangePassword={() => setPwdOpen(true)}
        />
        <main className="flex-1 min-h-0 overflow-y-auto [scrollbar-width:thin] p-2 sm:p-4 md:p-6 lg:p-8">
          <div className="w-full min-h-full animate-in">{children}</div>
        </main>
      </div>

      <ChangePasswordModal open={pwdOpen} onClose={() => setPwdOpen(false)} />
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}
