'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Home, BookOpen } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Please enter your username and password.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(username.trim(), password);
      if (!result.success) {
        setError(result.error || 'Login failed. Please check your credentials.');
        return;
      }

      const user = useAuthStore.getState().user;
      if (!user) { setError('Login failed: could not retrieve user session.'); return; }

      if (user.role === 'ADMIN') {
        router.replace('/admin');
      } else {
        router.replace('/partner');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-4">
      <div className="w-full max-w-md">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-[var(--shadow-md)] animate-in animate-in-d2">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col items-center mb-8 gap-3">
              <div className="h-14 w-auto flex items-center justify-center overflow-hidden">
                <img src="/zemen-logo.png" alt="Zemen Bank" className="h-full w-auto" />
              </div>
              <div className="text-center animate-in animate-in-d1">
                <h1 className="f-display font-bold text-xl text-[var(--text)]">Dev Portal Dashboard</h1>
                <p className="text-xs text-[var(--text-3)] mt-1">Mini-App Integration Management</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-[var(--text-2)] mb-1.5 uppercase tracking-wide">
                  Username
                </label>
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 text-[14px] text-[var(--text)] transition-all placeholder:text-[var(--text-4)]"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[var(--text-2)] mb-1.5 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 pr-10 text-[14px] text-[var(--text)] transition-all placeholder:text-[var(--text-4)] font-[var(--font-mono)]"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-4)] hover:text-[var(--text-2)] transition-colors" aria-label="Toggle password visibility">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-[var(--status-failed-bg)] border border-[var(--status-failed-color)]/30 rounded-xl text-xs font-medium text-[var(--status-failed-color)]">
                {error}
              </div>
            )}

            <button type="submit" disabled={isLoading}
              className="w-full mt-6 bg-[var(--red)] hover:bg-[var(--red-hover)] text-white font-semibold rounded-xl py-3 px-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {isLoading ? (
                <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Signing in...</>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link href="/"
              className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2.5 px-4 text-[13px] font-semibold text-[var(--text-2)] hover:text-[var(--text)] hover:border-[var(--border-strong)] transition-all">
              <Home className="w-4 h-4" /> Back to Home
            </Link>
            <Link href="/developer"
              className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2.5 px-4 text-[13px] font-semibold text-[var(--text-2)] hover:text-[var(--text)] hover:border-[var(--border-strong)] transition-all">
              <BookOpen className="w-4 h-4" /> API Docs
            </Link>
          </div>
        </div>
        <p className="text-center text-[11px] text-[var(--text-4)] mt-4">
          © 2026 Zemen Bank S.C. · Authorized Access Only
        </p>
      </div>
    </div>
  );
}
