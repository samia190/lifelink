// ===========================================
// LIFELINK - Webinar Controller
// ===========================================

import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import { sendSuccess, sendPaginated } from '../utils/response';
import { NotFoundError, AppError } from '../utils/errors';

export class WebinarController {
  // Create webinar
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const webinar = await prisma.webinar.create({
        data: {
          ...req.body,
          scheduledAt: req.body.scheduledAt ? new Date(req.body.scheduledAt) : null,
        },
      });

      sendSuccess(res, webinar, 'Webinar created', 201);
    } catch (error) {
      next(error);
    }
  }

  // List webinars
  static async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, status, category } = req.query as any;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (status) where.status = status;
      if (category) where.category = category;

      const [webinars, total] = await Promise.all([
        prisma.webinar.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { scheduledAt: 'desc' },
          include: { _count: { select: { registrations: true } } },
        }),
        prisma.webinar.count({ where }),
      ]);

      sendPaginated(res, webinars, total, Number(page), Number(limit));
    } catch (error) {
      next(error);
    }
  }

  // Get webinar details
  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const webinar = await prisma.webinar.findUnique({
        where: { id: req.params.id },
        include: {
          registrations: true,
          comments: { where: { isApproved: true }, orderBy: { createdAt: 'desc' } },
          _count: { select: { registrations: true, comments: true } },
        },
      });

      if (!webinar) throw new NotFoundError('Webinar');

      sendSuccess(res, webinar);
    } catch (error) {
      next(error);
    }
  }

  // Update webinar
  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const webinar = await prisma.webinar.update({
        where: { id: req.params.id },
        data: req.body,
      });

      sendSuccess(res, webinar, 'Webinar updated');
    } catch (error) {
      next(error);
    }
  }

  // Register for webinar
  static async register(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { email, name, phone } = req.body;

      const webinar = await prisma.webinar.findUnique({ where: { id } });
      if (!webinar) throw new NotFoundError('Webinar');

      if (webinar.maxAttendees) {
        const count = await prisma.webinarRegistration.count({ where: { webinarId: id } });
        if (count >= webinar.maxAttendees) {
          throw new AppError('Webinar is full', 400);
        }
      }

      const registration = await prisma.webinarRegistration.create({
        data: {
          webinarId: id,
          email,
          name,
          phone,
          isPaid: !webinar.isPaid,
        },
      });

      sendSuccess(res, registration, 'Registration successful', 201);
    } catch (error) {
      next(error);
    }
  }

  // Start webinar (go live)
  static async startLive(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const webinar = await prisma.webinar.update({
        where: { id: req.params.id },
        data: { status: 'LIVE', startedAt: new Date() },
      });

      sendSuccess(res, webinar, 'Webinar is now live');
    } catch (error) {
      next(error);
    }
  }

  // End webinar
  static async endLive(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const webinar = await prisma.webinar.findUnique({ where: { id: req.params.id } });
      if (!webinar) throw new NotFoundError('Webinar');

      const duration = webinar.startedAt
        ? Math.round((Date.now() - webinar.startedAt.getTime()) / 60000)
        : 0;

      const updated = await prisma.webinar.update({
        where: { id: req.params.id },
        data: { status: 'COMPLETED', endedAt: new Date(), duration },
      });

      sendSuccess(res, updated, 'Webinar ended');
    } catch (error) {
      next(error);
    }
  }

  // Post comment/question
  static async addComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const comment = await prisma.webinarComment.create({
        data: {
          webinarId: req.params.id,
          authorName: req.body.authorName,
          content: req.body.content,
          isQuestion: req.body.isQuestion || false,
        },
      });

      sendSuccess(res, comment, 'Comment posted', 201);
    } catch (error) {
      next(error);
    }
  }

  // Moderate comment
  static async moderateComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const comment = await prisma.webinarComment.update({
        where: { id: req.params.commentId },
        data: { isApproved: req.body.approved },
      });

      sendSuccess(res, comment, 'Comment moderated');
    } catch (error) {
      next(error);
    }
  }

  // Answer question
  static async answerQuestion(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const comment = await prisma.webinarComment.update({
        where: { id: req.params.commentId },
        data: { answer: req.body.answer, isAnswered: true },
      });

      sendSuccess(res, comment, 'Question answered');
    } catch (error) {
      next(error);
    }
  }

  // Generate certificate
  static async generateCertificate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const registration = await prisma.webinarRegistration.findUnique({
        where: { id: req.params.registrationId },
        include: { webinar: true },
      });

      if (!registration) throw new NotFoundError('Registration');
      if (!registration.attended) throw new AppError('Attendee must have attended the webinar', 400);

      // Certificate URL would be generated here (PDF generation service)
      const certificateUrl = `${process.env.APP_URL}/certificates/${registration.id}.pdf`;

      await prisma.webinarRegistration.update({
        where: { id: req.params.registrationId },
        data: { certificateUrl },
      });

      sendSuccess(res, { certificateUrl }, 'Certificate generated');
    } catch (error) {
      next(error);
    }
  }
}
