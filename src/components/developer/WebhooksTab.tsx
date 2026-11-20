
'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Clock,
  Layers,
  Smartphone,
} from 'lucide-react';
import { MiniAppAdmin } from '@/types/miniapp';

interface WebhooksTabProps {
  app: MiniAppAdmin;
}

type OutcomeType =
  | 'SUCCESS'
  | 'INSUFFICIENT_FUNDS'
  | 'CUSTOMER_CANCELLED'
  | 'INVALID_PIN'
  | 'TIMEOUT';

export const WebhooksTab: React.FC<WebhooksTabProps> = ({ app }) => {
  const [selectedOutcome, setSelectedOutcome] =
    useState<OutcomeType>('SUCCESS');

  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2500);
  };

  const nowIso = new Date().toISOString();
  const sampleTxnId = `BANK-${new Date()
    .toISOString()
    .replace(/\D/g, '')
    .slice(0, 14)}-a8e2`;

  const samplePartnerRef = `ORD-${Date.now().toString().slice(-6)}`;

  // Construct payload based on outcome
  const getPayload = (outcome: OutcomeType) => {
    switch (outcome) {
      case 'SUCCESS':
        return {
          event: 'PAYMENT_RESULT',
          payment_ref: sampleTxnId,
          partner_reference: samplePartnerRef,
          status: 'SUCCESS',
          amount: 150.0,
          currency: 'ETB',
          payer: '0911223344',
          transaction_reference: `FC-${Date.now()
            .toString()
            .slice(-8)}`,
          failure_code: null,
          failure_reason: null,
          completed_at: nowIso,
        };

      case 'INSUFFICIENT_FUNDS':
        return {
          event: 'PAYMENT_RESULT',
          payment_ref: sampleTxnId,
          partner_reference: samplePartnerRef,
          status: 'FAILED',
          amount: 150.0,
          currency: 'ETB',
          payer: '0911223344',
          transaction_reference: null,
          failure_code: 'INSUFFICIENT_FUNDS',
          failure_reason:
            'Customer account has insufficient funds to complete transaction',
          completed_at: nowIso,
        };

      case 'CUSTOMER_CANCELLED':
        return {
          event: 'PAYMENT_RESULT',
          payment_ref: sampleTxnId,
          partner_reference: samplePartnerRef,
          status: 'FAILED',
          amount: 150.0,
          currency: 'ETB',
          payer: '0911223344',
          transaction_reference: null,
          failure_code: 'CUSTOMER_CANCELLED',
          failure_reason:
            'Customer rejected payment confirmation sheet in Super App',
          completed_at: nowIso,
        };

      case 'INVALID_PIN':
        return {
          event: 'PAYMENT_RESULT',
          payment_ref: sampleTxnId,
          partner_reference: samplePartnerRef,
          status: 'FAILED',
          amount: 150.0,
          currency: 'ETB',
          payer: '0911223344',
          transaction_reference: null,
          failure_code: 'INVALID_PIN',
          failure_reason:
            'Customer entered incorrect MPIN 3 consecutive times',
          completed_at: nowIso,
        };

      case 'TIMEOUT':
        return {
          event: 'PAYMENT_RESULT',
          payment_ref: sampleTxnId,
          partner_reference: samplePartnerRef,
          status: 'FAILED',
          amount: 150.0,
          currency: 'ETB',
          payer: '0911223344',
          transaction_reference: null,
          failure_code: 'TIMEOUT',
          failure_reason:
            'Payment authorization session expired after 5 minutes of inactivity',
          completed_at: nowIso,
        };
    }
  };

  const currentPayload = getPayload(selectedOutcome);
  const currentJsonString = JSON.stringify(currentPayload, null, 2);

  return (
    <div className="space-y-8">

      {/* 1. ARCHITECTURAL OVERVIEW BANNER */}
      <div className="bg-white rounded-3xl border border-[var(--border)] p-6 sm:p-8 shadow-xs">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[var(--border)]">

          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[var(--red)] text-xs font-bold border border-red-150">
              <Smartphone className="w-3.5 h-3.5" />
              Super App Native Notification
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--text)] tracking-tight">
              Super App Payment Callback Specification
            </h2>

            <p className="text-xs sm:text-sm text-[var(--text-3)] max-w-2xl leading-relaxed">
              When a customer confirms or rejects payment in the{' '}
              <strong>Zemen Super App</strong>, the Super App
              dispatches an asynchronous HTTP POST webhook to your
              mini-app's registered{' '}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono font-bold text-slate-800">
                callBackURL
              </code>.
            </p>
          </div>

        </div>

        {/* Protocol Rules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">

          <div className="p-4 rounded-2xl bg-slate-50/70 border border-[var(--border)]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-3)] mb-1">
              HTTP Method
            </div>

            <div className="text-sm font-extrabold text-[var(--text)] flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">
                POST
              </span>
              <span>Application/JSON</span>
            </div>

            <p className="text-[11px] text-[var(--text-4)] mt-1.5">
              Delivered directly to your registered callBackURL.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/70 border border-[var(--border)]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-3)] mb-1">
              Expected Partner Status
            </div>

            <div className="text-sm font-extrabold text-[var(--text)] flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-mono font-bold">
                200 OK
              </span>
              <span>{`{"status":"RECEIVED"}`}</span>
            </div>

            <p className="text-[11px] text-[var(--text-4)] mt-1.5">
              Acknowledge receipt immediately upon parsing.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/70 border border-[var(--border)]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-3)] mb-1">
              Timeout &amp; Retries
            </div>

            <div className="text-sm font-extrabold text-[var(--text)] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>5s Timeout · 3 Retries</span>
            </div>

            <p className="text-[11px] text-[var(--text-4)] mt-1.5">
              Exponential backoff if your server responds with 5xx.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/70 border border-[var(--border)]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-3)] mb-1">
              Deduplication Key
            </div>

            <div className="text-sm font-extrabold text-[var(--text)] font-mono text-xs">
              X-Delivery-Id + payment_ref
            </div>

            <p className="text-[11px] text-[var(--text-4)] mt-1.5">
              Store payment_ref to ensure idempotent order fulfillment.
            </p>
          </div>

        </div>
      </div>

      {/* 2. HTTP HEADERS SPECIFICATION */}
      <div className="bg-white rounded-3xl border border-[var(--border)] p-6 sm:p-8 shadow-xs">

        <div className="flex items-center gap-2.5 mb-4">
          <Layers className="w-5 h-5 text-[var(--red)]" />
          <h3 className="text-base font-bold text-[var(--text)]">
            Standard HTTP Headers Delivered by Super App
          </h3>
        </div>

        <p className="text-xs text-[var(--text-3)] mb-4">
          Every callback request sent by the Super App includes the following metadata headers:
        </p>

        <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-[var(--border)] text-[var(--text-3)] font-bold uppercase tracking-wider">
                <th className="px-4 py-3">Header Name</th>
                <th className="px-4 py-3">Example Value</th>
                <th className="px-4 py-3">Description</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--border)]">
              <tr>
                <td className="px-4 py-3 font-mono font-bold text-[var(--text)]">Content-Type</td>
                <td className="px-4 py-3 font-mono text-slate-600">application/json; charset=utf-8</td>
                <td className="px-4 py-3 text-[var(--text-2)]">JSON payload format.</td>
              </tr>

              <tr>
                <td className="px-4 py-3 font-mono font-bold text-[var(--text)]">X-Delivery-Id</td>
                <td className="px-4 py-3 font-mono text-slate-600">DEL-1794984520-a8e2</td>
                <td className="px-4 py-3 text-[var(--text-2)]">
                  Unique delivery attempt identifier. Used for idempotency deduplication if retried.
                </td>
              </tr>

              <tr>
                <td className="px-4 py-3 font-mono font-bold text-[var(--text)]">X-Timestamp</td>
                <td className="px-4 py-3 font-mono text-slate-600">1794984520</td>
                <td className="px-4 py-3 text-[var(--text-2)]">
                  Unix epoch seconds when the callback event was generated.
                </td>
              </tr>

              <tr>
                <td className="px-4 py-3 font-mono font-bold text-[var(--text)]">X-Source</td>
                <td className="px-4 py-3 font-mono text-slate-600">Zemen-SuperApp</td>
                <td className="px-4 py-3 text-[var(--text-2)]">
                  Origin service tag confirming delivery from Zemen Super App mobile banking ecosystem.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. INTERACTIVE PAYLOAD EXPLORER */}
      <div className="bg-white rounded-3xl border border-[var(--border)] p-6 sm:p-8 shadow-xs">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-[var(--border)]">

          <div>
            <h3 className="text-base font-bold text-[var(--text)]">
              Interactive Callback Payload Schema
            </h3>

            <p className="text-xs text-[var(--text-3)] mt-0.5">
              Select an outcome below to preview the exact JSON payload the Super App sends for that scenario:
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-[var(--border)]">
            {(
              [
                { key: 'SUCCESS', label: 'Success (200)', icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> },
                { key: 'INSUFFICIENT_FUNDS', label: 'Insufficient Funds', icon: <XCircle className="w-3.5 h-3.5 text-red-600" /> },
                { key: 'CUSTOMER_CANCELLED', label: 'Cancelled', icon: <XCircle className="w-3.5 h-3.5 text-amber-600" /> },
                { key: 'INVALID_PIN', label: 'Invalid PIN', icon: <XCircle className="w-3.5 h-3.5 text-red-600" /> },
                { key: 'TIMEOUT', label: 'Timeout', icon: <Clock className="w-3.5 h-3.5 text-slate-500" /> },
              ] as { key: OutcomeType; label: string; icon: React.ReactNode }[]
            ).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setSelectedOutcome(item.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedOutcome === item.key
                    ? 'bg-white text-[var(--text)] font-bold shadow-xs'
                    : 'text-[var(--text-3)] hover:text-[var(--text)]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* JSON Code Box */}
        <div className="relative rounded-2xl bg-slate-900 border border-slate-800 p-5 font-mono text-xs text-slate-200 overflow-x-auto">

          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-[11px] text-slate-400">

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>POST /api/callback</span>
              <span className="text-slate-500">·</span>
              <span className={selectedOutcome === 'SUCCESS' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                {selectedOutcome}
              </span>
            </div>

            <button
              type="button"
              onClick={() => copyToClipboard(currentJsonString, 'json')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
            >
              {copied === 'json' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}

              <span>{copied === 'json' ? 'Copied' : 'Copy JSON'}</span>
            </button>

          </div>

          <pre className="leading-relaxed">{currentJsonString}</pre>
        </div>

        {/* Fields Documentation Table */}
        <div className="mt-6">

          <h4 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider mb-3">
            Field Reference
          </h4>

          <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
            <table className="w-full text-left border-collapse text-xs">

              <thead>
                <tr className="bg-slate-50 border-b border-[var(--border)] text-[var(--text-3)] font-bold uppercase tracking-wider">
                  <th className="px-4 py-2.5">Field</th>
                  <th className="px-4 py-2.5">Type</th>
                  <th className="px-4 py-2.5">Presence</th>
                  <th className="px-4 py-2.5">Description</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--border)]">
                <tr>
                  <td className="px-4 py-2.5 font-mono font-bold text-[var(--text)]">event</td>
                  <td className="px-4 py-2.5 font-mono text-slate-500">string</td>
                  <td className="px-4 py-2.5 text-emerald-700 font-bold">Always</td>
                  <td className="px-4 py-2.5 text-[var(--text-2)]">Constant value: <code>"PAYMENT_RESULT"</code></td>
                </tr>

                <tr>
                  <td className="px-4 py-2.5 font-mono font-bold text-[var(--text)]">payment_ref</td>
                  <td className="px-4 py-2.5 font-mono text-slate-500">string</td>
                  <td className="px-4 py-2.5 text-emerald-700 font-bold">Always</td>
                  <td className="px-4 py-2.5 text-[var(--text-2)]">
                    Zemen Bank payment transaction reference (e.g. <code>BANK-20261118-0c3048</code>).
                  </td>
                </tr>

                <tr>
                  <td className="px-4 py-2.5 font-mono font-bold text-[var(--text)]">partner_reference</td>
                  <td className="px-4 py-2.5 font-mono text-slate-500">string</td>
                  <td className="px-4 py-2.5 text-emerald-700 font-bold">Always</td>
                  <td className="px-4 py-2.5 text-[var(--text-2)]">
                    Your merchant system's original order ID provided in <code>transactionId</code> during initiation.
                  </td>
                </tr>

                <tr>
                  <td className="px-4 py-2.5 font-mono font-bold text-[var(--text)]">status</td>
                  <td className="px-4 py-2.5 font-mono text-slate-500">string</td>
                  <td className="px-4 py-2.5 text-emerald-700 font-bold">Always</td>
                  <td className="px-4 py-2.5 text-[var(--text-2)]">
                    Final payment status: <code>"SUCCESS"</code> or <code>"FAILED"</code>.
                  </td>
                </tr>

                <tr>
                  <td className="px-4 py-2.5 font-mono font-bold text-[var(--text)]">amount</td>
                  <td className="px-4 py-2.5 font-mono text-slate-500">decimal</td>
                  <td className="px-4 py-2.5 text-emerald-700 font-bold">Always</td>
                  <td className="px-4 py-2.5 text-[var(--text-2)]">Amount debited from customer (ETB).</td>
                </tr>

                <tr>
                  <td className="px-4 py-2.5 font-mono font-bold text-[var(--text)]">currency</td>
                  <td className="px-4 py-2.5 font-mono text-slate-500">string</td>
                  <td className="px-4 py-2.5 text-emerald-700 font-bold">Always</td>
                  <td className="px-4 py-2.5 text-[var(--text-2)]">Currency code (defaults to <code>"ETB"</code>).</td>
                </tr>

                <tr>
                  <td className="px-4 py-2.5 font-mono font-bold text-[var(--text)]">payer</td>
                  <td className="px-4 py-2.5 font-mono text-slate-500">string</td>
                  <td className="px-4 py-2.5 text-slate-600">Conditional</td>
                  <td className="px-4 py-2.5 text-[var(--text-2)]">Customer phone number authorizing payment.</td>
                </tr>

                <tr>
                  <td className="px-4 py-2.5 font-mono font-bold text-[var(--text)]">transaction_reference</td>
                  <td className="px-4 py-2.5 font-mono text-slate-500">string</td>
                  <td className="px-4 py-2.5 text-slate-600">On SUCCESS</td>
                  <td className="px-4 py-2.5 text-[var(--text-2)]">
                    Core Banking FlexCube journal settlement reference (e.g. <code>FC-98124</code>). Null on failure.
                  </td>
                </tr>

                <tr>
                  <td className="px-4 py-2.5 font-mono font-bold text-[var(--text)]">failure_code</td>
                  <td className="px-4 py-2.5 font-mono text-slate-500">string</td>
                  <td className="px-4 py-2.5 text-slate-600">On FAILED</td>
                  <td className="px-4 py-2.5 text-[var(--text-2)]">
                    Standard failure reason code (<code>INSUFFICIENT_FUNDS</code>, <code>CUSTOMER_CANCELLED</code>, <code>INVALID_PIN</code>, <code>TIMEOUT</code>).
                  </td>
                </tr>

                <tr>
                  <td className="px-4 py-2.5 font-mono font-bold text-[var(--text)]">completed_at</td>
                  <td className="px-4 py-2.5 font-mono text-slate-500">string</td>
                  <td className="px-4 py-2.5 text-emerald-700 font-bold">Always</td>
                  <td className="px-4 py-2.5 text-[var(--text-2)]">ISO 8601 UTC timestamp of transaction finality.</td>
                </tr>
              </tbody>

            </table>
          </div>
        </div>
      </div>

    </div>
  );
};
