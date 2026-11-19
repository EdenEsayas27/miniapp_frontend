'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, UserPlus, Search, ShieldCheck, Key, Eye, EyeOff,
  RefreshCw, CheckCircle2, XCircle, AlertTriangle, ChevronDown,
  Lock, Trash2, Edit2, Smartphone, Check, X, Shield, Filter
} from 'lucide-react';
import { AdminApiService, PortalUserAdmin, CreatePortalUserPayload, UpdatePortalUserPayload } from '@/services/api';
import { MiniAppAdmin } from '@/types/miniapp';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<PortalUserAdmin[]>([]);
  const [apps, setApps] = useState<MiniAppAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [appFilter, setAppFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<PortalUserAdmin | null>(null);
  const [resetPwdUser, setResetPwdUser] = useState<PortalUserAdmin | null>(null);
  const [deleteUser, setDeleteUser] = useState<PortalUserAdmin | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState<CreatePortalUserPayload>({
    username: '',
    password: '',
    fullName: '',
    email: '',
    role: 'USER',
    miniAppId: '',
  });
  const [showCreatePwd, setShowCreatePwd] = useState(false);
  const [resetPasswordVal, setResetPasswordVal] = useState('');
  const [showResetPwd, setShowResetPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const showToast = (text: string, type: 'ok' | 'err' = 'ok') => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [uRes, aRes] = await Promise.all([
        AdminApiService.getUsers({
          search: search || undefined,
          role: roleFilter,
          miniAppId: appFilter,
          status: statusFilter,
        }),
        AdminApiService.getMiniApps(),
      ]);

      setUsers(uRes.data || []);
      setApps(aRes.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, appFilter, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Create User
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.username || !createForm.password) {
      showToast('Username and password are required', 'err');
      return;
    }
    setSubmitting(true);
    try {
      await AdminApiService.createUser({
        ...createForm,
        miniAppId: createForm.role === 'USER' ? createForm.miniAppId : undefined,
      });
      showToast(`User '${createForm.username}' created successfully.`);
      setIsCreateOpen(false);
      setCreateForm({ username: '', password: '', fullName: '', email: '', role: 'USER', miniAppId: '' });
      loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to create user', 'err');
    } finally {
      setSubmitting(false);
    }
  };

  // Edit User
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setSubmitting(true);
    try {
      await AdminApiService.updateUser(editUser.id, {
        fullName: editUser.fullName,
        email: editUser.email,
        role: editUser.role,
        miniAppId: editUser.role === 'USER' ? (editUser.miniAppId || undefined) : undefined,
        isActive: editUser.isActive,
      });
      showToast(`User '${editUser.username}' updated.`);
      setEditUser(null);
      loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update user', 'err');
    } finally {
      setSubmitting(false);
    }
  };

  // Reset Password
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPwdUser || !resetPasswordVal.trim()) return;
    setSubmitting(true);
    try {
      await AdminApiService.resetUserPassword(resetPwdUser.id, resetPasswordVal.trim());
      showToast(`Password updated for user '${resetPwdUser.username}'.`);
      setResetPwdUser(null);
      setResetPasswordVal('');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to reset password', 'err');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Active/Disabled
  const handleToggleStatus = async (user: PortalUserAdmin) => {
    try {
      await AdminApiService.toggleUserStatus(user.id);
      showToast(`User status updated.`);
      loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to toggle status', 'err');
    }
  };

  // Delete User
  const handleDeleteUser = async () => {
    if (!deleteUser) return;
    setSubmitting(true);
    try {
      await AdminApiService.deleteUser(deleteUser.id);
      showToast(`User '${deleteUser.username}' deleted.`);
      setDeleteUser(null);
      loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to delete user', 'err');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick stats
  const totalCount = users.length;
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;
  const partnerCount = users.filter((u) => u.role === 'USER').length;
  const activeCount = users.filter((u) => u.isActive).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--red)]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-3)]">
              Access Control &amp; Identity
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text)] mt-1 f-display">
            User Management
          </h1>
          <p className="text-xs text-[var(--text-3)] mt-0.5">
            Create portal accounts, assign partners to Mini-Apps, manage roles, and reset credentials.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2.5 bg-[var(--red)] hover:bg-[var(--red-hover)] text-white font-semibold rounded-xl text-xs inline-flex items-center gap-2 transition-all shadow-sm cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" /> Add New User
        </button>
      </div>

      {/* Toast Feedback Banner */}
      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-medium flex items-center justify-between shadow-xs animate-in ${
            feedbackMsg.type === 'ok'
              ? 'bg-[var(--status-success-bg)] text-[var(--status-success-color)] border-[var(--status-success-color)]/20'
              : 'bg-[var(--status-failed-bg)] text-[var(--status-failed-color)] border-[var(--status-failed-color)]/20'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button type="button" onClick={() => setFeedbackMsg(null)} className="ml-3 font-bold underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
          <p className="text-[11px] font-semibold text-[var(--text-3)] uppercase tracking-wider">Total Users</p>
          <p className="text-2xl font-bold text-[var(--text)] f-display mt-1">{totalCount}</p>
        </div>
        <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
          <p className="text-[11px] font-semibold text-[var(--text-3)] uppercase tracking-wider">Bank Admins</p>
          <p className="text-2xl font-bold text-[var(--red)] f-display mt-1">{adminCount}</p>
        </div>
        <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
          <p className="text-[11px] font-semibold text-[var(--text-3)] uppercase tracking-wider">Mini-App Partners</p>
          <p className="text-2xl font-bold text-blue-600 f-display mt-1">{partnerCount}</p>
        </div>
        <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
          <p className="text-[11px] font-semibold text-[var(--text-3)] uppercase tracking-wider">Active Status</p>
          <p className="text-2xl font-bold text-emerald-600 f-display mt-1">{activeCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[var(--text-3)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by username, full name, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] placeholder:text-[var(--text-4)] focus:outline-none focus:ring-1 focus:ring-[var(--red)]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Role filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs font-semibold text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--red)] cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">System Admins</option>
            <option value="USER">Partner Users</option>
          </select>

          {/* Mini-App filter */}
          <select
            value={appFilter}
            onChange={(e) => setAppFilter(e.target.value)}
            className="px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs font-semibold text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--red)] cursor-pointer max-w-[180px] truncate"
          >
            <option value="ALL">All Mini-Apps</option>
            {apps.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs font-semibold text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--red)] cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="DISABLED">Disabled Only</option>
          </select>

          <button
            type="button"
            onClick={loadData}
            title="Refresh Users"
            className="p-2 bg-[var(--bg)] border border-[var(--border)] hover:bg-[var(--surface-2)] text-[var(--text-2)] rounded-xl cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-[var(--text-3)]">
            <RefreshCw className="w-8 h-8 animate-spin text-[var(--red)]" />
            <span className="text-xs">Loading user directory...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-[var(--status-failed-color)]">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-80" />
            <p>{error}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-xs text-[var(--text-3)]">
            No users match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-2)] text-[11px] uppercase tracking-wider text-[var(--text-3)] font-semibold">
                  <th className="py-3.5 px-5">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Assigned Mini-App</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] font-medium">
                {users.map((u) => {
                  const initials = (u.fullName || u.username).substring(0, 2).toUpperCase();
                  const isAdmin = u.role === 'ADMIN';

                  return (
                    <tr key={u.id} className="hover:bg-[var(--surface-2)]/60 transition-colors">
                      {/* User Info */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isAdmin
                                ? 'bg-[var(--red)]/10 text-[var(--red)]'
                                : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[var(--text)] truncate">{u.fullName || u.username}</p>
                            <p className="text-[11px] text-[var(--text-3)] font-mono truncate">@{u.username}</p>
                            {u.email && <p className="text-[10px] text-[var(--text-4)] truncate">{u.email}</p>}
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            isAdmin
                              ? 'bg-[var(--red-pale)] text-[var(--red)] border border-red-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {isAdmin ? <Shield className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
                          {isAdmin ? 'System Admin' : 'Partner User'}
                        </span>
                      </td>

                      {/* Assigned Mini-App */}
                      <td className="py-3.5 px-4">
                        {isAdmin ? (
                          <span className="text-[11px] text-[var(--text-3)] italic">System-wide access</span>
                        ) : u.miniAppName ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg)] border border-[var(--border)] font-semibold text-[11px] text-[var(--text)]">
                            <Smartphone className="w-3 h-3 text-[var(--red)]" />
                            {u.miniAppName}
                          </span>
                        ) : (
                          <span className="text-[11px] text-amber-600 font-semibold">Unassigned</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.isActive
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {u.isActive ? 'ACTIVE' : 'DISABLED'}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-4 text-[11px] text-[var(--text-3)]">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setResetPwdUser(u);
                              setResetPasswordVal('');
                            }}
                            title="Reset Password"
                            className="p-1.5 rounded-lg text-[var(--text-3)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors cursor-pointer"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditUser(u)}
                            title="Edit User"
                            className="p-1.5 rounded-lg text-[var(--text-3)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleStatus(u)}
                            title={u.isActive ? 'Disable User' : 'Activate User'}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              u.isActive
                                ? 'text-emerald-600 hover:bg-emerald-50'
                                : 'text-slate-400 hover:bg-slate-100'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>

                          {u.username !== 'admin' && (
                            <button
                              type="button"
                              onClick={() => setDeleteUser(u)}
                              title="Delete User"
                              className="p-1.5 rounded-lg text-[var(--text-3)] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================
          CREATE USER MODAL
          ======================================================== */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale">
            <div className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[var(--red)]/10 text-[var(--red)] flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[var(--text)]">Add New Portal User</h3>
                  <p className="text-[11px] text-[var(--text-3)]">Provision login credentials for staff or partners</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-[var(--text-3)] hover:text-[var(--text)] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-2)] mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ride.ethiopia, john.doe"
                  value={createForm.username}
                  onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs font-mono text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--red)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-2)] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ride Ethiopia Dev Team"
                  value={createForm.fullName}
                  onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--red)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-2)] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="e.g. dev@ride.et"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--red)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-2)] mb-1">
                    Role *
                  </label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as 'ADMIN' | 'USER' })}
                    className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs font-semibold text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--red)]"
                  >
                    <option value="USER">Partner User</option>
                    <option value="ADMIN">System Admin</option>
                  </select>
                </div>

                {createForm.role === 'USER' && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-2)] mb-1">
                      Assigned Mini-App
                    </label>
                    <select
                      value={createForm.miniAppId || ''}
                      onChange={(e) => setCreateForm({ ...createForm, miniAppId: e.target.value })}
                      className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs font-semibold text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--red)]"
                    >
                      <option value="">-- Choose App --</option>
                      {apps.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-2)] mb-1">
                  Initial Password *
                </label>
                <div className="relative">
                  <input
                    type={showCreatePwd ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className="w-full px-3 py-2 pr-10 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs font-mono text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--red)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCreatePwd(!showCreatePwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-4)] hover:text-[var(--text-2)]"
                  >
                    {showCreatePwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-[var(--bg)] hover:bg-[var(--surface-2)] text-[var(--text)] rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[var(--red)] hover:bg-[var(--red-hover)] text-white font-semibold rounded-xl text-xs inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          EDIT USER MODAL
          ======================================================== */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale">
            <div className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[var(--text)]">Edit User: {editUser.username}</h3>
                  <p className="text-[11px] text-[var(--text-3)]">Update roles, assignments, and status</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditUser(null)}
                className="text-[var(--text-3)] hover:text-[var(--text)] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-2)] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editUser.fullName}
                  onChange={(e) => setEditUser({ ...editUser, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--red)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-2)] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--red)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-2)] mb-1">
                    Role
                  </label>
                  <select
                    value={editUser.role}
                    onChange={(e) => setEditUser({ ...editUser, role: e.target.value as 'ADMIN' | 'USER' })}
                    className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs font-semibold text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--red)]"
                  >
                    <option value="USER">Partner User</option>
                    <option value="ADMIN">System Admin</option>
                  </select>
                </div>

                {editUser.role === 'USER' && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-2)] mb-1">
                      Assigned Mini-App
                    </label>
                    <select
                      value={editUser.miniAppId || ''}
                      onChange={(e) => setEditUser({ ...editUser, miniAppId: e.target.value || null })}
                      className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs font-semibold text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--red)]"
                    >
                      <option value="">-- Choose App --</option>
                      {apps.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="px-4 py-2 bg-[var(--bg)] hover:bg-[var(--surface-2)] text-[var(--text)] rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[var(--red)] hover:bg-[var(--red-hover)] text-white font-semibold rounded-xl text-xs inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          RESET PASSWORD MODAL
          ======================================================== */}
      {resetPwdUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-scale">
            <div className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[var(--text)]">Reset Password</h3>
                  <p className="text-[11px] text-[var(--text-3)]">For @{resetPwdUser.username}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResetPwdUser(null)}
                className="text-[var(--text-3)] hover:text-[var(--text)] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-2)] mb-1">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showResetPwd ? 'text' : 'password'}
                    required
                    placeholder="Enter new password"
                    value={resetPasswordVal}
                    onChange={(e) => setResetPasswordVal(e.target.value)}
                    className="w-full px-3 py-2 pr-10 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs font-mono text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--red)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPwd(!showResetPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-4)] hover:text-[var(--text-2)]"
                  >
                    {showResetPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setResetPwdUser(null)}
                  className="px-4 py-2 bg-[var(--bg)] hover:bg-[var(--surface-2)] text-[var(--text)] rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !resetPasswordVal.trim()}
                  className="px-5 py-2 bg-[var(--red)] hover:bg-[var(--red-hover)] text-white font-semibold rounded-xl text-xs transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Set Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          DELETE CONFIRM MODAL
          ======================================================== */}
      {deleteUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center animate-scale">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-[var(--text)]">Delete User Account?</h3>
            <p className="text-xs text-[var(--text-3)] mt-1 mb-6">
              Are you sure you want to permanently delete <strong>@{deleteUser.username}</strong> ({deleteUser.fullName})? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteUser(null)}
                className="px-4 py-2 bg-[var(--bg)] hover:bg-[var(--surface-2)] text-[var(--text)] rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleDeleteUser}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-xs transition-colors disabled:opacity-50"
              >
                {submitting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
