// ===========================================
// LIFELINK - Patient Controller
// ===========================================

import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import { sendSuccess, sendPaginated } from '../utils/response';
import { NotFoundError } from '../utils/errors';
import { AIService } from '../services/ai.service';

const aiService = new AIService();

export class PatientController {
  // Get all patients (admin/doctor only)
  static async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, search, riskLevel } = req.query as any;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (riskLevel) where.riskLevel = riskLevel;
      if (search) {
        where.OR = [
          { patientNumber: { contains: search, mode: 'insensitive' } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
          { user: { profile: { firstName: { contains: search, mode: 'insensitive' } } } },
          { user: { profile: { lastName: { contains: search, mode: 'insensitive' } } } },
        ];
      }

      const [patients, total] = await Promise.all([
        prisma.patient.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              include: { profile: true },
              select: { id: true, email: true, phone: true, role: true, isActive: true, profile: true, lastLoginAt: true },
            } as any,
          },
        }),
        prisma.patient.count({ where }),
      ]);

      sendPaginated(res, patients, total, Number(page), Number(limit));
    } catch (error) {
      next(error);
    }
  }

  // Get single patient
  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const patient = await prisma.patient.findUnique({
        where: { id: req.params.id },
        include: {
          user: { include: { profile: true } },
          appointments: {
            orderBy: { appointmentDate: 'desc' },
            take: 10,
            include: { doctor: { include: { user: { include: { profile: true } } } } },
          },
          medicalRecords: { orderBy: { createdAt: 'desc' }, take: 5 },
          prescriptions: { where: { isActive: true } },
          treatmentPlans: { where: { status: 'active' } },
          riskAlerts: { where: { isResolved: false }, orderBy: { createdAt: 'desc' } },
          progressTracking: { orderBy: { recordedAt: 'desc' }, take: 20 },
        },
      });

      if (!patient) throw new NotFoundError('Patient');

      sendSuccess(res, patient);
    } catch (error) {
      next(error);
    }
  }

  // Update patient profile
  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { allergies, chronicConditions, currentMedications, bloodType, insuranceProvider, insurancePolicyNumber, insuranceExpiryDate, preferredLanguage } = req.body;

      const patient = await prisma.patient.update({
        where: { id: req.params.id },
        data: {
          ...(allergies !== undefined && { allergies }),
          ...(chronicConditions !== undefined && { chronicConditions }),
          ...(currentMedications !== undefined && { currentMedications }),
          ...(bloodType !== undefined && { bloodType }),
          ...(insuranceProvider !== undefined && { insuranceProvider }),
          ...(insurancePolicyNumber !== undefined && { insurancePolicyNumber }),
          ...(insuranceExpiryDate !== undefined && { insuranceExpiryDate: new Date(insuranceExpiryDate) }),
          ...(preferredLanguage !== undefined && { preferredLanguage }),
        },
        include: { user: { include: { profile: true } } },
      });

      sendSuccess(res, patient, 'Patient profile updated');
    } catch (error) {
      next(error);
    }
  }

  // Create medical record
  static async createMedicalRecord(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const doctor = await prisma.doctor.findFirst({ where: { userId: req.user!.userId } });
      if (!doctor) throw new NotFoundError('Doctor profile');

      const record = await prisma.medicalRecord.create({
        data: {
          ...req.body,
          patientId: req.params.id,
          doctorId: doctor.id,
        },
      });

      sendSuccess(res, record, 'Medical record created', 201);
    } catch (error) {
      next(error);
    }
  }

  // Create session note
  static async createSessionNote(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const doctor = await prisma.doctor.findFirst({ where: { userId: req.user!.userId } });
      if (!doctor) throw new NotFoundError('Doctor profile');

      // Generate AI summary
      let aiSummary: string | undefined;
      try {
        aiSummary = await aiService.generateSessionSummary(req.body);
      } catch {
        // Continue without AI summary
      }

      const note = await prisma.sessionNote.create({
        data: {
          ...req.body,
          patientId: req.params.id,
          doctorId: doctor.id,
          aiSummary,
        },
      });

      sendSuccess(res, note, 'Session note created', 201);
    } catch (error) {
      next(error);
    }
  }

  // Create prescription
  static async createPrescription(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const doctor = await prisma.doctor.findFirst({ where: { userId: req.user!.userId } });
      if (!doctor) throw new NotFoundError('Doctor profile');

      const prescription = await prisma.prescription.create({
        data: {
          ...req.body,
          patientId: req.params.id,
          doctorId: doctor.id,
          startDate: new Date(req.body.startDate),
          endDate: req.body.endDate ? new Date(req.body.endDate) : null,
        },
      });

      sendSuccess(res, prescription, 'Prescription created', 201);
    } catch (error) {
      next(error);
    }
  }

  // Risk assessment
  static async assessRisk(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { text, context } = req.body;
      const result = await aiService.assessRisk(req.params.id, text, context);
      sendSuccess(res, result, 'Risk assessment completed');
    } catch (error) {
      next(error);
    }
  }

  // Get progress data
  static async getProgress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const progress = await prisma.progressTracking.findMany({
        where: { patientId: req.params.id },
        orderBy: { recordedAt: 'desc' },
      });

      // Get AI analysis
      let analysis: string | undefined;
      try {
        analysis = await aiService.analyzeProgress(req.params.id);
      } catch {
        // Continue without analysis
      }

      sendSuccess(res, { progress, analysis });
    } catch (error) {
      next(error);
    }
  }

  // Add progress entry
  static async addProgress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const entry = await prisma.progressTracking.create({
        data: {
          patientId: req.params.id,
          metricName: req.body.metricName,
          metricValue: req.body.metricValue,
          notes: req.body.notes,
        },
      });
      sendSuccess(res, entry, 'Progress recorded', 201);
    } catch (error) {
      next(error);
    }
  }

  // Get risk alerts
  static async getRiskAlerts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const alerts = await prisma.riskAlert.findMany({
        where: { isResolved: false },
        orderBy: { createdAt: 'desc' },
        include: { patient: { include: { user: { include: { profile: true } } } } },
      });

      sendSuccess(res, alerts);
    } catch (error) {
      next(error);
    }
  }

  // Resolve risk alert
  static async resolveAlert(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const alert = await prisma.riskAlert.update({
        where: { id: req.params.alertId },
        data: {
          isResolved: true,
          resolvedBy: req.user!.userId,
          resolvedAt: new Date(),
          resolution: req.body.resolution,
        },
      });

      sendSuccess(res, alert, 'Alert resolved');
    } catch (error) {
      next(error);
    }
  }
}
