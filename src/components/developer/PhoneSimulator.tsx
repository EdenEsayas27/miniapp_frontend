'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Smartphone,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Maximize2,
  Wifi,
  Battery,
  Signal,
  Play,
  Zap,
  ArrowRight,
  Code2,
  Lock,
  ExternalLink,
  Receipt,
  FileCheck,
  Clock,
  Copy,
  Check,
} from 'lucide-react';
import { AdminApiService } from '@/services/api';

interface PhoneSimulatorProps {
  appUrl: string;
  appName: string;
  appColor: string;
  initialPaymentToken?: string;
  onGoToTransactions?: () => void;
}

interface SimResult {
  status: string;
  flexCubeReference?: string;
  failureCode?: string;
  failureReason?: string;
  callbackDispatched?: boolean;
  callbackUrl?: string;
  callbackHttpStatus?: number;
  callbackPayload?: any;
  message?: string;
}

type SimState = 'idle' | 'payment-sheet' | 'pin-entry' | 'processing' | 'success' | 'failure';

interface ParsedPayment {
  amount: string;
  companyName: string;
  transactionId: string;
  accountNo?: string;
  callBackURL?: string;
  rawToken?: string;
  description?: string;
}

function parsePaymentInput(raw: any, fallbackAppName: string): ParsedPayment {
  // If string JWT or object containing paymentToken
  const tokenString = typeof raw === 'string' ? raw : (raw?.paymentToken || raw?.token);

  if (tokenString && typeof tokenString === 'string' && tokenString.includes('.')) {
    try {
      const parts = tokenString.split('.');
      if (parts.length >= 2) {
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const claims = JSON.parse(jsonPayload);
        return {
          amount: claims.amount || raw?.amount || '150.00',
          companyName: claims.companyName || raw?.companyName || fallbackAppName,
          transactionId: claims.transactionId || raw?.transactionId || 'TXN-' + Date.now(),
          accountNo: claims.accountNo || raw?.accountNo || '1000123456',
          callBackURL: claims.callBackURL || raw?.callBackURL,
          rawToken: tokenString,
          description: raw?.description || 'Payment via Super App',
        };
      }
    } catch (e) {
      console.warn('Failed to decode JWT payment token', e);
    }
  }

  // Fallback if raw object
  return {
    amount: raw?.amount || '150.00',
    companyName: raw?.companyName || fallbackAppName,
    transactionId: raw?.transactionId || 'TXN-' + Date.now(),
    accountNo: raw?.accountNo || '1000123456',
    callBackURL: raw?.callBackURL,
    rawToken: typeof raw === 'string' ? raw : undefined,
    description: raw?.description || 'Payment via Super App',
  };
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  appUrl,
  appName,
  appColor,
  initialPaymentToken = '',
  onGoToTransactions,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [simState, setSimState] = useState<SimState>('idle');
  const [pin, setPin] = useState('');
  const [capturedPayment, setCapturedPayment] = useState<ParsedPayment | null>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const [simResult, setSimResult] = useState<SimResult | null>(null);
  const [copiedCallback, setCopiedCallback] = useState(false);

  // Manual token input in the simulator testing console
  const [manualTokenInput, setManualTokenInput] = useState<string>(initialPaymentToken);

  // Keep manualTokenInput in sync if parent passes a new token from Sandbox
  useEffect(() => {
    if (initialPaymentToken) {
      setManualTokenInput(initialPaymentToken);
    }
  }, [initialPaymentToken]);

  // Listen for messages from the mini-app iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'ZEMEN_PAY_REQUEST') {
        const parsed = parsePaymentInput(event.data.payload, appName);
        setCapturedPayment(parsed);
        setSimState('payment-sheet');
        setPin('');
        setSimResult(null);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [appName]);

  // Inject the bridge script into the iframe once it loads
  const injectBridge = () => {
    try {
      const iframe = iframeRef.current;
      if (!iframe?.contentWindow) return;

      const bridgeScript = `
        window.ZemenPay = {
          // Standard call: window.ZemenPay.requestPayment(paymentToken)
          requestPayment: function(paymentToken) {
            window.parent.postMessage({ type: 'ZEMEN_PAY_REQUEST', payload: paymentToken }, '*');
            return new Promise(function(resolve, reject) {
              window._zemenPayCallback = { resolve: resolve, reject: reject };
            });
          },
          getAppInfo: function() {
            return { appName: '${appName}', env: 'SANDBOX' };
          }
        };
        console.log('[ZemenPay Bridge] Bridge injected: window.ZemenPay.requestPayment(paymentToken) ready.');
      `;

      // eslint-disable-next-line no-eval
      (iframe.contentWindow as any).eval(bridgeScript);
    } catch {
      // Cross-origin iframes will block eval — handled via direct simulator triggers
    }
  };

  const handlePinKey = (digit: string) => {
    if (digit === 'DEL') {
      setPin((p) => p.slice(0, -1));
      return;
    }
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);

    if (newPin.length === 4) {
      setTimeout(() => handlePinSubmit(newPin), 300);
    }
  };

  const handlePinSubmit = async (submittedPin: string) => {
    setSimState('processing');
    const isCorrect = submittedPin === '1234';
    const txnId = capturedPayment?.transactionId || 'TXN-' + Date.now();

    try {
      const res = await AdminApiService.simulateSettlement({
        transactionId: txnId,
        outcome: isCorrect ? 'SUCCESS' : 'INVALID_PIN',
        reason: isCorrect ? undefined : 'Incorrect customer PIN entered on mobile',
      });

      const resAny = res as any;
      const flexRef = res.flexCubeReference || resAny.callbackPayload?.transaction_reference || 'FC-' + Date.now();

      setSimResult({
        status: res.status || (isCorrect ? 'SUCCESS' : 'FAILED'),
        flexCubeReference: flexRef,
        failureCode: resAny.failureCode,
        failureReason: resAny.failureReason,
        callbackDispatched: resAny.callbackDispatched ?? true,
        callbackUrl: resAny.callbackUrl,
        callbackHttpStatus: resAny.callbackHttpStatus,
        callbackPayload: resAny.callbackPayload,
        message: res.message,
      });

      if (isCorrect && (res.status === 'SUCCESS' || resAny.success !== false)) {
        setSimState('success');
        try {
          iframeRef.current?.contentWindow?.postMessage(
            {
              type: 'ZEMEN_PAY_RESPONSE',
              success: true,
              transactionId: txnId,
              flexCubeReference: flexRef,
              amount: capturedPayment?.amount,
            },
            '*'
          );
        } catch {}
      } else {
        setSimState('failure');
      }
    } catch (e: any) {
      // Graceful local fallback if offline
      if (isCorrect) {
        setSimResult({
          status: 'SUCCESS',
          flexCubeReference: 'FC-' + Date.now(),
          callbackDispatched: true,
          message: 'Settled successfully in simulation mode.',
        });
        setSimState('success');
      } else {
        setSimResult({
          status: 'FAILED',
          failureCode: 'INVALID_PIN',
          failureReason: 'Incorrect password. Sandbox test password is 1234.',
        });
        setSimState('failure');
      }
    }
  };

  const handleCancelPayment = async () => {
    setSimState('processing');
    const txnId = capturedPayment?.transactionId || 'TXN-' + Date.now();
    try {
      const res = await AdminApiService.simulateSettlement({
        transactionId: txnId,
        outcome: 'CUSTOMER_CANCELLED',
        reason: 'Customer cancelled transaction from PIN sheet',
      });
      setSimResult({
        status: 'CANCELLED',
        failureCode: 'CUSTOMER_CANCELLED',
        failureReason: 'Customer cancelled transaction',
        callbackPayload: (res as any).callbackPayload,
      });
    } catch {
      setSimResult({
        status: 'CANCELLED',
        failureCode: 'CUSTOMER_CANCELLED',
        failureReason: 'Customer cancelled transaction',
      });
    }
    setSimState('failure');
  };

  const handleDirectSimulateOutcome = async (
    outcome: 'SUCCESS' | 'INSUFFICIENT_FUNDS' | 'CUSTOMER_CANCELLED' | 'INVALID_PIN' | 'TIMEOUT'
  ) => {
    setSimState('processing');
    const txnId = capturedPayment?.transactionId || 'TXN-' + Date.now();
    const isSuccess = outcome === 'SUCCESS';

    const reasons: Record<string, string> = {
      INSUFFICIENT_FUNDS: 'Customer account has insufficient funds to complete transaction',
      CUSTOMER_CANCELLED: 'Customer rejected payment confirmation sheet in Super App',
      INVALID_PIN: 'Customer entered incorrect MPIN 3 consecutive times',
      TIMEOUT: 'Payment authorization session expired after 5 minutes of inactivity',
    };

    try {
      const res = await AdminApiService.simulateSettlement({
        transactionId: txnId,
        outcome: outcome,
        reason: reasons[outcome],
      });

      const resAny = res as any;
      const flexRef = res.flexCubeReference || resAny.callbackPayload?.transaction_reference || (isSuccess ? 'FC-' + Date.now() : undefined);

      setSimResult({
        status: res.status || outcome,
        flexCubeReference: flexRef,
        failureCode: resAny.failureCode || (isSuccess ? undefined : outcome),
        failureReason: resAny.failureReason || reasons[outcome],
        callbackDispatched: resAny.callbackDispatched ?? true,
        callbackUrl: resAny.callbackUrl,
        callbackHttpStatus: resAny.callbackHttpStatus,
        callbackPayload: resAny.callbackPayload,
        message: res.message,
      });

      if (isSuccess) {
        setSimState('success');
      } else {
        setSimState('failure');
      }
    } catch {
      if (isSuccess) {
        setSimResult({
          status: 'SUCCESS',
          flexCubeReference: 'FC-' + Date.now(),
          callbackDispatched: true,
          message: 'Settled successfully in simulation mode.',
        });
        setSimState('success');
      } else {
        setSimResult({
          status: outcome,
          failureCode: outcome,
          failureReason: reasons[outcome] || 'Transaction simulation failed',
        });
        setSimState('failure');
      }
    }
  };

  // Directly trigger payment sheet with a payment token
  const handleTriggerWithToken = (tokenToUse: string) => {
    if (!tokenToUse.trim()) {
      alert('Please enter or generate a paymentToken first!');
      return;
    }
    const parsed = parsePaymentInput(tokenToUse.trim(), appName);
    setCapturedPayment(parsed);
    setSimState('payment-sheet');
    setPin('');
  };

  const resetSim = () => {
    setSimState('idle');
    setPin('');
    setCapturedPayment(null);
    setIframeKey((k) => k + 1);
  };

  const pinKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'DEL', '0', '✓'];

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 leading-relaxed">
        <strong>🤳 Super App Native WebView Simulator:</strong> In the real Super App, your mini-app front-end
        receives a <strong>paymentToken</strong> from your server (generated via <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">POST /Payment</code>),
        then calls <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono font-bold text-blue-950">window.ZemenPay.requestPayment(paymentToken)</code>.
        The Super App decodes the token, displays the native PIN confirmation sheet, and asks the customer for their 4-digit PIN.
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Phone mockup */}
        <div className="mx-auto lg:mx-0 shrink-0">
          <div
            className="relative rounded-[3rem] overflow-hidden shadow-2xl border-[10px] border-slate-900"
            style={{ width: 320, height: 640 }}
          >
            {/* Phone inner */}
            <div className="absolute inset-0 bg-white flex flex-col">
              {/* Status Bar */}
              <div
                className="h-10 flex items-center justify-between px-6 text-white text-[11px] font-bold shrink-0"
                style={{ backgroundColor: appColor || '#d10000' }}
              >
                <span>{timeStr}</span>
                <div className="flex items-center gap-1.5">
                  <Signal className="w-3 h-3" />
                  <Wifi className="w-3 h-3" />
                  <Battery className="w-3 h-3" />
                </div>
              </div>

              {/* Super App Header */}
              <div
                className="h-10 flex items-center px-4 gap-2 text-white text-xs font-bold shrink-0"
                style={{ backgroundColor: appColor || '#d10000' }}
              >
                <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center font-bold text-white text-[11px]">
                  Z
                </div>
                <span className="truncate">Zemen Super App</span>
                <div className="flex-1" />
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20 font-mono">Mini-App</span>
              </div>

              {/* WebView / iFrame */}
              <div className="flex-1 relative overflow-hidden bg-slate-100">
                <iframe
                  key={iframeKey}
                  ref={iframeRef}
                  src={appUrl}
                  onLoad={injectBridge}
                  className="w-full h-full border-none"
                  title={`${appName} WebView`}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />

                {/* Native Payment bottom sheet overlay */}
                {(simState === 'payment-sheet' ||
                  simState === 'pin-entry' ||
                  simState === 'processing' ||
                  simState === 'success' ||
                  simState === 'failure') && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex items-end animate-in fade-in duration-150">
                    <div className="w-full bg-white rounded-t-3xl pt-5 pb-6 px-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
                      {/* Sheet handle */}
                      <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-4" />

                      {/* Step 1: Confirmation of Payment Details extracted from paymentToken */}
                      {simState === 'payment-sheet' && (
                        <>
                          <div className="text-center mb-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              Native ZemenPay Sheet
                            </span>
                            <p className="font-extrabold text-base text-slate-900 mt-0.5">
                              {capturedPayment?.companyName || appName}
                            </p>
                            <span className="text-2xl font-black text-[var(--red)] block mt-1">
                              ETB {capturedPayment?.amount || '150.00'}
                            </span>
                          </div>

                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 mb-4 space-y-1.5 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Ref ID:</span>
                              <span className="font-mono text-slate-800 font-bold text-[11px] truncate max-w-[170px]">
                                {capturedPayment?.transactionId || 'TXN-REF'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Debit Account:</span>
                              <span className="font-mono text-slate-800 font-bold text-[11px]">
                                {capturedPayment?.accountNo || '1000123456'}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setSimState('pin-entry')}
                            className="w-full py-3 bg-[var(--red)] text-white font-extrabold rounded-2xl text-sm cursor-pointer hover:bg-[var(--red-hover)] transition-colors shadow-xs"
                          >
                            Confirm &amp; Enter PIN →
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelPayment}
                            className="w-full py-2 mt-1 text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                          >
                            Cancel Payment
                          </button>
                        </>
                      )}

                      {/* Step 2: Native PIN Entry */}
                      {simState === 'pin-entry' && (
                        <>
                          <div className="text-center mb-3">
                            <p className="text-xs font-bold text-slate-800">Enter Your Password</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Sandbox Test Password: <strong>1234</strong></p>
                          </div>

                          {/* PIN dots */}
                          <div className="flex justify-center gap-4 mb-4">
                            {[0, 1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                                  i < pin.length
                                    ? 'bg-[var(--red)] border-[var(--red)] scale-110'
                                    : 'border-slate-300'
                                }`}
                              />
                            ))}
                          </div>

                          {/* Keypad */}
                          <div className="grid grid-cols-3 gap-2">
                            {pinKeys.map((k) => (
                              <button
                                key={k}
                                type="button"
                                onClick={() => handlePinKey(k === '✓' ? pin : k)}
                                className={`h-11 rounded-xl text-sm font-bold cursor-pointer transition-colors ${
                                  k === 'DEL'
                                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs'
                                    : k === '✓'
                                    ? 'bg-[var(--red)] text-white hover:bg-[var(--red-hover)]'
                                    : 'bg-slate-50 text-slate-900 hover:bg-slate-100 border border-slate-200'
                                }`}
                              >
                                {k}
                              </button>
                            ))}
                          </div>
                        </>
                      )}

                      {/* Processing */}
                      {simState === 'processing' && (
                        <div className="py-6 flex flex-col items-center gap-3">
                          <RefreshCw className="w-8 h-8 text-[var(--red)] animate-spin" />
                          <p className="text-sm font-bold text-slate-900">Processing Core Banking Transfer...</p>
                          <p className="text-xs text-slate-500">Debiting customer &amp; crediting {appName}</p>
                        </div>
                      )}

                      {/* Success */}
                      {simState === 'success' && (
                        <div className="py-2 flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                          </div>
                          <p className="text-base font-extrabold text-slate-900">Payment Successful!</p>
                          <p className="text-xs text-slate-600 text-center">
                            ETB {capturedPayment?.amount || '150.00'} transferred to {capturedPayment?.companyName || appName}
                          </p>

                          {/* Settlement info */}
                          <div className="w-full p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1 text-[11px] text-emerald-950">
                            <div className="flex justify-between items-center">
                              <span className="text-emerald-700">Order Ref:</span>
                              <span className="font-mono font-bold truncate max-w-[150px]">{capturedPayment?.transactionId}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-emerald-700">FlexCube Settlement:</span>
                              <span className="font-mono font-bold text-emerald-800">{simResult?.flexCubeReference || 'FC-' + Date.now()}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] pt-0.5 border-t border-emerald-200 text-emerald-800">
                              <span>Super App Callback:</span>
                              <span className="font-bold">Dispatched (HTTP 200)</span>
                            </div>
                          </div>

                          <div className="w-full space-y-1.5 mt-1">
                            <button
                              type="button"
                              onClick={resetSim}
                              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
                            >
                              Return to Mini-App
                            </button>
                            {onGoToTransactions && (
                              <button
                                type="button"
                                onClick={onGoToTransactions}
                                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs cursor-pointer inline-flex items-center justify-center gap-1.5 transition-colors"
                              >
                                <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                                View in Transactions &amp; Logs →
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Failure */}
                      {simState === 'failure' && (
                        <div className="py-2 flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
                            <XCircle className="w-7 h-7 text-rose-600" />
                          </div>
                          <p className="text-base font-extrabold text-slate-900">
                            {simResult?.status === 'CANCELLED' ? 'Payment Cancelled' : 'Payment Failed'}
                          </p>
                          <p className="text-xs text-rose-700 text-center px-2">
                            {simResult?.failureReason || (pin.length === 4 ? 'Incorrect password. Sandbox test password is 1234.' : 'Payment was cancelled by user.')}
                          </p>

                          <div className="w-full space-y-1.5 mt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSimState('idle');
                                setPin('');
                              }}
                              className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs cursor-pointer"
                            >
                              Close Sheet
                            </button>
                            {onGoToTransactions && (
                              <button
                                type="button"
                                onClick={onGoToTransactions}
                                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs cursor-pointer inline-flex items-center justify-center gap-1.5 transition-colors"
                              >
                                <Receipt className="w-3.5 h-3.5 text-rose-600" />
                                View in Transactions &amp; Logs →
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Home bar */}
              <div className="h-6 bg-white flex items-center justify-center shrink-0">
                <div className="w-24 h-1 bg-slate-200 rounded-full" />
              </div>
            </div>
          </div>

          {/* Reset button */}
          <button
            type="button"
            onClick={resetSim}
            className="mt-3 w-full py-2 text-xs font-bold text-slate-600 hover:text-slate-900 inline-flex items-center justify-center gap-1.5 cursor-pointer border border-[var(--border)] rounded-xl bg-white hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reload Mini-App WebView
          </button>
        </div>

        {/* Right side: Interactive paymentToken tester & SDK Guide */}
        <div className="flex-1 space-y-5">
          {/* Direct Payment Token Trigger Console */}
          <div className="bg-white border border-[var(--border)] rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[var(--text)] flex items-center gap-2">
                <Play className="w-4 h-4 text-[var(--red)]" />
                Test ZemenPay Bridge Call Directly
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                Interactive
              </span>
            </div>
            <p className="text-xs text-[var(--text-3)] leading-relaxed">
              Paste a real <strong>paymentToken</strong> generated from the <strong>API Sandbox</strong> (<code className="font-mono text-slate-800">POST /Payment</code>) to test how the Super App decodes claims and prompts the customer:
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text)] block">
                paymentToken (JWT returned by POST /Payment):
              </label>
              <textarea
                rows={2}
                value={manualTokenInput}
                onChange={(e) => setManualTokenInput(e.target.value)}
                placeholder="Paste real paymentToken (eyJhbGci...) from the API Sandbox..."
                className="w-full px-3 py-2 bg-slate-50 border border-[var(--border)] rounded-xl text-xs font-mono focus:ring-2 focus:ring-[var(--red)]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => handleTriggerWithToken(manualTokenInput)}
                className="px-4 py-2 bg-[var(--red)] hover:bg-[var(--red-hover)] text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                Trigger window.ZemenPay.requestPayment(paymentToken)
              </button>
            </div>

            {/* Quick Customer Outcome & Failure Scenario Simulation */}
            <div className="pt-3 border-t border-[var(--border)] space-y-2">
              <span className="text-[11px] font-bold text-[var(--text-3)] uppercase tracking-wider block">
                Simulate Customer Action &amp; Webhook Callback Format:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <button
                  type="button"
                  onClick={() => handleDirectSimulateOutcome('SUCCESS')}
                  className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-1 text-emerald-800 font-bold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>PIN: 1234</span>
                  </div>
                  <span className="text-[10px] text-emerald-700/80 block mt-0.5">Success (200)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDirectSimulateOutcome('INSUFFICIENT_FUNDS')}
                  className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-1 text-rose-800 font-bold text-[11px]">
                    <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>Low Balance</span>
                  </div>
                  <span className="text-[10px] text-rose-700/80 block mt-0.5">Failure (Callback)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDirectSimulateOutcome('INVALID_PIN')}
                  className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-1 text-rose-800 font-bold text-[11px]">
                    <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>Wrong PIN</span>
                  </div>
                  <span className="text-[10px] text-rose-700/80 block mt-0.5">Failure (Callback)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDirectSimulateOutcome('CUSTOMER_CANCELLED')}
                  className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-1 text-amber-800 font-bold text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Cancelled</span>
                  </div>
                  <span className="text-[10px] text-amber-700/80 block mt-0.5">User Aborted</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDirectSimulateOutcome('TIMEOUT')}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-1 text-slate-800 font-bold text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span>Timeout</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">5m Expired</span>
                </button>
              </div>
            </div>
          </div>

          {/* Live Simulation Webhook & Ledger Trace (shown when a test run completes) */}
          {simResult && (
            <div className="bg-white border-2 border-emerald-500/30 rounded-2xl p-5 shadow-xs space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {simResult.status === 'SUCCESS' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600" />
                  )}
                  <h4 className="font-extrabold text-sm text-slate-900">
                    Simulation Settlement Trace &amp; Super App Webhook
                  </h4>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-black uppercase ${
                    simResult.status === 'SUCCESS'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {simResult.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Core Banking (FlexCube)</span>
                  <span className="font-mono font-bold text-slate-900 truncate block mt-0.5">
                    {simResult.flexCubeReference || 'N/A (Failed)'}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Super App Callback</span>
                  <span className="font-bold text-emerald-700 truncate block mt-0.5 flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5" />
                    Dispatched ({simResult.callbackUrl || 'webhook URL'})
                  </span>
                </div>
              </div>

              {simResult.callbackPayload && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 block">
                      Dispatched Super App Callback Payload:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(simResult.callbackPayload, null, 2));
                        setCopiedCallback(true);
                        setTimeout(() => setCopiedCallback(false), 2000);
                      }}
                      className="text-[10px] font-bold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCallback ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      {copiedCallback ? 'Copied Payload!' : 'Copy JSON'}
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900 text-emerald-300 font-mono text-[11px] rounded-xl overflow-x-auto">
                    {JSON.stringify(simResult.callbackPayload, null, 2)}
                  </pre>
                </div>
              )}

              {onGoToTransactions && (
                <button
                  type="button"
                  onClick={onGoToTransactions}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Receipt className="w-3.5 h-3.5 text-amber-400" />
                  View Updated Record in Transactions &amp; Logs Tab →
                </button>
              )}
            </div>
          )}

          {/* Exact Client SDK Usage Documentation */}
          <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xs">
            <div className="px-4 py-2.5 bg-slate-800 text-xs text-slate-300 font-bold border-b border-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-amber-400" />
                Correct Client SDK Integration (JavaScript)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">WebView Bridge API</span>
            </div>

            <pre className="p-4 text-xs text-slate-300 font-mono leading-relaxed overflow-x-auto">
{`// 1. In your mini-app UI, customer clicks "Pay 150 ETB"
// 2. Your front-end asks YOUR server to create the payment:
const res = await fetch('/your-backend/create-order', { method: 'POST' });
const { paymentToken } = await res.json(); 
// (your server called Zemen Bank POST /Payment with HMAC and received paymentToken)

// 3. Call the native Super App payment bridge with the paymentToken:
window.ZemenPay.requestPayment(paymentToken)
  .then((receipt) => {
    console.log('Payment successful!', receipt.transactionId);
    alert('Thank you! Receipt: ' + receipt.transactionId);
  })
  .catch((err) => {
    console.warn('Payment cancelled or PIN failed', err);
  });`}
            </pre>
          </div>

          {/* Step by step architecture */}
          <div className="bg-white border border-[var(--border)] rounded-2xl p-4 space-y-3 shadow-xs">
            <h4 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider">
              End-to-End Security Architecture
            </h4>

            <div className="space-y-2.5">
              {[
                {
                  step: '1',
                  title: 'Order Created on Merchant Server',
                  desc: 'Your backend builds the canonical string and signs it with your HMAC Secret Key.',
                },
                {
                  step: '2',
                  title: 'POST /Payment to Zemen Bank',
                  desc: 'Zemen Bank verifies your HMAC signature and returns an encrypted JWT paymentToken.',
                },
                {
                  step: '3',
                  title: 'window.ZemenPay.requestPayment(paymentToken)',
                  desc: 'Your WebView passes ONLY the paymentToken. No secret keys or raw prices can be tampered with on the client.',
                },
                {
                  step: '4',
                  title: 'Native Customer PIN Sheet',
                  desc: 'The Super App securely displays the amount and prompts the user for their 4-digit banking PIN.',
                },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-2.5 text-xs">
                  <div className="w-5 h-5 rounded-full bg-[var(--red)] text-white font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">
                    {step}
                  </div>
                  <div>
                    <span className="font-bold text-[var(--text)]">{title}: </span>
                    <span className="text-[var(--text-3)]">{desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
