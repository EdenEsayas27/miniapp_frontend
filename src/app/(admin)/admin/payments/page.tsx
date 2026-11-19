'use client';

import React from 'react';
import { AdminTransactionsTab } from '@/components/admin/AdminTransactionsTab';

export default function AdminPaymentsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminTransactionsTab />
    </div>
  );
}
