// ===========================================
// LIFELINK - Type Definitions
// ===========================================

import { Request } from 'express';
import { UserRole } from '@prisma/client';

export interface AuthPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface MpesaCallbackData {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value: string | number;
        }>;
      };
    };
  };
}

export interface RiskAssessmentResult {
  score: number;
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  flags: string[];
  recommendations: string[];
  requiresImmediate: boolean;
}

export interface DashboardAnalytics {
  revenue: {
    daily: number;
    monthly: number;
    yearly: number;
    growth: number;
  };
  bookings: {
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
  };
  patients: {
    total: number;
    new: number;
    active: number;
    highRisk: number;
  };
  doctors: {
    total: number;
    available: number;
    utilizationRate: number;
  };
  metrics: {
    conversionRate: number;
    cancellationRate: number;
    retentionRate: number;
    avgSessionDuration: number;
  };
}
