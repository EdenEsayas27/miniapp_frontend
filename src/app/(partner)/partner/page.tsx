'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck, Clock, Key, Globe, Receipt, Rocket,
  RefreshCw, CheckCircle2, AlertTriangle, ArrowRight,
  ExternalLink, Copy, Check, Eye, EyeOff, Terminal
} from 'lucide-react';
import { AdminApiService } from '@/services/api';
import { MiniAppAdmin, MiniAppTransaction } from '@/types/miniapp';
import { useAuthStore } from '@/store/authStore';
import { DEMO_APP } from '@/app/developer/page';

export default function PartnerOverviewPage() {
  const { user } = useAuthStore();
  const [app, setApp] = useState<MiniAppAdmin | null>(null);
  const [recentTxns, setRecentTxns] = useState<MiniAppTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await AdminApiService.getMiniApps();
      const list = res.data || [];

      // Find partner's specific mini-app
      let matched = list.find((a) => a.id === user?.miniAppId);
      if (!matched && user?.miniAppName) {
        matched = list.find((a) => a.name.toLowerCase().includes(user.miniAppName!.toLowerCase()));
      }
      if (!matched) {
        matched = list.find((a) => a.id !== 'demo-miniapp-001') || DEMO_APP;
      }

      setApp(matched);

      // Load recent transactions for this mini-app
      if (matched) {
        try {
          const txRes = await AdminApiService.getTransactions({ miniAppId: matched.id, pageSize: 5, page: 1 });
          setRecentTxns(txRes.data || []);
        } catch {
          // transactions optional
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load mini-app details');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCopyKey = () => {
    if (!app?.encryptionKey) return;
    navigator.clipboard.writeText(app.encryptionKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3 text-[var(--text-3)]">
          <RefreshCw className="w-8 h-8 animate-spin text-[var(--red)]" />
          <span className="text-sm">Loading your Mini-App profile...</span>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="p-8 text-center bg-[var(--surface)] border border-[var(--border)] rounded-3xl">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-[var(--text)]">No Mini-App Linked</h2>
        <p className="text-sm text-[var(--text-3)] mt-1">Please contact Zemen Bank administration to assign your partner mini-app.</p>
      </div>
    );
  }

  const isLive = app.status === 'Active';
  const isPending = app.status === 'PendingReview';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner with App Summary */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[var(--bg)] border border-[var(--border)] p-2 flex items-center justify-center shrink-0 overflow-hidden">
              {app.logoUrl ? (
                <img src={app.logoUrl} alt={app.name} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full rounded-xl bg-[var(--red)]/10 text-[var(--red)] font-bold text-xl flex items-center justify-center">
                  {app.name.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold text-[var(--text)] f-display">{app.name}</h1>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 ${
                  isLive
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : isPending
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-500' : isPending ? 'bg-amber-500' : 'bg-slate-400'}`} />
                  {app.status}
                </span>
              </div>
              <p className="text-xs text-[var(--text-3)] mt-1 max-w-xl">{app.description || 'Registered Zemen Super App Partner Mini-Application'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href="/partner/sandbox"
              className="px-4 py-2.5 bg-[var(--red)] hover:bg-[var(--red-hover)] text-white font-semibold rounded-xl text-xs inline-flex items-center gap-2 transition-all shadow-sm"
            >
              <Terminal className="w-4 h-4" /> Test in Sandbox
            </Link>
            <Link
              href="/partner/golive"
              className="px-4 py-2.5 bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--border-strong)] font-semibold rounded-xl text-xs inline-flex items-center gap-2 transition-all"
            >
              <Rocket className="w-4 h-4" /> Go-Live Settings
            </Link>
            <Link
              href="/developer"
              target="_blank"
              className="px-4 py-2.5 bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--border-strong)] font-semibold rounded-xl text-xs inline-flex items-center gap-2 transition-all"
            >
              <ExternalLink className="w-4 h-4" /> Public Docs
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
          <div className="flex items-center justify-between text-[var(--text-3)] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Mini-App ID</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-sm font-bold font-mono text-[var(--text)] truncate">{app.id}</p>
          <p className="text-[11px] text-[var(--text-3)] mt-1">Unique ecosystem identifier</p>
        </div>

        <div className="p-5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
          <div className="flex items-center justify-between text-[var(--text-3)] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Category</span>
            <Globe className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-sm font-bold text-[var(--text)]">{app.categoryName || 'General'}</p>
          <p className="text-[11px] text-[var(--text-3)] mt-1">Listing channel in Super App</p>
        </div>

        <div className="p-5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
          <div className="flex items-center justify-between text-[var(--text-3)] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Holding Account</span>
            <Receipt className="w-4 h-4 text-[var(--red)]" />
          </div>
          <p className="text-sm font-bold font-mono text-[var(--text)]">{app.holdingAccount || 'Not configured'}</p>
          <p className="text-[11px] text-[var(--text-3)] mt-1">Direct settlement account</p>
        </div>

        <div className="p-5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
          <div className="flex items-center justify-between text-[var(--text-3)] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Webview Domain</span>
            <ExternalLink className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-sm font-bold text-[var(--text)] truncate">{app.url || 'None'}</p>
          <p className="text-[11px] text-[var(--text-3)] mt-1">Whitelisted application URL</p>
        </div>
      </div>

      {/* Credentials & Security Card */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--red)]/10 text-[var(--red)] flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[var(--text)]">Merchant Security Credentials</h3>
              <p className="text-xs text-[var(--text-3)]">Private HMAC signing key for your server-to-server API calls</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            CONFIDENTIAL
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-3)] mb-1.5">
              Secret Encryption Key (HMAC-SHA256)
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-2.5 font-mono text-xs text-[var(--text)] flex items-center justify-between">
                <span>{showKey ? app.encryptionKey : '••••••••••••••••••••••••••••••••••••••••'}</span>
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="text-[var(--text-3)] hover:text-[var(--text)] transition-colors ml-2"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                type="button"
                onClick={handleCopyKey}
                className="px-4 py-2.5 bg-[var(--surface-2)] hover:bg-[var(--border)] border border-[var(--border)] rounded-xl text-xs font-semibold text-[var(--text)] transition-colors inline-flex items-center gap-1.5 shrink-0"
              >
                {copiedKey ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {copiedKey ? 'Copied' : 'Copy Key'}
              </button>
            </div>
            <p className="text-[11px] text-[var(--text-3)] mt-1.5">
              Never share this key in client-side code. Use it strictly in your backend to sign <code className="font-mono text-[10px]">POST /Payment</code> requests.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Transactions Preview */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm text-[var(--text)]">Recent Settlements</h3>
            <p className="text-xs text-[var(--text-3)]">Live transactions processed through this mini-app</p>
          </div>
          <Link
            href="/partner/transactions"
            className="text-xs font-semibold text-[var(--red)] hover:underline inline-flex items-center gap-1"
          >
            View All Transactions <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentTxns.length === 0 ? (
          <div className="py-8 text-center text-xs text-[var(--text-3)] border border-dashed border-[var(--border)] rounded-2xl">
            No recent transactions found for this mini-app. Test transactions in the <Link href="/developer" className="text-[var(--red)] font-semibold hover:underline">API Sandbox</Link>.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] text-[11px] uppercase tracking-wider text-[var(--text-3)]">
                  <th className="pb-2 text-left">Transaction ID</th>
                  <th className="pb-2 text-left">Amount</th>
                  <th className="pb-2 text-left">Phone</th>
                  <th className="pb-2 text-left">Status</th>
                  <th className="pb-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] font-medium">
                {recentTxns.map((t) => (
                  <tr key={t.id || t.transactionId}>
                    <td className="py-3 font-mono text-[var(--text)]">{t.transactionId || t.id}</td>
                    <td className="py-3 font-bold font-mono text-[var(--text)]">{t.amount?.toFixed(2)} ETB</td>
                    <td className="py-3 text-[var(--text-2)]">{t.phoneNumber || '—'}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.status === 1 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {t.status === 1 ? 'SUCCESS' : 'FAILED'}
                      </span>
                    </td>
                    <td className="py-3 text-[var(--text-3)]">{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
