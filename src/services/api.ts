import { MiniAppAdmin, Category, CreateMiniAppPayload, UpdateMiniAppPayload, StatusUpdatePayload, MiniAppTransaction } from '../types/miniapp';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5164';

// Helper to normalize PascalCase C# responses into camelCase TypeScript models
function normalizeTransaction(raw: any): MiniAppTransaction {
  if (!raw) return {} as MiniAppTransaction;
  return {
    id: raw.id ?? raw.Id ?? '',
    originatorId: raw.originatorId ?? raw.OriginatorId ?? '',
    phoneNumber: raw.phoneNumber ?? raw.PhoneNumber ?? '',
    cifNumber: raw.cifNumber ?? raw.CIFNumber ?? '',
    accountId: raw.accountId ?? raw.AccountId ?? '',
    amount: Number(raw.amount ?? raw.Amount ?? 0),
    transactionId: raw.transactionId ?? raw.TransactionId ?? '',
    transactionDate: raw.transactionDate ?? raw.TransactionDate ?? '',
    flexCubeReference: raw.flexCubeReference ?? raw.FlexCubeReference ?? null,
    status: Number(raw.status ?? raw.Status ?? 0),
    statusMessage: raw.statusMessage ?? raw.StatusMessage ?? null,
    miniAppId: raw.miniAppId ?? raw.MiniAppId ?? '',
    miniAppName: raw.miniAppName ?? raw.MiniAppName ?? null,
    transactionType: raw.transactionType ?? raw.TransactionType ?? null,
    remarks: raw.remarks ?? raw.Remarks ?? null,
    createdAt: raw.createdAt ?? raw.CreatedAt ?? '',
  };
}

// Helper to normalize PascalCase C# responses into camelCase TypeScript models
function normalizeMiniApp(raw: any): MiniAppAdmin {
  if (!raw) return {} as MiniAppAdmin;
  return {
    id: raw.id ?? raw.Id ?? '',
    name: raw.name ?? raw.Name ?? '',
    url: raw.url ?? raw.Url ?? '',
    logoUrl: raw.logoUrl ?? raw.LogoUrl ?? '',
    status: raw.status ?? raw.Status ?? 'Sandbox',
    themeColor: raw.themeColor ?? raw.ThemeColor ?? '#C8102E',
    rank: raw.rank ?? raw.Rank ?? 0,
    categoryId: raw.categoryId ?? raw.CategoryId ?? null,
    categoryName: raw.categoryName ?? raw.CategoryName ?? null,
    uniqueName: raw.uniqueName ?? raw.UniqueName ?? null,
    description: raw.description ?? raw.Description ?? null,
    encryptionKey: raw.encryptionKey ?? raw.EncryptionKey ?? '',
    holdingAccount: raw.holdingAccount ?? raw.HoldingAccount ?? '',
    requiresCamera: Boolean(raw.requiresCamera ?? raw.RequiresCamera ?? false),
    requiresLocation: Boolean(raw.requiresLocation ?? raw.RequiresLocation ?? false),
    requiresFileAccess: Boolean(raw.requiresFileAccess ?? raw.RequiresFileAccess ?? false),
    createdAt: raw.createdAt ?? raw.CreatedAt ?? '',
    updatedAt: raw.updatedAt ?? raw.UpdatedAt ?? '',
  };
}

function normalizeCategory(raw: any): Category {
  if (!raw) return {} as Category;
  return {
    id: raw.id ?? raw.Id ?? '',
    name: raw.name ?? raw.Name ?? '',
    iconName: raw.iconName ?? raw.IconName ?? '',
    colorHex: raw.colorHex ?? raw.ColorHex ?? '#808080',
    description: raw.description ?? raw.Description ?? null,
    rank: raw.rank ?? raw.Rank ?? 0,
    appCount: raw.appCount ?? raw.AppCount ?? 0,
  };
}

export class AdminApiService {
  private static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;

    // Read Bearer token from authStore persistence in localStorage if available
    let token: string | null = null;
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('zemen-miniapp-auth');
        if (raw) {
          const parsed = JSON.parse(raw);
          token = parsed?.state?.token ?? null;
        }
      } catch {
        // ignore JSON parse error
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options?.headers as Record<string, string>) || {}),
    };

    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error ${response.status}`;
      try {
        const errorJson = await response.json();
        errorMessage = errorJson.error || errorJson.message || errorMessage;
      } catch {
        const text = await response.text();
        if (text) errorMessage = text;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Get all mini-apps, optionally filtered by status
  static async getMiniApps(status?: string): Promise<{ total: number; statusFilter: string; data: MiniAppAdmin[] }> {
    const query = status && status !== 'All' ? `?status=${encodeURIComponent(status)}` : '';
    const res = await this.request<{ total?: number; statusFilter?: string; data?: any[] }>(`/api/admin/miniapps${query}`);
    const rawList = res.data ?? (Array.isArray(res) ? res : []);
    return {
      total: res.total ?? rawList.length,
      statusFilter: res.statusFilter ?? status ?? 'All',
      data: rawList.map(normalizeMiniApp),
    };
  }

  // Get single mini-app by ID
  static async getMiniAppById(id: string): Promise<MiniAppAdmin> {
    const raw = await this.request<any>(`/api/admin/miniapps/${id}`);
    return normalizeMiniApp(raw);
  }

  // Get categories list
  static async getCategories(): Promise<Category[]> {
    const rawList = await this.request<any[]>('/api/admin/categories');
    return (rawList || []).map(normalizeCategory);
  }

  // Create new category
  static async createCategory(payload: any): Promise<Category> {
    const raw = await this.request<any>('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return normalizeCategory(raw);
  }

  // Register new mini-app
  static async registerMiniApp(payload: CreateMiniAppPayload): Promise<{ message: string; app: MiniAppAdmin }> {
    const res = await this.request<{ message: string; app: any }>('/api/admin/miniapps', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return {
      message: res.message,
      app: normalizeMiniApp(res.app),
    };
  }

  // Update mini-app metadata
  static async updateMiniApp(id: string, payload: UpdateMiniAppPayload): Promise<{ message: string; app: MiniAppAdmin }> {
    const res = await this.request<{ message: string; app: any }>(`/api/admin/miniapps/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return {
      message: res.message,
      app: normalizeMiniApp(res.app),
    };
  }

  // Developer action: Request Go-Live
  static async requestGoLive(id: string): Promise<{ message: string; status: string }> {
    return this.request(`/api/admin/miniapps/${id}/request-golive`, {
      method: 'POST',
    });
  }

  // Bank Admin: Approve mini-app
  static async approveMiniApp(id: string): Promise<{ message: string; status: string }> {
    return this.request(`/api/admin/miniapps/${id}/approve`, {
      method: 'POST',
    });
  }

  // Bank Admin: Reject mini-app
  static async rejectMiniApp(id: string, remarks?: string): Promise<{ message: string; status: string; remarks?: string }> {
    return this.request(`/api/admin/miniapps/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ status: 'Rejected', remarks }),
    });
  }

  // Bank Admin: Update status directly (Kill-Switch: Suspend / Reactivate)
  static async updateStatus(id: string, payload: StatusUpdatePayload): Promise<{ message: string; status: string }> {
    return this.request(`/api/admin/miniapps/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  // Key rotation: Regenerate encryption key
  static async regenerateKey(id: string): Promise<{ message: string; encryptionKey: string }> {
    return this.request(`/api/admin/miniapps/${id}/regenerate-key`, {
      method: 'POST',
    });
  }

  // Get Admin Transactions (all mini-apps with filtering)
  static async getTransactions(params?: {
    miniAppId?: string;
    status?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ total: number; page: number; pageSize: number; data: MiniAppTransaction[] }> {
    const q = new URLSearchParams();
    if (params?.miniAppId) q.append('miniAppId', params.miniAppId);
    if (params?.status && params.status !== 'all') q.append('status', params.status);
    if (params?.search) q.append('search', params.search);
    if (params?.page) q.append('page', params.page.toString());
    if (params?.pageSize) q.append('pageSize', params.pageSize.toString());

    const res = await this.request<any>(`/api/admin/transactions?${q.toString()}`);
    return {
      total: res.total ?? 0,
      page: res.page ?? 1,
      pageSize: res.pageSize ?? 50,
      data: Array.isArray(res.data) ? res.data.map(normalizeTransaction) : [],
    };
  }

  // Get Developer Sandbox Transactions
  static async getDeveloperTransactions(params?: {
    miniAppId?: string;
    status?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ total: number; page: number; pageSize: number; data: MiniAppTransaction[] }> {
    const q = new URLSearchParams();
    if (params?.miniAppId) q.append('miniAppId', params.miniAppId);
    if (params?.status && params.status !== 'all') q.append('status', params.status);
    if (params?.search) q.append('search', params.search);
    if (params?.page) q.append('page', params.page.toString());
    if (params?.pageSize) q.append('pageSize', params.pageSize.toString());

    const res = await this.request<any>(`/Test/Transactions?${q.toString()}`);
    return {
      total: res.total ?? 0,
      page: res.page ?? 1,
      pageSize: res.pageSize ?? 50,
      data: Array.isArray(res.data) ? res.data.map(normalizeTransaction) : [],
    };
  }

  // Developer / Public Sandbox: Simulate Settlement (Customer PIN Confirmation & FlexCube Core Banking Settlement)
  static async simulateSettlement(payload: {
    transactionId: string;
    outcome?: 'SUCCESS' | 'INSUFFICIENT_FUNDS' | 'CUSTOMER_CANCELLED' | 'INVALID_PIN' | 'TIMEOUT';
    reason?: string;
  }): Promise<{
    message: string;
    status: string;
    flexCubeReference?: string;
    callbackResult?: {
      dispatched: boolean;
      callbackUrl?: string;
      statusCode?: number;
      response?: string;
      payload?: any;
    };
  }> {
    return this.request('/api/developer/simulate-settlement', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // ==========================================
  // User Management Methods
  // ==========================================
  static async getUsers(params?: {
    search?: string;
    role?: string;
    miniAppId?: string;
    status?: string;
  }): Promise<{ total: number; data: PortalUserAdmin[] }> {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.role && params.role !== 'all') q.append('role', params.role);
    if (params?.miniAppId && params.miniAppId !== 'all') q.append('miniAppId', params.miniAppId);
    if (params?.status && params.status !== 'all') q.append('status', params.status);

    const res = await this.request<{ total: number; data: any[] }>(`/api/admin/users?${q.toString()}`);
    return {
      total: res.total ?? 0,
      data: Array.isArray(res.data) ? res.data : [],
    };
  }

  static async createUser(payload: CreatePortalUserPayload): Promise<{ message: string; user: PortalUserAdmin }> {
    return this.request('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static async updateUser(id: string, payload: UpdatePortalUserPayload): Promise<{ message: string }> {
    return this.request(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  static async resetUserPassword(id: string, newPassword: string): Promise<{ message: string }> {
    return this.request(`/api/admin/users/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
  }

  static async toggleUserStatus(id: string): Promise<{ message: string; isActive: boolean }> {
    return this.request(`/api/admin/users/${id}/toggle-status`, {
      method: 'POST',
    });
  }

  static async deleteUser(id: string): Promise<{ message: string }> {
    return this.request(`/api/admin/users/${id}`, {
      method: 'DELETE',
    });
  }
}

export interface PortalUserAdmin {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'USER';
  miniAppId?: string | null;
  miniAppName?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePortalUserPayload {
  username: string;
  password: string;
  role: 'ADMIN' | 'USER';
  fullName: string;
  email: string;
  miniAppId?: string;
}

export interface UpdatePortalUserPayload {
  fullName?: string;
  email?: string;
  role?: 'ADMIN' | 'USER';
  miniAppId?: string;
  isActive?: boolean;
}
