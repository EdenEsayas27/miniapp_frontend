'use client';

import React from 'react';
import { MiniAppManagementTab } from '@/components/miniapp/MiniAppManagementTab';

export default function AdminDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <MiniAppManagementTab />
    </div>
  );
}
