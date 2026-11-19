'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, AlertCircle, Layers } from 'lucide-react';
import { AdminApiService } from '@/services/api';
import {
  MiniAppAdmin,
  Category,
  CreateMiniAppPayload,
  UpdateMiniAppPayload,
} from '@/types/miniapp';
import { StatsCards } from './StatsCards';
import { MiniAppTable } from './MiniAppTable';
import { ReviewModal } from './ReviewModal';
import { RegisterModal } from './RegisterModal';
import { KillSwitchModal } from './KillSwitchModal';
import { KeyModal } from './KeyModal';
import { DetailModal } from './DetailModal';
import { EditModal } from './EditModal';
import { CategoryModal } from './CategoryModal';

export const MiniAppManagementTab: React.FC = () => {
  const [apps, setApps] = useState<MiniAppAdmin[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active filter tab
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals state
  const [reviewApp, setReviewApp] = useState<MiniAppAdmin | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [killSwitchApp, setKillSwitchApp] = useState<MiniAppAdmin | null>(null);
  const [keyApp, setKeyApp] = useState<MiniAppAdmin | null>(null);
  const [detailApp, setDetailApp] = useState<MiniAppAdmin | null>(null);
  const [editApp, setEditApp] = useState<MiniAppAdmin | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Notification Banner
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [appsRes, catRes] = await Promise.all([
        AdminApiService.getMiniApps(),
        AdminApiService.getCategories().catch(() => []),
      ]);
      setApps(appsRes.data || []);
      setCategories(catRes || []);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to Bank Mini-App API. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleRegister = async (payload: CreateMiniAppPayload): Promise<MiniAppAdmin> => {
    const res = await AdminApiService.registerMiniApp(payload);
    showNotification(`Mini-App '${res.app.name}' registered successfully!`);
    await loadData();
    return res.app;
  };

  const handleUpdate = async (id: string, payload: UpdateMiniAppPayload) => {
    const res = await AdminApiService.updateMiniApp(id, payload);
    showNotification(`Mini-App '${res.app.name}' updated successfully!`);
    await loadData();
    // Also update detailApp if currently viewing
    if (detailApp && detailApp.id === id) {
      setDetailApp(res.app);
    }
  };

  const handleApprove = async (id: string) => {
    const res = await AdminApiService.approveMiniApp(id);
    showNotification(res.message);
    await loadData();
  };

  const handleReject = async (id: string, remarks?: string) => {
    const res = await AdminApiService.rejectMiniApp(id, remarks);
    showNotification(res.message);
    await loadData();
  };

  const handleToggleStatus = async (id: string, newStatus: 'Active' | 'Suspended', remarks?: string) => {
    const res = await AdminApiService.updateStatus(id, { status: newStatus, remarks });
    showNotification(res.message);
    await loadData();
  };

  const handleRegenerateKey = async (id: string): Promise<string> => {
    const res = await AdminApiService.regenerateKey(id);
    showNotification(res.message);
    await loadData();
    return res.encryptionKey;
  };

  return (
    <div className="w-full">
      {/* Tab Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Mini-App Platform Management
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--red-pale)] text-[var(--red)] border border-red-200">
              Core Banking
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Approve partner integrations, configure settlement accounts, and manage production Super App visibility.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Categories Manager Button */}
          <button
            type="button"
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-[var(--border)] rounded-xl text-xs font-bold shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Layers className="w-4 h-4 text-slate-600" />
            Manage Categories ({categories.length})
          </button>

          {/* Register Partner App Button */}
          <button
            type="button"
            onClick={() => setIsRegisterOpen(true)}
            className="px-4 py-2 bg-[var(--red)] hover:bg-[var(--red-hover)] text-white rounded-xl text-xs font-bold shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Register Partner App
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-3.5 mb-5 rounded-xl border text-xs font-medium flex items-center justify-between shadow-xs animate-in fade-in duration-150 ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <span>{notification.message}</span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-xs font-bold underline ml-2 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Connection Error Banner */}
      {error && (
        <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-red-900">Backend Connection Error</h4>
            <p className="text-xs text-red-700 mt-0.5 leading-relaxed">{error}</p>
            <button
              type="button"
              onClick={loadData}
              className="mt-2 text-xs font-bold text-red-800 underline inline-flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* KPI Stats Cards */}
      <StatsCards apps={apps} onFilterChange={setStatusFilter} activeFilter={statusFilter} />

      {/* Mini-Apps Table */}
      <MiniAppTable
        apps={apps}
        loading={loading}
        onRefresh={loadData}
        onReview={(app) => setReviewApp(app)}
        onKillSwitch={(app) => setKillSwitchApp(app)}
        onViewKey={(app) => setKeyApp(app)}
        onViewDetail={(app) => setDetailApp(app)}
        onEdit={(app) => setEditApp(app)}
        activeStatusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* View App Detail Modal (GET /api/admin/miniapps/{id}) */}
      <DetailModal
        app={detailApp}
        isOpen={Boolean(detailApp)}
        onClose={() => setDetailApp(null)}
        onEdit={(app) => setEditApp(app)}
        onApprove={handleApprove}
        onReject={handleReject}
        onKillSwitch={(app) => setKillSwitchApp(app)}
      />

      {/* Edit App Modal (PUT /api/admin/miniapps/{id}) */}
      <EditModal
        app={editApp}
        isOpen={Boolean(editApp)}
        onClose={() => setEditApp(null)}
        categories={categories}
        onUpdate={handleUpdate}
      />

      {/* Category Manager Modal (GET & POST /api/admin/categories) */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onCategoryCreated={loadData}
      />

      {/* Review & Approve Modal */}
      <ReviewModal
        app={reviewApp}
        isOpen={Boolean(reviewApp)}
        onClose={() => setReviewApp(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* Register New Mini-App Modal */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        categories={categories}
        onRegister={handleRegister}
      />

      {/* Emergency Kill-Switch Confirmation Modal */}
      <KillSwitchModal
        app={killSwitchApp}
        isOpen={Boolean(killSwitchApp)}
        onClose={() => setKillSwitchApp(null)}
        onToggleStatus={handleToggleStatus}
      />

      {/* Secret Key Modal */}
      <KeyModal
        app={keyApp}
        isOpen={Boolean(keyApp)}
        onClose={() => setKeyApp(null)}
        onRegenerateKey={handleRegenerateKey}
      />
    </div>
  );
};