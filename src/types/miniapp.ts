export type MiniAppStatus = 'Sandbox' | 'PendingReview' | 'Active' | 'Suspended' | 'Rejected';

export interface MiniAppAdmin {
  id: string;
  name: string;
  url: string;
  logoUrl: string;
  status: MiniAppStatus;
  themeColor: string;
  rank: number;
  categoryId: string | null;
  categoryName: string | null;
  uniqueName: string | null;
  description: string | null;
  encryptionKey: string;
  holdingAccount: string;
  requiresCamera: boolean;
  requiresLocation: boolean;
  requiresFileAccess: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
  colorHex: string;
  description: string | null;
  rank: number;
  appCount: number;
}

export interface CreateCategoryPayload {
  name: string;
  iconName?: string;
  colorHex?: string;
  description?: string;
  rank?: number;
}

export interface CreateMiniAppPayload {
  name: string;
  uniqueName?: string;
  url: string;
  logoUrl?: string;
  holdingAccount: string; // Strictly required!
  categoryId?: string | null;
  description?: string;
  themeColor?: string;
  requiresCamera?: boolean;
  requiresLocation?: boolean;
  requiresFileAccess?: boolean;
  customEncryptionKey?: string;
  initialStatus?: MiniAppStatus;
}

export interface UpdateMiniAppPayload {
  name?: string;
  uniqueName?: string;
  url?: string;
  logoUrl?: string;
  categoryId?: string | null;
  description?: string;
  themeColor?: string;
  rank?: number;
  requiresCamera?: boolean;
  requiresLocation?: boolean;
  requiresFileAccess?: boolean;
}

export interface StatusUpdatePayload {
  status: MiniAppStatus;
  remarks?: string;
}

export interface MiniAppTransaction {
  id: string;
  originatorId: string;
  phoneNumber: string;
  cifNumber: string;
  accountId: string;
  amount: number;
  transactionId: string;
  transactionDate: string;
  flexCubeReference: string | null;
  status: number; // 0=Pending, 1=Success, 2=Failed, 3=Reversed
  statusMessage: string | null;
  miniAppId: string;
  miniAppName: string | null;
  transactionType: string | null;
  remarks: string | null;
  createdAt: string;
}
