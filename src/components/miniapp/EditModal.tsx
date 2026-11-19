'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Lock,
  Globe,
  Tag,
  Palette,
  Camera,
  MapPin,
  HardDrive,
  Save,
  AlertCircle,
} from 'lucide-react';
import { MiniAppAdmin, Category, UpdateMiniAppPayload } from '@/types/miniapp';

interface EditModalProps {
  app: MiniAppAdmin | null;
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onUpdate: (id: string, payload: UpdateMiniAppPayload) => Promise<void>;
}

export const EditModal: React.FC<EditModalProps> = ({
  app,
  isOpen,
  onClose,
  categories,
  onUpdate,
}) => {
  const [formData, setFormData] = useState<UpdateMiniAppPayload>({
    name: '',
    uniqueName: '',
    url: '',
    logoUrl: '',
    categoryId: null,
    description: '',
    themeColor: '#d10000',
    rank: 0,
    requiresCamera: false,
    requiresLocation: false,
    requiresFileAccess: false,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (app && isOpen) {
      setFormData({
        name: app.name || '',
        uniqueName: app.uniqueName || '',
        url: app.url || '',
        logoUrl: app.logoUrl || '',
        categoryId: app.categoryId || null,
        description: app.description || '',
        themeColor: app.themeColor || '#d10000',
        rank: app.rank ?? 0,
        requiresCamera: app.requiresCamera || false,
        requiresLocation: app.requiresLocation || false,
        requiresFileAccess: app.requiresFileAccess || false,
      });
      setError(null);
    }
  }, [app, isOpen]);

  if (!isOpen || !app) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setError('Mini-App Name is required.');
      return;
    }
    if (!formData.url?.trim()) {
      setError('Mini-App URL is required.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await onUpdate(app.id, formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update mini-app settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-[var(--border)] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[var(--text)]">Edit Mini-App Configuration</h3>
            <p className="text-xs text-[var(--text-3)] mt-0.5">
              Editing: <span className="font-semibold text-[var(--text)]">{app.name}</span> ({app.id})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-800">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Immutable Holding Account Security Notice */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Settlement Account (Core Banking)
                </span>
                <span className="font-mono font-bold text-xs text-slate-800">
                  {app.holdingAccount || 'None'}
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
              <Lock className="w-3 h-3" />
              Immutable (Secured)
            </span>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-[var(--text)] block mb-1">Mini-App Display Name *</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--red)] text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-[var(--text)] block mb-1">Unique Slug / Code</label>
              <input
                type="text"
                value={formData.uniqueName || ''}
                onChange={(e) => setFormData({ ...formData, uniqueName: e.target.value })}
                placeholder="e.g. zemen-food"
                className="w-full px-3 py-2 bg-white border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--red)] text-xs font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-[var(--text)] block mb-1">Hosted Web URL *</label>
              <div className="relative">
                <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  required
                  value={formData.url || ''}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--red)] text-xs font-mono"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-[var(--text)] block mb-1">Logo URL (Optional)</label>
              <input
                type="url"
                value={formData.logoUrl || ''}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-white border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--red)] text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-[var(--text)] block mb-1">Category</label>
              <div className="relative">
                <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={formData.categoryId || ''}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value || null })}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--red)] text-xs cursor-pointer"
                >
                  <option value="">-- No Category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-[var(--text)] block mb-1">Super App Display Rank</label>
              <input
                type="number"
                min={0}
                value={formData.rank ?? 0}
                onChange={(e) => setFormData({ ...formData, rank: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-white border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--red)] text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-[var(--text)] block mb-1">Theme Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.themeColor || '#d10000'}
                  onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                  className="w-9 h-9 rounded-lg border border-[var(--border)] cursor-pointer p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={formData.themeColor || '#d10000'}
                  onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                  className="flex-1 px-3 py-2 bg-white border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--red)] text-xs font-mono"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-[var(--text)] block mb-1">Description</label>
              <textarea
                rows={2}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the service offered by this mini-app..."
                className="w-full px-3 py-2 bg-white border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--red)] text-xs"
              />
            </div>
          </div>

          {/* Permissions Configuration */}
          <div className="p-4 bg-slate-50 border border-[var(--border)] rounded-xl space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-3)] block">
              Device Permissions (Super App Sandbox)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-2.5 p-2.5 bg-white border border-[var(--border)] rounded-xl cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={formData.requiresLocation || false}
                  onChange={(e) => setFormData({ ...formData, requiresLocation: e.target.checked })}
                  className="w-4 h-4 text-[var(--red)] rounded focus:ring-[var(--red)]"
                />
                <div className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>GPS Location</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 bg-white border border-[var(--border)] rounded-xl cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={formData.requiresCamera || false}
                  onChange={(e) => setFormData({ ...formData, requiresCamera: e.target.checked })}
                  className="w-4 h-4 text-[var(--red)] rounded focus:ring-[var(--red)]"
                />
                <div className="flex items-center gap-1.5 font-medium">
                  <Camera className="w-3.5 h-3.5 text-slate-500" />
                  <span>Camera Access</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 bg-white border border-[var(--border)] rounded-xl cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={formData.requiresFileAccess || false}
                  onChange={(e) => setFormData({ ...formData, requiresFileAccess: e.target.checked })}
                  className="w-4 h-4 text-[var(--red)] rounded focus:ring-[var(--red)]"
                />
                <div className="flex items-center gap-1.5 font-medium">
                  <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                  <span>Storage / Files</span>
                </div>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 border border-[var(--border)] hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-[var(--red)] hover:bg-[var(--red-hover)] text-white rounded-xl font-bold text-xs shadow-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};