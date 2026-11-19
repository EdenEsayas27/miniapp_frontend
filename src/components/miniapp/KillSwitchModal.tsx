import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';
import { MiniAppAdmin } from '@/types/miniapp';

interface KillSwitchModalProps {
  app: MiniAppAdmin | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleStatus: (id: string, newStatus: 'Active' | 'Suspended', remarks?: string) => Promise<void>;
}

export const KillSwitchModal: React.FC<KillSwitchModalProps> = ({
  app,
  isOpen,
  onClose,
  onToggleStatus,
}) => {
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !app) return null;

  const isSuspending = app.status === 'Active';
  const targetStatus = isSuspending ? 'Suspended' : 'Active';

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onToggleStatus(app.id, targetStatus, remarks);
      setRemarks('');
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 text-white ${
            isSuspending ? 'bg-[#C8102E]' : 'bg-emerald-600'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {isSuspending ? (
              <ShieldAlert className="w-5 h-5" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
            <h3 className="text-base font-bold">
              {isSuspending ? 'Emergency Kill-Switch (Suspend)' : 'Reactivate Mini-App'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <AlertTriangle
              className={`w-5 h-5 shrink-0 mt-0.5 ${
                isSuspending ? 'text-[#C8102E]' : 'text-emerald-600'
              }`}
            />
            <div className="text-xs text-slate-700 leading-relaxed">
              Are you sure you want to {isSuspending ? 'SUSPEND' : 'REACTIVATE'} <strong>{app.name}</strong>?
              {isSuspending ? (
                <span className="block mt-1 text-red-700 font-semibold">
                  This will immediately block all payment requests and launch sessions from the Zemen Super App.
                </span>
              ) : (
                <span className="block mt-1 text-emerald-700 font-semibold">
                  This will restore the app into the Super App catalog and allow customers to transact again.
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Audit Reason / Internal Remarks:
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Temporary merchant maintenance, suspected fraud, compliance request..."
              className="w-full text-sm p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C8102E] focus:outline-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleConfirm}
            className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-xs transition-colors cursor-pointer ${
              isSuspending
                ? 'bg-[#C8102E] hover:bg-[#A30D25]'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {loading
              ? 'Processing...'
              : isSuspending
              ? 'Confirm Suspension (Kill-Switch)'
              : 'Confirm Reactivation'}
          </button>
        </div>
      </div>
    </div>
  );
};
