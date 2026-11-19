'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Building2,
  Globe,
  Lock,
  ArrowRight,
  RefreshCw,
  Send,
  FileCheck,
  Eye,
  EyeOff,
  Copy,
  Check,
  ExternalLink,
  Tag,
  Key,
  Smartphone,
  Layers,
  MapPin,
  Camera,
  FolderOpen,
} from 'lucide-react';
import { MiniAppAdmin, MiniAppStatus } from '@/types/miniapp';
import { AdminApiService } from '@/services/api';

interface GoLiveTabProps {
  app: MiniAppAdmin;
  onRefreshApp: () => Promise<void>;
  onNavigateTab: (tab: string) => void;
}

export const GoLiveTab: React.FC<GoLiveTabProps> = ({ app, onRefreshApp, onNavigateTab }) => {
  const [submitting, setSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRequestGoLive = async () => {
    try {
      setSubmitting(true);
      setResultMsg(null);
      const res = await AdminApiService.requestGoLive(app.id);
      setResultMsg({
        type: 'success',
        text: res.message || 'Go-Live request submitted successfully! Bank administrators will review your mini-app.',
      });
      await onRefreshApp();
    } catch (err: any) {
      setResultMsg({
        type: 'error',
        text: err.message || 'Failed to submit go-live request. Make sure your app is in Sandbox or Rejected state.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: MiniAppStatus) => {
    switch (status) {
      case 'Active':
        return {
          pill: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-500',
          title: 'Live in Production',
          desc: 'Your mini-app is approved and active in the Zemen Super App for all mobile banking users.',
        };
      case 'PendingReview':
        return {
          pill: 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse',
          dot: 'bg-amber-500',
          title: 'Under Bank Compliance Review',
          desc: 'Your request is currently queued for Bank Admin review. Standard turnaround time is 1–3 business days.',
        };
      case 'Rejected':
        return {
          pill: 'bg-rose-100 text-rose-800 border-rose-300',
          dot: 'bg-rose-500',
          title: 'Review Returned with Remarks',
          desc: 'Bank administrators requested updates. Check the audit notes, resolve items, and resubmit.',
        };
      case 'Suspended':
        return {
          pill: 'bg-red-100 text-[var(--red)] border-red-300',
          dot: 'bg-[var(--red)]',
          title: 'Suspended (Kill-Switch Active)',
          desc: 'Your mini-app has been temporarily disabled. Please contact Zemen Bank Partner Support.',
        };
      case 'Sandbox':
      default:
        return {
          pill: 'bg-slate-100 text-slate-700 border-slate-300',
          dot: 'bg-slate-400',
          title: 'Sandbox Testing Environment',
          desc: 'Your application is currently in Sandbox mode. Complete the checklist below to request live certification.',
        };
    }
  };

  const statusConfig = getStatusBadge(app.status);

  // Stepper helper
  const getStepState = (stepIndex: number) => {
    // 0: Sandbox, 1: Request, 2: PendingReview, 3: Active
    if (app.status === 'Active') return 'completed';
    if (app.status === 'PendingReview') {
      if (stepIndex <= 2) return stepIndex === 2 ? 'current' : 'completed';
      return 'upcoming';
    }
    if (app.status === 'Sandbox' || app.status === 'Rejected') {
      if (stepIndex === 0) return 'completed';
      if (stepIndex === 1) return 'current';
      return 'upcoming';
    }
    return 'upcoming';
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header & Current Status */}
      <div className="border-b border-[var(--border)] pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--red)] uppercase tracking-wider mb-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Partner Governance</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl">
              {/* Profile &amp; Go-Live Approval */}
            </h1>
            <p className="mt-2 text-sm text-[var(--text-3)] max-w-3xl leading-relaxed">
              View your registered mini-app credentials, verify pre-flight integration requirements, and submit your application for Bank Production certification.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border ${statusConfig.pill}`}
            >
              <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
              Status: {app.status}
            </span>

            <button
              type="button"
              onClick={onRefreshApp}
              title="Refresh App Details"
              className="p-2 border border-[var(--border)] hover:bg-slate-100 rounded-xl text-slate-600 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Lifecycle Stepper */}
      <div className="bg-white border border-[var(--border)] rounded-2xl p-5 sm:p-6 shadow-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-4">
          Certification Lifecycle Progress
        </span>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {[
            {
              title: '1. Sandbox Development',
              desc: 'Integrate & test endpoints in sandbox',
              state: getStepState(0),
            },
            {
              title: '2. Request Go-Live',
              desc: 'Submit application for compliance audit',
              state: getStepState(1),
            },
            {
              title: '3. Compliance Review',
              desc: 'Bank review of accounts & security',
              state: getStepState(2),
            },
            {
              title: '4. Live in Production',
              desc: 'Active in Super App for real customers',
              state: getStepState(3),
            },
          ].map((s, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                s.state === 'completed'
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : s.state === 'current'
                  ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20 text-blue-950'
                  : 'bg-slate-50 border-slate-200 text-slate-600 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold">{s.title}</span>
                {s.state === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : s.state === 'current' ? (
                  <Clock className="w-4 h-4 text-blue-600 animate-pulse" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                )}
              </div>
              <p className="text-[11px] leading-relaxed opacity-80">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Mini-App Profile & Credentials (Partner Overview) */}
      <div className="bg-white border border-[var(--border)] rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[var(--border)]">
          <div>
            <h2 className="text-base font-bold text-[var(--text)] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[var(--red)]" />
              Registered Mini-App Profile
            </h2>
            <p className="text-xs text-[var(--text-3)] mt-0.5">
              Configuration and cryptographic secrets assigned to this partner application by Zemen Bank.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
            {app.categoryName || 'General Service'}
          </span>
        </div>

        {/* Profile Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. App Identity */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Application Name &amp; Slug
            </span>
            <div className="text-sm font-bold text-slate-900">{app.name}</div>
            <div className="text-xs text-slate-600 font-mono">
              Slug: <strong className="text-slate-800">{app.uniqueName || 'n/a'}</strong>
            </div>
            {app.description && (
              <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 leading-snug">
                {app.description}
              </p>
            )}
          </div>

          {/* 2. Application ID */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Application ID
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(app.id, 'appId')}
                className="text-[11px] font-bold text-blue-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                {copiedField === 'appId' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedField === 'appId' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <code className="text-xs font-mono font-bold text-slate-900 block truncate select-all bg-white p-1.5 rounded border border-slate-200">
              {app.id}
            </code>
            <p className="text-[11px] text-slate-500">
              Unique database identifier required for API route parameters.
            </p>
          </div>

          {/* 3. Settlement / Holding Account */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Settlement Holding Account
              </span>
              <Building2 className="w-4 h-4 text-emerald-600" />
            </div>
            <code className="text-xs font-mono font-bold text-emerald-800 block select-all bg-white p-1.5 rounded border border-slate-200">
              {app.holdingAccount || 'Not Configured'}
            </code>
            <p className="text-[11px] text-slate-500">
              Core Banking (FlexCube) account where all customer payments are credited.
            </p>
          </div>

          {/* 4. HMAC Secret EncryptionKey */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 lg:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[var(--red)]" />
                Partner Secret Key (HMAC-SHA256)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer"
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showKey ? 'Hide' : 'Reveal'}
                </button>

                <button
                  type="button"
                  onClick={() => copyToClipboard(app.encryptionKey, 'encKey')}
                  className="text-[11px] font-bold text-blue-600 hover:underline inline-flex items-center gap-1 cursor-pointer ml-1"
                >
                  {copiedField === 'encKey' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedField === 'encKey' ? 'Copied' : 'Copy Key'}
                </button>
              </div>
            </div>

            <code className="text-xs font-mono font-bold text-slate-800 block select-all bg-white p-2 rounded border border-slate-200 break-all">
              {showKey
                ? app.encryptionKey
                : app.encryptionKey
                ? app.encryptionKey.substring(0, 8) + '••••••••••••••••••••••••••••••••'
                : '••••••••••••••••'}
            </code>
            <p className="text-[11px] text-amber-800 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Keep confidential on your server. Used exclusively for signing <code className="text-slate-800 font-bold">POST /Payment</code> requests.</span>
            </p>
          </div>

          {/* 5. Production URL */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Hosted Entry URL
              </span>
              <Globe className="w-4 h-4 text-blue-600" />
            </div>
            <a
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-blue-600 hover:underline block truncate"
            >
              {app.url}
            </a>
            <p className="text-[11px] text-slate-500">
              The HTTPS web application loaded by the Super App WebView.
            </p>
          </div>
        </div>

        {/* Permissions Badges */}
        <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center gap-4 text-xs text-slate-600">
          <span className="text-[10px] font-bold uppercase text-slate-400">Granted App Permissions:</span>
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-medium ${app.requiresCamera ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-400'}`}>
            <Camera className="w-3 h-3" /> Camera
          </span>
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-medium ${app.requiresLocation ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-400'}`}>
            <MapPin className="w-3 h-3" /> Geolocation
          </span>
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-medium ${app.requiresFileAccess ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-400'}`}>
            <FolderOpen className="w-3 h-3" /> Storage / File Access
          </span>
        </div>
      </div>

      {/* 4. Pre-Submission Audit Checklist */}
      <div className="bg-white border border-[var(--border)] rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-emerald-600" />
          Pre-Go-Live Verification Checklist
        </h3>
        <p className="text-xs text-[var(--text-3)]">
          Ensure each integration step has been verified in the sandbox before requesting bank compliance review:
        </p>

        <div className="space-y-3 pt-1">
          {/* Item 1: Settlement Account */}
          <div className="p-3.5 bg-slate-50 border border-[var(--border)] rounded-xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-slate-800">Settlement Holding Account Assigned:</span>
                <code className="ml-2 font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {app.holdingAccount || 'Missing'}
                </code>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-700">Verified</span>
          </div>

          {/* Item 2: Web URL */}
          <div className="p-3.5 bg-slate-50 border border-[var(--border)] rounded-xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-slate-800">Hosted Mini-App Production URL:</span>
                <span className="ml-2 font-mono text-blue-600 truncate">{app.url}</span>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-700">Verified</span>
          </div>

          {/* Item 3: Token Validation (Updated name) */}
          <div className="p-3.5 bg-slate-50 border border-[var(--border)] rounded-xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-slate-800">Token Validation Tested:</span>
                <span className="ml-2 text-slate-500">GET /Validate endpoint verified in API Sandbox</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('sandbox')}
              className="text-[11px] font-bold text-[var(--red)] hover:underline cursor-pointer"
            >
              Test in Sandbox →
            </button>
          </div>

          {/* Item 4: Payment HMAC Tested */}
          <div className="p-3.5 bg-slate-50 border border-[var(--border)] rounded-xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-slate-800">Signed Payment Tested:</span>
                <span className="ml-2 text-slate-500">POST /Payment HMAC-SHA256 verified in API Sandbox</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('sandbox')}
              className="text-[11px] font-bold text-[var(--red)] hover:underline cursor-pointer"
            >
              Test in Sandbox →
            </button>
          </div>

          {/* Item 5: Bridge Verified */}
          <div className="p-3.5 bg-slate-50 border border-[var(--border)] rounded-xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-slate-800">Client Bridge Verified:</span>
                <span className="ml-2 text-slate-500">
                  <code>window.ZemenPay.requestPayment(paymentToken)</code> tested with Sandbox APK / API
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('sandbox')}
              className="text-[11px] font-bold text-[var(--red)] hover:underline cursor-pointer"
            >
              Test in Sandbox →
            </button>
          </div>
        </div>
      </div>

      {/* 5. Submission Action Box */}
      <div className="bg-white border border-[var(--border)] rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[var(--text)]">Submit for Bank Go-Live Approval</h3>

        {resultMsg && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              resultMsg.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {resultMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{resultMsg.text}</span>
          </div>
        )}

        {app.status === 'Sandbox' || app.status === 'Rejected' ? (
          <div className="space-y-4">
            <p className="text-xs text-[var(--text-3)] leading-relaxed">
              When you submit your application, your app status changes to <strong>PendingReview</strong>. Bank
              administrators will see it in the Bank Admin Console, verify your settlement account, test your integration,
              and certify your mini-app for real customers.
            </p>

            <button
              type="button"
              onClick={handleRequestGoLive}
              disabled={submitting}
              className="px-6 py-3 bg-[var(--red)] hover:bg-[var(--red-hover)] text-white font-extrabold rounded-xl text-xs shadow-xs inline-flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {submitting ? 'Submitting to Bank...' : 'Submit for Bank Approval (Request Go-Live)'}
            </button>
          </div>
        ) : app.status === 'PendingReview' ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs text-amber-900">
            <div className="flex items-center gap-2 font-bold">
              <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
              Application Submitted &amp; Pending Bank Approval
            </div>
            <p className="leading-relaxed">
              Your mini-app was submitted for review. Bank staff in compliance and operations will review your
              settlement account and test your integration. You will receive notification when approved.
            </p>
          </div>
        ) : app.status === 'Active' ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs text-emerald-900">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Mini-App is Live in Zemen Super App
            </div>
            <p className="leading-relaxed">
              Your application is approved and live in production. Customer payments are actively settling into your
              holding account.
            </p>
          </div>
        ) : (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900">
            This mini-app is currently {app.status}. Please contact Zemen Bank support.
          </div>
        )}
      </div>
    </div>
  );
};
