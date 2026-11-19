'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Play,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Zap,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Code2,
  Lock,
  Globe,
  Sliders,
  Terminal,
  FileCode,
  Layers,
  RotateCcw,
  Info,
  BookOpen,
  ChevronRight,
  FileText,
  Key,
  Smartphone,
  Clock,
} from 'lucide-react';
import { MiniAppAdmin } from '@/types/miniapp';
import { AdminApiService } from '@/services/api';

interface ApiSandboxProps {
  app: MiniAppAdmin;
  onGoToSimulator?: (paymentToken?: string) => void;
  onRequestGoLive?: () => void;
  onGoToTransactions?: () => void;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5164';

type EndpointId = 'generateToken' | 'validate' | 'samplePayment' | 'payment';

interface EndpointConfig {
  id: EndpointId;
  name: string;
  method: 'GET' | 'POST';
  path: string;
  summary: string;
  desc: string;
  tagColor: string;
  parameters: {
    name: string;
    type: string;
    in: 'query' | 'header' | 'body';
    required: boolean;
    desc: string;
  }[];
  responses: {
    status: number;
    title: string;
    example: any;
  }[];
}

const ENDPOINTS: EndpointConfig[] = [
  {
    id: 'generateToken',
    name: 'Sample Token',
    method: 'GET',
    path: '/Test/GenerateSampleUserToken',
    summary: 'Sandbox helper: Simulate Super App customer launch token',
    desc: 'Simulates the launch token issued by the Super App so you can test /Validate and /Payment in this sandbox. In production, this token is passed automatically by the Super App upon launch.',
    tagColor: 'bg-amber-600',
    parameters: [
      {
        name: 'phone',
        type: 'string',
        in: 'query',
        required: false,
        desc: 'Simulated customer phone number (default: 0911223344).',
      },
      {
        name: 'cif',
        type: 'string',
        in: 'query',
        required: false,
        desc: 'Simulated customer CIF number (default: CIF0012345).',
      },
      {
        name: 'fullName',
        type: 'string',
        in: 'query',
        required: false,
        desc: 'Simulated customer full name (default: Abebe Kebede).',
      },
      {
        name: 'email',
        type: 'string',
        in: 'query',
        required: false,
        desc: 'Optional customer email address (omitted if blank).',
      },
    ],
    responses: [
      {
        status: 200,
        title: 'Test Token Generated',
        example: {
          message: 'Use this token in GET /Validate or in POST /Payment',
          token: 'eyJhbGciOiJIUzI1NiIs...',
          cif: 'CIF0012345',
          phone: '0911223344',
          fullName: 'Abebe Kebede',
        },
      },
    ],
  },
  {
    id: 'validate',
    name: 'Validate Token',
    method: 'GET',
    path: '/Validate',
    summary: 'Verify customer launch token and extract customer identity',
    desc: 'Validates the single-use JWT launch token passed by the Super App upon mini-app opening. Returns customer profile claims and marks the token as consumed to prevent replay attacks.',
    tagColor: 'bg-blue-600',
    parameters: [
      {
        name: 'token',
        type: 'string',
        in: 'query',
        required: true,
        desc: 'Single-use customer launch JWT delivered by the Super App (or pass via Authorization header).',
      },
      {
        name: 'Authorization',
        type: 'string',
        in: 'header',
        required: false,
        desc: "Alternative: 'Bearer <token>' standard HTTP authorization header.",
      },
    ],
    responses: [
      {
        status: 200,
        title: 'Customer Identity Verified',
        example: {
          valid: true,
          phone: '0911223344',
          fullName: 'Abebe Kebede',
          cif: 'CIF0012345',
          email: 'customer@example.com',
        },
      },
      {
        status: 401,
        title: 'Unauthorized / Token Invalid',
        example: {
          valid: false,
          error: 'Token has already been consumed (single-use launch code).',
        },
      },
    ],
  },
  {
    id: 'samplePayment',
    name: 'Pre-Signed Sample',
    method: 'GET',
    path: '/Test/GetSamplePaymentRequest',
    summary: 'Sandbox helper: Retrieve a mathematically signed payload',
    desc: 'Generates a ready-to-test PaymentRequestModel payload with a verified HMAC signature computed by the backend for your mini-app.',
    tagColor: 'bg-purple-600',
    parameters: [
      {
        name: 'companyName',
        type: 'string',
        in: 'query',
        required: true,
        desc: 'Your registered mini-app name.',
      },
      {
        name: 'amount',
        type: 'string',
        in: 'query',
        required: false,
        desc: 'Sample payment amount (default: 150.00).',
      },
    ],
    responses: [
      {
        status: 200,
        title: 'Sample Pre-Signed Request',
        example: {
          message: 'Copy this payload and POST to /Payment',
          canonicalString: '1000123456:150.00:Ride Ethiopia:https://ride.et/callback:TXN-...:...',
          payload: {
            companyName: 'Ride Ethiopia',
            amount: '150.00',
            accountNo: '1000123456',
            callBackURL: 'https://ride.et/callback',
            transactionId: 'TXN-1715000001',
            transactionTime: '1715000000',
            token: 'eyJh...',
            signature: 'a8f3b0c51d9e4a7b8c...',
          },
        },
      },
    ],
  },
  {
    id: 'payment',
    name: 'Initiate Payment',
    method: 'POST',
    path: '/Payment',
    summary: 'Submit signed payment order and receive paymentToken',
    desc: 'Called by your backend when customer checks out. Cryptographically validates your HMAC-SHA256 signature, ensures timestamp freshness (<5 min) and uniqueness (transactionId), and returns an encrypted paymentToken JWT for the native Super App sheet.',
    tagColor: 'bg-emerald-600',
    parameters: [
      {
        name: 'companyName',
        type: 'string',
        in: 'body',
        required: true,
        desc: 'Registered name of your mini-app (e.g. Ride Ethiopia).',
      },
      {
        name: 'amount',
        type: 'string',
        in: 'body',
        required: true,
        desc: 'Decimal amount in ETB as string (e.g. "150.00"). Must be > 0.',
      },
      {
        name: 'accountNo',
        type: 'string',
        in: 'body',
        required: true,
        desc: 'Your corporate holding account where funds will settle.',
      },
      {
        name: 'callBackURL',
        type: 'string',
        in: 'body',
        required: true,
        desc: 'HTTPS webhook URL for server-to-server settlement confirmation.',
      },
      {
        name: 'transactionId',
        type: 'string',
        in: 'body',
        required: true,
        desc: 'Merchant unique transaction reference (enforces idempotency).',
      },
      {
        name: 'transactionTime',
        type: 'string',
        in: 'body',
        required: true,
        desc: 'UTC timestamp (Unix seconds or ISO 8601). Valid within ±5 minutes of server time.',
      },
      {
        name: 'token',
        type: 'string',
        in: 'body',
        required: true,
        desc: 'Customer launch token received in Phase 1.',
      },
      {
        name: 'signature',
        type: 'string',
        in: 'body',
        required: true,
        desc: 'HMAC-SHA256 signature over accountNo:amount:companyName:callBackURL:transactionId:transactionTime using your Secret Key.',
      },
    ],
    responses: [
      {
        status: 200,
        title: 'Payment Token Issued',
        example: {
          code: '0',
          message: 'Token Generated Successfully.',
          token: 'eyJhbGciOiJIUzI1NiIs...jwtPaymentToken...',
        },
      },
      {
        status: 400,
        title: 'Bad Request / Skew or Duplicate',
        example: {
          error: 'Request expired. Timestamp is older than 5 minutes or skewed into the future.',
          code: '2007',
        },
      },
      {
        status: 401,
        title: 'Invalid Signature',
        example: {
          error: 'Invalid signature',
        },
      },
    ],
  },
];

export const ApiSandbox: React.FC<ApiSandboxProps> = ({
  app,
  onGoToSimulator,
  onRequestGoLive,
  onGoToTransactions,
}) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointId>('generateToken');
  const [docsTab, setDocsTab] = useState<'params' | 'responses' | 'code'>('params');
  const [activeResTab, setActiveResTab] = useState<'body' | 'headers' | 'curl'>('body');

  // Shared token state
  const [userToken, setUserToken] = useState<string>('');

  // Editable Token Generator inputs
  const [samplePhone, setSamplePhone] = useState<string>('0911223344');
  const [sampleCif, setSampleCif] = useState<string>('CIF0012345');
  const [sampleFullName, setSampleFullName] = useState<string>('Abebe Kebede');
  const [sampleEmail, setSampleEmail] = useState<string>('');

  // Request configs per endpoint
  const [validateQueryToken, setValidateQueryToken] = useState<string>('');
  const [validateUseHeader, setValidateUseHeader] = useState<boolean>(false);

  // Payment Form
  const [paymentFields, setPaymentFields] = useState({
    companyName: app.uniqueName || app.name || 'demo-store',
    amount: '150.00',
    accountNo: app.holdingAccount || '1000999999',
    callBackURL: 'https://webhook.site/zemen-demo-callback',
    transactionId: 'TXN-' + Date.now(),
    transactionTime: new Date().toISOString(),
    token: '',
    signature: '',
  });

  useEffect(() => {
    setPaymentFields((prev) => ({
      ...prev,
      companyName: app.uniqueName || app.name || 'demo-store',
      accountNo: app.holdingAccount || '1000999999',
    }));
  }, [app]);

  const [autoSignHmac, setAutoSignHmac] = useState<boolean>(true);

  // Execution states
  const [executing, setExecuting] = useState(false);
  const [responseState, setResponseState] = useState<{
    status: number;
    statusText: string;
    timeMs: number;
    body: any;
    headers: Record<string, string>;
    curl: string;
  } | null>(null);

  // Settlement Simulation states (Phase 2 full end-to-end simulation)
  const [settling, setSettling] = useState(false);
  const [settlementResult, setSettlementResult] = useState<{
    status: string;
    flexCubeReference?: string;
    failureCode?: string;
    failureReason?: string;
    callbackPayload?: any;
    callbackDispatched?: boolean;
    callbackUrl?: string;
    message?: string;
  } | null>(null);

  const handleSimulateSettlement = async (
    outcome: 'SUCCESS' | 'INSUFFICIENT_FUNDS' | 'CUSTOMER_CANCELLED' | 'INVALID_PIN' | 'TIMEOUT'
  ) => {
    setSettling(true);
    setSettlementResult(null);
    try {
      const txnId = paymentFields.transactionId || 'TXN-' + Date.now();
      const reasons: Record<string, string> = {
        INSUFFICIENT_FUNDS: 'Customer account has insufficient funds to complete transaction',
        CUSTOMER_CANCELLED: 'Customer tapped cancel on the Super App PIN sheet',
        INVALID_PIN: 'Customer entered incorrect 4-digit PIN',
        TIMEOUT: 'Payment authorization session expired after 5 minutes of inactivity',
      };

      const res = await AdminApiService.simulateSettlement({
        transactionId: txnId,
        outcome: outcome,
        reason: reasons[outcome],
      });

      const resAny = res as any;
      setSettlementResult({
        status: res.status || outcome,
        flexCubeReference: res.flexCubeReference || resAny.callbackPayload?.transaction_reference,
        failureCode: resAny.failureCode || (outcome === 'SUCCESS' ? undefined : outcome),
        failureReason: resAny.failureReason || reasons[outcome],
        callbackPayload: resAny.callbackPayload,
        callbackDispatched: resAny.callbackDispatched,
        callbackUrl: resAny.callbackUrl,
        message: res.message,
      });
    } catch (e: any) {
      alert('Simulation error: ' + (e.message || 'Failed to simulate settlement'));
    } finally {
      setSettling(false);
    }
  };

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to compute HMAC-SHA256 using Web Crypto API
  const computeHmac = useCallback(async (rawString: string, secretKey: string): Promise<string> => {
    try {
      const encoder = new TextEncoder();
      const keyData = encoder.encode(secretKey);
      const messageData = encoder.encode(rawString);

      const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const signatureBuffer = await window.crypto.subtle.sign('HMAC', cryptoKey, messageData);
      return Array.from(new Uint8Array(signatureBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    } catch {
      return '';
    }
  }, []);

  // Canonical string for /Payment (Strict order: accountNo:amount:companyName:callBackURL:transactionId:transactionTime)
  const canonicalPaymentString = `${paymentFields.accountNo}:${paymentFields.amount}:${paymentFields.companyName}:${paymentFields.callBackURL}:${paymentFields.transactionId}:${paymentFields.transactionTime}`;

  // Keep signature updated with partner's secret key when autoSign is enabled
  useEffect(() => {
    if (autoSignHmac && app.encryptionKey) {
      computeHmac(canonicalPaymentString, app.encryptionKey).then((sig) => {
        setPaymentFields((prev) => ({ ...prev, signature: sig }));
      });
    }
  }, [autoSignHmac, canonicalPaymentString, app.encryptionKey, computeHmac]);

  // Keep companyName & account in sync with active app
  useEffect(() => {
    if (app.name) {
      setPaymentFields((prev) => ({
        ...prev,
        companyName: app.name,
        accountNo: app.holdingAccount || prev.accountNo,
      }));
    }
  }, [app.name, app.holdingAccount]);

  // Helper: Generate test user token calling backend helper endpoint
  const fetchSampleUserToken = async () => {
    try {
      const paramsObj: Record<string, string> = {
        cif: sampleCif.trim() || 'CIF0012345',
        phone: samplePhone.trim() || '0911223344',
        fullName: sampleFullName.trim() || 'Abebe Kebede',
      };
      if (sampleEmail.trim()) {
        paramsObj.email = sampleEmail.trim();
      }
      const queryParams = new URLSearchParams(paramsObj);

      const res = await fetch(`${BASE_URL}/Test/GenerateSampleUserToken?${queryParams.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setUserToken(json.token);
      setValidateQueryToken(json.token);
      setPaymentFields((prev) => ({ ...prev, token: json.token }));
      return json.token;
    } catch (e: any) {
      alert('Could not generate sample token: ' + e.message);
      return null;
    }
  };

  // Reset request inputs to defaults
  const handleReset = () => {
    if (selectedEndpoint === 'validate') {
      setValidateQueryToken(userToken);
    } else if (selectedEndpoint === 'payment') {
      setPaymentFields({
        companyName: app.name || 'Ride Ethiopia',
        amount: '150.00',
        accountNo: app.holdingAccount || '1000123456',
        callBackURL: 'https://ride.et/callback',
        transactionId: 'TXN-' + Date.now(),
        transactionTime: new Date().toISOString(),
        token: userToken,
        signature: '',
      });
    } else if (selectedEndpoint === 'generateToken') {
      setSamplePhone('0911223344');
      setSampleCif('CIF0012345');
      setSampleFullName('Abebe Kebede');
      setSampleEmail('');
    }
  };

  // Execute Endpoint
  const handleExecute = async () => {
    setExecuting(true);
    setResponseState(null);
    const startTime = performance.now();

    try {
      let url = `${BASE_URL}`;
      let method = 'GET';
      let headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      let bodyData: any = null;

      if (selectedEndpoint === 'validate') {
        const tok = validateQueryToken.trim() || userToken.trim();
        if (!tok) {
          alert('Please enter or generate a token to test /Validate!');
          setExecuting(false);
          return;
        }

        if (validateUseHeader) {
          url += '/Validate';
          headers['Authorization'] = `Bearer ${tok}`;
        } else {
          url += `/Validate?token=${encodeURIComponent(tok)}`;
        }
      } else if (selectedEndpoint === 'payment') {
        url += '/Payment';
        method = 'POST';
        headers['Content-Type'] = 'application/json';
        bodyData = {
          companyName: paymentFields.companyName,
          amount: paymentFields.amount,
          accountNo: paymentFields.accountNo,
          callBackURL: paymentFields.callBackURL,
          transactionId: paymentFields.transactionId,
          transactionTime: paymentFields.transactionTime,
          token: paymentFields.token || userToken,
          signature: paymentFields.signature,
        };
      } else if (selectedEndpoint === 'generateToken') {
        const paramsObj: Record<string, string> = {
          cif: sampleCif.trim() || 'CIF0012345',
          phone: samplePhone.trim() || '0911223344',
          fullName: sampleFullName.trim() || 'Abebe Kebede',
        };
        if (sampleEmail.trim()) {
          paramsObj.email = sampleEmail.trim();
        }
        const queryParams = new URLSearchParams(paramsObj);
        url += `/Test/GenerateSampleUserToken?${queryParams.toString()}`;
      } else if (selectedEndpoint === 'samplePayment') {
        url += `/Test/GetSamplePaymentRequest?companyName=${encodeURIComponent(app.name)}&amount=150.00`;
      }

      // Build curl string
      let curlCmd = `curl -X ${method} "${url}"`;
      Object.entries(headers).forEach(([k, v]) => {
        curlCmd += ` \\\n  -H "${k}: ${v}"`;
      });
      if (bodyData) {
        curlCmd += ` \\\n  -d '${JSON.stringify(bodyData, null, 2)}'`;
      }

      // Execute fetch
      const fetchOpts: RequestInit = {
        method,
        headers,
      };
      if (bodyData) {
        fetchOpts.body = JSON.stringify(bodyData);
      }

      const res = await fetch(url, fetchOpts);
      const timeMs = Math.round(performance.now() - startTime);

      // Collect response headers
      const resHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => {
        resHeaders[k] = v;
      });

      let jsonBody: any;
      try {
        jsonBody = await res.json();
      } catch {
        jsonBody = await res.text();
      }

      // If we called generateToken, auto-fill token in other tabs
      if (selectedEndpoint === 'generateToken' && jsonBody.token) {
        setUserToken(jsonBody.token);
        setValidateQueryToken(jsonBody.token);
        setPaymentFields((prev) => ({ ...prev, token: jsonBody.token }));
      }

      // If we called samplePayment, auto-fill paymentFields
      if (selectedEndpoint === 'samplePayment' && jsonBody.payload) {
        setPaymentFields({
          companyName: jsonBody.payload.companyName || app.name,
          amount: jsonBody.payload.amount || '150.00',
          accountNo: jsonBody.payload.accountNo || '1000123456',
          callBackURL: jsonBody.payload.callBackURL || 'https://ride.et/callback',
          transactionId: jsonBody.payload.transactionId || 'TXN-' + Date.now(),
          transactionTime: jsonBody.payload.transactionTime || new Date().toISOString(),
          token: jsonBody.payload.token || userToken,
          signature: jsonBody.payload.signature || '',
        });
      }

      setResponseState({
        status: res.status,
        statusText: res.statusText || (res.ok ? 'OK' : 'Error'),
        timeMs,
        body: jsonBody,
        headers: resHeaders,
        curl: curlCmd,
      });
    } catch (err: any) {
      setResponseState({
        status: 0,
        statusText: 'Network Error',
        timeMs: 0,
        body: { error: err.message || 'Failed to reach API endpoint.' },
        headers: {},
        curl: '',
      });
    } finally {
      setExecuting(false);
    }
  };

  const curr = ENDPOINTS.find((e) => e.id === selectedEndpoint) || ENDPOINTS[0];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header (Clean, professional, matching dev.zemenbank.et/sandbox) */}
      <div className="bg-white border border-[var(--border)] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-base font-bold text-[var(--text)]">API Sandbox &amp; Reference</h2>
          </div>
          <p className="text-xs text-[var(--text-3)] mt-0.5">
            Interactive side-by-side API documentation and sandbox testing studio. Inspect endpoint schemas and test real HTTP requests in real-time.
          </p>
        </div>

        {userToken && (
          <div className="flex items-center gap-2 text-xs font-mono bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Active Test Token Loaded</span>
          </div>
        )}
      </div>

      {/* 2. Unified 3-Column Studio matching dev.zemenbank.et:3000/sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Endpoints Navigation (2.5 / 12 cols) */}
        <div className="lg:col-span-3 bg-white border border-[var(--border)] rounded-2xl p-3 shadow-xs space-y-1">
          <div className="px-2.5 py-1.5 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)]">
              Endpoints
            </span>
            <span className="text-[10px] font-mono text-slate-400">{ENDPOINTS.length} APIs</span>
          </div>

          <nav className="space-y-1">
            {ENDPOINTS.map((ep) => {
              const isSelected = selectedEndpoint === ep.id;
              return (
                <button
                  key={ep.id}
                  type="button"
                  onClick={() => {
                    setSelectedEndpoint(ep.id);
                    setResponseState(null);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex flex-col gap-1 border ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-transparent text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono font-bold text-[9px] px-1.5 py-0.5 rounded uppercase ${
                        isSelected ? 'bg-white text-slate-900' : `${ep.tagColor} text-white`
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-semibold truncate">{ep.name}</span>
                  </div>
                  <code
                    className={`text-[10px] font-mono truncate ${
                      isSelected ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {ep.path}
                  </code>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Center Column: Endpoint Reference & Schema Documentation (4.5 / 12 cols) */}
        <div className="lg:col-span-4 bg-white border border-[var(--border)] rounded-2xl shadow-xs overflow-hidden flex flex-col min-h-[550px]">
          {/* Header */}
          <div className="p-4 border-b border-[var(--border)] bg-slate-50/70">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] text-white ${curr.tagColor}`}>
                {curr.method}
              </span>
              <code className="text-xs font-bold text-slate-900 font-mono">{curr.path}</code>
            </div>
            <h3 className="text-sm font-bold text-[var(--text)]">{curr.summary}</h3>
            <p className="text-xs text-[var(--text-3)] mt-1 leading-relaxed">{curr.desc}</p>
          </div>

          {/* Docs Sub-tabs */}
          <div className="flex items-center border-b border-[var(--border)] px-4 bg-white text-xs">
            <button
              type="button"
              onClick={() => setDocsTab('params')}
              className={`py-2 px-2.5 font-semibold border-b-2 transition-colors cursor-pointer text-[11px] ${
                docsTab === 'params'
                  ? 'border-[var(--red)] text-[var(--red)]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Parameters ({curr.parameters.length})
            </button>
            <button
              type="button"
              onClick={() => setDocsTab('responses')}
              className={`py-2 px-2.5 font-semibold border-b-2 transition-colors cursor-pointer text-[11px] ${
                docsTab === 'responses'
                  ? 'border-[var(--red)] text-[var(--red)]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Responses ({curr.responses.length})
            </button>
            <button
              type="button"
              onClick={() => setDocsTab('code')}
              className={`py-2 px-2.5 font-semibold border-b-2 transition-colors cursor-pointer text-[11px] ${
                docsTab === 'code'
                  ? 'border-[var(--red)] text-[var(--red)]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              cURL Example
            </button>
          </div>

          {/* Docs Content Area */}
          <div className="p-4 flex-1 text-xs space-y-4 overflow-y-auto max-h-[580px]">
            {docsTab === 'params' && (
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Request Specifications
                </span>

                <div className="space-y-2.5">
                  {curr.parameters.map((p) => (
                    <div key={p.name} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <code className="font-mono font-bold text-slate-900 text-xs">{p.name}</code>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-mono uppercase bg-slate-200 text-slate-700 px-1 rounded">
                            {p.in}
                          </span>
                          <span
                            className={`text-[9px] font-semibold px-1.5 rounded ${
                              p.required
                                ? 'bg-red-50 text-red-700 font-bold'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {p.required ? 'required' : 'optional'}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-[var(--text-3)] leading-relaxed">{p.desc}</p>
                    </div>
                  ))}
                </div>

                {curr.id === 'payment' && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5 text-xs text-amber-900">
                    <span className="font-bold flex items-center gap-1 text-[11px]">
                      <Key className="w-3.5 h-3.5 text-amber-700" />
                      HMAC Signing Canonical Format:
                    </span>
                    <div className="p-2 bg-white rounded border border-amber-300 font-mono text-[10px] select-all break-all text-amber-950 font-bold">
                      accountNo:amount:companyName:callBackURL:transactionId:transactionTime
                    </div>
                  </div>
                )}
              </div>
            )}

            {docsTab === 'responses' && (
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Expected Responses
                </span>

                <div className="space-y-3">
                  {curr.responses.map((r) => (
                    <div key={r.status} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-900 text-slate-100 font-mono text-[11px]">
                      <div className="p-2.5 bg-slate-800 flex items-center justify-between border-b border-slate-700">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              r.status === 200
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {r.status}
                          </span>
                          <span className="text-slate-300 text-xs font-sans font-semibold">{r.title}</span>
                        </div>
                      </div>
                      <pre className="p-3 overflow-x-auto text-emerald-300 leading-relaxed text-[11px]">
                        {JSON.stringify(r.example, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {docsTab === 'code' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Terminal cURL
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const curl = curr.method === 'GET'
                        ? `curl -X GET "${BASE_URL}${curr.path}"`
                        : `curl -X POST "${BASE_URL}${curr.path}" \\\n  -H "Content-Type: application/json" \\\n  -d '{\\n    "companyName": "${app.name}",\\n    "amount": "150.00"\\n  }'`;
                      copyToClipboard(curl, 'curlDocs');
                    }}
                    className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    {copiedId === 'curlDocs' ? 'Copied' : 'Copy cURL'}
                  </button>
                </div>

                <pre className="p-3 bg-slate-900 text-sky-300 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap">
                  {curr.method === 'GET'
                    ? `curl -X GET "${BASE_URL}${curr.path}" \\\n  -H "Accept: application/json"`
                    : `curl -X POST "${BASE_URL}${curr.path}" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "companyName": "${app.name}",\n    "amount": "150.00",\n    "accountNo": "${app.holdingAccount || '1000123456'}",\n    "callBackURL": "https://api.partner.et/webhook",\n    "transactionId": "TXN-${Date.now()}",\n    "transactionTime": "${Math.floor(Date.now() / 1000)}",\n    "token": "<userLaunchToken>",\n    "signature": "<calculatedHmac>"\n  }'`}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Request Runner & Response Inspector (5 / 12 cols) */}
        <div className="lg:col-span-5 bg-white border border-[var(--border)] rounded-2xl shadow-xs overflow-hidden flex flex-col min-h-[550px]">
          {/* Runner Header */}
          <div className="p-4 border-b border-[var(--border)] bg-slate-50/70 flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 text-[var(--red)]" />
              Live Request Runner
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                title="Reset Inputs"
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleExecute}
                disabled={executing}
                className="px-4 py-1.5 bg-[var(--red)] hover:bg-[var(--red-hover)] text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors disabled:opacity-50"
              >
                {executing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                {executing ? 'Executing...' : 'Send Request'}
              </button>
            </div>
          </div>

          {/* Request Inputs */}
          <div className="p-4 border-b border-[var(--border)] text-xs space-y-3 bg-white max-h-[280px] overflow-y-auto">
            {/* 1. Validate Form */}
            {selectedEndpoint === 'validate' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 text-xs">Customer Launch Token</label>
                  {userToken && (
                    <button
                      type="button"
                      onClick={() => setValidateQueryToken(userToken)}
                      className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer"
                    >
                      ⚡ Use Active Test Token
                    </button>
                  )}
                </div>

                <textarea
                  rows={2}
                  value={validateQueryToken}
                  onChange={(e) => setValidateQueryToken(e.target.value)}
                  placeholder="Paste customer launch token..."
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-[var(--border)] rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-600"
                />

                <label className="flex items-center gap-2 text-slate-600 cursor-pointer text-[11px] font-medium">
                  <input
                    type="checkbox"
                    checked={validateUseHeader}
                    onChange={(e) => setValidateUseHeader(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  Send via <code className="bg-slate-100 px-1 rounded">Authorization: Bearer &lt;token&gt;</code> header
                </label>
              </div>
            )}

            {/* 2. Payment Form */}
            {selectedEndpoint === 'payment' && (
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-800 block text-[11px] mb-0.5">Company Name</label>
                    <input
                      type="text"
                      value={paymentFields.companyName}
                      onChange={(e) => setPaymentFields({ ...paymentFields, companyName: e.target.value })}
                      className="w-full px-2 py-1 bg-slate-50 border border-[var(--border)] rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block text-[11px] mb-0.5">Amount (ETB)</label>
                    <input
                      type="text"
                      value={paymentFields.amount}
                      onChange={(e) => setPaymentFields({ ...paymentFields, amount: e.target.value })}
                      className="w-full px-2 py-1 bg-slate-50 border border-[var(--border)] rounded-lg font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block text-[11px] mb-0.5">Customer Account</label>
                    <input
                      type="text"
                      value={paymentFields.accountNo}
                      onChange={(e) => setPaymentFields({ ...paymentFields, accountNo: e.target.value })}
                      className="w-full px-2 py-1 bg-slate-50 border border-[var(--border)] rounded-lg font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block text-[11px] mb-0.5">Callback URL</label>
                    <input
                      type="text"
                      value={paymentFields.callBackURL}
                      onChange={(e) => setPaymentFields({ ...paymentFields, callBackURL: e.target.value })}
                      className="w-full px-2 py-1 bg-slate-50 border border-[var(--border)] rounded-lg font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block text-[11px] mb-0.5">Transaction ID</label>
                    <input
                      type="text"
                      value={paymentFields.transactionId}
                      onChange={(e) => setPaymentFields({ ...paymentFields, transactionId: e.target.value })}
                      className="w-full px-2 py-1 bg-slate-50 border border-[var(--border)] rounded-lg font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block text-[11px] mb-0.5">Time (UTC)</label>
                    <input
                      type="text"
                      value={paymentFields.transactionTime}
                      onChange={(e) => setPaymentFields({ ...paymentFields, transactionTime: e.target.value })}
                      className="w-full px-2 py-1 bg-slate-50 border border-[var(--border)] rounded-lg font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block text-[11px] mb-0.5">Customer Launch Token</label>
                  <input
                    type="text"
                    value={paymentFields.token}
                    onChange={(e) => setPaymentFields({ ...paymentFields, token: e.target.value })}
                    placeholder="Customer launch token..."
                    className="w-full px-2 py-1 bg-slate-50 border border-[var(--border)] rounded-lg font-mono text-[11px] truncate"
                  />
                </div>

                <div className="p-2.5 bg-slate-50 border border-[var(--border)] rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-500" />
                      HMAC Signature (Signed with Partner Secret)
                    </span>
                    <label className="font-bold text-slate-600 flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoSignHmac}
                        onChange={(e) => setAutoSignHmac(e.target.checked)}
                        className="rounded text-emerald-600"
                      />
                      Auto-sign
                    </label>
                  </div>
                  <input
                    type="text"
                    readOnly={autoSignHmac}
                    value={paymentFields.signature}
                    onChange={(e) => setPaymentFields({ ...paymentFields, signature: e.target.value })}
                    className={`w-full px-2 py-1 rounded font-mono text-[10px] border ${
                      autoSignHmac
                        ? 'bg-slate-100 text-emerald-800 font-bold border-slate-200'
                        : 'bg-white text-slate-900 border-amber-300'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* 3. Generate Token Form */}
            {selectedEndpoint === 'generateToken' && (
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-800 block text-[11px] mb-0.5">Phone Number</label>
                    <input
                      type="text"
                      value={samplePhone}
                      onChange={(e) => setSamplePhone(e.target.value)}
                      className="w-full px-2 py-1 bg-slate-50 border border-[var(--border)] rounded-lg font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block text-[11px] mb-0.5">CIF Number</label>
                    <input
                      type="text"
                      value={sampleCif}
                      onChange={(e) => setSampleCif(e.target.value)}
                      className="w-full px-2 py-1 bg-slate-50 border border-[var(--border)] rounded-lg font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block text-[11px] mb-0.5">Full Name</label>
                    <input
                      type="text"
                      value={sampleFullName}
                      onChange={(e) => setSampleFullName(e.target.value)}
                      className="w-full px-2 py-1 bg-slate-50 border border-[var(--border)] rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block text-[11px] mb-0.5">
                      Email <span className="font-normal text-slate-400 text-[10px]">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      value={sampleEmail}
                      onChange={(e) => setSampleEmail(e.target.value)}
                      placeholder="leave blank if none"
                      className="w-full px-2 py-1 bg-slate-50 border border-[var(--border)] rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. Sample Payment Info */}
            {selectedEndpoint === 'samplePayment' && (
              <div className="text-[11px] text-slate-600 leading-relaxed">
                Click <strong>Send Request</strong> to retrieve a ready-to-test payment payload pre-calculated by the bank backend for <strong>{app.name}</strong>.
              </div>
            )}
          </div>

          {/* Response Inspector Area */}
          <div className="flex-1 bg-slate-900 text-slate-100 flex flex-col min-h-[250px]">
            {/* Response Sub-Header */}
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Response Inspector
              </span>

              {responseState && (
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                      responseState.status === 200
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {responseState.status} {responseState.statusText}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{responseState.timeMs}ms</span>
                </div>
              )}
            </div>

            {/* Response Sub-Tabs */}
            <div className="flex items-center border-b border-slate-800 px-3 text-xs bg-slate-950/60">
              <button
                type="button"
                onClick={() => setActiveResTab('body')}
                className={`py-1.5 px-2.5 font-bold border-b-2 transition-colors cursor-pointer text-[11px] ${
                  activeResTab === 'body'
                    ? 'border-[var(--red)] text-white'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                Body
              </button>
              <button
                type="button"
                onClick={() => setActiveResTab('headers')}
                className={`py-1.5 px-2.5 font-bold border-b-2 transition-colors cursor-pointer text-[11px] ${
                  activeResTab === 'headers'
                    ? 'border-[var(--red)] text-white'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                Headers
              </button>
              <button
                type="button"
                onClick={() => setActiveResTab('curl')}
                className={`py-1.5 px-2.5 font-bold border-b-2 transition-colors cursor-pointer text-[11px] ${
                  activeResTab === 'curl'
                    ? 'border-[var(--red)] text-white'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                cURL
              </button>
            </div>

            {/* Response Body Viewer */}
            <div className="p-3.5 flex-1 font-mono text-xs overflow-x-auto max-h-[220px]">
              {responseState ? (
                <>
                  {activeResTab === 'body' && (
                    <pre className="text-emerald-300 leading-relaxed text-[11px]">
                      {typeof responseState.body === 'object'
                        ? JSON.stringify(responseState.body, null, 2)
                        : String(responseState.body)}
                    </pre>
                  )}

                  {activeResTab === 'headers' && (
                    <div className="space-y-1 text-slate-300 text-[11px]">
                      {Object.entries(responseState.headers).map(([k, v]) => (
                        <div key={k} className="flex justify-between border-b border-slate-800 pb-0.5">
                          <span className="text-slate-500">{k}:</span>
                          <span className="text-right truncate max-w-[180px]">{v}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeResTab === 'curl' && (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(responseState.curl, 'curlRes')}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === 'curlRes' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copiedId === 'curlRes' ? 'Copied' : 'Copy cURL'}
                      </button>
                      <pre className="text-sky-300 leading-relaxed text-[10px] whitespace-pre-wrap">
                        {responseState.curl}
                      </pre>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-center text-xs">
                  <Terminal className="w-6 h-6 mb-1.5 opacity-40" />
                  <span>Click &quot;Send Request&quot; to test</span>
                </div>
              )}
            </div>

            {/* Bottom notification if payment token received */}
            {responseState?.status === 200 && responseState?.body?.token && (
              <div className="p-2.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-2">
                <span className="text-[11px] text-emerald-400 font-bold truncate">paymentToken ready for mobile checkout</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(responseState.body.token, 'tokenBottom')}
                  className="px-3 py-1 bg-emerald-600/80 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs inline-flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                >
                  {copiedId === 'tokenBottom' ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                  {copiedId === 'tokenBottom' ? 'Copied' : 'Copy Token'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* End-to-End Simulation Card: Customer Mobile Experience & Core Banking Settlement */}
      {selectedEndpoint === 'payment' && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-2 border-emerald-500/40 rounded-3xl p-6 shadow-xl space-y-5 animate-in slide-in-from-bottom duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                  Full Payment Flow &amp; Callback Simulation
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                    Interactive
                  </span>
                </h3>
                <p className="text-xs text-slate-300">
                  Test both successful settlements and all failure edge cases. Inspect the real asynchronous webhook callback dispatched to your server:
                </p>
              </div>
            </div>
          </div>

          {/* Quick Simulation Trigger Buttons */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Simulate Customer Action &amp; Core Banking Settlement:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <button
                type="button"
                disabled={settling}
                onClick={() => handleSimulateSettlement('SUCCESS')}
                className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-left cursor-pointer transition-all shadow-xs flex flex-col justify-between group disabled:opacity-50"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    Correct PIN
                  </span>
                  <span className="text-[10px] bg-emerald-700/60 px-1.5 py-0.5 rounded font-mono font-bold">Success</span>
                </div>
                <p className="text-[11px] text-emerald-100 leading-snug">
                  Customer confirms PIN 1234. Debits balance and settles with FlexCube ref.
                </p>
              </button>

              <button
                type="button"
                disabled={settling}
                onClick={() => handleSimulateSettlement('INSUFFICIENT_FUNDS')}
                className="p-3 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-700/60 text-white rounded-2xl text-left cursor-pointer transition-all shadow-xs flex flex-col justify-between group disabled:opacity-50"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-xs text-rose-300 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    Low Balance
                  </span>
                  <span className="text-[10px] bg-rose-900/60 px-1.5 py-0.5 rounded font-mono font-bold text-rose-300">Failure</span>
                </div>
                <p className="text-[11px] text-rose-200/80 leading-snug">
                  Customer account does not have enough funds to cover order.
                </p>
              </button>

              <button
                type="button"
                disabled={settling}
                onClick={() => handleSimulateSettlement('INVALID_PIN')}
                className="p-3 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-700/60 text-white rounded-2xl text-left cursor-pointer transition-all shadow-xs flex flex-col justify-between group disabled:opacity-50"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-xs text-rose-300 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    Wrong PIN
                  </span>
                  <span className="text-[10px] bg-rose-900/60 px-1.5 py-0.5 rounded font-mono font-bold text-rose-300">Failure</span>
                </div>
                <p className="text-[11px] text-rose-200/80 leading-snug">
                  Customer entered incorrect 4-digit banking PIN 3 times.
                </p>
              </button>

              <button
                type="button"
                disabled={settling}
                onClick={() => handleSimulateSettlement('CUSTOMER_CANCELLED')}
                className="p-3 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-700/60 text-white rounded-2xl text-left cursor-pointer transition-all shadow-xs flex flex-col justify-between group disabled:opacity-50"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-xs text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Cancelled
                  </span>
                  <span className="text-[10px] bg-amber-900/60 px-1.5 py-0.5 rounded font-mono font-bold text-amber-300">Abort</span>
                </div>
                <p className="text-[11px] text-amber-200/80 leading-snug">
                  Customer tapped &quot;Cancel&quot; on the native confirmation sheet.
                </p>
              </button>

              <button
                type="button"
                disabled={settling}
                onClick={() => handleSimulateSettlement('TIMEOUT')}
                className="p-3 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-white rounded-2xl text-left cursor-pointer transition-all shadow-xs flex flex-col justify-between group disabled:opacity-50"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-xs text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    Timeout
                  </span>
                  <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded font-mono font-bold text-slate-300">Expired</span>
                </div>
                <p className="text-[11px] text-slate-300/80 leading-snug">
                  Customer did not enter PIN within the 5-minute expiry window.
                </p>
              </button>
            </div>
          </div>

          {/* Settling Spinner */}
          {settling && (
            <div className="p-4 bg-slate-800/80 rounded-2xl flex items-center justify-center gap-3 text-slate-200 text-xs">
              <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
              <span>Simulating Core Banking FlexCube debit and Super App webhook delivery...</span>
            </div>
          )}

          {/* Settlement Results & Callback Payload Inspector */}
          {settlementResult && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  {settlementResult.status === 'SUCCESS' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400" />
                  )}
                  <span className="font-extrabold text-sm text-white">
                    {settlementResult.status === 'SUCCESS'
                      ? 'Payment & Core Banking Settlement Complete'
                      : `Simulation Complete: ${settlementResult.status}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold uppercase ${
                      settlementResult.status === 'SUCCESS'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    Status: {settlementResult.status}
                  </span>
                  {onGoToTransactions && (
                    <button
                      type="button"
                      onClick={onGoToTransactions}
                      className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-lg text-xs inline-flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
                    >
                      View in Ledger <ArrowRight className="w-3 h-3 text-emerald-600" />
                    </button>
                  )}
                </div>
              </div>

              {/* Settlement metadata grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">FlexCube Core Ref</span>
                  <span className="font-mono font-bold text-white text-xs truncate block mt-0.5">
                    {settlementResult.flexCubeReference || 'N/A (Failed)'}
                  </span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Order Reference</span>
                  <span className="font-mono font-bold text-white text-xs truncate block mt-0.5">
                    {paymentFields.transactionId}
                  </span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Super App Callback Dispatch</span>
                  <span className="font-bold text-emerald-400 text-xs block mt-0.5">
                    Dispatched to {paymentFields.callBackURL || 'merchant webhook'}
                  </span>
                </div>
              </div>

              {/* Super App Callback JSON Payload */}
              {settlementResult.callbackPayload && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-amber-400" />
                      Dispatched Super App Webhook Payload (Delivered to Merchant Server):
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(JSON.stringify(settlementResult.callbackPayload, null, 2), 'cbPayload')}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === 'cbPayload' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedId === 'cbPayload' ? 'Copied' : 'Copy Payload'}
                    </button>
                  </div>
                  <pre className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-emerald-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
                    {JSON.stringify(settlementResult.callbackPayload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
