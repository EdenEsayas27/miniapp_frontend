import React, { useState } from 'react';
import {
  Search,
  ExternalLink,
  Key,
  Camera,
  MapPin,
  HardDrive,
  Building2,
  Power,
  RefreshCw,
  Clock,
  CheckCircle,
  Eye,
  Edit,
} from 'lucide-react';
import { MiniAppAdmin, MiniAppStatus } from '@/types/miniapp';

interface MiniAppTableProps {
  apps: MiniAppAdmin[];
  loading: boolean;
  onRefresh: () => void;
  onReview: (app: MiniAppAdmin) => void;
  onKillSwitch: (app: MiniAppAdmin) => void;
  onViewKey: (app: MiniAppAdmin) => void;
  onViewDetail: (app: MiniAppAdmin) => void;
  onEdit: (app: MiniAppAdmin) => void;
  activeStatusFilter: string;
  onStatusFilterChange: (status: string) => void;
}

export const MiniAppTable: React.FC<MiniAppTableProps> = ({
  apps,
  loading,
  onRefresh,
  onReview,
  onKillSwitch,
  onViewKey,
  onViewDetail,
  onEdit,
  activeStatusFilter,
  onStatusFilterChange,
}) => {
  const [search, setSearch] = useState('');

  // Filter apps
  const filteredApps = apps.filter((app) => {
    if (!app) return false;
    const name = (app.name || '').toLowerCase();
    const unique = (app.uniqueName || '').toLowerCase();
    const account = (app.holdingAccount || '').toLowerCase();
    const status = (app.status || '').toLowerCase();
    const query = (search || '').toLowerCase();

    const matchesSearch =
      name.includes(query) ||
      unique.includes(query) ||
      account.includes(query);

    const matchesStatus =
      activeStatusFilter === 'All' || status === activeStatusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: MiniAppStatus) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active (Live)
          </span>
        );
      case 'PendingReview':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-300 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Pending Review
          </span>
        );
      case 'Suspended':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[var(--red-pale)] text-[var(--red)] border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--red)]" />
            Suspended
          </span>
        );
      case 'Sandbox':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Sandbox
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const statusTabs = ['All', 'PendingReview', 'Active', 'Sandbox', 'Suspended'];

  return (
    <div className="bg-white rounded-2xl border border-[var(--border)] shadow-xs overflow-hidden">
      {/* Table Header Toolbar */}
      <div className="p-4 sm:p-5 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--surface-2)]">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {statusTabs.map((tab) => {
            const count =
              tab === 'All' ? apps.length : apps.filter((a) => a.status.toLowerCase() === tab.toLowerCase()).length;
            const isSelected = activeStatusFilter.toLowerCase() === tab.toLowerCase();

            return (
              <button
                key={tab}
                type="button"
                onClick={() => onStatusFilterChange(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--red)] text-white shadow-xs'
                    : 'text-[var(--text-2)] hover:bg-slate-200/60 hover:text-[var(--text)]'
                }`}
              >
                {tab === 'PendingReview' ? 'Pending Review' : tab}
                <span
                  className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search apps, slugs, accounts..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--red)] text-[var(--text)]"
            />
          </div>

          <button
            type="button"
            onClick={onRefresh}
            title="Refresh List"
            className="p-2 border border-[var(--border)] rounded-xl hover:bg-slate-100 text-[var(--text-2)] hover:text-[var(--text)] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[var(--red)]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--surface-2)] border-b border-[var(--border)] text-[11px] font-bold uppercase tracking-wider text-[var(--text-3)]">
              <th className="py-3 px-5">Mini-App</th>
              <th className="py-3 px-5">Category</th>
              <th className="py-3 px-5">Settlement Account</th>
              <th className="py-3 px-5">Device Access</th>
              <th className="py-3 px-5">Status</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] text-xs font-medium">
            {loading && apps.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-[var(--red)]" />
                    <span className="text-xs">Fetching mini-apps from bank integration service...</span>
                  </div>
                </td>
              </tr>
            ) : filteredApps.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                  No mini-apps found matching your filter criteria.
                </td>
              </tr>
            ) : (
              filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Name + Icon */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div
                        onClick={() => onViewDetail(app)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-xs cursor-pointer hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: app.themeColor || '#C8102E' }}
                        title="Click to view details"
                      >
                        {(app.name || 'M').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-[var(--text)] text-[13px]">
                          <button
                            type="button"
                            onClick={() => onViewDetail(app)}
                            className="hover:text-[var(--red)] transition-colors text-left cursor-pointer font-bold"
                          >
                            {app.name || 'Unnamed Mini-App'}
                          </button>
                          <a
                            href={app.url}
                            target="_blank"
                            rel="noreferrer"
                            title="Open mini-app web url"
                            className="text-slate-400 hover:text-[var(--red)] transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <span className="text-[11px] font-mono text-[var(--text-3)] block">
                          slug: {app.uniqueName || 'unassigned'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-4 px-5 font-semibold text-[var(--text-2)]">
                    {app.categoryName || (
                      <span className="text-slate-400 italic">Uncategorized</span>
                    )}
                  </td>

                  {/* Settlement Account */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-1.5 font-mono text-[var(--text)] font-bold text-[12px]">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      {app.holdingAccount || <span className="text-red-500 font-bold">MISSING</span>}
                    </div>
                  </td>

                  {/* Permissions */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <span
                        title={app.requiresCamera ? 'Requires Camera Access' : 'No Camera'}
                        className={`p-1 rounded-md ${
                          app.requiresCamera
                            ? 'bg-amber-100 text-amber-800 font-bold'
                            : 'opacity-30'
                        }`}
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </span>
                      <span
                        title={app.requiresLocation ? 'Requires GPS Location' : 'No Location'}
                        className={`p-1 rounded-md ${
                          app.requiresLocation
                            ? 'bg-amber-100 text-amber-800 font-bold'
                            : 'opacity-30'
                        }`}
                      >
                        <MapPin className="w-3.5 h-3.5" />
                      </span>
                      <span
                        title={app.requiresFileAccess ? 'Requires Storage Access' : 'No Storage'}
                        className={`p-1 rounded-md ${
                          app.requiresFileAccess
                            ? 'bg-amber-100 text-amber-800 font-bold'
                            : 'opacity-30'
                        }`}
                      >
                        <HardDrive className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-5">{getStatusBadge(app.status)}</td>

                  {/* Actions */}
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View Details Button */}
                      <button
                        type="button"
                        onClick={() => onViewDetail(app)}
                        title="View Full Details (GET /api/admin/miniapps/{id})"
                        className="p-1.5 hover:bg-slate-100 text-[var(--text-2)] hover:text-[var(--text)] rounded-lg border border-[var(--border)] transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit Mini-App Button */}
                      <button
                        type="button"
                        onClick={() => onEdit(app)}
                        title="Edit Mini-App Settings (PUT /api/admin/miniapps/{id})"
                        className="p-1.5 hover:bg-slate-100 text-[var(--text-2)] hover:text-[var(--text)] rounded-lg border border-[var(--border)] transition-colors cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      {/* Review & Approve Button (if pending) */}
                      {app.status === 'PendingReview' && (
                        <button
                          type="button"
                          onClick={() => onReview(app)}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          Review
                        </button>
                      )}

                      {/* Emergency Kill-Switch Toggle */}
                      {app.status === 'Active' && (
                        <button
                          type="button"
                          onClick={() => onKillSwitch(app)}
                          title="Suspend mini-app (Kill-Switch)"
                          className="px-2.5 py-1.5 bg-[var(--red-pale)] hover:bg-red-100 text-[var(--red)] border border-red-200 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Power className="w-3.5 h-3.5" />
                          Suspend
                        </button>
                      )}

                      {/* Reactivate if Suspended */}
                      {app.status === 'Suspended' && (
                        <button
                          type="button"
                          onClick={() => onKillSwitch(app)}
                          title="Reactivate mini-app"
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Reactivate
                        </button>
                      )}

                      {/* View & Rotate Key Button */}
                      <button
                        type="button"
                        onClick={() => onViewKey(app)}
                        title="View or Rotate Secret Key"
                        className="p-1.5 hover:bg-slate-100 text-[var(--text-2)] hover:text-[var(--text)] rounded-lg border border-[var(--border)] transition-colors cursor-pointer"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
