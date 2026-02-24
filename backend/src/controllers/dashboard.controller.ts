// ===========================================
// LIFELINK - Business Intelligence Dashboard Controller
// ===========================================

import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { AuthRequest, DashboardAnalytics } from '../types';
import { sendSuccess, sendPaginated } from '../utils/response';
import { NotFoundError, ConflictError, AppError } from '../utils/errors';
import { generatePatientNumber } from '../utils/encryption';
import { EmailService } from '../services/email.service';
import logger from '../config/logger';

const emailService = new EmailService();

// Generate a memorable password like "LifeLink-Brave-Lion-42"
function generateMemorablePassword(): string {
  const adjectives = ['Brave','Calm','Gentle','Bright','Strong','Noble','Swift','Kind','True','Pure','Bold','Warm','Clear','Deep','Free'];
  const nouns = ['Lion','Eagle','River','Mountain','Forest','Ocean','Sunrise','Garden','Rainbow','Horizon','Star','Cloud','Valley','Bridge','Harbor'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 90) + 10;
  return `LifeLink-${adj}-${noun}-${num}`;
}

export class DashboardController {
  // Main dashboard analytics
  static async getAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      // Revenue
      const [dailyRevenue, monthlyRevenue, yearlyRevenue, lastMonthRevenue] = await Promise.all([
        prisma.payment.aggregate({ where: { status: 'COMPLETED', paidAt: { gte: startOfDay } }, _sum: { amount: true } }),
        prisma.payment.aggregate({ where: { status: 'COMPLETED', paidAt: { gte: startOfMonth } }, _sum: { amount: true } }),
        prisma.payment.aggregate({ where: { status: 'COMPLETED', paidAt: { gte: startOfYear } }, _sum: { amount: true } }),
        prisma.payment.aggregate({ where: { status: 'COMPLETED', paidAt: { gte: lastMonth, lt: startOfMonth } }, _sum: { amount: true } }),
      ]);

      const monthlyGrowth = lastMonthRevenue._sum.amount
        ? ((( monthlyRevenue._sum.amount || 0) - (lastMonthRevenue._sum.amount || 0)) / (lastMonthRevenue._sum.amount || 1)) * 100
        : 0;

      // Bookings
      const [totalBookings, pendingBookings, completedBookings, cancelledBookings] = await Promise.all([
        prisma.appointment.count({ where: { createdAt: { gte: startOfMonth } } }),
        prisma.appointment.count({ where: { status: 'PENDING' } }),
        prisma.appointment.count({ where: { status: 'COMPLETED', createdAt: { gte: startOfMonth } } }),
        prisma.appointment.count({ where: { status: 'CANCELLED', createdAt: { gte: startOfMonth } } }),
      ]);

      // Patients
      const [totalPatients, newPatients, activePatients, highRiskPatients] = await Promise.all([
        prisma.patient.count(),
        prisma.patient.count({ where: { createdAt: { gte: startOfMonth } } }),
        prisma.patient.count({ where: { isActive: true } }),
        prisma.patient.count({ where: { riskLevel: { in: ['HIGH', 'CRITICAL'] } } }),
      ]);

      // Doctors
      const [totalDoctors, availableDoctors] = await Promise.all([
        prisma.doctor.count(),
        prisma.doctor.count({ where: { isAvailable: true } }),
      ]);

      // Metrics
      const cancellationRate = totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0;
      const conversionRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;

      // Unresolved risk alerts
      const unresolvedAlerts = await prisma.riskAlert.count({ where: { isResolved: false } });

      const analytics: DashboardAnalytics = {
        revenue: {
          daily: dailyRevenue._sum.amount || 0,
          monthly: monthlyRevenue._sum.amount || 0,
          yearly: yearlyRevenue._sum.amount || 0,
          growth: Math.round(monthlyGrowth * 100) / 100,
        },
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          completed: completedBookings,
          cancelled: cancelledBookings,
        },
        patients: {
          total: totalPatients,
          new: newPatients,
          active: activePatients,
          highRisk: highRiskPatients,
        },
        doctors: {
          total: totalDoctors,
          available: availableDoctors,
          utilizationRate: totalDoctors > 0
            ? Math.round((completedBookings / (totalDoctors * 30)) * 100)
            : 0,
        },
        metrics: {
          conversionRate: Math.round(conversionRate * 100) / 100,
          cancellationRate: Math.round(cancellationRate * 100) / 100,
          retentionRate: 0,
          avgSessionDuration: 0,
        },
      };

      sendSuccess(res, { ...analytics, unresolvedAlerts });
    } catch (error) {
      next(error);
    }
  }

  // Revenue chart data
  static async getRevenueChart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { period = 'monthly' } = req.query as any;
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'daily':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
          break;
        case 'yearly':
          startDate = new Date(now.getFullYear() - 5, 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), 0, 1);
      }

      const revenue = await prisma.revenueRecord.findMany({
        where: { date: { gte: startDate } },
        orderBy: { date: 'asc' },
      });

      sendSuccess(res, revenue);
    } catch (error) {
      next(error);
    }
  }

  // Geographic distribution
  static async getGeoDistribution(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const distribution = await prisma.profile.groupBy({
        by: ['county'],
        _count: { county: true },
        where: { county: { not: null } },
        orderBy: { _count: { county: 'desc' } },
      });

      sendSuccess(res, distribution);
    } catch (error) {
      next(error);
    }
  }

  // Corporate analytics
  static async getCorporateAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const corporates = await prisma.corporateAccount.findMany({
        where: { contractStatus: 'ACTIVE' },
        include: {
          employees: true,
          usageReports: { orderBy: { reportMonth: 'desc' }, take: 1 },
          _count: { select: { employees: true } },
        },
      });

      const totalContractValue = corporates.reduce((sum, c) => sum + c.contractValue, 0);
      const totalEmployees = corporates.reduce((sum, c) => sum + c._count.employees, 0);

      sendSuccess(res, {
        totalCorporates: corporates.length,
        totalContractValue,
        totalEmployees,
        corporates,
      });
    } catch (error) {
      next(error);
    }
  }

  // Growth forecast
  static async getGrowthForecast(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const last6Months = await prisma.revenueRecord.groupBy({
        by: ['date'],
        _sum: { amount: true },
        where: {
          date: { gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) },
        },
        orderBy: { date: 'asc' },
      });

      // Simple growth forecast based on trend
      const revenues = last6Months.map(r => r._sum.amount || 0);
      const avgGrowth = revenues.length > 1
        ? revenues.reduce((sum, val, i, arr) => {
            if (i === 0) return 0;
            return sum + (val - arr[i - 1]) / arr[i - 1];
          }, 0) / (revenues.length - 1)
        : 0;

      const forecast = [];
      let lastRevenue = revenues[revenues.length - 1] || 0;
      for (let i = 1; i <= 6; i++) {
        lastRevenue = lastRevenue * (1 + avgGrowth);
        forecast.push({
          month: new Date(new Date().setMonth(new Date().getMonth() + i)).toISOString(),
          projected: Math.round(lastRevenue),
        });
      }

      sendSuccess(res, { historical: last6Months, forecast, avgGrowthRate: Math.round(avgGrowth * 10000) / 100 });
    } catch (error) {
      next(error);
    }
  }

  // ===== ADMIN: Create doctor account =====
  static async createDoctor(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, firstName, lastName, phone, specialization, licenseNumber, consultationFee, teleHealthFee } = req.body;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) throw new ConflictError('Email already registered');

      const password = generateMemorablePassword();
      const passwordHash = await bcrypt.hash(password, 12);

      const user = await prisma.user.create({
        data: {
          email,
          phone: phone || null,
          passwordHash,
          role: 'DOCTOR',
          isActive: true,
          isVerified: true,
          profile: {
            create: { firstName, lastName },
          },
          doctor: {
            create: {
              licenseNumber: licenseNumber || `LIC-${Date.now().toString(36).toUpperCase()}`,
              specialization: specialization || [],
              consultationFee: consultationFee || 0,
              teleHealthFee: teleHealthFee || 0,
              isAvailable: true,
            },
          },
        },
        include: { profile: true, doctor: true },
      });

      // Send credentials email
      try {
        await emailService.sendDoctorCredentials(email, firstName, password);
      } catch (err) {
        logger.error('Failed to send doctor credentials email:', err);
      }

      await prisma.auditLog.create({
        data: {
          userId: req.user!.userId,
          action: 'CREATE_DOCTOR',
          entity: 'User',
          entityId: user.id,
          newData: { email, firstName, lastName, specialization } as any,
        },
      });

      sendSuccess(res, {
        user: { id: user.id, email: user.email, role: user.role, profile: user.profile, doctor: user.doctor },
        generatedPassword: password,
      }, 'Doctor account created', 201);
    } catch (error) {
      next(error);
    }
  }

  // ===== ADMIN: List all doctors =====
  static async listDoctors(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const doctors = await prisma.doctor.findMany({
        include: {
          user: { include: { profile: true }, select: { id: true, email: true, phone: true, role: true, isActive: true, lastLoginAt: true, profile: true } },
          _count: { select: { appointments: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      sendSuccess(res, doctors);
    } catch (error) {
      next(error);
    }
  }

  // ===== ADMIN: List all patients =====
  static async listPatients(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 20, search } = req.query as any;
      const skip = (Number(page) - 1) * Number(limit);
      const where: any = {};
      if (search) {
        where.user = {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { profile: { firstName: { contains: search, mode: 'insensitive' } } },
            { profile: { lastName: { contains: search, mode: 'insensitive' } } },
          ],
        };
      }

      const [patients, total] = await Promise.all([
        prisma.patient.findMany({
          where,
          skip,
          take: Number(limit),
          include: {
            user: { include: { profile: true }, select: { id: true, email: true, isActive: true, lastLoginAt: true, profile: true } },
            _count: { select: { appointments: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.patient.count({ where }),
      ]);
      sendPaginated(res, patients, total, Number(page), Number(limit));
    } catch (error) {
      next(error);
    }
  }

  // ===== ADMIN: List risk alerts =====
  static async listRiskAlerts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { resolved } = req.query as any;
      const where: any = {};
      if (resolved === 'false') where.isResolved = false;
      if (resolved === 'true') where.isResolved = true;

      const alerts = await prisma.riskAlert.findMany({
        where,
        include: { patient: { include: { user: { include: { profile: true } } } } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      sendSuccess(res, alerts);
    } catch (error) {
      next(error);
    }
  }

  // ===== ADMIN: Resolve risk alert =====
  static async resolveAlert(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const alert = await prisma.riskAlert.update({
        where: { id: req.params.id },
        data: { isResolved: true, resolvedBy: req.user!.userId, resolvedAt: new Date(), resolution: req.body.resolution || 'Resolved by admin' },
      });
      sendSuccess(res, alert, 'Alert resolved');
    } catch (error) {
      next(error);
    }
  }

  // ===== ADMIN: Audit logs =====
  static async getAuditLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 30 } = req.query as any;
      const skip = (Number(page) - 1) * Number(limit);
      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { email: true, role: true, profile: { select: { firstName: true, lastName: true } } } } },
        }),
        prisma.auditLog.count(),
      ]);
      sendPaginated(res, logs, total, Number(page), Number(limit));
    } catch (error) {
      next(error);
    }
  }

  // ===== SYSTEM HEALTH =====
  static async getSystemHealth(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const start = Date.now();
      await prisma.$connect();
      const dbLatency = Date.now() - start;

      const [userCount, appointmentCount, activeAlerts] = await Promise.all([
        prisma.user.count(),
        prisma.appointment.count({ where: { status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] } } }),
        prisma.riskAlert.count({ where: { isResolved: false } }),
      ]);

      sendSuccess(res, {
        status: 'operational',
        dbLatency: `${dbLatency}ms`,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        counts: { users: userCount, activeAppointments: appointmentCount, unresolvedAlerts: activeAlerts },
      });
    } catch (error) {
      next(error);
    }
  }

  // ===== DOCTOR: My dashboard =====
  static async getDoctorDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const doctor = await prisma.doctor.findUnique({ where: { userId: req.user!.userId } });
      if (!doctor) throw new NotFoundError('Doctor profile');

      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
      const startOfWeek = new Date(startOfDay);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

      const [todayAppointments, weekAppointments, myPatients, activeAlerts, recentNotes] = await Promise.all([
        prisma.appointment.findMany({
          where: { doctorId: doctor.id, appointmentDate: { gte: startOfDay, lt: endOfDay } },
          include: { patient: { include: { user: { include: { profile: true } } } } },
          orderBy: { startTime: 'asc' },
        }),
        prisma.appointment.count({
          where: { doctorId: doctor.id, appointmentDate: { gte: startOfWeek } },
        }),
        prisma.appointment.groupBy({
          by: ['patientId'],
          where: { doctorId: doctor.id },
          _count: true,
        }),
        prisma.riskAlert.findMany({
          where: { isResolved: false, patient: { appointments: { some: { doctorId: doctor.id } } } },
          include: { patient: { include: { user: { include: { profile: true } } } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
        prisma.sessionNote.findMany({
          where: { doctorId: doctor.id },
          include: { patient: { include: { user: { include: { profile: true } } } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
      ]);

      sendSuccess(res, {
        doctor,
        today: todayAppointments,
        weekCount: weekAppointments,
        patientCount: myPatients.length,
        alerts: activeAlerts,
        recentNotes,
      });
    } catch (error) {
      next(error);
    }
  }

  // ===== DOCTOR: My patients =====
  static async getDoctorPatients(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const doctor = await prisma.doctor.findUnique({ where: { userId: req.user!.userId } });
      if (!doctor) throw new NotFoundError('Doctor profile');

      const patientIds = await prisma.appointment.groupBy({
        by: ['patientId'],
        where: { doctorId: doctor.id },
      });

      const patients = await prisma.patient.findMany({
        where: { id: { in: patientIds.map(p => p.patientId) } },
        include: {
          user: { include: { profile: true } },
          _count: { select: { appointments: true, sessionNotes: true } },
        },
      });
      sendSuccess(res, patients);
    } catch (error) {
      next(error);
    }
  }

  // ===== PATIENT: My dashboard =====
  static async getPatientDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const patient = await prisma.patient.findUnique({
        where: { userId: req.user!.userId },
        include: { user: { include: { profile: true } } },
      });
      if (!patient) throw new NotFoundError('Patient profile');

      const [upcoming, progress, unreadNotifs, recentRecords] = await Promise.all([
        prisma.appointment.findMany({
          where: { patientId: patient.id, status: { in: ['PENDING', 'CONFIRMED'] }, appointmentDate: { gte: new Date() } },
          include: { doctor: { include: { user: { include: { profile: true } } } } },
          orderBy: { appointmentDate: 'asc' },
          take: 5,
        }),
        prisma.progressTracking.findMany({
          where: { patientId: patient.id },
          orderBy: { recordedAt: 'desc' },
          take: 30,
        }),
        prisma.notification.count({ where: { userId: req.user!.userId, isRead: false } }),
        prisma.medicalRecord.findMany({
          where: { patientId: patient.id },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { doctor: { include: { user: { include: { profile: true } } } } },
        }),
      ]);

      // Compute wellness metrics from progress data
      const metricMap: Record<string, number> = {};
      for (const p of progress) {
        if (!metricMap[p.metricName]) metricMap[p.metricName] = p.metricValue;
      }

      sendSuccess(res, {
        patient,
        upcomingAppointments: upcoming,
        wellness: metricMap,
        unreadNotifications: unreadNotifs,
        recentRecords,
      });
    } catch (error) {
      next(error);
    }
  }

  // ===== PATIENT: Record wellness metric =====
  static async recordWellness(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const patient = await prisma.patient.findUnique({ where: { userId: req.user!.userId } });
      if (!patient) throw new NotFoundError('Patient profile');

      const { metricName, metricValue, notes } = req.body;
      const record = await prisma.progressTracking.create({
        data: { patientId: patient.id, metricName, metricValue: Number(metricValue), notes },
      });
      sendSuccess(res, record, 'Wellness metric recorded');
    } catch (error) {
      next(error);
    }
  }

  // ===== CORPORATE MANAGER: My dashboard =====
  static async getCorporateDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const corporate = await prisma.corporateAccount.findUnique({
        where: { managerId: req.user!.userId },
        include: {
          employees: {
            include: { patient: { include: { user: { include: { profile: true } }, _count: { select: { appointments: true } } } } },
          },
          usageReports: { orderBy: { reportMonth: 'desc' }, take: 6 },
          invoices: { orderBy: { createdAt: 'desc' }, take: 5 },
          _count: { select: { employees: true } },
        },
      });

      if (!corporate) throw new NotFoundError('Corporate account');

      // Compute utilization
      const totalSessions = corporate.employees.reduce((sum, emp) => sum + (emp.patient?._count?.appointments || 0), 0);

      sendSuccess(res, {
        corporate,
        totalEmployees: corporate._count.employees,
        totalSessions,
        usageReports: corporate.usageReports,
        invoices: corporate.invoices,
      });
    } catch (error) {
      next(error);
    }
  }

  // ===== ADMIN: Assign patient to doctor =====
  static async assignPatientToDoctor(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { patientId, doctorId } = req.body;
      if (!patientId) throw new AppError('patientId is required', 400);

      // If doctorId is null/empty, unassign
      const patient = await prisma.patient.update({
        where: { id: patientId },
        data: { assignedDoctorId: doctorId || null },
        include: {
          user: { include: { profile: true } },
          assignedDoctor: { include: { user: { include: { profile: true } } } },
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: req.user!.userId,
          action: doctorId ? 'ASSIGN_PATIENT_TO_DOCTOR' : 'UNASSIGN_PATIENT',
          entity: 'Patient',
          entityId: patientId,
          newData: { doctorId } as any,
        },
      });

      sendSuccess(res, patient, doctorId ? 'Patient assigned to doctor' : 'Patient unassigned');
    } catch (error) {
      next(error);
    }
  }

  // ===== ADMIN: Get single patient detail =====
  static async getPatientDetail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const patient = await prisma.patient.findUnique({
        where: { id: req.params.id },
        include: {
          user: { include: { profile: true } },
          assignedDoctor: { include: { user: { include: { profile: true } } } },
          appointments: {
            include: { doctor: { include: { user: { include: { profile: true } } } } },
            orderBy: { appointmentDate: 'desc' },
            take: 10,
          },
          medicalRecords: { orderBy: { createdAt: 'desc' }, take: 5 },
          prescriptions: { where: { isActive: true }, orderBy: { createdAt: 'desc' } },
          riskAlerts: { where: { isResolved: false }, orderBy: { createdAt: 'desc' } },
          progressTracking: { orderBy: { recordedAt: 'desc' }, take: 20 },
          _count: { select: { appointments: true, sessionNotes: true, medicalRecords: true } },
        },
      });
      if (!patient) throw new NotFoundError('Patient');
      sendSuccess(res, patient);
    } catch (error) {
      next(error);
    }
  }

  // ===== ADMIN: Get single doctor detail =====
  static async getDoctorDetail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const doctor = await prisma.doctor.findUnique({
        where: { id: req.params.id },
        include: {
          user: { include: { profile: true } },
          assignedPatients: { include: { user: { include: { profile: true } } } },
          _count: { select: { appointments: true, assignedPatients: true, telehealthSessions: true } },
        },
      });
      if (!doctor) throw new NotFoundError('Doctor');
      sendSuccess(res, doctor);
    } catch (error) {
      next(error);
    }
  }

  // ===== ADMIN: Update doctor =====
  static async updateDoctor(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, phone, specialization, consultationFee, teleHealthFee, isAvailable } = req.body;
      const doctor = await prisma.doctor.findUnique({ where: { id: req.params.id }, include: { user: true } });
      if (!doctor) throw new NotFoundError('Doctor');

      // Update user profile
      if (firstName || lastName) {
        await prisma.profile.update({
          where: { userId: doctor.userId },
          data: { ...(firstName && { firstName }), ...(lastName && { lastName }) },
        });
      }
      if (phone) {
        await prisma.user.update({ where: { id: doctor.userId }, data: { phone } });
      }

      const updated = await prisma.doctor.update({
        where: { id: req.params.id },
        data: {
          ...(specialization && { specialization }),
          ...(consultationFee !== undefined && { consultationFee: Number(consultationFee) }),
          ...(teleHealthFee !== undefined && { teleHealthFee: Number(teleHealthFee) }),
          ...(isAvailable !== undefined && { isAvailable }),
        },
        include: { user: { include: { profile: true } } },
      });

      sendSuccess(res, updated, 'Doctor updated');
    } catch (error) {
      next(error);
    }
  }

  // ===== ADMIN: Deactivate/activate user =====
  static async toggleUserActive(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.params.id } });
      if (!user) throw new NotFoundError('User');
      const updated = await prisma.user.update({
        where: { id: req.params.id },
        data: { isActive: !user.isActive },
        include: { profile: true },
      });

      await prisma.auditLog.create({
        data: {
          userId: req.user!.userId,
          action: updated.isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
          entity: 'User',
          entityId: req.params.id,
        },
      });

      sendSuccess(res, updated, `User ${updated.isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      next(error);
    }
  }

  // ===== ADMIN: Telehealth sessions overview =====
  static async listTelehealthSessions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const sessions = await prisma.telehealthSession.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          doctor: { include: { user: { include: { profile: true } } } },
          appointment: { include: { patient: { include: { user: { include: { profile: true } } } } } },
        },
      });

      const activeSessions = sessions.filter(s => s.status === 'ACTIVE');
      const scheduled = sessions.filter(s => s.status === 'SCHEDULED');
      const completed = sessions.filter(s => s.status === 'COMPLETED');

      sendSuccess(res, {
        sessions,
        activeSessions: activeSessions.length,
        scheduledToday: scheduled.length,
        completedTotal: completed.length,
        completionRate: sessions.length > 0 ? Math.round((completed.length / sessions.length) * 100) : 0,
      });
    } catch (error) {
      next(error);
    }
  }

  // ===== ADMIN: Webinar management =====
  static async listWebinars(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const webinars = await prisma.webinar.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { registrations: true, comments: true } },
        },
      });
      sendSuccess(res, webinars);
    } catch (error) {
      next(error);
    }
  }

  static async createWebinar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { title, description, instructorName, instructorBio, category, tags, scheduledAt, maxAttendees, isPaid, price } = req.body;
      const webinar = await prisma.webinar.create({
        data: {
          title,
          description,
          instructorName,
          instructorBio: instructorBio || null,
          category: category || 'Mental Health',
          tags: tags || [],
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
          maxAttendees: maxAttendees || null,
          isPaid: isPaid || false,
          price: price || 0,
          status: 'SCHEDULED',
        },
      });
      sendSuccess(res, webinar, 'Webinar created', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateWebinar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { title, description, instructorName, category, tags, scheduledAt, status, maxAttendees, isPaid, price } = req.body;
      const webinar = await prisma.webinar.update({
        where: { id: req.params.id },
        data: {
          ...(title && { title }),
          ...(description && { description }),
          ...(instructorName && { instructorName }),
          ...(category && { category }),
          ...(tags && { tags }),
          ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
          ...(status && { status }),
          ...(maxAttendees !== undefined && { maxAttendees }),
          ...(isPaid !== undefined && { isPaid }),
          ...(price !== undefined && { price }),
        },
      });
      sendSuccess(res, webinar, 'Webinar updated');
    } catch (error) {
      next(error);
    }
  }

  // ===== ADMIN: Invoice management =====
  static async createInvoice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { patientId, corporateId, items, subtotal, tax, discount, dueDate, notes } = req.body;
      const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const total = (subtotal || 0) + (tax || 0) - (discount || 0);

      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          patientId: patientId || null,
          corporateId: corporateId || null,
          items: items || [],
          subtotal: subtotal || 0,
          tax: tax || 0,
          discount: discount || 0,
          total,
          dueDate: new Date(dueDate),
          notes: notes || null,
          status: 'SENT',
        },
        include: { patient: { include: { user: { include: { profile: true } } } } },
      });

      sendSuccess(res, invoice, 'Invoice created', 201);
    } catch (error) {
      next(error);
    }
  }

  static async listInvoices(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 20, status } = req.query as any;
      const skip = (Number(page) - 1) * Number(limit);
      const where: any = {};
      if (status) where.status = status;

      const [invoices, total] = await Promise.all([
        prisma.invoice.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            patient: { include: { user: { include: { profile: true } } } },
            corporate: true,
          },
        }),
        prisma.invoice.count({ where }),
      ]);
      sendPaginated(res, invoices, total, Number(page), Number(limit));
    } catch (error) {
      next(error);
    }
  }

  // ===== ADMIN: Recent activity =====
  static async getRecentActivity(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const [recentAppointments, recentPayments, recentRegistrations, recentAlerts] = await Promise.all([
        prisma.appointment.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { patient: { include: { user: { include: { profile: true } } } } },
        }),
        prisma.payment.findMany({
          where: { status: 'COMPLETED' },
          orderBy: { paidAt: 'desc' },
          take: 5,
        }),
        prisma.user.findMany({
          where: { role: 'PATIENT' },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { profile: true },
        }),
        prisma.riskAlert.findMany({
          where: { isResolved: false },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { patient: { include: { user: { include: { profile: true } } } } },
        }),
      ]);

      // Merge and sort by time
      const activities: any[] = [];
      recentAppointments.forEach(a => activities.push({ type: 'appointment', message: `New appointment booked by ${a.patient?.user?.profile?.firstName || 'Patient'}`, time: a.createdAt, icon: 'Calendar' }));
      recentPayments.forEach(p => activities.push({ type: 'payment', message: `Payment of KES ${p.amount} received via ${p.method}`, time: p.paidAt || p.createdAt, icon: 'DollarSign' }));
      recentRegistrations.forEach(u => activities.push({ type: 'registration', message: `New patient registered: ${u.profile?.firstName || 'User'}`, time: u.createdAt, icon: 'Users' }));
      recentAlerts.forEach(a => activities.push({ type: 'alert', message: `Risk alert: ${a.description?.substring(0, 60)}`, time: a.createdAt, icon: 'AlertTriangle' }));

      activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

      sendSuccess(res, activities.slice(0, 15));
    } catch (error) {
      next(error);
    }
  }

  // ===== ADMIN: Change password for a user =====
  static async resetUserPassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const password = generateMemorablePassword();
      const passwordHash = await bcrypt.hash(password, 12);

      const user = await prisma.user.update({
        where: { id: req.params.id },
        data: { passwordHash },
        include: { profile: true },
      });

      try {
        await emailService.sendDoctorCredentials(user.email, user.profile?.firstName || 'User', password);
      } catch (err) {
        logger.error('Failed to send password reset email:', err);
      }

      await prisma.auditLog.create({
        data: {
          userId: req.user!.userId,
          action: 'RESET_USER_PASSWORD',
          entity: 'User',
          entityId: req.params.id,
        },
      });

      sendSuccess(res, { email: user.email, generatedPassword: password }, 'Password reset');
    } catch (error) {
      next(error);
    }
  }

  // ===== CORPORATE: Public join =====
  static async corporateJoin(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { companyName, industry, contactEmail, contactPhone, contactFirstName, contactLastName, password, address, maxEmployees } = req.body;

      const existing = await prisma.user.findUnique({ where: { email: contactEmail } });
      if (existing) throw new ConflictError('Email already registered');

      const passwordHash = await bcrypt.hash(password, 12);

      const user = await prisma.user.create({
        data: {
          email: contactEmail,
          phone: contactPhone || null,
          passwordHash,
          role: 'CORPORATE_MANAGER',
          isActive: true,
          isVerified: true,
          profile: {
            create: { firstName: contactFirstName, lastName: contactLastName },
          },
          corporateManager: {
            create: {
              companyName,
              industry: industry || null,
              contactPerson: `${contactFirstName} ${contactLastName}`,
              contactEmail,
              contactPhone: contactPhone || '',
              address: address || null,
              contractStatus: 'ACTIVE',
              contractStartDate: new Date(),
              maxEmployees: maxEmployees || 50,
              servicesIncluded: ['Individual Therapy', 'Group Therapy', 'Telehealth', 'Webinars'],
            },
          },
        },
        include: { profile: true, corporateManager: true },
      });

      // Generate tokens
      const jwt = await import('jsonwebtoken');
      const config = (await import('../config')).default;
      const { v4: uuidv4 } = await import('uuid');
      const accessToken = jwt.default.sign(
        { userId: user.id, email: user.email, role: user.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiration as any }
      );
      const refreshToken = uuidv4();
      await prisma.refreshSession.create({
        data: { userId: user.id, token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      });

      try {
        await emailService.sendWelcomeEmail(contactEmail, contactFirstName);
      } catch (err) {
        logger.error('Failed to send corporate welcome email:', err);
      }

      sendSuccess(res, {
        user: { id: user.id, email: user.email, role: user.role, profile: user.profile },
        corporate: user.corporateManager,
        accessToken,
        refreshToken,
      }, 'Corporate account created', 201);
    } catch (error) {
      next(error);
    }
  }
}
