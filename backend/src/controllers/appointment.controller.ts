// ===========================================
// LIFELINK - Appointment Controller
// ===========================================

import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import { sendSuccess, sendPaginated } from '../utils/response';
import { NotFoundError, AppError } from '../utils/errors';
import { EmailService } from '../services/email.service';
import { SMSService } from '../services/sms.service';
import { TelehealthService } from '../services/telehealth.service';

const emailService = new EmailService();
const smsService = new SMSService();
const telehealthService = new TelehealthService();

export class AppointmentController {
  // Create appointment
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { doctorId, appointmentDate, startTime, endTime, type, reason, isEmergency } = req.body;

      // Get patient
      const patient = await prisma.patient.findFirst({
        where: { userId: req.user!.userId },
        include: { user: { include: { profile: true } } },
      });
      if (!patient) throw new NotFoundError('Patient profile');

      // Verify doctor exists and is available
      const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId },
        include: { user: { include: { profile: true } } },
      });
      if (!doctor || !doctor.isAvailable) throw new AppError('Doctor not available', 400);

      // Check for scheduling conflicts
      const existingAppointment = await prisma.appointment.findFirst({
        where: {
          doctorId,
          appointmentDate: new Date(appointmentDate),
          status: { in: ['PENDING', 'CONFIRMED'] },
          OR: [
            {
              startTime: { lte: new Date(startTime) },
              endTime: { gt: new Date(startTime) },
            },
            {
              startTime: { lt: new Date(endTime) },
              endTime: { gte: new Date(endTime) },
            },
          ],
        },
      });

      if (existingAppointment) {
        throw new AppError('Time slot is not available', 409);
      }

      // Determine fee
      const fee = type === 'TELEHEALTH' ? doctor.teleHealthFee : doctor.consultationFee;

      // Create appointment
      const appointment = await prisma.appointment.create({
        data: {
          patientId: patient.id,
          doctorId,
          appointmentDate: new Date(appointmentDate),
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          type,
          reason,
          isEmergency: isEmergency || false,
          fee,
          status: isEmergency ? 'CONFIRMED' : 'PENDING',
        },
        include: {
          doctor: { include: { user: { include: { profile: true } } } },
          patient: { include: { user: { include: { profile: true } } } },
        },
      });

      // Create telehealth room if needed
      if (type === 'TELEHEALTH') {
        await telehealthService.createRoom(appointment.id);
      }

      // Send confirmation email
      try {
        await emailService.sendAppointmentConfirmation(patient.user.email, {
          patientName: patient.user.profile?.firstName || 'Patient',
          doctorName: `${doctor.user.profile?.firstName} ${doctor.user.profile?.lastName}`,
          date: new Date(appointmentDate).toLocaleDateString(),
          time: new Date(startTime).toLocaleTimeString(),
          type,
        });

        // Send SMS if phone exists
        if (patient.user.phone) {
          await smsService.sendAppointmentConfirmation(patient.user.phone, {
            patientName: patient.user.profile?.firstName || 'Patient',
            date: new Date(appointmentDate).toLocaleDateString(),
            time: new Date(startTime).toLocaleTimeString(),
          });
        }
      } catch (err) {
        // Don't fail the appointment creation if notifications fail
      }

      // Log analytics event
      await prisma.analyticsEvent.create({
        data: {
          eventType: 'APPOINTMENT_CREATED',
          userId: req.user!.userId,
          data: { appointmentId: appointment.id, type, isEmergency },
        },
      });

      sendSuccess(res, appointment, 'Appointment created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  // Get appointments list
  static async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, status, type, startDate, endDate } = req.query as any;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};

      // Role-based filtering
      if (req.user!.role === 'PATIENT') {
        const patient = await prisma.patient.findFirst({ where: { userId: req.user!.userId } });
        if (patient) where.patientId = patient.id;
      } else if (['DOCTOR', 'PSYCHIATRIST', 'THERAPIST'].includes(req.user!.role)) {
        const doctor = await prisma.doctor.findFirst({ where: { userId: req.user!.userId } });
        if (doctor) where.doctorId = doctor.id;
      }

      if (status) where.status = status;
      if (type) where.type = type;
      if (startDate || endDate) {
        where.appointmentDate = {};
        if (startDate) where.appointmentDate.gte = new Date(startDate);
        if (endDate) where.appointmentDate.lte = new Date(endDate);
      }

      const [appointments, total] = await Promise.all([
        prisma.appointment.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { appointmentDate: 'desc' },
          include: {
            patient: { include: { user: { include: { profile: true } } } },
            doctor: { include: { user: { include: { profile: true } } } },
            telehealthSession: true,
          },
        }),
        prisma.appointment.count({ where }),
      ]);

      sendPaginated(res, appointments, total, Number(page), Number(limit));
    } catch (error) {
      next(error);
    }
  }

  // Get single appointment
  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: req.params.id },
        include: {
          patient: { include: { user: { include: { profile: true } } } },
          doctor: { include: { user: { include: { profile: true } } } },
          payment: true,
          telehealthSession: true,
          sessionNote: true,
        },
      });

      if (!appointment) throw new NotFoundError('Appointment');

      sendSuccess(res, appointment);
    } catch (error) {
      next(error);
    }
  }

  // Confirm appointment
  static async confirm(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const appointment = await prisma.appointment.update({
        where: { id: req.params.id },
        data: { status: 'CONFIRMED', confirmedAt: new Date() },
        include: {
          patient: { include: { user: { include: { profile: true } } } },
          doctor: { include: { user: { include: { profile: true } } } },
        },
      });

      sendSuccess(res, appointment, 'Appointment confirmed');
    } catch (error) {
      next(error);
    }
  }

  // Cancel appointment
  static async cancel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { reason } = req.body;

      const appointment = await prisma.appointment.findUnique({ where: { id: req.params.id } });
      if (!appointment) throw new NotFoundError('Appointment');

      // Check cancellation policy (24 hours minimum)
      const appointmentTime = new Date(appointment.startTime).getTime();
      const now = Date.now();
      const hoursUntilAppointment = (appointmentTime - now) / (1000 * 60 * 60);

      if (hoursUntilAppointment < 24 && req.user!.role === 'PATIENT') {
        throw new AppError('Appointments must be cancelled at least 24 hours in advance', 400);
      }

      const updated = await prisma.appointment.update({
        where: { id: req.params.id },
        data: {
          status: 'CANCELLED',
          cancellationReason: reason,
          cancelledAt: new Date(),
        },
      });

      sendSuccess(res, updated, 'Appointment cancelled');
    } catch (error) {
      next(error);
    }
  }

  // Reschedule appointment
  static async reschedule(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { appointmentDate, startTime, endTime } = req.body;

      const oldAppointment = await prisma.appointment.findUnique({ where: { id: req.params.id } });
      if (!oldAppointment) throw new NotFoundError('Appointment');

      const updated = await prisma.appointment.update({
        where: { id: req.params.id },
        data: {
          appointmentDate: new Date(appointmentDate),
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          status: 'RESCHEDULED',
          rescheduledFrom: oldAppointment.id,
        },
      });

      sendSuccess(res, updated, 'Appointment rescheduled');
    } catch (error) {
      next(error);
    }
  }

  // Get available slots for a doctor
  static async getAvailableSlots(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { doctorId, date } = req.query as any;

      const slots = await prisma.availabilitySlot.findMany({
        where: {
          doctorId,
          isActive: true,
          dayOfWeek: new Date(date).getDay(),
        },
      });

      // Get booked appointments for the date
      const booked = await prisma.appointment.findMany({
        where: {
          doctorId,
          appointmentDate: new Date(date),
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
        select: { startTime: true, endTime: true },
      });

      sendSuccess(res, { slots, booked }, 'Available slots retrieved');
    } catch (error) {
      next(error);
    }
  }
}
