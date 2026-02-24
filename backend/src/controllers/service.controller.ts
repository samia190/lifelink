// ===========================================
// LIFELINK - Services Controller (Public)
// ===========================================

import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import { sendSuccess, sendPaginated } from '../utils/response';
import { NotFoundError } from '../utils/errors';

export class ServiceController {
  // List active services (public)
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { category } = req.query as any;
      const where: any = { isActive: true };
      if (category) where.category = category;

      const services = await prisma.service.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
      });

      sendSuccess(res, services);
    } catch (error) {
      next(error);
    }
  }

  // Get service by slug (public)
  static async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const service = await prisma.service.findUnique({
        where: { slug: req.params.slug },
      });

      if (!service) throw new NotFoundError('Service');

      sendSuccess(res, service);
    } catch (error) {
      next(error);
    }
  }

  // Create service (admin)
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const slug = req.body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const service = await prisma.service.create({
        data: { ...req.body, slug },
      });

      sendSuccess(res, service, 'Service created', 201);
    } catch (error) {
      next(error);
    }
  }

  // Update service (admin)
  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const service = await prisma.service.update({
        where: { id: req.params.id },
        data: req.body,
      });

      sendSuccess(res, service, 'Service updated');
    } catch (error) {
      next(error);
    }
  }

  // Get doctors list (public)
  static async getDoctors(req: Request, res: Response, next: NextFunction) {
    try {
      const { specialization } = req.query as any;
      const where: any = { isAvailable: true };
      if (specialization) where.specialization = { has: specialization };

      const doctors = await prisma.doctor.findMany({
        where,
        include: {
          user: {
            include: { profile: true },
            select: { id: true, email: true, profile: true } as any,
          },
        },
      });

      sendSuccess(res, doctors);
    } catch (error) {
      next(error);
    }
  }
}
