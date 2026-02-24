// ===========================================
// LIFELINK - Corporate Wellness Controller
// ===========================================

import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import { sendSuccess, sendPaginated } from '../utils/response';
import { NotFoundError } from '../utils/errors';
import { generatePatientNumber } from '../utils/encryption';

export class CorporateController {
  // Create corporate account
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const account = await prisma.corporateAccount.create({
        data: {
          ...req.body,
          contractStatus: 'DRAFT',
        },
      });

      sendSuccess(res, account, 'Corporate account created', 201);
    } catch (error) {
      next(error);
    }
  }

  // List corporate accounts
  static async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, status } = req.query as any;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (status) where.contractStatus = status;

      const [accounts, total] = await Promise.all([
        prisma.corporateAccount.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: { _count: { select: { employees: true } } },
        }),
        prisma.corporateAccount.count({ where }),
      ]);

      sendPaginated(res, accounts, total, Number(page), Number(limit));
    } catch (error) {
      next(error);
    }
  }

  // Get single account
  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const account = await prisma.corporateAccount.findUnique({
        where: { id: req.params.id },
        include: {
          employees: {
            include: { patient: { include: { user: { include: { profile: true } } } } },
          },
          usageReports: { orderBy: { reportMonth: 'desc' }, take: 12 },
          invoices: { orderBy: { createdAt: 'desc' }, take: 10 },
          _count: { select: { employees: true } },
        },
      });

      if (!account) throw new NotFoundError('Corporate account');

      sendSuccess(res, account);
    } catch (error) {
      next(error);
    }
  }

  // Update account
  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const account = await prisma.corporateAccount.update({
        where: { id: req.params.id },
        data: req.body,
      });

      sendSuccess(res, account, 'Corporate account updated');
    } catch (error) {
      next(error);
    }
  }

  // Bulk onboard employees
  static async onboardEmployees(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { corporateId } = req.params;
      const { employees } = req.body; // Array of { email, firstName, lastName, phone, department, employeeId }

      const results = [];

      for (const emp of employees) {
        try {
          // Create user + patient
          const user = await prisma.user.create({
            data: {
              email: emp.email,
              phone: emp.phone,
              passwordHash: '$2a$12$temp.hash.to.be.reset', // Temporary, must reset
              role: 'PATIENT',
              profile: {
                create: {
                  firstName: emp.firstName,
                  lastName: emp.lastName,
                },
              },
              patient: {
                create: {
                  patientNumber: generatePatientNumber(),
                },
              },
            },
            include: { patient: true },
          });

          // Link to corporate
          if (user.patient) {
            await prisma.corporateEmployee.create({
              data: {
                corporateId,
                patientId: user.patient.id,
                employeeId: emp.employeeId,
                department: emp.department,
              },
            });
          }

          results.push({ email: emp.email, status: 'success' });
        } catch (error: any) {
          results.push({ email: emp.email, status: 'failed', error: error.message });
        }
      }

      sendSuccess(res, results, 'Employee onboarding completed', 201);
    } catch (error) {
      next(error);
    }
  }

  // Get usage report
  static async getUsageReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { corporateId } = req.params;
      const { month, year } = req.query as any;

      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0);

      // Get session count for corporate employees
      const employees = await prisma.corporateEmployee.findMany({
        where: { corporateId, isActive: true },
        include: { patient: true },
      });

      const patientIds = employees.map(e => e.patientId);

      const sessions = await prisma.appointment.count({
        where: {
          patientId: { in: patientIds },
          status: 'COMPLETED',
          completedAt: { gte: startDate, lte: endDate },
        },
      });

      const uniqueUsers = await prisma.appointment.findMany({
        where: {
          patientId: { in: patientIds },
          status: 'COMPLETED',
          completedAt: { gte: startDate, lte: endDate },
        },
        distinct: ['patientId'],
        select: { patientId: true },
      });

      const totalCost = await prisma.payment.aggregate({
        where: {
          appointment: { patientId: { in: patientIds } },
          status: 'COMPLETED',
          paidAt: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      });

      const report = await prisma.corporateUsageReport.create({
        data: {
          corporateId,
          reportMonth: startDate,
          totalSessions: sessions,
          uniqueEmployees: uniqueUsers.length,
          totalCost: totalCost._sum.amount || 0,
          reportData: {
            totalEmployees: employees.length,
            activeEmployees: uniqueUsers.length,
            utilizationRate: employees.length > 0
              ? Math.round((uniqueUsers.length / employees.length) * 100)
              : 0,
          },
        },
      });

      sendSuccess(res, report);
    } catch (error) {
      next(error);
    }
  }

  // HR Dashboard view
  static async getHRDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { corporateId } = req.params;

      const [account, employeeCount, activeThisMonth, recentReports] = await Promise.all([
        prisma.corporateAccount.findUnique({ where: { id: corporateId } }),
        prisma.corporateEmployee.count({ where: { corporateId, isActive: true } }),
        prisma.corporateUsageReport.findFirst({
          where: { corporateId },
          orderBy: { reportMonth: 'desc' },
        }),
        prisma.corporateUsageReport.findMany({
          where: { corporateId },
          orderBy: { reportMonth: 'desc' },
          take: 12,
        }),
      ]);

      sendSuccess(res, {
        account,
        totalEmployees: employeeCount,
        currentMonthUsage: activeThisMonth,
        usageTrend: recentReports,
      });
    } catch (error) {
      next(error);
    }
  }
}
