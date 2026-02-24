// ===========================================
// LIFELINK - Auth Validation Schemas
// ===========================================

import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const verify2FASchema = z.object({
  userId: z.string().uuid(),
  token: z.string().length(6, '2FA code must be 6 digits'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
});

export const appointmentSchema = z.object({
  doctorId: z.string().uuid('Invalid doctor ID'),
  appointmentDate: z.string().datetime('Invalid date format'),
  startTime: z.string().datetime('Invalid time format'),
  endTime: z.string().datetime('Invalid time format'),
  type: z.enum(['IN_PERSON', 'TELEHEALTH', 'EMERGENCY']),
  reason: z.string().optional(),
  isEmergency: z.boolean().optional().default(false),
});

export const sessionNoteSchema = z.object({
  appointmentId: z.string().uuid(),
  subjective: z.string().optional(),
  objective: z.string().optional(),
  assessment: z.string().optional(),
  plan: z.string().optional(),
  interventions: z.array(z.string()).optional(),
  homework: z.string().optional(),
  nextSessionGoals: z.string().optional(),
  mentalStatusExam: z.record(z.unknown()).optional(),
  riskAssessment: z.record(z.unknown()).optional(),
});

export const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message is required').max(2000, 'Message too long'),
  conversationId: z.string().optional(),
});

export const mpesaPaymentSchema = z.object({
  phoneNumber: z.string().min(10, 'Invalid phone number'),
  amount: z.number().positive('Amount must be positive'),
  appointmentId: z.string().uuid().optional(),
  description: z.string().optional(),
});

export const webinarSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  instructorName: z.string().min(2),
  instructorBio: z.string().optional(),
  category: z.string(),
  tags: z.array(z.string()).optional(),
  isPaid: z.boolean().optional().default(false),
  price: z.number().optional().default(0),
  scheduledAt: z.string().datetime().optional(),
  maxAttendees: z.number().optional(),
});

export const corporateAccountSchema = z.object({
  companyName: z.string().min(2),
  industry: z.string().optional(),
  contactPerson: z.string().min(2),
  contactEmail: z.string().email(),
  contactPhone: z.string(),
  address: z.string().optional(),
  maxEmployees: z.number().int().positive(),
  servicesIncluded: z.array(z.string()),
  billingCycle: z.enum(['monthly', 'quarterly', 'annually']).optional(),
});

export const blogPostSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(50),
  excerpt: z.string().optional(),
  category: z.string(),
  tags: z.array(z.string()).optional(),
  featuredImage: z.string().url().optional(),
  isPublished: z.boolean().optional().default(false),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});
