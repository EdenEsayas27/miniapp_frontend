import React, { useState } from 'react';
import { X, Key, Copy, Check, RefreshCw, AlertTriangle } from 'lucide-react';
import { MiniAppAdmin } from '@/types/miniapp';

interface KeyModalProps {
  app: MiniAppAdmin | null;
  isOpen: boolean;
  onClose: () => void;
  onRegenerateKey: (id: string) => Promise<string>;
}

export const KeyModal: React.FC<KeyModalProps> = ({
  app,
  isOpen,
  onClose,
  onRegenerateKey,
}) => {
  const [copied, setCopied] = useState(false);
  const [currentKey, setCurrentKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmRegen, setShowConfirmRegen] = useState(false);

  if (!isOpen || !app) return null;

  const activeKey = currentKey || app.encryptionKey;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = async () => {
    try {
      setLoading(true);
      const newKey = await onRegenerateKey(app.id);
      setCurrentKey(newKey);
      setShowConfirmRegen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to regenerate key');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentKey(null);
    setShowConfirmRegen(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <Key className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Merchant Secret Key (HMAC-SHA256)</h3>
              <p className="text-xs text-slate-400">{app.name}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Active Encryption Key</span>
              <span className="text-2xs font-mono text-slate-400">48-char hex</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={activeKey}
                className="w-full text-xs font-mono bg-white p-2.5 rounded-lg border border-slate-300 text-slate-900 select-all"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1.5 shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-500 leading-relaxed space-y-1">
            <p>• Used to calculate payment request signatures: <code>accountNo:amount:companyName:callBackURL:transactionId:transactionTime</code></p>
            <p>• Keep this key confidential. Never expose it in client-side code or public repositories.</p>
          </div>

          {/* Key Rotation Confirmation Drawer */}
          {showConfirmRegen ? (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-3 animate-in fade-in duration-150">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900">
                  <strong>Warning:</strong> Regenerating the secret key will immediately invalidate the existing key. Any payments signed with the old key will be rejected until the merchant updates their backend with this new key.
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowConfirmRegen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleRegenerate}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs"
                >
                  {loading ? 'Regenerating...' : 'Yes, Rotate Key'}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowConfirmRegen(true)}
              className="w-full py-2.5 px-3 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              Rotate / Regenerate Secret Key
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-3.5 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
