'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Key,
  Globe,
  Camera,
  MapPin,
  HardDrive,
  Calendar,
  CheckCircle2,
  XCircle,
  Edit,
  Copy,
  Check,
  Eye,
  EyeOff,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { MiniAppAdmin, MiniAppStatus } from '@/types/miniapp';
import { AdminApiService } from '@/services/api';

interface DetailModalProps {
  app: MiniAppAdmin | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (app: MiniAppAdmin) => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason?: string) => void;
  onKillSwitch: (app: MiniAppAdmin) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  app,
  isOpen,
  onClose,
  onEdit,
  onApprove,
  onReject,
  onKillSwitch,
}) => {
  const [detail, setDetail] = useState<MiniAppAdmin | null>(app);
  const [loading, setLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (isOpen && app) {
      setDetail(app);
      setRejecting(false);
      setRejectReason('');
      setShowKey(false);
      setLoading(true);

      // Fetch fresh detail from API
      AdminApiService.getMiniAppById(app.id)
        .then((fresh) => {
          if (fresh && fresh.id) {
            setDetail(fresh);
          }
        })
        .catch(() => {
          // Fall back to passed app if network fails
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, app]);

  if (!isOpen || !detail) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const getStatusBadge = (status: MiniAppStatus) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Active (Live in Super App)
          </span>
        );
      case 'PendingReview':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-300 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Pending Go-Live Review
          </span>
        );
      case 'Suspended':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--red-pale)] text-[var(--red)] border border-red-200">
            <span className="w-2 h-2 rounded-full bg-[var(--red)]" />
            Suspended (Kill-Switched)
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            Rejected
          </span>
        );
      case 'Sandbox':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            Sandbox (Dev Testing)
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-[var(--border)] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[var(--border)] bg-[var(--surface-2)] flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-lg shrink-0 shadow-sm"
              style={{ backgroundColor: detail.themeColor || '#C8102E' }}
            >
              {(detail.name || 'M').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-[var(--text)]">{detail.name}</h3>
                {getStatusBadge(detail.status)}
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-3)] font-mono">
                <span>ID: {detail.id}</span>
                <span>•</span>
                <span>slug: {detail.uniqueName || 'unassigned'}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Settlement Account Card (Bank Critical) */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                  Settlement &amp; Holding Account (Core Banking)
                </span>
                <p className="font-mono font-bold text-sm text-emerald-950 mt-0.5">
                  {detail.holdingAccount || 'NO SETTLEMENT ACCOUNT ASSIGNED'}
                </p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  All customer payments in this mini-app settle directly into this Zemen Bank account.
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px] uppercase">
              Protected
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div className="p-3.5 bg-slate-50 border border-[var(--border)] rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)] block">
                Category
              </span>
              <p className="font-bold text-[var(--text)] mt-1">
                {detail.categoryName || 'Unassigned'}
              </p>
            </div>

            {/* Display Rank */}
            <div className="p-3.5 bg-slate-50 border border-[var(--border)] rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)] block">
                Super App Display Rank
              </span>
              <p className="font-bold text-[var(--text)] mt-1">
                Priority #{detail.rank ?? 0}
              </p>
            </div>

            {/* Web URL */}
            <div className="p-3.5 bg-slate-50 border border-[var(--border)] rounded-xl sm:col-span-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)] block">
                Hosted Application URL
              </span>
              <div className="flex items-center justify-between gap-2 mt-1">
                <a
                  href={detail.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs text-[var(--red)] hover:underline truncate inline-flex items-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5 shrink-0" />
                  {detail.url}
                </a>
                <a
                  href={detail.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 hover:bg-slate-200 text-slate-600 rounded cursor-pointer shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Description */}
            <div className="p-3.5 bg-slate-50 border border-[var(--border)] rounded-xl sm:col-span-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)] block">
                App Description
              </span>
              <p className="text-[var(--text-2)] mt-1 leading-relaxed">
                {detail.description || 'No description provided for this mini-app.'}
              </p>
            </div>
          </div>

          {/* HMAC Secret Key (Restricted) */}
          <div className="p-4 bg-slate-900 text-slate-100 rounded-xl space-y-2 border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  HMAC SHA-256 Secret Key (Merchant Signing)
                </span>
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

            <div className="flex items-center justify-between gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="font-mono text-xs text-amber-300 truncate">
                {showKey ? detail.encryptionKey : '••••••••••••••••••••••••••••••••'}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(detail.encryptionKey)}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer shrink-0"
              >
                {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedKey ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Device Permissions Card */}
          <div className="p-4 bg-slate-50 border border-[var(--border)] rounded-xl space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)] block">
              Device Permissions &amp; Hardware Access
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div
                className={`p-2.5 rounded-lg border text-center flex flex-col items-center gap-1 ${
                  detail.requiresCamera
                    ? 'bg-amber-50 border-amber-200 text-amber-900 font-bold'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span className="text-[11px]">Camera</span>
                <span className="text-[9px] uppercase font-bold">
                  {detail.requiresCamera ? 'Allowed' : 'Blocked'}
                </span>
              </div>

              <div
                className={`p-2.5 rounded-lg border text-center flex flex-col items-center gap-1 ${
                  detail.requiresLocation
                    ? 'bg-amber-50 border-amber-200 text-amber-900 font-bold'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span className="text-[11px]">Location</span>
                <span className="text-[9px] uppercase font-bold">
                  {detail.requiresLocation ? 'Allowed' : 'Blocked'}
                </span>
              </div>

              <div
                className={`p-2.5 rounded-lg border text-center flex flex-col items-center gap-1 ${
                  detail.requiresFileAccess
                    ? 'bg-amber-50 border-amber-200 text-amber-900 font-bold'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                <HardDrive className="w-4 h-4" />
                <span className="text-[11px]">Storage</span>
                <span className="text-[9px] uppercase font-bold">
                  {detail.requiresFileAccess ? 'Allowed' : 'Blocked'}
                </span>
              </div>
            </div>
          </div>

          {/* Audit Timestamps */}
          <div className="flex items-center justify-between text-[11px] text-[var(--text-3)] pt-2 border-t border-[var(--border)]">
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Registered: {detail.createdAt ? new Date(detail.createdAt).toLocaleDateString() : 'N/A'}
            </span>
            <span>
              Updated: {detail.updatedAt ? new Date(detail.updatedAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>

          {/* Reject Reason input if rejecting */}
          {rejecting && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2 animate-in fade-in duration-150">
              <label className="text-[11px] font-bold text-red-900 block">
                Reason for Rejection (sent to developer):
              </label>
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Terms of Service violation, broken callback URL..."
                className="w-full px-3 py-1.5 text-xs bg-white border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setRejecting(false)}
                  className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 rounded text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onReject(detail.id, rejectReason);
                    onClose();
                  }}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-xs cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[var(--border)] bg-[var(--surface-2)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(detail);
              }}
              className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-[var(--border)] rounded-xl font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Edit className="w-3.5 h-3.5 text-slate-500" />
              Edit Mini-App
            </button>

            {detail.status === 'Active' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onKillSwitch(detail);
                }}
                className="px-3 py-2 bg-[var(--red-pale)] hover:bg-red-100 text-[var(--red)] border border-red-200 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Suspend App
              </button>
            )}

            {detail.status === 'Suspended' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onKillSwitch(detail);
                }}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Reactivate App
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {detail.status === 'PendingReview' && !rejecting && (
              <>
                <button
                  type="button"
                  onClick={() => setRejecting(true)}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject Request
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onApprove(detail.id);
                    onClose();
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approve Go-Live
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-xs cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};