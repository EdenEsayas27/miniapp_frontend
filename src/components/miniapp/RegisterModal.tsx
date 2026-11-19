import React, { useState } from 'react';
import { X, Check, Copy, PlusCircle, Building2, KeyRound } from 'lucide-react';
import { Category, CreateMiniAppPayload, MiniAppAdmin } from '@/types/miniapp';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onRegister: (payload: CreateMiniAppPayload) => Promise<MiniAppAdmin>;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  categories,
  onRegister,
}) => {
  const [name, setName] = useState('');
  const [uniqueName, setUniqueName] = useState('');
  const [url, setUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [holdingAccount, setHoldingAccount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [themeColor, setThemeColor] = useState('#C8102E');
  const [requiresCamera, setRequiresCamera] = useState(false);
  const [requiresLocation, setRequiresLocation] = useState(false);
  const [requiresFileAccess, setRequiresFileAccess] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdApp, setCreatedApp] = useState<MiniAppAdmin | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('App Name is required.');
      return;
    }

    if (!url.trim()) {
      setError('Mini-App URL is required.');
      return;
    }

    if (!holdingAccount.trim()) {
      setError('Settlement Holding Account is required.');
      return;
    }

    try {
      setLoading(true);
      const app = await onRegister({
        name: name.trim(),
        uniqueName: uniqueName.trim() || undefined,
        url: url.trim(),
        logoUrl: logoUrl.trim() || undefined,
        holdingAccount: holdingAccount.trim(),
        categoryId: categoryId || null,
        description: description.trim() || undefined,
        themeColor,
        requiresCamera,
        requiresLocation,
        requiresFileAccess,
      });
      setCreatedApp(app);
    } catch (err: any) {
      setError(err.message || 'Failed to register mini-app');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKey = () => {
    if (createdApp?.encryptionKey) {
      navigator.clipboard.writeText(createdApp.encryptionKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleResetAndClose = () => {
    setName('');
    setUniqueName('');
    setUrl('');
    setLogoUrl('');
    setHoldingAccount('');
    setCategoryId('');
    setDescription('');
    setThemeColor('#C8102E');
    setRequiresCamera(false);
    setRequiresLocation(false);
    setRequiresFileAccess(false);
    setCreatedApp(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#C8102E] text-white">
          <div className="flex items-center gap-2.5">
            <PlusCircle className="w-5 h-5" />
            <h3 className="text-base font-bold">Register New Partner Mini-App</h3>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View */}
        {createdApp ? (
          <div className="p-6 space-y-5">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-2">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h4 className="text-base font-bold text-emerald-900">Mini-App Registered Successfully!</h4>
              <p className="text-xs text-emerald-700 mt-1">
                The application <strong>&apos;{createdApp.name}&apos;</strong> has been created in <strong>Sandbox mode</strong>.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-[#C8102E]" />
                  Merchant Secret Encryption Key (HMAC-SHA256)
                </span>
                <span className="text-2xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Save this key now
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={createdApp.encryptionKey}
                  className="w-full text-xs font-mono bg-white p-2.5 rounded-lg border border-slate-300 text-slate-900 select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="px-3 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1.5 shrink-0"
                >
                  {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copiedKey ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Share this secret key securely with the merchant developer. They will use it to create payment signatures.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-5 py-2.5 bg-[#C8102E] hover:bg-[#A30D25] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {error && (
                <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* App Name */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    App Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Cinema Bole"
                    className="w-full text-sm p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C8102E] focus:outline-none"
                  />
                </div>

                {/* Unique Slug */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Unique Slug (Identifier)
                  </label>
                  <input
                    type="text"
                    value={uniqueName}
                    onChange={(e) => setUniqueName(e.target.value)}
                    placeholder="e.g. cinema-bole"
                    className="w-full text-sm p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C8102E] focus:outline-none font-mono text-xs"
                  />
                </div>

                {/* Web App URL */}
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Mini-App URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://cinemabole.et/miniapp"
                    className="w-full text-sm p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C8102E] focus:outline-none"
                  />
                </div>

                {/* Holding Account (Strict Required) */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    Settlement Holding Account <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={holdingAccount}
                    onChange={(e) => setHoldingAccount(e.target.value)}
                    placeholder="e.g. 1000555666777"
                    className="w-full text-sm font-mono p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="text-2xs text-slate-500 mt-0.5 block">Zemen settlement account</span>
                </div>

                {/* Category Dropdown */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full text-sm p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C8102E] focus:outline-none bg-white"
                  >
                    <option value="">Select Category (Optional)</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Logo URL */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Logo / Icon URL
                  </label>
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://cinemabole.et/logo.png"
                    className="w-full text-sm p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C8102E] focus:outline-none"
                  />
                </div>

                {/* Theme Color */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Theme Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="w-10 h-10 p-1 border border-slate-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="w-full text-sm font-mono p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the service..."
                    className="w-full text-sm p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#C8102E] focus:outline-none"
                  />
                </div>

                {/* Permissions */}
                <div className="col-span-2 pt-2 border-t border-slate-150">
                  <label className="text-xs font-bold text-slate-700 block mb-2">
                    Customer Device Permissions (Default: None)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <label className="flex items-center gap-2 p-2.5 border border-slate-200 rounded-lg text-xs font-medium cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={requiresCamera}
                        onChange={(e) => setRequiresCamera(e.target.checked)}
                        className="rounded text-[#C8102E] focus:ring-[#C8102E]"
                      />
                      Camera
                    </label>

                    <label className="flex items-center gap-2 p-2.5 border border-slate-200 rounded-lg text-xs font-medium cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={requiresLocation}
                        onChange={(e) => setRequiresLocation(e.target.checked)}
                        className="rounded text-[#C8102E] focus:ring-[#C8102E]"
                      />
                      GPS Location
                    </label>

                    <label className="flex items-center gap-2 p-2.5 border border-slate-200 rounded-lg text-xs font-medium cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={requiresFileAccess}
                        onChange={(e) => setRequiresFileAccess(e.target.checked)}
                        className="rounded text-[#C8102E] focus:ring-[#C8102E]"
                      />
                      Storage Files
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2.5 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#C8102E] hover:bg-[#A30D25] rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {loading ? 'Registering...' : 'Register Mini-App (Sandbox)'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
