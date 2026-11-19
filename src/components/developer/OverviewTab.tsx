'use client';

import React from 'react';
import {
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Smartphone,
  Key,
  Building2,
  Lock,
  Layers,
  Sparkles,
  ExternalLink,
  Zap,
  Code2,
  Cpu,
  Server,
  Globe,
  Check,
  AlertTriangle,
  ArrowUpRight,
  Send,
  Clock,
  XCircle,
} from 'lucide-react';
import { MiniAppAdmin } from '@/types/miniapp';

interface OverviewTabProps {
  app: MiniAppAdmin;
  onNavigateTab: (tabKey: any) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ app, onNavigateTab }) => {
  return (
    <div className="space-y-10 pb-12">
      {/* 1. Documentation Header */}
      <div className="border-b border-[var(--border)] pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--red)] uppercase tracking-wider mb-1.5">
              <BookOpen className="w-4 h-4" />
              <span>Zemen Bank Mini-App Developer Guide</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl">
              Integration &amp; Payment Lifecycle
            </h1>
            <p className="mt-2 text-sm text-[var(--text-3)] max-w-3xl leading-relaxed">
              Complete technical specification for embedding web applications inside the Zemen Super App. Learn the
              step-by-step lifecycle from customer launch and identity verification to HMAC-signed payments and native password authorization.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
              App: <strong className="text-[var(--text)]">{app.name}</strong>
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                app.status === 'Active'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              Status: <strong>{app.status}</strong>
            </span>
          </div>
        </div>

        {/* Quick Tools Action Bar */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigateTab('sandbox')}
            className="px-4 py-2 bg-[var(--red)] hover:bg-[var(--red-hover)] text-white text-xs font-semibold rounded-lg shadow-xs inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5" />
            API Sandbox
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('playground')}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-[var(--text)] text-xs font-semibold rounded-lg border border-[var(--border)] shadow-xs inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5 text-amber-600" />
            HMAC Playground &amp; Snippets
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('docs')}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-[var(--text)] text-xs font-semibold rounded-lg border border-[var(--border)] shadow-xs inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            Endpoint Reference
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('webhooks')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            Super App Callbacks
          </button>
        </div>
      </div>

      {/* 2. Responsibilities: What You Build (Partner / Merchant) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-[var(--text)]">Partner Implementation Overview</h2>
          <p className="text-xs text-[var(--text-3)] mt-0.5">
            Key integration touchpoints required for your mini-app frontend and backend services.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text)]">What You Build &amp; Implement</h3>
              <p className="text-[11px] text-[var(--text-3)]">Overview of the mini-app communication flow</p>
            </div>
          </div>

          <ul className="space-y-3 text-xs text-[var(--text-2)]">
            <li className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>Launch Token Handling:</strong> When the user opens your mini-app, the Super App sends a launch token to your mini-app. Your frontend passes this token to your backend.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>User Validation (<code className="text-blue-700 font-mono font-semibold">GET /Validate</code>):</strong> Your backend calls the <code className="text-blue-700">/Validate</code> endpoint with the launch token to verify the customer and obtain user information (Phone, Full Name, CIF).
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>Payment Initiation (<code className="text-amber-800 font-mono font-semibold">POST /Payment</code>):</strong> When the customer checks out, your backend calculates an HMAC-SHA256 signature using your secret <code className="text-amber-800">EncryptionKey</code> and calls <code className="text-blue-700">POST /Payment</code> to receive the signed <code className="text-purple-700">paymentToken</code>.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>Native Payment Invocation:</strong> Your frontend calls <code className="text-purple-700 font-mono font-semibold">window.ZemenPay.requestPayment(paymentToken)</code>. The Super App prompts the customer for their password and executes the transfer.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>Webhook Settlement Handler:</strong> Your server receives asynchronous payment confirmations on your configured <code className="text-emerald-700">callBackURL</code> upon final settlement.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* 3. The Complete 4-Phase Payment Lifecycle Walkthrough */}
      <div className="space-y-6">
        <div>
          <h2 className="text-base font-bold text-[var(--text)]">End-to-End Integration Lifecycle</h2>
          <p className="text-xs text-[var(--text-3)] mt-0.5">
            Follow these 4 phases in order. Each phase outlines the exact flow, endpoints to call, and developer tools available.
          </p>
        </div>

        {/* PHASE 1 */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="text-sm font-bold text-[var(--text)]">
                Phase 1: Customer Launch &amp; Identity Verification
              </h3>
            </div>
            <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded bg-blue-100 text-blue-800">
              GET /Validate
            </span>
          </div>

          <div className="p-5 space-y-4">
            <p className="text-xs text-[var(--text-2)] leading-relaxed">
              When a customer opens your mini-app inside the Zemen Super App, the Super App sends a launch token to your mini-app.
              Your backend receives this token and calls <code className="text-blue-700 font-mono font-semibold">/Validate</code> to identify the customer and start their session.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Step 1.1: Super App Sends Token</div>
                <p className="text-xs text-[var(--text-2)]">
                  The Super App opens your mini-app and delivers the customer launch token.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Step 1.2: Pass to Backend</div>
                <p className="text-xs text-[var(--text-2)]">
                  Your frontend forwards the received launch token to your backend server.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Step 1.3: Validate Claims</div>
                <p className="text-xs text-[var(--text-2)]">
                  Your backend calls <code className="text-blue-700">GET /Validate</code> to retrieve verified customer information.
                </p>
              </div>
            </div>

            {/* Code / Contract sample */}
            <div className="p-4 bg-slate-900 rounded-xl text-slate-200 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-[11px] pb-2 border-b border-slate-800">
                <span>API Request: Validate Customer Session</span>
                <span className="text-emerald-400">Response 200 OK</span>
              </div>
              <div className="text-blue-400">GET /Validate?token=eyJhbGciOi...</div>
              <div className="text-slate-400">// Returns verified customer claims:</div>
              <pre className="text-emerald-300 overflow-x-auto text-[11px]">{`{
  "valid": true,
  "phone": "0911223344",
  "fullName": "Abebe Kebede",
  "cif": "CIF0012345",
  "email": "customer@zemenbank.et"
}`}</pre>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-[11px] text-[var(--text-3)] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />

              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('sandbox')}
                className="text-xs font-bold text-[var(--red)] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                Try /Validate in Sandbox <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* PHASE 2 */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h3 className="text-sm font-bold text-[var(--text)]">
                Phase 2: Payment Initiation &amp; Server-Side HMAC-SHA256 Signing
              </h3>
            </div>
            <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded bg-amber-100 text-amber-800">
              POST /Payment
            </span>
          </div>

          <div className="p-5 space-y-4">
            <p className="text-xs text-[var(--text-2)] leading-relaxed">
              When the customer is ready to pay, your frontend asks your backend to initiate the payment.
              To guarantee data integrity, your backend signs the payload with your confidential <code className="text-amber-800">EncryptionKey</code> using HMAC-SHA256.
            </p>

            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <Key className="w-4 h-4 text-amber-700" />
                <span>Canonical HMAC-SHA256 Signing Format (Strict Order)</span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                Concatenate the 6 parameters separated strictly by colons (<code className="font-mono">:</code>):
              </p>
              <div className="p-2.5 bg-white border border-amber-300 rounded font-mono text-xs text-amber-950 font-bold select-all overflow-x-auto">
                accountNo:amount:companyName:callBackURL:transactionId:transactionTime
              </div>
              <p className="text-[11px] text-amber-800">
                • <strong>transactionTime:</strong> UTC timestamp (Unix seconds or ISO 8601), valid within ±5 minutes of server time.
                <br />
                • <strong>transactionId:</strong> Unique merchant transaction reference (enforces strict idempotency).
              </p>
            </div>

            {/* Code / Contract sample */}
            <div className="p-4 bg-slate-900 rounded-xl text-slate-200 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-[11px] pb-2 border-b border-slate-800">
                <span>POST /Payment Payload</span>
                <span className="text-emerald-400">Response 200 OK</span>
              </div>
              <pre className="text-slate-300 overflow-x-auto text-[11px]">{`{
  "companyName": "${app.name}",
  "amount": "500.00",
  "accountNo": "${app.holdingAccount || '1000123456789'}",
  "transactionId": "TXN-1715000001",
  "transactionTime": "1715000000",
  "callBackURL": "https://api.partner.et/webhook",
  "token": "<userLaunchToken>",
  "signature": "a8f3b0c51d9e4a7b8c...hmac_sha256..."
}`}</pre>
              <div className="text-slate-400 pt-2 border-t border-slate-800">// Bank Gateway verifies signature &amp; returns JWT:</div>
              <pre className="text-emerald-300 overflow-x-auto text-[11px]">{`{
  "code": "0",
  "message": "Token Generated Successfully.",
  "token": "eyJhbGciOiJIUzI1NiIs..." // Signed paymentToken
}`}</pre>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-[11px] text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Security rule: Never place your Secret Key in client JavaScript or mobile code.</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigateTab('playground')}
                  className="text-xs font-bold text-amber-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  HMAC Playground &amp; Code Snippets <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab('sandbox')}
                  className="text-xs font-bold text-[var(--red)] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  Test /Payment in Sandbox <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* PHASE 3 */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                3
              </span>
              <h3 className="text-sm font-bold text-[var(--text)]">
                Phase 3: Native Super App Payment Invocation
              </h3>
            </div>
            <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded bg-purple-100 text-purple-800">
              window.ZemenPay.requestPayment()
            </span>
          </div>

          <div className="p-5 space-y-4">
            <p className="text-xs text-[var(--text-2)] leading-relaxed">
              Once your backend receives the signed <code className="text-purple-800 font-mono">paymentToken</code>, it returns it
              to your frontend webview. Your frontend calls the native JavaScript Bridge <code className="font-mono font-bold text-purple-700">window.ZemenPay.requestPayment(paymentToken)</code>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Step 3.1: Call JS Bridge</div>
                <p className="text-xs text-[var(--text-2)]">
                  Pass only the <code className="text-purple-700">paymentToken</code> string. The Super App verifies token claims internally.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Step 3.2: Native Authorization Sheet</div>
                <p className="text-xs text-[var(--text-2)]">
                  The Super App native bottom-sheet slides up over your webview. Customer enters their payment password.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Step 3.3: Super App Handles Payment</div>
                <p className="text-xs text-[var(--text-2)]">
                  The Super App verifies credentials, processes the payment, and sends the callback to your mini-app.
                </p>
              </div>
            </div>

            {/* Code / Contract sample */}
            <div className="p-4 bg-slate-900 rounded-xl text-slate-200 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-[11px] pb-2 border-b border-slate-800">
                <span>Frontend JavaScript: Invoke Native Payment Sheet</span>
                <span className="text-purple-400">Promise-based</span>
              </div>
              <pre className="text-purple-300 overflow-x-auto text-[11px]">{`// Call native host container with the paymentToken received from your backend
window.ZemenPay.requestPayment(paymentToken)
  .then((receipt) => {
    // Payment approved by customer in the Super App!
    console.log("Success! Transaction ID:", receipt.transactionId);
    showSuccessReceipt(receipt);
  })
  .catch((err) => {
    // Customer cancelled, entered wrong password, or insufficient funds
    console.error("Payment failed:", err.message);
    showErrorMessage(err.message);
  });`}</pre>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-[11px] text-[var(--text-3)] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Authentication and password confirmation are handled natively by the host Super App.</span>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('sandbox')}
                className="text-xs font-bold text-purple-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                Test in API Sandbox <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* PHASE 4 */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                4
              </span>
              <h3 className="text-sm font-bold text-[var(--text)]">
                Phase 4: Super App Payment Processing &amp; Server Webhook Callbacks
              </h3>
            </div>
            <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
              POST callBackURL
            </span>
          </div>

          <div className="p-5 space-y-4">
            <p className="text-xs text-[var(--text-2)] leading-relaxed">
              After the bridge call, the Super App handles the customer authorization and payment processing.
              The Super App resolves the frontend JavaScript promise and dispatches an asynchronous <strong>server-to-server callback</strong> directly
              to your configured <code className="text-emerald-700 font-mono font-semibold">callBackURL</code>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Step 4.1: Super App Handles Payment</div>
                <p className="text-xs text-[var(--text-2)]">
                  The Super App validates customer authorization and completes the payment transfer.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Step 4.2: Frontend Bridge Resolves</div>
                <p className="text-xs text-[var(--text-2)]">
                  The payment sheet closes and <code className="text-purple-700">window.ZemenPay.requestPayment()</code> returns status to your webview.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Step 4.3: Webhook Callback Dispatched</div>
                <p className="text-xs text-[var(--text-2)]">
                  The Super App sends an HTTP POST callback to your <code className="text-emerald-700">callBackURL</code> with final payment confirmation.
                </p>
              </div>
            </div>

            {/* Side-by-Side Callbacks: Success vs Failure */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Success Callback */}
              <div className="p-4 bg-slate-900 rounded-xl text-slate-200 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-[11px] pb-2 border-b border-slate-800">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Success Callback (Fulfill Order)
                  </span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded">STATUS: SUCCESS</span>
                </div>
                <pre className="text-emerald-300 overflow-x-auto text-[11px]">{`{
  "event": "PAYMENT_RESULT",
  "payment_ref": "BANK-20261119-a8e2",
  "partner_reference": "TXN-1715000001",
  "status": "SUCCESS",
  "amount": 500.00,
  "currency": "ETB",
  "payer": "0911223344",
  "transaction_reference": "FC-20261119-969ee9",
  "failure_code": null,
  "failure_reason": null,
  "completed_at": "2026-11-19T10:15:30Z"
}`}</pre>
                <p className="text-[10px] text-slate-400 pt-1 font-sans">
                  Action: Verify <code className="text-slate-200">payment_ref</code> and <code className="text-slate-200">amount</code>, mark order as <strong>PAID</strong>, and deliver goods/services.
                </p>
              </div>

              {/* Failure Callback */}
              <div className="p-4 bg-slate-900 rounded-xl text-slate-200 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-[11px] pb-2 border-b border-slate-800">
                  <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                    <XCircle className="w-3.5 h-3.5" /> Failure Callback (Cancel / Retry)
                  </span>
                  <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800 px-1.5 py-0.5 rounded">STATUS: FAILED</span>
                </div>
                <pre className="text-rose-300 overflow-x-auto text-[11px]">{`{
  "event": "PAYMENT_RESULT",
  "payment_ref": "BANK-20261119-a8e2",
  "partner_reference": "TXN-1715000001",
  "status": "FAILED",
  "amount": 500.00,
  "currency": "ETB",
  "payer": "0911223344",
  "transaction_reference": null,
  "failure_code": "INSUFFICIENT_FUNDS",
  "failure_reason": "Customer account has insufficient funds",
  "completed_at": "2026-11-19T10:15:30Z"
}`}</pre>
                <p className="text-[10px] text-slate-400 pt-1 font-sans">
                  Failure Codes: <code className="text-rose-300">INSUFFICIENT_FUNDS</code>, <code className="text-rose-300">INVALID_PIN</code>, <code className="text-rose-300">CUSTOMER_CANCELLED</code>, or <code className="text-rose-300">TIMEOUT</code>.
                </p>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                 
                </span>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('webhooks')}
                className="text-xs font-bold text-emerald-800 hover:underline inline-flex items-center gap-1 cursor-pointer shrink-0"
              >
                Inspect Callbacks &amp; Failure Codes <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Developer Tools & Ready-to-Use Resources Provided in This Portal */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-[var(--text)]">Testing Tools &amp; Portal Utilities</h2>
          <p className="text-xs text-[var(--text-3)] mt-0.5">
            Everything you need to test, debug, and certify your integration before moving to production.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tool 1 */}
          <div
            onClick={() => onNavigateTab('sandbox')}
            className="p-4 bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xs rounded-xl transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-red-50 text-[var(--red)] flex items-center justify-center font-bold">
                <Terminal className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-[var(--text)]">Interactive API Sandbox</h3>
              <p className="text-[11px] text-[var(--text-3)] leading-relaxed">
                Test <code className="text-slate-800">GET /Validate</code> and <code className="text-slate-800">POST /Payment</code> live with auto-generated test user tokens and complete response inspection.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-[var(--red)]">
              <span>Launch Sandbox</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Tool 2 */}
          <div
            onClick={() => onNavigateTab('playground')}
            className="p-4 bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xs rounded-xl transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Code2 className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-[var(--text)]">HMAC Playground &amp; Snippets</h3>
              <p className="text-[11px] text-[var(--text-3)] leading-relaxed">
                Verify your canonical string formatting and copy tested signing implementations for Node.js, Python, C# .NET, and PHP.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-amber-700">
              <span>View Code Snippets</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Tool 3 */}
          <div
            onClick={() => onNavigateTab('docs')}
            className="p-4 bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xs rounded-xl transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <Smartphone className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-[var(--text)]">Sandbox Test APK</h3>
              <p className="text-[11px] text-[var(--text-3)] leading-relaxed">
                Test your mini-app on real Android devices using the official Zemen Super App sandbox APK. Test native permissions and webviews live.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-blue-700">
              <span>View Testing Guide</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Tool 4 */}
          <div
            onClick={() => onNavigateTab('webhooks')}
            className="p-4 bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xs rounded-xl transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Send className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-[var(--text)]">Callbacks &amp; Webhooks</h3>
              <p className="text-[11px] text-[var(--text-3)] leading-relaxed">
                Test the live webhook dispatcher, inspect async payload schemas, and simulate server responses for all failure codes.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-emerald-700">
              <span>View Callback Schemas</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
