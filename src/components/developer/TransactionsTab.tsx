'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Copy,
  Check,
  Receipt,
  Layers,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  Filter,
} from 'lucide-react';
import { MiniAppAdmin, MiniAppTransaction } from '@/types/miniapp';
import { AdminApiService } from '@/services/api';

interface TransactionsTabProps {
  app: MiniAppAdmin;
  isGuest?: boolean;
}

const fmtDate = (dateStr: string) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

export const TransactionsTab: React.FC<TransactionsTabProps> = ({ app, isGuest }) => {
  const [transactions, setTransactions] = useState<MiniAppTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'SUCCESS' | 'PENDING' | 'FAILED'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedTxn, setSelectedTxn] = useState<MiniAppTransaction | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await AdminApiService.getDeveloperTransactions({
        miniAppId: app.id,
        status: statusFilter,
        search: searchTerm.trim() || undefined,
        pageSize: 100,
      });
      setTransactions(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [app.id, statusFilter, searchTerm]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Aggregate stats - volume only counts successfully settled transactions (status === 1)
  const settledVolume = transactions
    .filter((t) => t.status === 1)
    .reduce((acc, t) => acc + (t.amount || 0), 0);
  const successCount = transactions.filter((t) => t.status === 1).length;
  const failedCount = transactions.filter((t) => t.status === 2).length;
  const pendingCount = transactions.filter((t) => t.status === 0).length;
  const successRate = transactions.length > 0 ? Math.round((successCount / transactions.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* 1. Header & Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[var(--border)] rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Settled Volume (Success)
          </span>
          <div className="text-xl font-extrabold text-slate-900 font-mono">
            {settledVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
            <span className="text-xs font-semibold text-slate-400">ETB</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            From {successCount} successful {successCount === 1 ? 'payment' : 'payments'} ({failedCount} failed)
          </span>
        </div>

        <div className="bg-white border border-[var(--border)] rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Settled (Success)
          </span>
          <div className="text-xl font-extrabold text-emerald-600 font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
            {successCount}
          </div>
          <span className="text-[11px] text-emerald-700/80 mt-1 block">
            {successRate}% settlement rate
          </span>
        </div>

        <div className="bg-white border border-[var(--border)] rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            In-Flight (Pending)
          </span>
          <div className="text-xl font-extrabold text-amber-600 font-mono flex items-center gap-1.5">
            <Clock className="w-5 h-5 shrink-0 text-amber-500" />
            {pendingCount}
          </div>
          <span className="text-[11px] text-amber-700/80 mt-1 block">
            Awaiting password entry
          </span>
        </div>

        <div className="bg-white border border-[var(--border)] rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Failed / Cancelled
          </span>
          <div className="text-xl font-extrabold text-red-600 font-mono flex items-center gap-1.5">
            <XCircle className="w-5 h-5 shrink-0 text-red-500" />
            {failedCount}
          </div>
          <span className="text-[11px] text-red-700/80 mt-1 block">
            Insufficient funds or aborts
          </span>
        </div>
      </div>

      {/* 2. Filter & Search Toolbar */}
      <div className="bg-white border border-[var(--border)] rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl">
            {(
              [
                { id: 'all', label: 'All Statuses' },
                { id: 'SUCCESS', label: 'Success' },
                { id: 'PENDING', label: 'Pending' },
                { id: 'FAILED', label: 'Failed' },
              ] as const
            ).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStatusFilter(s.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  statusFilter === s.id
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Search Bar & Refresh */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search reference, phone..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-[var(--border)] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--red)]"
              />
            </div>

            <button
              type="button"
              onClick={loadTransactions}
              title="Refresh Transactions"
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-[var(--border)] text-slate-600 rounded-xl cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[var(--red)]' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Transactions Table (Modeled after dev.zemenbank.et / ref-paygate) */}
      <div className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-[var(--border)] text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Partner Reference</th>
                <th className="px-4 py-3">Bank Payment Ref</th>
                <th className="px-4 py-3">Core FlexCube Ref</th>
                <th className="px-4 py-3">Payer Phone</th>
                <th className="px-4 py-3 text-right">Amount (ETB)</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[var(--red)] mb-2" />
                    <span>Loading transactions from Test DB...</span>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-700 text-sm">No transactions found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Initiate a payment in the API Sandbox to record a test transaction.
                    </p>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isPending = tx.status === 0;
                  const isSuccess = tx.status === 1;
                  const isFailed = tx.status === 2;

                  return (
                    <tr
                      key={tx.id}
                      onClick={() => setSelectedTxn(tx)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Timestamp */}
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {fmtDate(tx.transactionDate || tx.createdAt)}
                      </td>

                      {/* Partner Ref */}
                      <td className="px-4 py-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <span>{tx.originatorId}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(tx.originatorId, `orig-${tx.id}`);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 transition-opacity p-0.5"
                          >
                            {copiedId === `orig-${tx.id}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </span>
                      </td>

                      {/* Bank Ref */}
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <span>{tx.transactionId}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(tx.transactionId, `bank-${tx.id}`);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 transition-opacity p-0.5"
                          >
                            {copiedId === `bank-${tx.id}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </span>
                      </td>

                      {/* FlexCube Reference */}
                      <td className="px-4 py-3 font-mono text-[11px] whitespace-nowrap">
                        {tx.flexCubeReference ? (
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {tx.flexCubeReference}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Payer Phone */}
                      <td className="px-4 py-3 font-mono text-slate-700 whitespace-nowrap">
                        {tx.phoneNumber}
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        {Number(tx.amount).toFixed(2)}
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {isSuccess && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            SUCCESS
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            PENDING
                          </span>
                        )}
                        {isFailed && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-50 text-red-700 border border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            FAILED
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Transaction Inspection Drawer/Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[var(--border)] shadow-2xl max-w-xl w-full overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[var(--red)]" />
                <h3 className="text-sm font-bold text-slate-900">Transaction Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTxn(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-xs p-1 cursor-pointer"
              >
                Close ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Partner Order ID
                  </span>
                  <code className="font-mono font-bold text-slate-900 select-all block">
                    {selectedTxn.originatorId}
                  </code>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Bank Reference
                  </span>
                  <code className="font-mono font-bold text-slate-900 select-all block">
                    {selectedTxn.transactionId}
                  </code>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Settlement Status
                  </span>
                  <div className="font-bold">
                    {selectedTxn.status === 1 ? (
                      <span className="text-emerald-700 font-extrabold">SUCCESS</span>
                    ) : selectedTxn.status === 2 ? (
                      <span className="text-red-700 font-extrabold">FAILED</span>
                    ) : (
                      <span className="text-amber-700 font-extrabold">PENDING</span>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Amount &amp; Currency
                  </span>
                  <div className="font-mono font-bold text-slate-900">
                    {Number(selectedTxn.amount).toFixed(2)} ETB
                  </div>
                </div>
              </div>

              {selectedTxn.flexCubeReference && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                    Core Banking FlexCube Reference
                  </span>
                  <code className="font-mono font-bold text-emerald-900 select-all block">
                    {selectedTxn.flexCubeReference}
                  </code>
                </div>
              )}

              {selectedTxn.statusMessage && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Status Message / Diagnostic Log
                  </span>
                  <p className="text-slate-700 font-medium">{selectedTxn.statusMessage}</p>
                </div>
              )}

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Raw Test DB Record (JSON)
                </span>
                <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 text-[11px] font-mono overflow-x-auto max-h-48 leading-relaxed">
                  {JSON.stringify(selectedTxn, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
