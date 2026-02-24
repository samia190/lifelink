// ===========================================
// LIFELINK - Payment Controller
// ===========================================

import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import { sendSuccess, sendPaginated } from '../utils/response';
import { NotFoundError } from '../utils/errors';
import { MpesaService } from '../services/mpesa.service';
import { EmailService } from '../services/email.service';
import { generateInvoiceNumber } from '../utils/encryption';

const mpesaService = new MpesaService();
const emailService = new EmailService();

export class PaymentController {
  // Initiate M-Pesa STK push
  static async initiateMpesa(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { phoneNumber, amount, appointmentId, description } = req.body;

      const result = await mpesaService.initiateSTKPush({
        phoneNumber,
        amount,
        appointmentId,
        description,
      });

      sendSuccess(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  // M-Pesa callback
  static async mpesaCallback(req: Request, res: Response, next: NextFunction) {
    try {
      await mpesaService.processCallback(req.body);
      res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
    } catch (error) {
      next(error);
    }
  }

  // Check payment status
  static async checkStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: req.params.id },
      });

      if (!payment) throw new NotFoundError('Payment');

      sendSuccess(res, payment);
    } catch (error) {
      next(error);
    }
  }

  // List payments
  static async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, status, method, startDate, endDate } = req.query as any;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (status) where.status = status;
      if (method) where.method = method;
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: { appointment: true },
        }),
        prisma.payment.count({ where }),
      ]);

      sendPaginated(res, payments, total, Number(page), Number(limit));
    } catch (error) {
      next(error);
    }
  }

  // Generate invoice
  static async createInvoice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { patientId, corporateId, items, tax, discount, dueDate, notes } = req.body;

      const subtotal = items.reduce((sum: number, item: any) => sum + item.amount * item.quantity, 0);
      const total = subtotal + (tax || 0) - (discount || 0);

      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber: generateInvoiceNumber(),
          patientId,
          corporateId,
          items,
          subtotal,
          tax: tax || 0,
          discount: discount || 0,
          total,
          dueDate: new Date(dueDate),
          notes,
          status: 'SENT',
        },
      });

      // Record revenue
      await prisma.revenueRecord.create({
        data: {
          date: new Date(),
          amount: total,
          category: corporateId ? 'corporate' : 'individual',
          source: 'invoice',
          metadata: { invoiceId: invoice.id },
        },
      });

      sendSuccess(res, invoice, 'Invoice created', 201);
    } catch (error) {
      next(error);
    }
  }

  // Get invoices
  static async getInvoices(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, status } = req.query as any;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (status) where.status = status;

      // Patient can only see their own
      if (req.user!.role === 'PATIENT') {
        const patient = await prisma.patient.findFirst({ where: { userId: req.user!.userId } });
        if (patient) where.patientId = patient.id;
      }

      const [invoices, total] = await Promise.all([
        prisma.invoice.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: { patient: true, corporate: true },
        }),
        prisma.invoice.count({ where }),
      ]);

      sendPaginated(res, invoices, total, Number(page), Number(limit));
    } catch (error) {
      next(error);
    }
  }
}
