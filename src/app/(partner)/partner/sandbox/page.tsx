'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Terminal, Smartphone, Code2, RefreshCw, AlertTriangle } from 'lucide-react';
import { AdminApiService } from '@/services/api';
import { MiniAppAdmin } from '@/types/miniapp';
import { useAuthStore } from '@/store/authStore';
import { ApiSandbox } from '@/components/developer/ApiSandbox';
import { SignaturePlayground } from '@/components/developer/SignaturePlayground';

import { DEMO_APP } from '@/app/developer/page';

type SandboxTab = 'sandbox' | 'hmac';

export default function PartnerSandboxPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [app, setApp] = useState<MiniAppAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SandboxTab>('sandbox');

  const loadApp = useCallback(async () => {
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

  useEffect(() => { loadApp(); }, [loadApp]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3 text-[var(--text-3)]">
          <RefreshCw className="w-8 h-8 animate-spin text-[var(--red)]" />
          <span className="text-sm">Loading your Mini-App Sandbox environment...</span>
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

  const tabs = [
    { id: 'sandbox' as SandboxTab, label: 'API Sandbox', icon: Terminal, desc: `Interactive tester with ${app.name} credentials` },
    { id: 'hmac' as SandboxTab, label: 'HMAC Playground', icon: Code2, desc: 'Signature calculation with your private key' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Scope Header */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-3)]">
                Active Partner Sandbox
              </span>
            </div>
            <h1 className="text-xl font-bold text-[var(--text)] mt-1 f-display">
              {app.name} — Test Environment
            </h1>
            <p className="text-xs text-[var(--text-3)] mt-0.5">
              Testing endpoints and simulation using your private credentials and registered URL.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[var(--bg)] border border-[var(--border)] p-1 rounded-2xl shrink-0 overflow-x-auto">
            {tabs.map((t) => {
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-[var(--red)] text-white shadow-xs'
                      : 'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface)]'
                  }`}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="animate-in">
        {activeTab === 'sandbox' && (
          <ApiSandbox
            app={app}
            onRequestGoLive={() => router.push('/partner/golive')}
            onGoToTransactions={() => router.push('/partner/transactions')}
          />
        )}

        {activeTab === 'hmac' && (
          <SignaturePlayground
            secretKey={app.encryptionKey}
            appId={app.id}
            appName={app.name}
          />
        )}


      </div>
    </div>
  );
}
