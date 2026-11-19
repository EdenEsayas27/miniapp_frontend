'use client';

import React, { useState } from 'react';
import {
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  Building2,
  Globe,
  Tag,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import { MiniAppAdmin } from '@/types/miniapp';

interface CredentialsCardProps {
  app: MiniAppAdmin;
  onRequestGoLive: () => Promise<void>;
}

export const CredentialsCard: React.FC<CredentialsCardProps> = ({ app, onRequestGoLive }) => {
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [goLiveError, setGoLiveError] = useState<string | null>(null);

  const copyToClipboard = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const getStatusDisplay = () => {
    switch (app.status) {
      case 'Active':
        return {
          label: 'LIVE',
          color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-500',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          desc: 'Your mini-app is live and visible in the Zemen Super App.',
        };
      case 'PendingReview':
        return {
          label: 'PENDING REVIEW',
          color: 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse',
          dot: 'bg-amber-500',
          icon: <Clock className="w-3.5 h-3.5" />,
          desc: 'The bank is reviewing your go-live request. This usually takes 1–3 business days.',
        };
      case 'Rejected':
        return {
          label: 'REJECTED',
          color: 'bg-rose-100 text-rose-800 border-rose-300',
          dot: 'bg-rose-500',
          icon: <XCircle className="w-3.5 h-3.5" />,
          desc: 'Your go-live request was rejected. Please review the feedback and re-apply.',
        };
      case 'Suspended':
        return {
          label: 'SUSPENDED',
          color: 'bg-red-100 text-[var(--red)] border-red-300',
          dot: 'bg-[var(--red)]',
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
          desc: 'Your mini-app has been suspended by the bank. Contact support.',
        };
      case 'Sandbox':
      default:
        return {
          label: 'SANDBOX',
          color: 'bg-slate-100 text-slate-700 border-slate-300',
          dot: 'bg-slate-400',
          icon: <ShieldCheck className="w-3.5 h-3.5" />,
          desc: 'You are in sandbox/dev mode. Test your integration, then request go-live.',
        };
    }
  };

  const status = getStatusDisplay();

  const handleGoLive = async () => {
    try {
      setRequesting(true);
      setGoLiveError(null);
      await onRequestGoLive();
    } catch (err: any) {
      setGoLiveError(err.message || 'Failed to submit go-live request.');
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* App Identity Card */}
      <div className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden shadow-xs">
        {/* Coloured banner header */}
        <div
          className="h-20 flex items-end px-6 pb-0 relative"
          style={{
            background: `linear-gradient(135deg, ${app.themeColor || '#d10000'}dd, ${app.themeColor || '#d10000'}88)`,
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl border-4 border-white shadow-md flex items-center justify-center font-bold text-white text-2xl translate-y-7 shrink-0"
            style={{ backgroundColor: app.themeColor || '#d10000' }}
          >
            {(app.name || 'M').charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="pt-10 px-6 pb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-xl font-extrabold text-[var(--text)] mt-1">{app.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${status.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                  {status.icon}
                  {status.label}
                </span>
                <span className="text-xs text-[var(--text-3)]">{app.uniqueName || 'No slug'}</span>
              </div>
              <p className="text-xs text-[var(--text-3)] mt-2 leading-relaxed max-w-md">{status.desc}</p>
            </div>

            {/* Go-Live CTA */}
            {(app.status === 'Sandbox' || app.status === 'Rejected') && (
              <div className="flex flex-col items-end gap-2">
                <button
                  type="button"
                  onClick={handleGoLive}
                  disabled={requesting}
                  className="px-5 py-2.5 bg-[var(--red)] hover:bg-[var(--red-hover)] text-white rounded-xl font-bold text-sm shadow-sm inline-flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-60"
                >
                  {requesting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  {requesting ? 'Submitting...' : 'Request Go-Live'}
                </button>
                <p className="text-[11px] text-[var(--text-3)] text-right max-w-[180px]">
                  Submits your app for bank compliance review
                </p>
              </div>
            )}
          </div>

          {goLiveError && (
            <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              {goLiveError}
            </div>
          )}
        </div>
      </div>

      {/* Credentials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* App ID */}
        <div className="bg-white border border-[var(--border)] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
              <Tag className="w-3.5 h-3.5 text-slate-600" />
            </div>
            <span className="text-xs font-bold text-[var(--text-3)] uppercase tracking-wider">Application ID</span>
          </div>
          <div className="flex items-center justify-between gap-2 bg-slate-50 border border-[var(--border)] rounded-xl px-3.5 py-2.5">
            <code className="font-mono text-sm font-bold text-[var(--text)] truncate">{app.id}</code>
            <button
              type="button"
              onClick={() => copyToClipboard(app.id, setCopiedId)}
              className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Copy App ID"
            >
              {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            </button>
          </div>
          <p className="text-[11px] text-[var(--text-3)] mt-2">
            Include this as the <code className="bg-slate-100 px-1 rounded">X-App-ID</code> header in every API request.
          </p>
        </div>

        {/* Settlement Account */}
        <div className="bg-white border border-[var(--border)] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5 text-emerald-700" />
            </div>
            <span className="text-xs font-bold text-[var(--text-3)] uppercase tracking-wider">Settlement Account</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5">
            <code className="font-mono text-sm font-bold text-emerald-900">{app.holdingAccount || 'Not assigned'}</code>
          </div>
          <p className="text-[11px] text-[var(--text-3)] mt-2">
            All customer payments automatically settle into this Zemen Bank account.
          </p>
        </div>

        {/* App URL */}
        <div className="bg-white border border-[var(--border)] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <span className="text-xs font-bold text-[var(--text-3)] uppercase tracking-wider">Hosted App URL</span>
          </div>
          <div className="bg-slate-50 border border-[var(--border)] rounded-xl px-3.5 py-2.5">
            <a
              href={app.url}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-sm text-blue-600 hover:underline truncate block"
            >
              {app.url}
            </a>
          </div>
          <p className="text-[11px] text-[var(--text-3)] mt-2">
            This URL is loaded inside the Super App WebView for your mini-app.
          </p>
        </div>

        {/* HMAC Secret Key */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Key className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">HMAC Secret Key</span>
            </div>
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="text-[11px] text-slate-400 hover:text-white inline-flex items-center gap-1 cursor-pointer"
            >
              {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {showKey ? 'Hide' : 'Reveal'}
            </button>
          </div>
          <div className="flex items-center justify-between gap-2 bg-black/40 border border-slate-700 rounded-xl px-3.5 py-2.5">
            <code className="font-mono text-sm text-amber-300 truncate">
              {showKey ? app.encryptionKey : '•'.repeat(32)}
            </code>
            <button
              type="button"
              onClick={() => copyToClipboard(app.encryptionKey, setCopiedKey)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold rounded-lg inline-flex items-center gap-1 cursor-pointer shrink-0"
              title="Copy Secret Key"
            >
              {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedKey ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Never share this key publicly. Use it server-side to sign payment requests with HMAC-SHA256.
          </p>
        </div>
      </div>
    </div>
  );
};
