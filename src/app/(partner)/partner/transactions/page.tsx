'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminApiService } from '@/services/api';
import { MiniAppAdmin } from '@/types/miniapp';
import { useAuthStore } from '@/store/authStore';
import { TransactionsTab } from '@/components/developer/TransactionsTab';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { DEMO_APP } from '@/app/developer/page';

export default function PartnerTransactionsPage() {
  const { user } = useAuthStore();
  const [app, setApp] = useState<MiniAppAdmin | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await AdminApiService.getMiniApps();
      const list = res.data || [];
      let matched = list.find((a) => a.id === user?.miniAppId);
      if (!matched && user?.miniAppName) {
        matched = list.find((a) => a.name.toLowerCase().includes(user.miniAppName!.toLowerCase()));
      }
      if (!matched) {
        matched = list.find((a) => a.id !== 'demo-miniapp-001') || DEMO_APP;
      }
      setApp(matched);
    } catch {
      setApp(DEMO_APP);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3 text-[var(--text-3)]">
          <RefreshCw className="w-8 h-8 animate-spin text-[var(--red)]" />
          <span className="text-sm">Loading settlement ledger...</span>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="p-8 text-center bg-[var(--surface)] border border-[var(--border)] rounded-3xl">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-[var(--text)]">No Mini-App Linked</h2>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <TransactionsTab app={app} isGuest={false} />
    </div>
  );
}
