'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Copy, Check, RefreshCw, ChevronDown, Eye, EyeOff, Key, Lock } from 'lucide-react';

interface SignaturePlaygroundProps {
  secretKey: string;
  appId: string;
  appName?: string;
}

type LangKey = 'nodejs' | 'python' | 'php';

export const SignaturePlayground: React.FC<SignaturePlaygroundProps> = ({ secretKey, appId, appName = 'Ride Ethiopia' }) => {
  const [customKey, setCustomKey] = useState<string>(secretKey || 'DEMO_SANDBOX_KEY_zemen_2026');
  const [showKey, setShowKey] = useState<boolean>(true);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  useEffect(() => {
    if (secretKey) {
      setCustomKey(secretKey);
    }
  }, [secretKey]);

  const copyKeyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };
  const [fields, setFields] = useState({
    accountNo: '1000123456',
    amount: '150.00',
    companyName: appName,
    callBackURL: 'https://ride.et/callback',
    transactionId: 'TXN-' + Date.now(),
    transactionTime: new Date().toISOString(),
  });

  const [hmacResult, setHmacResult] = useState<{ signingString: string; signature: string } | null>(null);
  const [computing, setComputing] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [copiedSig, setCopiedSig] = useState(false);
  const [activeTab, setActiveTab] = useState<LangKey>('nodejs');

  const computeHmac = useCallback(async () => {
    setComputing(true);
    try {
      // Build the canonical signing string as defined in MiniAppController:
      // accountNo:amount:companyName:callBackURL:transactionId:transactionTime
      const signingString = `${fields.accountNo}:${fields.amount}:${fields.companyName}:${fields.callBackURL}:${fields.transactionId}:${fields.transactionTime}`;

      // Use Web Crypto API to compute HMAC-SHA256
      const encoder = new TextEncoder();
      const keyData = encoder.encode(customKey);
      const messageData = encoder.encode(signingString);

      const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const signatureBuffer = await window.crypto.subtle.sign('HMAC', cryptoKey, messageData);
      const signatureHex = Array.from(new Uint8Array(signatureBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      setHmacResult({ signingString, signature: signatureHex });
    } catch (e) {
      console.error('HMAC error', e);
    } finally {
      setComputing(false);
    }
  }, [fields, customKey]);

  const copyToClipboard = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const codeSnippets: Record<LangKey, string> = {
    nodejs: `const crypto = require('crypto');

// Merchant HMAC Secret Key from Developer Portal:
const SECRET_KEY = '${customKey}';

function createPaymentSignature({ accountNo, amount, companyName, callBackURL, transactionId, transactionTime }) {
  // Canonical colon-delimited format required by Zemen Bank:
  const rawString = \`\${accountNo}:\${amount}:\${companyName}:\${callBackURL}:\${transactionId}:\${transactionTime}\`;
  
  return crypto
    .createHmac('sha256', SECRET_KEY)
    .update(rawString)
    .digest('hex');
}

// Example usage:
const signature = createPaymentSignature({
  accountNo: '${fields.accountNo}',
  amount: '${fields.amount}',
  companyName: '${fields.companyName}',
  callBackURL: '${fields.callBackURL}',
  transactionId: '${fields.transactionId}',
  transactionTime: '${fields.transactionTime}',
});

// Send in POST /Payment payload:
// { ..., "signature": signature }`,

    python: `import hmac
import hashlib

SECRET_KEY = '${customKey}'

def create_payment_signature(account_no, amount, company_name, callback_url, transaction_id, transaction_time):
    # Canonical colon-delimited format required by Zemen Bank:
    raw_string = f"{account_no}:{amount}:{company_name}:{callback_url}:{transaction_id}:{transaction_time}"
    
    return hmac.new(
        SECRET_KEY.encode('utf-8'),
        raw_string.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

# Example usage:
signature = create_payment_signature(
    account_no='${fields.accountNo}',
    amount='${fields.amount}',
    company_name='${fields.companyName}',
    callback_url='${fields.callBackURL}',
    transaction_id='${fields.transactionId}',
    transaction_time='${fields.transactionTime}'
)

# Send in POST /Payment payload:
# { ..., "signature": signature }`,

    php: `<?php
define('SECRET_KEY', '${customKey}');

function create_payment_signature($accountNo, $amount, $companyName, $callbackUrl, $transactionId, $transactionTime) {
    // Canonical colon-delimited format required by Zemen Bank:
    $rawString = "{$accountNo}:{$amount}:{$companyName}:{$callbackUrl}:{$transactionId}:{$transactionTime}";
    
    return hash_hmac('sha256', $rawString, SECRET_KEY);
}

// Example usage:
$signature = create_payment_signature(
    '${fields.accountNo}',
    '${fields.amount}',
    '${fields.companyName}',
    '${fields.callBackURL}',
    '${fields.transactionId}',
    '${fields.transactionTime}'
);

// Send in POST /Payment payload:
// ['signature' => $signature]
?>`,
  };

  const tabLabels: Record<LangKey, string> = {
    nodejs: 'Node.js',
    python: 'Python',
    php: 'PHP',
  };

  return (
    <div className="space-y-6">
      {/* How it works callout */}
      <div className="p-4 bg-[var(--red-pale)] border border-red-200 rounded-2xl text-xs text-[var(--red)] leading-relaxed">
        <strong>HMAC-SHA256 Signature Specification:</strong> Zemen Bank protects payment requests against tampering by
        requiring an HMAC-SHA256 hash over the canonical string:{' '}
        <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-red-300">
          accountNo:amount:companyName:callBackURL:transactionId:transactionTime
        </code>. The bank verifies this signature with your secret key before releasing any customer funds.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Fields */}
        <div className="bg-white border border-[var(--border)] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[var(--text)]">1. Enter Payment Request Fields</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              HMAC SHA-256
            </span>
          </div>

          {/* Prominent Secret Key Field */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[var(--red)]" />
                Secret Key (HMAC Signer)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 cursor-pointer"
                >
                  {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {showKey ? 'Hide' : 'Reveal'}
                </button>
                <button
                  type="button"
                  onClick={() => copyKeyToClipboard(customKey)}
                  className="text-[11px] font-bold text-blue-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copiedKey ? 'Copied!' : 'Copy Key'}
                </button>
              </div>
            </div>
            <input
              type={showKey ? 'text' : 'password'}
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 select-all"
              placeholder="Enter secret key..."
            />
            <p className="text-[10px] text-slate-400">
              This 256-bit secret is used to sign the canonical payload string.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[var(--text)] block mb-1">Customer Account No</label>
              <input
                type="text"
                value={fields.accountNo}
                onChange={(e) => setFields({ ...fields, accountNo: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-[var(--border)] rounded-xl text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--text)] block mb-1">Amount (ETB)</label>
              <input
                type="text"
                value={fields.amount}
                onChange={(e) => setFields({ ...fields, amount: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-[var(--border)] rounded-xl text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--text)] block mb-1">Company / Mini-App Name</label>
              <input
                type="text"
                value={fields.companyName}
                onChange={(e) => setFields({ ...fields, companyName: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-[var(--border)] rounded-xl text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--text)] block mb-1">Callback URL</label>
              <input
                type="text"
                value={fields.callBackURL}
                onChange={(e) => setFields({ ...fields, callBackURL: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-[var(--border)] rounded-xl text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--text)] block mb-1">Transaction ID</label>
              <input
                type="text"
                value={fields.transactionId}
                onChange={(e) => setFields({ ...fields, transactionId: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-[var(--border)] rounded-xl text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--text)] block mb-1">Transaction Time (UTC)</label>
              <input
                type="text"
                value={fields.transactionTime}
                onChange={(e) => setFields({ ...fields, transactionTime: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-[var(--border)] rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={computeHmac}
            disabled={computing}
            className="w-full py-2.5 bg-[var(--red)] hover:bg-[var(--red-hover)] text-white rounded-xl font-bold text-xs inline-flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs disabled:opacity-60 mt-2"
          >
            {computing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
            {computing ? 'Computing...' : 'Compute HMAC-SHA256 Signature →'}
          </button>
        </div>

        {/* Result */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-300">2. Computed Output</h3>

          {hmacResult ? (
            <>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1.5">
                  Canonical Colon-Delimited String
                </span>
                <div className="bg-black/40 border border-slate-700 rounded-xl px-3.5 py-2.5">
                  <code className="font-mono text-xs text-sky-300 break-all">{hmacResult.signingString}</code>
                </div>
                <p className="text-[10px] text-slate-600 mt-1">Format: accountNo:amount:companyName:callBackURL:transactionId:transactionTime</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                    HMAC-SHA256 Signature (hex)
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(hmacResult.signature, setCopiedSig)}
                    className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-bold rounded inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copiedSig ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedSig ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="bg-black/40 border border-slate-700 rounded-xl px-3.5 py-2.5">
                  <code className="font-mono text-xs text-amber-300 break-all">{hmacResult.signature}</code>
                </div>
                <p className="text-[10px] text-slate-600 mt-1">Pass this as the <code className="text-slate-400">signature</code> field in POST /Payment.</p>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-400 font-medium">
                <Check className="w-3.5 h-3.5 shrink-0" />
                Valid HMAC signature matching Zemen Bank core backend algorithm.
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center py-12 text-slate-600 text-xs text-center">
              <div>
                <ChevronDown className="w-6 h-6 mx-auto mb-2 text-slate-700" />
                Fill in the fields on the left and click<br />
                <strong className="text-slate-400">&quot;Compute HMAC-SHA256 Signature&quot;</strong>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Code Snippets */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        {/* Tabs */}
        <div className="flex items-center border-b border-slate-800 px-4 pt-3 gap-0.5">
          {(Object.keys(tabLabels) as LangKey[]).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setActiveTab(lang)}
              className={`px-4 py-2 text-xs font-bold rounded-t-lg cursor-pointer transition-colors ${
                activeTab === lang
                  ? 'bg-slate-800 text-white border-b-2 border-[var(--red)]'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tabLabels[lang]}
            </button>
          ))}
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => copyToClipboard(codeSnippets[activeTab], setCopiedSnippet)}
            className="mb-1.5 px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white text-[11px] font-bold rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
          >
            {copiedSnippet ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copiedSnippet ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Code Block */}
        <pre className="p-5 text-xs text-slate-300 font-mono overflow-x-auto leading-relaxed">
          <code>{codeSnippets[activeTab]}</code>
        </pre>
      </div>
    </div>
  );
};
