export type PlanTier = 'free' | 'pro' | 'syndicate';
export type BillingInterval = 'monthly' | 'annual';
export type PaymentMethod = 'card' | 'instant_eft';

export interface PlanPricing {
  id: PlanTier;
  name: string;
  badge?: string;
  tagline: string;
  monthlyZar: number;
  annualMonthlyZar: number;
  trialDays?: number;
  features: string[];
  notIncluded?: string[];
  popular?: boolean;
  ctaText: string;
}

export interface BankOption {
  id: string;
  name: string;
  color: string;
  badge: string;
}

export interface CheckoutRequest {
  planId: PlanTier;
  billingInterval: BillingInterval;
  paymentMethod: PaymentMethod;
  customerName: string;
  customerEmail: string;
  cardDetails?: {
    cardNumberLast4?: string;
    cardHolder?: string;
    expiry?: string;
  };
  eftDetails?: {
    bank: string;
    accountHolderPhone?: string;
  };
}

export interface SubscriptionRecord {
  id: string;
  planId: PlanTier;
  planName: string;
  billingInterval: BillingInterval;
  amountZar: number;
  vatZar: number;
  licenseKey: string;
  txRef: string;
  createdAt: string;
  expiresAt: string;
  status: 'active' | 'trialing' | 'expired';
  customerName: string;
  customerEmail: string;
  paymentMethod: PaymentMethod;
  paymentDetailsSummary: string;
}
