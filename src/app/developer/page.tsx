'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  BookOpen, Terminal, Smartphone, Code2, Send, Layers,
  ArrowLeft, Moon, Sun, Menu, X, ShieldCheck,
  AlertCircle, RefreshCw,
} from 'lucide-react';
import { AdminApiService } from '@/services/api';
import { MiniAppAdmin } from '@/types/miniapp';
import { OverviewTab } from '@/components/developer/OverviewTab';
import { ApiSandbox } from '@/components/developer/ApiSandbox';
import { SignaturePlayground } from '@/components/developer/SignaturePlayground';
import { WebhooksTab } from '@/components/developer/WebhooksTab';
import { useThemeStore } from '@/store/themeStore';

export const DEMO_APP: MiniAppAdmin = {
  id: 'demo-miniapp-001',
  name: 'Zemen Demo Store',
  url: 'https://demo-store.zemenbank.et',
  logoUrl: 'https://cdn-icons-png.flaticon.com/512/869/869636.png',
  status: 'Active',
  themeColor: '#D10000',
  rank: 0,
  categoryId: 'cat-food-002',
  categoryName: 'Food & Dining',
  uniqueName: 'demo-store',
  description: 'Official public sandbox testing merchant for Zemen Mini-App developers (No login required)',
  encryptionKey: 'DEMO_SANDBOX_KEY_zemen_2026',
  holdingAccount: '1000999999',
  requiresCamera: false,
  requiresLocation: false,
  requiresFileAccess: false,
  createdAt: '2026-11-18T00:00:00Z',
  updatedAt: '2026-11-18T00:00:00Z',
};

type TabKey = 'overview' | 'sandbox' | 'playground' | 'docs' | 'webhooks';

const NAV_TABS = [
  { key: 'overview'   as TabKey, label: 'Overview',           icon: BookOpen, desc: 'Integration architecture and onboarding guide' },
  { key: 'sandbox'    as TabKey, label: 'API Sandbox',        icon: Terminal, desc: 'Interactive endpoint tester with live HMAC verification' },
  { key: 'playground' as TabKey, label: 'HMAC Playground',   icon: Code2,    desc: 'HMAC-SHA256 signature generator and code snippets' },
  { key: 'docs'       as TabKey, label: 'Endpoint Reference', icon: Layers,   desc: 'Complete docs for /Validate, /Payment, and error codes' },
  { key: 'webhooks'   as TabKey, label: 'Super App Callbacks',icon: Send,     desc: 'Async payment callback schema and failure codes' },
];

export default function DeveloperPortalPage() {
  const [app, setApp] = useState<MiniAppAdmin>(DEMO_APP);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { dark, setDark } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true) }, []);

  const loadApp = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await AdminApiService.getMiniApps();
      const list = res.data || [];
      const demo = list.find((a) => a.id === 'demo-miniapp-001' || a.uniqueName === 'demo-store') || DEMO_APP;
      setApp(demo);
    } catch {
      setApp(DEMO_APP);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadApp(); }, [loadApp]);

  const activeTabInfo = NAV_TABS.find((t) => t.key === activeTab);

  return (
    <div className="h-[100dvh] overflow-hidden bg-[var(--bg)] text-[var(--text)] flex flex-col">

      {/* Top bar */}
      <header className="shrink-0 sticky top-0 z-40 bg-[var(--surface)]/95 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Link href="/"
              className="flex items-center gap-2 text-[13px] font-medium text-[var(--text-3)] hover:text-[var(--red)] transition-colors shrink-0">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <div className="hidden sm:block w-px h-5 bg-[var(--border)]" />
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--red)] to-[var(--red-dark)] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-[15px] truncate f-display">API Reference</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--red)]/10 text-[var(--red)] border border-[var(--red)]/20 shrink-0">
                v2
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link href="/login"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[var(--red)] text-white rounded-md text-xs font-semibold hover:bg-[var(--red-hover)] transition-colors">
              Login
            </Link>
            <button type="button" onClick={() => setDark(!dark)} aria-label="Toggle theme"
              className="w-8 h-8 flex items-center justify-center rounded-md text-[var(--text-3)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors">
              {!mounted ? <span className="w-4 h-4" /> : dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button className="lg:hidden w-8 h-8 flex items-center justify-center rounded-md hover:bg-[var(--surface-2)]"
              onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle navigation">
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'block' : 'hidden'} lg:block fixed lg:static inset-0 top-14 lg:top-auto z-30 lg:z-auto bg-[var(--bg)] lg:bg-transparent w-full lg:w-56 shrink-0 lg:border-r lg:border-[var(--border)] lg:pr-6 px-4 lg:px-0 py-6 lg:py-8 overflow-y-auto`}>
          <nav className="flex flex-col gap-1">
            {NAV_TABS.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => { setActiveTab(tab.key); setSidebarOpen(false); }}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors text-left w-full ${
                    active
                      ? 'bg-[var(--red)]/10 text-[var(--red)] border-l-2 border-[var(--red)]'
                      : 'text-[var(--text-3)] hover:text-[var(--text)] hover:bg-[var(--surface)] border-l-2 border-transparent'
                  }`}
                >
                  <tab.icon className="w-4 h-4 shrink-0" />
                  {tab.label}
                </button>
              );
            })}

            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[var(--text-4)] mb-2">Account</p>
              <Link href="/login" onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-[var(--text-3)] hover:text-[var(--text)] hover:bg-[var(--surface)] border-l-2 border-transparent transition-colors">
                <ShieldCheck className="w-4 h-4 shrink-0" /> Partner Login
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-y-auto py-8 lg:pl-8">
          {/* Page header */}
          <div className="mb-6">
            <h1 className="f-display text-2xl font-bold text-[var(--text)]">{activeTabInfo?.label}</h1>
            <p className="text-sm text-[var(--text-3)] mt-1">{activeTabInfo?.desc}</p>
          </div>

          {/* Backend error banner */}
          {error && (
            <div className="p-4 mb-6 bg-[var(--status-failed-bg)] border border-[var(--status-failed-color)]/30 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[var(--status-failed-color)] shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-bold text-[var(--status-failed-color)]">Backend Connection</h4>
                <p className="text-xs text-[var(--status-failed-color)] mt-0.5 opacity-80">{error} — using demo data</p>
                <button onClick={loadApp} className="mt-2 text-xs font-bold text-[var(--status-failed-color)] underline inline-flex items-center gap-1 cursor-pointer">
                  <RefreshCw className="w-3.5 h-3.5" /> Retry
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-3 text-[var(--text-3)]">
                <RefreshCw className="w-8 h-8 animate-spin text-[var(--red)]" />
                <span className="text-sm">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="animate-in">
              {activeTab === 'overview' && (
                <OverviewTab app={app} onNavigateTab={(k) => setActiveTab(k as TabKey)} />
              )}
              {activeTab === 'sandbox' && (
                <ApiSandbox
                  app={app}
                  onRequestGoLive={() => { window.location.href = '/login'; }}
                  onGoToTransactions={() => { window.location.href = '/login'; }}
                />
              )}
              {activeTab === 'playground' && (
                <SignaturePlayground
                  secretKey={app.encryptionKey}
                  appId={app.id}
                  appName={app.name}
                />
              )}
              {activeTab === 'docs' && (
                <EndpointsReferenceTab app={app} onTryEndpoint={() => setActiveTab('sandbox')} />
              )}
              {activeTab === 'webhooks' && (
                <WebhooksTab app={app} />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/* ── Endpoints Reference (inline, public-safe) ── */
function EndpointsReferenceTab({ app, onTryEndpoint }: { app: MiniAppAdmin; onTryEndpoint: () => void }) {
  const BASE = 'http://localhost:5164';

  const endpoints = [
    {
      method: 'GET', path: '/Test/GenerateSampleUserToken', color: 'bg-amber-600',
      title: '1. Generate Sample Customer Token',
      desc: 'Generates a mock Super App user session JWT for sandbox testing without needing a real mobile device.',
      params: '?phone=0911223344&cif=CIF0012345&fullName=Abebe+Kebede',
      body: null,
      response: JSON.stringify({ message: 'Use this token in /Validate or /Payment', token: 'eyJhbGciOiJIUzI1NiIs...', cif: 'CIF0012345', phone: '0911223344' }, null, 2),
    },
    {
      method: 'GET', path: '/Validate', color: 'bg-blue-600',
      title: '2. Validate Customer Launch Token',
      desc: 'Called by your backend when the customer launches your mini-app. Validates the JWT launch token and returns customer identity.',
      params: '?token={customerLaunchToken}  or  Authorization: Bearer {token}',
      body: null,
      response: JSON.stringify({ valid: true, phone: '0911223344', fullName: 'Abebe Kebede', cif: 'CIF0012345' }, null, 2),
    },
    {
      method: 'GET', path: '/Test/GetSamplePaymentRequest', color: 'bg-purple-600',
      title: '3. Pre-Signed Sample Payload',
      desc: 'Generates a ready-to-test PaymentRequestModel payload with a verified HMAC signature computed by the backend for your mini-app.',
      params: `?companyName=${encodeURIComponent(app.name || 'Ride Ethiopia')}&amount=150.00`,
      body: null,
      response: JSON.stringify({ message: 'Copy this payload and POST to /Payment', payload: { companyName: app.name || 'Ride Ethiopia', amount: '150.00', accountNo: '1000123456', callBackURL: 'https://ride.et/callback', transactionId: 'TXN-1715000001', transactionTime: '1715000000', token: 'eyJh...', signature: 'a8f3b0c51d9e4a7b8c...' } }, null, 2),
    },
    {
      method: 'POST', path: '/Payment', color: 'bg-emerald-600',
      title: '4. Initiate Signed Payment Order',
      desc: 'Called by your backend when customer checks out. Requires HMAC-SHA256 signature. Returns paymentToken to pass to the Super App bridge.',
      params: 'Content-Type: application/json',
      body: JSON.stringify({ companyName: app.name, amount: '150.00', accountNo: '1000123456', callBackURL: 'https://yourapp.et/callback', transactionId: 'TXN-20261116123456', transactionTime: '2026-11-16T18:00:00Z', token: '<customer-launch-jwt>', signature: '<hmac-sha256-hex>' }, null, 2),
      response: JSON.stringify({ token: 'eyJhbGciOiJIUzI1NiJ9...', code: '0', message: 'Token Generated Successfully.' }, null, 2),
    },
  ];

  const errorCodes = [
    { code: '2001 / 400', meaning: 'Missing required field',   action: 'Check transactionId, amount, companyName, accountNo, signature' },
    { code: '2002 / 400', meaning: 'Invalid amount',           action: 'Amount must be a positive decimal number greater than 0' },
    { code: '2003 / 401', meaning: 'Invalid signature',        action: 'Signature mismatch. In dev mode check debugHint.expectedSignature' },
    { code: '2006 / 400', meaning: 'Duplicate transactionId',  action: 'Generate a new unique transactionId per payment attempt' },
    { code: '2007 / 400', meaning: 'Expired transactionTime',  action: 'Timestamp is older than 5 minutes. Send current UTC time' },
    { code: '401',         meaning: 'Missing or consumed token', action: 'Launch token is single-use or expired. Re-generate' },
  ];

  return (
    <div className="space-y-6">
      <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-2xl text-xs text-[var(--text-2)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <strong>Base URL:</strong>{' '}
          <code className="f-mono bg-[var(--surface-2)] px-2 py-0.5 rounded border border-[var(--border)] font-bold">{BASE}</code>
          <p className="text-[11px] text-[var(--text-3)] mt-0.5">All endpoints live. Test each one in the Interactive API Sandbox.</p>
        </div>
        <button type="button" onClick={onTryEndpoint}
          className="px-4 py-2 bg-[var(--red)] hover:bg-[var(--red-hover)] text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors">
          <Terminal className="w-3.5 h-3.5" /> Open API Sandbox
        </button>
      </div>

      <div className="space-y-5">
        {endpoints.map((ep) => (
          <div key={ep.path} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border)] bg-[var(--surface-2)] flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-start gap-3">
                <span className={`${ep.color} text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg shrink-0 f-mono`}>{ep.method}</span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="f-mono text-sm font-bold text-[var(--text)]">{ep.path}</code>
                    <span className="text-xs font-semibold text-[var(--text-2)]">— {ep.title}</span>
                  </div>
                  <p className="text-xs text-[var(--text-3)] mt-1">{ep.desc}</p>
                </div>
              </div>
              <button type="button" onClick={onTryEndpoint}
                className="px-3 py-1.5 bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] rounded-xl font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors shrink-0">
                <Terminal className="w-3 h-3 text-[var(--red)]" /> Try in Sandbox
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border)]">
              <div className="p-4 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)]">Parameters & Headers</p>
                <div className="text-xs f-mono text-[var(--text-2)] bg-[var(--surface-2)] rounded-xl p-2.5 border border-[var(--border)]">{ep.params}</div>
                {ep.body && (
                  <>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)] pt-1">JSON Request Body</p>
                    <pre className="text-xs f-mono text-[var(--text-2)] bg-[var(--surface-2)] rounded-xl p-3 overflow-x-auto leading-relaxed border border-[var(--border)]">{ep.body}</pre>
                  </>
                )}
              </div>
              <div className="p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)] mb-2">Sample Response (200 OK)</p>
                <pre className="text-xs f-mono text-[var(--status-success-color)] bg-[var(--status-success-bg)] rounded-xl p-3 overflow-x-auto leading-relaxed border border-[var(--status-success-color)]/20">{ep.response}</pre>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--border)] bg-[var(--surface-2)]">
          <h3 className="text-sm font-bold text-[var(--text)]">Error Codes & Troubleshooting</h3>
        </div>
        <div className="p-5 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] text-[11px] uppercase tracking-wider text-[var(--text-3)]">
                <th className="pb-2 text-left">Code</th>
                <th className="pb-2 text-left">Meaning</th>
                <th className="pb-2 text-left">Resolution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] font-medium">
              {errorCodes.map(({ code, meaning, action }) => (
                <tr key={code}>
                  <td className="py-2.5 pr-4">
                    <code className="bg-[var(--status-failed-bg)] text-[var(--status-failed-color)] font-bold px-2 py-0.5 rounded f-mono">{code}</code>
                  </td>
                  <td className="py-2.5 pr-4 font-semibold text-[var(--text)]">{meaning}</td>
                  <td className="py-2.5 text-[var(--text-3)]">{action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
