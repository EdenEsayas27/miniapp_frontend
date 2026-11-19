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
  Filter,
  Building2,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { MiniAppTransaction } from '@/types/miniapp';
import { AdminApiService } from '@/services/api';

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

export const AdminTransactionsTab: React.FC = () => {
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
      const res = await AdminApiService.getTransactions({
        status: statusFilter,
        search: searchTerm.trim() || undefined,
        pageSize: 100,
      });
      setTransactions(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load bank transactions');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

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

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text)] tracking-tight">
            Mini-App Payments &amp; Settlement Logs
          </h1>
          <p className="text-xs text-[var(--text-3)] mt-1">
            Real-time ledger of customer payments initiated across all registered mini-apps.
          </p>
        </div>

        <button
          type="button"
          onClick={loadTransactions}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Ledger
        </button>
      </div>

      {/* 2. Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[var(--border)] rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Settled Volume
          </span>
          <div className="text-xl font-extrabold text-slate-900 font-mono">
            {settledVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
            <span className="text-xs font-semibold text-slate-400">ETB</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            From {successCount} settled {successCount === 1 ? 'payment' : 'payments'} ({failedCount} failed)
          </span>
        </div>

        <div className="bg-white border border-[var(--border)] rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Settled by Core Banking
          </span>
          <div className="text-xl font-extrabold text-emerald-600 font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
            {successCount}
          </div>
          <span className="text-[11px] text-emerald-700/80 mt-1 block">
            Debited &amp; Credited
          </span>
        </div>

        <div className="bg-white border border-[var(--border)] rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Pending Core Action
          </span>
          <div className="text-xl font-extrabold text-amber-600 font-mono flex items-center gap-1.5">
            <Clock className="w-5 h-5 shrink-0 text-amber-500" />
            {pendingCount}
          </div>
          <span className="text-[11px] text-amber-700/80 mt-1 block">
            Payment token generated
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
            Core declines / cancels
          </span>
        </div>
      </div>

      {/* 3. Toolbar */}
      <div className="bg-white border border-[var(--border)] rounded-2xl p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
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

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by app, order ID, phone..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-[var(--border)] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--red)]"
            />
          </div>
        </div>
      </div>

      {/* 4. Transactions Table */}
      <div className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-[var(--border)] text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Mini-App</th>
                <th className="px-4 py-3">Partner Reference</th>
                <th className="px-4 py-3">Bank Payment Ref</th>
                <th className="px-4 py-3">FlexCube Reference</th>
                <th className="px-4 py-3">Customer Phone</th>
                <th className="px-4 py-3 text-right">Amount (ETB)</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[var(--red)] mb-2" />
                    <span>Loading ledger from database...</span>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-700 text-sm">No transactions match filters</p>
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
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {fmtDate(tx.transactionDate || tx.createdAt)}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-bold text-slate-900 block">{tx.miniAppName || 'Mini-App'}</span>
                      </td>

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

                      <td className="px-4 py-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {tx.transactionId}
                      </td>

                      <td className="px-4 py-3 font-mono text-[11px] whitespace-nowrap">
                        {tx.flexCubeReference ? (
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {tx.flexCubeReference}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      <td className="px-4 py-3 font-mono text-slate-700 whitespace-nowrap">
                        {tx.phoneNumber}
                      </td>

                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        {Number(tx.amount).toFixed(2)}
                      </td>

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

      {/* 5. Inspection Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[var(--border)] shadow-2xl max-w-xl w-full overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[var(--red)]" />
                <h3 className="text-sm font-bold text-slate-900">Admin Payment Inspection</h3>
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
                    Mini-App Name
                  </span>
                  <div className="font-bold text-slate-900">{selectedTxn.miniAppName || 'Mini-App'}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Customer Account
                  </span>
                  <code className="font-mono font-bold text-slate-900 select-all block">
                    {selectedTxn.accountId}
                  </code>
                </div>

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
                    Status Message
                  </span>
                  <p className="text-slate-700 font-medium">{selectedTxn.statusMessage}</p>
                </div>
              )}

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Raw Record (JSON)
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
