import React, { useState } from 'react';
import { X, CheckCircle, XCircle, ExternalLink, ShieldCheck, Camera, MapPin, HardDrive, Building2 } from 'lucide-react';
import { MiniAppAdmin } from '@/types/miniapp';

interface ReviewModalProps {
  app: MiniAppAdmin | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, remarks?: string) => Promise<void>;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  app,
  isOpen,
  onClose,
  onApprove,
  onReject,
}) => {
  const [remarks, setRemarks] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !app) return null;

  const handleApprove = async () => {
    try {
      setLoading(true);
      setError(null);
      await onApprove(app.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to approve mini-app');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setLoading(true);
      setError(null);
      await onReject(app.id, remarks);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to reject mini-app');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs"
              style={{ backgroundColor: app.themeColor || '#C8102E' }}
            >
              {(app.name || 'M').charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{app.name || 'Mini-App'}</h3>
              <p className="text-xs text-slate-300">Go-Live Compliance & Security Review</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Quick Notice */}
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <strong>Bank Compliance Notice:</strong> Approving this mini-app will immediately publish it to the <strong>Zemen Super App</strong> production catalog. Verify that the settlement account belongs to the certified corporate entity.
            </div>
          </div>

          {/* Core Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 font-medium block">Category</span>
              <span className="text-sm font-semibold text-slate-900">{app.categoryName || 'Unassigned'}</span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 font-medium block">Unique Slug</span>
              <span className="text-sm font-mono font-semibold text-slate-900">{app.uniqueName || 'N/A'}</span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl col-span-2">
              <span className="text-xs text-slate-500 font-medium block flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-600" />
                Settlement Holding Account (Strict Verification)
              </span>
              <span className="text-base font-mono font-bold text-slate-900 tracking-wider">
                {app.holdingAccount || 'Missing Holding Account!'}
              </span>
              <span className="block text-xs text-emerald-700 font-medium mt-1">
                ✓ Customer payments will settle directly into this account.
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl col-span-2">
              <span className="text-xs text-slate-500 font-medium block mb-1">Mini-App Web Application URL</span>
              <a
                href={app.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-[#C8102E] font-medium hover:underline inline-flex items-center gap-1.5 break-all"
              >
                {app.url}
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>

            {app.description && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl col-span-2">
                <span className="text-xs text-slate-500 font-medium block mb-1">Description</span>
                <p className="text-sm text-slate-700 leading-relaxed">{app.description}</p>
              </div>
            )}
          </div>

          {/* Requested Device Permissions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              Requested Customer Device Permissions
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-semibold ${
                  app.requiresCamera
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                }`}
              >
                <Camera className="w-4 h-4 shrink-0" />
                <span>Camera</span>
              </div>

              <div
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-semibold ${
                  app.requiresLocation
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                }`}
              >
                <MapPin className="w-4 h-4 shrink-0" />
                <span>Location (GPS)</span>
              </div>

              <div
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-semibold ${
                  app.requiresFileAccess
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                }`}
              >
                <HardDrive className="w-4 h-4 shrink-0" />
                <span>File Storage</span>
              </div>
            </div>
          </div>

          {/* Rejection Form Drawer */}
          {showRejectForm && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-3 animate-in fade-in duration-150">
              <label className="text-xs font-bold text-red-900 block">
                Reason for Rejection / Required Modifications:
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Please provide your renewed trade license and update your checkout URL..."
                rows={3}
                className="w-full text-sm p-3 bg-white border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleReject}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg shadow-xs"
                >
                  {loading ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
          {!showRejectForm ? (
            <>
              <button
                type="button"
                onClick={() => setShowRejectForm(true)}
                className="px-4 py-2.5 text-xs font-bold text-red-700 hover:bg-red-50 border border-red-200 rounded-xl transition-colors inline-flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                Reject Application
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleApprove}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  {loading ? 'Approving...' : 'Approve & Go Live in Super App'}
                </button>
              </div>
            </>
          ) : (
            <div className="text-xs text-slate-500">Provide remarks to inform the partner why their application was rejected.</div>
          )}
        </div>
      </div>
    </div>
  );
};
