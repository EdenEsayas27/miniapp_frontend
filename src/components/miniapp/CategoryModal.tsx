'use client';

import React, { useState } from 'react';
import {
  X,
  Plus,
  Tag,
  Palette,
  Hash,
  Layers,
  Sparkles,
  AlertCircle,
  Check,
} from 'lucide-react';
import { Category, CreateCategoryPayload } from '@/types/miniapp';
import { AdminApiService } from '@/services/api';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onCategoryCreated: () => Promise<void>;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  categories,
  onCategoryCreated,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<CreateCategoryPayload>({
    name: '',
    iconName: 'tag',
    colorHex: '#d10000',
    description: '',
    rank: categories.length + 1,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickIcons = [
    { label: 'Cart', name: 'shopping-bag' },
    { label: 'Car', name: 'car' },
    { label: 'Food', name: 'utensils' },
    { label: 'Power', name: 'zap' },
    { label: 'Health', name: 'heart-pulse' },
    { label: 'Film', name: 'film' },
    { label: 'Plane', name: 'plane' },
    { label: 'Tag', name: 'tag' },
  ];

  const quickColors = [
    '#d10000', // Zemen Red
    '#059669', // Emerald
    '#2563eb', // Royal Blue
    '#d97706', // Amber
    '#7c3aed', // Purple
    '#db2777', // Pink
    '#0891b2', // Cyan
    '#475569', // Slate
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setError('Category Name is required.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await AdminApiService.createCategory(formData);
      setSuccess(`Category '${formData.name}' created successfully!`);
      await onCategoryCreated();

      // Reset form
      setFormData({
        name: '',
        iconName: 'tag',
        colorHex: '#d10000',
        description: '',
        rank: categories.length + 2,
      });
      setShowAddForm(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to create category.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-[var(--border)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--red-pale)] text-[var(--red)] flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--text)]">Mini-App Categories</h3>
              <p className="text-xs text-[var(--text-3)]">
                Organize mini-apps into categories shown in the Zemen Super App.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action to show / hide Add form */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700">Existing Categories ({categories.length})</span>
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 bg-[var(--red)] hover:bg-[var(--red-hover)] text-white rounded-xl font-bold text-xs shadow-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {showAddForm ? 'Cancel New' : 'Add New Category'}
            </button>
          </div>

          {/* New Category Form */}
          {showAddForm && (
            <form
              onSubmit={handleSubmit}
              className="p-4 bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl space-y-4 animate-in fade-in duration-200"
            >
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[var(--red)]" />
                Create New Category
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-[var(--text)] block mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Utility Bills, Food & Dining, Travel"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--red)] text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--text)] block mb-1">Display Rank / Order</label>
                  <div className="relative">
                    <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min={0}
                      value={formData.rank ?? 1}
                      onChange={(e) => setFormData({ ...formData, rank: parseInt(e.target.value) || 0 })}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--red)] text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[var(--text)] block mb-1">Theme Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.colorHex || '#d10000'}
                      onChange={(e) => setFormData({ ...formData, colorHex: e.target.value })}
                      className="w-9 h-9 rounded-lg border border-[var(--border)] cursor-pointer p-0.5 bg-white shrink-0"
                    />
                    <input
                      type="text"
                      value={formData.colorHex || '#d10000'}
                      onChange={(e) => setFormData({ ...formData, colorHex: e.target.value })}
                      className="flex-1 px-3 py-2 bg-white border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--red)] text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Quick Colors */}
                <div className="sm:col-span-2">
                  <span className="text-[10px] text-slate-400 block mb-1">Palette Presets:</span>
                  <div className="flex items-center gap-1.5">
                    {quickColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, colorHex: color })}
                        style={{ backgroundColor: color }}
                        className={`w-6 h-6 rounded-full cursor-pointer transition-transform hover:scale-110 border ${
                          formData.colorHex === color ? 'ring-2 ring-slate-900 ring-offset-2' : 'border-black/10'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Quick Icons */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-[var(--text)] block mb-1">Icon Identifier</label>
                  <input
                    type="text"
                    value={formData.iconName || 'tag'}
                    onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                    placeholder="e.g. shopping-bag, car, zap"
                    className="w-full px-3 py-2 bg-white border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--red)] text-xs font-mono"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {quickIcons.map((i) => (
                      <button
                        key={i.name}
                        type="button"
                        onClick={() => setFormData({ ...formData, iconName: i.name })}
                        className={`px-2 py-0.5 rounded text-[10px] border cursor-pointer ${
                          formData.iconName === i.name
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {i.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-[var(--text)] block mb-1">Description</label>
                  <input
                    type="text"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief explanation for this category..."
                    className="w-full px-3 py-2 bg-white border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--red)] text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-[var(--red)] hover:bg-[var(--red-hover)] text-white font-bold rounded-xl shadow-xs cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {saving ? 'Creating...' : 'Save Category'}
                </button>
              </div>
            </form>
          )}

          {/* Categories List */}
          <div className="space-y-2">
            {categories.length === 0 ? (
              <div className="py-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-[var(--border)]">
                No categories configured yet. Click &quot;Add New Category&quot; above to create one.
              </div>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-3.5 bg-white border border-[var(--border)] rounded-xl flex items-center justify-between gap-3 hover:border-slate-300 transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs shrink-0"
                      style={{ backgroundColor: cat.colorHex || '#808080' }}
                    >
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--text)] text-xs">{cat.name}</span>
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block"
                          style={{ backgroundColor: cat.colorHex || '#808080' }}
                        />
                      </div>
                      <p className="text-[11px] text-[var(--text-3)] mt-0.5">
                        {cat.description || `Icon: ${cat.iconName || 'tag'}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                      Rank #{cat.rank}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                      {cat.appCount ?? 0} {cat.appCount === 1 ? 'app' : 'apps'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-2)] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-xs cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};