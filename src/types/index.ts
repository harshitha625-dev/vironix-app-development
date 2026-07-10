export type PlanTier = 'free' | 'plus' | 'pro' | 'premium';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  plan: PlanTier;
  credits: number;
  createdAt: string;
}

export type ProjectType = 'text_to_video' | 'image_to_video' | 'reference_video' | 'manual_edit';
export type ProjectStatus = 'draft' | 'queued' | 'generating' | 'processing' | 'completed' | 'failed';

export interface Project {
  id: string;
  userId: string;
  type: ProjectType;
  status: ProjectStatus;
  prompt: string | null;
  params: Record<string, unknown>;
  thumbnailUrl: string | null;
  outputUrl: string | null;
  creditsCost: number;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'recharge' | 'spend' | 'refund' | 'promo' | 'bonus';

export interface CreditTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number; // positive for credit, negative for debit
  balanceAfter: number;
  description: string;
  createdAt: string;
}

export interface Plan {
  id: PlanTier;
  name: string;
  priceInr: number;
  creditsPerMonth: number;
  perks: string[];
}

export type NotificationCategory = 'generation' | 'credits' | 'updates' | 'security' | 'maintenance';

export interface AppNotification {
  id: string;
  userId: string;
  category: NotificationCategory;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface Template {
  id: string;
  title: string;
  thumbnailUrl: string;
  type: ProjectType;
  trending: boolean;
}
